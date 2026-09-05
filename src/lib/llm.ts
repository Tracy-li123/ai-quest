// ---------------------------------------------------------------------------
// AI Quest — 大模型接入层（DeepSeek）
// 只在服务端使用：任何引用本文件的模块都不能被客户端组件 import。
// 未配置 DEEPSEEK_API_KEY 时，所有调用返回 null，页面自动降级为本地关键词评分。
// ---------------------------------------------------------------------------

export const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/** 服务端是否配置了可用的模型密钥 */
export function llmEnabled(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

// ---- 限流 ----------------------------------------------------------------
// 进程内限流仅用于单实例的尽力保护；Vercel 多实例需搭配平台规则或共享存储。

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1000; // 1 小时
const MAX_BUCKETS = 5000;

function limit(): number {
  const n = Number(process.env.LLM_RATE_LIMIT ?? 30);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export function rateLimited(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    // 顺手清掉过期桶，避免 Map 无限增长
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
      if (buckets.size > MAX_BUCKETS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > limit();
}

/** 取客户端 IP（用于限流，不落库） */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "local"
  );
}

// ---- 调用 ----------------------------------------------------------------

export interface ChatOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
}

/**
 * 调用 DeepSeek。失败、超时、未配置密钥时统一返回 null，由上层降级。
 */
export async function chat(opts: ChatOptions): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 1200,
        stream: false,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      console.error("[llm] upstream error", res.status);
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[llm] request failed", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 从模型输出里安全取出 JSON 对象（模型偶尔会包一层 ```json） */
export function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

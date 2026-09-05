// ---------------------------------------------------------------------------
// 带重试的 fetch（客户端可用）
// 部署沙箱偶尔会重启，网关在进程拉起期间返回 502/503/504。
// 这类失败是瞬时的，重试一次即可恢复，不必让用户看到报错。
// ---------------------------------------------------------------------------

const RETRY_STATUS = new Set([502, 503, 504]);
const RETRY_DELAY_MS = 1200;

export interface RetryResult<T> {
  data: T | null;
  /** 最后一次的 HTTP 状态码，拿不到响应时为 0 */
  status: number;
  /** 网络层异常（非 HTTP 错误） */
  networkError: boolean;
}

export async function postJsonWithRetry<T>(
  url: string,
  body: unknown,
  { retries = 0, timeoutMs = 55_000 }: { retries?: number; timeoutMs?: number } = {},
): Promise<RetryResult<T>> {
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      lastStatus = res.status;

      // 网关层错误（HTML/JSON 都不是我们的响应格式）→ 等一下重试
      if (RETRY_STATUS.has(res.status) && attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      const data = (await res.json().catch(() => null)) as T | null;
      return { data, status: res.status, networkError: false };
    } catch {
      // abort（超时）或网络异常
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { data: null, status: lastStatus, networkError: true };
    } finally {
      clearTimeout(timer);
    }
  }

  return { data: null, status: lastStatus, networkError: false };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

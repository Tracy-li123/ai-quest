import { NextResponse } from "next/server";
import { chat, clientIp, llmEnabled, rateLimited } from "../../../lib/llm";
import { ASK_SYSTEM, buildAskUser, LIMITS, type AskInput } from "../../../lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const value: unknown = await req.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid body");
    body = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const str = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : "");

  const input: AskInput = {
    nodeName: str(body.nodeName, LIMITS.nodeName),
    lecture: str(body.lecture, LIMITS.lecture),
    question: str(body.question, LIMITS.askQuestion),
    history: Array.isArray(body.history)
      ? (body.history as unknown[])
          .filter(
            (h): h is HistoryItem =>
              !!h &&
              typeof h === "object" &&
              ((h as HistoryItem).role === "user" || (h as HistoryItem).role === "assistant") &&
              typeof (h as HistoryItem).content === "string",
          )
          .slice(-6)
      : [],
  };

  if (!input.question.trim()) {
    return NextResponse.json({ error: "问题为空" }, { status: 400 });
  }

  if (!llmEnabled()) {
    return NextResponse.json(
      { error: "服务端未配置模型密钥，问答功能不可用" },
      { status: 503 },
    );
  }

  if (rateLimited(`ask:${clientIp(req.headers)}`)) {
    return NextResponse.json(
      { error: "你的提问次数已达上限，请稍后再试" },
      { status: 429 },
    );
  }

  const answer = await chat({
    system: ASK_SYSTEM,
    user: buildAskUser(input),
    maxTokens: 700,
    temperature: 0.5,
  });

  if (!answer) {
    return NextResponse.json({ error: "模型暂时无法回答，请重试" }, { status: 502 });
  }

  return NextResponse.json({ mode: "ai", answer });
}

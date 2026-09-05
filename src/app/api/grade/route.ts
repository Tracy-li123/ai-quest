import { NextResponse } from "next/server";
import { chat, clientIp, llmEnabled, parseJson, rateLimited } from "../../../lib/llm";
import {
  buildGradeUser,
  GRADE_SYSTEM,
  LIMITS,
  type GradeInput,
} from "../../../lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface GradePayload {
  score: number; // 0-100
  pass: boolean;
  feedback: string;
  covered: string[];
  missing: string[];
  reference: string;
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

  const input: GradeInput = {
    nodeName: str(body.nodeName, LIMITS.nodeName),
    lecture: str(body.lecture, LIMITS.lecture),
    question: str(body.question, LIMITS.question),
    hint: str(body.hint, LIMITS.hint),
    answer: str(body.answer, LIMITS.answer),
    rubric: Array.isArray(body.rubric)
      ? (body.rubric as unknown[]).filter((x): x is string => typeof x === "string").slice(0, 40).map((s) => s.slice(0, 80))
      : [],
    passRate: typeof body.passRate === "number" && Number.isFinite(body.passRate) ? Math.max(0, Math.min(1, body.passRate)) : 0.6,
  };

  if (!input.answer.trim()) {
    return NextResponse.json({ error: "作答为空" }, { status: 400 });
  }

  // 未配置密钥 → 告知前端降级为本地关键词评分
  if (!llmEnabled()) {
    return NextResponse.json({ mode: "keyword" }, { status: 200 });
  }

  if (rateLimited(`grade:${clientIp(req.headers)}`)) {
    return NextResponse.json(
      { error: "你的提问次数已达上限，请稍后再试" },
      { status: 429 },
    );
  }

  const raw = await chat({
    system: GRADE_SYSTEM,
    user: buildGradeUser(input),
    json: true,
    temperature: 0.3,
  });
  const data = parseJson<Partial<GradePayload>>(raw);

  if (!data || typeof data.score !== "number" || !Number.isFinite(data.score)) {
    return NextResponse.json({ error: "模型暂时无法评分，请重试" }, { status: 502 });
  }

  const score = Math.max(0, Math.min(100, Math.round(data.score)));
  const result: GradePayload = {
    score,
    pass:
      score >= Math.round(input.passRate * 100),
    feedback: str(data.feedback, 800) || "已收到你的作答，但模型未给出点评，请重试。",
    covered: Array.isArray(data.covered) ? data.covered.map((s) => str(s, 60)).slice(0, 20) : [],
    missing: Array.isArray(data.missing) ? data.missing.map((s) => str(s, 60)).slice(0, 20) : [],
    reference: str(data.reference, 1500),
  };

  return NextResponse.json({ mode: "ai", ...result });
}

"use client";

import { useMemo, useState } from "react";
import type { FinalQuestion } from "../lib/types";
import { postJsonWithRetry } from "../lib/retryFetch";
import AskTutor from "./AskTutor";

interface BossChallengeProps {
  isBoss: boolean;
  final: FinalQuestion;
  onPassed: (score: number) => void;
  alreadyCompleted: boolean;
  /** 关卡名 + 讲义要点，作为模型评估与追问的上下文 */
  nodeName: string;
  lecture: string;
}

interface AiResult {
  kind: "ai";
  score: number; // 0-100
  pass: boolean;
  feedback: string;
  covered: string[];
  missing: string[];
  reference: string;
}

interface KeywordResult {
  kind: "keyword";
  matched: string[];
  missed: string[];
  score: number; // 命中比例 0-1
  pass: boolean;
}

type Result = AiResult | KeywordResult;

export default function BossChallenge({
  isBoss,
  final,
  onPassed,
  alreadyCompleted,
  nodeName,
  lecture,
}: BossChallengeProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(true);
  // null = 还没探测过；true/false = 已知服务端是否配置了模型
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  const rate = final.passRate ?? 0.6;
  const keywords = useMemo(() => final.keywords, [final]);

  /** 本地关键词兜底：服务端没有模型能力时使用 */
  const gradeByKeyword = (): KeywordResult => {
    const lower = answer.trim().toLowerCase();
    const matched = keywords.filter((k) => lower.includes(k.toLowerCase()));
    const missed = keywords.filter((k) => !lower.includes(k.toLowerCase()));
    const score = keywords.length ? matched.length / keywords.length : 0;
    return { kind: "keyword", matched, missed, score, pass: score >= rate };
  };

  const submit = async () => {
    if (!answer.trim() || grading) return;
    setGrading(true);
    setError(null);

    const { data, networkError } = await postJsonWithRetry<{
      mode?: "ai" | "keyword";
      score?: number;
      pass?: boolean;
      feedback?: string;
      covered?: string[];
      missing?: string[];
      reference?: string;
      error?: string;
    }>("/api/grade", {
      nodeName,
      lecture,
      question: final.question,
      hint: final.hint,
      rubric: final.keywords,
      passRate: rate,
      answer: answer.trim(),
    });

    try {
      if (!data) {
        throw new Error(networkError ? "网络连接失败" : "服务暂时不可用");
      }

      // 服务端未配置密钥 → 静默降级为关键词评分
      if (data.mode === "keyword") {
        setAiEnabled(false);
        setResult(gradeByKeyword());
        return;
      }
      if (data.mode !== "ai" || typeof data.score !== "number") {
        throw new Error(data.error || "评估失败");
      }

      setAiEnabled(true);
      setShowReference(true);
      setResult({
        kind: "ai",
        score: data.score,
        pass: data.pass ?? data.score >= Math.round(rate * 100),
        feedback: data.feedback ?? "",
        covered: data.covered ?? [],
        missing: data.missing ?? [],
        reference: data.reference ?? "",
      });
    } catch (e) {
      // 网络 / 模型异常 → 不阻塞学习流程，退回关键词评分
      const msg = e instanceof Error ? e.message : "评估失败";
      setError(`AI 评估不可用（${msg}），已改用关键词评分。`);
      setAiEnabled(false);
      setResult(gradeByKeyword());
    } finally {
      setGrading(false);
    }
  };

  const retry = () => {
    setResult(null);
    setError(null);
  };

  const pct = result ? Math.round(result.score * (result.kind === "ai" ? 1 : 100)) : 0;

  return (
    <div>
      {/* 头部 */}
      <div
        className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
          isBoss ? "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50" : "border-indigo-100 bg-indigo-50/50"
        }`}
      >
        <span className="text-2xl">{isBoss ? "👑" : "🎯"}</span>
        <div>
          <div className="text-sm font-black text-slate-900">
            {isBoss ? "Boss 试炼：用自己的话解释核心概念" : "最终关：用自己的话复述核心概念"}
          </div>
          <div className="text-[12px] text-slate-500">
            {aiEnabled === false
              ? "关键词模式 · 根据作答覆盖的关键概念评估"
              : "AI 试炼官评估你的理解，指出遗漏并给出标准答案"}
          </div>
        </div>
      </div>

      <h4 className="text-[15px] font-bold leading-relaxed text-slate-900">{final.question}</h4>

      <textarea
        maxLength={2000}
        aria-label="你的作答"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={grading || !!result}
        rows={6}
        placeholder="用你自己的话写下来，不要复制讲义原文……"
        className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13.5px] leading-relaxed text-slate-800 shadow-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
      />

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
        <span className="font-semibold">参考提示：</span>
        {final.hint}
      </div>

      {error && <div className="mt-3 text-[12px] font-medium text-amber-600">{error}</div>}

      {/* 提交 */}
      {!result && (
        <button
          onClick={submit}
          disabled={!answer.trim() || grading}
          className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {grading ? "AI 试炼官正在评阅…" : "提交，接受评估"}
        </button>
      )}

      {/* 结果 */}
      {result && (
        <div className="mt-5 space-y-4">
          {result.kind === "ai" ? (
            <AiFeedback result={result} />
          ) : (
            <KeywordFeedback result={result} total={keywords.length} />
          )}

          {/* 标准答案 */}
          {result.kind === "ai" && result.reference && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button
                onClick={() => setShowReference((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-slate-800">📘 标准答案</span>
                  <span className="text-[11px] text-slate-400">看看完整的讲法应该是什么样</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400">{showReference ? "收起" : "展开"}</span>
              </button>
              {showReference && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 text-[13px] leading-relaxed text-slate-700">
                  {result.reference}
                </div>
              )}
            </div>
          )}

          {/* 追问导师 */}
          <AskTutor nodeName={nodeName} lecture={lecture} available={aiEnabled !== false} />

          {/* 操作 */}
          {result.pass ? (
            <button
              onClick={() => onPassed(pct)}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-black text-white shadow-md shadow-emerald-200 transition hover:brightness-105"
            >
              {alreadyCompleted ? "已通关 · 保存复习结果" : "✓ 完成关卡，领取经验值 →"}
            </button>
          ) : (
            <button
              onClick={retry}
              className="w-full rounded-xl border border-amber-300 bg-white px-6 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
            >
              参考上面的反馈，重新回答
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---- AI 评分卡 ------------------------------------------------------------

function AiFeedback({ result }: { result: AiResult }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        result.pass ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-4xl font-black tracking-tight text-slate-900">
            {result.pass ? "通关！" : "还差一点"}{" "}
            <span className="text-[22px]">({result.score}分)</span>
          </div>
          <div className="mt-1 text-[12px] font-medium text-slate-500">AI 试炼官评分</div>
        </div>
        <div className="h-14 w-14 shrink-0">
          <ScoreRing score={result.score} />
        </div>
      </div>

      {result.feedback && (
        <div className="mt-4 rounded-xl bg-white/80 p-4 text-[13px] leading-relaxed text-slate-700">
          <div className="mb-1 text-[10.5px] font-black uppercase tracking-wider text-indigo-500">
            试炼官点评
          </div>
          {result.feedback}
        </div>
      )}

      {(result.covered.length > 0 || result.missing.length > 0) && (
        <div className="mt-3 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-xl bg-white/80 p-3">
            <div className="text-[11px] font-bold text-emerald-600">✓ 讲到了</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {result.covered.length === 0 && <span className="text-[11px] text-slate-400">无</span>}
              {result.covered.map((k) => (
                <span key={k} className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 p-3">
            <div className="text-[11px] font-bold text-slate-500">○ 还没讲到</div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {result.missing.length === 0 && <span className="text-[11px] text-slate-400">全部覆盖 🎉</span>}
              {result.missing.map((k) => (
                <span key={k} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  const color = score >= 60 ? "#10b981" : score >= 35 ? "#f59e0b" : "#f43f5e";
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform="rotate(-90 28 28)"
      />
      <text x="28" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f172a">
        {score}
      </text>
    </svg>
  );
}

// ---- 关键词兜底评分卡 ------------------------------------------------------

function KeywordFeedback({ result, total }: { result: KeywordResult; total: number }) {
  const pct = Math.round(result.score * 100);
  return (
    <div
      className={`rounded-2xl border p-5 text-center ${
        result.pass ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="text-4xl font-black tracking-tight text-slate-900">
        {result.pass ? "通关！" : "还差一点"} <span className="text-[22px]">({pct}%)</span>
      </div>
      <div className="mt-1 text-[13px] font-medium text-slate-600">
        命中 {result.matched.length}/{total} 个关键概念
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-left">
        <div className="rounded-xl bg-white/80 p-3">
          <div className="text-[11px] font-bold text-emerald-600">✓ 已覆盖</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {result.matched.length === 0 && <span className="text-[11px] text-slate-400">无</span>}
            {result.matched.map((k) => (
              <span key={k} className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/80 p-3">
          <div className="text-[11px] font-bold text-slate-500">○ 未覆盖</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {result.missed.length === 0 && <span className="text-[11px] text-slate-400">全部覆盖 🎉</span>}
            {result.missed.map((k) => (
              <span key={k} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

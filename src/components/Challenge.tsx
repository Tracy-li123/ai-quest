"use client";

import { useMemo, useState } from "react";
import type { Challenge } from "../lib/types";

interface ChallengeProps {
  challenges: Challenge[];
  onAllPassed: () => void;
}

type AnswerState =
  | { status: "idle" }
  | { status: "correct" }
  | { status: "wrong"; correct?: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Challenge({ challenges, onAllPassed }: ChallengeProps) {
  const [current, setCurrent] = useState(0);
  const [passed, setPassed] = useState<boolean[]>(() => challenges.map(() => false));

  const challenge = challenges[current];
  const allPassed = passed.every(Boolean);

  const handlePassed = () => {
    const next = [...passed];
    next[current] = true;
    setPassed(next);
    if (current < challenges.length - 1) setCurrent(current + 1);
  };

  const goto = (idx: number) => {
    if (passed[idx]) setCurrent(idx);
  };

  return (
    <div>
      {/* 进度条：题目索引 */}
      <div className="mb-5 flex items-center gap-2">
        {challenges.map((c, i) => (
          <button
            key={c.id}
            onClick={() => goto(i)}
            disabled={!passed[i]}
            className={`h-2 flex-1 rounded-full transition ${
              passed[i] ? "bg-emerald-400" : i === current ? "bg-indigo-500" : "bg-slate-200"
            }`}
            aria-label={`题目 ${i + 1}`}
          />
        ))}
      </div>

      <div className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        第 {current + 1} / {challenges.length} 题 · {typeLabel(challenge.type)}
      </div>

      {challenge.type === "single" && (
        <SingleQ
          key={challenge.id}
          question={challenge.question}
          options={challenge.options}
          answer={challenge.answer}
          explanation={challenge.explanation}
          onPassed={handlePassed}
        />
      )}
      {challenge.type === "judge" && (
        <JudgeQ
          key={challenge.id}
          question={challenge.question}
          statement={challenge.statement}
          answer={challenge.answer}
          explanation={challenge.explanation}
          onPassed={handlePassed}
        />
      )}
      {challenge.type === "order" && (
        <OrderQ
          key={challenge.id}
          question={challenge.question}
          items={challenge.items}
          answer={challenge.answer}
          explanation={challenge.explanation}
          onPassed={handlePassed}
        />
      )}
      {challenge.type === "match" && (
        <MatchQ
          key={challenge.id}
          question={challenge.question}
          pairs={challenge.pairs}
          explanation={challenge.explanation}
          onPassed={handlePassed}
        />
      )}

      {/* 全部通过后进入下一阶段 */}
      {allPassed && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <div className="text-sm font-bold text-emerald-700">✓ 全部答对，挑战通过！</div>
          <button
            onClick={onAllPassed}
            className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:brightness-105"
          >
            进入最终试炼 →
          </button>
        </div>
      )}
    </div>
  );
}

function typeLabel(t: Challenge["type"]) {
  switch (t) {
    case "single":
      return "单选题";
    case "judge":
      return "判断题";
    case "order":
      return "排序题";
    case "match":
      return "概念匹配";
  }
}

function Feedback({ state, explanation }: { state: AnswerState; explanation?: string }) {
  if (state.status === "idle") return null;
  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-[13px] ${
        state.status === "correct"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      <div className="font-bold">
        {state.status === "correct" ? "✓ 回答正确" : "✗ 再想想"}
        {state.status === "wrong" && state.correct && (
          <span className="ml-2 font-medium text-slate-600">正确答案：{state.correct}</span>
        )}
      </div>
      {explanation && <div className="mt-1 leading-relaxed opacity-90">{explanation}</div>}
    </div>
  );
}

// ---- 单选 -----------------------------------------------------------------

function SingleQ({
  question,
  options,
  answer,
  explanation,
  onPassed,
}: {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
  onPassed: () => void;
}) {
  const [state, setState] = useState<AnswerState>({ status: "idle" });
  const submit = (idx: number) => {
    if (state.status !== "idle") return;
    if (idx === answer) {
      setState({ status: "correct" });
      onPassed();
    } else {
      setState({ status: "wrong", correct: options[answer] });
    }
  };
  return (
    <div>
      <h4 className="text-[15px] font-bold leading-relaxed text-slate-900">{question}</h4>
      <div className="mt-4 space-y-2.5">
        {options.map((opt, i) => {
          const isAnswer = state.status !== "idle" && i === answer;
          return (
            <button
              key={i}
              onClick={() => submit(i)}
              disabled={state.status !== "idle"}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[13.5px] font-medium transition ${
                state.status === "idle"
                  ? "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                  : isAnswer
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <Feedback state={state} explanation={explanation} />
      {state.status === "wrong" && (
        <button onClick={() => setState({ status: "idle" })} className="mt-3 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-600">重新作答</button>
      )}
    </div>
  );
}

// ---- 判断 -----------------------------------------------------------------

function JudgeQ({
  question,
  statement,
  answer,
  explanation,
  onPassed,
}: {
  question: string;
  statement: string;
  answer: boolean;
  explanation?: string;
  onPassed: () => void;
}) {
  const [state, setState] = useState<AnswerState>({ status: "idle" });
  void question;
  const submit = (val: boolean) => {
    if (state.status !== "idle") return;
    if (val === answer) {
      setState({ status: "correct" });
      onPassed();
    } else {
      setState({ status: "wrong", correct: answer ? "正确" : "错误" });
    }
  };
  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-[14.5px] font-medium leading-relaxed text-slate-800">
        “{statement}”
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => submit(true)}
          disabled={state.status !== "idle"}
          className={`rounded-xl border px-4 py-3.5 text-sm font-bold transition ${
            state.status === "idle"
              ? "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              : answer === true
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-400"
          }`}
        >
          ✓ 正确
        </button>
        <button
          onClick={() => submit(false)}
          disabled={state.status !== "idle"}
          className={`rounded-xl border px-4 py-3.5 text-sm font-bold transition ${
            state.status === "idle"
              ? "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50"
              : answer === false
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-400"
          }`}
        >
          ✗ 错误
        </button>
      </div>
      <Feedback state={state} explanation={explanation} />
      {state.status === "wrong" && (
        <button onClick={() => setState({ status: "idle" })} className="mt-3 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-600">重新作答</button>
      )}
    </div>
  );
}

// ---- 排序 -----------------------------------------------------------------

function OrderQ({
  question,
  items,
  answer,
  explanation,
  onPassed,
}: {
  question: string;
  items: string[];
  answer: string[];
  explanation?: string;
  onPassed: () => void;
}) {
  const [state, setState] = useState<AnswerState>({ status: "idle" });
  const [chosen, setChosen] = useState<string[]>([]);
  const pool = useMemo(() => shuffle(items), [items]);

  const pick = (item: string) => {
    if (state.status !== "idle") return;
    setChosen((c) => [...c, item]);
  };
  const unpick = (idx: number) => {
    if (state.status !== "idle") return;
    setChosen((c) => c.filter((_, i) => i !== idx));
  };
  const submit = () => {
    if (chosen.length !== answer.length || state.status !== "idle") return;
    const ok = chosen.every((c, i) => c === answer[i]);
    if (ok) {
      setState({ status: "correct" });
      onPassed();
    } else {
      setState({ status: "wrong" });
    }
  };

  return (
    <div>
      <h4 className="text-[15px] font-bold leading-relaxed text-slate-900">{question}</h4>

      {/* 已选序列 */}
      <div className="mt-4">
        <div className="mb-1.5 text-[11px] font-semibold text-slate-400">你的顺序（点击可移除）</div>
        <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-3">
          {chosen.length === 0 && <span className="text-[12px] text-slate-400">按正确顺序依次点击下方条目…</span>}
          {chosen.map((c, i) => (
            <button
              key={`${c}-${i}`}
              onClick={() => unpick(i)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-rose-500"
            >
              <span className="text-[10px] opacity-70">{i + 1}</span>
              {c}
              <span className="text-[10px] opacity-70">✕</span>
            </button>
          ))}
        </div>
      </div>

      {/* 备选池 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {pool
          .filter((p) => !chosen.includes(p))
          .map((p) => (
            <button
              key={p}
              onClick={() => pick(p)}
              disabled={state.status !== "idle"}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              {p}
            </button>
          ))}
      </div>

      <button
        onClick={submit}
        disabled={chosen.length !== answer.length || state.status !== "idle"}
        className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        提交排序
      </button>
      <Feedback state={state} explanation={explanation} />
      {state.status === "wrong" && (
        <button onClick={() => setState({ status: "idle" })} className="mt-3 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-bold text-indigo-600">重新作答</button>
      )}
    </div>
  );
}

// ---- 概念匹配 -------------------------------------------------------------

function MatchQ({
  question,
  pairs,
  explanation,
  onPassed,
}: {
  question: string;
  pairs: { left: string; right: string }[];
  explanation?: string;
  onPassed: () => void;
}) {
  const [state, setState] = useState<AnswerState>({ status: "idle" });
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]); // 已配对的 left 下标
  const rights = useMemo(
    () => shuffle(pairs.map((_, i) => i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pairs.length]
  );

  const clickLeft = (idx: number) => {
    if (state.status !== "idle" || matched.includes(idx)) return;
    setSelectedLeft(idx);
  };
  const clickRight = (rightIdx: number) => {
    if (state.status !== "idle" || selectedLeft === null) return;
    if (matched.includes(rightIdx)) return;
    const leftIdx = selectedLeft;
    const correct = pairs[leftIdx].right === pairs[rightIdx].right;
    if (correct) {
      setMatched((m) => [...m, leftIdx]);
      setSelectedLeft(null);
    } else {
      // 轻微抖动提示
      setState({ status: "wrong" });
      setTimeout(() => setState({ status: "idle" }), 600);
      setSelectedLeft(null);
    }
  };
  const submit = () => {
    if (matched.length !== pairs.length || state.status !== "idle") return;
    setState({ status: "correct" });
    onPassed();
  };

  return (
    <div>
      <h4 className="text-[15px] font-bold leading-relaxed text-slate-900">{question}</h4>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* 左列 */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">概念</div>
          {pairs.map((p, i) => (
            <button
              key={i}
              onClick={() => clickLeft(i)}
              disabled={matched.includes(i) || state.status !== "idle"}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-[12.5px] font-semibold transition ${
                matched.includes(i)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : selectedLeft === i
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              {matched.includes(i) ? "✓ " : ""}
              {p.left}
            </button>
          ))}
        </div>
        {/* 右列 */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">描述</div>
          {rights.map((rightIdx) => (
            <button
              key={rightIdx}
              onClick={() => clickRight(rightIdx)}
              disabled={matched.includes(rightIdx) || state.status !== "idle"}
              className={`w-full rounded-xl border px-3 py-2.5 text-left text-[12.5px] font-medium transition ${
                matched.includes(rightIdx)
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {pairs[rightIdx].right}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={matched.length !== pairs.length || state.status !== "idle"}
        className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        完成匹配（{matched.length}/{pairs.length}）
      </button>
      <Feedback state={state} explanation={explanation} />
    </div>
  );
}

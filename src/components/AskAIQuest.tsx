"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NODES, getNode } from "../lib/data";
import { findRoute, xpForNode } from "../lib/progression";
import { useProgress } from "../store/useProgress";
import type { KnowledgeNode } from "../lib/types";

const PRESETS = [
  "Harness 是什么？",
  "什么是 Token？",
  "RLHF 是什么？",
  "RAG 怎么防幻觉？",
  "什么是 Chain-of-Thought？",
  "流式输出是什么？",
];

interface AskResult {
  target: KnowledgeNode;
  mastered: string[];
  missing: string[];
  route: string[] | null;
  targetDone: boolean;
}

export default function AskAIQuest() {
  const router = useRouter();
  const { completed } = useProgress();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulate = (q: string) => {
    const text = q.trim().toLowerCase();
    setQuery(q);
    setOpen(true);
    setSearched(true);
    if (!text) {
      setResult(null);
      return;
    }
    // 用名称 / 摘要 / 别名做简单的概念匹配
    const target =
      NODES.find((n) => n.id.toLowerCase() === text) ??
      NODES.find((n) => n.name.toLowerCase() === text) ??
      NODES.find((n) => n.name.toLowerCase().includes(text) || text.includes(n.name.toLowerCase())) ??
      NODES.find((n) => n.summary.toLowerCase().includes(text) || text.includes(n.summary.slice(0, 12).toLowerCase()));

    if (!target) {
      setResult(null);
      return;
    }

    const relevant = [...new Set([...target.prerequisites, ...target.related])];
    const mastered = relevant.filter((id) => completed.includes(id));
    const missing = relevant.filter((id) => !completed.includes(id));
    const missingDefined = missing.filter((id) => !!getNode(id));
    const route = findRoute(target.id, missingDefined, completed);

    setResult({
      target,
      mastered,
      missing,
      route,
      targetDone: completed.includes(target.id),
    });
  };

  const relatedNodes = useMemo(() => {
    if (!result) return [];
    return [...result.mastered, ...result.missing].map((id) => getNode(id)).filter(Boolean) as KnowledgeNode[];
  }, [result]);

  const startLearning = () => {
    if (!result) return;
    const first = result.route?.[0] ?? result.target.id;
    setOpen(false);
    router.push(`/lesson/${first}`);
  };

  const locateInMap = () => {
    if (!result) return;
    setOpen(false);
    router.push(`/world/${result.target.world}?focus=${result.target.id}`);
  };

  return (
    <div className="relative w-full max-w-xl">
      {/* 输入框 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          simulate(query);
          inputRef.current?.blur();
        }}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-indigo-300 focus-within:shadow-md focus-within:shadow-indigo-100"
      >
        <span className="text-[15px]">🔮</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearched(false);
            setResult(null);
          }}
          onFocus={() => {
            setOpen(true);
            if (!query && !searched) setResult(null);
          }}
          placeholder="Ask AI Quest：例如「我今天听到 Harness，这是什么？」"
          className="flex-1 bg-transparent text-[13.5px] text-slate-800 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-105"
        >
          Ask
        </button>
      </form>

      {/* 快捷示例 */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => simulate(p)}
            className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 结果面板 */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
          {!searched || !query.trim() ? (
            <div className="px-4 py-5 text-center text-[12.5px] text-slate-400">
              输入你想了解的概念，AI Quest 会分析你的掌握情况并推荐学习路线。
              <div className="mt-1 text-[11px] opacity-70">（第一版为预设模拟，后续将接入真实 LLM）</div>
            </div>
          ) : !result ? (
            <div className="px-4 py-5">
              <div className="text-[13px] font-semibold text-slate-700">没有找到匹配的概念 🤔</div>
              <div className="mt-1 text-[12px] text-slate-400">试试下面这些方向：</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => simulate(p)}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {/* 目标 */}
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg quest-icon-${result.target.color}`}>
                  {result.target.icon}
                </div>
                <div>
                  <div className="text-[14px] font-black text-slate-900">
                    {result.target.name}
                    {result.targetDone && <span className="ml-2 text-[11px] font-bold text-emerald-600">✓ 已掌握</span>}
                  </div>
                  <div className="text-[11.5px] text-slate-500">{result.target.summary}</div>
                </div>
              </div>

              {/* 掌握情况 */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-emerald-600">你已经掌握</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {result.mastered.length === 0 && <span className="text-[11px] text-slate-400">暂无</span>}
                    {result.mastered.map((id) => (
                      <span key={id} className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        ✓ {getNode(id)?.name ?? id}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">你还没有掌握</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {result.missing.length === 0 && <span className="text-[11px] text-slate-400">全部掌握 🎉</span>}
                    {result.missing.map((id) => (
                      <span key={id} className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                        ○ {getNode(id)?.name ?? id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 推荐路线 */}
              <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                <div className="text-[10.5px] font-black uppercase tracking-wider text-violet-600">推荐学习路线</div>
                {result.route ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1 text-[12px] font-semibold text-slate-700">
                    {result.route.map((id, i) => (
                      <span key={id} className="flex items-center gap-1">
                        {i > 0 && <span className="text-violet-400">↓</span>}
                        <span className="rounded-md bg-white px-2 py-0.5 ring-1 ring-violet-200">
                          {getNode(id)?.name ?? id}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-[12px] text-slate-500">
                    前置概念尚未开放，可直接开始学习{" "}
                    <span className="font-bold text-violet-700">{result.target.name}</span>。
                  </div>
                )}
              </div>

              {/* 操作 */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={startLearning}
                  className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105"
                >
                  {result.route ? "开始学习" : "开始挑战"}
                </button>
                <button
                  onClick={locateInMap}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  在地图中定位
                </button>
              </div>
              {relatedNodes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 text-[10.5px] text-slate-400">
                  <span className="font-semibold">相关概念：</span>
                  {relatedNodes.map((n) => (
                    <button key={n.id} onClick={() => simulate(n.name)} className="hover:text-indigo-500">
                      {n.name} · +{xpForNode(n)} XP
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

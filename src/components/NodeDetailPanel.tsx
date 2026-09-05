"use client";

import { useRouter } from "next/navigation";
import type { KnowledgeNode } from "../lib/types";
import { getNode } from "../lib/data";
import { missingPrereqs, nodeStatus, xpForNode } from "../lib/progression";
import { useProgress } from "../store/useProgress";

const DIFF_LABEL = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];
const TYPE_LABEL: Record<string, string> = { main: "主线关卡", branch: "支线关卡", boss: "Boss 关卡" };

interface NodeDetailPanelProps {
  node: KnowledgeNode;
  onClose: () => void;
  /** 完成后跳转并关闭面板 */
  onStart: (node: KnowledgeNode) => void;
}

export default function NodeDetailPanel({ node, onClose, onStart }: NodeDetailPanelProps) {
  const router = useRouter();
  const { completed } = useProgress();
  const status = nodeStatus(node, completed);
  const done = status === "completed";
  const locked = status === "locked";
  const missing = missingPrereqs(node, completed);
  const prereqNodes = node.prerequisites.map((id) => getNode(id)).filter(Boolean) as KnowledgeNode[];
  const unlockNodes = node.unlocks
    .map((id) => getNode(id))
    .filter(Boolean) as KnowledgeNode[];

  return (
    <div className="pointer-events-auto w-full max-w-sm shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 lg:w-[360px]">
      {/* 头部 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl quest-icon-${node.color}`}>
            {node.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight text-slate-900">{node.name}</h3>
              {node.type === "boss" && (
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-amber-300">
                  BOSS
                </span>
              )}
            </div>
            <div className="text-[11px] font-medium text-slate-400">{TYPE_LABEL[node.type]}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 摘要 */}
      <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{node.summary}</p>

      {/* 难度 / 时间 */}
      <div className="mt-3 flex items-center gap-3 text-[12px]">
        <span className="flex items-center gap-1 text-amber-500">
          <span className="font-semibold text-slate-400">难度</span> {DIFF_LABEL[node.difficulty]}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <span className="font-semibold text-slate-400">预计</span> ⏱ {node.minutes} 分钟
        </span>
        <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
          +{xpForNode(node)} XP
        </span>
      </div>

      {/* 状态 */}
      <div className="mt-3">
        {done ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12.5px] font-semibold text-emerald-700">
            ✓ 已掌握此概念
          </div>
        ) : locked ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12.5px] font-medium text-slate-500">
            🔒 未解锁 · 需先完成前置关卡
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[12.5px] font-semibold text-indigo-700">
            ● 当前可挑战
          </div>
        )}
      </div>

      {/* 前置知识 */}
      {prereqNodes.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">前置知识</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {prereqNodes.map((p) => {
              const mastered = completed.includes(p.id);
              return (
                <span
                  key={p.id}
                  onClick={() => !done && onStart(p)}
                  className={`cursor-pointer rounded-lg border px-2 py-1 text-[11.5px] font-medium transition ${
                    mastered
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {mastered ? "✓ " : "○ "}
                  {p.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 可解锁 */}
      {unlockNodes.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">通关后解锁</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {unlockNodes.map((u) => (
              <span key={u.id} className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11.5px] font-medium text-violet-700">
                {u.type === "boss" ? "👑 " : "→ "}
                {u.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 未解锁的未来节点 */}
      {node.unlocks.length > unlockNodes.length && (
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">未来将解锁</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {node.unlocks
              .filter((id) => !unlockNodes.find((u) => u.id === id))
              .map((id) => (
                <span key={id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11.5px] font-medium text-slate-500">
                  {id.replace(/-/g, " ")} · 即将开放
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 按钮 */}
      <div className="mt-5 space-y-2">
        <button
          disabled={locked}
          onClick={() => onStart(node)}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            done
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : locked
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:brightness-105"
          }`}
        >
          {done ? "再次挑战（复习）" : locked ? "前置未完成，无法挑战" : "Start Challenge →"}
        </button>
        {!done && !locked && (
          <div className="text-center text-[11px] text-slate-400">
            缺少：{missing.length > 0 ? missing.map((m) => getNode(m)?.name ?? m).join("、") : "无，可立即开始"}
          </div>
        )}
        <button
          onClick={() => router.push(`/world/${node.world}`)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          在地图中查看
        </button>
      </div>
    </div>
  );
}

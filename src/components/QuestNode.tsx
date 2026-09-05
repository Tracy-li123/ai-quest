"use client";

import type { KnowledgeNode } from "../lib/types";
import { nodeStatus } from "../lib/progression";
import { useProgress } from "../store/useProgress";

export const NODE_SIZE: Record<string, number> = {
  main: 92,
  branch: 70,
  boss: 124,
};

const TYPE_TAG: Record<string, string> = {
  main: "主线",
  branch: "支线",
  boss: "BOSS",
};

interface QuestNodeProps {
  node: KnowledgeNode;
  selected: boolean;
  onSelect: (node: KnowledgeNode) => void;
}

export default function QuestNode({ node, selected, onSelect }: QuestNodeProps) {
  const { completed } = useProgress();
  const status = nodeStatus(node, completed);
  const size = NODE_SIZE[node.type];
  const locked = status === "locked";
  const done = status === "completed";

  return (
    <button
      onClick={() => onSelect(node)}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 outline-none transition-transform hover:scale-[1.04]"
      style={{ left: node.pos.x, top: node.pos.y, width: size }}
      aria-label={`${node.name}（${status}）`}
    >
      <div className="relative flex flex-col items-center">
        {/* 节点本体 */}
        <div
          className={`relative flex items-center justify-center rounded-2xl border transition-all duration-300 ${
            node.type === "boss" ? "rotate-45 quest-boss-style" : ""
          } ${done ? "quest-node-done" : ""} ${
            !done && !locked ? "quest-node-available" : ""
          } ${locked ? "quest-node-locked" : ""} ${selected && !locked ? "quest-node-selected" : ""}`}
          style={{ width: size, height: size }}
        >
          {/* 图标 */}
          <span
            className={`flex items-center justify-center ${
              node.type === "boss" ? "-rotate-45 text-[34px]" : "text-[26px]"
            } ${locked ? "opacity-40 grayscale" : ""}`}
          >
            {node.icon}
          </span>

          {/* 已完成 ✓ 徽标 */}
          {done && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[12px] font-black text-white shadow">
              ✓
            </span>
          )}

          {/* 锁定徽标 */}
          {locked && (
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[12px] shadow-sm">
              🔒
            </span>
          )}

          {/* 当前可挑战 呼吸光环 */}
          {!done && !locked && (
            <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-indigo-400/40 blur-md" />
          )}

          {/* Boss 特殊标识 */}
          {node.type === "boss" && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-black tracking-wider text-amber-300 shadow">
              {TYPE_TAG.boss}
            </span>
          )}
        </div>

        {/* 名称 */}
        <div
          className={`mt-3 max-w-[140px] truncate rounded-md px-2 py-0.5 text-[12px] font-bold ${
            locked ? "text-slate-400" : done ? "text-emerald-700" : "text-slate-800"
          } ${selected && !locked ? "bg-indigo-100 text-indigo-700" : ""}`}
        >
          {node.name}
        </div>
        {node.type === "boss" && (
          <div className="mt-0.5 text-[10px] font-semibold text-amber-600">最终试炼</div>
        )}
      </div>
    </button>
  );
}

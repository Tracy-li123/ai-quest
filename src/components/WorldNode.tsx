"use client";

import type { World } from "../lib/types";
import { worldProgress, worldStatus } from "../lib/progression";
import { useProgress } from "../store/useProgress";
import ProgressBar from "./ProgressBar";

export type WorldCardStatus = World["status"];

const STATUS_META: Record<
  WorldCardStatus,
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: "已完成",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  learning: {
    label: "学习中",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  unlocked: {
    label: "已解锁",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  locked: {
    label: "未解锁",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
};

interface WorldNodeProps {
  world: World;
  isCurrent: boolean; // 当前重点世界（Agent 城）
  onSelect: (world: World) => void;
}

export default function WorldNode({ world, isCurrent, onSelect }: WorldNodeProps) {
  const { completed } = useProgress();
  const status = worldStatus(world, completed);
  const progress = worldProgress(world, completed);
  const meta = STATUS_META[status];
  const locked = status === "locked";

  return (
    <button
      onClick={() => onSelect(world)}
      className={`group absolute -translate-x-1/2 -translate-y-1/2 outline-none ${
        locked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ left: world.pos.x, top: world.pos.y, width: 216 }}
      aria-label={`${world.name}（${meta.label}）`}
    >
      <div
        className={`relative w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 ${
          locked
            ? "border-slate-200 opacity-60"
            : "border-slate-200/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60"
        } ${isCurrent ? "world-current-ring" : ""}`}
      >
        {/* 状态徽标 */}
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
          {isCurrent && (
            <span className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              当前世界
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner ${
              locked ? "bg-slate-100 grayscale" : "world-icon-" + world.color
            }`}
          >
            {world.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-bold tracking-tight text-slate-900">{world.name}</div>
            <div className="truncate text-[11px] font-medium text-slate-500">{world.subtitle}</div>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">
          {world.description}
        </p>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-medium text-slate-400">
            {world.nodeCount} 个知识节点
          </span>
          <div className="flex-1">
            {locked ? (
              <div className="flex items-center justify-end gap-1 text-[11px] font-medium text-slate-400">
                <span>🔒</span> 后续版本开放
              </div>
            ) : (
              <ProgressBar value={progress} label={progress > 0 ? `${progress}%` : "开始探索"} />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

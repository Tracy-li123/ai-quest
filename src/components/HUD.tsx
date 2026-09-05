"use client";

import { useProgress } from "../store/useProgress";
import { levelFromXp, totalProgress } from "../lib/progression";
import { getWorld } from "../lib/data";
import ProgressBar from "./ProgressBar";

interface HUDProps {
  /** 当前世界名，例如 "Agent 城" */
  worldName?: string;
  /** 是否显示重置按钮 */
  showReset?: boolean;
  /** 紧凑模式（地图页顶部使用） */
  compact?: boolean;
}

function ConfirmReset({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={() => {
        if (window.confirm("确定要重置全部学习进度吗？所有已掌握概念和经验值将被清空。")) {
          onReset();
        }
      }}
      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      title="重置学习进度"
    >
      ↺ 重置
    </button>
  );
}

export default function HUD({ worldName, showReset = false, compact = false }: HUDProps) {
  const { completed, xp, reset } = useProgress();
  const { level, xpIntoLevel, xpForNext } = levelFromXp(xp);
  const progress = totalProgress(completed);
  const world = worldName ? getWorld(worldName) : undefined;

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 border-b border-slate-200/70 ${
        compact ? "bg-white/70 px-4 py-2.5 backdrop-blur-md" : "bg-white/80 px-6 py-3.5 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-sm">
          AQ
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight text-slate-900">AI Quest</div>
          {world && (
            <div className="text-[11px] font-medium text-slate-500">当前世界：{world.name}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* 等级 */}
        <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-1.5">
          <span className="text-sm font-black text-indigo-600">Lv.{level}</span>
          <div className="hidden w-20 sm:block">
            <ProgressBar value={(xpIntoLevel / xpForNext) * 100} barClassName="from-indigo-500 to-violet-500" />
          </div>
        </div>
        {/* 已掌握概念 */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {completed.length} 个概念
        </div>
        {/* 总进度 */}
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:flex">
          <span className="text-xs font-semibold text-slate-600">总进度</span>
          <div className="w-20">
            <ProgressBar value={progress} label={`${progress}%`} />
          </div>
        </div>
        {showReset && <ConfirmReset onReset={reset} />}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { World } from "../lib/types";
import WorldMap from "../components/WorldMap";
import HUD from "../components/HUD";
import AskAIQuest from "../components/AskAIQuest";
import { getNodesByWorld } from "../lib/data";
import { useProgress } from "../store/useProgress";

export default function HomePage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const { completed } = useProgress();

  // 高亮「进度最高」的世界；全部未开始时默认高亮 Agent 城作为推荐起点
  const currentWorldId = useMemo(() => {
    let best = "agent-city";
    let bestCount = -1;
    const worldIds = ["llm-village", "prompt-forest", "rag-valley", "agent-city", "training-workshop", "engineering-port"];
    for (const id of worldIds) {
      const count = getNodesByWorld(id).filter((n) => completed.includes(n.id)).length;
      if (count > bestCount) {
        bestCount = count;
        best = id;
      }
    }
    return best;
  }, [completed]);

  const handleSelectWorld = (world: World) => {
    if (world.status === "locked") {
      setToast(`${world.name} 尚未解锁`);
      window.setTimeout(() => setToast(null), 2200);
      return;
    }
    router.push(`/world/${world.id}`);
  };

  return (
    <div className="min-h-screen">
      <HUD showReset />
      {/* Hero + Ask AI Quest */}
      <div className="border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50/60 px-6 pb-8 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-[11px] font-bold text-indigo-600">
            🗺️ 探索式 AI 学习 · 技能树 + 冒险地图
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            把大模型知识，
            <br className="sm:hidden" />
            变成一张<span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">可探索的世界地图</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-slate-500">
            从 LLM 新手村到 AI 工程港口，6 大世界全部开放：
            <span className="font-bold text-indigo-600">44 个关卡</span>，逐个点亮你的 AI 知识体系。
          </p>
          <div className="mt-6 flex justify-center">
            <AskAIQuest />
          </div>
        </div>
      </div>

      {/* 世界地图 */}
      <div className="px-4 py-6">
        <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between px-2">
          <div className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">AI 世界地图</div>
          <div className="text-[11px] text-slate-400">点击世界进入 · 沿路径从新手村出发</div>
        </div>
        <div className="flex justify-center overflow-x-auto pb-8">
          <WorldMap currentWorldId={currentWorldId} onSelectWorld={handleSelectWorld} />
        </div>
      </div>

      {/* 提示 */}
      <div className="px-6 pb-10 text-center text-[11.5px] text-slate-400">
        💡 进度自动保存在本地（localStorage）· 完成前置关卡即可解锁后续节点
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[13px] font-semibold text-slate-700 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

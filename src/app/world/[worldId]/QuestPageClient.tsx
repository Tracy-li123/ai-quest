"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { KnowledgeNode } from "../../../lib/types";
import { getNodesByWorld, getWorld } from "../../../lib/data";
import QuestMap from "../../../components/QuestMap";
import NodeDetailPanel from "../../../components/NodeDetailPanel";
import HUD from "../../../components/HUD";
import AskAIQuest from "../../../components/AskAIQuest";

function QuestPageInner() {
  const params = useParams<{ worldId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const worldId = params.worldId;

  const world = getWorld(worldId);
  const nodes = getNodesByWorld(worldId);
  const focusKey = `${worldId}:${searchParams.get("focus") ?? ""}`;
  const [selection, setSelection] = useState<{ key: string; node: KnowledgeNode | null } | null>(null);
  const selected = selection?.key === focusKey ? selection.node : nodes.find((n) => n.id === searchParams.get("focus")) ?? null;
  const setSelected = (node: KnowledgeNode | null) => setSelection({ key: focusKey, node });

  if (!world) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-4xl">🗺️</div>
        <div className="text-lg font-black text-slate-800">未知世界</div>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
        >
          返回世界地图
        </button>
      </div>
    );
  }

  const handleStart = (node: KnowledgeNode) => {
    router.push(`/lesson/${node.id}`);
  };

  const nodeCount = nodes.length;
  const bossName = nodes.find((n) => n.type === "boss")?.name ?? "Boss";

  return (
    <div className="min-h-screen">
      <HUD worldName={world.id} showReset compact />

      {/* 顶部：标题 + Ask AI Quest */}
      <div className="border-b border-slate-200/60 bg-white/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl shadow-md shadow-indigo-200">
              {world.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">{world.name}</h1>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10.5px] font-bold text-indigo-600">
                  {nodeCount} 关
                </span>
              </div>
              <div className="text-[12px] text-slate-500">{world.subtitle} · 主线通关 → 击败 {bossName}</div>
            </div>
          </div>
          <div className="w-full max-w-md sm:w-auto sm:min-w-[380px]">
            <AskAIQuest />
          </div>
        </div>
      </div>

      {/* 地图 + 详情面板 */}
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-[1280px] items-start gap-6">
          {/* 地图 */}
          <div className="min-w-0 flex-1 overflow-x-auto pb-8">
            <div className="mx-auto w-fit">
              <div className="mx-auto mb-4 flex w-full max-w-[960px] items-center justify-between px-2">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">技能树</div>
                <div className="text-[11px] text-slate-400">
                  <span className="mr-3">⬤ 大节点 = 主线</span>
                  <span className="mr-3">◯ 小节点 = 支线</span>
                  <span>👑 Boss</span>
                </div>
              </div>
              <QuestMap
                worldId={worldId}
                selectedNode={selected}
                onSelectNode={(n) => setSelected(n)}
              />
            </div>
          </div>

          {/* 右侧详情（桌面端常驻，移动端浮层） */}
          <div className="sticky top-4 hidden shrink-0 lg:block">
            {selected ? (
              <NodeDetailPanel node={selected} onClose={() => setSelected(null)} onStart={handleStart} />
            ) : (
              <div className="w-[360px] rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
                <div className="text-3xl">🧭</div>
                <div className="mt-2 text-[13px] font-semibold text-slate-600">点击地图上的节点</div>
                <div className="mt-1 text-[12px] leading-relaxed text-slate-400">
                  查看概念详情、前置知识、难度与解锁关系，然后开始挑战。
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端详情浮层 */}
      <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
        {selected && (
          <div className="relative">
            <NodeDetailPanel node={selected} onClose={() => setSelected(null)} onStart={handleStart} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuestPageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <QuestPageInner />
    </Suspense>
  );
}

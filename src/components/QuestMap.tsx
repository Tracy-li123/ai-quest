"use client";

import { useMemo } from "react";
import type { KnowledgeNode } from "../lib/types";
import { getNodesByWorld, getWorld } from "../lib/data";
import { QUEST_MAP_W, QUEST_MAP_H } from "../lib/data/nodes";
import { useProgress } from "../store/useProgress";
import QuestNode from "./QuestNode";

interface Edge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  from: string;
  to: string;
}

/** 构建节点间的曲线连接（垂直主线用横向偏移的贝塞尔曲线，分支用斜向曲线） */
function buildEdges(nodes: KnowledgeNode[]): Edge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges: Edge[] = [];
  for (const node of nodes) {
    for (const prereq of node.prerequisites) {
      const from = byId.get(prereq);
      if (!from) continue;
      const dx = node.pos.x - from.pos.x;
      const dy = node.pos.y - from.pos.y;
      const dist = Math.max(Math.abs(dy), 40);
      // 控制点：向「下一个节点」方向偏移，形成 S 形 / 弧形
      const offset = Math.min(90, 30 + dist * 0.35);
      const isVertical = Math.abs(dx) < 40;
      const cx = (from.pos.x + node.pos.x) / 2 + (isVertical ? offset : dx * 0.5);
      const cy = (from.pos.y + node.pos.y) / 2;
      edges.push({
        id: `${prereq}->${node.id}`,
        x1: from.pos.x,
        y1: from.pos.y,
        x2: node.pos.x,
        y2: node.pos.y,
        cx,
        cy,
        from: prereq,
        to: node.id,
      });
    }
  }
  return edges;
}

interface QuestMapProps {
  worldId: string;
  selectedNode: KnowledgeNode | null;
  onSelectNode: (node: KnowledgeNode) => void;
}

/** 各世界的英文区域名（用于地图顶部装饰） */
const WORLD_EN: Record<string, string> = {
  "llm-village": "LLM Village",
  "prompt-forest": "Prompt Forest",
  "rag-valley": "RAG Valley",
  "agent-city": "Agent City",
  "training-workshop": "Training Workshop",
  "engineering-port": "Engineering Port",
};

/** 世界主题色 → 标题文字色 */
const WORLD_TITLE_COLOR: Record<string, string> = {
  emerald: "text-emerald-400",
  green: "text-green-500",
  teal: "text-teal-400",
  indigo: "text-indigo-300",
  violet: "text-violet-400",
  slate: "text-slate-400",
};

export default function QuestMap({ worldId, selectedNode, onSelectNode }: QuestMapProps) {
  const { completed } = useProgress();
  const nodes = useMemo(() => getNodesByWorld(worldId), [worldId]);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const mainCount = nodes.filter((n) => n.type === "main").length;
  const branchCount = nodes.filter((n) => n.type === "branch").length;
  const bossCount = nodes.filter((n) => n.type === "boss").length;
  const enName = WORLD_EN[worldId] ?? worldId;
  const titleColor = WORLD_TITLE_COLOR[getWorld(worldId)?.color ?? ""] ?? "text-indigo-300";

  return (
    <div className="map-canvas relative" style={{ width: QUEST_MAP_W, height: QUEST_MAP_H }}>
      <div className="map-grid-bg absolute inset-0 rounded-[2rem]" />

      {/* 装饰：区域标题 */}
      <div className="pointer-events-none absolute left-1/2 top-7 z-0 -translate-x-1/2 text-center">
        <div className={`text-[13px] font-black uppercase tracking-[0.35em] ${titleColor}`}>
          {enName}
        </div>
        <div className="mt-1 text-[11px] font-medium tracking-wide text-slate-400">
          主线 {mainCount} 关 · 支线 {branchCount} 关 · 最终试炼 {bossCount} 关
        </div>
      </div>

      {/* 连接线 */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${QUEST_MAP_W} ${QUEST_MAP_H}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="questEdgeDone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {edges.map((e) => {
          const done = completed.includes(e.from) && completed.includes(e.to);
          const reachable = completed.includes(e.from); // 起点已完成 → 路径被「激活」
          const d = `M ${e.x1} ${e.y1} Q ${e.cx} ${e.cy} ${e.x2} ${e.y2}`;
          return (
            <g key={e.id}>
              {done && <path d={d} stroke="url(#questEdgeDone)" strokeWidth={8} strokeOpacity={0.18} strokeLinecap="round" />}
              <path
                d={d}
                stroke={done ? "#10b981" : reachable ? "#a5b4fc" : "#cbd5e1"}
                strokeWidth={done ? 3 : 2}
                strokeLinecap="round"
                strokeDasharray={done ? "none" : reachable ? "6 6" : "2 7"}
                opacity={done || reachable ? 1 : 0.55}
              />
              {/* 激活箭头 */}
              {reachable && !done && (
                <circle cx={(e.x1 + e.x2) / 2} cy={(e.y1 + e.y2) / 2} r={3.5} fill="#818cf8" className="world-path-anim" />
              )}
            </g>
          );
        })}
      </svg>

      {/* 节点 */}
      {nodes.map((n) => (
        <QuestNode key={n.id} node={n} selected={selectedNode?.id === n.id} onSelect={onSelectNode} />
      ))}
    </div>
  );
}

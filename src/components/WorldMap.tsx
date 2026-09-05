"use client";

import { useMemo } from "react";
import { WORLDS, WORLD_MAP_W, WORLD_MAP_H } from "../lib/data/worlds";
import type { World } from "../lib/types";
import WorldNode from "./WorldNode";

interface WorldMapProps {
  currentWorldId: string;
  onSelectWorld: (world: World) => void;
}

/** 生成经过所有世界位置的平滑曲线路径 */
function buildPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    if (i === 0) d += ` Q ${p0.x} ${p0.y} ${mx} ${my}`;
    else d += ` T ${mx} ${my}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

export default function WorldMap({ currentWorldId, onSelectWorld }: WorldMapProps) {
  const path = useMemo(() => buildPath(WORLDS.map((w) => w.pos)), []);
  const edgeIds = useMemo(
    () =>
      WORLDS.slice(0, -1).map((w, i) => ({
        from: w.pos,
        to: WORLDS[i + 1].pos,
        id: `${w.id}-${WORLDS[i + 1].id}`,
      })),
    []
  );

  return (
    <div className="map-canvas relative mx-auto" style={{ width: WORLD_MAP_W, height: WORLD_MAP_H }}>
      {/* 背景网格 */}
      <div className="map-grid-bg absolute inset-0 rounded-[2.5rem]" />

      {/* 路径 */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${WORLD_MAP_W} ${WORLD_MAP_H}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="worldPathGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* 光晕 */}
        <path d={path} stroke="url(#worldPathGrad)" strokeWidth={10} strokeOpacity={0.15} strokeLinecap="round" />
        {/* 主线 */}
        <path
          d={path}
          stroke="url(#worldPathGrad)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="1 10"
          className="world-path-anim"
        />
        {/* 连接小点 */}
        {edgeIds.map((e) => {
          const mx = (e.from.x + e.to.x) / 2;
          const my = (e.from.y + e.to.y) / 2;
          return (
            <g key={e.id}>
              <circle cx={mx} cy={my} r={3} fill="#6366f1" opacity={0.55} />
              <circle cx={mx} cy={my} r={6} fill="#6366f1" opacity={0.15} />
            </g>
          );
        })}
      </svg>

      {/* 世界节点 */}
      {WORLDS.map((w) => (
        <WorldNode key={w.id} world={w} isCurrent={w.id === currentWorldId} onSelect={onSelectWorld} />
      ))}
    </div>
  );
}

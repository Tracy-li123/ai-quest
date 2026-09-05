import type { KnowledgeNode, World } from "./types";
import { NODES, getNodesByWorld } from "./data";

// ---------------------------------------------------------------------------
// 进度 / 解锁 / 经验值 纯函数
// ---------------------------------------------------------------------------

export type NodeStatus = "completed" | "available" | "locked";

/** 节点是否已解锁：所有前置知识都已完成 */
export function isNodeUnlocked(node: KnowledgeNode, completed: string[]): boolean {
  return node.prerequisites.every((p) => completed.includes(p));
}

export function nodeStatus(node: KnowledgeNode, completed: string[]): NodeStatus {
  if (completed.includes(node.id)) return "completed";
  return isNodeUnlocked(node, completed) ? "available" : "locked";
}

/** 通关一个节点获得的经验值 */
export function xpForNode(node: KnowledgeNode): number {
  return (node.difficulty + 1) * 25;
}

/** 等级模型：升到第 L 级需要 150 * (L-1)^2 经验 */
export function levelFromXp(xp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  totalXp: number;
} {
  let level = 1;
  let rest = xp;
  while (true) {
    const need = 150 * level * level;
    if (rest >= need) {
      rest -= need;
      level++;
    } else {
      break;
    }
  }
  return { level, xpIntoLevel: rest, xpForNext: 150 * level * level, totalXp: xp };
}

/** 某个世界的派生状态：进度 100% → completed；有进度 → learning；否则用基础状态 */
export function worldStatus(world: World, completed: string[]): World["status"] {
  const nodes = getNodesByWorld(world.id);
  if (nodes.length === 0) return world.status;
  const done = nodes.filter((n) => completed.includes(n.id)).length;
  if (done >= nodes.length) return "completed";
  if (done > 0) return "learning";
  return world.status;
}

export function worldProgress(world: World, completed: string[]): number {
  const nodes = getNodesByWorld(world.id);
  if (nodes.length === 0) return 0;
  const done = nodes.filter((n) => completed.includes(n.id)).length;
  return Math.round((done / nodes.length) * 100);
}

/** 全局总进度（跨所有已定义节点） */
export function totalProgress(completed: string[]): number {
  if (NODES.length === 0) return 0;
  return Math.round((NODES.filter((n) => completed.includes(n.id)).length / NODES.length) * 100);
}

/** 找出某个节点尚未掌握的前置概念（用于 Ask AI Quest 与详情面板） */
export function missingPrereqs(node: KnowledgeNode, completed: string[]): string[] {
  return node.prerequisites.filter((p) => !completed.includes(p));
}

/**
 * 在「前置关系图」中，从 target 出发找一条经过 missing 概念的推荐路线。
 * 返回形如 ["context-engineering", "harness"] 的节点 id 链（含 target）。
 * 找不到通路时返回 null。
 */
export function findRoute(targetId: string, missing: string[], completed: string[]): string[] | null {
  const target = NODES.find((n) => n.id === targetId);
  if (!target) return null;

  missing = missing.filter((id) => !completed.includes(id));

  // BFS：从 target 沿 prerequisites 反向搜索，找出到每个 missing 的路径
  const queue: string[] = [target.id];
  const visited = new Set<string>([target.id]);
  const prev = new Map<string, string>();

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const node = NODES.find((n) => n.id === cur);
    if (!node) continue;
    for (const prereq of node.prerequisites) {
      if (!visited.has(prereq)) {
        visited.add(prereq);
        prev.set(prereq, cur);
        queue.push(prereq);
      }
    }
  }

  // 在所有 missing 里挑一条最短的可达路线
  let best: string[] | null = null;
  for (const m of missing) {
    if (!visited.has(m)) continue;
    const path: string[] = [];
    let cur: string | undefined = m;
    while (cur && cur !== targetId) {
      path.push(cur);
      cur = prev.get(cur);
    }
    path.push(targetId);
    if (!best || path.length < best.length) best = path;
  }
  return best;
}

import { AGENT_CITY_NODES } from "./nodes";
import { LLM_VILLAGE_NODES } from "./nodes-llm";
import { PROMPT_FOREST_NODES } from "./nodes-prompt";
import { RAG_VALLEY_NODES } from "./nodes-rag";
import { TRAINING_WORKSHOP_NODES } from "./nodes-training";
import { ENGINEERING_PORT_NODES } from "./nodes-engineering";
import { WORLDS } from "./worlds";
import type { KnowledgeNode, World } from "../types";

// 全部知识节点。新增世界只需：新建数据文件 + 在这里展开合并。
export const NODES: KnowledgeNode[] = [
  ...LLM_VILLAGE_NODES,
  ...PROMPT_FOREST_NODES,
  ...RAG_VALLEY_NODES,
  ...AGENT_CITY_NODES,
  ...TRAINING_WORKSHOP_NODES,
  ...ENGINEERING_PORT_NODES,
];

export const WORLDS_LIST: World[] = WORLDS;

export function getNode(id: string): KnowledgeNode | undefined {
  return NODES.find((n) => n.id === id);
}

export function getWorld(id: string): World | undefined {
  return WORLDS.find((w) => w.id === id);
}

export function getNodesByWorld(worldId: string): KnowledgeNode[] {
  return NODES.filter((n) => n.world === worldId);
}

export function getUnlockedBy(nodeId: string): string[] {
  return NODES.filter((n) => n.prerequisites.includes(nodeId)).map((n) => n.id);
}

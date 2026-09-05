import type { World } from "../types";

// ---------------------------------------------------------------------------
// AI 世界地图 — 6 个世界
// 所有世界的第一版内容均已就绪（见 nodes-*.ts），状态默认为已解锁可探索。
// 未来新增世界时，在这里加一条记录，并新建对应 world 的数据文件即可。
// ---------------------------------------------------------------------------

export const WORLDS: World[] = [
  {
    id: "llm-village",
    name: "LLM 新手村",
    subtitle: "从 Token 到 Transformer",
    description: "理解大语言模型是怎么工作的：Token、注意力、预训练与对话原理。",
    icon: "🌱",
    color: "emerald",
    status: "unlocked",
    nodeCount: 7,
    pos: { x: 410, y: 120 },
  },
  {
    id: "prompt-forest",
    name: "Prompt 森林",
    subtitle: "与模型对话的技艺",
    description: "提示词工程：角色设定、Few-shot、思维链与结构化输出。",
    icon: "🌲",
    color: "green",
    status: "unlocked",
    nodeCount: 7,
    pos: { x: 290, y: 330 },
  },
  {
    id: "rag-valley",
    name: "RAG 山谷",
    subtitle: "让模型学会查资料",
    description: "检索增强生成：向量化、索引、召回与引用溯源。",
    icon: "🏞️",
    color: "teal",
    status: "unlocked",
    nodeCount: 6,
    pos: { x: 530, y: 560 },
  },
  {
    id: "agent-city",
    name: "Agent 城",
    subtitle: "让模型真正动手做事",
    description: "工具调用、推理循环、记忆与安全运行 —— AI Agent 的核心技能树。",
    icon: "🏙️",
    color: "indigo",
    status: "unlocked",
    nodeCount: 11,
    pos: { x: 410, y: 800 },
  },
  {
    id: "training-workshop",
    name: "模型训练工坊",
    subtitle: "亲手打造一个模型",
    description: "预训练、微调、RLHF 与评估：模型是怎么炼成的。",
    icon: "⚗️",
    color: "violet",
    status: "unlocked",
    nodeCount: 7,
    pos: { x: 290, y: 1040 },
  },
  {
    id: "engineering-port",
    name: "AI 工程港口",
    subtitle: "把 AI 送上生产环境",
    description: "评测、可观测、成本与合规：AI 应用上线的最后一公里。",
    icon: "⚓",
    color: "slate",
    status: "unlocked",
    nodeCount: 6,
    pos: { x: 530, y: 1280 },
  },
];

export const WORLD_MAP_W = 820;
export const WORLD_MAP_H = 1440;

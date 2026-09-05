// ---------------------------------------------------------------------------
// AI Quest — 领域类型定义
// 所有知识内容都挂在 KnowledgeNode 上，页面组件只消费数据，不写死内容。
// 未来接入 Supabase 时，将 progress 相关字段映射到 auth/users 表即可。
// ---------------------------------------------------------------------------

export type NodeType = "main" | "branch" | "boss";

export type ChallengeType = "single" | "judge" | "order" | "match";

// ---- Challenge（第 4 阶段）------------------------------------------------

interface ChallengeBase {
  id: string;
  question: string;
  explanation?: string;
}

export interface SingleChallenge extends ChallengeBase {
  type: "single";
  options: string[];
  answer: number; // 正确选项下标
}

export interface JudgeChallenge extends ChallengeBase {
  type: "judge";
  statement: string;
  answer: boolean;
}

export interface OrderChallenge extends ChallengeBase {
  type: "order";
  items: string[]; // 待排序的条目（渲染时打乱）
  answer: string[]; // 正确顺序（item 文本）
}

export interface MatchChallenge extends ChallengeBase {
  type: "match";
  pairs: { left: string; right: string }[];
}

export type Challenge = SingleChallenge | JudgeChallenge | OrderChallenge | MatchChallenge;

// ---- 学习内容 --------------------------------------------------------------

export interface EncounterSection {
  scenario: string; // 现实场景描述
  prompt: string; // 引导思考的问题
}

export interface LearnSection {
  what: string; // 一句话：是什么
  why: string; // 为什么出现
  problem: string; // 解决什么问题
  mechanism: string; // 核心机制
  flow: { label: string; desc: string }[]; // 核心流程（横向步骤）
}

export interface CompareRow {
  concept: string;
  tagline: string;
  bullets: string[];
  highlight?: boolean; // 是否强调当前概念
}

export interface FinalQuestion {
  question: string;
  hint: string;
  keywords: string[]; // 关键词评分规则（第一版模拟 AI 评分）
  passRate?: number; // 需要命中的关键词比例，默认 0.6
}

// ---- 节点 / 世界 -----------------------------------------------------------

export interface NodePos {
  x: number;
  y: number;
}

export interface KnowledgeNode {
  id: string;
  name: string;
  world: string;
  type: NodeType;
  difficulty: number; // 1 - 5
  minutes: number; // 预计学习时间
  summary: string;
  icon: string; // emoji 标识
  color: string; // 主题色 key（用于渐变）
  prerequisites: string[];
  related: string[];
  unlocks: string[];
  pos: NodePos;
  // 五阶段内容
  encounter: EncounterSection;
  learn: LearnSection;
  compare: CompareRow[];
  challenges: Challenge[];
  final: FinalQuestion;
}

export type WorldStatus = "completed" | "learning" | "unlocked" | "locked";

export interface World {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  status: WorldStatus; // 基础状态（无进度时使用），有进度时会被派生状态覆盖
  nodeCount: number; // 含未来节点的预估数量（用于展示）
  pos: NodePos; // 首页地图上的位置
}

// ---- 学习进度（localStorage，未来迁 Supabase）-----------------------------

export interface ProgressState {
  completed: string[];
  xp: number;
}

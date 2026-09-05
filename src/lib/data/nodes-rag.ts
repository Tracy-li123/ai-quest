import type { KnowledgeNode } from "../types";

// ---------------------------------------------------------------------------
// RAG 山谷 — 知识节点数据
//
// 主线（大节点）：chunking → vector-db → retrieval → rag-boss
// 支线（小节点）：rerank / citation（retrieval 后分叉）
// 前置关联：新手村 embedding（向量化）是理解本山谷的基础概念。
// ---------------------------------------------------------------------------

export const RAG_VALLEY_NODES: KnowledgeNode[] = [
  // ===========================================================================
  // 1. Chunking（文档切分）
  // ===========================================================================
  {
    id: "chunking",
    name: "Chunking 切分",
    world: "rag-valley",
    type: "main",
    difficulty: 1,
    minutes: 6,
    summary: "把长文档按语义边界切成小块——切太粗检索不准，切太细语义破碎。",
    icon: "✂️",
    color: "teal",
    prerequisites: [],
    related: ["embedding", "splitter", "overlap"],
    unlocks: ["vector-db"],
    pos: { x: 480, y: 110 },
    encounter: {
      scenario:
        "你拿到一份 100 页的《员工手册》，想做一个能回答「年假怎么算」的问答机器人。\n\n你把整本手册变成一个向量喂进去——检索时发现：问「年假」，召回的是「入职流程」那一段。因为整篇文档的向量被「平均」了，局部细节全被冲淡。\n\n那如果切成一行一个字呢？检索倒是精准了，但「年假 5 天以上需提前一周申请」这种完整语义被拦腰切断，模型又拼不回来。",
      prompt: "切太粗丢细节、切太细断语义——到底应该按什么「边界」来切？",
    },
    learn: {
      what: "Chunking 是把长文档按语义边界（段落、标题、句子）切成适合向量化与检索的小块，并在相邻块间保留重叠。",
      why: "整篇文档向量化会丢失局部语义；过小的碎片又会切断完整语义，两者都会降低检索质量。",
      problem: "如何确定合适的切分粒度，让每个块「语义完整且检索精准」。",
      mechanism:
        "按结构边界（标题 / 段落 / 句子）切分；用重叠窗口（如前后重叠 50 字符）保持上下文连续；进阶做法按语义完整性动态切分。",
      flow: [
        { label: "文档", desc: "长文本 / PDF" },
        { label: "结构分析", desc: "标题、段落、句子" },
        { label: "切块", desc: "按语义边界切分" },
        { label: "重叠处理", desc: "相邻块保持上下文" },
        { label: "入库", desc: "每块独立向量化" },
      ],
    },
    compare: [
      {
        concept: "粗切块（整篇）",
        tagline: "粒度太大",
        bullets: ["细节被平均冲淡", "检索定位不准", "局部问题无法命中"],
      },
      {
        concept: "细切块（单句）",
        tagline: "粒度太小",
        bullets: ["完整语义被切断", "召回碎片化", "模型难以拼回上下文"],
      },
      {
        concept: "语义切块",
        tagline: "按边界 + 重叠",
        bullets: ["块内语义完整", "块间上下文连续", "检索质量最佳"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "ck-1",
        type: "single",
        question: "文档切块过细（比如切成单句）的主要问题是？",
        options: ["向量化更慢", "完整语义被切断，召回碎片化", "Token 成本降低", "检索结果更精确"],
        answer: 1,
        explanation: "块太小会切断完整语义，模型拼不回来。",
      },
      {
        id: "ck-2",
        type: "judge",
        question: "判断正误：",
        statement: "相邻文档块之间保留少量重叠字符，有助于保持上下文连续。",
        answer: true,
        explanation: "重叠窗口让边界处的语义不丢失。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么切分粒度会影响 RAG 的检索质量？好的切分策略长什么样？",
      hint: "从「太粗丢细节、太细断语义」出发，说明按语义边界 + 重叠窗口的策略。",
      keywords: ["切分", "粒度", "语义", "边界", "重叠", "上下文", "完整", "检索", "质量", "块"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 2. Vector DB（向量数据库）
  // ===========================================================================
  {
    id: "vector-db",
    name: "Vector DB",
    world: "rag-valley",
    type: "main",
    difficulty: 2,
    minutes: 7,
    summary: "专门存储向量、提供「近似最近邻」快速检索的引擎——海量数据下秒级召回。",
    icon: "🗃️",
    color: "teal",
    prerequisites: ["chunking"],
    related: ["embedding", "hnsw", "ann"],
    unlocks: ["retrieval"],
    pos: { x: 480, y: 330 },
    encounter: {
      scenario:
        "你的公司把 100 万份文档切片后全部向量化，得到 500 万个向量，每个 1024 维。\n\n用户问一个问题，系统要把问题向量和这 500 万个向量逐一比对、算相似度——暴力全扫一遍要好几秒，用户等不了。\n\n你需要一个能「快速找到最相似的那几个」的引擎，而不是一个个比过去。",
      prompt: "在海量向量里找 Top-K 最相似的，怎么才能快？",
    },
    learn: {
      what: "向量数据库（Vector DB）是专门存储向量、并通过索引结构提供近似最近邻（ANN）检索的引擎。",
      why: "暴力全量比对是 O(N)，百万级向量无法接受；需要牺牲一点精确度换取数量级的速度提升。",
      problem: "在海量高维向量中，毫秒级返回 Top-K 相似向量。",
      mechanism:
        "用 HNSW（分层可导航小世界图）或 IVF（倒排文件）等索引结构组织向量：先粗粒度定位候选区，再在候选区内精算，把检索复杂度从 O(N) 降到近似对数级。",
      flow: [
        { label: "向量入库", desc: "文档块 → 向量" },
        { label: "建立索引", desc: "HNSW / IVF 结构" },
        { label: "查询向量", desc: "问题 → 向量" },
        { label: "近似检索", desc: "快速定位候选区" },
        { label: "Top-K 结果", desc: "返回最相似片段" },
      ],
    },
    compare: [
      {
        concept: "传统数据库",
        tagline: "精确匹配为主",
        bullets: ["按字段 / 关键词查询", "对向量只能暴力扫", "无相似度语义"],
      },
      {
        concept: "向量数据库",
        tagline: "语义相似检索",
        bullets: ["存向量 + 建索引", "近似最近邻毫秒级", "RAG 的标准底座"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "vd-1",
        type: "single",
        question: "向量数据库解决的核心问题是？",
        options: ["存储文档原文", "在海量向量中快速找 Top-K 相似", "生成文本回复", "管理用户账号"],
        answer: 1,
        explanation: "用索引结构加速近似最近邻检索。",
      },
      {
        id: "vd-2",
        type: "judge",
        question: "判断正误：",
        statement: "HNSW 这类索引结构追求的是「近似」最近邻——略微牺牲精度换取数量级的速度。",
        answer: true,
        explanation: "ANN 检索本身就是精度与速度的权衡。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么 RAG 需要向量数据库？「近似最近邻检索」是什么意思？",
      hint: "从 O(N) 暴力比对太慢出发，说明索引加速与精度/速度权衡。",
      keywords: ["向量", "索引", "近似", "检索", "Top-K", "相似", "速度", "HNSW", "最近邻", "海量"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 3. Retrieval（检索召回）
  // ===========================================================================
  {
    id: "retrieval",
    name: "Retrieval 召回",
    world: "rag-valley",
    type: "main",
    difficulty: 2,
    minutes: 8,
    summary: "把用户问题向量化，从向量库召回最相关的文档片段，作为模型的「参考资料」。",
    icon: "🎣",
    color: "teal",
    prerequisites: ["vector-db"],
    related: ["bm25", "hybrid-search", "top-k"],
    unlocks: ["rag-boss", "rerank", "citation"],
    pos: { x: 480, y: 560 },
    encounter: {
      scenario:
        "用户问：「合同里关于违约金是怎么约定的？」\n\n你的向量库里有 100 万块文档碎片。系统要把这个问题变成向量，去库里找出最相关的 5 块，拼进提示词，模型再回答。\n\n但问题来了：如果召回的第 1 名和第 2 名根本不在同一份合同里，模型的答案就会「张冠李戴」。检索召回的质量，直接决定了 RAG 答案的上限。",
      prompt: "召回环节的好坏，为什么直接决定了整个 RAG 回答的上限？",
    },
    learn: {
      what: "检索（Retrieval）是把用户问题向量化后，在向量库中召回 Top-K 最相关文档片段，注入上下文供模型参考。",
      why: "模型不知道私有知识，也没有实时资料；必须先把相关资料「捞出来」再回答。",
      problem: "如何在合理延迟内，从海量片段中捞出真正相关的那几条。",
      mechanism:
        "问题向量与库中向量算相似度取 Top-K；进阶用混合检索：向量检索（语义）+ BM25（关键词精确匹配）互补，兼顾语义与专有名词。",
      flow: [
        { label: "用户问题", desc: "「违约金怎么算？」" },
        { label: "向量化", desc: "问题 → 查询向量" },
        { label: "相似度检索", desc: "Top-K 候选" },
        { label: "混合检索", desc: "向量 + BM25 互补" },
        { label: "注入上下文", desc: "参考资料进提示词" },
      ],
    },
    compare: [
      {
        concept: "纯向量检索",
        tagline: "只讲语义",
        bullets: ["同义改写也能命中", "专有名词 / 编号易偏", "召回偏「意会」"],
      },
      {
        concept: "混合检索",
        tagline: "语义 + 关键词",
        bullets: ["向量抓语义相似", "BM25 抓精确匹配", "企业场景更稳"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "rt-1",
        type: "single",
        question: "「Garbage in, garbage out」在 RAG 中指的是？",
        options: ["模型太笨", "检索召回质量差 → 模型答案必然差", "向量库容量不够", "提示词太长"],
        answer: 1,
        explanation: "召回是 RAG 的输入环节，召回质量决定答案上限。",
      },
      {
        id: "rt-2",
        type: "judge",
        question: "判断正误：",
        statement: "混合检索同时使用向量相似度与关键词匹配，可以兼顾语义相关与专有名词精确命中。",
        answer: true,
        explanation: "向量 + BM25 互补是生产 RAG 的常见做法。",
      },
    ],
    final: {
      question: "用你自己的话解释：检索召回在 RAG 中扮演什么角色？为什么说它的质量决定了答案的上限？",
      hint: "从「模型不知道私有知识」出发，说明召回即输入，输入差则输出差；再提混合检索。",
      keywords: ["检索", "召回", "向量", "相似", "Top-K", "上下文", "注入", "上限", "质量", "混合"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 4. Rerank（重排序）— 支线
  // ===========================================================================
  {
    id: "rerank",
    name: "Rerank 重排",
    world: "rag-valley",
    type: "branch",
    difficulty: 2,
    minutes: 7,
    summary: "向量检索快但粗——再用更强模型对候选精排，把真正相关的排前面。",
    icon: "🔀",
    color: "cyan",
    prerequisites: ["retrieval"],
    related: ["two-stage", "cross-encoder"],
    unlocks: [],
    pos: { x: 200, y: 690 },
    encounter: {
      scenario:
        "向量检索召回了 Top-10 文档块，你扫了一眼：真正相关的可能只有 3 条，剩下 7 条都是「看起来像」的噪音。\n\n直接把 10 条全塞给模型？噪音会让答案跑偏。只取前 3 条？可能恰恰把真正相关的那条排在后面漏掉了。\n\n你需要一道「精筛」工序：把召回的候选再认真地排一遍序。",
      prompt: "粗召回之后，如何把「真正相关」的几条挑出来？",
    },
    learn: {
      what: "重排序（Rerank）是检索的第二阶段：用更强的模型对粗召回候选逐条打分，重新精排，只取真正相关的 Top-K。",
      why: "向量检索（ANN）快但近似，粗召回结果含较多噪音；直接注入会稀释上下文。",
      problem: "如何在保持整体速度的前提下，提升最终注入内容的相关度。",
      mechanism:
        "两阶段架构：第一阶段向量粗召回（快、候选多）→ 第二阶段 Rerank 模型对「问题-片段」逐对精算相关度（慢、准）→ 只保留精排 Top-K 注入提示词。",
      flow: [
        { label: "粗召回", desc: "向量检索 Top-50" },
        { label: "候选集", desc: "含噪音" },
        { label: "Rerank 打分", desc: "逐条精算相关度" },
        { label: "精排 Top-K", desc: "取真正相关的" },
        { label: "注入提示词", desc: "高质量上下文" },
      ],
    },
    compare: [
      {
        concept: "单阶段检索",
        tagline: "一步到位",
        bullets: ["快但召回粗", "噪音直接进提示词", "精度上限低"],
      },
      {
        concept: "召回 + 重排",
        tagline: "粗筛 + 精排",
        bullets: ["向量快筛候选", "Rerank 精排", "质量显著提升"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "rr-1",
        type: "single",
        question: "两阶段检索中，Rerank 阶段的作用是？",
        options: ["把文档向量化", "对粗召回候选精排，剔除噪音", "切分文档", "生成最终回答"],
        answer: 1,
        explanation: "Rerank 对候选逐条精算相关度，只保留真正相关的。",
      },
      {
        id: "rr-2",
        type: "judge",
        question: "判断正误：",
        statement: "Rerank 模型比向量检索更慢但更准，所以放在候选集较小、对精度要求高的阶段。",
        answer: true,
        explanation: "先粗召回缩小范围，再精排，兼顾速度与精度。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么生产级 RAG 常用「召回 + 重排」两阶段架构？",
      hint: "从粗召回快而粗、精排准而慢出发，说明两阶段如何兼顾速度与精度。",
      keywords: ["召回", "重排", "两阶段", "候选", "精排", "噪音", "相关", "速度", "精度", "Top-K"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 5. Citation（引用溯源）— 支线
  // ===========================================================================
  {
    id: "citation",
    name: "引用溯源",
    world: "rag-valley",
    type: "branch",
    difficulty: 2,
    minutes: 7,
    summary: "让模型在回答时标注证据来源——答案「有据可查」，幻觉无处藏身。",
    icon: "📎",
    color: "cyan",
    prerequisites: ["retrieval"],
    related: ["grounding", "hallucination", "traceability"],
    unlocks: [],
    pos: { x: 760, y: 690 },
    encounter: {
      scenario:
        "法务问你：「机器人说『离职员工竞业限制期 6 个月』——这是哪一条规定的？把出处给我。」\n\n如果机器人答不上来，或者随便指了一个无关条款，这个系统在法务眼里就永远失去了信用。\n\n企业场景里，「谁说的」和「说得对不对」同样重要。",
      prompt: "怎么让模型的答案能「指回」原始资料，做到可核查？",
    },
    learn: {
      what: "引用溯源是让模型在回答中标注信息来源（如 [来源 3]），并保证引用真实存在、可回溯到原文。",
      why: "LLM 生成可能幻觉；企业、法律、医疗场景要求结论可核查。",
      problem: "如何降低「编造来源」的风险，让答案有据可查。",
      mechanism:
        "检索片段携带来源 ID → 提示要求引用时标注 [来源 i] → 系统在注入前校验引用 ID 是否真实存在 → 无证据时模型应拒绝回答而非编造。",
      flow: [
        { label: "检索片段", desc: "每块带来源 ID" },
        { label: "模型生成", desc: "回答时标注 [来源 i]" },
        { label: "引用校验", desc: "校验 ID 真实存在" },
        { label: "可回溯", desc: "点击跳到原文" },
        { label: "无据拒答", desc: "宁可不答也不编" },
      ],
    },
    compare: [
      {
        concept: "无引用回答",
        tagline: "说了就算",
        bullets: ["无法验证真伪", "幻觉难以发现", "高风险场景不可用"],
      },
      {
        concept: "带引用回答",
        tagline: "有据可查",
        bullets: ["结论可回溯原文", "幻觉可被校验拦截", "企业场景信任基础"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "ct-1",
        type: "single",
        question: "引用溯源最核心的价值是？",
        options: ["让回答更简洁", "让结论可核查、缓解幻觉", "减少 Token 消耗", "加快检索速度"],
        answer: 1,
        explanation: "可核查性是缓解幻觉、建立信任的关键。",
      },
      {
        id: "ct-2",
        type: "judge",
        question: "判断正误：",
        statement: "当检索结果中没有相关证据时，带引用机制的 RAG 系统应该让模型「编一个合理来源」。",
        answer: false,
        explanation: "正确做法是拒绝回答或明确说明缺乏依据，而非编造来源。",
      },
    ],
    final: {
      question: "用你自己的话解释：引用溯源如何帮助缓解 RAG 的幻觉问题？",
      hint: "从「来源 ID 标注 → 引用校验 → 无据拒答」说明可核查机制如何拦截编造。",
      keywords: ["引用", "来源", "溯源", "校验", "核查", "幻觉", "证据", "原文", "拒答", "可回溯"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 6. Boss：Grounded Generation（有据生成）
  // ===========================================================================
  {
    id: "rag-boss",
    name: "Grounded 生成",
    world: "rag-valley",
    type: "boss",
    difficulty: 4,
    minutes: 12,
    summary: "打通切分 → 向量化 → 检索 → 重排 → 带引用生成的完整 RAG 流水线。",
    icon: "🏞️",
    color: "teal",
    prerequisites: ["retrieval"],
    related: ["chunking", "vector-db", "rerank", "citation", "llm-village"],
    unlocks: [],
    pos: { x: 480, y: 1330 },
    encounter: {
      scenario:
        "老板说：「给公司搭一个内部文档问答助手，要能引用出处。」\n\n你懂的每个环节：切分、向量化、检索、重排、引用。但你意识到，真正的难点在于把这些环节「串」成一条稳定流水线——任何一个环节的缺陷，都会在最终答案上放大。",
      prompt: "把 RAG 的每一个环节串起来：从「用户提问」到「带引用的回答」，中间发生了什么？",
    },
    learn: {
      what: "Grounded Generation（有据生成）是把「检索证据」和「生成回答」绑定：模型只能基于检索到的资料回答，并标注来源；没有证据就拒绝。",
      why: "纯 LLM 回答会幻觉；纯检索不生成；RAG 把两者结合，让每个结论都「长在证据上」。",
      problem: "如何让回答既准确、又基于私有资料、还可溯源。",
      mechanism:
        "完整链路：文档切分 → 向量入库 → 问题检索 →（重排）→ 带来源的片段注入上下文 → 提示约束「仅基于资料回答 + 标注引用 + 无据拒答」。",
      flow: [
        { label: "文档切分", desc: "语义块 + 来源 ID" },
        { label: "向量入库", desc: "建索引" },
        { label: "问题检索", desc: "召回 + 重排" },
        { label: "证据注入", desc: "带引用的片段" },
        { label: "有据生成", desc: "回答 + 引用 + 拒答" },
      ],
    },
    compare: [
      {
        concept: "纯 LLM 回答",
        tagline: "无中生有",
        bullets: ["知识有截止时间", "不知道你的私有资料", "容易幻觉"],
      },
      {
        concept: "RAG 有据生成",
        tagline: "证据驱动",
        bullets: ["基于实时检索的资料", "答案可溯源", "无据可拒答"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "rb-1",
        type: "order",
        question: "把 RAG 完整流水线排序：",
        items: ["文档切分并向量化入库", "用户问题向量化", "检索召回候选片段", "Rerank 精排取 Top-K", "模型基于证据带引用生成"],
        answer: ["文档切分并向量化入库", "用户问题向量化", "检索召回候选片段", "Rerank 精排取 Top-K", "模型基于证据带引用生成"],
        explanation: "入库 → 检索 → 精排 → 生成，环环相扣。",
      },
      {
        id: "rb-2",
        type: "single",
        question: "RAG 中「Grounding（有据）」最关键的行为约束是？",
        options: ["模型必须逐字复述资料", "模型只能基于检索证据回答，无据则拒答", "模型必须输出 JSON", "模型必须引用全部文档"],
        answer: 1,
        explanation: "有据生成的核心是证据约束：无证据宁可拒答。",
      },
    ],
    final: {
      question: "你已到达 RAG 山谷尽头。请用自己的话完整描述：一条生产级 RAG 流水线包含哪些环节？每个环节分别解决什么问题？",
      hint: "覆盖切分、向量化、检索、重排、引用、无据拒答，并说明如何缓解幻觉。",
      keywords: ["切分", "向量", "检索", "召回", "重排", "引用", "证据", "生成", "幻觉", "拒答", "溯源", "流水线"],
      passRate: 0.6,
    },
  },
];

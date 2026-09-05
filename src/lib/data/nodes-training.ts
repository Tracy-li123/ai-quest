import type { KnowledgeNode } from "../types";

// ---------------------------------------------------------------------------
// 模型训练工坊 — 知识节点数据
//
// 主线（大节点）：training-data → pretraining → sft → rlhf → workshop-boss
// 支线（小节点）：quantization（预训练后分叉）/ eval（微调后分叉）
// ---------------------------------------------------------------------------

export const TRAINING_WORKSHOP_NODES: KnowledgeNode[] = [
  // ===========================================================================
  // 1. 训练数据
  // ===========================================================================
  {
    id: "training-data",
    name: "训练数据",
    world: "training-workshop",
    type: "main",
    difficulty: 1,
    minutes: 6,
    summary: "模型的「教材」：海量文本教会模型语言规律与知识，数据质量决定能力上限。",
    icon: "📚",
    color: "violet",
    prerequisites: [],
    related: ["corpus", "token", "data-quality"],
    unlocks: ["pretraining"],
    pos: { x: 480, y: 110 },
    encounter: {
      scenario:
        "一个模型从没上过学，但它能用中文写诗、用 Python 写爬虫、解释量子力学——它怎么学会的？\n\n因为它「读」过的文本比任何人类一辈子读的都多：网页、书籍、论文、代码，加起来几万亿个 Token。\n\n但这里藏着一个残酷的事实：如果喂给它的数据全是垃圾营销文案，它学出来的就是「垃圾语言的规律」。",
      prompt: "如果模型的智能来自数据，那么数据的质量与规模哪个更重要？",
    },
    learn: {
      what: "训练数据是模型的「教材」——预训练用海量无标注文本教会模型语言规律与事实知识，数据的规模与质量共同决定模型能力上限。",
      why: "神经网络不携带先天知识，一切能力都来自数据中统计规律的学习。",
      problem: "如何在有限成本内获得规模足够大、质量足够高、多样性足够好的数据。",
      mechanism:
        "采集网页 / 书籍 / 代码等语料 → 清洗（去广告、去垃圾）→ 去重（降低记忆噪音）→ 按领域配比混合 → 切 Token 后送入训练。",
      flow: [
        { label: "语料收集", desc: "网页 / 书籍 / 代码" },
        { label: "清洗过滤", desc: "去广告、去垃圾" },
        { label: "去重", desc: "降低记忆噪音" },
        { label: "配比混合", desc: "领域比例调度" },
        { label: "训练", desc: "喂给模型学习" },
      ],
    },
    compare: [
      {
        concept: "规模为王",
        tagline: "多多益善",
        bullets: ["更多数据 = 更强泛化", "成本线性上升", "垃圾数据多则噪音大"],
      },
      {
        concept: "质量为王",
        tagline: "精挑细选",
        bullets: ["高质量数据效率高", "覆盖不全则偏科", "规模上不去则上限低"],
      },
      {
        concept: "规模 + 质量",
        tagline: "工程平衡",
        bullets: ["大规模 + 严格清洗", "按领域配比", "现代大模型的做法"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "td-1",
        type: "single",
        question: "训练数据对模型的影响最准确的说法是？",
        options: ["只影响训练速度", "决定模型能力的上限", "只影响推理时的速度", "与模型无关"],
        answer: 1,
        explanation: "模型能力来自数据中的统计规律，数据决定能力边界。",
      },
      {
        id: "td-2",
        type: "judge",
        question: "判断正误：",
        statement: "训练数据必须去重，否则模型可能「死记硬背」重复内容、降低泛化能力。",
        answer: true,
        explanation: "重复数据会强化记忆而非理解，削弱泛化。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么说「模型的智能上限由训练数据决定」？数据准备通常做哪些事？",
      hint: "从统计学习出发，说明采集、清洗、去重、配比四个环节的意义。",
      keywords: ["数据", "规模", "质量", "清洗", "去重", "配比", "语料", "上限", "泛化", "统计"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 2. 预训练
  // ===========================================================================
  {
    id: "pretraining",
    name: "预训练",
    world: "training-workshop",
    type: "main",
    difficulty: 2,
    minutes: 8,
    summary: "用万亿 Token 做「下一词预测」：模型在这阶段学会语言、知识与推理的基础能力。",
    icon: "🏋️",
    color: "violet",
    prerequisites: ["training-data"],
    related: ["next-token", "self-supervised", "scaling"],
    unlocks: ["sft", "quantization"],
    pos: { x: 480, y: 330 },
    encounter: {
      scenario:
        "想象一个「婴儿」模型，它被关进装满文字的房间里，唯一的任务是：看到前面的文字，猜下一个字。\n\n它猜错了几万亿次，也改进了几万亿次。几个月后，它惊讶地发现：自己学会了语法、常识、甚至逻辑推理——尽管从来没有人「教」过它。\n\n这就是预训练：用最朴素的任务，从无限的数据中学到最广阔的能力。",
      prompt: "为什么「猜下一个词」这么简单的任务，能学出如此复杂的能力？",
    },
    learn: {
      what: "预训练（Pre-training）是用海量无标注文本，以「预测下一个 Token」为任务训练模型，让模型学到语言规律与基础知识。",
      why: "无标注数据近乎无限，且「下一词预测」自带监督信号，无需人工标注。",
      problem: "如何在千亿参数、万亿 Token 的规模下稳定高效地训练出通用能力。",
      mechanism:
        "自监督学习：给定前文预测下一个词，预测错了就反向传播更新参数。模型规模、数据规模与训练量遵循「规模法则」——越大通常越强。",
      flow: [
        { label: "初始化", desc: "随机参数" },
        { label: "数据批次", desc: "万亿 Token 流" },
        { label: "前向预测", desc: "猜下一个词" },
        { label: "反向更新", desc: "对比正确答案" },
        { label: "多轮迭代", desc: "能力逐步涌现" },
      ],
    },
    compare: [
      {
        concept: "监督学习",
        tagline: "要人工标注",
        bullets: ["每个样本带标签", "数据贵、规模有限", "任务定向"],
      },
      {
        concept: "自监督预训练",
        tagline: "标签自己来",
        bullets: ["「下一个词」就是标签", "数据近乎无限", "学到通用能力"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "pt-1",
        type: "single",
        question: "预训练阶段的核心任务是？",
        options: ["让模型学会遵循指令", "预测下一个 Token", "对输出做安全过滤", "压缩模型体积"],
        answer: 1,
        explanation: "下一 Token 预测是预训练的核心自监督任务。",
      },
      {
        id: "pt-2",
        type: "judge",
        question: "判断正误：",
        statement: "预训练不需要人工标注，因为「文本本身的下一个词」就是天然的监督信号。",
        answer: true,
        explanation: "自监督的特性让预训练可以吃下近乎无限的文本。",
      },
    ],
    final: {
      question: "用你自己的话解释：预训练是怎么「自学成才」的？「规模法则」又暗示了什么？",
      hint: "从下一 Token 预测的自监督机制出发，说明规模、数据、算力与能力的正相关。",
      keywords: ["预测", "下一个", "自监督", "无标注", "数据", "规模", "参数", "能力", "通用", "迭代"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 3. SFT（监督微调）
  // ===========================================================================
  {
    id: "sft",
    name: "SFT 监督微调",
    world: "training-workshop",
    type: "main",
    difficulty: 2,
    minutes: 8,
    summary: "用「指令-回答」示例教模型好好说话：从「续写机器」变成「听话助手」。",
    icon: "🎓",
    color: "violet",
    prerequisites: ["pretraining"],
    related: ["instruction-tuning", "fine-tuning", "dialog"],
    unlocks: ["rlhf", "eval"],
    pos: { x: 480, y: 560 },
    encounter: {
      scenario:
        "预训练模型极其博学，但它不会好好回答问题。你问它「2 加 2 等于几」，它可能回复：\n\n「2 加 2 是一个数学运算。在十进制体系中，当两个自然数 2 与 2 相加时……」（洋洋洒洒 500 字，就是不说等于 4）\n\n它不是在装傻，它只是「只会续写，不会对话」。要让模型变成能用的助手，还需要一次「礼仪培训」。",
      prompt: "怎么把「会续写的模型」训练成「会对话的助手」？",
    },
    learn: {
      what: "监督微调（SFT）用高质量「指令-回答」对数据训练模型，让它学会遵循指令、理解对话格式、给出简洁直接的答案。",
      why: "预训练目标（续写）与使用场景（对话）不一致，需要数据对齐到真实用法。",
      problem: "如何让模型从「续写文本」转变为「理解指令并按要求作答」。",
      mechanism:
        "构造对话模板（system / user / assistant），用人类或强模型生成的优质「指令-回答」对做监督训练，微调全部或部分参数。",
      flow: [
        { label: "指令数据", desc: "高质量问答对" },
        { label: "对话模板", desc: "system / user / assistant" },
        { label: "监督训练", desc: "学习回答模式" },
        { label: "行为对齐", desc: "遵循指令、简洁回答" },
        { label: "评估", desc: "检查对话质量" },
      ],
    },
    compare: [
      {
        concept: "预训练",
        tagline: "学会「续写」",
        bullets: ["目标是猜下一个词", "博学但不会对话", "零样本体验差"],
      },
      {
        concept: "SFT",
        tagline: "学会「应答」",
        bullets: ["模仿高质量问答", "遵循指令与格式", "对话体验质变"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "sf-1",
        type: "single",
        question: "SFT 最核心的训练数据形式是？",
        options: ["无标注的网页文本", "「指令-回答」对", "用户点击记录", "图像标注框"],
        answer: 1,
        explanation: "SFT 用指令-回答对做监督学习，教会模型应答模式。",
      },
      {
        id: "sf-2",
        type: "judge",
        question: "判断正误：",
        statement: "SFT 之后模型就能完全避免输出有害内容。",
        answer: false,
        explanation: "SFT 主要解决「会不会听话」，安全对齐还需 RLHF 等后续环节。",
      },
    ],
    final: {
      question: "用你自己的话解释：SFT 解决了预训练模型的什么问题？它的训练数据长什么样？",
      hint: "从「续写 vs 对话」的差异出发，说明指令-回答对与对话模板的作用。",
      keywords: ["指令", "回答", "对话", "微调", "示例", "模板", "遵循", "格式", "预训练", "监督"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 4. RLHF（人类反馈强化学习）
  // ===========================================================================
  {
    id: "rlhf",
    name: "RLHF 对齐",
    world: "training-workshop",
    type: "main",
    difficulty: 3,
    minutes: 9,
    summary: "用人类「哪个回答更好」的偏好训练奖励模型，再强化学习优化策略。",
    icon: "🏆",
    color: "violet",
    prerequisites: ["sft"],
    related: ["reward-model", "ppo", "preference"],
    unlocks: ["workshop-boss"],
    pos: { x: 480, y: 800 },
    encounter: {
      scenario:
        "SFT 之后，模型很听话了，但它给出的回答常常「正确但不用心」：\n\n问它「我该不该辞职创业？」它列了 12 条利弊，每条都对，但读起来像机器人念说明书。\n\n而另一个回答：「先看你是否有 6 个月的生活费——这是最重要的前提。有，可以认真评估；没有，建议再等等。」同样正确，却更有温度。\n\n「对错」是 SFT 能教的，「好坏」却需要人的偏好来判断。",
      prompt: "怎么把「人类觉得哪个回答更好」这种主观偏好，教给模型？",
    },
    learn: {
      what: "RLHF（基于人类反馈的强化学习）先收集人类对多个回答的偏好排序，训练奖励模型打分，再用强化学习让模型学会输出高分回答。",
      why: "SFT 只能模仿示例，无法表达「回答 A 比回答 B 更好」的相对偏好，而后者正是体验差异的来源。",
      problem: "如何把主观的人类偏好系统性地注入模型。",
      mechanism:
        "三步：① 采样多个回答，让人工排序 → ② 用排序数据训练奖励模型（打分手）→ ③ 用强化学习（如 PPO / DPO）以奖励为信号优化策略模型。",
      flow: [
        { label: "采样回答", desc: "同一问题多个回答" },
        { label: "人类排序", desc: "哪个更好" },
        { label: "训练奖励模型", desc: "学会打分" },
        { label: "强化学习", desc: "以奖励优化策略" },
        { label: "策略更新", desc: "输出更讨喜" },
      ],
    },
    compare: [
      {
        concept: "SFT",
        tagline: "模仿示例",
        bullets: ["学习「标准答案」", "只能表达对/错", "无法表达好坏偏好"],
      },
      {
        concept: "RLHF",
        tagline: "偏好优化",
        bullets: ["学习「哪个更好」", "奖励模型打分", "让输出更符合人类偏好"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "rh-1",
        type: "order",
        question: "把 RLHF 的流程排序：",
        items: ["采样同一问题的多个回答", "人类对回答排序", "训练奖励模型", "用强化学习优化策略模型"],
        answer: ["采样同一问题的多个回答", "人类对回答排序", "训练奖励模型", "用强化学习优化策略模型"],
        explanation: "数据 → 奖励模型 → 策略优化，是 RLHF 的三步标准流程。",
      },
      {
        id: "rh-2",
        type: "single",
        question: "奖励模型（Reward Model）的作用是？",
        options: ["生成回答", "为模型回答打「好坏分」", "切分文档", "压缩模型"],
        answer: 1,
        explanation: "奖励模型学会人类偏好，为策略优化提供信号。",
      },
    ],
    final: {
      question: "用你自己的话解释：RLHF 解决什么问题是 SFT 解决不了的？它的三步流程是什么？",
      hint: "从「对错 vs 偏好」出发，说明排序数据 → 奖励模型 → 强化学习。",
      keywords: ["偏好", "奖励", "排序", "强化学习", "人类反馈", "打分", "策略", "优化", "有用", "对齐"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 5. 模型评估 — 支线
  // ===========================================================================
  {
    id: "eval",
    name: "模型评估",
    world: "training-workshop",
    type: "branch",
    difficulty: 2,
    minutes: 7,
    summary: "用基准数据集与指标给模型做「体检」——没有评测，一切迭代都是盲改。",
    icon: "📊",
    color: "fuchsia",
    prerequisites: ["sft"],
    related: ["benchmark", "mmlu", "regression"],
    unlocks: [],
    pos: { x: 200, y: 690 },
    encounter: {
      scenario:
        "你用新数据微调了模型，同事问：「变好了还是变差了？」\n\n你答：「感觉更聪明了。」\n\n「感觉」在训练工程里一文不值。如果这次微调让代码能力提升了、却让数学能力退步了，你靠感觉根本发现不了。\n\n没有评测，训练就是蒙着眼开车。",
      prompt: "怎么科学地回答「这个模型到底变好了还是变差了」？",
    },
    learn: {
      what: "模型评估（Eval）是用标准基准数据集与指标，系统衡量模型在知识、推理、代码、安全等多维度的表现。",
      why: "主观感受无法量化、无法对比；迭代必须建立在可复现的指标上。",
      problem: "如何客观判断一次改动带来的提升或退化。",
      mechanism:
        "选基准（如 MMLU、GSM8K、HumanEval）→ 运行评测 → 统计指标（准确率 / 胜率）→ 与基线对比 → 全量回归测试防「偏科退化」。",
      flow: [
        { label: "选定基准", desc: "MMLU / GSM8K 等" },
        { label: "运行评测", desc: "大规模跑题" },
        { label: "统计指标", desc: "准确率 / 胜率" },
        { label: "对比基线", desc: "前后差异" },
        { label: "回归测试", desc: "防能力退化" },
      ],
    },
    compare: [
      {
        concept: "主观感受",
        tagline: "拍脑袋",
        bullets: ["不可量化", "不可复现", "无法定位退化"],
      },
      {
        concept: "量化评测",
        tagline: "拿数据说话",
        bullets: ["多维指标可对比", "可复现可追踪", "发现隐性退化"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "ev-1",
        type: "single",
        question: "「回归测试」在模型评估中的含义是？",
        options: ["降低模型体积", "确认新改动没有让其他能力退化", "加快推理速度", "增加训练数据"],
        answer: 1,
        explanation: "回归测试防止「修好 A、弄坏 B」的偏科退化。",
      },
      {
        id: "ev-2",
        type: "judge",
        question: "判断正误：",
        statement: "评测基准越单一越好，这样指标更有针对性。",
        answer: false,
        explanation: "单一基准会掩盖其他维度的退化，需要多维覆盖。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么模型迭代离不开评测？评测如何防止「顾此失彼」？",
      hint: "从「不可量化就无法迭代」出发，说明多维基准 + 基线对比 + 回归测试。",
      keywords: ["评测", "基准", "指标", "量化", "对比", "基线", "回归", "退化", "多维", "可复现"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 6. 量化与推理 — 支线
  // ===========================================================================
  {
    id: "quantization",
    name: "量化推理",
    world: "training-workshop",
    type: "branch",
    difficulty: 3,
    minutes: 8,
    summary: "把权重从 FP16 压到 INT4：显存暴降、推理提速，用少量精度换工程可用性。",
    icon: "⚡",
    color: "fuchsia",
    prerequisites: ["pretraining"],
    related: ["int8", "int4", "gptq", "llama.cpp"],
    unlocks: [],
    pos: { x: 760, y: 440 },
    encounter: {
      scenario:
        "你微调完一个 700 亿参数的模型，兴冲冲要部署。一算账：FP16 权重就要 140GB 显存，一张 H100（80GB）都装不下，更别提还有 KV 缓存。\n\n但同样的模型量化到 4-bit，权重只要 35GB——一张卡就能跑，速度还更快。\n\n精度损失一点点，工程可行性天壤之别。",
      prompt: "怎么在「少占显存、跑得快」和「保持效果」之间找到平衡？",
    },
    learn: {
      what: "量化（Quantization）是把模型权重与激活从高精度浮点（FP16/BF16）压缩到低精度整数（INT8/INT4），降低显存占用、加速推理。",
      why: "推理成本与显存是部署的核心瓶颈，而绝大多数权重并不需要那么高的精度。",
      problem: "如何在压缩精度的同时最小化效果损失。",
      mechanism:
        "用校准数据统计权重分布，把浮点值映射到低精度整数范围；部分方法按敏感度只量化非关键层；推理时反量化计算。",
      flow: [
        { label: "权重分析", desc: "统计分布与敏感度" },
        { label: "校准", desc: "用样本确定映射" },
        { label: "量化映射", desc: "FP16 → INT4" },
        { label: "低精度推理", desc: "显存降、速度升" },
        { label: "效果对比", desc: "权衡取舍" },
      ],
    },
    compare: [
      {
        concept: "全精度 FP16",
        tagline: "满血但重",
        bullets: ["效果最佳", "显存与成本最高", "大模型难部署"],
      },
      {
        concept: "量化 INT4/INT8",
        tagline: "轻装上阵",
        bullets: ["显存暴降 4-8 倍", "推理加速", "少量精度损失"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "qn-1",
        type: "single",
        question: "模型量化最直接的好处是？",
        options: ["提升模型准确率", "降低显存占用、加速推理", "增加训练数据", "扩大上下文窗口"],
        answer: 1,
        explanation: "低精度权重更省显存、计算更快，代价是少量效果损失。",
      },
      {
        id: "qn-2",
        type: "judge",
        question: "判断正误：",
        statement: "量化之后的模型效果一定明显下降，无法用于生产。",
        answer: false,
        explanation: "现代量化方法（如 GPTQ、AWQ）损失很小，生产环境广泛使用。",
      },
    ],
    final: {
      question: "用你自己的话解释：量化是什么？为什么说它是「用少量精度换工程可用性」？",
      hint: "从显存与成本瓶颈出发，说明高精度到低精度的映射与效果/成本权衡。",
      keywords: ["量化", "精度", "权重", "显存", "成本", "推理", "加速", "INT4", "映射", "权衡"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 7. Boss：对齐（Alignment）
  // ===========================================================================
  {
    id: "workshop-boss",
    name: "对齐 Alignment",
    world: "training-workshop",
    type: "boss",
    difficulty: 4,
    minutes: 12,
    summary: "训练链路的终极目标：让模型的能力与人类的意图、价值观对齐——有用、安全、诚实。",
    icon: "🎯",
    color: "violet",
    prerequisites: ["rlhf"],
    related: ["training-data", "pretraining", "sft", "rlhf", "eval"],
    unlocks: [],
    pos: { x: 480, y: 1330 },
    encounter: {
      scenario:
        "你负责训练一个模型。预训练给了它「能力」，SFT 给了它「礼貌」，RLHF 给了它「偏好」。但站在交付前夜，你问自己一个问题：\n\n这个模型想要什么？\n\n它不想要任何东西——但它的输出会被人信任、被人采用。如果它编造事实、给出危险建议、或者悄悄被恶意指令操控，责任就在训练它的人身上。\n\n「让模型做对人类有用、安全、诚实的事」——这件事的工程名叫对齐。",
      prompt: "能力、礼貌、偏好都齐了，为什么「对齐」仍然是训练中最难的部分？",
    },
    learn: {
      what: "对齐（Alignment）是训练链路的最终目标：通过数据、微调与反馈，让模型输出符合人类意图与价值观——有用、安全、诚实。",
      why: "模型能力越强，误用与滥用的代价越大；不对齐的强大模型是危险的。",
      problem: "如何系统性地把「人类想要的」从数据一路注入到模型行为。",
      mechanism:
        "分层对齐：预训练数据教知识（基础）→ SFT 教对话格式（行为）→ RLHF 教偏好（价值）→ 评测与红队测试验安全（验证）→ 持续迭代。",
      flow: [
        { label: "预训练", desc: "教知识与语言" },
        { label: "SFT", desc: "教对话与指令" },
        { label: "RLHF", desc: "教偏好与价值" },
        { label: "评测", desc: "验证多维能力" },
        { label: "红队迭代", desc: "找漏洞再对齐" },
      ],
    },
    compare: [
      {
        concept: "能力（Capability）",
        tagline: "能不能做到",
        bullets: ["由预训练决定", "追求上限", "与安全无关"],
      },
      {
        concept: "对齐（Alignment）",
        tagline: "该不该这样做",
        bullets: ["由微调与反馈决定", "追求安全有用诚实", "能力越大越关键"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "wb-1",
        type: "order",
        question: "把训练链路按「从能力到对齐」的正确顺序排序：",
        items: ["预训练", "SFT 监督微调", "RLHF 偏好优化", "评测与安全验证"],
        answer: ["预训练", "SFT 监督微调", "RLHF 偏好优化", "评测与安全验证"],
        explanation: "能力 → 行为 → 价值 → 验证，层层递进。",
      },
      {
        id: "wb-2",
        type: "single",
        question: "「对齐」关心的核心问题是？",
        options: ["模型有多大", "模型输出是否符合人类意图与价值观", "训练要多久", "推理有多快"],
        answer: 1,
        explanation: "对齐 = 让模型有用、安全、诚实。",
      },
    ],
    final: {
      question: "你已走完模型训练工坊。请用自己的话完整解释：一条从「数据到可用模型」的训练链路包含哪些环节？每个环节如何为「对齐」服务？",
      hint: "覆盖预训练、SFT、RLHF、评测四个环节，并说明能力与对齐的区别。",
      keywords: ["预训练", "微调", "SFT", "RLHF", "偏好", "对齐", "评测", "安全", "有用", "诚实", "意图", "价值观"],
      passRate: 0.6,
    },
  },
];

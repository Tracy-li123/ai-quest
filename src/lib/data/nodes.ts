import type { KnowledgeNode } from "../types";

// ---------------------------------------------------------------------------
// Agent 城 — 知识节点数据（第一版）
//
// 地图、解锁关系、关卡内容全部由这份数据驱动。
// 未来新增知识点：在这里追加一条记录即可，无需改动任何页面组件。
//
// 主线（大节点）：tool-calling → react → agent-loop → memory → computer-use
//                 → coding-agent → harness(boss)
// 支线（小节点）：planning / reflection（在 agent-loop 后分叉）
//                 mcp / skills（在 memory 后分叉）
// ---------------------------------------------------------------------------

export const AGENT_CITY_NODES: KnowledgeNode[] = [
  // ===========================================================================
  // 1. Tool Calling
  // ===========================================================================
  {
    id: "tool-calling",
    name: "Tool Calling",
    world: "agent-city",
    type: "main",
    difficulty: 1,
    minutes: 8,
    summary: "让模型输出结构化的「工具调用」，由外部系统执行并回传结果，突破纯文本的边界。",
    icon: "🔧",
    color: "sky",
    prerequisites: [],
    related: ["function-calling", "json-mode", "structured-output"],
    unlocks: ["react"],
    pos: { x: 480, y: 90 },
    encounter: {
      scenario:
        "你想让助手帮你查一下明天深圳飞北京的机票价格。助手很有礼貌地回复：「抱歉，我无法访问实时航班数据。」\n\n它明明很聪明，为什么连查个机票都做不到？因为大语言模型本质上只是一个「文本生成器」——它只能输出文字，没有手去点网页，没有权限去调 API，也没有时钟告诉你现在几点。",
      prompt: "如果你的助手只能输出文字，它要怎么才能帮你订机票、查股价、发一条真实的消息？",
    },
    learn: {
      what: "Tool Calling（工具调用 / Function Calling）是一种机制：模型输出一个结构化的「调用请求」（工具名 + 参数），由宿主程序执行真实函数，再把结果放回上下文让模型继续回答。",
      why: "模型本身无法触碰外部世界——不能联网、不能执行代码、不能读写文件；同时模型的知识停留在训练时点，无法获取实时数据。",
      problem: "模型「只会说、不会做」，且信息存在时效性。单靠提示词技巧无法让模型真正完成操作。",
      mechanism:
        "模型根据用户意图，输出一段符合 JSON Schema 的调用请求（如 { name: \"get_weather\", arguments: { city: \"深圳\" } }）。宿主程序负责真正执行这个函数，把结果以文本形式注入模型上下文，模型再基于结果组织最终回答。",
      flow: [
        { label: "意图解析", desc: "理解用户想要什么" },
        { label: "Tool Call", desc: "模型输出 { name, arguments }" },
        { label: "宿主执行", desc: "真实调用函数 / API" },
        { label: "结果回传", desc: "结果注入模型上下文" },
        { label: "总结回答", desc: "模型基于结果组织回复" },
      ],
    },
    compare: [
      {
        concept: "Prompt Engineering",
        tagline: "让模型「会说」",
        bullets: ["只改变输入文本", "模型输出仍然是纯文本", "不接触外部世界"],
      },
      {
        concept: "Tool Calling",
        tagline: "让模型「会做」",
        bullets: ["输出结构化调用请求", "由宿主执行真实操作", "结果再回到模型上下文"],
        highlight: true,
      },
      {
        concept: "RAG",
        tagline: "给模型「喂信息」",
        bullets: ["只负责检索知识", "不产生真实副作用", "和 Tool Calling 可以组合使用"],
      },
    ],
    challenges: [
      {
        id: "tc-1",
        type: "single",
        question: "模型输出了 { \"name\": \"get_weather\", \"arguments\": { \"city\": \"深圳\" } }，接下来由谁真正执行查询？",
        options: ["模型自己", "宿主程序", "用户手动操作", "没有人执行"],
        answer: 1,
        explanation: "模型只负责「提出请求」，真正执行工具的一定是宿主程序（你的应用代码）。",
      },
      {
        id: "tc-2",
        type: "judge",
        question: "Tool Calling 中，工具的执行结果会以文本形式放回模型上下文。",
        statement: "Tool Calling 中，工具的执行结果会以文本形式放回模型上下文。",
        answer: true,
        explanation: "结果以文本注入上下文后，模型才能「看到」结果并继续回答。",
      },
      {
        id: "tc-3",
        type: "single",
        question: "为什么要引入 Tool Calling？",
        options: [
          "让模型的回答文采更好",
          "突破模型只能输出文本、无法访问外部世界的限制",
          "加快模型训练速度",
          "代替数据库存储",
        ],
        answer: 1,
        explanation: "核心动机：模型「只会说、不会做」。Tool Calling 让它能驱动真实操作。",
      },
    ],
    final: {
      question: "用自己的话解释：Tool Calling 是什么？为什么需要它？",
      hint: "试试从「模型只会输出文本」出发，描述调用流程（模型 → 结构化请求 → 宿主执行 → 结果回传）。",
      keywords: ["工具", "函数", "调用", "外部", "执行", "参数", "结果", "宿主", "结构化", "文本"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 2. ReAct
  // ===========================================================================
  {
    id: "react",
    name: "ReAct",
    world: "agent-city",
    type: "main",
    difficulty: 2,
    minutes: 10,
    summary: "Reasoning + Acting：让模型在 Thought → Action → Observation 循环中边思考边行动。",
    icon: "🧭",
    color: "violet",
    prerequisites: ["tool-calling"],
    related: ["chain-of-thought", "agent-loop"],
    unlocks: ["agent-loop"],
    pos: { x: 480, y: 240 },
    encounter: {
      scenario:
        "任务：「查一下明天北京天气，如果是晴天，就帮我提醒同事明天适合户外团建。」\n\n如果只调用一次工具，模型要么猜天气、要么拒绝回答。真正的做法是：先查天气 → 看到结果 → 再决定下一步。任务不是「一步回答」，而是一连串「思考 + 行动 + 观察」的决策过程。",
      prompt: "如果一个任务无法一步完成，模型应该靠什么机制一步步逼近答案？",
    },
    learn: {
      what: "ReAct（Reasoning + Acting）是一种 Agent 范式：把「推理」和「行动」交替串成一个循环，模型每次先想清楚要做什么，再执行动作，观察结果，直到任务完成。",
      why: "复杂任务无法一次生成最终答案；模型直接作答容易在中间步骤出错，且没有机会根据真实反馈修正。",
      problem: "单次调用只能回答一步；多步任务需要「看情况决定下一步」的动态决策能力。",
      mechanism:
        "循环执行：Thought（推理：接下来该做什么）→ Action（调用工具或执行动作）→ Observation（观察外部返回的结果）→ 回到 Thought……直到可以给出 Final Answer。",
      flow: [
        { label: "Thought", desc: "推理：现在该做什么" },
        { label: "Action", desc: "执行工具 / 动作" },
        { label: "Observation", desc: "读取外部反馈" },
        { label: "循环", desc: "直到任务完成" },
        { label: "Final", desc: "输出最终答案" },
      ],
    },
    compare: [
      {
        concept: "单次 Prompt",
        tagline: "一次答完",
        bullets: ["没有中间步骤", "无法中途修正", "适合简单问题"],
      },
      {
        concept: "Chain-of-Thought",
        tagline: "只动脑、不动手",
        bullets: ["只有推理，没有行动", "不接触外部世界", "结果是「想出来的」"],
      },
      {
        concept: "ReAct",
        tagline: "想一步，做一步",
        bullets: ["推理与行动交替", "通过 Observation 获得真实反馈", "能根据反馈修正方向"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "react-1",
        type: "order",
        question: "把 ReAct 循环按正确顺序排列：",
        items: ["Observation", "Action", "Thought"],
        answer: ["Thought", "Action", "Observation"],
        explanation: "先想（Thought），再做（Action），再看结果（Observation），循环往复。",
      },
      {
        id: "react-2",
        type: "judge",
        question: "ReAct 中的 Observation 来自外部环境对 Action 的真实反馈。",
        statement: "ReAct 中的 Observation 来自外部环境对 Action 的真实反馈。",
        answer: true,
        explanation: "Observation 是真实世界对动作的反馈，这正是 ReAct 能「修正方向」的原因。",
      },
      {
        id: "react-3",
        type: "single",
        question: "ReAct 相比一次性回答的关键优势是什么？",
        options: ["生成更长的文本", "能在中途根据观察结果修正行动", "完全不需要模型推理", "执行速度更快"],
        answer: 1,
        explanation: "ReAct 让模型在循环中根据真实反馈动态调整，而不是一条路走到黑。",
      },
    ],
    final: {
      question: "用自己的话解释：ReAct 的核心循环是什么？它为什么比一次性回答更适合复杂任务？",
      hint: "描述 Thought → Action → Observation 的循环，并说明「反馈」如何帮助修正。",
      keywords: ["思考", "行动", "观察", "循环", "反馈", "推理", "环境", "工具", "修正", "步骤"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 3. Agent Loop
  // ===========================================================================
  {
    id: "agent-loop",
    name: "Agent Loop",
    world: "agent-city",
    type: "main",
    difficulty: 2,
    minutes: 10,
    summary: "把 ReAct 封装成可循环执行的运行时：持续接收任务、调用工具、处理结果，直到目标达成。",
    icon: "🔄",
    color: "indigo",
    prerequisites: ["react"],
    related: ["state-machine", "reactive-programming"],
    unlocks: ["planning", "reflection"],
    pos: { x: 480, y: 390 },
    encounter: {
      scenario:
        "ReAct 解决了一个「回合」内的思考与行动。但一个真正的 Agent 任务可能是：整理 30 封邮件 → 提炼重点 → 生成周报 → 发给老板。\n\n这需要模型在一个「运行时」里反复循环：完成任务一部分，更新状态，继续下一部分。谁来负责这个循环本身？",
      prompt: "如果没有一个「循环运行时」，模型执行完一步之后，谁来决定要不要执行下一步、执行到什么时候停？",
    },
    learn: {
      what: "Agent Loop 是 Agent 的运行时循环：while(任务未完成) { 推理 → 执行 → 观察 → 更新状态 }，由宿主程序（而非模型）控制循环的起止与终止条件。",
      why: "单次模型调用无法完成多步任务；循环控制、状态更新、终止条件这些「程序逻辑」不适合让模型自己承担。",
      problem: "多步任务需要持续执行与状态管理，但模型只能「一次想一步」。",
      mechanism:
        "宿主程序维护一个循环：检查任务是否完成 → 让模型推理下一步 → 执行工具 → 把结果写回上下文/状态 → 再次检查。循环的上限（步数）也由宿主控制，防止无限运行。",
      flow: [
        { label: "检查", desc: "任务完成了吗？" },
        { label: "推理", desc: "模型决定下一步" },
        { label: "执行", desc: "调用工具" },
        { label: "更新", desc: "状态写回上下文" },
        { label: "终止", desc: "达成目标 / 超步数" },
      ],
    },
    compare: [
      {
        concept: "ReAct",
        tagline: "思考-行动模式",
        bullets: ["描述「单回合」怎么运转", "是一种推理范式", "不关心循环由谁控制"],
      },
      {
        concept: "Agent Loop",
        tagline: "循环运行时",
        bullets: ["把 ReAct 封装进 while 循环", "宿主负责起止与步数上限", "模型只负责「一步的决策」"],
        highlight: true,
      },
      {
        concept: "传统程序",
        tagline: "写死流程",
        bullets: ["分支与循环由代码固定", "不可按需应变", "Agent Loop 则按需决策"],
      },
    ],
    challenges: [
      {
        id: "al-1",
        type: "single",
        question: "Agent Loop 中，「什么时候停止循环」主要由谁决定？",
        options: ["模型自由决定", "宿主程序（终止条件 / 步数上限）", "用户随时盯着", "随机决定"],
        answer: 1,
        explanation: "循环的终止条件是程序逻辑，由宿主控制——否则 Agent 可能永远跑下去。",
      },
      {
        id: "al-2",
        type: "judge",
        question: "Agent Loop 中，模型的职责是「每一步的决策」，而不是整个循环的控制。",
        statement: "Agent Loop 中，模型的职责是「每一步的决策」，而不是整个循环的控制。",
        answer: true,
        explanation: "循环控制、状态管理、终止条件是宿主程序的责任。",
      },
      {
        id: "al-3",
        type: "single",
        question: "Agent Loop 与 ReAct 的关系最准确的是？",
        options: [
          "两者毫无关系",
          "Agent Loop 是 ReAct 的运行时封装，提供循环控制",
          "ReAct 是 Agent Loop 的运行时",
          "Agent Loop 是一种提示词技巧",
        ],
        answer: 1,
        explanation: "ReAct 是思考-行动模式，Agent Loop 是承载该模式的循环运行时。",
      },
    ],
    final: {
      question: "用自己的话解释：Agent Loop 解决了什么问题？模型和宿主程序在其中各承担什么角色？",
      hint: "从「多步任务」出发，说明循环 + 终止条件，区分「一步决策」与「循环控制」。",
      keywords: ["循环", "运行时", "任务", "终止", "宿主", "状态", "步骤", "决策", "上限", "完成"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 4. Planning（支线）
  // ===========================================================================
  {
    id: "planning",
    name: "Planning",
    world: "agent-city",
    type: "branch",
    difficulty: 2,
    minutes: 8,
    summary: "动手之前先拆解：把大任务分解成有序子目标，再逐步执行。",
    icon: "🗺️",
    color: "amber",
    prerequisites: ["agent-loop"],
    related: ["task-decomposition", "re-planning"],
    unlocks: ["memory"],
    pos: { x: 270, y: 560 },
    encounter: {
      scenario:
        "任务：「帮我把这个 2000 行代码的仓库做一次重构，并保证测试全绿。」\n\n如果 Agent 直接动手改代码，十有八九改到一半发现自己方向错了。优秀的工程师会先列计划：先梳理结构 → 再定改动范围 → 分步实施 → 每步验证。",
      prompt: "面对大型任务，Agent 应该「先想后做」还是「边做边想」？计划应该在什么时候产生？",
    },
    learn: {
      what: "Planning 是 Agent 在执行前先把大任务拆解为有序子目标（Plan），再按计划逐步执行，并在偏离时重新规划的机制。",
      why: "复杂任务一步到位几乎必然出错；没有计划的 Agent 容易在局部细节中迷失全局目标。",
      problem: "模型面对大任务时缺少全局结构，执行容易发散、返工成本高。",
      mechanism: "先生成 Plan（子目标列表，可包含依赖关系）→ 逐项执行 → 每完成一步检查 → 若现实偏离计划则重新规划（Re-planning）。",
      flow: [
        { label: "拆解", desc: "大任务 → 子目标列表" },
        { label: "排序", desc: "标注依赖与顺序" },
        { label: "执行", desc: "按计划逐步推进" },
        { label: "校验", desc: "每步检查是否达成" },
        { label: "重规划", desc: "偏离时重新调整计划" },
      ],
    },
    compare: [
      {
        concept: "ReAct",
        tagline: "边做边想",
        bullets: ["每个回合现想现做", "没有全局计划", "适合中等复杂度任务"],
      },
      {
        concept: "Planning",
        tagline: "先想后做",
        bullets: ["先产出全局子目标列表", "明确依赖与顺序", "适合复杂、多阶段任务"],
        highlight: true,
      },
      {
        concept: "Reflection",
        tagline: "事后复盘",
        bullets: ["针对已产出的结果", "是「回顾修正」", "Planning 是「前瞻拆解」"],
      },
    ],
    challenges: [
      {
        id: "pl-1",
        type: "single",
        question: "Planning 与 ReAct 的主要区别是？",
        options: [
          "ReAct 先做计划再执行",
          "Planning 在执行前先拆解出全局子目标，ReAct 则是边做边想",
          "两者完全相同",
          "Planning 不需要执行",
        ],
        answer: 1,
        explanation: "Planning 强调「前瞻性拆解」，ReAct 强调「即时决策」。",
      },
      {
        id: "pl-2",
        type: "judge",
        question: "执行过程中发现计划与实际情况不符时，好的 Agent 应该坚持原计划不动摇。",
        statement: "执行过程中发现计划与实际情况不符时，好的 Agent 应该坚持原计划不动摇。",
        answer: false,
        explanation: "好的 Agent 会重新规划（Re-planning），计划是手段，不是目的。",
      },
      {
        id: "pl-3",
        type: "single",
        question: "以下哪个是 Planning 的典型产物？",
        options: ["一串随机尝试", "有序的子目标列表", "一段总结文本", "一个训练数据集"],
        answer: 1,
        explanation: "Planning 的核心产物是带依赖与顺序的子目标列表。",
      },
    ],
    final: {
      question: "用自己的话解释：Planning 为什么能降低复杂任务的失败率？",
      hint: "从「全局结构」「依赖顺序」「减少返工」「重新规划」等角度回答。",
      keywords: ["计划", "拆解", "子目标", "顺序", "依赖", "复杂", "执行", "重规划", "全局", "结构"],
      passRate: 0.5,
    },
  },

  // ===========================================================================
  // 5. Reflection（支线）
  // ===========================================================================
  {
    id: "reflection",
    name: "Reflection",
    world: "agent-city",
    type: "branch",
    difficulty: 2,
    minutes: 8,
    summary: "让 Agent 回顾自己的输出，找出问题并自我修正。",
    icon: "🪞",
    color: "rose",
    prerequisites: ["agent-loop"],
    related: ["self-critique", "verification"],
    unlocks: ["memory"],
    pos: { x: 690, y: 560 },
    encounter: {
      scenario:
        "Agent 生成了一份季度报告，看起来头头是道。但仔细一看：有个数据引用错误，结论和图表对不上，还有一段车轱辘话。\n\n如果 Agent 生成完就交卷，这些错误会直接流向下游。如果能让它「写完再看一遍」，很多问题其实可以自己发现。",
      prompt: "模型一次生成的答案往往是「第一直觉」。如何让它在交卷之前发现并修正自己的错误？",
    },
    learn: {
      what: "Reflection 是让 Agent 对自身已产生的输出进行批判性回顾，识别缺陷并修正的机制（self-critique → revise → re-evaluate）。",
      why: "模型的第一次输出质量通常不是最优；让它扮演「审稿人」重新审视，能显著提升正确率与一致性。",
      problem: "「生成即交付」会把幻觉、逻辑漏洞和细节错误直接带到最终结果中。",
      mechanism: "生成 → 自我批判（列出可疑点）→ 修订 → 再评估，可重复多轮；对关键任务可结合外部校验（测试、检索）确认。",
      flow: [
        { label: "生成", desc: "模型产出初稿" },
        { label: "批判", desc: "扮演审稿人找问题" },
        { label: "修订", desc: "针对问题修改" },
        { label: "再评估", desc: "检查是否仍有漏洞" },
        { label: "交付", desc: "质量达标后输出" },
      ],
    },
    compare: [
      {
        concept: "ReAct",
        tagline: "对外部反馈反应",
        bullets: ["反馈来自环境 / 工具", "是「外部修正」"],
      },
      {
        concept: "Reflection",
        tagline: "对自身输出反思",
        bullets: ["反馈来自自我批判", "是「内部修正」", "可叠加在 ReAct 之上"],
        highlight: true,
      },
      {
        concept: "Planning",
        tagline: "前瞻拆解",
        bullets: ["发生在执行前", "Reflection 发生在产出后"],
      },
    ],
    challenges: [
      {
        id: "rf-1",
        type: "single",
        question: "Reflection 的「反馈来源」是？",
        options: ["外部环境", "模型对自身输出的批判", "用户手动纠正", "随机噪声"],
        answer: 1,
        explanation: "Reflection 是内部机制：模型审视自己的输出。",
      },
      {
        id: "rf-2",
        type: "judge",
        question: "Reflection 通常发生在「生成之后、交付之前」。",
        statement: "Reflection 通常发生在「生成之后、交付之前」。",
        answer: true,
        explanation: "它是对已产出结果的回顾与修正。",
      },
      {
        id: "rf-3",
        type: "single",
        question: "以下哪种组合最能降低 Agent 输出的错误率？",
        options: ["只生成一次", "生成 → 自我批判 → 修订 → 再评估", "无限循环生成", "让输出更长"],
        answer: 1,
        explanation: "批判-修订-再评估的循环能系统性提升输出质量。",
      },
    ],
    final: {
      question: "用自己的话解释：Reflection 和 ReAct 的「反馈」有什么本质区别？",
      hint: "一个来自外部环境，一个来自模型对自身的批判；一个向外看，一个向内看。",
      keywords: ["反思", "批判", "自我", "输出", "修正", "内部", "外部", "反馈", "审稿", "质量"],
      passRate: 0.5,
    },
  },

  // ===========================================================================
  // 6. Memory
  // ===========================================================================
  {
    id: "memory",
    name: "Memory",
    world: "agent-city",
    type: "main",
    difficulty: 3,
    minutes: 12,
    summary: "让 Agent 跨轮次、跨任务记住与检索信息：短期靠上下文，长期靠外部存储。",
    icon: "🧠",
    color: "cyan",
    prerequisites: ["agent-loop", "planning", "reflection"],
    related: ["context-engineering", "vector-db", "rag"],
    unlocks: ["mcp", "skills"],
    pos: { x: 480, y: 740 },
    encounter: {
      scenario:
        "你上午让 Agent 调研了三家公司的资料。下午你问：「把上午那三家的对比表发我。」它一脸茫然：对话上下文已经被新任务挤掉了，或者它根本就是无状态的。\n\n真实世界的助手需要「记得住」。可模型的上下文窗口有限，任务一多，记忆就会溢出。",
      prompt: "上下文窗口是有限的。Agent 要长期工作，应该把「记什么」和「存在哪」怎么分工？",
    },
    learn: {
      what: "Memory 是 Agent 的记忆系统：短期记忆 = 上下文窗口（当前任务相关）；长期记忆 = 外部存储（向量库 / 摘要库），按需检索注入上下文。",
      why: "模型本身无状态，上下文窗口有上限；真实任务需要跨轮次、跨会话记住用户偏好、历史决策与中间结论。",
      problem: "「记不住」导致重复提问、重复劳动；「什么都记」又会挤爆上下文、引入噪声。",
      mechanism: "写入：重要信息经过提炼后写入长期存储（向量化/摘要）；检索：新任务开始时按相关性召回，注入上下文；遗忘：设定保留策略，避免无限膨胀。",
      flow: [
        { label: "写入", desc: "提炼重要信息并存储" },
        { label: "索引", desc: "向量化 / 摘要化" },
        { label: "检索", desc: "按任务相关性召回" },
        { label: "注入", desc: "写回上下文窗口" },
        { label: "遗忘", desc: "保留策略控制膨胀" },
      ],
    },
    compare: [
      {
        concept: "上下文窗口",
        tagline: "短时记忆",
        bullets: ["容量有限（几万到百万 Token）", "与当前任务强相关", "超出即被截断或遗忘"],
      },
      {
        concept: "Memory 系统",
        tagline: "长短结合",
        bullets: ["长期记忆存在外部存储", "按需检索注入上下文", "跨会话、跨任务可用"],
        highlight: true,
      },
      {
        concept: "RAG",
        tagline: "外部知识",
        bullets: ["从文档/知识库取「知识」", "Memory 存的是「经历与状态」", "技术上有重叠但目的不同"],
      },
    ],
    challenges: [
      {
        id: "mem-1",
        type: "single",
        question: "Agent 的「长期记忆」通常存储在哪里？",
        options: ["模型参数里", "外部存储（如向量数据库）", "用户的浏览器", "提示词里"],
        answer: 1,
        explanation: "长期记忆在外部存储中，模型参数是训练出来的，不能实时写入。",
      },
      {
        id: "mem-2",
        type: "judge",
        question: "记忆系统把「所有内容」无差别塞进上下文，效果一定更好。",
        statement: "记忆系统把「所有内容」无差别塞进上下文，效果一定更好。",
        answer: false,
        explanation: "盲目堆料会挤爆上下文并引入噪声；记忆的关键是按需检索与提炼。",
      },
      {
        id: "mem-3",
        type: "single",
        question: "短期记忆与长期记忆的正确分工是？",
        options: [
          "短期记忆 = 上下文窗口，长期记忆 = 外部存储按需注入",
          "都放模型参数里",
          "长期记忆 = 上下文，短期记忆 = 外部存储",
          "记忆只存在于单次请求中",
        ],
        answer: 0,
        explanation: "短期放窗口、长期放外部存储、按需注入，是主流方案。",
      },
    ],
    final: {
      question: "用自己的话解释：Agent 的 Memory 如何解决「上下文窗口有限」这个矛盾？",
      hint: "从「短期 vs 长期」「写入 vs 检索」「按需注入」的角度组织答案。",
      keywords: ["记忆", "短期", "长期", "上下文", "外部存储", "检索", "注入", "写入", "向量", "遗忘"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 7. MCP（支线）
  // ===========================================================================
  {
    id: "mcp",
    name: "MCP",
    world: "agent-city",
    type: "branch",
    difficulty: 3,
    minutes: 12,
    summary: "Model Context Protocol：统一「工具 / 数据 / 能力」接入标准的开放协议。",
    icon: "🔌",
    color: "teal",
    prerequisites: ["memory"],
    related: ["protocol", "integration", "plugin-ecosystem"],
    unlocks: ["computer-use"],
    pos: { x: 270, y: 920 },
    encounter: {
      scenario:
        "Agent 想连一个天气服务、一个数据库、一个 CRM。三家的 API 风格完全不同：有的 REST、有的 WebSocket、有的还要自己写 SDK。\n\n每接一个工具，都要写一遍适配代码。如果 100 个 Agent × 1000 个工具，这个组合爆炸谁来消化？",
      prompt: "如果有几百个工具、几百个 Agent，靠「一对一适配」显然不可持续。有没有一种统一的方式？",
    },
    learn: {
      what: "MCP（Model Context Protocol）是一个开放协议，定义了 Agent（客户端）与工具/数据源（服务器）之间的标准接口，让能力接入像「插 USB」一样即插即用。",
      why: "工具生态碎片化：每个工具一套接入方式，导致集成成本高、无法复用。",
      problem: "「N 个 Agent × M 个工具」的组合需要 N×M 次适配，不可扩展。",
      mechanism: "MCP Server 暴露标准化的能力单元（Tools 工具 / Resources 数据 / Prompts 提示模板）；MCP Client（Agent 端）通过统一协议发现并调用；一次接入，处处可用。",
      flow: [
        { label: "标准化", desc: "工具/资源/提示词统一建模" },
        { label: "暴露", desc: "MCP Server 注册能力" },
        { label: "发现", desc: "客户端获取能力清单" },
        { label: "调用", desc: "统一协议执行工具" },
        { label: "复用", desc: "一次接入多处可用" },
      ],
    },
    compare: [
      {
        concept: "Tool Calling",
        tagline: "调用机制",
        bullets: ["解决「怎么调一个函数」", "是运行时能力"],
      },
      {
        concept: "MCP",
        tagline: "接入标准",
        bullets: ["解决「怎么连一切外部系统」", "是生态级协议", "让 Tool Calling 有统一入口"],
        highlight: true,
      },
      {
        concept: "Plugin",
        tagline: "私有插件",
        bullets: ["平台各自定义格式", "MCP 是开放标准", "目标是互通互认"],
      },
    ],
    challenges: [
      {
        id: "mcp-1",
        type: "single",
        question: "MCP 主要解决什么问题？",
        options: [
          "提升模型推理能力",
          "统一 Agent 与外部工具/数据的接入方式",
          "压缩上下文",
          "替代向量数据库",
        ],
        answer: 1,
        explanation: "MCP 是接入协议，解决工具生态碎片化问题。",
      },
      {
        id: "mcp-2",
        type: "match",
        question: "把概念与描述配对：",
        pairs: [
          { left: "MCP Server", right: "暴露工具/数据/提示词的一方" },
          { left: "MCP Client", right: "Agent 端统一调用的一方" },
          { left: "Tool Calling", right: "单次函数调用的机制" },
          { left: "Plugin", right: "平台私有的接入格式" },
        ],
        explanation: "Server 提供能力，Client 消费能力；Tool Calling 是机制，MCP 是协议。",
      },
      {
        id: "mcp-3",
        type: "judge",
        question: "接入 MCP 之后，同一个工具可以被不同 Agent 复用，无需重复适配。",
        statement: "接入 MCP 之后，同一个工具可以被不同 Agent 复用，无需重复适配。",
        answer: true,
        explanation: "这正是 MCP「一次接入、处处可用」的价值。",
      },
    ],
    final: {
      question: "用自己的话解释：MCP 解决了什么痛点？它的「标准化」带来什么好处？",
      hint: "从「N×M 适配爆炸」「即插即用」「一次接入处处复用」角度回答。",
      keywords: ["协议", "标准", "工具", "接入", "复用", "统一", "服务器", "客户端", "生态", "适配"],
      passRate: 0.5,
    },
  },

  // ===========================================================================
  // 8. Skills（支线）
  // ===========================================================================
  {
    id: "skills",
    name: "Skills",
    world: "agent-city",
    type: "branch",
    difficulty: 2,
    minutes: 10,
    summary: "把可复用的能力封装成「技能包」，让 Agent 按需装载、组合使用。",
    icon: "🧰",
    color: "fuchsia",
    prerequisites: ["memory"],
    related: ["skill-management", "composability"],
    unlocks: ["computer-use"],
    pos: { x: 690, y: 920 },
    encounter: {
      scenario:
        "你发现团队每天都在让 Agent 做同一件事：「把一份 PDF 报告转成结构化周报」。每次都要在提示词里重新写一遍规则、贴一遍示例，而且不同 Agent 的写法还不一样。\n\n如果这个能力能「打包」起来，像安装 App 一样装给 Agent，会怎样？",
      prompt: "高频、可复用的能力，应该以什么形态存在，才能被多个 Agent 反复使用？",
    },
    learn: {
      what: "Skills 是把一组「指令 + 脚本 + 元数据」封装成的可复用能力包，Agent 可按需装载并在任务中组合调用。",
      why: "高频操作重复实现、重复描述，浪费且不一致；能力应该沉淀为可管理的资产。",
      problem: "每次从零写提示词/脚本 → 不一致、不可复用、难维护。",
      mechanism: "定义：把能力写成标准格式（名称、描述、指令、脚本、依赖）；装载：Agent 按任务匹配并加载技能；组合：多个技能按流程编排协作。",
      flow: [
        { label: "封装", desc: "指令 + 脚本 + 元数据" },
        { label: "索引", desc: "按能力描述可检索" },
        { label: "装载", desc: "任务匹配时加载" },
        { label: "执行", desc: "技能内步骤运行" },
        { label: "组合", desc: "多技能编排协作" },
      ],
    },
    compare: [
      {
        concept: "MCP",
        tagline: "连接外部系统",
        bullets: ["重点是「接入」", "解决工具生态互通"],
      },
      {
        concept: "Skills",
        tagline: "封装内部能力",
        bullets: ["重点是「沉淀复用」", "可包含提示词+脚本", "与 MCP 互补"],
        highlight: true,
      },
      {
        concept: "普通 Prompt",
        tagline: "一次性提示",
        bullets: ["用完即弃", "Skills 是可复用资产"],
      },
    ],
    challenges: [
      {
        id: "sk-1",
        type: "single",
        question: "Skills 与普通 Prompt 的本质区别是？",
        options: [
          "Skills 更长",
          "Skills 是可复用、可管理、可组合的能力资产",
          "Prompt 不能写中文",
          "没有区别",
        ],
        answer: 1,
        explanation: "Skills 把能力沉淀为标准化的可复用资产。",
      },
      {
        id: "sk-2",
        type: "judge",
        question: "一个技能通常包含指令、脚本与元数据（名称/描述）。",
        statement: "一个技能通常包含指令、脚本与元数据（名称/描述）。",
        answer: true,
        explanation: "元数据用于检索匹配，指令与脚本用于执行。",
      },
      {
        id: "sk-3",
        type: "single",
        question: "Skills 与 MCP 的关系最准确的是？",
        options: [
          "互相排斥",
          "MCP 管外部接入、Skills 管内部能力沉淀，二者互补",
          "Skills 是 MCP 的子集",
          "MCP 是 Skills 的子集",
        ],
        answer: 1,
        explanation: "一个对外、一个对内，可组合使用。",
      },
    ],
    final: {
      question: "用自己的话解释：把能力封装成 Skills 带来了哪些好处？",
      hint: "从「复用」「一致」「可维护」「组合」角度回答。",
      keywords: ["技能", "复用", "封装", "可维护", "组合", "沉淀", "资产", "一致", "装载", "标准"],
      passRate: 0.5,
    },
  },

  // ===========================================================================
  // 9. Computer Use
  // ===========================================================================
  {
    id: "computer-use",
    name: "Computer Use",
    world: "agent-city",
    type: "main",
    difficulty: 3,
    minutes: 12,
    summary: "让 Agent 像人一样操作图形界面：看屏幕、移动鼠标、敲键盘、再验证。",
    icon: "🖱️",
    color: "emerald",
    prerequisites: ["mcp", "skills"],
    related: ["gui-agent", "accessibility-tree", "rpa"],
    unlocks: ["coding-agent"],
    pos: { x: 480, y: 1100 },
    encounter: {
      scenario:
        "公司内部有个老系统：没有 API、没有文档、只能在浏览器里点点点。老板说：「让 Agent 帮我把每天的数据录进去。」\n\n没有 API 怎么办？人是怎么操作这个系统的？人用眼睛看屏幕、用手点鼠标。如果 Agent 也能这样呢？",
      prompt: "当软件没有 API 时，Agent 还能通过什么方式「操作」它？",
    },
    learn: {
      what: "Computer Use 是让 Agent 通过视觉/无障碍树理解屏幕，输出鼠标键盘操作，像人一样驱动 GUI 的能力。",
      why: "大量软件没有开放 API，只有图形界面；GUI 是软件最通用的「接口」。",
      problem: "无 API 的系统无法被传统工具调用覆盖，只能靠界面操作。",
      mechanism: "截图（或读取无障碍树）→ 理解当前界面 → 输出操作（点击/输入/滚动）→ 执行 → 再次截图验证结果，循环直到任务完成。",
      flow: [
        { label: "感知", desc: "截图 / 无障碍树" },
        { label: "理解", desc: "识别界面元素" },
        { label: "操作", desc: "输出点击/输入/滚动" },
        { label: "执行", desc: "驱动真实界面" },
        { label: "验证", desc: "再截图确认结果" },
      ],
    },
    compare: [
      {
        concept: "Tool Calling",
        tagline: "走 API",
        bullets: ["结构化、稳定、快", "需要接口存在"],
      },
      {
        concept: "Computer Use",
        tagline: "走 UI",
        bullets: ["无需 API", "按界面元素操作", "依赖视觉理解，较慢"],
        highlight: true,
      },
      {
        concept: "RPA",
        tagline: "固定脚本",
        bullets: ["按录制流程重复执行", "界面一变就失效", "Computer Use 是按需决策"],
      },
    ],
    challenges: [
      {
        id: "cu-1",
        type: "single",
        question: "Computer Use 相比 Tool Calling 的核心优势是？",
        options: [
          "速度更快",
          "无需 API，能操作任何有界面的软件",
          "不需要模型",
          "更安全",
        ],
        answer: 1,
        explanation: "它把 GUI 当成通用接口，覆盖无 API 的系统。",
      },
      {
        id: "cu-2",
        type: "judge",
        question: "Computer Use 在执行操作后，通常会再次截图来验证操作是否生效。",
        statement: "Computer Use 在执行操作后，通常会再次截图来验证操作是否生效。",
        answer: true,
        explanation: "「感知-操作-验证」闭环是它可靠运行的关键。",
      },
      {
        id: "cu-3",
        type: "match",
        question: "把方案与适用场景配对：",
        pairs: [
          { left: "Tool Calling", right: "系统有稳定 API" },
          { left: "Computer Use", right: "老系统只有界面" },
          { left: "RPA", right: "固定流程重复执行" },
        ],
        explanation: "有 API 走 Tool Calling；没 API 走 Computer Use；纯固定流程可用 RPA。",
      },
    ],
    final: {
      question: "用自己的话解释：Computer Use 让 Agent 获得了什么新能力？它的关键闭环是什么？",
      hint: "从「GUI 作为通用接口」「感知-操作-验证」角度回答。",
      keywords: ["界面", "屏幕", "操作", "点击", "感知", "验证", "截图", "鼠标", "视觉", "闭环"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 10. Coding Agent
  // ===========================================================================
  {
    id: "coding-agent",
    name: "Coding Agent",
    world: "agent-city",
    type: "main",
    difficulty: 3,
    minutes: 14,
    summary: "以「写代码」为第一行动能力的 Agent：在仓库里读、改、测、迭代、提交。",
    icon: "💻",
    color: "orange",
    prerequisites: ["computer-use"],
    related: ["code-generation", "test-driven", "code-review"],
    unlocks: ["harness"],
    pos: { x: 480, y: 1250 },
    encounter: {
      scenario:
        "需求来了：「给登录页加一个验证码，顺便修一下上次那个超时 bug。」\n\n一般的助手只能给你一段代码片段，让你自己粘。但真正的 Coding Agent 应该能做到：打开仓库 → 找到相关文件 → 看懂上下文 → 改代码 → 跑测试 → 确认没破坏别的东西 → 提交。",
      prompt: "写代码和聊天最大的不同是什么？一个能真正「干活」的 Coding Agent 需要哪些步骤？",
    },
    learn: {
      what: "Coding Agent 是把代码仓库当作工作环境的 Agent：能读代码、规划改动、生成补丁、运行测试、根据失败修复，最终完成端到端开发任务。",
      why: "开发任务是天然的 Agent 场景：多步骤、可验证（测试）、反馈快（编译/报错）、价值高。",
      problem: "代码片段 ≠ 完成任务；真实开发需要理解仓库上下文并验证改动。",
      mechanism: "读仓库（搜索/定位）→ 规划改动方案 → 生成补丁 → 运行测试 → 根据失败修复 → 循环直到通过 → 提交/总结。",
      flow: [
        { label: "理解", desc: "读代码与上下文" },
        { label: "规划", desc: "定位改动范围" },
        { label: "改码", desc: "生成补丁" },
        { label: "验证", desc: "跑测试 / 编译" },
        { label: "迭代", desc: "失败则修复重试" },
        { label: "交付", desc: "提交并总结" },
      ],
    },
    compare: [
      {
        concept: "Copilot 类补全",
        tagline: "单点补全",
        bullets: ["在光标处续写代码", "不负责整体任务"],
      },
      {
        concept: "Coding Agent",
        tagline: "端到端任务",
        bullets: ["读库-改码-测试-迭代闭环", "对结果负责", "以测试作为验收标准"],
        highlight: true,
      },
      {
        concept: "Computer Use",
        tagline: "操作界面",
        bullets: ["面向 GUI", "Coding Agent 面向代码仓库"],
      },
    ],
    challenges: [
      {
        id: "ca-1",
        type: "single",
        question: "Coding Agent 与代码补全工具最本质的区别是？",
        options: [
          "补全工具更快",
          "Coding Agent 是端到端任务闭环（读-改-测-迭代）并对结果负责",
          "没有区别",
          "Coding Agent 不需要模型",
        ],
        answer: 1,
        explanation: "补全是单点辅助，Coding Agent 是任务级执行者。",
      },
      {
        id: "ca-2",
        type: "judge",
        question: "对 Coding Agent 来说，「跑测试」是验证改动是否正确的关键手段。",
        statement: "对 Coding Agent 来说，「跑测试」是验证改动是否正确的关键手段。",
        answer: true,
        explanation: "测试是 Agent 获得客观反馈的闭环核心。",
      },
      {
        id: "ca-3",
        type: "order",
        question: "把 Coding Agent 的典型工作流排序：",
        items: ["运行测试", "生成补丁", "理解仓库", "根据失败修复"],
        answer: ["理解仓库", "生成补丁", "运行测试", "根据失败修复"],
        explanation: "先理解仓库，再改码，再验证，最后按反馈迭代。",
      },
    ],
    final: {
      question: "用自己的话解释：为什么说「测试」是 Coding Agent 可靠性的基石？",
      hint: "从「客观反馈」「快速失败」「防回归」等角度回答。",
      keywords: ["测试", "验证", "反馈", "补丁", "仓库", "迭代", "编译", "回归", "闭环", "可靠"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 11. Harness（Boss）
  // ===========================================================================
  {
    id: "harness",
    name: "Harness",
    world: "agent-city",
    type: "boss",
    difficulty: 4,
    minutes: 16,
    summary: "让 AI Agent 长期、安全、可靠运行的一整套外围运行系统。",
    icon: "👑",
    color: "red",
    prerequisites: ["tool-calling", "react", "agent-loop", "memory", "computer-use", "coding-agent"],
    related: ["memory", "mcp", "skills", "context-engineering", "verification", "sandbox"],
    unlocks: ["long-running-agent"],
    pos: { x: 480, y: 1430 },
    encounter: {
      scenario:
        "你的 Agent 要执行一个 2 小时的自动化任务。运行到第 40 分钟：它开始重复调用同一个接口（钱在燃烧）；它读到了一个不该读的私有目录；它生成了一个看起来正确、实际错误的补丁，并且自我感觉良好。\n\n单个 Agent 很聪明，但让它「长期、自主、真实世界运行」时，谁来兜底？",
      prompt: "如果让 Agent 自主运行 2 小时、甚至 2 天，你需要在外围做哪些防护，才能保证它不出大事？",
    },
    learn: {
      what: "Harness 是包裹在 Agent 之外的一整套「运行环境 + 监护系统」：负责权限、预算、校验、观测、恢复，让 Agent 能长期安全地运行。",
      why: "Agent 一旦能行动、联网、花钱，出错的成本就从「一句话」升级为「一次真实操作」；没有护栏，自主运行就是灾难。",
      problem: "Agent 会幻觉、会卡死、会失控、会越权、会烧钱——这些问题无法靠模型自身解决，必须由外部系统兜底。",
      mechanism: "在 Agent 循环外加装多层护栏：策略检查（能不能做）→ 沙箱执行（隔离环境）→ 结果校验（对/错）→ 全量审计（可追溯）→ 中断与恢复（可控停止）。",
      flow: [
        { label: "Policy", desc: "策略：能否执行" },
        { label: "Sandbox", desc: "沙箱：隔离环境" },
        { label: "Verify", desc: "校验：结果正确性" },
        { label: "Audit", desc: "审计：全程留痕" },
        { label: "Halt", desc: "中断：可控恢复" },
      ],
    },
    compare: [
      {
        concept: "ReAct",
        tagline: "单循环推理",
        bullets: ["关注 Thought → Action → Observation", "是「怎么做任务」"],
      },
      {
        concept: "Agent Framework",
        tagline: "编排框架",
        bullets: ["多个 Agent、Tool、Workflow 的编排", "是「怎么组任务」"],
      },
      {
        concept: "Harness",
        tagline: "运行监护系统",
        bullets: ["关注 Agent 如何长期、安全、可靠运行", "是「怎么不出事」"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "ha-1",
        type: "single",
        question: "Harness 与 Agent Framework 的核心区别是？",
        options: [
          "Harness 关注 Agent 长期安全可靠运行，Framework 关注多 Agent/工具/流程的编排",
          "两者完全相同",
          "Harness 是一种提示词",
          "Framework 负责安全，Harness 负责编排",
        ],
        answer: 0,
        explanation: "Framework 管「怎么组」，Harness 管「怎么不出事」。",
      },
      {
        id: "ha-2",
        type: "judge",
        question: "Harness 的职责是在 Agent 循环外加装安全与可靠性护栏。",
        statement: "Harness 的职责是在 Agent 循环外加装安全与可靠性护栏。",
        answer: true,
        explanation: "护栏（沙箱、预算、校验、审计）正是 Harness 的核心。",
      },
      {
        id: "ha-3",
        type: "single",
        question: "以下哪项最可能是 Harness 的职责？",
        options: [
          "提升模型的文采",
          "限制工具白名单并设置预算 / 步数上限",
          "生成训练数据",
          "压缩上下文窗口",
        ],
        answer: 1,
        explanation: "白名单与预算上限是典型的运行护栏。",
      },
      {
        id: "ha-4",
        type: "match",
        question: "把概念与关注点配对：",
        pairs: [
          { left: "ReAct", right: "思考-行动-观察循环" },
          { left: "Agent Framework", right: "多 Agent / 工具 / 工作流编排" },
          { left: "Harness", right: "长期、安全、可靠运行" },
          { left: "Sandbox", right: "受限执行环境" },
        ],
        explanation: "四个概念分别回答「怎么想、怎么组、怎么稳、怎么隔离」。",
      },
    ],
    final: {
      question: "你是 Agent 城最后一道关卡的守关者。请用你自己的话完整解释：为什么 Agent 不能脱离 Harness 长期自主运行？Harness 具体提供了哪些防护？",
      hint: "从「出错成本升级」出发，覆盖：策略/权限、沙箱隔离、预算与步数上限、输出校验、审计与中断恢复。",
      keywords: ["安全", "可靠", "运行", "护栏", "沙箱", "预算", "校验", "审计", "权限", "中断", "恢复", "长期", "稳定", "上限"],
      passRate: 0.6,
    },
  },
];

export const QUEST_MAP_W = 960;
export const QUEST_MAP_H = 1560;

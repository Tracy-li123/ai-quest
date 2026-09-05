import type { KnowledgeNode } from "../types";

// ---------------------------------------------------------------------------
// LLM 新手村 — 知识节点数据
//
// 主线（大节点）：token → attention → transformer → context-window → llm-boss
// 支线（小节点）：embedding（token 后分叉）/ sampling（transformer 后分叉）
// ---------------------------------------------------------------------------

export const LLM_VILLAGE_NODES: KnowledgeNode[] = [
  // ===========================================================================
  // 1. Token（词元）
  // ===========================================================================
  {
    id: "token",
    name: "Token 词元",
    world: "llm-village",
    type: "main",
    difficulty: 1,
    minutes: 6,
    summary: "模型读写文本的最小单位：一段话先被切碎成 Token，再变成数字喂给模型。",
    icon: "🔤",
    color: "emerald",
    prerequisites: [],
    related: ["bpe", "vocabulary", "tokenizer"],
    unlocks: ["attention", "embedding"],
    pos: { x: 480, y: 110 },
    encounter: {
      scenario:
        "你让模型「用中文写一句自我介绍」，它秒回。但你不知道的是：模型看到的那句话，根本不是完整的句子，而是被切碎成一片片的小片段。\n\n更反直觉的是：英文里「hello world」可能是 2 个 token，而中文「你好世界」可能是 4 个 token——模型是「按 Token 收费」的，字数相同，费用可能不同。",
      prompt: "如果模型只能处理数字，那么「一句话」在进入模型之前，究竟被做了怎样的处理？",
    },
    learn: {
      what: "Token（词元）是模型读写文本的最小单位——文本先被分词器切分成 Token 序列，再映射成数字 ID 交给模型计算。",
      why: "神经网络只能处理数值，不能直接「看」文字；同时模型按 Token 计费、按窗口计长，Token 是理解一切模型行为的基础单位。",
      problem: "不同语言切分粒度不同（英文按词、中文常按字/词），需要一套统一的分词规则。",
      mechanism:
        "主流采用 BPE（字节对编码）：统计语料里最常见的「字/词片段」合并成高频 Token，罕见组合退化为单字。模型看到的不是「一句话」，而是一串 Token ID。",
      flow: [
        { label: "输入文本", desc: "「你好世界」" },
        { label: "分词器", desc: "BPE 切分成 Token" },
        { label: "Token ID", desc: "映射为数字序列" },
        { label: "模型计算", desc: "数字向量进入神经网络" },
        { label: "输出 Token", desc: "逐 Token 生成回复" },
      ],
    },
    compare: [
      {
        concept: "字符 Character",
        tagline: "最小粒度的文本单元",
        bullets: ["按单个字符切分", "序列极长、效率低", "几乎不被现代模型采用"],
      },
      {
        concept: "单词 Word",
        tagline: "英文直觉单元",
        bullets: ["英文好用，中文难切分", "词典无限膨胀", "未见过的词直接「失明」"],
      },
      {
        concept: "Token（BPE）",
        tagline: "数据驱动的折中",
        bullets: ["常见片段合并成高频 Token", "罕见组合退化为单字", "词汇表有限、覆盖完整"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "tk-1",
        type: "single",
        question: "模型「看到」的输入到底是什么？",
        options: ["完整的原始句子", "被切分后的 Token ID 序列", "句子的拼音", "整段话的哈希值"],
        answer: 1,
        explanation: "文本先经分词器切分，再映射为 Token ID 序列，才是模型的真实输入。",
      },
      {
        id: "tk-2",
        type: "judge",
        question: "判断正误：",
        statement: "中文和英文中，同样意思的一句话消耗的 Token 数量一定相同。",
        answer: false,
        explanation: "分词粒度因语言而异，中文常按字/词切分，与英文的 Token 数不一定相同。",
      },
    ],
    final: {
      question: "用你自己的话解释：什么是 Token？为什么说「模型是按 Token 思考的」？",
      hint: "从「模型只能处理数字」出发，解释分词 → Token ID → 计费/窗口的基本逻辑。",
      keywords: ["最小", "单位", "分词", "数字", "ID", "切分", "BPE", "序列", "文本", "计费", "窗口", "映射"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 2. Attention（注意力机制）
  // ===========================================================================
  {
    id: "attention",
    name: "Attention 注意力",
    world: "llm-village",
    type: "main",
    difficulty: 2,
    minutes: 8,
    summary: "让模型在处理某个词时，动态「回看」句中其他词，并决定谁更重要。",
    icon: "🎯",
    color: "emerald",
    prerequisites: ["token"],
    related: ["qkv", "self-attention", "softmax"],
    unlocks: ["transformer"],
    pos: { x: 480, y: 330 },
    encounter: {
      scenario:
        "看这句话：「小明把球传给了小红，然后她跑向球门。」\n\n这里的「她」指的是谁？「球」在哪儿？一个正常人秒懂，但如果你是逐字读、读完就忘的机器——你要怎么知道「她」和小红有关？\n\n老式模型（RNN）靠「一步一步传状态」，句子一长就忘。Attention 给出了完全不同的答案：处理任何一个词时，回头重新看整句话。",
      prompt: "如果模型可以「回头看整句话」，它应该怎样决定每个词的重要性？",
    },
    learn: {
      what: "注意力机制让模型在处理某个 Token 时，动态地对句中的其他 Token 分配「重要度权重」，加权融合它们的语义信息。",
      why: "长句中的指代、修饰、转折关系可能相隔很远，顺序传递的模型会「忘掉」前面的信息。",
      problem: "如何让模型捕捉任意距离的依赖关系，而不是只靠相邻上下文。",
      mechanism:
        "每个 Token 生成 Query（我想找什么）、Key（我能提供什么）、Value（我的内容）。用 Q 和所有 K 算相似度，softmax 归一化成权重，再对 V 加权求和——权重越高的词，对当前词的影响越大。",
      flow: [
        { label: "Query / Key / Value", desc: "每个词生成 Q、K、V" },
        { label: "算相似度", desc: "Q × K 打分" },
        { label: "Softmax", desc: "归一化成权重" },
        { label: "加权求和", desc: "按权重融合 V" },
        { label: "输出", desc: "每个词带上全局信息" },
      ],
    },
    compare: [
      {
        concept: "RNN 顺序传递",
        tagline: "信息一步一步走",
        bullets: ["只能看到「上一个词的状态」", "长距离依赖会衰减", "无法并行"],
      },
      {
        concept: "Attention 全连接",
        tagline: "一步看到所有人",
        bullets: ["任意两个词直接建立联系", "长距离依赖不衰减", "天然可并行"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "at-1",
        type: "judge",
        question: "判断正误：",
        statement: "注意力机制中，距离当前词越远的词，对它的影响一定越小。",
        answer: false,
        explanation: "注意力不看距离，只看「语义相关度」——隔得很远的词也可能获得高权重。",
      },
      {
        id: "at-2",
        type: "match",
        question: "把 Q / K / V 的职责配对：",
        pairs: [
          { left: "Query（查询）", right: "当前词想找什么" },
          { left: "Key（键）", right: "其他词能提供什么" },
          { left: "Value（值）", right: "其他词的实际内容" },
        ],
        explanation: "Q 找 K 匹配，权重作用于 V。",
      },
    ],
    final: {
      question: "用你自己的话解释：Attention 解决了什么问题？Q / K / V 大致在做什么？",
      hint: "从「长距离依赖 / 指代消解」切入，说明相似度打分 → 归一化 → 加权融合的流程。",
      keywords: ["权重", "相似", "Query", "Key", "Value", "相关", "打分", "融合", "长距离", "依赖", "全局", "softmax"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 3. Transformer（架构）
  // ===========================================================================
  {
    id: "transformer",
    name: "Transformer 架构",
    world: "llm-village",
    type: "main",
    difficulty: 3,
    minutes: 10,
    summary: "当前所有主流大模型的「地基」：自注意力 + 前馈网络 + 位置编码，可并行、可堆叠。",
    icon: "🏗️",
    color: "emerald",
    prerequisites: ["attention"],
    related: ["encoder", "decoder", "layer-norm", "residual"],
    unlocks: ["context-window", "sampling"],
    pos: { x: 480, y: 560 },
    encounter: {
      scenario:
        "2017 年之前，翻译模型的主流是 RNN：一个字一个字地处理，慢，且句子一长就「记不住前面的」。\n\n直到《Attention Is All You Need》这篇论文出现——作者们说：我们根本不需要 RNN，只要把注意力机制反复堆叠，就能做得更快更好。GPT、BERT、以及你正在用的每个大模型，都长在这份「地基」上。",
      prompt: "为什么说 Transformer 的「并行计算」和「多层堆叠」是两个决定性的突破？",
    },
    learn: {
      what: "Transformer 是当前所有主流 LLM 的基础架构：输入先加位置编码，经过多层「多头自注意力 + 前馈网络」堆叠，逐层提炼语义。",
      why: "RNN 无法并行、长序列信息衰减；CNN 感受野有限。业界需要一种能并行、能抓长距离依赖的架构。",
      problem: "既要充分利用 GPU 并行算力，又要让模型理解词序与深层语义。",
      mechanism:
        "位置编码注入「顺序信息」；多头自注意力让每个 Token 从多个子空间捕捉不同关系；前馈网络做非线性变换；残差连接与 LayerNorm 保证深层网络稳定训练。",
      flow: [
        { label: "嵌入 + 位置编码", desc: "词向量 + 顺序信息" },
        { label: "多头注意力", desc: "并行捕捉多类关系" },
        { label: "前馈网络", desc: "逐位非线性变换" },
        { label: "残差 + 归一化", desc: "保证深层稳定" },
        { label: "堆叠 N 层", desc: "语义逐层深化" },
      ],
    },
    compare: [
      {
        concept: "RNN",
        tagline: "顺序处理",
        bullets: ["逐字传递隐藏状态", "无法并行", "长依赖衰减"],
      },
      {
        concept: "CNN",
        tagline: "局部窗口",
        bullets: ["只能看固定感受野", "并行好但视野有限", "需加深才能看远"],
      },
      {
        concept: "Transformer",
        tagline: "全连接并行",
        bullets: ["注意力一步看全局", "完全并行、吃满 GPU", "堆叠层数换取深度"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "tf-1",
        type: "order",
        question: "把一条输入经过 Transformer 的处理流程排序：",
        items: ["位置编码注入顺序信息", "多头自注意力计算", "前馈网络变换", "残差连接与归一化"],
        answer: ["位置编码注入顺序信息", "多头自注意力计算", "前馈网络变换", "残差连接与归一化"],
        explanation: "嵌入与位置编码在前，注意力与前馈交替，残差与归一化保证稳定。",
      },
      {
        id: "tf-2",
        type: "single",
        question: "Transformer 相比 RNN 最核心的优势是？",
        options: ["消耗更少的内存", "可以完全并行处理整个序列", "不需要训练数据", "只能处理短文本"],
        answer: 1,
        explanation: "注意力计算可以一次性并行处理全部 Token，这是训练效率提升的关键。",
      },
    ],
    final: {
      question: "用你自己的话解释：Transformer 为什么能「并行处理整个序列」？它靠什么记住词与词之间的顺序？",
      hint: "从注意力全连接 + 位置编码两个角度回答，说明为什么它能取代 RNN。",
      keywords: ["注意力", "并行", "位置编码", "顺序", "堆叠", "全连接", "全局", "依赖", "RNN", "多头"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 4. Context Window（上下文窗口）
  // ===========================================================================
  {
    id: "context-window",
    name: "Context Window",
    world: "llm-village",
    type: "main",
    difficulty: 2,
    minutes: 7,
    summary: "模型一次能「看到」的 Token 上限：超出的部分会丢失或需要压缩处理。",
    icon: "🪟",
    color: "emerald",
    prerequisites: ["transformer"],
    related: ["kv-cache", "long-context", "rag"],
    unlocks: ["llm-boss"],
    pos: { x: 480, y: 800 },
    encounter: {
      scenario:
        "你复制了一份 5 万字的合同，发给模型：「帮我总结所有风险条款。」\n\n模型回复：「抱歉，内容太长，我无法处理。」\n\n不是它笨，而是它的「工作记忆」有上限——这个上限就叫上下文窗口。窗口之外的文字，对模型来说等于不存在。",
      prompt: "如果模型只能记住固定数量的 Token，面对超长内容时，我们有哪些处理策略？",
    },
    learn: {
      what: "上下文窗口（Context Window）是模型一次推理能容纳的 Token 数量上限，包含系统提示、历史对话与当前输入。",
      why: "注意力计算随序列长度近似平方增长，KV 缓存也随长度膨胀，无限长在工程上不可行。",
      problem: "长文档、多轮对话会超出窗口，导致信息被截断、丢失。",
      mechanism:
        "预训练时设定窗口上限（如 128K）。超出部分被截断；工程上通过 RAG（外部检索）、摘要压缩、滑动窗口等策略「装进」有限窗口。",
      flow: [
        { label: "输入拼装", desc: "系统提示 + 历史 + 新输入" },
        { label: "长度检查", desc: "是否超过窗口上限" },
        { label: "超限处理", desc: "截断 / RAG / 摘要" },
        { label: "模型推理", desc: "只看到窗口内内容" },
        { label: "输出", desc: "基于可见上下文回答" },
      ],
    },
    compare: [
      {
        concept: "短窗口（如 4K）",
        tagline: "轻量低成本",
        bullets: ["显存占用小", "长文档必须外挂检索", "适合轻量任务"],
      },
      {
        concept: "长窗口（如 128K+）",
        tagline: "直接吞下大部头",
        bullets: ["可一次处理长文档", "成本与延迟更高", "仍有上限，非无限"],
      },
      {
        concept: "无限上下文（当前做不到）",
        tagline: "理想态",
        bullets: ["成本随长度可控", "仍在研究前沿", "RAG 是现实近似方案"],
      },
    ],
    challenges: [
      {
        id: "cw-1",
        type: "single",
        question: "上下文窗口指的是？",
        options: ["模型权重的大小", "模型一次能处理的 Token 数量上限", "训练数据集的规模", "GPU 显存总量"],
        answer: 1,
        explanation: "窗口 = 单次推理可容纳的 Token 上限，包含提示与历史。",
      },
      {
        id: "cw-2",
        type: "judge",
        question: "判断正误：",
        statement: "当输入超过上下文窗口时，模型会「自动记住」被截断的部分并在后续回答中使用。",
        answer: false,
        explanation: "窗口之外的输入对模型完全不可见，截断即丢失。",
      },
    ],
    final: {
      question: "用你自己的话解释：什么是上下文窗口？当内容超长时，工程上通常怎么处理？",
      hint: "从「Token 上限」出发，覆盖截断、RAG 检索、摘要压缩三种典型策略。",
      keywords: ["上限", "Token", "截断", "RAG", "检索", "摘要", "压缩", "窗口", "丢失", "历史", "滑动"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 5. Sampling（采样与温度）— 支线
  // ===========================================================================
  {
    id: "sampling",
    name: "Sampling 采样",
    world: "llm-village",
    type: "branch",
    difficulty: 2,
    minutes: 6,
    summary: "控制「随机性」的旋钮：temperature 与 top-p 决定回答是稳定还是更有创意。",
    icon: "🌡️",
    color: "lime",
    prerequisites: ["transformer"],
    related: ["temperature", "top-p", "greedy"],
    unlocks: [],
    pos: { x: 200, y: 690 },
    encounter: {
      scenario:
        "你问模型两次同样的问题：「给我一个创业点子。」\n\n第一次它给出一个稳妥保守的回答；第二次却天马行空。为什么同一个模型、同样的输入，输出会不一样？\n\n因为模型生成时是「概率采样」，而不是每次都选最确定的那个词。而 temperature 这个旋钮，就控制着它敢不敢「冒险」。",
      prompt: "什么时候我们希望模型稳定复读，什么时候希望它脑洞大开？",
    },
    learn: {
      what: "采样策略决定模型从「下一个 Token 概率分布」中挑词的方式：greedy 恒选最可能，temperature 控制随机程度，top-p 控制候选范围。",
      why: "每次都选概率最高的词，回答会单调、重复、缺乏多样性；但随机太多又会跑题。",
      problem: "如何在「稳定正确」与「多样创意」之间调节。",
      mechanism:
        "temperature 对概率分布做缩放：越低越「锐化」（接近 greedy），越高越「平坦」（更随机）；top-p 只保留累计概率前 p 的候选词再采样。",
      flow: [
        { label: "模型输出分布", desc: "每个词一个概率" },
        { label: "Temperature", desc: "缩放分布的陡峭度" },
        { label: "Top-p 截断", desc: "砍掉低概率候选" },
        { label: "采样", desc: "按概率随机挑选" },
        { label: "生成下一词", desc: "拼回序列继续" },
      ],
    },
    compare: [
      {
        concept: "Greedy 贪心",
        tagline: "永远选最确定的",
        bullets: ["结果可复现", "容易单调重复", "适合事实问答"],
      },
      {
        concept: "低 Temperature",
        tagline: "保守稳定",
        bullets: ["接近确定输出", "适合代码 / 数学", "多样性低"],
      },
      {
        concept: "高 Temperature",
        tagline: "鼓励发散",
        bullets: ["输出更多样", "容易幻觉跑题", "适合创意写作"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "sp-1",
        type: "judge",
        question: "判断正误：",
        statement: "temperature 越高，模型越倾向于选择概率最高的那个词。",
        answer: false,
        explanation: "temperature 越高分布越平坦，越可能选中低概率词，随机性更强。",
      },
      {
        id: "sp-2",
        type: "single",
        question: "写代码场景，希望输出最稳定、最少幻觉，应该？",
        options: ["调高 temperature", "调低 temperature 并使用 top-p", "关闭上下文窗口", "增大训练数据"],
        answer: 1,
        explanation: "低 temperature 让分布更锐化，输出更接近确定答案，适合代码等精确任务。",
      },
    ],
    final: {
      question: "用你自己的话解释：temperature 和 top-p 分别控制什么？分别适合什么场景？",
      hint: "temperature 控制随机程度，top-p 控制候选范围；稳定场景低、创意场景高。",
      keywords: ["随机", "概率", "分布", "temperature", "top-p", "稳定", "创意", "多样性", "候选", "确定"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 6. Embedding（向量化）— 支线
  // ===========================================================================
  {
    id: "embedding",
    name: "Embedding 向量化",
    world: "llm-village",
    type: "branch",
    difficulty: 2,
    minutes: 7,
    summary: "把文本变成高维向量：语义相近的词，向量距离也近。RAG 与搜索的地基。",
    icon: "🧲",
    color: "lime",
    prerequisites: ["token"],
    related: ["vector", "cosine", "rag-valley"],
    unlocks: [],
    pos: { x: 760, y: 240 },
    encounter: {
      scenario:
        "你想给公司做一个「语义搜索」：输入「手机新品发布会」，应该能搜到「iPhone 发布活动」的新闻。\n\n但传统的关键词搜索只会按字面匹配——「手机」和「iPhone」根本不认识对方。\n\n有没有一种办法，让电脑理解「意思相近」这件事本身？",
      prompt: "如果计算机只能比较数字，我们要如何把「意思」变成可以比较的数字？",
    },
    learn: {
      what: "Embedding（向量化）是把 Token 序列映射成高维数值向量的过程，向量空间中的距离 ≈ 语义相似度。",
      why: "计算机无法直接比较文字「意思」，需要把语义编码成可计算的几何表示。",
      problem: "如何让「语义相近」在数值上可度量。",
      mechanism:
        "编码模型把整句文本压缩成一个稠密向量；语义相近的文本在向量空间中距离更近（常用余弦相似度衡量）；向量可存入向量数据库，供快速近邻检索。",
      flow: [
        { label: "文本输入", desc: "「手机新品发布会」" },
        { label: "编码模型", desc: "压缩为高维向量" },
        { label: "向量空间", desc: "[0.12, -0.35, …]" },
        { label: "相似度计算", desc: "余弦相似度排序" },
        { label: "语义检索", desc: "返回最相关结果" },
      ],
    },
    compare: [
      {
        concept: "关键词匹配",
        tagline: "字面相等才命中",
        bullets: ["按字 / 词硬匹配", "同义改写全漏", "无需训练但很脆"],
      },
      {
        concept: "Embedding 语义检索",
        tagline: "意思相近即命中",
        bullets: ["同义句也能召回", "需要编码模型", "RAG / 搜索的基础"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "em-1",
        type: "single",
        question: "两个文本的向量「越接近」，通常意味着什么？",
        options: ["它们的长度越接近", "它们的语义越相似", "它们的作者相同", "它们出现在同一段落"],
        answer: 1,
        explanation: "Embedding 把语义编码进向量空间，距离近 = 语义近。",
      },
      {
        id: "em-2",
        type: "match",
        question: "把概念与作用配对：",
        pairs: [
          { left: "Embedding", right: "把文本变成向量" },
          { left: "余弦相似度", right: "衡量两个向量多接近" },
          { left: "向量数据库", right: "存储并快速检索向量" },
        ],
        explanation: "Embedding 产生向量，相似度比较向量，向量库组织向量。",
      },
    ],
    final: {
      question: "用你自己的话解释：为什么说「Embedding 让语义相近变成了数值相近」？",
      hint: "从编码模型 + 向量空间 + 距离度量三个环节说明语义如何变成可计算的数值。",
      keywords: ["向量", "语义", "相似", "编码", "距离", "余弦", "空间", "数值", "检索", "高维"],
      passRate: 0.6,
    },
  },

  // ===========================================================================
  // 7. Boss：自回归引擎
  // ===========================================================================
  {
    id: "llm-boss",
    name: "自回归引擎",
    world: "llm-village",
    type: "boss",
    difficulty: 4,
    minutes: 12,
    summary: "把 Token、注意力、Transformer 串成完整链路：LLM 生成一切文本的本质是「预测下一个词」。",
    icon: "🧠",
    color: "emerald",
    prerequisites: ["context-window"],
    related: ["autoregressive", "next-token", "inference", "prompt-forest"],
    unlocks: [],
    pos: { x: 480, y: 1330 },
    encounter: {
      scenario:
        "朋友问你：「大语言模型到底是怎么把一句话变成回答的？」\n\n你很想告诉他：先分词、再嵌入、过几十层 Transformer、算出下一个词的概率、采样、拼回去……但这串术语他自己拼不起来。\n\n「预测下一个词」——听起来简单到不像真的，但 GPT 类模型的所有智能，都建立在这个循环上。",
      prompt: "如果你只能用一句话解释 LLM 的工作方式，那会是什么？",
    },
    learn: {
      what: "自回归引擎：LLM 逐 Token 生成——每步基于「已有全部 Token」预测下一个 Token 的概率分布，采样后拼回输入，循环直到出现停止符。",
      why: "把复杂的「生成一段话」拆解成无数个简单的「猜下一个词」，让神经网络可以分步学习与生成。",
      problem: "如何用一个模型完成从输入到输出的完整文本生成。",
      mechanism:
        "输入 Token 序列 → 嵌入 + Transformer 堆栈逐层计算 → 输出层映射为词表概率分布 → 采样选词 → 新词拼回序列 → 重复，直到生成结束标记或达到长度上限。",
      flow: [
        { label: "Prompt 分词", desc: "输入切成 Token" },
        { label: "嵌入 + 编码", desc: "变成向量表示" },
        { label: "Transformer 堆栈", desc: "逐层提炼语义" },
        { label: "概率分布", desc: "预测下一个词" },
        { label: "采样拼回", desc: "循环直到停止符" },
      ],
    },
    compare: [
      {
        concept: "分类模型",
        tagline: "把输入归到有限类别",
        bullets: ["输出是离散标签", "一次推理出结果", "不做逐词生成"],
      },
      {
        concept: "生成模型（自回归）",
        tagline: "逐词预测并续写",
        bullets: ["每步预测下一个词", "输出拼回输入循环", "所有 LLM 的本质"],
        highlight: true,
      },
    ],
    challenges: [
      {
        id: "lb-1",
        type: "order",
        question: "把「模型生成一句话」的完整链路排序：",
        items: ["Prompt 被分词成 Token", "Token 映射为向量", "Transformer 堆栈计算", "输出下一个词的概率分布", "采样选词并拼回序列"],
        answer: ["Prompt 被分词成 Token", "Token 映射为向量", "Transformer 堆栈计算", "输出下一个词的概率分布", "采样选词并拼回序列"],
        explanation: "从分词到采样拼回，循环直至停止符。",
      },
      {
        id: "lb-2",
        type: "judge",
        question: "判断正误：",
        statement: "LLM 生成文本时，是先把整段回答「想好」，再一次性输出。",
        answer: false,
        explanation: "LLM 是逐 Token 自回归生成，每一步只预测下一个词，边生成边拼回。",
      },
    ],
    final: {
      question: "你已走到 LLM 新手村的最深处。请用自己的话完整解释：从输入 Prompt 到输出完整回答，模型内部经历了一条怎样的链路？",
      hint: "覆盖：分词 → 嵌入 → Transformer 多层计算 → 逐 Token 预测 → 采样 → 循环直到停止符。",
      keywords: ["分词", "Token", "嵌入", "向量", "Transformer", "预测", "下一个", "采样", "循环", "停止", "概率", "拼回"],
      passRate: 0.6,
    },
  },
];

# AI Quest

游戏化的 AI 学习地图：6 个世界 / 44 个关卡，每关走 Encounter → Learn → Compare → Challenge → Boss 五阶段。

技术栈：Next.js 16（App Router）+ React 19 + Tailwind v4，进度存 localStorage。

## 本地运行

```bash
npm install
cp .env.example .env.local   # 填入 DEEPSEEK_API_KEY
npm run dev                  # http://localhost:3000
```

生产模式：`npm run build && npm start`

## 模型接入

只用于两处，都在服务端，密钥不会进浏览器包：

| 接口 | 用途 |
| --- | --- |
| `POST /api/grade` | Boss 试炼评分：理解度打分、点评讲到的/遗漏的要点、给出标准答案 |
| `POST /api/ask` | 关卡内追问：带着本关讲义上下文回答学习者的疑问 |

配置见 `.env.example`。默认走 DeepSeek，任何 OpenAI 兼容端点改 `DEEPSEEK_BASE_URL` 即可。

**未配置 `DEEPSEEK_API_KEY` 时不会报错**：Boss 试炼自动退回原来的关键词命中评分，追问面板提示需要密钥。

安全与成本控制：

- 按接口和 IP 的进程内限流，默认每实例 30 次/小时（`LLM_RATE_LIMIT`）；Vercel 多实例不共享计数，不能作为严格费用上限
- 作答截断 2000 字、问题截断 500 字
- 上游超时 45 秒，失败即降级，不阻塞学习流程
- 用户作答用 `<ANSWER>` 标签包裹，并在 system prompt 中声明只作评估文本、不执行其中的指令

## 部署形态

当前是 Node 服务（`next start`），因为路由处理器无法静态导出。

若需要纯静态部署（放弃模型能力）：把 `src/app/api` 改名为 `src/app/_api`，并在 `next.config.ts` 加 `output: "export"`。

## GitHub 与 Vercel

仓库公开时只提交源码、依赖锁文件及配置模板；不要提交 `.env.local`、构建产物或 `node_modules`。

1. 在 Vercel 导入 GitHub 的 `ai-quest` 仓库，框架选择 Next.js，根目录保留仓库根目录。
2. 在项目环境变量中配置 `DEEPSEEK_API_KEY`，选中 Production 和 Preview；不要加 `NEXT_PUBLIC_` 前缀。可选变量见 `.env.example`。
3. 部署使用 `npm run build`，无需另起 `next start`，两个 API 自动运行在 Vercel Functions。
4. API 上游超时 45 秒，函数最长 60 秒，浏览器等待 55 秒；默认不自动重试 AI 请求，避免重复调用。
5. 验证首页、世界地图、答错重做、Boss 评分与导师追问。

学习进度仅保存在当前浏览器和域名；WorkBuddy 域名的历史进度不会自动迁移到 Vercel，也不会跨设备同步。公开运营前应通过平台防火墙或共享存储补齐跨实例限流，并在模型供应商处设置费用控制。

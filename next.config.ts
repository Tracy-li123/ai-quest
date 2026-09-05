import type { NextConfig } from "next";

// 现在跑的是 Node 服务（next start），因为 /api/grade 与 /api/ask 需要服务端
// 持有模型密钥，静态导出无法提供路由处理器。
//
// 如果哪天要回到纯静态部署（不依赖模型）：
//   1. 把 src/app/api 改名为 src/app/_api（下划线开头 = App Router 私有目录，不生成路由）
//   2. 在下面加一行 output: "export"
// 此时页面会自动降级为本地关键词评分，追问面板显示「需要服务端配置密钥」。
const nextConfig: NextConfig = {
  // 生成目录式路径，与之前的线上链接保持一致
  trailingSlash: true,
};

export default nextConfig;

import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "../store/useProgress";

// 字体走纯系统栈（在 globals.css 的 :root 里定义）。
// 之前用 next/font/google 拉 Geist，构建时要访问 fonts.googleapis.com，
// 部署沙箱不通外网字体会直接构建失败，这里改为零网络依赖。

export const metadata: Metadata = {
  title: "AI Quest · 探索式 AI 学习",
  description: "把大模型知识变成一张可探索的世界地图：学习概念、完成挑战、击败 Boss，点亮完整 AI 知识体系。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}

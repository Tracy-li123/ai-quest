// Server Component 壳：负责静态导出参数，实际渲染委托给客户端组件
import { WORLDS } from "../../../lib/data/worlds";
import QuestPageClient from "./QuestPageClient";

// 静态导出：为全部 6 个世界生成静态页面
export function generateStaticParams() {
  return WORLDS.map((w) => ({ worldId: w.id }));
}

export default function QuestPage() {
  return <QuestPageClient />;
}

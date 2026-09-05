// Server Component 壳：负责静态导出参数，实际渲染委托给客户端组件
import { NODES } from "../../../lib/data";
import LessonPageClient from "./LessonPageClient";

// 静态导出：为全部 44 个关卡生成静态页面
export function generateStaticParams() {
  return NODES.map((n) => ({ nodeId: n.id }));
}

export default function LessonPage() {
  return <LessonPageClient />;
}

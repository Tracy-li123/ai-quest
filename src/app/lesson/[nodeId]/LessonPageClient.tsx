"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getNode } from "../../../lib/data";
import LessonView from "../../../components/LessonView";
import HUD from "../../../components/HUD";

export default function LessonPageClient() {
  const params = useParams<{ nodeId: string }>();
  const node = getNode(params.nodeId);

  return (
    <div className="min-h-screen">
      <HUD worldName={node?.world} compact />
      {node ? (
        <LessonView key={node.id} node={node} />
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="text-4xl">🗿</div>
          <div className="text-lg font-black text-slate-800">未找到该关卡</div>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            返回世界地图
          </Link>
        </div>
      )}
    </div>
  );
}

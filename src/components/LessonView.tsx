"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KnowledgeNode } from "../lib/types";
import { getNode, getWorld } from "../lib/data";
import { nodeStatus, xpForNode } from "../lib/progression";
import { useProgress } from "../store/useProgress";
import Challenge from "./Challenge";
import BossChallenge from "./BossChallenge";

const STAGES = [
  { id: "encounter", label: "Encounter", cn: "遭遇", icon: "🎬" },
  { id: "learn", label: "Learn", cn: "学习", icon: "📚" },
  { id: "compare", label: "Compare", cn: "对比", icon: "⚖️" },
  { id: "challenge", label: "Challenge", cn: "挑战", icon: "⚔️" },
  { id: "final", label: "Boss", cn: "试炼", icon: "👑" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const DIFF_LABEL = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

interface LessonViewProps {
  node: KnowledgeNode;
}

export default function LessonView({ node }: LessonViewProps) {
  const router = useRouter();
  const { completed, completeNode } = useProgress();
  const [stage, setStage] = useState<StageId>("encounter");
  const [challengePassed, setChallengePassed] = useState(false);
  const [completedNow, setCompletedNow] = useState(false);

  const status = nodeStatus(node, completed);
  const done = status === "completed";
  const isBoss = node.type === "boss";
  const xp = xpForNode(node);
  const nextNodes = node.unlocks
    .map((id) => getNode(id))
    .filter(Boolean) as KnowledgeNode[];

  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const finalLocked = !challengePassed && !done && !completedNow;

  const handleComplete = () => {
    completeNode(node.id, xp);
    setCompletedNow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* 面包屑 */}
      <div className="mb-5 flex items-center gap-2 text-[12px] font-medium text-slate-400">
        <Link href="/" className="transition hover:text-indigo-600">
          世界地图
        </Link>
        <span>/</span>
        <Link href={`/world/${node.world}`} className="transition hover:text-indigo-600">
          {getWorld(node.world)?.name ?? node.world}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-600">{node.name}</span>
      </div>

      {/* 关卡头 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${
              isBoss ? "quest-boss-head" : `quest-icon-${node.color}`
            }`}
          >
            {node.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{node.name}</h1>
              {isBoss && (
                <span className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-black tracking-widest text-amber-300">
                  BOSS
                </span>
              )}
              {done && !completedNow && (
                <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                  ✓ 已通关
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2.5 text-[12px] text-slate-500">
              <span className="text-amber-500">{DIFF_LABEL[node.difficulty]}</span>
              <span>⏱ {node.minutes} 分钟</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-600">+{xp} XP</span>
            </div>
          </div>
        </div>
        <div className="text-right text-[11.5px] text-slate-400">
          <div>{node.summary}</div>
        </div>
      </div>

      {/* 通关庆祝 */}
      {completedNow && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 text-center shadow-sm">
          <div className="text-3xl">🏆</div>
          <div className="mt-1 text-xl font-black text-slate-900">关卡完成！</div>
          <div className="mt-1 text-[13px] font-medium text-slate-600">
            你已掌握 <span className="font-black text-emerald-600">{node.name}</span> · 获得{" "}
            <span className="font-black text-indigo-600">+{xp} XP</span>
          </div>
          {nextNodes.length > 0 && (
            <div className="mt-3 text-[12px] text-slate-500">
              解锁了：
              {nextNodes.map((n) => (
                <span key={n.id} className="mx-1 inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-bold text-violet-700 ring-1 ring-violet-200">
                  {n.type === "boss" ? "👑" : "→"} {n.name}
                </span>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push(`/world/${node.world}`)}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105"
            >
              返回地图
            </button>
            {nextNodes[0] && (
              <button
                onClick={() => router.push(`/lesson/${nextNodes[0].id}`)}
                className="rounded-xl border border-indigo-200 bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
              >
                继续：{nextNodes[0].name} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* 五阶段步骤条 */}
      <div className="mt-6 flex items-center gap-1">
        {STAGES.map((s, i) => {
          const active = i === stageIndex;
          const passed = i < stageIndex || (stage === "challenge" && challengePassed) || done || completedNow;
          return (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                <div className={`h-px flex-1 ${i === 0 ? "opacity-0" : passed ? "bg-emerald-300" : "bg-slate-200"}`} />
                <button
                  onClick={() => setStage(s.id)}
                  disabled={i > stageIndex && !(i === 4 && challengePassed) && !done}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] transition ${
                    active
                      ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200"
                      : passed
                        ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                  title={`${s.cn} ${s.label}`}
                >
                  {passed && !active ? "✓" : s.icon}
                </button>
                <div className={`h-px flex-1 ${i === STAGES.length - 1 ? "opacity-0" : passed ? "bg-emerald-300" : "bg-slate-200"}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-indigo-600" : passed ? "text-emerald-600" : "text-slate-400"}`}>
                {s.cn}
              </span>
            </div>
          );
        })}
      </div>

      {/* 内容区 */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {stage === "encounter" && <EncounterStage node={node} onNext={() => setStage("learn")} />}
        {stage === "learn" && <LearnStage node={node} onNext={() => setStage("compare")} />}
        {stage === "compare" && <CompareStage node={node} onNext={() => setStage("challenge")} />}
        {stage === "challenge" && (
          <Challenge
            challenges={node.challenges}
            onAllPassed={() => {
              setChallengePassed(true);
              setStage("final");
            }}
          />
        )}
        {stage === "final" &&
          (finalLocked ? (
            <div className="py-10 text-center">
              <div className="text-3xl">🔒</div>
              <div className="mt-2 text-[14px] font-semibold text-slate-600">
                最终试炼已锁定：请先完成挑战阶段
              </div>
              <button
                onClick={() => setStage("challenge")}
                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
              >
                返回挑战 ⚔️
              </button>
            </div>
          ) : (
            <BossChallenge
              isBoss={isBoss}
              final={node.final}
              alreadyCompleted={done}
              onPassed={() => handleComplete()}
              nodeName={node.name}
              lecture={buildLecture(node)}
            />
          ))}
      </div>
    </div>
  );
}

/**
 * 把本关讲义浓缩成一段文本，作为模型评估与追问的上下文。
 * 只取已有字段，不重复维护一份内容。
 */
function buildLecture(node: KnowledgeNode): string {
  const flow = node.learn.flow.map((f, i) => `${i + 1}. ${f.label}：${f.desc}`).join("\n");
  return [
    `一句话：${node.learn.what}`,
    `为什么出现：${node.learn.why}`,
    `解决什么问题：${node.learn.problem}`,
    `核心机制：${node.learn.mechanism}`,
    `核心流程：\n${flow}`,
  ].join("\n");
}

// ---- 1. Encounter ----------------------------------------------------------

function EncounterStage({ node, onNext }: { node: KnowledgeNode; onNext: () => void }) {
  return (
    <div>
      <StageHeader icon="🎬" title="Encounter · 遭遇" desc="先看一个现实问题，思考为什么这个概念会出现" />
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-[13.5px] leading-relaxed whitespace-pre-line text-slate-700">{node.encounter.scenario}</div>
      </div>
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="text-[11px] font-black uppercase tracking-wider text-indigo-500">🤔 想一想</div>
        <div className="mt-1.5 text-[14px] font-semibold leading-relaxed text-indigo-900">{node.encounter.prompt}</div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105"
        >
          进入学习 →
        </button>
      </div>
    </div>
  );
}

// ---- 2. Learn --------------------------------------------------------------

const LEARN_CARD_STYLE: Record<string, { box: string; label: string }> = {
  indigo: { box: "border-indigo-100 bg-indigo-50/50", label: "text-indigo-600" },
  sky: { box: "border-sky-100 bg-sky-50/50", label: "text-sky-600" },
  amber: { box: "border-amber-100 bg-amber-50/50", label: "text-amber-600" },
  violet: { box: "border-violet-100 bg-violet-50/50", label: "text-violet-600" },
};

function LearnStage({ node, onNext }: { node: KnowledgeNode; onNext: () => void }) {
  const cards = [
    { label: "一句话 · 是什么", text: node.learn.what, color: "indigo" },
    { label: "为什么出现", text: node.learn.why, color: "sky" },
    { label: "解决什么问题", text: node.learn.problem, color: "amber" },
    { label: "核心机制", text: node.learn.mechanism, color: "violet" },
  ];
  return (
    <div>
      <StageHeader icon="📚" title="Learn · 学习" desc="用最简洁的方式理解这个概念" />
      {/* 四张卡片 */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const style = LEARN_CARD_STYLE[c.color] ?? LEARN_CARD_STYLE.indigo;
          return (
            <div key={c.label} className={`rounded-2xl border p-4 ${style.box}`}>
              <div className={`text-[11px] font-black uppercase tracking-wider ${style.label}`}>{c.label}</div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-slate-700">{c.text}</div>
            </div>
          );
        })}
      </div>
      {/* 核心流程 */}
      <div className="mt-5">
        <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">核心流程</div>
        <div className="flex flex-col gap-2 overflow-x-auto sm:flex-row sm:items-stretch">
          {node.learn.flow.map((f, i) => (
            <div key={f.label} className="flex min-w-[140px] flex-1 items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <div className="text-[13px] font-black text-slate-800">{f.label}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{f.desc}</div>
              </div>
              {i < node.learn.flow.length - 1 && (
                <span className="shrink-0 text-lg font-black text-indigo-400 sm:-mx-1">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105"
        >
          对比相近概念 →
        </button>
      </div>
    </div>
  );
}

// ---- 3. Compare ------------------------------------------------------------

function CompareStage({ node, onNext }: { node: KnowledgeNode; onNext: () => void }) {
  return (
    <div>
      <StageHeader icon="⚖️" title="Compare · 对比" desc="它和相近概念有什么区别？" />
      <div className="mt-5 space-y-3">
        {node.compare.map((row) => (
          <div
            key={row.concept}
            className={`rounded-2xl border p-4 transition ${
              row.highlight
                ? "border-indigo-300 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`text-[15px] font-black ${row.highlight ? "text-indigo-700" : "text-slate-800"}`}>
                {row.highlight ? "▍" : ""}
                {row.concept}
              </span>
              <span className="text-[12px] font-medium text-slate-400">{row.tagline}</span>
              {row.highlight && (
                <span className="ml-auto rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-black text-white">
                  本关卡
                </span>
              )}
            </div>
            <ul className="mt-2 space-y-1">
              {row.bullets.map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[12.5px] leading-relaxed text-slate-600">
                  <span className={`mt-[7px] h-1 w-1 shrink-0 rounded-full ${row.highlight ? "bg-indigo-400" : "bg-slate-300"}`} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:brightness-105"
        >
          进入挑战 ⚔️ →
        </button>
      </div>
    </div>
  );
}

// ---- 公共 ------------------------------------------------------------------

function StageHeader({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl">{icon}</span>
      <div>
        <div className="text-[15px] font-black text-slate-900">{title}</div>
        <div className="text-[12px] text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

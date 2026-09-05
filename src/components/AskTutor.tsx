"use client";

import { useRef, useState } from "react";
import { postJsonWithRetry } from "../lib/retryFetch";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface AskTutorProps {
  nodeName: string;
  lecture: string;
  /** 服务端未配置模型密钥时，整个面板不可用 */
  available: boolean;
}

/**
 * 关卡内随行导师：针对当前概念追问，上下文带本关讲义。
 */
export default function AskTutor({ nodeName, lecture, available }: AskTutorProps) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 50);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: q }]);
    scrollToBottom();

    const { data, networkError } = await postJsonWithRetry<{ answer?: string; error?: string }>(
      "/api/ask",
      { nodeName, lecture, question: q, history: msgs.slice(-6) },
    );

    try {
      if (!data?.answer) {
        throw new Error(networkError ? "网络连接失败" : data?.error || "导师暂时无法回答");
      }
      setMsgs((m) => [...m, { role: "assistant", content: data.answer! }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "网络异常，请稍后再试";
      setError(msg);
      setMsgs((m) => m.slice(0, -1)); // 撤掉没发出去的问题
      setInput(q);
    } finally {
      setBusy(false);
      scrollToBottom();
    }
  };

  if (!available) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-500">
        追问功能需要服务端配置模型密钥后才能使用。
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="flex items-center gap-2">
        <span className="text-base">🧭</span>
        <div className="text-[12.5px] font-black text-slate-800">还有疑问？继续追问</div>
        <div className="text-[11px] text-slate-400">围绕「{nodeName}」，可以连着问</div>
      </div>

      {(msgs.length > 0 || busy) && (
        <div ref={listRef} className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-indigo-500 px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                    : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700"
                }
              >
                {m.role === "assistant" && (
                  <div className="mb-1 text-[10.5px] font-black uppercase tracking-wider text-indigo-400">
                    导师
                  </div>
                )}
                <div className="whitespace-pre-line">{m.content}</div>
              </div>
            </div>
          ))}
          {busy && (
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-400">
              导师正在思考…
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-2 text-[12px] font-medium text-rose-600">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          maxLength={500}
          aria-label="向导师提问"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="例如：它和微调到底差在哪？"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          提问
        </button>
      </form>
    </div>
  );
}

"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { ProgressState } from "../lib/types";
import { getNode, NODES } from "../lib/data";
import { xpForNode } from "../lib/progression";

const STORAGE_KEY = "ai-quest-progress-v1";
const CHANGE = "ai-quest-progress-change";
const EMPTY: ProgressState = { completed: [], xp: 0 };
let cachedRaw: string | null | undefined;
let snapshot = EMPTY;
interface ProgressContextValue extends ProgressState {
  isCompleted: (id: string) => boolean;
  completeNode: (id: string, xp: number) => void;
  reset: () => void;
}
const Context = createContext<ProgressContextValue | null>(null);
function read(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return snapshot;
    cachedRaw = raw;
    const value: unknown = raw ? JSON.parse(raw) : null;
    const ids = value && typeof value === "object" && "completed" in value && Array.isArray(value.completed) ? value.completed : [];
    const completed = NODES.filter((n) => ids.includes(n.id)).map((n) => n.id);
    snapshot = { completed, xp: completed.reduce((sum, id) => sum + xpForNode(getNode(id)!), 0) };
  } catch { /* Storage unavailable: retain this tab's in-memory progress. */ }
  return snapshot;
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGE, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(CHANGE, listener); };
}
function write(value: ProgressState) {
  snapshot = value;
  try {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
  } catch { /* Memory fallback remains usable. */ }
  window.dispatchEvent(new Event(CHANGE));
}
function completeNode(id: string) {
  const current = read();
  const node = getNode(id);
  if (!node || current.completed.includes(id)) return;
  write({ completed: [...current.completed, id], xp: current.xp + xpForNode(node) });
}
function reset() { write(EMPTY); }
const serverSnapshot = () => EMPTY;
export function ProgressProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, read, serverSnapshot);
  const value = useMemo(() => ({ ...state, completeNode, reset, isCompleted: (id: string) => state.completed.includes(id) }), [state]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("useProgress must be used within ProgressProvider");
  return value;
}

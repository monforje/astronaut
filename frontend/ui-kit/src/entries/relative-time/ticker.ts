/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useSyncExternalStore } from "react";

const TICK_MS = 1000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let snapshot = Date.now();
let listening = false;

const hidden = () => typeof document !== "undefined" && document.hidden;

function publish() {
  snapshot = Date.now();
  for (const listener of listeners) listener();
}

function start() {
  if (timer === undefined && listeners.size > 0 && !hidden()) timer = setInterval(publish, TICK_MS);
}

function stop() {
  if (timer !== undefined) clearInterval(timer);
  timer = undefined;
}

function onVisibility() {
  if (hidden()) stop();
  else {
    publish();
    start();
  }
}

export function subscribeTicker(listener: () => void): () => void {
  if (listeners.size === 0) snapshot = Date.now();
  listeners.add(listener);
  if (!listening && typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibility);
    listening = true;
  }
  start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stop();
      if (listening) document.removeEventListener("visibilitychange", onVisibility);
      listening = false;
    }
  };
}

export const tickerSubscribers = () => listeners.size;

function currentSnapshot() {
  if (listeners.size === 0 && Math.abs(Date.now() - snapshot) > 500) snapshot = Date.now();
  return snapshot;
}

const noopSubscribe = () => () => undefined;

export function useTicker(granularityMs: number, enabled = true): number {
  const bucket = (value: number) => Math.floor(value / granularityMs) * granularityMs;
  return useSyncExternalStore(
    enabled ? subscribeTicker : noopSubscribe,
    () => (enabled ? bucket(currentSnapshot()) : 0),
    () => (enabled ? bucket(currentSnapshot()) : 0),
  );
}

'use client';

import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(() => listeners.forEach(l => l()), 15_000);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

const MINUTE = 60_000;
const getMinute = () => Math.floor(Date.now() / MINUTE);
const getServerMinute = () => null;

/**
 * Current time, rounded to the minute. `null` on the server and during
 * hydration — the server can't know the visitor's "now".
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  return minute === null ? null : new Date(minute * MINUTE);
}

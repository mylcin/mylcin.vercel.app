'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';
import { DARK_QUERY, THEME_STORAGE_KEY as STORAGE_KEY } from './theme-script';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

function resolve(preference: ThemePreference): Theme {
  if (preference !== 'system') return preference;
  return matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  // Suppress transitions for one frame so colors switch in one step.
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove('theme-switching'))
  );
}

const listeners = new Set<() => void>();
type Snapshot = { preference: ThemePreference; theme: Theme | null };
let snapshot: Snapshot | null = null;

function emit() {
  snapshot = null;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (readPreference() === 'system') apply(resolve('system'));
    emit();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    apply(resolve(readPreference()));
    emit();
  };
  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): Snapshot {
  if (!snapshot) {
    const preference = readPreference();
    snapshot = { preference, theme: resolve(preference) };
  }
  return snapshot;
}

const serverSnapshot: Snapshot = { preference: 'system', theme: null };

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Private mode: the switch still applies for this page view.
  }
  apply(resolve(preference));
  emit();
}

/**
 * `theme` is null during SSR and hydration — render something neutral until
 * it resolves, since the server can't know the visitor's theme.
 */
export function useTheme(): {
  preference: ThemePreference;
  theme: Theme | null;
  setPreference: (preference: ThemePreference) => void;
} {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot
  );

  // React's dev-only Strict Mode remount resets attributes on <html>; put ours back.
  useLayoutEffect(() => {
    apply(resolve(readPreference()));
  }, []);

  return { ...state, setPreference: setThemePreference };
}

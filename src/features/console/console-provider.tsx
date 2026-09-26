'use client';

import {
  Component,
  createContext,
  lazy,
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ConsoleIndex } from './types';

/**
 * The console is optional: everything outside this folder works without it.
 * Remove <ConsoleProvider> from the layout and every component that uses
 * `useConsole()` (header trigger, "run it", the 404 link) hides itself.
 *
 * The panel itself is code-split and loads on first open (or on hover of the
 * trigger), so visitors who never open it never download it.
 */
const loadPanel = () => import('./console-panel');
const ConsolePanel = lazy(loadPanel);

interface ConsoleApi {
  isOpen: boolean;
  /** Opens the console, optionally running a command right away. */
  open(command?: string): void;
  close(): void;
  prefetch(): void;
}

const ConsoleContext = createContext<ConsoleApi | null>(null);

/** Set before a language switch, so the console reopens in the new language. */
export const REOPEN_KEY = 'console-reopen';

/** One bad render must not take the page down with it: close and start fresh. */
class PanelBoundary extends Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function ConsoleProvider({
  index,
  children,
}: {
  index: ConsoleIndex;
  children: React.ReactNode;
}) {
  const [isOpen, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [queued, setQueued] = useState<{ command: string; id: number } | null>(
    null
  );
  const [generation, setGeneration] = useState(0);

  const api = useMemo<ConsoleApi>(
    () => ({
      isOpen,
      open(command) {
        setLoaded(true);
        setOpen(true);
        if (command)
          setQueued(previous => ({ command, id: (previous?.id ?? 0) + 1 }));
      },
      close: () => setOpen(false),
      prefetch: () => void loadPanel(),
    }),
    [isOpen]
  );

  // ⌘K / Ctrl+K only. A bare-key shortcut would fire for speech input and
  // stray keystrokes, with no way to turn it off (WCAG 2.1.4).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k')
        return;
      event.preventDefault();
      setLoaded(true);
      setOpen(open => !open);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // After `lang xx` the layout remounts in the new language; pick up where
  // the visitor was. The flag expires so it can't reopen much later.
  useEffect(() => {
    let reopen = false;
    try {
      const at = Number(sessionStorage.getItem(REOPEN_KEY));
      sessionStorage.removeItem(REOPEN_KEY);
      reopen = Date.now() - at < 10_000;
    } catch {}
    if (!reopen) return;
    const timer = setTimeout(() => {
      setLoaded(true);
      setOpen(true);
    });
    return () => clearTimeout(timer);
  }, []);

  return (
    <ConsoleContext value={api}>
      {children}
      {loaded && (
        <PanelBoundary
          key={generation}
          onError={() => {
            setOpen(false);
            setGeneration(g => g + 1);
          }}
        >
          <Suspense fallback={null}>
            <ConsolePanel
              index={index}
              open={isOpen}
              queued={queued}
              onClose={() => setOpen(false)}
            />
          </Suspense>
        </PanelBoundary>
      )}
    </ConsoleContext>
  );
}

/** `null` when the console isn't mounted — callers should degrade gracefully. */
export function useConsole(): ConsoleApi | null {
  return use(ConsoleContext);
}

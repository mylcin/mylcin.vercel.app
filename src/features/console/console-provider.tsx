'use client';

import {
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
 * Remove <ConsoleProvider> from the layout and <ConsoleTrigger> from the
 * header, and components that use `useConsole()` quietly fall back.
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

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const shortcut =
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') ||
        (event.key === '`' &&
          !event.metaKey &&
          !event.ctrlKey &&
          !isEditable(event.target));
      if (!shortcut) return;
      event.preventDefault();
      setLoaded(true);
      setOpen(open => !open);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <ConsoleContext value={api}>
      {children}
      {loaded && (
        <Suspense fallback={null}>
          <ConsolePanel
            index={index}
            open={isOpen}
            queued={queued}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </ConsoleContext>
  );
}

/** `null` when the console isn't mounted — callers should degrade gracefully. */
export function useConsole(): ConsoleApi | null {
  return use(ConsoleContext);
}

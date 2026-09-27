'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { rememberLocale, urlInLocale, useI18n } from '@/i18n/client';
import { localeMeta, stripLocale, type Locale } from '@/i18n/config';
import { useTheme } from '@/lib/theme';
import { commands } from './commands';
import { REOPEN_KEY } from './console-provider';
import { runLine, type ShellHost } from './commands/run';
import { complete, historyHint } from './engine/complete';
import { buildFs, displayPath, nearestDir } from './engine/fs';
import { ConsoleActionsContext, Muted } from './output';
import type { ConsoleIndex } from './types';

interface Entry {
  id: number;
  cwd: string;
  input: string;
  output: React.ReactNode[];
}

type Source = 'typed' | 'output' | 'menu';

const HISTORY_KEY = 'console-history';
const HISTORY_LIMIT = 100;

function loadHistory(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Private mode: history lasts for this page view.
  }
}

const isTouch = () => matchMedia('(pointer: coarse)').matches;

function Prompt({ handle, cwd }: { handle: string; cwd: string }) {
  return (
    <span aria-hidden="true" className="shrink-0 whitespace-nowrap">
      <span className="hidden text-muted sm:inline">visitor@{handle}:</span>
      <span className="text-accent-ink">{displayPath(cwd)}</span>
      <span className="text-muted">$</span>
    </span>
  );
}

export default function ConsolePanel({
  index,
  open,
  queued,
  onClose,
}: {
  index: ConsoleIndex;
  open: boolean;
  queued: { command: string; id: number } | null;
  onClose: () => void;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const handledQueue = useRef(0);
  const draft = useRef('');

  const root = useMemo(
    () =>
      buildFs(index, {
        status: status => t.work.status[status],
        about: {
          experience: t.about.sections.experience,
          skills: t.about.sections.skills,
          education: t.about.sections.education,
          contact: t.about.sections.contact,
        },
        readme: t.home.runningHead,
        work: t.work.title,
        blog: t.blog.title,
        aboutDir: t.about.title,
        language: l => localeMeta[l].label,
      }),
    [index, t]
  );

  // The working directory is the route. A `cd` sets a pending value so the
  // prompt moves at once; it only applies while the route is still where the
  // `cd` started, so Back or a link click later can't resurrect it.
  const routeCwd = nearestDir(root, stripLocale(pathname)).path;
  const [pending, setPending] = useState<{ cwd: string; from: string } | null>(
    null
  );
  const [seenRoute, setSeenRoute] = useState(routeCwd);
  if (seenRoute !== routeCwd) {
    setSeenRoute(routeCwd);
    setPending(null);
  }
  const cwd = pending && pending.from === routeCwd ? pending.cwd : routeCwd;

  // OLDPWD follows the route too, however it changed (cd, a link, Back).
  const previousCwd = useRef<string | null>(null);
  const lastRoute = useRef(routeCwd);
  useEffect(() => {
    if (lastRoute.current !== routeCwd) previousCwd.current = lastRoute.current;
    lastRoute.current = routeCwd;
  }, [routeCwd]);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const hint = historyHint(value, history);

  function focusAfterCommand(source: Source) {
    // On touch screens, don't summon the keyboard uninvited — but keep focus
    // inside the dialog (the menu button that had it may be gone).
    if (isTouch() && document.activeElement !== inputRef.current) {
      if (source === 'menu') logRef.current?.focus({ preventScroll: true });
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  }

  async function execute(line: string, source: Source) {
    const input = line.trim();
    const id = nextId.current++;
    const nextHistory = input
      ? [...history.filter(entry => entry !== input), input].slice(
          -HISTORY_LIMIT
        )
      : history;

    const host: ShellHost = {
      t,
      locale,
      index,
      root,
      theme: { preference: theme.preference, resolved: theme.theme },
      history: nextHistory,
      cwd,
      previousCwd: previousCwd.current,
      go(href) {
        router.push(`/${locale}${href === '/' ? '' : href}`);
      },
      navigate(href, target: Locale = locale) {
        if (target !== locale) rememberLocale(target);
        router.push(`/${target}${href === '/' ? '' : href}`);
      },
      openExternal(href) {
        window.open(
          href,
          href.startsWith('mailto:') ? '_self' : '_blank',
          'noopener'
        );
      },
      setTheme: theme.setPreference,
      switchLocale(target) {
        rememberLocale(target);
        try {
          sessionStorage.setItem(REOPEN_KEY, String(Date.now()));
        } catch {}
        router.push(urlInLocale(target));
      },
      async copy(text) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          return false;
        }
      },
    };

    // Yield once, so no state is set synchronously inside effects that call us.
    await Promise.resolve();
    const result = await runLine(input, host);

    if (input) {
      setHistory(nextHistory);
      saveHistory(nextHistory);
    }
    previousCwd.current = result.previousCwd;
    if (result.moved) setPending({ cwd: result.cwd, from: routeCwd });

    const entry = { id, cwd, input, output: result.output };
    if (result.clearedAt === null) {
      setEntries(previous => [...previous, entry]);
    } else {
      // `clear && ls` clears, then shows what came after the clear.
      const after = result.output.slice(result.clearedAt);
      setEntries(after.length ? [{ ...entry, output: after }] : []);
    }
    setValue('');
    setHistoryIndex(null);
    setOptions([]);

    // Picking a destination from the menu means "take me there".
    if (result.close || (result.moved && source === 'menu')) onClose();
    else focusAfterCommand(source);
  }

  // Open and close the native dialog from props.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      if (!isTouch()) inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Commands requested from outside (e.g. the home page's synopsis).
  useEffect(() => {
    if (!open || !queued || handledQueue.current === queued.id) return;
    handledQueue.current = queued.id;
    void execute(queued.command, 'output');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per queued id
  }, [open, queued]);

  // Keep the newest output in view.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [entries, options]);

  function recall(index: number | null) {
    setHistoryIndex(index);
    setValue(index === null ? draft.current : history[index]);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const key = event.key.toLowerCase();

    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      if (historyIndex === null) draft.current = value; // keep what was being typed
      recall(
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1)
      );
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      recall(historyIndex + 1 >= history.length ? null : historyIndex + 1);
    } else if (event.key === 'Tab' && value.trim()) {
      event.preventDefault();
      const result = complete(value, {
        commands,
        root,
        cwd,
        handle: index.profile.handle,
      });
      setValue(result.value);
      setOptions(result.options.length > 1 ? result.options : []);
    } else if (
      event.key === 'ArrowRight' &&
      hint &&
      input.selectionStart === value.length
    ) {
      event.preventDefault();
      setValue(value + hint);
    } else if (event.ctrlKey && key === 'l') {
      event.preventDefault();
      setEntries([]);
    } else if (
      event.ctrlKey &&
      key === 'c' &&
      input.selectionStart === input.selectionEnd
    ) {
      // Only without a selection, so copying selected text still works.
      event.preventDefault();
      setEntries(previous => [
        ...previous,
        { id: nextId.current++, cwd, input: `${value}^C`, output: [] },
      ]);
      setValue('');
      setHistoryIndex(null);
      setOptions([]);
    }
  }

  const quickItems = [
    { command: 'cd ~', label: t.console.quick.home },
    { command: 'cd ~/work', label: t.console.quick.work },
    { command: 'cd ~/blog', label: t.console.quick.blog },
    { command: 'cd ~/about', label: t.console.quick.about },
    { command: 'email', label: t.console.quick.email },
    { command: 'help', label: t.console.quick.help },
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="console-title"
      data-testid="console-dialog"
      onClose={onClose}
      onCancel={onClose}
      onClick={event => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={[
        'fixed m-0 flex max-h-none max-w-none flex-col overflow-hidden border-0 bg-raised p-0 text-fg',
        'inset-0 h-dvh w-full',
        'sm:inset-x-0 sm:top-0 sm:bottom-auto sm:mx-auto sm:h-[min(36rem,74dvh)] sm:w-[min(52rem,calc(100%-2rem))] sm:rounded-b-md sm:shadow-overlay',
        'not-open:hidden',
        '-translate-y-2 opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-(--dur-slow) ease-out',
        'open:translate-y-0 open:opacity-100 starting:open:-translate-y-2 starting:open:opacity-0',
        'backdrop:bg-transparent backdrop:transition-[background-color,display,overlay] backdrop:transition-discrete backdrop:duration-(--dur-slow)',
        'open:backdrop:bg-(--backdrop) starting:open:backdrop:bg-transparent',
      ].join(' ')}
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-4 border-b border-line pr-1.5 pl-4 font-mono text-xs text-muted">
        <h2 id="console-title" className="truncate">
          {t.console.title} <span className="text-faint">—</span>{' '}
          {displayPath(cwd)}
        </h2>
        <div className="flex items-center gap-3">
          <span id="console-keys" className="sr-only sm:not-sr-only">
            {t.console.keys}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.console.close}
            data-testid="console-close"
            className="inline-flex size-9 items-center justify-center rounded-md transition-colors duration-(--dur-fast) hover:bg-bg hover:text-fg"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 [scrollbar-width:thin] overflow-y-auto overscroll-contain px-4 py-4 font-mono text-sm leading-relaxed"
        onClick={event => {
          if (
            event.target === event.currentTarget &&
            !getSelection()?.toString()
          ) {
            inputRef.current?.focus({ preventScroll: true });
          }
        }}
      >
        <ConsoleActionsContext
          value={{
            run: command => void execute(command, 'output'),
            fill: text => {
              setValue(text);
              inputRef.current?.focus();
            },
          }}
        >
          {entries.length === 0 && (
            <div className="mb-5">
              <p className="text-muted">{t.console.welcome}</p>
              <ul className="mt-3 grid gap-px sm:mt-2">
                {quickItems.map(item => (
                  <li key={item.command}>
                    <button
                      type="button"
                      onClick={() => void execute(item.command, 'menu')}
                      className="group flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors duration-(--dur-fast) hover:bg-bg sm:-mx-2 sm:w-[calc(100%+1rem)] sm:py-1"
                    >
                      <span
                        aria-hidden="true"
                        className="text-faint group-hover:text-accent-ink"
                      >
                        →
                      </span>
                      <span className="font-serif text-base sm:font-mono sm:text-sm">
                        {item.label}
                      </span>
                      <span className="ml-auto text-muted">{item.command}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            tabIndex={-1}
            className="outline-none"
          >
            {entries.map(entry => (
              <div key={entry.id} className="mb-4">
                <div className="flex gap-2">
                  <Prompt handle={index.profile.handle} cwd={entry.cwd} />
                  <span className="break-all">{entry.input}</span>
                </div>
                {entry.output.length > 0 && (
                  <div className="mt-1 break-words">{entry.output}</div>
                )}
              </div>
            ))}
          </div>
        </ConsoleActionsContext>

        <form
          onSubmit={event => {
            event.preventDefault();
            void execute(value, 'typed');
          }}
          className="flex items-baseline gap-2"
        >
          <label htmlFor="console-input" className="sr-only">
            {t.console.inputLabel}
          </label>
          <Prompt handle={index.profile.handle} cwd={cwd} />
          <div className="relative min-w-0 flex-1">
            {/* Ghost text: the rest of a matching history entry (→ accepts). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre text-faint"
            >
              <span className="invisible">{value}</span>
              {hint}
            </span>
            <input
              ref={inputRef}
              id="console-input"
              value={value}
              onChange={event => {
                setValue(event.target.value);
                setOptions([]);
                setHistoryIndex(null);
              }}
              onKeyDown={onKeyDown}
              aria-describedby="console-keys"
              placeholder={entries.length ? '' : t.console.placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              className="relative w-full bg-transparent caret-accent outline-none [caret-shape:block] placeholder:text-muted"
            />
          </div>
        </form>

        {/* Always mounted: a live region created together with its content
            usually isn't announced. */}
        <div
          aria-live="polite"
          className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-muted empty:hidden"
        >
          {options.length > 0 && (
            <>
              <span className="sr-only">{t.console.suggestions}:</span>
              {options.map(option => (
                <Muted key={option}>{option}</Muted>
              ))}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}

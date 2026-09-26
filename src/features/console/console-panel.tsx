'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { rememberLocale, useI18n } from '@/i18n/client';
import {
  localeMeta,
  localizePath,
  stripLocale,
  type Locale,
} from '@/i18n/config';
import { format } from '@/i18n/format';
import { useTheme } from '@/lib/theme';
import { commands, findCommand } from './commands';
import { isFailure, type CommandContext } from './commands/types';
import { complete, historyHint } from './engine/complete';
import { buildFs, displayPath, nearestDir } from './engine/fs';
import { parseCommand, splitChain } from './engine/parse';
import { closest } from './engine/suggest';
import { Cmd, ConsoleActionsContext, ErrorText, Line, Muted } from './output';
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
  const nextId = useRef(1);
  const handledQueue = useRef(0);

  const root = useMemo(
    () =>
      buildFs(index, {
        status: status => t.work.status[status],
        about: {
          experience: t.about.sections.experience,
          skills: t.about.sections.skills,
          education: t.about.sections.education,
          certificates: t.about.sections.certifications,
          contact: t.about.sections.contact,
        },
        readme: t.home.runningHead,
        resume: t.about.resume,
        work: t.work.title,
        blog: t.blog.title,
        aboutDir: t.about.title,
        language: l => localeMeta[l].label,
      }),
    [index, t]
  );

  // The working directory is the route. `cd` sets a pending value so chained
  // commands and the prompt update before navigation finishes.
  const routeCwd = nearestDir(root, stripLocale(pathname)).path;
  const [pending, setPending] = useState<{ cwd: string; from: string } | null>(
    null
  );
  const cwd = pending && pending.from === routeCwd ? pending.cwd : routeCwd;
  const previousCwd = useRef<string | null>(null);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const hint = historyHint(value, history);

  function focusInput() {
    // On touch screens, don't summon the keyboard over the menu uninvited.
    if (
      matchMedia('(pointer: coarse)').matches &&
      document.activeElement !== inputRef.current
    )
      return;
    inputRef.current?.focus({ preventScroll: true });
  }

  async function execute(line: string, source: Source) {
    const trimmed = line.trim();
    const id = nextId.current++;
    let workingDir = cwd;
    let navigated = false;
    let cleared = false;
    let closed = false;
    const output: React.ReactNode[] = [];

    const context: CommandContext = {
      t,
      locale,
      index,
      root,
      history,
      commands,
      theme: { preference: theme.preference, resolved: theme.theme },
      get cwd() {
        return workingDir;
      },
      get previousCwd() {
        return previousCwd.current;
      },
      cd(path, href) {
        if (path !== workingDir) previousCwd.current = workingDir;
        workingDir = path;
        navigated = true;
        setPending({ cwd: path, from: routeCwd });
        router.push(`/${locale}${href === '/' ? '' : href}`);
      },
      navigate(href, target: Locale = locale) {
        navigated = true;
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
        router.push(localizePath(pathname, target));
      },
      async copy(text) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          return false;
        }
      },
      clear() {
        cleared = true;
      },
      close() {
        closed = true;
      },
    };

    // Yield once, so no state is set synchronously inside effects that call us.
    await Promise.resolve();

    if (trimmed) {
      setHistory(previous => {
        const next = [
          ...previous.filter(entry => entry !== trimmed),
          trimmed,
        ].slice(-HISTORY_LIMIT);
        try {
          sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    let ok = true;
    for (const { command: segment, onlyIfOk } of splitChain(trimmed)) {
      if (onlyIfOk && !ok) break;
      const parsed = parseCommand(segment);
      const command = findCommand(parsed.name);

      if (!command) {
        const suggestion = closest(
          parsed.name,
          commands.filter(c => !c.hidden).map(c => c.name)
        );
        ok = false;
        output.push(
          <div key={output.length}>
            <Line>
              <ErrorText>
                {format(t.console.out.notFound, { command: parsed.name })}
              </ErrorText>
            </Line>
            <Line className="text-muted">
              {suggestion ? (
                <>
                  {t.console.out.didYouMean.split('{suggestion}')[0]}
                  <Cmd run={segment.replace(parsed.name, suggestion)}>
                    {suggestion}
                  </Cmd>
                  {t.console.out.didYouMean.split('{suggestion}')[1]}
                </>
              ) : (
                t.console.out.helpHint
              )}
            </Line>
          </div>
        );
        continue;
      }

      try {
        const result = await command.run(context, parsed);
        ok = !isFailure(result);
        const node = isFailure(result) ? result.error : result;
        if (node !== null && node !== undefined && node !== '') {
          output.push(<div key={output.length}>{node}</div>);
        }
      } catch (error) {
        ok = false;
        output.push(
          <ErrorText key={output.length}>
            {parsed.name}:{' '}
            {error instanceof Error ? error.message : String(error)}
          </ErrorText>
        );
      }
    }

    if (cleared) setEntries([]);
    else
      setEntries(previous => [
        ...previous,
        { id, cwd, input: trimmed, output },
      ]);
    setValue('');
    setHistoryIndex(null);
    setOptions([]);

    // Picking a destination from the menu means "take me there".
    if (closed || (navigated && source === 'menu')) onClose();
    else focusInput();
  }

  // Open and close the native dialog from props.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      if (!matchMedia('(pointer: coarse)').matches) inputRef.current?.focus();
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

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      const next =
        historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (event.key === 'ArrowDown' && historyIndex !== null) {
      event.preventDefault();
      const next = historyIndex + 1;
      setHistoryIndex(next >= history.length ? null : next);
      setValue(next >= history.length ? '' : history[next]);
    } else if (event.key === 'Tab' && value.trim()) {
      event.preventDefault();
      const result = complete(value, { commands, root, cwd });
      setValue(result.value);
      setOptions(result.options.length > 1 ? result.options : []);
    } else if (
      event.key === 'ArrowRight' &&
      hint &&
      input.selectionStart === value.length
    ) {
      event.preventDefault();
      setValue(value + hint);
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
    } else if (
      event.ctrlKey &&
      event.key.toLowerCase() === 'c' &&
      !input.selectionEnd
    ) {
      event.preventDefault();
      setEntries(previous => [
        ...previous,
        { id: nextId.current++, cwd, input: `${value}^C`, output: [] },
      ]);
      setValue('');
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
          <span className="hidden sm:inline">{t.console.keys}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.console.close}
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

          <div role="log" aria-live="polite" aria-relevant="additions">
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
              placeholder={entries.length ? '' : t.console.placeholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="go"
              className="relative w-full bg-transparent caret-accent outline-none [caret-shape:block] placeholder:text-faint"
            />
          </div>
        </form>

        {options.length > 0 && (
          <div
            aria-live="polite"
            className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-muted"
          >
            <span className="sr-only">{t.console.suggestions}:</span>
            {options.map(option => (
              <Muted key={option}>{option}</Muted>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}

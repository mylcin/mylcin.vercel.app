import type { Locale } from '@/i18n/config';
import type { ClientDictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/format';
import type { Theme, ThemePreference } from '@/lib/theme';
import type { DirNode } from '../engine/fs';
import { parseCommand, splitChain, tokenize } from '../engine/parse';
import { closest } from '../engine/suggest';
import { Cmd, ErrorText, Line } from '../output';
import type { ConsoleIndex } from '../types';
import { commands, findCommand } from '.';
import { isFailure, type CommandContext } from './types';

/** What a command line needs from the page it runs in. */
export interface ShellHost {
  t: ClientDictionary;
  locale: Locale;
  index: ConsoleIndex;
  root: DirNode;
  theme: { preference: ThemePreference; resolved: Theme | null };
  /** Previous commands, including the one being run. */
  history: string[];
  cwd: string;
  previousCwd: string | null;
  /** Navigates the site to a directory's route. */
  go(href: string): void;
  /** Navigates to a page, optionally in another locale. */
  navigate(href: string, locale?: Locale): void;
  openExternal(href: string): void;
  setTheme(preference: ThemePreference): void;
  switchLocale(locale: Locale): void;
  copy(text: string): Promise<boolean>;
}

export interface RunResult {
  output: React.ReactNode[];
  /** Index into `output` where `clear` ran; earlier output is discarded. */
  clearedAt: number | null;
  /** `exit`, or a command that left the page (open a file, switch language). */
  close: boolean;
  /** A `cd` moved the site. */
  moved: boolean;
  cwd: string;
  previousCwd: string | null;
}

function NotFound({
  t,
  segment,
  name,
}: {
  t: ClientDictionary;
  segment: string;
  name: string;
}) {
  const suggestion = closest(
    name,
    commands.filter(c => !c.hidden).map(c => c.name)
  );
  // Swap only the first word, whatever its case: "Hlep me" → "help me".
  const first = tokenize(segment)[0] ?? '';
  const fixed =
    suggestion && `${suggestion}${segment.trimStart().slice(first.length)}`;
  const [before, after] = t.console.out.didYouMean.split('{suggestion}');
  return (
    <div>
      <Line>
        <ErrorText>
          {format(t.console.out.notFound, { command: name })}
        </ErrorText>
      </Line>
      <Line className="text-muted">
        {fixed ? (
          <>
            {before}
            <Cmd run={fixed}>{suggestion}</Cmd>
            {after}
          </>
        ) : (
          t.console.out.helpHint
        )}
      </Line>
    </div>
  );
}

/**
 * Runs one line: `a && b ; c` with shell semantics (a failed `&&` skips the
 * rest of its chain, `;` always runs). Commands see an up-to-date working
 * directory even before the site finishes navigating.
 */
export async function runLine(
  line: string,
  host: ShellHost
): Promise<RunResult> {
  const output: React.ReactNode[] = [];
  let cwd = host.cwd;
  let previousCwd = host.previousCwd;
  let clearedAt: number | null = null;
  let close = false;
  let moved = false;

  const context: CommandContext = {
    t: host.t,
    locale: host.locale,
    index: host.index,
    root: host.root,
    history: host.history,
    commands,
    theme: host.theme,
    get cwd() {
      return cwd;
    },
    get previousCwd() {
      return previousCwd;
    },
    cd(path, href) {
      if (path !== cwd) previousCwd = cwd;
      cwd = path;
      moved = true;
      host.go(href);
    },
    navigate(href, locale) {
      close = true;
      host.navigate(href, locale);
    },
    openExternal: host.openExternal,
    setTheme: host.setTheme,
    // The console reopens itself in the new language (see ConsolePanel).
    switchLocale: host.switchLocale,
    copy: host.copy,
    clear() {
      clearedAt = output.length;
    },
    close() {
      close = true;
    },
  };

  let ok = true;
  for (const { command: segment, onlyIfOk } of splitChain(line)) {
    if (onlyIfOk && !ok) continue; // skip this link of the && chain; a later `;` still runs
    const parsed = parseCommand(segment);
    const command = findCommand(parsed.name, host.index.profile.handle);

    if (!command) {
      ok = false;
      output.push(
        <NotFound
          key={output.length}
          t={host.t}
          segment={segment}
          name={parsed.name}
        />
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

  return { output, clearedAt, close, moved, cwd, previousCwd };
}

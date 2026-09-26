import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Theme, ThemePreference } from '@/lib/theme';
import type { Completable } from '../engine/complete';
import type { DirNode } from '../engine/fs';
import type { ParsedCommand } from '../engine/parse';
import type { ConsoleIndex } from '../types';

export interface CommandContext {
  t: Dictionary;
  locale: Locale;
  index: ConsoleIndex;
  root: DirNode;
  /** Absolute working directory, e.g. `/work`. Updated synchronously by `cd`. */
  cwd: string;
  previousCwd: string | null;
  history: string[];
  commands: Command[];
  theme: { preference: ThemePreference; resolved: Theme | null };
  /** Changes the working directory and navigates the site there. */
  cd(path: string, href: string): void;
  /** Navigates to a locale-less route, optionally in another locale. */
  navigate(href: string, locale?: Locale): void;
  openExternal(href: string): void;
  setTheme(preference: ThemePreference): void;
  switchLocale(locale: Locale): void;
  copy(text: string): Promise<boolean>;
  clear(): void;
  close(): void;
}

export type CommandResult = React.ReactNode | { error: React.ReactNode };

export interface Command extends Completable {
  /** Key into `t.console.commands` — commands without one are hidden. */
  name: string;
  usage?: string;
  run(
    ctx: CommandContext,
    input: ParsedCommand
  ): CommandResult | Promise<CommandResult>;
}

export function fail(node: React.ReactNode): CommandResult {
  return { error: node };
}

export function isFailure(
  result: CommandResult
): result is { error: React.ReactNode } {
  return typeof result === 'object' && result !== null && 'error' in result;
}

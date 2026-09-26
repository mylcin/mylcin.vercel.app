import { lookup, resolvePath, type DirNode } from './fs';

/** How a command's arguments complete. */
export type Completer =
  { kind: 'path'; only?: 'dir' } | { kind: 'values'; values: string[] };

export interface Completable {
  name: string;
  aliases?: string[];
  hidden?: boolean;
  completer?: Completer;
}

export interface Completion {
  /** Input after completing as far as is unambiguous. */
  value: string;
  /** Candidates to show when there's more than one. */
  options: string[];
}

function commonPrefix(words: string[]): string {
  if (!words.length) return '';
  let prefix = words[0];
  for (const word of words.slice(1)) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function complete(
  input: string,
  context: { commands: Completable[]; root: DirNode; cwd: string }
): Completion {
  const endsWithSpace = /\s$/.test(input);
  const parts = input.trimStart().split(/\s+/);
  const partial = endsWithSpace ? '' : (parts.pop() ?? '');
  const head = input.slice(0, input.length - partial.length);
  const done = (value: string, options: string[] = []) => ({ value, options });

  // Completing the command name.
  if (parts.filter(Boolean).length === 0) {
    const names = context.commands
      .filter(c => !c.hidden)
      .map(c => c.name)
      .filter(name => name.startsWith(partial.toLowerCase()))
      .sort();
    if (names.length === 1) return done(`${head}${names[0]} `);
    return done(`${head}${commonPrefix(names) || partial}`, names);
  }

  const name = parts[0].toLowerCase();
  const command = context.commands.find(
    c => c.name === name || c.aliases?.includes(name)
  );
  const completer = command?.completer;
  if (!completer) return done(input);

  if (completer.kind === 'values') {
    const matches = completer.values.filter(v => v.startsWith(partial));
    if (matches.length === 1) return done(`${head}${matches[0]} `);
    return done(`${head}${commonPrefix(matches) || partial}`, matches);
  }

  // Paths: complete the last segment within its directory.
  const slash = partial.lastIndexOf('/');
  const dirPart = partial.slice(0, slash + 1);
  const base = partial.slice(slash + 1);
  const dir = lookup(context.root, resolvePath(context.cwd, dirPart || '.'));
  if (!dir || dir.kind !== 'dir') return done(input);

  const matches = dir.children
    .filter(child => (completer.only === 'dir' ? child.kind === 'dir' : true))
    .filter(child => child.name.startsWith(base))
    .map(child => (child.kind === 'dir' ? `${child.name}/` : child.name));

  if (matches.length === 1) {
    const match = matches[0];
    return done(`${head}${dirPart}${match}${match.endsWith('/') ? '' : ' '}`);
  }
  return done(`${head}${dirPart}${commonPrefix(matches) || base}`, matches);
}

/** Most recent history entry that extends what's typed — shown as ghost text. */
export function historyHint(input: string, history: string[]): string {
  if (!input.trim()) return '';
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.length > input.length && entry.startsWith(input))
      return entry.slice(input.length);
  }
  return '';
}

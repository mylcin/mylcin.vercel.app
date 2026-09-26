import { ascii, editor, hello, make, rm, sudo } from './fun';
import {
  date,
  echo,
  help,
  history,
  man,
  mustafa,
  neofetch,
  whoami,
} from './info';
import { cat, cd, grep, ls, open, pwd } from './navigation';
import { clear, email, exit, lang, theme } from './settings';
import type { Command } from './types';

/** Order here is the order in `help`. Hidden commands go last. */
const registry: Command[] = [
  help,
  ls,
  cd,
  pwd,
  cat,
  open,
  grep,
  man,
  mustafa,
  whoami,
  neofetch,
  email,
  lang,
  theme,
  history,
  date,
  echo,
  clear,
  exit,
  ascii,
  sudo,
  rm,
  editor,
  make,
  hello,
];

const visibleNames = registry.filter(c => !c.hidden).map(c => c.name);
man.completer = { kind: 'values', values: visibleNames };
help.completer = { kind: 'values', values: visibleNames };

export const commands = registry;

/**
 * `handle` is the author's handle from content; it runs the `mustafa`
 * command, so renaming the handle doesn't break the home page's "run it".
 */
export function findCommand(
  name: string,
  handle?: string
): Command | undefined {
  const key = name === handle ? mustafa.name : name;
  return registry.find(c => c.name === key || c.aliases?.includes(key));
}

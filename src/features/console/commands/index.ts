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

// `man` completes to visible command names plus the author's own page.
man.completer = {
  kind: 'values',
  values: ['mustafa', ...registry.filter(c => !c.hidden).map(c => c.name)],
};
help.completer = {
  kind: 'values',
  values: registry.filter(c => !c.hidden).map(c => c.name),
};

export const commands = registry;

export function findCommand(name: string): Command | undefined {
  return registry.find(c => c.name === name || c.aliases?.includes(name));
}

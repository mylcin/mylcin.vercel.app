export interface ParsedCommand {
  name: string;
  /** Positional arguments, quotes removed. */
  args: string[];
  /** Flags without dashes. `-la` → `l`, `a`; `--help` → `help`. */
  flags: Set<string>;
  /** Raw text after the command name (for `echo`, `grep "two words"`). */
  rest: string;
}

/** Splits on whitespace, honoring 'single' and "double" quotes and \ escapes. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quote) {
      if (char === quote) quote = null;
      else if (char === '\\' && quote === '"' && i + 1 < input.length)
        current += input[++i];
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;
    } else if (char === '\\' && i + 1 < input.length) {
      current += input[++i];
      hasToken = true;
    } else if (/\s/.test(char)) {
      if (hasToken) tokens.push(current);
      current = '';
      hasToken = false;
    } else {
      current += char;
      hasToken = true;
    }
  }
  if (hasToken) tokens.push(current);
  return tokens;
}

/**
 * Splits a line into commands on unquoted `&&` and `;`. Each segment records
 * whether it should only run if the previous one succeeded.
 */
export function splitChain(
  line: string
): { command: string; onlyIfOk: boolean }[] {
  const parts: { command: string; onlyIfOk: boolean }[] = [];
  let current = '';
  let quote: string | null = null;
  let onlyIfOk = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = null;
      current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      current += char;
    } else if (char === ';' || (char === '&' && line[i + 1] === '&')) {
      if (current.trim()) parts.push({ command: current.trim(), onlyIfOk });
      onlyIfOk = char === '&';
      if (char === '&') i++;
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push({ command: current.trim(), onlyIfOk });
  return parts;
}

export function parseCommand(input: string): ParsedCommand {
  const tokens = tokenize(input.trim());
  const [first = ''] = tokens;
  const args: string[] = [];
  const flags = new Set<string>();

  for (const token of tokens.slice(1)) {
    if (token.startsWith('--') && token.length > 2) flags.add(token.slice(2));
    else if (token.startsWith('-') && token.length > 1 && token !== '-') {
      for (const letter of token.slice(1)) flags.add(letter);
    } else args.push(token);
  }

  const rest = input.trim().slice(first.length).trim();
  return { name: first.toLowerCase(), args, flags, rest };
}

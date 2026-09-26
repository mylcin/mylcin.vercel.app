import { JetBrains_Mono, Newsreader } from 'next/font/google';

/** Newsreader for reading and headings (optical sizes make display text crisp). */
const serif = Newsreader({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-newsreader',
});

/** JetBrains Mono for chrome, metadata, code and the console. */
const mono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const fontVariables = `${serif.variable} ${mono.variable}`;

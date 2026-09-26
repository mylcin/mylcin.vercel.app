import { JetBrains_Mono, Newsreader } from 'next/font/google';

/**
 * Newsreader for reading and headings. Weight axis only: the optical-size axis
 * nearly doubles the file (~124 KB more on every page) for a subtle gain.
 * latin-ext is preloaded too — the name alone (ı, ç) needs it on every page.
 */
const serif = Newsreader({
  subsets: ['latin', 'latin-ext'],
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

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import en from '@/i18n/dictionaries/en';
import art from '../ascii-art';
import { buildFs } from '../engine/fs';
import type { ConsoleIndex } from '../types';
import { ASCII_NAMES } from './fun';
import { runLine, type ShellHost } from './run';

const index = {
  profile: {
    name: 'Mustafa Yalçın',
    handle: 'mustafa',
    role: 'Developer',
    email: 'me@example.com',
    city: 'Eskişehir',
    country: 'Türkiye',
    timeZone: 'Europe/Istanbul',
    headline: 'builds things.',
    intro: ['Hi.'],
    synopsis: {
      flags: [{ name: 'react', description: 'components' }],
      argument: 'idea',
      summary: 's',
    },
    bugs: [],
    socials: [
      {
        id: 'github',
        label: 'GitHub',
        handle: '@x',
        href: 'https://github.com/x',
      },
    ],
    careerStart: '2021-12',
    stack: ['react'],
    languages: 'Turkish, English',
    hobbies: 'books',
  },
  projects: [
    {
      slug: 'weather-cli',
      title: 'Weather CLI',
      tagline: 'Weather.',
      category: 'cli',
      status: 'live',
      stack: [],
      links: {},
    },
  ],
  posts: [
    {
      slug: 'hello-world',
      title: 'Hello World',
      description: 'English description',
      date: '2025-11-24',
      tags: ['general'],
      readingMinutes: 1,
      lang: 'en',
      translations: ['en', 'tr'],
      excerpt: 'English excerpt',
      variants: {
        en: {
          title: 'Hello World',
          description: 'English description',
          excerpt: 'English excerpt',
          readingMinutes: 1,
        },
        tr: {
          title: 'Merhaba Dünya',
          description: 'Türkçe açıklama',
          excerpt: 'Türkçe özet',
          readingMinutes: 1,
        },
      },
    },
  ],
  about: { experience: [], skills: [], education: [] },
} as unknown as ConsoleIndex;

const root = buildFs(index, {
  status: s => s,
  about: {
    experience: 'E',
    skills: 'S',
    education: 'Ed',
    contact: 'Co',
  },
  readme: 'r',
  work: 'Work',
  blog: 'Blog',
  aboutDir: 'About',
  language: l => l,
});

function host(overrides: Partial<ShellHost> = {}): ShellHost {
  return {
    t: en,
    locale: 'en',
    index,
    root,
    theme: { preference: 'system', resolved: 'light' },
    history: [],
    cwd: '/',
    previousCwd: null,
    go: vi.fn(),
    navigate: vi.fn(),
    openExternal: vi.fn(),
    setTheme: vi.fn(),
    switchLocale: vi.fn(),
    copy: vi.fn(async () => true),
    ...overrides,
  };
}

/** Runs a line and returns its output as plain text. */
async function run(line: string, overrides?: Partial<ShellHost>) {
  const result = await runLine(line, host(overrides));
  const text = renderToStaticMarkup(<>{result.output}</>).replace(
    /<[^>]+>/g,
    ' '
  );
  return {
    ...result,
    text: text.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(),
  };
}

describe('shell semantics', () => {
  it('skips the rest of a failed && chain but still runs after ;', async () => {
    const { text } = await run('cd nowhere && pwd ; echo after');
    expect(text).toContain('no such file or directory: nowhere');
    expect(text).not.toContain('~ ');
    expect(text).toContain('after');
  });

  it('keeps output that comes after clear', async () => {
    const result = await run('echo before ; clear ; echo after');
    expect(result.clearedAt).toBe(1);
    expect(result.output).toHaveLength(2);
  });

  it('suggests a fix for a typo, even in capitals', async () => {
    const { text, output } = await run('Hlep');
    expect(text).toContain('command not found: hlep');
    expect(renderToStaticMarkup(<>{output}</>)).toContain('>help<');
  });
});

describe('cd', () => {
  it('moves the working directory within a chain', async () => {
    const go = vi.fn();
    const result = await run('cd work && pwd', { go });
    expect(go).toHaveBeenCalledWith('/work');
    expect(result.text).toBe('~/work');
    expect(result).toMatchObject({
      moved: true,
      cwd: '/work',
      previousCwd: '/',
    });
  });

  it('cd - goes back and says where it went', async () => {
    const result = await run('cd -', { cwd: '/blog', previousCwd: '/work' });
    expect(result.text).toBe('~/work');
    expect(result.previousCwd).toBe('/blog');
  });

  it('cd - without history is an error', async () => {
    expect((await run('cd -')).text).toBe('cd: OLDPWD not set');
  });

  it('refuses to cd into a file', async () => {
    expect((await run('cd readme.md')).text).toContain('not a directory');
  });
});

describe('output that is clickable', () => {
  it('uses absolute paths, so old listings still work after moving', async () => {
    const markup = renderToStaticMarkup(
      <>{(await runLine('ls', host())).output}</>
    );
    expect(markup).toContain('data-command="cd ~/work"');
    expect(markup).toContain('data-command="cat ~/readme.md"');
  });
});

describe('cat', () => {
  it('shows a translation file in its own language', async () => {
    const { text } = await run('cat blog/hello-world/tr.md');
    expect(text).toContain('Merhaba Dünya');
    expect(text).toContain('Türkçe açıklama');
    expect(text).not.toContain('English description');
  });

  it('refuses directories', async () => {
    expect((await run('cat work')).text).toContain('is a directory');
  });
});

describe('open', () => {
  it('closes the console when it leaves for a page', async () => {
    const navigate = vi.fn();
    const result = await run('open work/weather-cli/readme.md', { navigate });
    expect(navigate).toHaveBeenCalledWith('/work/weather-cli', undefined);
    expect(result.close).toBe(true);
  });

  it('opens socials in a new tab', async () => {
    const openExternal = vi.fn();
    await run('open github', { openExternal });
    expect(openExternal).toHaveBeenCalledWith('https://github.com/x');
  });
});

describe('small commands', () => {
  it('echo keeps each quoted argument', async () => {
    expect((await run('echo "a" "b c"')).text).toBe('a b c');
  });

  it('the handle runs the synopsis command', async () => {
    expect((await run('mustafa "a todo app"')).text).toContain(
      '“a todo app” sounds interesting'
    );
  });

  it('whoami points at the manual', async () => {
    expect((await run('whoami')).text).toContain('Try: man mustafa');
  });

  it('ascii ignores prototype keys and lists the real options', async () => {
    const { text } = await run('ascii __proto__');
    expect(text).toContain('invalid value: __proto__');
    expect(text).toContain('rei, asuka');
  });

  it('ascii names match the art file', () => {
    expect(Object.keys(art).sort()).toEqual([...ASCII_NAMES].sort());
  });

  it('lang asks the host to switch, without closing (the console reopens)', async () => {
    const switchLocale = vi.fn();
    const result = await run('lang tr', { switchLocale });
    expect(switchLocale).toHaveBeenCalledWith('tr');
    expect(result.close).toBe(false);
  });
});

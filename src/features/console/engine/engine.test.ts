import { describe, expect, it } from 'vitest';
import type { ConsoleIndex } from '../types';
import { complete, historyHint, type Completable } from './complete';
import {
  buildFs,
  displayPath,
  lookup,
  nearestDir,
  relativePath,
  resolvePath,
} from './fs';
import { parseCommand, splitChain, tokenize } from './parse';
import { closest, searchable } from './suggest';

const index = {
  locale: 'en',
  profile: { name: 'Test Person' },
  projects: [
    {
      slug: 'weather-cli',
      title: 'Weather CLI',
      tagline: 't',
      status: 'live',
      category: 'cli',
      stack: [],
      links: {},
    },
    {
      slug: 'web-thing',
      title: 'Web Thing',
      tagline: 't',
      status: 'paused',
      category: 'web',
      stack: [],
      links: {},
    },
  ],
  posts: [
    {
      slug: 'hello-world',
      title: 'Hello',
      translations: ['en', 'tr'],
      variants: {
        en: {
          title: 'Hello',
          description: 'd',
          excerpt: 'e',
          readingMinutes: 1,
        },
        tr: {
          title: 'Merhaba',
          description: 'a',
          excerpt: 'ö',
          readingMinutes: 1,
        },
      },
      date: '2025-01-01',
    },
  ],
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

describe('parse', () => {
  it('tokenizes quotes and escapes', () => {
    expect(tokenize(`grep "two words" 'x y' a\\ b`)).toEqual([
      'grep',
      'two words',
      'x y',
      'a b',
    ]);
    expect(tokenize('echo ""')).toEqual(['echo', '']);
  });

  it('splits chains outside quotes', () => {
    expect(splitChain('cd work && ls; pwd')).toEqual([
      { command: 'cd work', onlyIfOk: false },
      { command: 'ls', onlyIfOk: true },
      { command: 'pwd', onlyIfOk: false },
    ]);
    expect(splitChain('echo "a && b"')).toEqual([
      { command: 'echo "a && b"', onlyIfOk: false },
    ]);
  });

  it('separates flags from arguments', () => {
    const parsed = parseCommand('LS -la --long ~/work -');
    expect(parsed.name).toBe('ls');
    expect([...parsed.flags].sort()).toEqual(['a', 'l', 'long']);
    expect(parsed.args).toEqual(['~/work', '-']);
  });
});

describe('filesystem', () => {
  it('resolves paths like a shell', () => {
    expect(resolvePath('/work', '..')).toBe('/');
    expect(resolvePath('/work', '../blog/hello-world/')).toBe(
      '/blog/hello-world'
    );
    expect(resolvePath('/blog', '~/work')).toBe('/work');
    expect(resolvePath('/blog', '/about')).toBe('/about');
    expect(resolvePath('/', '../../..')).toBe('/');
    expect(resolvePath('/work', '.')).toBe('/work');
  });

  it('mirrors the site structure', () => {
    expect(lookup(root, '/work/weather-cli')?.kind).toBe('dir');
    expect(lookup(root, '/work/weather-cli/readme.md')?.kind).toBe('file');
    expect(lookup(root, '/blog/hello-world/tr.md')?.title).toBe('Merhaba');
    expect(lookup(root, '/nope')).toBeNull();
    expect(lookup(root, '/readme.md/x')).toBeNull();
  });

  it('maps unknown routes to their nearest directory', () => {
    expect(nearestDir(root, '/work/missing').path).toBe('/work');
    expect(nearestDir(root, '/totally/unknown').path).toBe('/');
  });

  it('prints paths relative to the working directory', () => {
    expect(displayPath('/')).toBe('~');
    expect(displayPath('/work')).toBe('~/work');
    expect(relativePath('/work', '/work/weather-cli')).toBe('weather-cli');
    expect(relativePath('/', '/work')).toBe('work');
    expect(relativePath('/blog', '/work/x')).toBe('~/work/x');
  });
});

describe('completion', () => {
  const commands: Completable[] = [
    { name: 'cd', completer: { kind: 'path', only: 'dir' } },
    { name: 'cat', completer: { kind: 'path' } },
    { name: 'clear' },
    { name: 'sudo', hidden: true },
    { name: 'lang', completer: { kind: 'values', values: ['en', 'tr'] } },
  ];

  it('completes command names, skipping hidden ones', () => {
    expect(complete('cl', { commands, root, cwd: '/' })).toEqual({
      value: 'clear ',
      options: [],
    });
    expect(complete('c', { commands, root, cwd: '/' }).options).toEqual([
      'cat',
      'cd',
      'clear',
    ]);
    expect(complete('su', { commands, root, cwd: '/' }).options).toEqual([]);
  });

  it('completes paths segment by segment', () => {
    expect(complete('cd wo', { commands, root, cwd: '/' }).value).toBe(
      'cd work/'
    );
    expect(complete('cd work/we', { commands, root, cwd: '/' })).toEqual({
      value: 'cd work/we',
      options: ['weather-cli/', 'web-thing/'],
    });
    expect(
      complete('cat weather-cli/r', { commands, root, cwd: '/work' }).value
    ).toBe('cat weather-cli/readme.md ');
  });

  it('only offers directories to cd', () => {
    expect(complete('cd ', { commands, root, cwd: '/' }).options).toEqual([
      'work/',
      'blog/',
      'about/',
    ]);
  });

  it('completes the command after && or ;', () => {
    expect(complete('cd work && ca', { commands, root, cwd: '/' }).value).toBe(
      'cd work && cat '
    );
    expect(complete('ls; cd wo', { commands, root, cwd: '/' }).value).toBe(
      'ls; cd work/'
    );
  });

  it('completes enumerated values', () => {
    expect(complete('lang t', { commands, root, cwd: '/' }).value).toBe(
      'lang tr '
    );
  });

  it('hints from history', () => {
    expect(historyHint('cd w', ['cd work', 'ls', 'cd work/weather-cli'])).toBe(
      'ork/weather-cli'
    );
    expect(historyHint('', ['ls'])).toBe('');
  });
});

describe('suggestions', () => {
  it('finds typo-sized matches only', () => {
    const names = ['ls', 'cd', 'cat', 'help', 'theme', 'neofetch'];
    expect(closest('lss', names)).toBe('ls');
    expect(closest('hlep', names)).toBe('help');
    expect(closest('neofecth', names)).toBe('neofetch');
    expect(closest('xyzzy', names)).toBeNull();
  });

  it('searches without case, accents or dotted i', () => {
    expect(searchable('YALÇIN')).toBe('yalcin');
    expect(searchable('İstanbul')).toBe('istanbul');
  });
});

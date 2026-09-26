import { describe, expect, it } from 'vitest';
import { localizePath, negotiateLocale, stripLocale } from './config';
import en from './dictionaries/en';
import tr from './dictionaries/tr';
import { format, formatDate, monthsBetween, plural } from './format';

describe('negotiateLocale', () => {
  it('picks the highest-weighted supported language', () => {
    expect(negotiateLocale('tr-TR,tr;q=0.9,en-US;q=0.8')).toBe('tr');
    expect(negotiateLocale('de-DE,de;q=0.9,en;q=0.5,tr;q=0.4')).toBe('en');
    expect(negotiateLocale('en;q=0.3,tr;q=0.8')).toBe('tr');
  });

  it('falls back to the default locale', () => {
    expect(negotiateLocale(null)).toBe('en');
    expect(negotiateLocale('fr-FR,de;q=0.5')).toBe('en');
    expect(negotiateLocale('tr;q=0')).toBe('en');
  });
});

describe('locale paths', () => {
  it('swaps or adds the prefix', () => {
    expect(localizePath('/en/blog/x', 'tr')).toBe('/tr/blog/x');
    expect(localizePath('/en', 'tr')).toBe('/tr');
    expect(localizePath('/blog', 'en')).toBe('/en/blog');
    expect(localizePath('/', 'tr')).toBe('/tr');
  });

  it('strips the prefix', () => {
    expect(stripLocale('/tr/blog/x')).toBe('/blog/x');
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/about')).toBe('/about');
  });
});

describe('formatting', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('{a} and {b}', { a: 1 })).toBe('1 and {b}');
  });

  it('selects plural forms per language', () => {
    expect(plural('en', 1, en.blog.readingTime)).toBe('1 min read');
    expect(plural('en', 2, en.about.years)).toBe('2 yrs');
    expect(plural('tr', 2, tr.about.years)).toBe('2 yıl');
    expect(plural('tr', 1, tr.blog.count)).toBe('1 yazı');
  });

  it('formats calendar dates without timezone drift', () => {
    expect(formatDate('2025-12-04', 'en', 'long')).toBe('4 December 2025');
    expect(formatDate('2025-12-04', 'tr', 'long')).toBe('4 Aralık 2025');
    expect(formatDate('2023-01', 'en', 'monthYear')).toBe('Jan 2023');
  });

  it('counts months inclusively', () => {
    expect(monthsBetween('2021-07', '2021-08')).toBe(2);
    expect(monthsBetween('2021-12', '2023-01')).toBe(14);
  });
});

/** Every leaf path with its value. */
function leaves(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => leaves(child, path ? `${path}.${key}` : key)
  );
}

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();

describe('dictionaries', () => {
  const pluralKey = /\.(zero|one|two|few|many|other)$/;
  const enLeaves = new Map(leaves(en));
  const trLeaves = new Map(leaves(tr));

  it('translate every message', () => {
    const missing = [...enLeaves.keys()].filter(
      key => !pluralKey.test(key) && !trLeaves.has(key)
    );
    expect(missing).toEqual([]);
  });

  it('use the same placeholders in every language', () => {
    const mismatched = [...enLeaves].flatMap(([key, text]) => {
      const other =
        trLeaves.get(key) ?? trLeaves.get(key.replace(pluralKey, '.other'));
      if (other === undefined) return [];
      return placeholders(text).join() === placeholders(other).join()
        ? []
        : [key];
    });
    expect(mismatched).toEqual([]);
  });
});

/**
 * Locale registry. Adding a language:
 *   1. add its code here and fill in `localeMeta`
 *   2. add `src/i18n/dictionaries/<code>.ts` (the type checker lists every missing key)
 *   3. optionally translate content — untranslated fields fall back to `defaultLocale`
 */
export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'en' satisfies Locale;

export const localeMeta: Record<
  Locale,
  { label: string; short: string; ogLocale: string; intl: string }
> = {
  en: { label: 'English', short: 'EN', ogLocale: 'en_US', intl: 'en-GB' },
  tr: { label: 'Türkçe', short: 'TR', ogLocale: 'tr_TR', intl: 'tr-TR' },
};

/** Cookie the proxy reads to pick a locale for unprefixed URLs. */
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}

/**
 * Picks the best supported locale from an Accept-Language header.
 * Small on purpose: we only need primary-tag matching for a handful of locales.
 */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return defaultLocale;

  const ranked = header
    .split(',')
    .map(part => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find(p => p.trim().startsWith('q='));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter(entry => entry.tag && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const primary = tag.split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return defaultLocale;
}

/** Swaps (or adds) the locale prefix of a pathname. */
export function localizePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) segments[1] = locale;
  else segments.splice(1, 0, locale);
  const path = segments.join('/');
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

/** Removes the locale prefix: `/tr/blog/x` → `/blog/x`, `/en` → `/`. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) segments.splice(1, 1);
  return segments.join('/') || '/';
}

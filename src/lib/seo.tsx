import type { Metadata } from 'next';
import { defaultLocale, localeMeta, locales, type Locale } from '@/i18n/config';
import { getProfile } from './content/site';
import { absoluteUrl, SITE_URL } from './site';

/** One identity for the author across every page's structured data. */
export const PERSON_ID = absoluteUrl('/#person');

interface PageMetaInput {
  locale: Locale;
  /** Path without the locale prefix, e.g. `/blog/hello-world` or `/`. */
  path: string;
  title: string;
  description: string;
  /** Locales this page really exists in. Defaults to all. */
  availableIn?: readonly Locale[];
  /** Point search engines at another locale's URL (untranslated fallbacks). */
  canonicalLocale?: Locale;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Use the title as-is instead of the layout's "%s — <name>" template. */
  absoluteTitle?: boolean;
}

export function localeHref(locale: Locale, path: string) {
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/**
 * Builds per-page metadata with canonical URL, hreflang alternates and Open
 * Graph. Next merges metadata shallowly, so each page gets the full object.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const {
    locale,
    path,
    title,
    description,
    availableIn = locales,
    canonicalLocale = locale,
    type = 'website',
  } = input;

  const languages: Record<string, string> = {};
  for (const l of availableIn) languages[l] = localeHref(l, path);
  const xDefault = availableIn.includes(defaultLocale)
    ? defaultLocale
    : availableIn[0];
  languages['x-default'] = localeHref(xDefault, path);

  return {
    title: input.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: localeHref(canonicalLocale, path),
      languages,
      types: {
        'application/rss+xml': `/${locale}/blog/feed.xml`,
      },
    },
    // Describes the canonical page: an untranslated fallback shares as the original.
    openGraph: {
      type,
      title,
      description,
      url: localeHref(canonicalLocale, path),
      siteName: getProfile(canonicalLocale).name,
      locale: localeMeta[canonicalLocale].ogLocale,
      alternateLocale: availableIn
        .filter(l => l !== canonicalLocale)
        .map(l => localeMeta[l].ogLocale),
      ...(type === 'article' && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
        authors: [`${SITE_URL}/${canonicalLocale}/about`],
        tags: input.tags,
      }),
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Structured data. `<` is escaped so content can't close the script tag. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...data,
        }).replace(/</g, '\\u003c'),
      }}
    />
  );
}

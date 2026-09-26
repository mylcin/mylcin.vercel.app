import type { MetadataRoute } from 'next';
import { defaultLocale, locales, type Locale } from '@/i18n/config';
import { getPosts } from '@/lib/content/blog';
import { getProjectSlugs } from '@/lib/content/site';
import { absoluteUrl } from '@/lib/site';

/**
 * Every page in every language it exists in, with hreflang alternates that
 * mirror the pages' own <link rel="alternate">. Only posts carry lastmod:
 * a build date on every page would claim everything changed on each deploy.
 */
function entry(
  path: string,
  availableIn: readonly Locale[],
  lastModified?: string
) {
  const url = (locale: Locale) =>
    absoluteUrl(path === '/' ? `/${locale}` : `/${locale}${path}`);
  const languages: Record<string, string> = Object.fromEntries(
    availableIn.map(locale => [locale, url(locale)])
  );
  languages['x-default'] = url(
    availableIn.includes(defaultLocale) ? defaultLocale : availableIn[0]
  );
  return availableIn.map(locale => ({
    url: url(locale),
    ...(lastModified && { lastModified }),
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(defaultLocale);
  const pages = ['/', '/work', '/about'].flatMap(path => entry(path, locales));
  const blog = entry('/blog', locales, posts[0]?.updated ?? posts[0]?.date);
  const projects = getProjectSlugs().flatMap(slug =>
    entry(`/work/${slug}`, locales)
  );
  // Posts only in the languages they're written in; fallbacks canonicalize to the original.
  const articles = posts.flatMap(post =>
    entry(`/blog/${post.slug}`, post.translations, post.updated ?? post.date)
  );
  return [...pages, ...blog, ...projects, ...articles];
}

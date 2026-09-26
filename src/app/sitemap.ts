import type { MetadataRoute } from 'next';
import { locales, type Locale } from '@/i18n/config';
import { getPosts } from '@/lib/content/blog';
import { getProjectSlugs } from '@/lib/content/site';
import { absoluteUrl, BUILD_DATE } from '@/lib/site';

function entry(
  path: string,
  availableIn: readonly Locale[],
  lastModified: string
) {
  const url = (locale: Locale) =>
    absoluteUrl(path === '/' ? `/${locale}` : `/${locale}${path}`);
  const languages = Object.fromEntries(
    availableIn.map(locale => [locale, url(locale)])
  );
  return availableIn.map(locale => ({
    url: url(locale),
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['/', '/work', '/blog', '/about'].flatMap(path =>
    entry(path, locales, BUILD_DATE)
  );
  const projects = getProjectSlugs().flatMap(slug =>
    entry(`/work/${slug}`, locales, BUILD_DATE)
  );
  // Posts are listed only in the languages they're written in; fallback pages
  // canonicalize to the original.
  const posts = (await getPosts('en')).flatMap(post =>
    entry(`/blog/${post.slug}`, post.translations, post.updated ?? post.date)
  );
  return [...pages, ...projects, ...posts];
}

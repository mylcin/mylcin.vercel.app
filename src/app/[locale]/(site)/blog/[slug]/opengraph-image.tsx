import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { formatDate, plural } from '@/i18n/format';
import { getPost, getPostSlugs } from '@/lib/content/blog';
import { ogAlt, ogContentType, ogHost, ogImage, ogSize } from '@/lib/og';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getDictionary(locale);
  const post = await getPost(slug, locale);
  if (!post) notFound();
  return ogImage({
    eyebrow: `${formatDate(post.date, locale, 'short')} · ${plural(locale, post.readingMinutes, t.blog.readingTime)}`,
    title: post.title,
    subtitle: post.description,
    footer: `${ogHost}/blog`,
  });
}

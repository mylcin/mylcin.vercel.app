import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { formatDate, plural } from '@/i18n/format';
import { getPost, getPostSlugs } from '@/lib/content/blog';
import { ogContentType, ogHost, ogImage, ogSize } from '@/lib/og';

export const alt = 'Mustafa Yalçın — Blog';
export const size = ogSize;
export const contentType = ogContentType;

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
  if (!post)
    return ogImage({
      eyebrow: t.blog.title,
      title: t.notFound.title,
      footer: ogHost,
    });
  return ogImage({
    eyebrow: `${formatDate(post.date, locale, 'short')} · ${plural(locale, post.readingMinutes, t.blog.readingTime)}`,
    title: post.title,
    subtitle: post.description,
    footer: `${ogHost}/blog`,
  });
}

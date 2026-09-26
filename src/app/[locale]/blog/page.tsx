import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';
import { ArchiveView, FilterableArchive } from '@/features/blog/archive';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { plural } from '@/i18n/format';
import { getAllTags, getPosts } from '@/lib/content/blog';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/blog',
    title: t.blog.title,
    description: t.meta.blogDescription,
  });
}

export default async function BlogPage({
  params,
}: PageProps<'/[locale]/blog'>) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const [posts, tags] = await Promise.all([
    getPosts(locale),
    getAllTags(locale),
  ]);
  const count = plural(locale, posts.length, t.blog.count);

  return (
    <PageTransition>
      <PageHeader meta={count} title={t.blog.title} intro={t.blog.intro}>
        <a
          href={`/${locale}/blog/feed.xml`}
          className="mt-4 inline-block font-mono text-sm link text-muted"
        >
          {t.blog.rss}
        </a>
      </PageHeader>
      {/* The fallback is the full, unfiltered archive, so the static HTML has every post. */}
      <Suspense
        fallback={<ArchiveView posts={posts} tags={tags} activeTag={null} />}
      >
        <FilterableArchive posts={posts} tags={tags} />
      </Suspense>
    </PageTransition>
  );
}

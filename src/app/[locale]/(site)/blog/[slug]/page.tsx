import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mdxComponents } from '@/components/mdx/mdx-components';
import { MoreLink } from '@/components/ui/more-link';
import { Pager } from '@/components/ui/pager';
import { PageTransition, SharedTitle } from '@/components/ui/page-transition';
import { TableOfContents } from '@/features/blog/table-of-contents';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, formatDate, isoDate, plural } from '@/i18n/format';
import {
  getPost,
  getPosts,
  getPostSlugs,
  relatedPosts,
} from '@/lib/content/blog';
import { getProfile } from '@/lib/content/site';
import { JsonLd, pageMetadata, PERSON_ID } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = await getPost(slug, locale);
  if (!post) return {};
  return pageMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
    type: 'article',
    availableIn: post.translations,
    // An untranslated fallback isn't a page of its own: point at the original.
    canonicalLocale: post.lang,
    publishedTime: post.date,
    modifiedTime: post.updated,
    tags: post.tags,
  });
}

export default async function PostPage({
  params,
}: PageProps<'/[locale]/blog/[slug]'>) {
  const { slug, locale: raw } = await params;
  const locale = raw as Locale;
  const t = getDictionary(locale);
  const post = await getPost(slug, locale);
  if (!post) notFound();

  const profile = getProfile(locale);
  const posts = await getPosts(locale);
  const position = posts.findIndex(p => p.slug === slug);
  const newer = posts[position - 1];
  const older = posts[position + 1];
  const related = relatedPosts(post, posts).filter(
    p => p !== newer && p !== older
  );
  const { Content, toc } = post;
  const isFallback = post.lang !== locale;
  // On a fallback page the text already is the other language; don't offer it again.
  const otherLanguages = isFallback
    ? []
    : post.translations.filter(l => l !== locale);
  const langOf = (p: { lang: Locale }) =>
    p.lang !== locale ? p.lang : undefined;
  const replyHref = `mailto:${profile.email}?subject=${encodeURIComponent(
    format(t.blog.replySubject, { title: post.title })
  )}`;

  return (
    <PageTransition>
      <div aria-hidden="true" className="reading-progress" />
      <JsonLd
        data={{
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          inLanguage: post.lang,
          keywords: post.tags.join(', '),
          url: absoluteUrl(`/${post.lang}/blog/${slug}`),
          mainEntityOfPage: absoluteUrl(`/${post.lang}/blog/${slug}`),
          author: { '@id': PERSON_ID },
        }}
      />

      <div className="mb-10">
        <MoreLink href={`/${locale}/blog`} back>
          {t.blog.allPosts}
        </MoreLink>
      </div>

      <article>
        <header className="section mb-12 md:mb-16">
          <div className="space-y-1 label">
            <time dateTime={isoDate(post.date)} className="block">
              {formatDate(post.date, locale, 'long')}
            </time>
            <span className="block">
              {plural(locale, post.readingMinutes, t.blog.readingTime)}
            </span>
          </div>
          <div className="min-w-0">
            <SharedTitle name={`post-${post.slug}`}>
              <h1
                lang={post.lang}
                className="max-w-[24ch] text-2xl font-normal"
              >
                {post.title}
              </h1>
            </SharedTitle>
            <p
              lang={post.lang}
              className="mt-5 max-w-measure text-xl text-muted"
            >
              {post.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
              <ul className="flex flex-wrap gap-x-3">
                {post.tags.map(tag => (
                  <li key={tag}>
                    <Link
                      href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                      className="hover:text-fg"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
              {post.updated && (
                <span>
                  {format(t.blog.updated, {
                    date: formatDate(post.updated, locale, 'short'),
                  })}
                </span>
              )}
              {otherLanguages.map(l => (
                <Link
                  key={l}
                  href={`/${l}/blog/${slug}`}
                  hrefLang={l}
                  className="link"
                >
                  {format(t.blog.availableIn, { language: t.languageNames[l] })}
                </Link>
              ))}
            </div>

            {isFallback && (
              <p
                role="note"
                className="mt-8 max-w-measure border-l-2 border-accent pl-4 font-mono text-xs leading-relaxed text-muted"
              >
                {format(t.blog.fallbackNotice, {
                  current: t.languageNames[locale],
                  original: t.languageNames[post.lang],
                })}
              </p>
            )}
          </div>
        </header>

        <div className="section">
          {/* Always a grid cell at md+, so the body stays in the content
              column; the outline itself only fits from xl. The cell is as
              tall as the article, so the outline sticks while it scrolls:
              no wrapper between the two, or sticky has nowhere to move. */}
          <div className="hidden md:block">
            {toc.length >= 3 && (
              <TableOfContents
                items={toc}
                label={t.blog.toc}
                className="hidden xl:block"
              />
            )}
          </div>
          <div lang={post.lang} className="prose max-w-measure min-w-0">
            <Content components={mdxComponents(locale)} />
          </div>
        </div>
      </article>

      <footer className="section mt-20">
        <div className="max-w-measure border-t border-line pt-8 md:col-start-2">
          <p className="text-muted">
            {format(t.blog.writtenBy, { name: profile.name })} ·{' '}
            <a href={replyHref} className="link text-fg">
              {t.blog.reply}
            </a>
          </p>

          {related.length > 0 && (
            <div className="mt-10">
              <p className="mb-3 label">{t.blog.related}</p>
              <ul className="space-y-2">
                {related.map(p => (
                  <li key={p.slug}>
                    <Link
                      href={`/${locale}/blog/${p.slug}`}
                      lang={langOf(p)}
                      className="link"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <Pager
              label={t.blog.pager}
              previous={
                newer && {
                  href: `/${locale}/blog/${newer.slug}`,
                  label: t.blog.newer,
                  title: newer.title,
                  lang: langOf(newer),
                }
              }
              next={
                older && {
                  href: `/${locale}/blog/${older.slug}`,
                  label: t.blog.older,
                  title: older.title,
                  lang: langOf(older),
                }
              }
            />
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}

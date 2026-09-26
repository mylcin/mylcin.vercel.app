import Link from 'next/link';
import { SharedTitle } from '@/components/ui/page-transition';
import { localeMeta, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { format, formatDate, isoDate, plural } from '@/i18n/format';
import type { PostSummary } from '@/lib/content/blog';

/** Mono chip shown on posts that aren't available in the reader's language. */
export function LanguageBadge({ lang, t }: { lang: Locale; t: Dictionary }) {
  const label = format(t.blog.onlyIn, { language: t.languageNames[lang] });
  return (
    <span
      title={label}
      className="inline-flex h-5 items-center rounded-sm border border-line-strong px-1 font-mono text-xs leading-none text-muted"
    >
      <span aria-hidden="true">{localeMeta[lang].short}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Date · title · reading time. Used on the home page and the blog index. */
export function PostRows({
  posts,
  locale,
  t,
  dateStyle = 'short',
}: {
  posts: PostSummary[];
  locale: Locale;
  t: Dictionary;
  dateStyle?: 'short' | 'dayMonth';
}) {
  return (
    <ul data-testid="post-list" className="-mt-3 divide-y divide-line">
      {posts.map(post => (
        <li key={post.slug} data-tags={post.tags.join(' ')}>
          <Link
            href={`/${locale}/blog/${post.slug}`}
            className="group grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-baseline"
          >
            <time
              dateTime={isoDate(post.date)}
              className="font-mono text-xs text-muted"
            >
              {formatDate(post.date, locale, dateStyle)}
            </time>
            <SharedTitle name={`post-${post.slug}`}>
              <span className="block min-w-0 text-lg leading-snug transition-colors duration-(--dur-fast) group-hover:text-accent-ink">
                {post.title}
              </span>
            </SharedTitle>
            <span className="flex items-center gap-2 font-mono text-xs text-muted">
              {plural(locale, post.readingMinutes, t.blog.readingTime)}
              {post.lang !== locale && <LanguageBadge lang={post.lang} t={t} />}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

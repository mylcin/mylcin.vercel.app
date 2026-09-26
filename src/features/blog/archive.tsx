'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/client';
import { format, plural } from '@/i18n/format';
import type { PostSummary } from '@/lib/content/blog';
import { cx } from '@/lib/cx';
import { PostRows } from './post-rows';

/**
 * Posts grouped by year, with years in the label gutter. `activeTag` comes
 * from `?tag=`; tag links are real links, so filters can be shared.
 */
export function ArchiveView({
  posts,
  tags,
  activeTag,
}: {
  posts: PostSummary[];
  tags: string[];
  activeTag: string | null;
}) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const visible = activeTag
    ? posts.filter(post => post.tags.includes(activeTag))
    : posts;
  const years = [...new Set(visible.map(post => post.date.slice(0, 4)))];

  return (
    <div className="sections" data-testid="post-archive">
      {tags.length > 1 && (
        <div className="section">
          <p className="label" id="tag-filter-label">
            {t.blog.filterLabel}
          </p>
          <div>
            <ul
              aria-labelledby="tag-filter-label"
              className="-ml-2 flex flex-wrap gap-y-1 font-mono text-sm"
            >
              {[null, ...tags].map(tag => {
                const current = tag === activeTag;
                return (
                  <li key={tag ?? 'all'}>
                    <Link
                      href={
                        tag
                          ? `${pathname}?tag=${encodeURIComponent(tag)}`
                          : pathname
                      }
                      scroll={false}
                      replace
                      aria-current={current ? 'true' : undefined}
                      className={cx(
                        'relative inline-flex h-8 items-center px-2 transition-colors duration-(--dur-fast)',
                        // Same "you are here" mark as the main navigation.
                        current
                          ? 'text-fg after:absolute after:inset-x-2 after:bottom-1 after:h-px after:bg-accent'
                          : 'text-muted hover:text-fg'
                      )}
                    >
                      {tag ? `#${tag}` : t.blog.allTags}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* Always mounted, so screen readers announce every change. */}
            <p
              role="status"
              className="mt-4 font-mono text-xs text-muted empty:hidden"
            >
              {activeTag
                ? visible.length
                  ? plural(locale, visible.length, t.blog.filtered, {
                      tag: `#${activeTag}`,
                    })
                  : format(t.blog.noMatches, { tag: `#${activeTag}` })
                : ''}
            </p>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="section" data-testid="post-list-empty">
          <div className="md:col-start-2">
            <p>
              {activeTag
                ? format(t.blog.noMatches, { tag: `#${activeTag}` })
                : t.blog.empty}
            </p>
            {activeTag && (
              <Link
                href={pathname}
                scroll={false}
                replace
                className="mt-3 inline-block font-mono text-sm link"
              >
                {t.blog.clearFilter}
              </Link>
            )}
          </div>
        </div>
      ) : (
        years.map(year => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className="section"
          >
            <h2 id={`year-${year}`} className="label">
              {year}
            </h2>
            <PostRows
              posts={visible.filter(post => post.date.startsWith(year))}
              locale={locale}
              t={t}
              dateStyle="dayMonth"
            />
          </section>
        ))
      )}
    </div>
  );
}

export function FilterableArchive(props: {
  posts: PostSummary[];
  tags: string[];
}) {
  const tag = useSearchParams().get('tag');
  return (
    <ArchiveView
      {...props}
      activeTag={tag && props.tags.includes(tag) ? tag : null}
    />
  );
}

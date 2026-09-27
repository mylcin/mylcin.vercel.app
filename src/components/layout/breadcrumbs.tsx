'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { stripLocale } from '@/i18n/config';
import { useI18n } from '@/i18n/client';
import { cx } from '@/lib/cx';

/**
 * The current route as a shell path — `~/blog/hello-world`. Same path the
 * console prompt shows, so the two interfaces agree on where you are.
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const segments = stripLocale(usePathname()).split('/').filter(Boolean);

  return (
    <nav aria-label={t.nav.breadcrumbs} className={cx('min-w-0', className)}>
      <ol className="flex min-w-0 items-center font-mono text-sm text-muted">
        <li className="shrink-0">
          {segments.length === 0 ? (
            <span aria-current="page">~</span>
          ) : (
            <Link href={`/${locale}`} className="hover:text-fg">
              ~
            </Link>
          )}
        </li>
        {segments.map((segment, index) => {
          const href = `/${locale}/${segments.slice(0, index + 1).join('/')}`;
          const last = index === segments.length - 1;
          return (
            <Fragment key={href}>
              <li aria-hidden="true" className="px-px text-faint">
                /
              </li>
              <li className={cx(last && 'min-w-0 truncate')}>
                {last ? (
                  <span aria-current="page" className="text-fg">
                    {segment}
                  </span>
                ) : (
                  <Link href={href} className="hover:text-fg">
                    {segment}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

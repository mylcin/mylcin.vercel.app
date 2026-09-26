'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stripLocale } from '@/i18n/config';
import { cx } from '@/lib/cx';

export function NavLinks({
  items,
  className,
}: {
  items: { href: string; label: string; section: string }[];
  className?: string;
}) {
  const path = stripLocale(usePathname());

  return (
    <ul className={cx('flex items-center gap-5 font-mono text-sm', className)}>
      {items.map(item => {
        const current =
          path === item.section || path.startsWith(`${item.section}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={
                path === item.section ? 'page' : current ? 'true' : undefined
              }
              className={cx(
                'relative py-2 lowercase transition-colors duration-(--dur-fast)',
                current
                  ? 'text-fg after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:bg-accent'
                  : 'text-muted hover:text-fg'
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

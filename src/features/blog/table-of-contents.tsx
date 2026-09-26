'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/content/mdx';
import { cx } from '@/lib/cx';

/** Sticky outline in the label gutter; highlights the section being read. */
export function TableOfContents({
  items,
  label,
}: {
  items: TocItem[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="sticky top-10">
      <p className="mb-3 label">{label}</p>
      <ol className="space-y-2 font-mono text-xs leading-snug">
        {items.map(item => (
          <li key={item.id} className={cx(item.depth === 3 && 'pl-3')}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              className={cx(
                'block transition-colors duration-(--dur-fast) hover:text-fg',
                active === item.id ? 'text-accent-ink' : 'text-muted'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

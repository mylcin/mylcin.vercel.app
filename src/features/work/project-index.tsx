'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { SharedTitle } from '@/components/ui/page-transition';
import { Status } from '@/components/ui/status';
import { useI18n } from '@/i18n/client';
import type { ProjectView } from '@/lib/content/site';
import { cx } from '@/lib/cx';
import { ProjectPreview } from './project-preview';
import { projectMeta } from './project-rows';

/**
 * Quick scan on the left, preview on the right (wide screens). Hover or focus
 * a row to preview it; ↑/↓ move between rows; Enter opens the case study.
 * On narrow screens each row carries its own tagline instead of a panel.
 */
export function ProjectIndex({ projects }: { projects: ProjectView[] }) {
  const { locale, t } = useI18n();
  const [active, setActive] = useState(projects[0]?.slug);
  const listRef = useRef<HTMLOListElement>(null);
  const current = projects.find(p => p.slug === active) ?? projects[0];

  function onKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = [
      ...(listRef.current?.querySelectorAll<HTMLAnchorElement>('a[data-row]') ??
        []),
    ];
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    const next =
      links[
        (index + (event.key === 'ArrowDown' ? 1 : -1) + links.length) %
          links.length
      ];
    next.focus();
  }

  if (!current) return <p data-testid="project-list-empty">{t.work.empty}</p>;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
      <div>
        <div
          aria-hidden="true"
          className="hidden grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-4 border-b border-line pb-2 font-mono text-xs text-muted sm:grid"
        >
          <span>#</span>
          <span>{t.work.columns.project}</span>
          <span>{t.work.columns.status}</span>
        </div>
        <ol
          ref={listRef}
          onKeyDown={onKeyDown}
          data-testid="project-index"
          className="divide-y divide-line"
        >
          {projects.map((project, index) => (
            <li key={project.slug}>
              <Link
                data-row
                href={`/${locale}/work/${project.slug}`}
                onMouseEnter={() => setActive(project.slug)}
                onFocus={() => setActive(project.slug)}
                aria-describedby={`tagline-${project.slug}`}
                className={cx(
                  'group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-baseline',
                  'transition-colors duration-(--dur-fast)'
                )}
              >
                <span className="font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <SharedTitle name={`project-${project.slug}`}>
                    <span
                      className={cx(
                        'block text-lg leading-snug transition-colors duration-(--dur-fast) group-hover:text-accent-ink',
                        project.slug === current.slug && 'lg:text-accent-ink'
                      )}
                    >
                      {project.title}
                    </span>
                  </SharedTitle>
                  <span className="mt-0.5 block font-mono text-xs text-muted">
                    {projectMeta(project, t)}
                  </span>
                  <span
                    id={`tagline-${project.slug}`}
                    className="mt-2 block text-muted lg:sr-only"
                  >
                    {project.tagline}
                  </span>
                </span>
                <span className="col-start-2 font-mono text-xs text-muted sm:col-start-auto">
                  <Status
                    status={project.status}
                    label={t.work.status[project.status]}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p
          aria-hidden="true"
          className="mt-4 hidden font-mono text-xs text-muted lg:block"
        >
          {t.work.keyboardHint}
        </p>
      </div>

      <aside aria-hidden="true" className="hidden lg:block">
        <div className="sticky top-10 border-l border-line pl-8">
          <ProjectPreview
            key={current.slug}
            project={current}
            locale={locale}
            t={t}
          />
        </div>
      </aside>
    </div>
  );
}

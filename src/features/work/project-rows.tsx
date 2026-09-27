import Link from 'next/link';
import { SharedTitle } from '@/components/ui/page-transition';
import { Status } from '@/components/ui/status';
import type { ClientDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import type { ProjectView } from '@/lib/content/site';
import { projectMeta } from './project-meta';

/** Compact project list: title, leader, meta, tagline. Used on the home page. */
export function ProjectRows({
  projects,
  locale,
  t,
}: {
  projects: ProjectView[];
  locale: Locale;
  t: ClientDictionary;
}) {
  return (
    <ul data-testid="project-list" className="-mt-3 divide-y divide-line">
      {projects.map(project => (
        <li key={project.slug}>
          <Link
            href={`/${locale}/work/${project.slug}`}
            className="group block py-4"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <SharedTitle name={`project-${project.slug}`}>
                <h3 className="text-lg leading-snug transition-colors duration-(--dur-fast) group-hover:text-accent-ink">
                  {project.title}
                </h3>
              </SharedTitle>
              <span aria-hidden="true" className="hidden leader sm:block" />
              <span className="flex items-baseline gap-3 font-mono text-xs text-muted">
                <span>{projectMeta(project, t)}</span>
                <Status
                  status={project.status}
                  label={t.work.status[project.status]}
                />
              </span>
            </div>
            <p className="mt-1 text-muted">{project.tagline}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

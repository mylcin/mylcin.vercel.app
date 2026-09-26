import Link from 'next/link';
import { Status } from '@/components/ui/status';
import type { ClientDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';
import type { ProjectView } from '@/lib/content/site';
import { projectMeta } from './project-meta';

/** The middle level between a list row and the full case study. */
export function ProjectPreview({
  project,
  locale,
  t,
}: {
  project: ProjectView;
  locale: Locale;
  t: ClientDictionary;
}) {
  const story = project.why ?? project.summary;
  return (
    <div className="animate-swap">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
        <span>{projectMeta(project, t)}</span>
        <Status status={project.status} label={t.work.status[project.status]} />
      </p>
      <p className="mt-3 text-xl">{project.title}</p>
      <p className="mt-1 text-muted">{project.tagline}</p>

      {story && <p className="mt-5 line-clamp-5">{story}</p>}

      <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
        {project.stack.map(item => (
          <li key={item} className="whitespace-nowrap">
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={`/${locale}/work/${project.slug}`}
        className="group mt-6 inline-flex items-center gap-1.5 font-mono text-sm transition-colors duration-(--dur-fast) hover:text-accent-ink"
        tabIndex={-1}
      >
        {t.work.readCaseStudy}
        <span aria-hidden="true" className="nudge">
          →
        </span>
      </Link>
    </div>
  );
}

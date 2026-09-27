import type { ClientDictionary } from '@/i18n/dictionaries';
import type { ProjectView } from '@/lib/content/site';

/** "Web app · 2025" — category and year, as shown in lists and headers. */
export function projectMeta(project: ProjectView, t: ClientDictionary) {
  return [t.work.category[project.category], project.year]
    .filter(Boolean)
    .join(' · ');
}

import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';
import { ProjectIndex } from '@/features/work/project-index';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { format, plural } from '@/i18n/format';
import { getProfile, getProjects } from '@/lib/content/site';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/work'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/work',
    title: t.work.title,
    description: format(t.meta.workDescription, {
      name: getProfile(locale).name,
    }),
  });
}

export default async function WorkPage({
  params,
}: PageProps<'/[locale]/work'>) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const projects = getProjects(locale);

  return (
    <PageTransition>
      <PageHeader
        meta={plural(locale, projects.length, t.work.count)}
        title={t.work.title}
        intro={t.work.intro}
      />
      {/* Same grid as the header above: the list starts in the content column. */}
      <div className="section">
        <div aria-hidden="true" className="hidden md:block" />
        <ProjectIndex projects={projects} />
      </div>
    </PageTransition>
  );
}

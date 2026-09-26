import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { PageTransition } from '@/components/ui/page-transition';
import { ProjectIndex } from '@/features/work/project-index';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { plural } from '@/i18n/format';
import { getProjects } from '@/lib/content/site';
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
    description: t.meta.workDescription,
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
      <ProjectIndex projects={projects} />
    </PageTransition>
  );
}

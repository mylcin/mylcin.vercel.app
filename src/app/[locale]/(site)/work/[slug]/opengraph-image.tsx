import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getProject, getProjectSlugs } from '@/lib/content/site';
import { projectMeta } from '@/features/work/project-meta';
import { ogAlt, ogContentType, ogHost, ogImage, ogSize } from '@/lib/og';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap(locale =>
    getProjectSlugs().map(slug => ({ locale, slug }))
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const project = getProject(slug, locale);
  if (!project) notFound();
  return ogImage({
    eyebrow: projectMeta(project, getDictionary(locale)),
    title: project.title,
    subtitle: project.tagline,
    footer: `${ogHost}/work`,
  });
}

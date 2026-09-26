import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getProject, getProjectSlugs } from '@/lib/content/site';
import { ogContentType, ogHost, ogImage, ogSize } from '@/lib/og';

export const alt = 'Mustafa Yalçın — Work';
export const size = ogSize;
export const contentType = ogContentType;

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
  const t = getDictionary(locale);
  const project = getProject(slug, locale);
  if (!project)
    return ogImage({
      eyebrow: t.work.title,
      title: t.notFound.title,
      footer: ogHost,
    });
  return ogImage({
    eyebrow: [t.work.category[project.category], project.year]
      .filter(Boolean)
      .join(' · '),
    title: project.title,
    subtitle: project.tagline,
    footer: `${ogHost}/work`,
  });
}

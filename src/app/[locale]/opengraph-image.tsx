import { defaultLocale, isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getProfile } from '@/lib/content/site';
import { ogContentType, ogHost, ogImage, ogSize } from '@/lib/og';

export const alt = 'Mustafa Yalçın';
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getDictionary(locale);
  const profile = getProfile(locale);
  return ogImage({
    eyebrow: t.home.runningHead,
    title: profile.name,
    subtitle: `— ${profile.headline}`,
    footer: ogHost,
  });
}

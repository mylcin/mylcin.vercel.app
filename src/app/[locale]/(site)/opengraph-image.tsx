import { defaultLocale, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getProfile } from '@/lib/content/site';
import {
  localeParams,
  ogAlt,
  ogContentType,
  ogHost,
  ogImage,
  ogSize,
} from '@/lib/og';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export const dynamicParams = false;
export const generateStaticParams = localeParams;

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

import { locale as localeParam } from 'next/root-params';
import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary } from './dictionaries';

/**
 * Locale + dictionary for any Server Component under app/[locale], without
 * passing props down. (Route handlers and metadata images can't use this —
 * they read `params` instead.)
 */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  return isLocale(value) ? value : defaultLocale;
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}

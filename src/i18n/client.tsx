'use client';

import { createContext, use } from 'react';
import { LOCALE_COOKIE, type Locale } from './config';
import type { Dictionary } from './dictionaries';

const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(
  null
);

/** Receives only the active locale's dictionary from the server layout. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext value={{ locale, t: messages }}>{children}</I18nContext>;
}

export function useI18n() {
  const value = use(I18nContext);
  if (!value) throw new Error('useI18n() must be used inside <I18nProvider>');
  return value;
}

/** Remembers the choice so unprefixed URLs (/, shared links) open in it next time. */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

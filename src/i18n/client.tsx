'use client';

import { createContext, use } from 'react';
import { LOCALE_COOKIE, localizePath, type Locale } from './config';
import type { ClientDictionary } from './dictionaries';

const I18nContext = createContext<{
  locale: Locale;
  t: ClientDictionary;
} | null>(null);

/** Receives only the active locale's dictionary from the server layout. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: ClientDictionary;
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

/**
 * The current URL in another locale, keeping the query and hash (a blog tag
 * filter, an #anchor). Call from event handlers only — it reads `location`.
 */
export function urlInLocale(locale: Locale) {
  const { pathname, search, hash } = window.location;
  return `${localizePath(pathname, locale)}${search}${hash}`;
}

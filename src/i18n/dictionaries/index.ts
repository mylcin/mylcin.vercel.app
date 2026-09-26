import type { Locale } from '../config';
import en, { type Dictionary } from './en';
import tr from './tr';

export type { Dictionary };

// Both dictionaries are small, so they are imported eagerly. If this ever grows,
// switch to `() => import('./xx')` per locale — call sites already go through here.
const dictionaries: Record<Locale, Dictionary> = { en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** What client components get: everything except server-only metadata copy. */
export type ClientDictionary = Omit<Dictionary, 'meta'>;

export function clientMessages({
  meta: _meta,
  ...rest
}: Dictionary): ClientDictionary {
  return rest;
}

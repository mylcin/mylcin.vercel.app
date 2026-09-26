import { localeMeta, type Locale } from './config';

/** A message with plural forms, selected with `Intl.PluralRules`. `other` is required. */
export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

type Vars = Record<string, string | number>;

/** Replaces `{name}` placeholders. Unknown placeholders are left visible on purpose. */
export function format(template: string, vars: Vars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

export function plural(
  locale: Locale,
  count: number,
  forms: Plural,
  vars: Vars = {}
): string {
  const rule = new Intl.PluralRules(localeMeta[locale].intl).select(count);
  return format(forms[rule] ?? forms.other, { count, ...vars });
}

// Content dates are calendar dates ("2025-12-04"), so format them in UTC to
// avoid shifting a day depending on the reader's (or the server's) timezone.
const dateStyles = {
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  short: { day: 'numeric', month: 'short', year: 'numeric' },
  dayMonth: { day: 'numeric', month: 'short' },
  monthYear: { month: 'short', year: 'numeric' },
  year: { year: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof dateStyles;

export function formatDate(
  value: string | Date,
  locale: Locale,
  style: DateStyle = 'long'
): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    ...dateStyles[style],
    timeZone: 'UTC',
  }).format(date);
}

/** Accepts `YYYY`, `YYYY-MM` and `YYYY-MM-DD`. */
export function parseDate(value: string): Date {
  const [year, month = 1, day = 1] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** ISO date without time, for `<time dateTime>` and feeds. */
export function isoDate(value: string | Date): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return date.toISOString().slice(0, 10);
}

export function formatList(
  items: string[],
  locale: Locale,
  type: Intl.ListFormatType = 'conjunction'
): string {
  return new Intl.ListFormat(localeMeta[locale].intl, {
    style: 'long',
    type,
  }).format(items);
}

/** Whole months between two `YYYY-MM` dates, inclusive of the start month. */
export function monthsBetween(start: string, end: string | Date): number {
  const from = parseDate(start);
  const to = typeof end === 'string' ? parseDate(end) : end;
  return (
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) +
    1
  );
}

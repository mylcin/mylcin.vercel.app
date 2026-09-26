import { defaultLocale, type Locale } from '@/i18n/config';

/**
 * A value translated per locale. The default locale is required; any other
 * locale may be missing and falls back to it (see `localize`).
 */
export type Localized<T = string> = Record<typeof defaultLocale, T> &
  Partial<Record<Locale, T>>;

export function localize<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value[defaultLocale];
}

/** `YYYY-MM` or `YYYY-MM-DD`. */
export type DateString =
  `${number}-${number}` | `${number}-${number}-${number}`;

export type SocialId = 'github' | 'linkedin' | 'instagram';

export interface Profile {
  name: string;
  /** Lowercase handle used in the console prompt and running heads. */
  handle: string;
  role: Localized;
  email: string;
  location: { city: string; country: Localized; timeZone: string };
  /** Default meta description: one or two sentences for search results. */
  description: Localized;
  /** Completes the sentence "<name> — …" in the home page headline. */
  headline: Localized;
  /** Short bio for the home page. One string per paragraph. */
  intro: Localized<string[]>;
  /** Longer bio for the about page. One string per paragraph. */
  about: Localized<string[]>;
  /** The man-page synopsis: `handle [--flag]… <argument>`. */
  synopsis: {
    flags: { name: string; description: Localized }[];
    argument: Localized;
    /** What running the command does, in one line (`mustafa --help`). */
    summary: Localized;
  };
  /** The "BUGS" section of the home page. One known issue per entry. */
  bugs: Localized<string[]>;
  /** Spoken languages, one line (About page, `neofetch`). */
  languages: Localized;
  /** One line, for `neofetch`. */
  hobbies: Localized;
  socials: { id: SocialId; label: string; handle: string; href: string }[];
  resume: { href: string };
  /** Public repository of this site, linked from the footer. */
  sourceUrl?: string;
}

export type ProjectCategory = 'web' | 'cli' | 'library' | 'other';
export type ProjectStatus = 'live' | 'in-progress' | 'paused' | 'archived';

export interface Project {
  /** URL segment: `/work/<slug>`. Keep it stable once published. */
  slug: string;
  title: Localized;
  /** One line: what it is. Shown in lists and previews. */
  tagline: Localized;
  category: ProjectCategory;
  status: ProjectStatus;
  /** Year work started. Omit if unknown rather than guessing. */
  year?: number;
  featured?: boolean;
  /** A paragraph on what it is, in more detail than the tagline. */
  summary?: Localized;
  /** Why it exists / the problem it solves. */
  why?: Localized;
  /** What I did on it. */
  role?: Localized;
  /** Notable features or facts, one per entry. */
  highlights?: Localized<string[]>;
  decisions?: { title: Localized; body: Localized }[];
  outcome?: Localized;
  stack: string[];
  links?: { live?: string; source?: string; docs?: string };
  cover?: { src: string; alt: Localized; width: number; height: number };
}

export type EmploymentType =
  'full-time' | 'part-time' | 'contract' | 'internship';

export interface Role {
  /** Localized so "Freelance" can translate; plain names only need `en`. */
  company: Localized;
  url?: string;
  title: Localized;
  location: Localized;
  type: EmploymentType;
  start: DateString;
  /** Omit for a current role. */
  end?: DateString;
  /** One line on what the role is about. */
  summary: Localized;
  highlights: Localized<string[]>;
  stack: string[];
}

export interface SkillGroup {
  name: Localized;
  /** Localized because practices ("Unit testing") translate; names only need `en`. */
  items: Localized<string[]>;
}

export interface Education {
  school: Localized;
  degree: Localized;
  field: Localized;
  location: Localized;
  start: DateString;
  end: DateString;
  /** Written the way each language writes decimals ("3.28" / "3,28"). */
  gpa?: Localized;
  notes: Localized<string[]>;
}

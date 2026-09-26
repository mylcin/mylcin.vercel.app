import type { Locale } from '@/i18n/config';
import type {
  ProjectCategory,
  ProjectStatus,
  SocialId,
} from '@/lib/content/types';

/**
 * Everything the console knows about the site, resolved for one locale on the
 * server and handed to the client as plain data. The console's filesystem
 * (see engine/fs.ts) is built from this.
 */
export interface ConsoleIndex {
  profile: {
    name: string;
    handle: string;
    role: string;
    email: string;
    city: string;
    country: string;
    timeZone: string;
    headline: string;
    intro: string[];
    synopsis: {
      flags: { name: string; description: string }[];
      argument: string;
      summary: string;
    };
    bugs: string[];
    socials: { id: SocialId; label: string; handle: string; href: string }[];
    resume: string;
    employer?: string;
    careerStart: string;
    stack: string[];
    languages: string;
    hobbies: string;
  };
  projects: {
    slug: string;
    title: string;
    tagline: string;
    summary?: string;
    category: ProjectCategory;
    status: ProjectStatus;
    year?: number;
    stack: string[];
    links: { live?: string; source?: string; docs?: string };
  }[];
  posts: {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    readingMinutes: number;
    lang: Locale;
    translations: Locale[];
    excerpt: string;
    /** Each translation's own text, so `cat <slug>/<lang>.md` shows that file. */
    variants: Partial<
      Record<
        Locale,
        {
          title: string;
          description: string;
          excerpt: string;
          readingMinutes: number;
        }
      >
    >;
  }[];
  about: {
    experience: {
      company: string;
      title: string;
      start: string;
      end?: string;
      summary: string;
    }[];
    skills: { name: string; items: string[] }[];
    education: {
      school: string;
      degree: string;
      field: string;
      start: string;
      end: string;
      gpa?: string;
    }[];
  };
}

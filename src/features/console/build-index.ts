import { locales, type Locale } from '@/i18n/config';
import { getPosts } from '@/lib/content/blog';
import {
  careerStart,
  currentRole,
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from '@/lib/content/site';
import type { ConsoleIndex } from './types';

/** Server-side: gathers the console's view of the site for one locale. */
export async function buildConsoleIndex(locale: Locale): Promise<ConsoleIndex> {
  const profile = getProfile(locale);
  const experience = getExperience(locale);
  const [posts, ...variants] = await Promise.all([
    getPosts(locale),
    // Every locale's view, to know each translation's own text.
    ...locales.map(l => getPosts(l)),
  ]);

  return {
    profile: {
      name: profile.name,
      handle: profile.handle,
      role: profile.role,
      email: profile.email,
      city: profile.location.city,
      country: profile.location.country,
      timeZone: profile.location.timeZone,
      headline: profile.headline,
      intro: profile.intro,
      synopsis: profile.synopsis,
      bugs: profile.bugs,
      socials: profile.socials,
      resume: profile.resume.href,
      employer: currentRole(locale)?.company,
      careerStart: careerStart(),
      stack: profile.synopsis.flags.map(flag => flag.name),
      languages: profile.languages,
      hobbies: profile.hobbies,
    },
    projects: getProjects(locale).map(p => ({
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      summary: p.summary,
      category: p.category,
      status: p.status,
      year: p.year,
      stack: p.stack,
      links: p.links,
    })),
    posts: posts.map(post => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      tags: post.tags,
      readingMinutes: post.readingMinutes,
      lang: post.lang,
      translations: post.translations,
      excerpt: post.excerpt,
      variants: Object.fromEntries(
        variants
          .flat()
          .filter(v => v.slug === post.slug)
          .map(v => [
            v.lang,
            {
              title: v.title,
              description: v.description,
              excerpt: v.excerpt,
              readingMinutes: v.readingMinutes,
            },
          ])
      ),
    })),
    about: {
      experience: experience.map(role => ({
        company: role.company,
        title: role.title,
        start: role.start,
        end: role.end,
        summary: role.summary,
      })),
      skills: getSkills(locale),
      education: getEducation(locale).map(entry => ({
        school: entry.school,
        degree: entry.degree,
        field: entry.field,
        start: entry.start,
        end: entry.end,
        gpa: entry.gpa,
      })),
    },
  };
}

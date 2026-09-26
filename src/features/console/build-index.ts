import { locales, type Locale } from '@/i18n/config';
import { getPosts } from '@/lib/content/blog';
import {
  careerStart,
  getCertificates,
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
  const skills = getSkills(locale);
  const [posts, ...variants] = await Promise.all([
    getPosts(locale),
    // Every locale's view, to know each translation's title.
    ...locales.map(l => getPosts(l)),
  ]);

  return {
    locale,
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
      employer: experience.find(role => !role.end)?.company,
      careerStart: careerStart(),
      stack: skills[0]?.items.slice(0, 4) ?? [],
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
      titles: Object.fromEntries(
        variants
          .flat()
          .filter(v => v.slug === post.slug)
          .map(v => [v.lang, v.title])
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
      skills,
      education: getEducation(locale).map(entry => ({
        school: entry.school,
        degree: entry.degree,
        field: entry.field,
        start: entry.start,
        end: entry.end,
        gpa: entry.gpa,
      })),
      certificates: getCertificates().map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        url: cert.url,
      })),
    },
  };
}

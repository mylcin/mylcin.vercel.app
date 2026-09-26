import { profile as rawProfile } from '@content/profile';
import { projects as rawProjects } from '@content/projects';
import {
  certificates,
  education as rawEducation,
  experience as rawExperience,
  skills as rawSkills,
} from '@content/resume';
import type { Locale } from '@/i18n/config';
import { localize, type Project, type Role } from './types';

/**
 * Resolves content for one locale, so components receive plain strings and
 * never deal with translation objects or fallbacks themselves.
 */

export function getProfile(locale: Locale) {
  const p = rawProfile;
  return {
    name: p.name,
    handle: p.handle,
    role: localize(p.role, locale),
    email: p.email,
    location: {
      city: p.location.city,
      country: localize(p.location.country, locale),
      timeZone: p.location.timeZone,
    },
    headline: localize(p.headline, locale),
    intro: localize(p.intro, locale),
    about: localize(p.about, locale),
    synopsis: {
      flags: p.synopsis.flags.map(flag => ({
        name: flag.name,
        description: localize(flag.description, locale),
      })),
      argument: localize(p.synopsis.argument, locale),
      summary: localize(p.synopsis.summary, locale),
    },
    bugs: localize(p.bugs, locale),
    socials: p.socials,
    resume: p.resume,
    sourceUrl: p.sourceUrl,
  };
}

export type ProfileView = ReturnType<typeof getProfile>;

function resolveProject(project: Project, locale: Locale) {
  return {
    slug: project.slug,
    title: localize(project.title, locale),
    tagline: localize(project.tagline, locale),
    category: project.category,
    status: project.status,
    year: project.year,
    featured: project.featured ?? false,
    summary: project.summary && localize(project.summary, locale),
    why: project.why && localize(project.why, locale),
    role: project.role && localize(project.role, locale),
    highlights: project.highlights ? localize(project.highlights, locale) : [],
    decisions: (project.decisions ?? []).map(decision => ({
      title: localize(decision.title, locale),
      body: localize(decision.body, locale),
    })),
    outcome: project.outcome && localize(project.outcome, locale),
    stack: project.stack,
    links: project.links ?? {},
    cover: project.cover && {
      ...project.cover,
      alt: localize(project.cover.alt, locale),
    },
  };
}

export type ProjectView = ReturnType<typeof resolveProject>;

export function getProjects(locale: Locale): ProjectView[] {
  return rawProjects.map(project => resolveProject(project, locale));
}

export function getProject(
  slug: string,
  locale: Locale
): ProjectView | undefined {
  const project = rawProjects.find(p => p.slug === slug);
  return project && resolveProject(project, locale);
}

export function getProjectSlugs(): string[] {
  return rawProjects.map(p => p.slug);
}

function resolveRole(role: Role, locale: Locale) {
  return {
    company: localize(role.company, locale),
    url: role.url,
    title: localize(role.title, locale),
    location: localize(role.location, locale),
    type: role.type,
    start: role.start,
    end: role.end,
    summary: localize(role.summary, locale),
    highlights: localize(role.highlights, locale),
    stack: role.stack,
  };
}

export type RoleView = ReturnType<typeof resolveRole>;

export function getExperience(locale: Locale): RoleView[] {
  return rawExperience.map(role => resolveRole(role, locale));
}

export function getSkills(locale: Locale) {
  return rawSkills.map(group => ({
    name: localize(group.name, locale),
    items: group.items,
  }));
}

export function getEducation(locale: Locale) {
  return rawEducation.map(entry => ({
    school: entry.school,
    degree: localize(entry.degree, locale),
    field: localize(entry.field, locale),
    location: localize(entry.location, locale),
    start: entry.start,
    end: entry.end,
    gpa: entry.gpa,
    notes: localize(entry.notes, locale),
  }));
}

export function getCertificates() {
  return certificates;
}

/** Start of the first non-internship role — "in production since". */
export function careerStart(): string {
  const starts = rawExperience
    .filter(role => role.type !== 'internship')
    .map(role => role.start)
    .sort();
  return starts[0];
}

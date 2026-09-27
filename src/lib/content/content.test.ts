import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/config';
import { getPost, getPosts, getPostSlugs, relatedPosts } from './blog';
import { getExperience, getProjects, getProjectSlugs } from './site';

describe('blog', () => {
  it('prefers the reader’s language and falls back to the original', async () => {
    const tr = await getPosts('tr');
    const hello = tr.find(post => post.slug === 'hello-world')!;
    expect(hello.lang).toBe('tr');
    expect(hello.translations).toEqual(['en', 'tr']);

    const untranslated = tr.find(post => post.slug === 'cve-2026-40175')!;
    expect(untranslated.lang).toBe('en');
    expect(untranslated.translations).toEqual(['en']);
  });

  it('lists newest first with a reading time and excerpt', async () => {
    const posts = await getPosts('en');
    const dates = posts.map(post => post.date);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const post of posts) {
      expect(post.readingMinutes).toBeGreaterThan(0);
      expect(post.excerpt.length).toBeGreaterThan(20);
    }
  });

  it('compiles every post in every locale, with a table of contents', async () => {
    for (const slug of await getPostSlugs()) {
      for (const locale of locales) {
        const post = await getPost(slug, locale);
        expect(post?.Content).toBeTypeOf('function');
      }
    }
    const post = await getPost('cve-2025-66478', 'en');
    expect(post!.toc.map(item => item.id)).toContain('how-to-fix-it');
  });

  it('relates posts by shared tags', async () => {
    const posts = await getPosts('en');
    const axios = posts.find(post => post.slug === 'cve-2026-40175')!;
    expect(relatedPosts(axios, posts).map(post => post.slug)).toEqual([
      'cve-2025-66478',
    ]);
  });
});

describe('projects and resume', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = getProjectSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('resolves every locale with fallbacks', () => {
    for (const locale of locales) {
      for (const project of getProjects(locale)) {
        expect(project.title).toBeTruthy();
        expect(project.tagline).toBeTruthy();
      }
      expect(getExperience(locale)[0].company).toBe('PITON Technology');
    }
    expect(getExperience('tr')[1].company).toBe('Serbest');
  });
});

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { parse as parseYaml } from 'yaml';
import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/config';
import { compileMdx } from './mdx';

/**
 * Posts live in `content/blog/<slug>/<locale>.mdx`. A slug is one post; each
 * file is a translation of it. Missing translations fall back to the default
 * locale (or whatever exists), and the page says so.
 */
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const WORDS_PER_MINUTE = 220;

export interface PostSummary {
  slug: string;
  /** Language the content is actually written in. */
  lang: Locale;
  /** Every language this post exists in. */
  translations: Locale[];
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  readingMinutes: number;
  /** First paragraph as plain text, for the console and feeds. */
  excerpt: string;
}

interface PostFile extends PostSummary {
  body: string;
}

interface Frontmatter {
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  draft: boolean;
}

function readFrontmatter(file: string, source: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) throw new Error(`${file}: missing frontmatter`);
  const data = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;

  const fail = (field: string, expected: string) => {
    throw new Error(`${file}: frontmatter "${field}" must be ${expected}`);
  };
  const isDate = (v: unknown) =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

  if (typeof data.title !== 'string' || !data.title)
    fail('title', 'a non-empty string');
  if (typeof data.description !== 'string') fail('description', 'a string');
  if (!isDate(data.date)) fail('date', 'a quoted YYYY-MM-DD string');
  if (data.updated !== undefined && !isDate(data.updated))
    fail('updated', 'a quoted YYYY-MM-DD string');
  if (data.tags !== undefined && !Array.isArray(data.tags))
    fail('tags', 'a list');

  const frontmatter: Frontmatter = {
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    updated: data.updated as string | undefined,
    tags: ((data.tags as unknown[]) ?? []).map(String),
    draft: data.draft === true,
  };
  return { frontmatter, body: source.slice(match[0].length) };
}

function plainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~>#]/g, '')
    .trim();
}

function firstParagraph(markdown: string) {
  const paragraph = markdown
    .split(/\r?\n\s*\r?\n/)
    .map(block => block.trim())
    .find(
      block =>
        block && !/^(#|```|[-*+] |\d+\. |>|<|import |export )/.test(block)
    );
  return paragraph ? plainText(paragraph).replace(/\s+/g, ' ') : '';
}

const loadAll = cache(async (): Promise<Map<string, Map<Locale, PostFile>>> => {
  const posts = new Map<string, Map<Locale, PostFile>>();
  const slugs = await readdir(BLOG_DIR, { withFileTypes: true });

  for (const entry of slugs) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const files = await readdir(path.join(BLOG_DIR, slug));
    const variants = new Map<Locale, PostFile>();

    for (const name of files) {
      const lang = name.replace(/\.mdx$/, '');
      if (!name.endsWith('.mdx') || !isLocale(lang)) continue;

      const file = path.join('content/blog', slug, name);
      const source = await readFile(path.join(BLOG_DIR, slug, name), 'utf8');
      const { frontmatter, body } = readFrontmatter(file, source);
      if (frontmatter.draft && process.env.NODE_ENV === 'production') continue;

      const words = plainText(body).split(/\s+/).filter(Boolean).length;
      variants.set(lang, {
        slug,
        lang,
        translations: [],
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        updated: frontmatter.updated,
        tags: frontmatter.tags,
        readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        excerpt: firstParagraph(body),
        body,
      });
    }

    const translations = locales.filter(l => variants.has(l));
    for (const variant of variants.values())
      variant.translations = translations;
    if (variants.size > 0) posts.set(slug, variants);
  }

  return posts;
});

function pickVariant(variants: Map<Locale, PostFile>, locale: Locale) {
  return (
    variants.get(locale) ??
    variants.get(defaultLocale) ??
    variants.values().next().value!
  );
}

function toSummary({ body: _body, ...summary }: PostFile): PostSummary {
  return summary;
}

/** Every post, newest first, each in `locale` when a translation exists. */
export const getPosts = cache(
  async (locale: Locale): Promise<PostSummary[]> => {
    const all = await loadAll();
    return [...all.values()]
      .map(variants => toSummary(pickVariant(variants, locale)))
      .sort(
        (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)
      );
  }
);

export async function getPostSlugs(): Promise<string[]> {
  return [...(await loadAll()).keys()];
}

export const getPost = cache(async (slug: string, locale: Locale) => {
  const variants = (await loadAll()).get(slug);
  if (!variants) return null;

  const post = pickVariant(variants, locale);
  const { Content, toc } = await compileMdx(post.body);
  return { ...toSummary(post), Content, toc };
});

export async function getAllTags(locale: Locale): Promise<string[]> {
  const tags = new Set((await getPosts(locale)).flatMap(post => post.tags));
  return [...tags].sort();
}

/** Posts sharing the most tags with `post`, most relevant first. */
export function relatedPosts(
  post: PostSummary,
  posts: PostSummary[],
  limit = 2
) {
  return posts
    .filter(other => other.slug !== post.slug)
    .map(other => ({
      other,
      shared: other.tags.filter(tag => post.tags.includes(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort(
      (a, b) => b.shared - a.shared || b.other.date.localeCompare(a.other.date)
    )
    .slice(0, limit)
    .map(({ other }) => other);
}

import type { Locale } from '@/i18n/config';
import type { ConsoleIndex } from '../types';

/**
 * A read-only filesystem mirroring the site. Every directory is a route, so
 * `cd` navigates and the prompt's working directory is always the URL.
 *
 *   ~/                      /
 *   ├── readme.md
 *   ├── work/               /work
 *   │   └── <slug>/         /work/<slug>
 *   │       └── readme.md
 *   ├── blog/               /blog
 *   │   └── <slug>/         /blog/<slug>
 *   │       └── <lang>.md   one file per translation
 *   └── about/              /about
 *       └── experience.md, skills.md, education.md, contact.md
 */

export type FileContent =
  | { type: 'readme' }
  | { type: 'project'; slug: string }
  | { type: 'post'; slug: string; lang: Locale }
  | { type: 'about'; section: AboutSection };

export type AboutSection = 'experience' | 'skills' | 'education' | 'contact';

interface BaseNode {
  name: string;
  /** Absolute path without trailing slash: `/`, `/work`, `/work/weather-cli`. */
  path: string;
  /** One-line description for `ls -l`. */
  title?: string;
  /** Short metadata column for `ls -l` (a date, a year…). */
  meta?: string;
}

export interface DirNode extends BaseNode {
  kind: 'dir';
  /** Route, without locale prefix. */
  href: string;
  children: FsNode[];
}

export interface FileNode extends BaseNode {
  kind: 'file';
  content: FileContent;
  /** Where `open` takes you. A locale-less route, or an absolute URL. */
  href: string;
  /** For translation files: open in this locale. */
  locale?: Locale;
}

export type FsNode = DirNode | FileNode;

export interface FsLabels {
  status: (status: ConsoleIndex['projects'][number]['status']) => string;
  about: Record<AboutSection, string>;
  readme: string;
  work: string;
  blog: string;
  aboutDir: string;
  language: (locale: Locale) => string;
}

function dir(
  path: string,
  props: Omit<DirNode, 'kind' | 'path' | 'name' | 'href'>
): DirNode {
  const name = path === '/' ? '~' : path.slice(path.lastIndexOf('/') + 1);
  return { kind: 'dir', name, path, href: path, ...props };
}

export function buildFs(index: ConsoleIndex, labels: FsLabels): DirNode {
  const work = dir('/work', {
    title: labels.work,
    children: index.projects.map(project =>
      dir(`/work/${project.slug}`, {
        title: project.title,
        meta: [project.year, labels.status(project.status)]
          .filter(Boolean)
          .join(' · '),
        children: [
          {
            kind: 'file',
            name: 'readme.md',
            path: `/work/${project.slug}/readme.md`,
            title: project.tagline,
            href: `/work/${project.slug}`,
            content: { type: 'project', slug: project.slug },
          },
        ],
      })
    ),
  });

  const blog = dir('/blog', {
    title: labels.blog,
    children: index.posts.map(post =>
      dir(`/blog/${post.slug}`, {
        title: post.title,
        meta: post.date,
        children: post.translations.map(lang => ({
          kind: 'file' as const,
          name: `${lang}.md`,
          path: `/blog/${post.slug}/${lang}.md`,
          title: post.variants[lang]?.title ?? post.title,
          meta: labels.language(lang),
          href: `/blog/${post.slug}`,
          locale: lang,
          content: { type: 'post' as const, slug: post.slug, lang },
        })),
      })
    ),
  });

  const aboutSections: AboutSection[] = [
    'experience',
    'skills',
    'education',
    'contact',
  ];
  const about = dir('/about', {
    title: labels.aboutDir,
    children: aboutSections.map(section => ({
      kind: 'file' as const,
      name: `${section}.md`,
      path: `/about/${section}.md`,
      title: labels.about[section],
      href: `/about#${section}`,
      content: { type: 'about' as const, section },
    })),
  });

  return dir('/', {
    title: index.profile.name,
    children: [
      work,
      blog,
      about,
      {
        kind: 'file',
        name: 'readme.md',
        path: '/readme.md',
        title: labels.readme,
        href: '/',
        content: { type: 'readme' },
      },
    ],
  });
}

/**
 * Resolves `input` against `cwd` into a normalized absolute path.
 * Handles `~`, `/`, `.`, `..` and trailing slashes. Doesn't check existence.
 */
export function resolvePath(cwd: string, input: string): string {
  const raw = input.trim();
  let base: string[];
  let rest: string;

  if (raw === '' || raw === '.') return cwd;
  if (raw === '~' || raw.startsWith('~/')) {
    base = [];
    rest = raw.slice(1);
  } else if (raw.startsWith('/')) {
    base = [];
    rest = raw;
  } else {
    base = cwd.split('/').filter(Boolean);
    rest = raw;
  }

  for (const segment of rest.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') base.pop();
    else base.push(segment);
  }
  return `/${base.join('/')}`;
}

export function lookup(root: DirNode, path: string): FsNode | null {
  let node: FsNode = root;
  for (const segment of path.split('/').filter(Boolean)) {
    if (node.kind !== 'dir') return null;
    const next: FsNode | undefined = node.children.find(
      child => child.name === segment
    );
    if (!next) return null;
    node = next;
  }
  return node;
}

/** The deepest existing directory for a route (404 pages resolve to an ancestor). */
export function nearestDir(root: DirNode, path: string): DirNode {
  const segments = path.split('/').filter(Boolean);
  while (segments.length) {
    const node = lookup(root, `/${segments.join('/')}`);
    if (node?.kind === 'dir') return node;
    segments.pop();
  }
  return root;
}

/** `/work/x` → `~/work/x`, `/` → `~`. */
export function displayPath(path: string): string {
  return path === '/' ? '~' : `~${path}`;
}

/** Path of `node` relative to `cwd` when it's inside it, otherwise `~/…`. */
export function relativePath(cwd: string, path: string): string {
  if (cwd === '/') return path.slice(1) || '~';
  if (path.startsWith(`${cwd}/`)) return path.slice(cwd.length + 1);
  return displayPath(path);
}

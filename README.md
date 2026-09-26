# mylcin.vercel.app

Personal site of Mustafa Yalçın. It reads like a manual page — `MUSTAFA(1)` —
and has a shell built in: press <kbd>⌘K</kbd> (or <kbd>Ctrl K</kbd>, or the `>_`
button) and the same site becomes explorable with `ls`, `cd`, `cat` and friends.
The prompt's working directory is always the current URL.

English and Turkish, light and dark, statically generated.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks)
npm test           # unit tests (vitest)
npm run lint
```

Optional: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://example.com`) for canonical
URLs, the sitemap and Open Graph images. On Vercel it falls back to the
production domain.

---

## Editing content

Everything you'd normally change lives in `content/`. No UI code needs to be
touched to add a project, a post, a job or a translation.

| What                               | Where                                             |
| ---------------------------------- | ------------------------------------------------- |
| Name, bio, socials, résumé link    | `content/profile.ts`                              |
| Projects (order = display order)   | `content/projects.ts`                             |
| Experience, skills, education      | `content/resume.ts` (mirrors `public/resume.pdf`) |
| Blog posts                         | `content/blog/<slug>/<locale>.mdx`                |
| UI copy (buttons, labels, console) | `src/i18n/dictionaries/{en,tr}.ts`                |

Translated fields look like `{ en: '…', tr: '…' }`. Only `en` is required;
anything missing falls back to English, so content can be translated gradually.

### A new project

Add an object to `content/projects.ts`. Required: `slug`, `title`, `tagline`,
`category`, `status`, `stack`. Everything else (`summary`, `why`, `role`,
`highlights`, `decisions`, `outcome`, `links`, `year`, `featured`) is optional —
the project page renders whichever sections exist. Set `featured: true` to show
it on the home page. Leave `year` out rather than guessing.

### A new post

```text
content/blog/my-post/en.mdx      # the original
content/blog/my-post/tr.mdx      # optional translation, same slug
```

```mdx
---
title: 'My post'
description: 'One or two sentences.'
date: '2026-10-01'
updated: '2026-10-05'  # optional
tags: ['nextjs', 'security']
draft: true           # optional; drafts only show in development
---

Markdown / MDX here. Start with a paragraph — the page renders the title.
```

Posts without a translation still appear in the other language's blog, marked
with the original language, and their page says it's showing the original.
Search engines are pointed at the original.

### A new language

1. Add the code to `locales` and `localeMeta` in `src/i18n/config.ts`.
2. Copy `src/i18n/dictionaries/en.ts` to `<code>.ts`, translate, register it in
   `dictionaries/index.ts`. The type checker and `npm test` list anything missing
   or any placeholder that doesn't match.
3. Translate content whenever you like; untranslated fields fall back to English.

---

## How it's built

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4.
- **Every page is static.** Routes live under `src/app/[locale]/(site)/`;
  `src/proxy.ts` sends unprefixed URLs to a locale using the visitor's saved
  choice, then their browser language. Old `/blog/<slug>` links get a permanent
  redirect to the English post.
- **404s.** Unknown URLs are unmatched and get `app/global-not-found.tsx`,
  fully server-rendered in the URL's language (the proxy passes it along). In
  this Next version a 404 thrown by `notFound()` from a page is rendered on the
  client only, so pages avoid needing it: slugs are all pre-generated.
- **Posts are MDX compiled on the server** (`@mdx-js/mdx` + `rehype-pretty-code`).
  No MDX runtime ships to the browser. Code colors are CSS variables, so syntax
  highlighting uses the site palette in both themes.
- **No animation, state or UI library.** Motion is CSS and the View Transitions
  API; the theme switch is ~100 lines in `src/lib/theme.ts`.

```text
content/                 what the site says (edit this)
src/
  app/                   routes, metadata, sitemap, robots, OG images
  components/
    ui/                  primitives: buttonClass, Section, Status, Pager, CopyButton…
    layout/              header, footer, language/theme switches
    mdx/                 how Markdown renders (headings, code blocks, links)
  features/
    console/             the shell — removable, see below
    work/ blog/ home/    page-specific components
  i18n/                  locales, dictionaries, formatting helpers
  lib/content/           loaders that resolve content for one locale
```

### Design system

Tokens are in `src/app/globals.css`. Tailwind's default palette, type scale,
radii and easings are reset, so only the site's tokens exist as utilities.

- **Type:** Newsreader for reading, JetBrains Mono for chrome, meta and code.
- **Color:** paper and ink, one vermilion accent for focus, hover and "you are
  here". Status colors only appear as small dots next to a text label.
- **Layout:** the man-page grid — a small caps label gutter and a content column
  (`<Section>`). Every page uses it.
- **Motion:** only state changes move — page transitions, the console opening,
  the project preview swapping, copy confirmations. Titles travel from lists to
  their pages via shared-element view transitions. Everything respects
  `prefers-reduced-motion`.

### The console

`src/features/console/` is self-contained:

- `engine/` — pure functions: a filesystem built from the site's routes, a
  parser (quotes, `&&`, `;`), tab completion, typo suggestions. Unit-tested.
- `commands/` — `ls`, `cd`, `cat`, `open`, `grep`, `man`, `lang`, `theme`,
  `neofetch`… plus a few undocumented ones.
- `commands/run.tsx` — runs a command line against a small host interface
  (navigate, copy, switch theme…), so commands are testable without a browser.
- `console-panel.tsx` — the UI, a native `<dialog>`. Code-split: its code only
  loads when opened (or when the trigger is hovered). The site index it browses
  is a few KB of data in the page, like the rest of the layout.

To switch it off, remove `<ConsoleProvider>` from `src/app/[locale]/layout.tsx`.
Everything that uses it (the header trigger, the home page's "run it" button,
the 404 page's console link) asks `useConsole()` first and hides itself. To
delete it entirely, also remove the folder and the imports in
`components/layout/site-header.tsx`, `features/home/synopsis.tsx` and
`app/[locale]/not-found.tsx`.

---

MIT License

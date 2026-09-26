import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { InlineScript } from '@/components/layout/inline-script';
import { buttonClass } from '@/components/ui/button';
import {
  isLocale,
  LOCALE_COOKIE,
  localeMeta,
  locales,
  negotiateLocale,
  stripLocale,
  type Locale,
} from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/format';
import { getProfile } from '@/lib/content/site';
import { fontVariables } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import { LOCALE_HEADER, PATH_HEADER } from '@/lib/request-headers';
import './globals.css';

/**
 * Every unmatched URL ends up here — /en/nope, /tr/blog/typo, /x.png. In this
 * Next version it's the only 404 that is fully server-rendered (a notFound()
 * thrown from a page is client-rendered), so it's the real 404 page. It sits
 * outside the app layout, so it brings its own document, theme and a minimal
 * version of the site chrome, in the language the URL asked for.
 */
async function resolveLocale(): Promise<Locale> {
  const fromUrl = (await headers()).get(LOCALE_HEADER);
  if (isLocale(fromUrl)) return fromUrl;
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale((await headers()).get('accept-language'));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await resolveLocale());
  return { title: `404 — ${t.notFound.title} — ${getProfile('en').name}` };
}

export default async function GlobalNotFound() {
  const locale = await resolveLocale();
  const t = getDictionary(locale);
  const profile = getProfile(locale);
  const requested = (await headers()).get(PATH_HEADER);
  const path = requested ? `~${stripLocale(requested)}` : null;

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <header className="mx-auto flex h-16 max-w-page items-center gap-6 px-4 sm:px-5 md:px-8">
          <a
            href={`/${locale}`}
            className="text-base font-medium tracking-tight transition-colors duration-(--dur-fast) hover:text-accent-ink"
          >
            {profile.name}
          </a>
          <nav aria-label={t.nav.primary} className="ml-auto">
            <ul className="flex gap-5 font-mono text-sm lowercase">
              <li>
                <a
                  href={`/${locale}/work`}
                  className="text-muted hover:text-fg"
                >
                  {t.nav.work}
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/blog`}
                  className="text-muted hover:text-fg"
                >
                  {t.nav.blog}
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/about`}
                  className="text-muted hover:text-fg"
                >
                  {t.nav.about}
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main className="mx-auto max-w-page px-4 pt-10 pb-20 sm:px-5 md:px-8 md:pt-16">
          <div className="section">
            <p className="label">404</p>
            <div className="min-w-0">
              <h1 className="text-2xl font-normal">{t.notFound.title}</h1>
              {path && (
                <p className="mt-6 font-mono text-sm leading-relaxed [overflow-wrap:anywhere]">
                  <span className="text-muted">$ cd {path}</span>
                  <br />
                  <span className="text-err">
                    {format(t.notFound.command, { path })}
                  </span>
                </p>
              )}
              <p className="mt-6 max-w-measure text-muted">{t.notFound.body}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={`/${locale}`}
                  className={buttonClass({ variant: 'solid' })}
                >
                  {t.notFound.home}
                </a>
                {locales
                  .filter(l => l !== locale)
                  .map(l => (
                    <a
                      key={l}
                      href={`/${l}`}
                      hrefLang={l}
                      className="font-mono text-sm link"
                    >
                      {format(t.controls.switchLanguage, {
                        language: t.languageNames[l],
                      })}{' '}
                      <span lang={l}>({localeMeta[l].label})</span>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}

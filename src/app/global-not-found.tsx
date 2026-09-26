import type { Metadata } from 'next';
import { defaultLocale, locales, localeMeta } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fontVariables } from '@/lib/fonts';
import { themeScript } from '@/lib/theme-script';
import './globals.css';

/**
 * For URLs outside any locale (e.g. /fr/x) — rendered without the app's
 * layout, so it brings its own document, fonts and theme. Offers every
 * language, since we can't know which one the visitor reads.
 */
export const metadata: Metadata = {
  title: `404 — ${getDictionary(defaultLocale).notFound.title}`,
};

export default function GlobalNotFound() {
  return (
    <html
      lang={defaultLocale}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grid min-h-dvh place-items-center bg-bg px-5 text-fg">
        <main className="w-full max-w-prose py-20">
          <p className="label">404</p>
          {locales.map(locale => {
            const t = getDictionary(locale);
            return (
              <section
                key={locale}
                lang={locale}
                className="mt-10 first-of-type:mt-6"
              >
                <h1 className="text-xl">{t.notFound.title}</h1>
                <p className="mt-2 text-muted">{t.notFound.body}</p>
                <a
                  href={`/${locale}`}
                  className="mt-3 inline-block font-mono text-sm link"
                >
                  {t.notFound.home} ({localeMeta[locale].label}) →
                </a>
              </section>
            );
          })}
        </main>
      </body>
    </html>
  );
}

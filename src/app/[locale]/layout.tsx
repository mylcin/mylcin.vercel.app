import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ConsoleProvider } from '@/features/console/console-provider';
import { buildConsoleIndex } from '@/features/console/build-index';
import { I18nProvider } from '@/i18n/client';
import { isLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { fontVariables } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';
import { themeScript } from '@/lib/theme-script';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.home.title, template: '%s — Mustafa Yalçın' },
    description: t.meta.description,
    applicationName: 'Mustafa Yalçın',
    authors: [{ name: 'Mustafa Yalçın', url: SITE_URL }],
    creator: 'Mustafa Yalçın',
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#151311' },
  ],
  colorScheme: 'light dark',
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const consoleIndex = await buildConsoleIndex(locale);

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <a
          href="#content"
          className="sr-only rounded-md bg-fg px-3 py-2 font-mono text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          {t.nav.skipToContent}
        </a>
        <I18nProvider locale={locale} messages={t}>
          <ConsoleProvider index={consoleIndex}>
            <SiteHeader />
            <main
              id="content"
              tabIndex={-1}
              className="mx-auto max-w-page px-4 pt-10 outline-none sm:px-5 md:px-8 md:pt-16"
            >
              {children}
            </main>
            <SiteFooter />
          </ConsoleProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

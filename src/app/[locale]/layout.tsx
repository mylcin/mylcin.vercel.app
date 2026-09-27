import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { InlineScript } from '@/components/layout/inline-script';
import { ConsoleProvider } from '@/features/console/console-provider';
import { buildConsoleIndex } from '@/features/console/build-index';
import { I18nProvider } from '@/i18n/client';
import { isLocale, locales } from '@/i18n/config';
import { clientMessages, getDictionary } from '@/i18n/dictionaries';
import { getProfile } from '@/lib/content/site';
import { fontVariables } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';
import { themeScript } from '@/lib/theme-script';
import '../globals.css';

// Only real locales: anything else is unmatched and gets global-not-found.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { name, role, description } = getProfile(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${name} — ${role}`, template: `%s — ${name}` },
    description,
    applicationName: name,
    authors: [{ name, url: SITE_URL }],
    creator: name,
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
    <html
      lang={locale}
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <a
          href="#content"
          className="sr-only rounded-md bg-fg px-3 py-2 font-mono text-sm text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          {t.nav.skipToContent}
        </a>
        <I18nProvider locale={locale} messages={clientMessages(t)}>
          <ConsoleProvider index={consoleIndex}>{children}</ConsoleProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

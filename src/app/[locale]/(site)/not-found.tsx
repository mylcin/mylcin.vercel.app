import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { CurrentPath } from '@/components/layout/current-path';
import { ConsoleButton } from '@/features/console/console-button';
import { getT } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  // Next adds noindex to 404 responses itself.
  return { title: `404 — ${t.notFound.title}` };
}

/**
 * Shown when a page calls notFound(). Unknown URLs never get here — they're
 * unmatched and get app/global-not-found.tsx, which is server-rendered.
 */
export default async function NotFound() {
  const { locale, t } = await getT();
  const [before, after] = t.notFound.command.split('{path}');

  return (
    <div className="section pb-10 md:pb-20">
      <p className="label">404</p>
      <div className="min-w-0">
        <h1 className="text-2xl font-normal">{t.notFound.title}</h1>
        <pre className="mt-6 font-mono text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap">
          <span className="text-muted">$ cd </span>
          <CurrentPath />
          {'\n'}
          <span className="text-err">
            {before}
            <CurrentPath />
            {after}
          </span>
        </pre>
        <p className="mt-6 max-w-measure text-muted">{t.notFound.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}`}
            className={buttonClass({ variant: 'solid' })}
          >
            {t.notFound.home}
          </Link>
          <ConsoleButton command="ls" className={buttonClass()}>
            {t.notFound.console}
          </ConsoleButton>
        </div>
      </div>
    </div>
  );
}

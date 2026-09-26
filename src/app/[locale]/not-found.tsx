import Link from 'next/link';
import { buttonClass } from '@/components/ui/button';
import { CurrentPath } from '@/components/layout/current-path';
import { ConsoleButton } from '@/features/console/console-button';
import { getT } from '@/i18n/server';

export default async function NotFound() {
  const { locale, t } = await getT();
  const [before, after] = t.notFound.command.split('{path}');

  return (
    <div className="section py-10 md:py-20">
      {/* React hoists this into <head>; not-found pages can't export metadata. */}
      <title>{`404 — ${t.notFound.title} — Mustafa Yalçın`}</title>
      <meta name="robots" content="noindex" />
      <p className="label">404</p>
      <div className="min-w-0">
        <h1 className="text-2xl font-normal tracking-[-0.015em]">
          {t.notFound.title}
        </h1>
        <pre className="mt-6 overflow-x-auto font-mono text-sm leading-relaxed">
          <span className="text-muted">$ cd </span>
          <CurrentPath />
          {'\n'}
          <span className="text-err">
            {before}
            <CurrentPath />
            {after}
          </span>
        </pre>
        <p className="mt-6 max-w-prose text-muted">{t.notFound.body}</p>
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

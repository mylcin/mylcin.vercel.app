'use client';

import { Fragment } from 'react';
import { useConsole } from '@/features/console/console-provider';
import { useI18n } from '@/i18n/client';

/**
 * The man-page synopsis. When the console is available it doubles as its
 * front door: "run it" opens the console and executes `<handle> --help`.
 */
export function Synopsis({
  handle,
  flags,
  argument,
}: {
  handle: string;
  flags: string[];
  argument: string;
}) {
  const shell = useConsole();
  const { t } = useI18n();

  const line = (
    <code className="font-mono text-sm leading-7 sm:text-base">
      <span className="font-semibold">{handle}</span>{' '}
      {flags.map(flag => (
        <Fragment key={flag}>
          <span className="whitespace-nowrap">
            <span className="text-faint">[</span>
            <span className="text-muted">--{flag}</span>
            <span className="text-faint">]</span>
          </span>{' '}
        </Fragment>
      ))}
      <span className="whitespace-nowrap text-accent-ink">
        &lt;{argument}&gt;
      </span>
    </code>
  );

  if (!shell) return line;

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      {line}
      <button
        type="button"
        onClick={() => shell.open(`${handle} --help`)}
        onPointerEnter={shell.prefetch}
        aria-label={t.home.synopsisRunLabel}
        className="group inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-muted transition-colors duration-(--dur-fast) hover:text-accent-ink"
      >
        <span aria-hidden="true">↵</span>
        <span className="underline decoration-line-strong decoration-dotted underline-offset-4 group-hover:decoration-current">
          {t.home.synopsisRun}
        </span>
      </button>
    </div>
  );
}

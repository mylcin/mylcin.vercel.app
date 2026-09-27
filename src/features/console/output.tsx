'use client';

import { createContext, use } from 'react';
import { cx } from '@/lib/cx';

/**
 * Building blocks for command output. Kept deliberately small: text styles,
 * clickable commands, rows and links. Every command renders with these, so
 * all output shares one look.
 */

interface ConsoleActions {
  /** Runs a command as if typed (echoed in the scrollback). */
  run(command: string): void;
  /** Puts text in the prompt for the visitor to finish. */
  fill(text: string): void;
}

export const ConsoleActionsContext = createContext<ConsoleActions | null>(null);

export function Line({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cx('min-h-[1lh]', className)}>{children}</div>;
}

export function Gap() {
  return <div aria-hidden="true" className="h-[1lh]" />;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-muted">{children}</span>;
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <span className="font-semibold text-fg">{children}</span>;
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="text-err">{children}</span>;
}

/** A command you can click. `run` executes it; `fill` only types it. */
export function Cmd({
  run,
  fill,
  className,
  children,
}: {
  run?: string;
  fill?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const actions = use(ConsoleActionsContext);
  const command = run ?? fill ?? '';
  return (
    <button
      type="button"
      onClick={() => (run ? actions?.run(run) : actions?.fill(command))}
      data-command={command}
      className={cx(
        'cursor-pointer rounded-sm text-left underline decoration-line-strong decoration-dotted underline-offset-4 transition-colors duration-(--dur-fast) hover:text-accent-ink hover:decoration-current',
        className
      )}
    >
      {children ?? command}
    </button>
  );
}

export function Ext({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noreferrer"
      className="underline decoration-line-strong underline-offset-4 transition-colors duration-(--dur-fast) hover:text-accent-ink hover:decoration-current"
    >
      {children}
    </a>
  );
}

/**
 * Aligned columns on wider screens; on phones each row wraps as a sentence,
 * because a three-column terminal table doesn't fit 360px.
 */
export function Rows({
  rows,
  className,
}: {
  rows: React.ReactNode[][];
  className?: string;
}) {
  const columns = Math.max(...rows.map(row => row.length), 1);
  return (
    <div
      className={cx('grid gap-y-1 sm:gap-x-6', className)}
      style={{
        gridTemplateColumns: `repeat(${columns - 1}, max-content) minmax(0, 1fr)`,
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className="col-span-full flex flex-wrap gap-x-3 sm:contents"
        >
          {row.map((cell, j) => (
            <div
              key={j}
              className={cx(
                'min-w-0',
                j === row.length - 1 && 'sm:col-start-auto'
              )}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** A named block, like a section of `man` output. */
export function Block({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-[1lh] first:mt-0">
      <div className="font-semibold text-fg uppercase">{title}</div>
      <div className="pl-4 sm:pl-7">{children}</div>
    </div>
  );
}

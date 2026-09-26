'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Copies `text` and swaps `idle` for `done` for a moment. Both are elements
 * (not a render function) so Server Components can fill them in. The
 * confirmation is also announced to screen readers.
 */
export function CopyButton({
  text,
  label,
  copiedLabel,
  idle,
  done,
  children,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onClick'> & {
  text: string;
  /** Accessible name — only when the visible content doesn't already say it. */
  label?: string;
  /** Announced after copying. */
  copiedLabel: string;
  idle: React.ReactNode;
  done: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // Clipboard blocked: the text is still visible and selectable.
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={copy}
      data-copied={copied || undefined}
      {...props}
    >
      {children}
      {copied ? done : idle}
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </button>
  );
}

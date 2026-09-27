'use client';

import { useConsole } from './console-provider';

/** A text button that opens the console with a command. Renders nothing without it. */
export function ConsoleButton({
  command,
  className,
  children,
}: {
  command?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const shell = useConsole();
  if (!shell) return null;
  return (
    <button
      type="button"
      onClick={() => shell.open(command)}
      onPointerEnter={shell.prefetch}
      className={className}
    >
      {children}
    </button>
  );
}

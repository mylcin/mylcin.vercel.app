import { ViewTransition } from 'react';

/**
 * Wraps each page's content (not the layout — layouts persist, so they never
 * enter or exit). See "Motion" in globals.css for the animation itself.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}

/** Pairs an element across pages (list title ↔ detail title) so it travels. */
export function SharedTitle({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <ViewTransition name={name} share="morph" default="none">
      {children}
    </ViewTransition>
  );
}

'use client';

/**
 * An inline script that runs during HTML parsing only. It's a Client Component
 * so the type is decided where it renders: `text/javascript` in the server
 * HTML, `text/plain` when React renders it in the browser (e.g. the root
 * layout re-rendering on a language switch). Otherwise React warns about
 * rendering a <script> that would never run.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

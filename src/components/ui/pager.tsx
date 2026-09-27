import Link from 'next/link';

interface PagerLink {
  href: string;
  /** "Previous project", "Newer"… */
  label: string;
  title: string;
  /** Language of the title, when it differs from the page's. */
  lang?: string;
}

/** Previous / next at the end of a project or post. */
export function Pager({
  label,
  previous,
  next,
}: {
  /** Names the landmark, e.g. "More posts". */
  label: string;
  previous?: PagerLink;
  next?: PagerLink;
}) {
  if (!previous && !next) return null;
  return (
    <nav aria-label={label} className="grid gap-6 sm:grid-cols-2">
      {previous && (
        <Link href={previous.href} className="group">
          <span className="block font-mono text-xs text-muted">
            <span aria-hidden="true" className="nudge [--nudge:-0.2em]">
              ←
            </span>{' '}
            {previous.label}
          </span>
          <span
            lang={previous.lang}
            className="mt-1 block text-lg transition-colors duration-(--dur-fast) group-hover:text-accent-ink"
          >
            {previous.title}
          </span>
        </Link>
      )}
      {next && (
        <Link href={next.href} className="group sm:col-start-2 sm:text-right">
          <span className="block font-mono text-xs text-muted">
            {next.label}{' '}
            <span aria-hidden="true" className="nudge">
              →
            </span>
          </span>
          <span
            lang={next.lang}
            className="mt-1 block text-lg transition-colors duration-(--dur-fast) group-hover:text-accent-ink"
          >
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}

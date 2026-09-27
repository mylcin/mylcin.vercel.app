import Link from 'next/link';
import { cx } from '@/lib/cx';

/**
 * "All posts →" / "← All work" — the one style for moving on to, or back
 * from, a section. The arrow nudges in the direction of travel on hover.
 */
export function MoreLink({
  href,
  back = false,
  children,
}: {
  href: string;
  back?: boolean;
  children: React.ReactNode;
}) {
  const arrow = (
    <span
      aria-hidden="true"
      className={cx('nudge', back && '[--nudge:-0.2em]')}
    >
      {back ? '←' : '→'}
    </span>
  );
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 font-mono text-sm text-muted transition-colors duration-(--dur-fast) hover:text-fg"
    >
      {back && arrow}
      {children}
      {!back && arrow}
    </Link>
  );
}

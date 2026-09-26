import { cx } from '@/lib/cx';

/**
 * A man-page style row: small caps label in the gutter, content beside it.
 * The label is the section's heading, so the outline stays meaningful.
 */
export function Section({
  id,
  label,
  aside,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  /** Right-aligned action next to the content, e.g. "All posts →". */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cx('section', className)}
    >
      <h2 id={headingId} className="label">
        {label}
      </h2>
      <div className="min-w-0">
        {children}
        {aside && <div className="mt-6">{aside}</div>}
      </div>
    </section>
  );
}

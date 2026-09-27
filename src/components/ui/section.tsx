import { cx } from '@/lib/cx';

/**
 * A man-page style row: small caps label in the gutter, content beside it.
 * The label is the section's heading, so the outline stays meaningful —
 * except in a section that holds the page's <h1>, where it's a plain label
 * (`labelAs="p"`) so no heading sits above the h1.
 */
export function Section({
  id,
  label,
  labelAs = 'h2',
  aside,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  labelAs?: 'h2' | 'p';
  /** A way onward shown below the content, e.g. "All posts →". */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  const Label = labelAs;
  return (
    <section
      id={id}
      aria-labelledby={labelAs === 'h2' ? headingId : undefined}
      className={cx('section', className)}
    >
      <Label id={headingId} className="label">
        {label}
      </Label>
      <div className="min-w-0">
        {children}
        {aside && <div className="mt-6">{aside}</div>}
      </div>
    </section>
  );
}

import type { ProjectStatus } from '@/lib/content/types';
import { cx } from '@/lib/cx';

const dot: Record<ProjectStatus, string> = {
  live: 'bg-ok',
  'in-progress': 'bg-warn',
  paused: 'bg-faint',
  archived: 'bg-faint',
};

/** Colored dot + text label. The color is decoration; the label carries it. */
export function Status({
  status,
  label,
  className,
}: {
  status: ProjectStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      data-testid="project-status"
      data-status={status}
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cx('size-1.5 shrink-0 rounded-full', dot[status])}
      />
      {label}
    </span>
  );
}

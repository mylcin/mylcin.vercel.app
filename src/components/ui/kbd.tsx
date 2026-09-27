import { cx } from '@/lib/cx';

export function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cx(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line-strong px-1 font-mono text-xs leading-none text-muted',
        className
      )}
      {...props}
    />
  );
}

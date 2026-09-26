import { cx } from '@/lib/cx';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'icon';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-mono text-sm whitespace-nowrap select-none transition-[color,background-color,border-color] duration-(--dur-fast) ease-out disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  solid: 'bg-fg text-bg hover:bg-accent-ink',
  outline: 'border border-line-strong hover:border-fg hover:bg-raised',
  ghost: 'text-muted hover:bg-raised hover:text-fg',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5',
  md: 'h-10 px-4',
  icon: 'size-9',
};

/** Shared by <button>, <Link> and <a>, so every clickable control looks alike. */
export function buttonClass({
  variant = 'outline',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cx(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}

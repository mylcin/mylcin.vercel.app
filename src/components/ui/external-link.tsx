import { getT } from '@/i18n/server';

/** External links open in a new tab and say so to screen readers. */
export async function ExternalLink({
  href,
  className,
  arrow = true,
  children,
}: {
  href: string;
  className?: string;
  arrow?: boolean;
  children: React.ReactNode;
}) {
  const { locale, t } = await getT();
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      {arrow && (
        <span
          aria-hidden="true"
          className="ml-0.5 font-mono text-[0.85em] text-faint"
        >
          ↗
        </span>
      )}
      <span lang={locale} className="sr-only">
        {' '}
        {t.controls.opensInNewTab}
      </span>
    </a>
  );
}

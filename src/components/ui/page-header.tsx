/**
 * Top of a section page (work, blog, about): the title in the content column,
 * a small fact in the label gutter — same grid as everything below it.
 */
export function PageHeader({
  meta,
  title,
  intro,
  children,
}: {
  meta?: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="section mb-14 md:mb-20">
      <p className="label">{meta}</p>
      <div className="min-w-0">
        <h1 className="text-2xl font-normal tracking-[-0.015em]">{title}</h1>
        {intro && (
          <p className="mt-4 max-w-prose text-lg text-muted">{intro}</p>
        )}
        {children}
      </div>
    </header>
  );
}

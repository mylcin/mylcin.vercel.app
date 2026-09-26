import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

/**
 * Chrome shared by every page. It sits below the root layout (which owns the
 * document) so that a page calling notFound() gets `./not-found.tsx` inside
 * the header and footer — a root layout can't host its own not-found page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main
        id="content"
        tabIndex={-1}
        className="mx-auto max-w-page px-4 pt-10 outline-none sm:px-5 md:px-8 md:pt-16"
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

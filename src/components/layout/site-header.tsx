import Link from 'next/link';
import { ConsoleTrigger } from '@/features/console/console-trigger';
import { format } from '@/i18n/format';
import { getT } from '@/i18n/server';
import { getProfile } from '@/lib/content/site';
import { Breadcrumbs } from './breadcrumbs';
import { LanguageSwitch } from './language-switch';
import { NavLinks } from './nav-links';
import { ThemeToggle } from './theme-toggle';

export async function SiteHeader() {
  const { locale, t } = await getT();
  const { name } = getProfile(locale);
  const nav = [
    { href: `/${locale}/work`, label: t.nav.work, section: '/work' },
    { href: `/${locale}/blog`, label: t.nav.blog, section: '/blog' },
    { href: `/${locale}/about`, label: t.nav.about, section: '/about' },
  ];

  return (
    <header
      style={{ viewTransitionName: 'site-header' }}
      className="mx-auto flex max-w-page flex-wrap items-center gap-x-3 px-4 pt-3 sm:px-5 md:h-16 md:flex-nowrap md:gap-6 md:px-8 md:pt-0"
    >
      <div className="flex min-w-0 items-baseline gap-4">
        <Link
          href={`/${locale}`}
          aria-label={format(t.nav.homeLink, { name })}
          className="shrink-0 text-base font-medium tracking-tight whitespace-nowrap transition-colors duration-(--dur-fast) hover:text-accent-ink"
        >
          {name}
        </Link>
        <Breadcrumbs className="hidden md:block" />
      </div>

      <div className="ml-auto flex items-center gap-2 md:order-last md:ml-0">
        <LanguageSwitch />
        {/* On small screens the theme toggle lives in the footer. */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <ConsoleTrigger />
      </div>

      <nav aria-label={t.nav.primary} className="w-full md:ml-auto md:w-auto">
        <NavLinks items={nav} />
      </nav>
    </header>
  );
}

import { CopyButton } from '@/components/ui/copy-button';
import { ExternalLink } from '@/components/ui/external-link';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { getT } from '@/i18n/server';
import { format, formatDate } from '@/i18n/format';
import { getProfile } from '@/lib/content/site';
import { BUILD_DATE } from '@/lib/site';
import { LanguageSwitch } from './language-switch';
import { LocalTime } from './local-time';
import { ThemeToggle } from './theme-toggle';

export async function SiteFooter() {
  const { locale, t } = await getT();
  const profile = getProfile(locale);

  return (
    <footer className="mx-auto mt-28 max-w-page px-4 pb-8 sm:px-5 md:mt-40 md:px-8">
      <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 md:shrink-0">
          <p className="mb-2 label">{t.about.sections.contact}</p>
          <CopyButton
            text={profile.email}
            copiedLabel={t.controls.emailCopied}
            data-testid="footer-email-copy"
            className="group -ml-1 inline-flex max-w-full items-center gap-2 rounded-md px-1 text-left text-lg transition-colors duration-(--dur-fast) hover:text-accent-ink"
            idle={
              <CopyIcon className="text-muted group-hover:text-accent-ink" />
            }
            done={<CheckIcon className="text-accent-ink" />}
          >
            <span className="truncate">{profile.email}</span>
            <span className="sr-only">, {t.controls.copyEmail}</span>
          </CopyButton>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm text-muted">
          {profile.socials.map(social => (
            <li key={social.id}>
              <ExternalLink href={social.href} className="hover:text-fg">
                {social.label}
              </ExternalLink>
            </li>
          ))}
          <li>
            <a href={`/${locale}/blog/feed.xml`} className="hover:text-fg">
              {t.footer.rss}
            </a>
          </li>
          {profile.sourceUrl && (
            <li>
              <ExternalLink href={profile.sourceUrl} className="hover:text-fg">
                {t.footer.source}
              </ExternalLink>
            </li>
          )}
        </ul>
      </div>

      {/* Running foot, as at the bottom of a man page. */}
      <div className="mt-8 flex flex-col gap-3 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <LocalTime
          city={profile.location.city}
          timeZone={profile.location.timeZone}
        />
        <span>
          {format(t.footer.updated, {
            date: formatDate(BUILD_DATE, locale, 'short'),
          })}
        </span>
        <div className="flex items-center justify-between gap-4">
          <span aria-hidden="true">{profile.handle.toUpperCase()}(1)</span>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import { CopyButton } from '@/components/ui/copy-button';
import { ExternalLink } from '@/components/ui/external-link';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { PageTransition } from '@/components/ui/page-transition';
import { Section } from '@/components/ui/section';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import {
  format,
  formatDate,
  isoDate,
  monthsBetween,
  plural,
} from '@/i18n/format';
import {
  getCertificates,
  getEducation,
  getExperience,
  getProfile,
  getSkills,
  type RoleView,
} from '@/lib/content/site';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/about',
    title: t.about.title,
    description: t.meta.aboutDescription,
    type: 'profile',
  });
}

function Period({
  start,
  end,
  locale,
  t,
}: {
  start: string;
  end?: string;
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <>
      <time dateTime={isoDate(start)}>
        {formatDate(start, locale, 'monthYear')}
      </time>
      {' – '}
      {end ? (
        <time dateTime={isoDate(end)}>
          {formatDate(end, locale, 'monthYear')}
        </time>
      ) : (
        t.about.present
      )}
    </>
  );
}

/** Length of a finished role. Current roles show none: a build-time number would go stale. */
function duration(role: RoleView, locale: Locale, t: Dictionary) {
  if (!role.end) return null;
  const months = monthsBetween(role.start, role.end);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [
    years && plural(locale, years, t.about.years),
    rest && plural(locale, rest, t.about.months),
  ]
    .filter(Boolean)
    .join(' ');
}

export default async function AboutPage({
  params,
}: PageProps<'/[locale]/about'>) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const profile = getProfile(locale);
  const experience = getExperience(locale);
  const skills = getSkills(locale);
  const education = getEducation(locale);
  const certificates = getCertificates();

  return (
    <PageTransition>
      <div className="sections">
        <Section id="intro" label={t.about.sections.intro}>
          <h1 className="text-2xl font-normal tracking-[-0.015em]">
            {t.about.title}
          </h1>
          <div className="mt-6 max-w-prose space-y-4 text-lg">
            {profile.about.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section id="experience" label={t.about.sections.experience}>
          <ol className="space-y-12">
            {experience.map(role => (
              <li
                key={`${role.company}-${role.start}`}
                className="grid gap-x-8 gap-y-2 lg:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <p className="font-mono text-xs leading-6 text-muted">
                  <Period
                    start={role.start}
                    end={role.end}
                    locale={locale}
                    t={t}
                  />
                  {duration(role, locale, t) && (
                    <span className="block">{duration(role, locale, t)}</span>
                  )}
                </p>
                <div className="max-w-prose">
                  <h3 className="text-lg">
                    {role.title}
                    <span className="text-muted"> · </span>
                    {role.url ? (
                      <ExternalLink
                        href={role.url}
                        arrow={false}
                        className="link"
                      >
                        {role.company}
                      </ExternalLink>
                    ) : (
                      role.company
                    )}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {role.location} · {t.about.employment[role.type]}
                  </p>
                  <p className="mt-3">{role.summary}</p>
                  <ul className="mt-3 space-y-1.5 text-muted">
                    {role.highlights.map(item => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden="true" className="text-faint">
                          –
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
                    {role.stack.join(' · ')}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="skills" label={t.about.sections.skills}>
          <dl className="max-w-prose space-y-4">
            {skills.map(group => (
              <div
                key={group.name}
                className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-8"
              >
                <dt className="font-mono text-xs leading-7 text-muted">
                  {group.name}
                </dt>
                <dd>{group.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="education" label={t.about.sections.education}>
          {education.map(entry => (
            <div
              key={entry.school}
              className="grid gap-x-8 gap-y-2 lg:grid-cols-[10rem_minmax(0,1fr)]"
            >
              <p className="font-mono text-xs leading-6 text-muted">
                <Period
                  start={entry.start}
                  end={entry.end}
                  locale={locale}
                  t={t}
                />
              </p>
              <div className="max-w-prose">
                <h3 className="text-lg">{entry.school}</h3>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {entry.degree}, {entry.field} · {entry.location}
                  {entry.gpa &&
                    ` · ${format(t.about.gpa, { value: entry.gpa })}`}
                </p>
                <ul className="mt-3 space-y-1.5 text-muted">
                  {entry.notes.map(note => (
                    <li key={note} className="flex gap-3">
                      <span aria-hidden="true" className="text-faint">
                        –
                      </span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </Section>

        <Section id="certificates" label={t.about.sections.certifications}>
          <ul className="divide-y divide-line">
            {certificates.map(cert => (
              <li
                key={cert.credentialId ?? cert.name}
                className="grid gap-x-8 gap-y-1 py-3 first:pt-0 lg:grid-cols-[10rem_minmax(0,1fr)_auto] lg:items-baseline"
              >
                <time
                  dateTime={isoDate(cert.date)}
                  className="font-mono text-xs text-muted"
                >
                  {formatDate(cert.date, locale, 'monthYear')}
                </time>
                <span>
                  {cert.name}{' '}
                  <span className="text-muted">· {cert.issuer}</span>
                </span>
                {cert.url && (
                  <ExternalLink
                    href={cert.url}
                    className="font-mono text-xs link text-muted"
                  >
                    {t.about.verify}
                  </ExternalLink>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="contact" label={t.about.sections.contact}>
          <p className="text-lg">{t.about.contactIntro}</p>
          <CopyButton
            text={profile.email}
            copiedLabel={t.controls.emailCopied}
            data-testid="about-email-copy"
            className="group mt-3 -ml-1 inline-flex max-w-full items-center gap-3 rounded-md px-1 text-left text-xl transition-colors duration-(--dur-fast) hover:text-accent-ink"
            idle={
              <CopyIcon className="shrink-0 text-muted group-hover:text-accent-ink" />
            }
            done={<CheckIcon className="shrink-0 text-accent-ink" />}
          >
            <span className="truncate">{profile.email}</span>
            <span className="sr-only">, {t.controls.copyEmail}</span>
          </CopyButton>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            {profile.socials.map(social => (
              <li key={social.id}>
                <ExternalLink href={social.href} className="link">
                  {social.label}{' '}
                  <span className="text-muted">{social.handle}</span>
                </ExternalLink>
              </li>
            ))}
            <li>
              <a href={profile.resume.href} className="link">
                {t.about.resume}
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </PageTransition>
  );
}

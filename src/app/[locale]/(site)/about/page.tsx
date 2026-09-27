import type { Metadata } from 'next';
import { ExternalLink } from '@/components/ui/external-link';
import { PageTransition } from '@/components/ui/page-transition';
import { Section } from '@/components/ui/section';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary, type Dictionary } from '@/i18n/dictionaries';
import {
  format,
  formatDate,
  formatDuration,
  isoDate,
  monthsBetween,
} from '@/i18n/format';
import {
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
    description: format(t.meta.aboutDescription, {
      name: getProfile(locale).name,
    }),
    type: 'profile',
  });
}

/** A date column entry: "Jan 2023 – Present", plus the length of finished roles. */
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
    <p className="font-mono text-xs leading-6 text-muted">
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
      {/* Current roles show no length: a build-time number would go stale. */}
      {end && (
        <span className="block">
          {formatDuration(monthsBetween(start, end), locale, t.about)}
        </span>
      )}
    </p>
  );
}

function Dashes({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-muted">
      {items.map(item => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="text-faint">
            –
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Stack lists wrap between items, never inside "Material UI". */
function Stack({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
      {items.map(item => (
        <li key={item} className="whitespace-nowrap">
          {item}
        </li>
      ))}
    </ul>
  );
}

function RoleEntry({
  role,
  locale,
  t,
}: {
  role: RoleView;
  locale: Locale;
  t: Dictionary;
}) {
  const employment = t.about.employment[role.type];
  return (
    <li className="grid gap-x-8 gap-y-2 lg:grid-cols-[10rem_minmax(0,1fr)]">
      <Period start={role.start} end={role.end} locale={locale} t={t} />
      <div className="max-w-measure">
        <h3 className="text-lg">
          {role.title}
          <span className="text-muted">{' ·'} </span>
          {role.url ? (
            <ExternalLink href={role.url} arrow={false} className="link">
              {role.company}
            </ExternalLink>
          ) : (
            role.company
          )}
        </h3>
        <p className="mt-0.5 font-mono text-xs text-muted">
          {role.location}
          {/* "Freelance · Freelance" says nothing twice. */}
          {employment !== role.company && ` · ${employment}`}
        </p>
        <p className="mt-3">{role.summary}</p>
        <div className="mt-3">
          <Dashes items={role.highlights} />
        </div>
        <div className="mt-4">
          <Stack items={role.stack} />
        </div>
      </div>
    </li>
  );
}

export default async function AboutPage({
  params,
}: PageProps<'/[locale]/about'>) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const profile = getProfile(locale);
  const skills = getSkills(locale);

  return (
    <PageTransition>
      <div className="sections">
        <Section id="intro" label={t.about.sections.intro} labelAs="p">
          <h1 className="text-2xl font-normal">{t.about.title}</h1>
          <div className="mt-6 max-w-measure space-y-4 text-lg">
            {profile.about.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section id="experience" label={t.about.sections.experience}>
          <ol className="space-y-12">
            {getExperience(locale).map(role => (
              <RoleEntry
                key={`${role.company}-${role.start}`}
                role={role}
                locale={locale}
                t={t}
              />
            ))}
          </ol>
        </Section>

        <Section id="skills" label={t.about.sections.skills}>
          <dl className="space-y-4">
            {[
              ...skills,
              { name: t.about.spokenLanguages, items: [profile.languages] },
            ].map(group => (
              <div
                key={group.name}
                className="grid gap-x-8 gap-y-1 lg:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <dt className="font-mono text-xs leading-7 text-muted">
                  {group.name}
                </dt>
                <dd className="max-w-measure">{group.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="education" label={t.about.sections.education}>
          <ol className="space-y-12">
            {getEducation(locale).map(entry => (
              <li
                key={entry.school}
                className="grid gap-x-8 gap-y-2 lg:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <Period
                  start={entry.start}
                  end={entry.end}
                  locale={locale}
                  t={t}
                />
                <div className="max-w-measure">
                  <h3 className="text-lg">{entry.school}</h3>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {entry.degree}, {entry.field}
                    {` · ${entry.location}`}
                    {entry.gpa &&
                      ` · ${format(t.about.gpa, { value: entry.gpa })}`}
                  </p>
                  <div className="mt-3">
                    <Dashes items={entry.notes} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </PageTransition>
  );
}

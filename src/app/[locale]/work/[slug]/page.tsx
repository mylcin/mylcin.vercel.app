import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from '@/components/ui/external-link';
import { MoreLink } from '@/components/ui/more-link';
import { PageTransition, SharedTitle } from '@/components/ui/page-transition';
import { Section } from '@/components/ui/section';
import { Status } from '@/components/ui/status';
import { projectMeta } from '@/features/work/project-rows';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getProject, getProjects, getProjectSlugs } from '@/lib/content/site';
import { JsonLd, pageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap(locale =>
    getProjectSlugs().map(slug => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = getProject(slug, locale);
  if (!project) return {};
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: project.title,
    description: project.tagline,
  });
}

export default async function ProjectPage({
  params,
}: PageProps<'/[locale]/work/[slug]'>) {
  const { slug } = await params;
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const project = getProject(slug, locale);
  if (!project) notFound();

  const all = getProjects(locale);
  const position = all.findIndex(p => p.slug === slug);
  const previous = all[position - 1];
  const next = all[position + 1];
  const hasStory = Boolean(
    project.why || project.role || project.decisions.length || project.outcome
  );
  const links = (['live', 'source', 'docs'] as const).filter(
    key => project.links[key]
  );

  return (
    <PageTransition>
      <JsonLd
        data={{
          '@type': 'CreativeWork',
          name: project.title,
          description: project.tagline,
          url: absoluteUrl(`/${locale}/work/${slug}`),
          author: { '@type': 'Person', name: 'Mustafa Yalçın' },
          keywords: project.stack.join(', '),
          ...(project.links.source && { codeRepository: project.links.source }),
        }}
      />

      <div className="mb-10">
        <MoreLink href={`/${locale}/work`} back>
          {t.work.allWork}
        </MoreLink>
      </div>

      <header className="section mb-14 md:mb-20">
        <p className="label">{projectMeta(project, t)}</p>
        <div className="min-w-0">
          <SharedTitle name={`project-${project.slug}`}>
            <h1 className="text-2xl font-normal tracking-[-0.015em]">
              {project.title}
            </h1>
          </SharedTitle>
          <p className="mt-4 max-w-prose text-xl text-muted">
            {project.tagline}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 font-mono text-xs">
            <div>
              <dt className="text-muted">{t.work.fields.status}</dt>
              <dd className="mt-1">
                <Status
                  status={project.status}
                  label={t.work.status[project.status]}
                />
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t.work.fields.type}</dt>
              <dd className="mt-1">{t.work.category[project.category]}</dd>
            </div>
            {project.year && (
              <div>
                <dt className="text-muted">{t.work.fields.year}</dt>
                <dd className="mt-1">{project.year}</dd>
              </div>
            )}
            {links.length > 0 && (
              <div>
                <dt className="text-muted">{t.work.fields.links}</dt>
                <dd className="mt-1 flex gap-4">
                  {links.map(key => (
                    <ExternalLink
                      key={key}
                      href={project.links[key]!}
                      className="link"
                    >
                      {t.work.links[key]}
                    </ExternalLink>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="sections">
        {project.summary && (
          <Section id="summary" label={t.work.fields.summary}>
            <p className="max-w-prose text-lg">{project.summary}</p>
          </Section>
        )}

        {project.why && (
          <Section id="why" label={t.work.fields.why}>
            <p className="max-w-prose">{project.why}</p>
          </Section>
        )}

        {project.role && (
          <Section id="role" label={t.work.fields.role}>
            <p className="max-w-prose">{project.role}</p>
          </Section>
        )}

        {project.highlights.length > 0 && (
          <Section id="highlights" label={t.work.fields.highlights}>
            <ul className="max-w-prose space-y-2">
              {project.highlights.map(item => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="text-faint">
                    –
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {project.decisions.length > 0 && (
          <Section id="decisions" label={t.work.fields.decisions}>
            <ol className="max-w-prose space-y-8">
              {project.decisions.map((decision, index) => (
                <li
                  key={decision.title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)]"
                >
                  <span className="pt-1 font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{decision.title}</h3>
                    <p className="mt-2 text-muted">{decision.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {project.outcome && (
          <Section id="outcome" label={t.work.fields.outcome}>
            <p className="max-w-prose">{project.outcome}</p>
          </Section>
        )}

        <Section id="stack" label={t.work.fields.stack}>
          <ul className="flex max-w-prose flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
            {project.stack.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {!hasStory && (
            <p className="mt-10 max-w-prose text-muted">{t.work.noDetails}</p>
          )}
        </Section>
      </div>

      {(previous || next) && (
        <nav
          aria-label={t.work.allWork}
          className="mt-24 grid gap-6 border-t border-line pt-8 sm:grid-cols-2"
        >
          {previous ? (
            <Link href={`/${locale}/work/${previous.slug}`} className="group">
              <span className="block font-mono text-xs text-muted">
                ← {t.work.previous}
              </span>
              <span className="mt-1 block text-lg transition-colors duration-(--dur-fast) group-hover:text-accent-ink">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/${locale}/work/${next.slug}`}
              className="group sm:text-right"
            >
              <span className="block font-mono text-xs text-muted">
                {t.work.next} →
              </span>
              <span className="mt-1 block text-lg transition-colors duration-(--dur-fast) group-hover:text-accent-ink">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </PageTransition>
  );
}

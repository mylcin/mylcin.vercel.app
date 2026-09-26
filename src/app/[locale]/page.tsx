import type { Metadata } from 'next';
import { ExternalLink } from '@/components/ui/external-link';
import { MoreLink } from '@/components/ui/more-link';
import { PageTransition } from '@/components/ui/page-transition';
import { Section } from '@/components/ui/section';
import { PostRows } from '@/features/blog/post-rows';
import { Synopsis } from '@/features/home/synopsis';
import { ProjectRows } from '@/features/work/project-rows';
import { isLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getPosts } from '@/lib/content/blog';
import { getExperience, getProfile, getProjects } from '@/lib/content/site';
import { JsonLd, pageMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/',
    title: t.home.title,
    description: t.meta.description,
    absoluteTitle: true,
    type: 'profile',
  });
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale;
  const t = getDictionary(locale);
  const profile = getProfile(locale);
  const featured = getProjects(locale).filter(project => project.featured);
  const posts = (await getPosts(locale)).slice(0, 3);
  const employer = getExperience(locale).find(role => !role.end);
  const manual = `${profile.handle.toUpperCase()}(1)`;

  return (
    <PageTransition>
      <JsonLd
        data={{
          '@type': 'Person',
          name: profile.name,
          url: absoluteUrl(`/${locale}`),
          jobTitle: profile.role,
          description: `${profile.name} — ${profile.headline}`,
          homeLocation: {
            '@type': 'Place',
            name: `${profile.location.city}, ${profile.location.country}`,
          },
          ...(employer && {
            worksFor: {
              '@type': 'Organization',
              name: employer.company,
              url: employer.url,
            },
          }),
          sameAs: profile.socials.map(social => social.href),
        }}
      />

      {/* Running head, as at the top of a man page. */}
      <div
        aria-hidden="true"
        className="mb-12 flex justify-between font-mono text-xs text-muted md:mb-16"
      >
        <span>{manual}</span>
        <span className="hidden sm:inline">{t.home.runningHead}</span>
        <span>{manual}</span>
      </div>

      <div className="sections">
        <Section id="name" label={t.home.sections.name}>
          <h1 className="text-display font-normal tracking-[-0.02em]">
            {profile.name}
          </h1>
          <p className="mt-4 max-w-prose text-xl text-muted">
            — {profile.headline}
          </p>
        </Section>

        <Section id="synopsis" label={t.home.sections.synopsis}>
          <Synopsis
            handle={profile.handle}
            flags={profile.synopsis.flags.map(flag => flag.name)}
            argument={profile.synopsis.argument}
          />
        </Section>

        <Section id="description" label={t.home.sections.description}>
          <div className="max-w-prose space-y-4">
            {profile.intro.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Section>

        <Section
          id="work"
          label={t.home.sections.work}
          aside={<MoreLink href={`/${locale}/work`}>{t.home.allWork}</MoreLink>}
        >
          <ProjectRows projects={featured} locale={locale} t={t} />
        </Section>

        {posts.length > 0 && (
          <Section
            id="writing"
            label={t.home.sections.writing}
            aside={
              <MoreLink href={`/${locale}/blog`}>{t.home.allPosts}</MoreLink>
            }
          >
            <PostRows posts={posts} locale={locale} t={t} />
          </Section>
        )}

        <Section id="see-also" label={t.home.sections.seeAlso}>
          <ul className="flex flex-wrap gap-x-1 font-mono text-sm">
            {profile.socials.map(social => (
              <li
                key={social.id}
                className="after:text-faint after:content-[','] last:after:content-none"
              >
                <ExternalLink href={social.href} arrow={false} className="link">
                  {social.id}
                </ExternalLink>
                <span className="text-muted">(1)</span>
              </li>
            ))}
            <li>
              <a href={profile.resume.href} className="link">
                resume.pdf
              </a>
            </li>
          </ul>
        </Section>

        <Section id="bugs" label={t.home.sections.bugs}>
          <ul className="max-w-prose space-y-2">
            {profile.bugs.map(bug => (
              <li key={bug}>{bug}</li>
            ))}
          </ul>
        </Section>
      </div>
    </PageTransition>
  );
}

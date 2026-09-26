import { isLocale, localeMeta, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { format } from '@/i18n/format';
import { getPosts } from '@/lib/content/blog';
import { getProfile } from '@/lib/content/site';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

const escape = (value: string) =>
  value.replace(/[<>&'"]/g, char => `&#${char.charCodeAt(0)};`);

export async function GET(
  _request: Request,
  { params }: RouteContext<'/[locale]/blog/feed.xml'>
) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response('Not found', { status: 404 });

  const t = getDictionary(locale);
  const profile = getProfile(locale);
  const posts = await getPosts(locale);
  const blogUrl = absoluteUrl(`/${locale}/blog`);

  const items = posts
    .map(post => {
      const url = absoluteUrl(`/${post.lang}/blog/${post.slug}`);
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
${post.tags.map(tag => `      <category>${escape(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(format(t.blog.feedTitle, { name: profile.name }))}</title>
    <link>${blogUrl}</link>
    <description>${escape(t.meta.blogDescription)}</description>
    <language>${localeMeta[locale].intl}</language>
    <managingEditor>${profile.email} (${escape(profile.name)})</managingEditor>
    <atom:link href="${absoluteUrl(`/${locale}/blog/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}

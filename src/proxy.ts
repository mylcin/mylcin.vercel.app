import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LOCALE_COOKIE, negotiateLocale } from '@/i18n/config';

/**
 * Sends unprefixed URLs to a locale: `/` → `/tr`, `/blog/x` → `/en/blog/x`.
 * Order of preference: the visitor's earlier choice (cookie), then their
 * browser language, then English. Old links like /blog/<slug> keep working.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];
  if (isLocale(first)) return;

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie)
    ? cookie
    : negotiateLocale(request.headers.get('accept-language'));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(url);
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export const config = {
  // Skip Next internals, metadata routes and anything with a file extension
  // (public files, sitemap.xml, robots.txt, icon.svg, resume.pdf…).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};

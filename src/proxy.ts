import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, LOCALE_COOKIE, negotiateLocale } from '@/i18n/config';
import { LOCALE_HEADER, PATH_HEADER } from '@/lib/request-headers';

/**
 * Sends unprefixed URLs to a locale: `/` → `/tr`, `/blog/x` → `/en/blog/x`.
 * Order of preference: the visitor's earlier choice (cookie), then their
 * browser language, then English.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];

  if (isLocale(first)) {
    const headers = new Headers(request.headers);
    // Only the global 404 reads these; it can't see the URL otherwise.
    headers.set(LOCALE_HEADER, first);
    headers.set(PATH_HEADER, pathname);
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();

  // Posts used to live at /blog/<slug>, in English. That move is permanent.
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie)
    ? cookie
    : negotiateLocale(request.headers.get('accept-language'));

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  const response = NextResponse.redirect(url);
  response.headers.set('Vary', 'Cookie, Accept-Language');
  return response;
}

export const config = {
  // Skip Next internals, extension-less metadata routes (apple-icon) and
  // anything with a file extension (sitemap.xml, icon.svg…).
  matcher: ['/((?!_next/|api/|apple-icon|.*\\..*).*)'],
};

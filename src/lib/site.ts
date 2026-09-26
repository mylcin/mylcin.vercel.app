/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in production (e.g. a custom
 * domain); Vercel previews fall back to their own URL, local dev to localhost.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit)
    return explicit.startsWith('http') ? explicit : `https://${explicit}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NODE_ENV === 'production') return 'https://mylcin.vercel.app';
  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, '');

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Stamped at build time; shown as "Updated …" in the footer. */
export const BUILD_DATE = new Date().toISOString().slice(0, 10);

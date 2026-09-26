import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Unmatched URLs outside a locale (e.g. /fr/x) need a 404 that renders its
    // own <html>, because the root layout lives under app/[locale].
    globalNotFound: true,
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Unmatched URLs outside a locale (e.g. /fr/x) need a 404 that renders its
    // own <html>, because the root layout lives under app/[locale].
    globalNotFound: true,
  },
  // Project slugs that changed after they were published.
  async redirects() {
    return [
      {
        source: '/:locale(en|tr)/work/weather-cli',
        destination: '/:locale/work/skycast',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

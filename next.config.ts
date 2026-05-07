import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import { createOptimizedNextConfig } from './lib/performance/next-config';

const { config, warnings } = createOptimizedNextConfig();
warnings.forEach((warning: string) => console.warn(`[next-config] ${warning}`));
const nextConfig: NextConfig = config;

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const configWithRedirects: NextConfig = {
  ...nextConfig,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    const existingRedirects = await nextConfig.redirects?.() ?? []
    return [
      ...existingRedirects,
      {
        source: '/:locale/deals-v2',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/prop-firm-deals',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/propfirmperk',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/propfirmperk/:path*',
        destination: '/:locale/deals/:path*',
        permanent: true,
      },
      {
        source: '/:locale/porpfirmpeak',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/porpfirmpeak/:path*',
        destination: '/:locale/deals/:path*',
        permanent: true,
      },
      {
        source: '/:locale/propfirmpeak',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/propfirmpeak/:path*',
        destination: '/:locale/deals/:path*',
        permanent: true,
      },
      {
        source: '/:locale/porpfirmpreak',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/porpfirmpreak/:path*',
        destination: '/:locale/deals/:path*',
        permanent: true,
      },
      {
        source: '/:locale/propfirmpreak',
        destination: '/:locale/deals',
        permanent: true,
      },
      {
        source: '/:locale/propfirmpreak/:path*',
        destination: '/:locale/deals/:path*',
        permanent: true,
      },
      {
        source: '/:locale/blog',
        destination: '/:locale/blogs',
        permanent: true,
      },
      {
        source: '/:locale/blog/:slug',
        destination: '/:locale/blogs/:slug',
        permanent: true,
      },
    ]
  },
}

export default withMDX(configWithRedirects);

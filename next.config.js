/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Skip database sync for static generation
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    NEXT_PUBLIC_SKIP_DATABASE_MIGRATIONS: true,
  },
}

module.exports = nextConfig
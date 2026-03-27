import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard',
        '/*/dashboard',
        '/admin',
        '/*/admin',
        '/teams/dashboard',
        '/*/teams/dashboard',
        '/authentication',
        '/*/authentication',
      ],
    },
    sitemap: getSiteUrl('/sitemap.xml'),
  }
}

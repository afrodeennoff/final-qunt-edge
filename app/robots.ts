import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/api/',
    '/dashboard',
    '/*/dashboard',
    '/admin',
    '/*/admin',
    '/teams/dashboard',
    '/*/teams/dashboard',
    '/teams/manage',
    '/*/teams/manage',
    '/authentication',
    '/*/authentication',
    '/embed',
    '/*/embed',
  ]

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/llms.txt'],
      disallow,
    },
    sitemap: getSiteUrl('/sitemap.xml'),
  }
}

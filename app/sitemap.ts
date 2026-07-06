import { MetadataRoute } from 'next'
import { getSiteOrigin } from '@/lib/site-url'
import { INDEXABLE_LOCALES } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteOrigin()
  const lastModified = new Date()
  const routeDefs: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/best-trading-journal', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/support', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/deals', changeFrequency: 'daily', priority: 0.9 },
    { path: '/community', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/blogs', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/docs', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/leaderboard', changeFrequency: 'daily', priority: 0.85 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/updates', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/disclaimers', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/propfirms', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/referral', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/deals/compare', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/guides', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/calculator', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/deals/faq', changeFrequency: 'weekly', priority: 0.7 },
  ]

  return INDEXABLE_LOCALES.flatMap((locale) =>
    routeDefs.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  )
}

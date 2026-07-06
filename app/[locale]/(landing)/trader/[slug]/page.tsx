import type { Metadata } from 'next'
import { cache } from 'react'
import { buildBreadcrumbSchema, buildPublicMetadata, getCanonicalUrl } from '@/lib/seo'
import TraderProfileClient from './trader-profile-client'
import type { PublicTraderSnapshot } from '@/server/public-trader'

const getCachedData = cache(async (slug: string): Promise<PublicTraderSnapshot | null> => {
  const { getPublicTraderSnapshot } = await import('@/server/public-trader')
  return getPublicTraderSnapshot(slug)
})

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  const snapshot = await getCachedData(slug)
  return buildPublicMetadata({
    locale,
    path: `/trader/${slug}`,
    title: `${snapshot?.username ?? slug} — Trader Profile | Qunt Edge`,
    description: snapshot
      ? `${snapshot.username}: ${snapshot.totalTrades} trades, ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(snapshot.totalPnl)} net PnL, ${snapshot.winRate.toFixed(1)}% win rate.`
      : `Public trader profile for ${slug} on Qunt Edge.`,
  })
}

export default async function TraderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const snapshot = await getCachedData(slug)

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: snapshot?.username ?? slug,
    url: getCanonicalUrl(locale, `/trader/${slug}`),
  }
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: slug, path: `/trader/${slug}` },
  ])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personSchema, breadcrumbSchema]),
        }}
      />
      <TraderProfileClient initialSnapshot={snapshot} locale={locale} slug={slug} />
    </div>
  )
}

import type { Metadata } from 'next'
import { getLeaderboardData, type LeaderboardSort } from './data/leaderboard-query'
import { LeaderboardContent } from './components/leaderboard-content'
import { getSiteOrigin } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

const VALID_SORTS: LeaderboardSort[] = ['monthly_pnl', 'winrate', 'totalTrades']
const SITE_ORIGIN = getSiteOrigin()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const canonical = `${SITE_ORIGIN}/${locale}/leaderboard`

  return {
    title: 'Trader Leaderboard | Qunt Edge',
    description: 'See public trader rankings based on real monthly performance, win rate, and trade activity.',
    alternates: { canonical },
    openGraph: {
      title: 'Trader Leaderboard | Qunt Edge',
      description: 'See public trader rankings based on real monthly performance, win rate, and trade activity.',
      url: canonical,
      type: 'website',
    },
  }
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { locale } = await params
  const { sort } = await searchParams
  const sortKey: LeaderboardSort = VALID_SORTS.includes(sort as LeaderboardSort) ? (sort as LeaderboardSort) : 'monthly_pnl'
  const entries = await getLeaderboardData(sortKey)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(74,125,255,0.08),transparent_34%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_24%,hsl(var(--background))_100%)]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <LeaderboardContent initialEntries={entries} locale={locale} />
      </div>
    </div>
  )
}

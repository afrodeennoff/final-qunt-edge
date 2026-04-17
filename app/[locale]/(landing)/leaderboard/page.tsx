import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getLeaderboardData, type LeaderboardSort } from './data/leaderboard-query'
import { LeaderboardContent } from './components/leaderboard-content'
import { LeaderboardTableSkeleton } from './components/leaderboard-table'
import { buildPublicMetadata } from '@/lib/seo'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'

const VALID_SORTS: LeaderboardSort[] = ['monthly_pnl', 'winrate', 'totalTrades']

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPublicMetadata({
    title: 'Trader Leaderboard | Qunt Edge',
    description:
      'See public trader rankings based on real monthly performance, win rate, and trade activity.',
    path: '/leaderboard',
    locale,
  })
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
  const sortKey: LeaderboardSort = VALID_SORTS.includes(sort as LeaderboardSort)
    ? (sort as LeaderboardSort)
    : 'monthly_pnl'
  const entries = await getLeaderboardData(sortKey)

  return (
<<<<<<< HEAD
    <UnifiedPageShell widthClassName="max-w-[1320px]" className="py-12 sm:py-16">
      <Suspense fallback={<LeaderboardTableSkeleton />}>
        <LeaderboardContent initialEntries={entries} locale={locale} />
      </Suspense>
    </UnifiedPageShell>
=======
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1120px] px-6 py-20 sm:px-8">
        <Suspense fallback={<LeaderboardTableSkeleton />}>
          <LeaderboardContent initialEntries={entries} locale={locale} />
        </Suspense>
      </div>
    </div>
>>>>>>> origin/main
  )
}
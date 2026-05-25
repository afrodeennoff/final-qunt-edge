import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getLeaderboardData, type LeaderboardSort } from './data/leaderboard-query'
import { LeaderboardContent } from './components/leaderboard-content'
import { buildPublicMetadata } from '@/lib/seo'
import { UnifiedPageShell } from '@/components/layout/unified-page-shell'
import { Skeleton } from '@/components/ui/skeleton'

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
    <UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12 sm:py-16">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <LeaderboardContent initialEntries={entries} locale={locale} />
      </Suspense>
    </UnifiedPageShell>
  )
}

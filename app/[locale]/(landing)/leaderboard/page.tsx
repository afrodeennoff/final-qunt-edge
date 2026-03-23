import { LeaderboardIcon } from '@/components/icons/svg-icons'
import { getLeaderboardData, type LeaderboardSort } from './data/leaderboard-query'
import { LeaderboardContent } from './components/leaderboard-content'

export const dynamic = 'force-dynamic'

const VALID_SORTS: LeaderboardSort[] = ['monthly_pnl', 'winrate', 'totalTrades']

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <LeaderboardIcon size={32} className="text-foreground" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <p className="mb-8 max-w-3xl text-muted-foreground">
          Top opted-in traders ranked from real monthly trading data. The board shows deeper production metrics including return percentage, top pair, average win/loss, duration, and streak behavior.
        </p>
        <LeaderboardContent initialEntries={entries} locale={locale} />
      </div>
    </div>
  )
}

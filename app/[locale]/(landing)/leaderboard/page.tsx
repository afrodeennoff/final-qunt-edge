import { LeaderboardIcon } from '@/components/icons/svg-icons'
import { getLeaderboardData } from './data/leaderboard-query'
import { LeaderboardTable } from './components/leaderboard-table'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const entries = await getLeaderboardData()
  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-v2-3 mb-v2-8">
          <LeaderboardIcon size={32} className="text-v2-accent" />
          <h1 className="text-2xl sm:text-3xl font-bold text-v2-text-primary">Leaderboard</h1>
        </div>
        <p className="mb-6 max-w-3xl text-v2-text-secondary">
          Top opted-in traders ranked from real monthly trading data. The board now shows deeper production metrics including return percentage, top pair, average win/loss, duration, and streak behavior.
        </p>
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  )
}

import { LeaderboardIcon } from '@/components/icons/svg-icons'
import { getLeaderboardData } from './data/leaderboard-query'
import { LeaderboardTable } from './components/leaderboard-table'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const entries = await getLeaderboardData()
  return (
    <div className="min-h-screen bg-v2-bg-base">
      <div className="max-w-5xl mx-auto px-v2-6 py-v2-16">
        <div className="flex items-center gap-v2-3 mb-v2-8">
          <LeaderboardIcon size={32} className="text-v2-accent" />
          <h1 className="text-2xl sm:text-3xl font-bold text-v2-text-primary">Leaderboard</h1>
        </div>
        <p className="text-v2-text-secondary mb-v2-6">Top traders ranked by monthly PnL performance.</p>
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  )
}

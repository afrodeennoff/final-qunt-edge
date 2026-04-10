import type {
  FinancialEvent,
  Mood,
  Subscription as PrismaSubscription,
  Tag,
  TickDetails,
  User as PrismaUser,
} from '@/prisma/generated/prisma'
import type { AccountInput, GroupInput, StatisticsProps } from '@/lib/data-types'
import type { ScoreMetrics } from '@/lib/score-calculator'
import type { SerializedTrade } from '@/lib/data-types'

/*** DashboardBootstrapPayload — Server-to-client bootstrap contract */
export interface DashboardBootstrapPayload {
  user: PrismaUser | null

  subscription: PrismaSubscription | null

  dashboardLayout: unknown | null
  timezone: string
  isAdmin: boolean

  accounts: AccountInput[]
  groups: GroupInput[]
  tags: Tag[]
  moods: Mood[]

  trades: SerializedTrade[]
  tradesPagination: {
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
  }

  statistics: StatisticsProps
  scoreMetrics: ScoreMetrics

  tickDetails: TickDetails[]
  financialEvents: FinancialEvent[]

  bootstrappedAt: string
}

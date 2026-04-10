import type { StatisticsProps } from '@/lib/data-types'
import type { ScoreMetrics } from '@/lib/score-calculator'
import type { SerializedTrade } from '@/lib/data-types'

/*** DashboardBootstrapPayload — Server-to-client bootstrap contract */
export interface DashboardBootstrapPayload {
  // User (from Prisma User model)
  user: {
    id: string
    email: string
    language: string
    dashboardTheme: string
  } | null

  // Subscription (from Prisma Subscription model)
  subscription: {
    id: string
    plan: string
    status: string
    endDate: Date | null
    interval: string | null
  } | null

  // Layout
  dashboardLayout: unknown | null
  timezone: string
  isAdmin: boolean

  // Entities
  accounts: unknown[]
  groups: unknown[]
  tags: unknown[]

  // Trades
  trades: SerializedTrade[]
  tradesPagination: {
    page: number
    pageSize: number
    totalCount: number
    hasMore: boolean
  }

  // Precomputed analytics
  statistics: StatisticsProps
  scoreMetrics: ScoreMetrics

  // System data
  tickDetails: Array<{ id: string; ticker: string }>
  financialEvents: Array<{ id: string; title: string; date: Date; type: string; description: string | null }>

  // Metadata
  bootstrappedAt: string
}

export interface JournalEntry {
  id: string
  userId: string
  tradeId: string
  accountNumber: string

  preTradeNotes: string | null
  postTradeReview: string | null
  emotions: string | null

  confidenceRating: number | null
  disciplineScore: number | null

  customTags: string[]
  screenshots: string[]

  timeframe: string | null
  session: string | null

  pinned: boolean
  archived: boolean

  excerptTitle: string | null
  featuredExcerpt: string | null

  createdAt: string
  updatedAt: string
}

export interface TradeJournalCard {
  trade: {
    id: string
    instrument: string
    side: string
    entryPrice: number
    closePrice: number
    pnl: number
    commission: number
    quantity: number
    entryDate: string
    closeDate: string
    timeInPosition: number
    tags: string[]
    accountNumber: string
  }
  journal: JournalEntry | null
}

export type JournalStatus = 'all' | 'journaled' | 'not-journaled'
export type JournalPnlFilter = 'all' | 'winners' | 'losers' | 'breakeven'
export type JournalSortField = 'date-desc' | 'date-asc' | 'pnl-desc' | 'pnl-asc' | 'confidence-desc' | 'confidence-asc'

export interface JournalFilters {
  status: JournalStatus
  pnl: JournalPnlFilter
  tags: string[]
  instrument: string | null
  direction: 'all' | 'LONG' | 'SHORT'
  dateFrom: string | null
  dateTo: string | null
  search: string
  sort: JournalSortField
}

export interface JournalStats {
  totalTrades: number
  journaledCount: number
  winRate: number
  avgConfidence: number | null
}

export interface CreateJournalInput {
  tradeId: string
  accountNumber: string
  preTradeNotes?: string
  postTradeReview?: string
  emotions?: string
  confidenceRating?: number
  disciplineScore?: number
  customTags?: string[]
  screenshots?: string[]
  timeframe?: string
  session?: string
  excerptTitle?: string
  featuredExcerpt?: string
}

export type UpdateJournalInput = Partial<Omit<CreateJournalInput, 'tradeId' | 'accountNumber'>>

export interface TagTab {
  id: string
  name: string
  tags: string[]
}

export type TickerStat = {
  ticker: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  wins: number
  losses: number
  grossWin: number
  grossLoss: number
}

export type DailyStat = {
  date: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

export type SetupStat = {
  tag: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
}

export type StatisticsResult = {
  tickerStats: TickerStat[]
  dailyStats: DailyStat[]
  setupStats: SetupStat[]
  grandTotal: number
  grandWinRate: number
}

export type TickerStat = {
  ticker: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  pnl: number
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
  pnl: number
}

export type SetupStat = {
  tag: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  pnl: number
}

export type WeekdayStat = {
  day: string
  totalTrades: number
  winRate: number
  avgRR: number
  totalRR: number
  pnl: number
  wins: number
  losses: number
}

export type TradePnlEntry = {
  pnl: number
  entryDate: string
}

export type StatisticsResult = {
  tickerStats: TickerStat[]
  dailyStats: DailyStat[]
  setupStats: SetupStat[]
  weekdayStats: WeekdayStat[]
  timeframeStats: SetupStat[]
  allPnls: TradePnlEntry[]
  grandTotal: number
  grandWinRate: number
  grandPnl: number
  bestDay: number
  worstDay: number
  profitFactor: number
  avgRR: number
}

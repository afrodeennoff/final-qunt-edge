import Decimal from 'decimal.js'

export interface MetricsInput {
  winRate: number
  lossRate: number
  avgWin: number
  avgLoss: number
  accountSize: number
  riskPerTrade: number
  tradesCount: number
  totalGrossProfit: number
  totalGrossLoss: number
  maxDrawdown: number
  returns: number[]
}

export function expectancy(inputs: MetricsInput): number {
  return new Decimal(inputs.winRate)
    .times(inputs.avgWin)
    .minus(new Decimal(inputs.lossRate).times(inputs.avgLoss))
    .toNumber()
}

export function kellyCriterion(winRate: number, rewardRatio: number): number {
  const p = new Decimal(winRate)
  const q = new Decimal(1).minus(p)
  const b = new Decimal(rewardRatio)
  return p.minus(q.div(b)).div(b).toNumber()
}

export function halfKelly(winRate: number, rewardRatio: number): number {
  return new Decimal(kellyCriterion(winRate, rewardRatio)).div(2).toNumber()
}

export function edge(winRate: number, rewardRatio: number): number {
  return new Decimal(winRate)
    .minus(new Decimal(1).minus(winRate).div(rewardRatio))
    .toNumber()
}

export function riskOfRuin(
  winRate: number,
  rewardRatio: number,
  accountSize: number,
  riskPerTrade: number,
): number {
  const e = edge(winRate, rewardRatio)
  if (e <= 0) return 1
  const base = new Decimal(1).minus(e).div(new Decimal(1).plus(e))
  const exponent = new Decimal(accountSize).div(riskPerTrade)
  return base.pow(exponent).toNumber()
}

export function sharpeRatio(returns: number[], riskFreeRate = 0): number {
  if (returns.length < 2) return 0
  const n = returns.length
  const mean = returns.reduce((s, r) => s + r, 0) / n
  const variance =
    returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  if (stdDev === 0) return 0
  return new Decimal(mean)
    .minus(riskFreeRate)
    .div(stdDev)
    .times(Math.sqrt(252))
    .toNumber()
}

export function profitFactor(
  totalGrossProfit: number,
  totalGrossLoss: number,
): number {
  if (totalGrossLoss === 0) return Infinity
  return new Decimal(totalGrossProfit).div(totalGrossLoss).toNumber()
}

export function calmarRatio(
  annualizedReturn: number,
  maxDrawdown: number,
): number {
  return new Decimal(annualizedReturn).div(maxDrawdown).toNumber()
}

export function averageRMultiple(
  trades: { pnl: number; riskPerTrade: number }[],
): number {
  if (trades.length === 0) return 0
  const sum = trades.reduce(
    (acc, t) => acc.plus(new Decimal(t.pnl).div(t.riskPerTrade)),
    new Decimal(0),
  )
  return sum.div(trades.length).toNumber()
}

export function sqn(
  meanR: number,
  stdDevR: number,
  numTrades: number,
): number {
  if (stdDevR === 0) return 0
  return new Decimal(meanR).div(stdDevR).times(Math.sqrt(numTrades)).toNumber()
}

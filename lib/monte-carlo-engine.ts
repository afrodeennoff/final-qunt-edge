import Decimal from 'decimal.js'

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

export interface MonteCarloInputs {
  startingBalance: Decimal | number
  winRate: number
  rewardRatio: number
  riskPerTrade: number
  tradesPerDay: number
  maxTrades: number
  numSimulations: number
  profitTarget: Decimal | number
  maxDrawdown: Decimal | number
  drawdownType: 'static' | 'trailing_eod' | 'trailing_intraday'
  dailyLossLimit?: Decimal | number | null
  consistencyPct?: number | null
  challengeType: '1_step' | '2_step' | '3_step' | 'instant_funding'
  phase2Target?: Decimal | number | null
  phase3Target?: Decimal | number | null
  challengeCost?: Decimal | number
  profitSplit?: number
}

export interface MonteCarloSimulationPath {
  result: 'pass' | 'fail' | 'max_trades'
  daysToCompletion: number
  maxDrawdown: number
  finalBalance: number
  equityCurve: number[]
}

export interface MonteCarloResult {
  passProbability: number
  blowoutProbability: number
  avgDaysToPass: number
  medianDaysToPass: number
  p90DaysToPass: number
  expectedValue: number
  optimalRiskPerTrade: number
  riskOfRuin: number
  sharpeRatio: number
  profitFactor: number
  equityPercentiles: {
    p10: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p90: number[]
  }
  allPaths: MonteCarloSimulationPath[]
  pathResults: { pass: number; fail: number; maxTrades: number }
}

function toDecimal(v: Decimal | number | null | undefined): Decimal {
  return new Decimal(v ?? 0)
}

function sampleEquityCurve(curve: Decimal[], numSamples: number): number[] {
  if (curve.length <= 1) return curve.map(b => b.toNumber())
  const samples: number[] = []
  for (let i = 0; i < numSamples; i++) {
    const idx = Math.min(
      Math.round((curve.length - 1) * i / (numSamples - 1)),
      curve.length - 1,
    )
    samples.push(curve[idx].toNumber())
  }
  return samples
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.min(Math.floor(sorted.length * p), sorted.length - 1)
  return sorted[idx]!
}

function percentileValue(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  if (sorted.length === 1) return sorted[0]!
  const idx = p * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, sorted.length - 1)
  const frac = idx - lo
  return sorted[lo]! * (1 - frac) + sorted[hi]! * frac
}

interface SimulationExtra {
  grossProfit: number
  grossLoss: number
  failedByDrawdown: boolean
}

function simulatePath(
  startingBalance: Decimal,
  winRate: number,
  rewardRatio: number,
  riskPerTrade: number,
  tradesPerDay: number,
  maxTrades: number,
  profitTarget: Decimal,
  maxDrawdown: Decimal,
  drawdownType: 'static' | 'trailing_eod' | 'trailing_intraday',
  dailyLossLimit: Decimal | null,
  _consistencyPct: number | null,
  challengeType: '1_step' | '2_step' | '3_step' | 'instant_funding',
  phase2Target: Decimal | null,
  phase3Target: Decimal | null,
): { path: MonteCarloSimulationPath; extra: SimulationExtra } {
  let currentBalance = startingBalance
  let peakBalance = startingBalance
  let phaseStartBalance = startingBalance
  let todayPnL = new Decimal(0)
  let tradesToday = 0
  let dayCount = 1

  let currentProfitTarget = profitTarget
  let currentMaxDrawdown = maxDrawdown

  let maxDrawdownReached = new Decimal(0)
  let grossProfit = new Decimal(0)
  let grossLoss = new Decimal(0)
  let failedByDrawdown = false

  const balanceHistory: Decimal[] = [startingBalance]

  let result: 'pass' | 'fail' | 'max_trades' = 'max_trades'
  let phase = 1
  const totalPhases =
    challengeType === '3_step' ? 3
    : challengeType === '2_step' ? 2
    : 1

  for (let tradeIndex = 0; tradeIndex < maxTrades; tradeIndex++) {
    tradesToday++

    const riskAmount = currentBalance.times(riskPerTrade)
    const isWin = Math.random() < winRate

    let pnl: Decimal
    if (isWin) {
      pnl = riskAmount.times(rewardRatio)
      grossProfit = grossProfit.plus(pnl)
    } else {
      pnl = riskAmount.times(-1)
      grossLoss = grossLoss.plus(pnl.times(-1))
    }

    currentBalance = currentBalance.plus(pnl)

    if (isWin && currentBalance.greaterThan(peakBalance)) {
      peakBalance = currentBalance
    }

    if (dailyLossLimit !== null) {
      const projectedDayPnL = todayPnL.plus(pnl)
      if (projectedDayPnL.lessThan(dailyLossLimit.times(-1))) {
        result = 'fail'
        break
      }
    }
    todayPnL = todayPnL.plus(pnl)

    let currentDrawdown: Decimal
    if (drawdownType === 'static') {
      currentDrawdown = phaseStartBalance.minus(currentBalance)
    } else {
      currentDrawdown = peakBalance.minus(currentBalance)
    }

    if (currentDrawdown.greaterThan(maxDrawdownReached)) {
      maxDrawdownReached = currentDrawdown
    }

    if (drawdownType !== 'trailing_eod') {
      if (currentDrawdown.greaterThan(currentMaxDrawdown)) {
        result = 'fail'
        failedByDrawdown = true
        break
      }
    }

    balanceHistory.push(currentBalance)

    const cumulativeProfit = currentBalance.minus(phaseStartBalance)
    if (cumulativeProfit.greaterThanOrEqualTo(currentProfitTarget)) {
      if (phase >= totalPhases) {
        result = 'pass'
        break
      }

      phase++
      phaseStartBalance = currentBalance
      peakBalance = currentBalance
      todayPnL = new Decimal(0)
      tradesToday = 0
      dayCount = 1
      maxDrawdownReached = new Decimal(0)

      if (phase === 2 && phase2Target !== null) {
        currentProfitTarget = toDecimal(phase2Target)
      } else if (phase === 3 && phase3Target !== null) {
        currentProfitTarget = toDecimal(phase3Target)
      }
    }

    if (tradesToday >= tradesPerDay) {
      if (drawdownType === 'trailing_eod') {
        const eodDrawdown = peakBalance.minus(currentBalance)
        if (eodDrawdown.greaterThan(currentMaxDrawdown)) {
          if (eodDrawdown.greaterThan(maxDrawdownReached)) {
            maxDrawdownReached = eodDrawdown
          }
          result = 'fail'
          failedByDrawdown = true
          break
        }
      }

      tradesToday = 0
      todayPnL = new Decimal(0)
      dayCount++
    }
  }

  const equityCurve = sampleEquityCurve(balanceHistory, 100)

  return {
    path: {
      result,
      daysToCompletion: dayCount,
      maxDrawdown: maxDrawdownReached.toNumber(),
      finalBalance: currentBalance.toNumber(),
      equityCurve,
    },
    extra: {
      grossProfit: grossProfit.toNumber(),
      grossLoss: grossLoss.toNumber(),
      failedByDrawdown,
    },
  }
}

function runMonteCarloCore(
  inputs: MonteCarloInputs,
  skipGridSearch: boolean = false,
): MonteCarloResult {
  const startingBalance = toDecimal(inputs.startingBalance)
  const profitTarget = toDecimal(inputs.profitTarget)
  const maxDrawdown = toDecimal(inputs.maxDrawdown)
  const dailyLossLimit =
    inputs.dailyLossLimit != null ? toDecimal(inputs.dailyLossLimit) : null
  const phase2Target =
    inputs.phase2Target != null ? toDecimal(inputs.phase2Target) : null
  const phase3Target =
    inputs.phase3Target != null ? toDecimal(inputs.phase3Target) : null
  const challengeCost = toDecimal(inputs.challengeCost ?? 0)
  const profitSplit = inputs.profitSplit ?? 0.8
  const numSimulations = inputs.numSimulations || 10000
  const { winRate, rewardRatio, riskPerTrade, tradesPerDay } = inputs
  const maxT = inputs.maxTrades
  const { drawdownType } = inputs
  const consistencyPct = inputs.consistencyPct ?? null
  const { challengeType } = inputs

  const allPaths: MonteCarloSimulationPath[] = []
  let totalGrossProfit = 0
  let totalGrossLoss = 0
  let drawdownFailures = 0

  for (let sim = 0; sim < numSimulations; sim++) {
    const { path, extra } = simulatePath(
      startingBalance,
      winRate,
      rewardRatio,
      riskPerTrade,
      tradesPerDay,
      maxT,
      profitTarget,
      maxDrawdown,
      drawdownType,
      dailyLossLimit,
      consistencyPct,
      challengeType,
      phase2Target,
      phase3Target,
    )
    allPaths.push(path)
    totalGrossProfit += extra.grossProfit
    totalGrossLoss += extra.grossLoss
    if (extra.failedByDrawdown) drawdownFailures++
  }

  const passPaths = allPaths.filter(p => p.result === 'pass')
  const failPaths = allPaths.filter(p => p.result === 'fail')
  const maxTradesPaths = allPaths.filter(p => p.result === 'max_trades')

  const passProbability = passPaths.length / numSimulations
  const blowoutProbability = drawdownFailures / numSimulations

  const daysToPass = passPaths.map(p => p.daysToCompletion).sort((a, b) => a - b)
  const avgDaysToPass =
    daysToPass.length > 0
      ? daysToPass.reduce((a, b) => a + b, 0) / daysToPass.length
      : 0
  const medianDaysToPass =
    daysToPass.length > 0 ? percentile(daysToPass, 0.5) : 0
  const p90DaysToPass =
    daysToPass.length > 0 ? percentile(daysToPass, 0.9) : 0

  const passPayout = profitSplit * profitTarget.toNumber()
  const expectedValue =
    passProbability * passPayout - blowoutProbability * challengeCost.toNumber()

  const ruined = allPaths.filter(p => p.finalBalance <= 0).length
  const riskOfRuin = ruined / numSimulations

  const startNum = startingBalance.toNumber()
  const pathReturns = allPaths.map(
    p => (p.finalBalance - startNum) / startNum,
  )
  const meanReturn =
    pathReturns.reduce((a, b) => a + b, 0) / pathReturns.length
  const variance =
    pathReturns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) /
    pathReturns.length
  const stdReturn = Math.sqrt(variance)
  const sharpeRatio = stdReturn > 0 ? meanReturn / stdReturn : 0

  const profitFactor =
    totalGrossLoss > 0
      ? totalGrossProfit / totalGrossLoss
      : totalGrossProfit > 0
        ? Infinity
        : 0

  const numSamples = 100
  const eqP10: number[] = []
  const eqP25: number[] = []
  const eqP50: number[] = []
  const eqP75: number[] = []
  const eqP90: number[] = []

  for (let i = 0; i < numSamples; i++) {
    const values = allPaths
      .map(p => p.equityCurve[i] ?? p.equityCurve[p.equityCurve.length - 1]!)
      .sort((a, b) => a - b)
    eqP10.push(percentileValue(values, 0.1))
    eqP25.push(percentileValue(values, 0.25))
    eqP50.push(percentileValue(values, 0.5))
    eqP75.push(percentileValue(values, 0.75))
    eqP90.push(percentileValue(values, 0.9))
  }

  return {
    passProbability,
    blowoutProbability,
    avgDaysToPass,
    medianDaysToPass,
    p90DaysToPass,
    expectedValue,
    optimalRiskPerTrade: skipGridSearch
      ? riskPerTrade
      : findOptimalRisk(inputs),
    riskOfRuin,
    sharpeRatio,
    profitFactor,
    equityPercentiles: {
      p10: eqP10,
      p25: eqP25,
      p50: eqP50,
      p75: eqP75,
      p90: eqP90,
    },
    allPaths,
    pathResults: {
      pass: passPaths.length,
      fail: failPaths.length,
      maxTrades: maxTradesPaths.length,
    },
  }
}

function findOptimalRisk(inputs: MonteCarloInputs): number {
  const riskLevels = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03]
  let bestRisk = inputs.riskPerTrade
  let bestEV = -Infinity

  for (const risk of riskLevels) {
    const testInputs: MonteCarloInputs = {
      ...inputs,
      riskPerTrade: risk,
      numSimulations: 500,
    }
    const result = runMonteCarloCore(testInputs, true)
    if (result.expectedValue > bestEV) {
      bestEV = result.expectedValue
      bestRisk = risk
    }
  }

  return bestRisk
}

export function runMonteCarlo(inputs: MonteCarloInputs): MonteCarloResult {
  return runMonteCarloCore(inputs, false)
}

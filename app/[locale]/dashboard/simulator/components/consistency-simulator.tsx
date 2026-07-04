"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  FlaskConical,
  Plus,
  CalendarDays,
  Info,
  Zap,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Play,
  RefreshCw,
  Percent,
  Gauge,
  Shield,
  Sliders,
  Repeat,
  DollarSign,
  Trophy,
  Sparkles,
} from "lucide-react"
import { unifiedSectionPanelClassName, unifiedInfoLabelClassName } from "@/components/layout/unified-page-recipes"
import { Progress } from "@/components/ui/progress"
import { useDataTradeItems, useDataAccountsList } from "@/context/providers/data-state-provider"
import type { Trade } from "@/lib/data-types"
import { toValidDate } from "@/lib/date-utils"
import { runMonteCarlo } from "@/lib/monte-carlo-engine"
import type { MonteCarloInputs, MonteCarloResult } from "@/lib/monte-carlo-engine"
import { getFirmPreset, listFirmSizes, listPopularFirms } from "@/lib/prop-firm-presets"
import type { FirmPresetResult } from "@/lib/prop-firm-presets"
import { kellyCriterion, halfKelly, expectancy, riskOfRuin } from "@/lib/trading-metrics"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

type SimTab = "monte_carlo" | "consistency" | "drawdown"

interface TradingDay {
  id: string
  pnl: number
  date?: string
  isReal: boolean
  tradeCount?: number
}

interface Preset {
  id: string
  name: string
  description: string
  ratios: number[]
}

interface ResultsCache {
  inputs: string
  result: MonteCarloResult
}

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 150000]

const POPULAR_FIRMS = listPopularFirms()

const PRESETS: Preset[] = [
  {
    id: "steady_grinder",
    name: "Steady Grinder",
    description: "Five disciplined sessions, no single day dominates.",
    ratios: [0.006, 0.004, 0.007, 0.005, 0.006],
  },
  {
    id: "lucky_strike",
    name: "Lucky Strike",
    description: "One outsized day, quiet rest \u2014 the classic breach.",
    ratios: [0.002, -0.003, 0.042, 0.001, -0.002],
  },
  {
    id: "rollercoaster",
    name: "Rollercoaster",
    description: "Sharp wins and losses on alternating days.",
    ratios: [0.018, -0.013, 0.022, -0.009, 0.015, -0.006],
  },
  {
    id: "challenge_pass",
    name: "Challenge Pass",
    description: "Clean week that clears the consistency rule with room to spare.",
    ratios: [0.009, 0.008, 0.011, 0.007, 0.010, 0.008, 0.009],
  },
  {
    id: "funded_month",
    name: "Funded Month",
    description: "Twenty active days with one session that tests the limit.",
    ratios: [
      0.006, 0.005, 0.007, 0.004, -0.002, 0.006, 0.008, 0.005, 0.004, 0.006,
      0.007, 0.003, 0.036, 0.005, 0.004, 0.006, -0.001, 0.007, 0.005, 0.006,
    ],
  },
]

function presetToDays(preset: Preset, balance: number): TradingDay[] {
  return preset.ratios.map((ratio, i) => ({
    id: `${preset.id}_${i}`,
    pnl: Math.round(ratio * balance),
    isReal: false,
  }))
}

function formatSizeLabel(value: number): string {
  if (value >= 1000) {
    const k = value / 1000
    return Number.isInteger(k) ? `$${k}K` : `$${k.toFixed(1)}K`
  }
  return `$${value}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color?: string
  sub?: string | React.ReactNode
}) {
  return (
    <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className={cn("text-lg font-bold tabular-nums", color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</div>}
    </div>
  )
}

function RiskLevel({ value }: { value: number }) {
  if (value < 0.3) return <span className="text-emerald-500">Low</span>
  if (value < 0.6) return <span className="text-amber-500">Medium</span>
  return <span className="text-destructive">High</span>
}

const MCResultDashboard = React.memo(function MCResultDashboard({
  result,
  challengeCost,
}: {
  result: MonteCarloResult
  challengeCost?: number
}) {
  const evColor = result.expectedValue >= 0 ? "text-emerald-500" : "text-destructive"

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      <MetricCard
        label="Pass Probability"
        value={formatPct(result.passProbability)}
        icon={Trophy}
        color={result.passProbability > 0.5 ? "text-emerald-500" : result.passProbability > 0.3 ? "text-amber-500" : "text-destructive"}
        sub={`${result.pathResults.pass} of ${result.pathResults.pass + result.pathResults.fail + result.pathResults.maxTrades} paths`}
      />
      <MetricCard
        label="Blowout Rate"
        value={formatPct(result.blowoutProbability)}
        icon={AlertTriangle}
        color="text-destructive"
        sub={`${result.pathResults.fail} paths hit drawdown`}
      />
      <MetricCard
        label="Expected Value"
        value={formatCurrency(result.expectedValue)}
        icon={DollarSign}
        color={evColor}
        sub={challengeCost ? `Challenge: ${formatCurrency(challengeCost)}` : undefined}
      />
      <MetricCard
        label="Optimal Risk"
        value={formatPct(result.optimalRiskPerTrade)}
        icon={Gauge}
        color="text-primary"
        sub={`Grid-searched ${formatPct(0.005)}-${formatPct(0.03)}`}
      />
      <MetricCard
        label="Avg Days to Pass"
        value={result.avgDaysToPass.toFixed(1)}
        icon={CalendarDays}
        sub={`Median: ${result.medianDaysToPass.toFixed(1)} | P90: ${result.p90DaysToPass.toFixed(1)}`}
      />
      <MetricCard
        label="Risk of Ruin"
        value={formatPct(result.riskOfRuin)}
        icon={Shield}
        color={result.riskOfRuin < 0.05 ? "text-emerald-500" : result.riskOfRuin < 0.2 ? "text-amber-500" : "text-destructive"}
        sub={<RiskLevel value={result.riskOfRuin} />}
      />
      <MetricCard
        label="Sharpe Ratio"
        value={result.sharpeRatio.toFixed(2)}
        icon={BarChart3}
        color={result.sharpeRatio > 1 ? "text-emerald-500" : result.sharpeRatio > 0 ? "text-amber-500" : "text-destructive"}
      />
      <MetricCard
        label="Profit Factor"
        value={result.profitFactor === Infinity ? "∞" : result.profitFactor.toFixed(2)}
        icon={Zap}
        color={result.profitFactor > 1.5 ? "text-emerald-500" : result.profitFactor > 1 ? "text-amber-500" : "text-destructive"}
      />
    </div>
  )
})

function EquityFanChart({ percentiles }: { percentiles: MonteCarloResult["equityPercentiles"] }) {
  const chartData = percentiles.p50.map((_, i) => ({
    trade: i,
    p10: percentiles.p10[i] ?? 0,
    p25: percentiles.p25[i] ?? 0,
    p50: percentiles.p50[i] ?? 0,
    p75: percentiles.p75[i] ?? 0,
    p90: percentiles.p90[i] ?? 0,
  }))

  return (
    <div className={cn(unifiedSectionPanelClassName, "p-4")}>
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <TrendingDown className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Equity Curve Distribution</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="trade" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} hide />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={50} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [formatCurrency(value), undefined]}
            labelFormatter={(label: number) => `Trade #${label}`}
          />
          <Area type="monotone" dataKey="p90" stroke="transparent" fill="var(--primary)" fillOpacity={0.05} />
          <Area type="monotone" dataKey="p75" stroke="transparent" fill="var(--primary)" fillOpacity={0.08} />
          <Area type="monotone" dataKey="p50" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.12} />
          <Area type="monotone" dataKey="p25" stroke="transparent" fill="var(--primary)" fillOpacity={0.08} />
          <Area type="monotone" dataKey="p10" stroke="transparent" fill="var(--primary)" fillOpacity={0.05} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2 text-[10px] text-muted-foreground/60">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary/80" /> P50 Median</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-primary/10 border border-primary/20" /> P25-P75</span>
        <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-primary/5 border border-primary/10" /> P10-P90</span>
      </div>
    </div>
  )
}

function PassRateCurve(_props: { result: MonteCarloResult }) {
  const gridResults = React.useMemo(() => {
    const risks = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03]
    return risks.map(r => {
      const mc = runMonteCarlo({
        startingBalance: 50000,
        winRate: 0.5,
        rewardRatio: 2,
        riskPerTrade: r,
        tradesPerDay: 5,
        maxTrades: 500,
        numSimulations: 500,
        profitTarget: 5000,
        maxDrawdown: 5000,
        drawdownType: 'static',
        challengeType: '1_step',
      })
      return { risk: r * 100, passProb: mc.passProbability, ev: mc.expectedValue }
    })
  }, [])

  return (
    <div className={cn(unifiedSectionPanelClassName, "p-4")}>
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Sliders className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Pass Rate vs Risk Per Trade</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={gridResults} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="risk" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={40} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} domain={[0, 1]} />
          <Tooltip
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number, name: string) => [name === "passProb" ? formatPct(value) : formatCurrency(value), name === "passProb" ? "Pass Rate" : "Expected Value"]}
            labelFormatter={(label: number) => `${label.toFixed(1)}% Risk`}
          />
          <Line type="monotone" dataKey="passProb" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function StrategyMetrics({ winRate, rewardRatio, riskPerTrade, startingBalance }: {
  winRate: number
  rewardRatio: number
  riskPerTrade: number
  startingBalance: number
}) {
  const kelly = kellyCriterion(winRate, rewardRatio)
  const half = halfKelly(winRate, rewardRatio)
  const edge = (winRate - (1 - winRate) / rewardRatio)
  const ror = riskOfRuin(winRate, rewardRatio, startingBalance, riskPerTrade)
  const exp = expectancy({
    winRate, lossRate: 1 - winRate,
    avgWin: rewardRatio * riskPerTrade * startingBalance,
    avgLoss: riskPerTrade * startingBalance,
    accountSize: startingBalance,
    riskPerTrade, tradesCount: 100, totalGrossProfit: 0, totalGrossLoss: 0, maxDrawdown: 0, returns: [],
  })

  const metrics = [
    { label: "Edge", value: edge > 0 ? `${(edge * 100).toFixed(2)}%` : `${(edge * 100).toFixed(2)}%`, color: edge > 0 ? "text-emerald-500" : "text-destructive" },
    { label: "Expectancy", value: formatCurrency(exp), color: exp > 0 ? "text-emerald-500" : "text-destructive" },
    { label: "Kelly %", value: kelly > 0 ? `${(kelly * 100).toFixed(2)}%` : `${(kelly * 100).toFixed(2)}%`, color: kelly > 0 ? "text-emerald-500" : "text-destructive" },
    { label: "Half-Kelly", value: `${(half * 100).toFixed(2)}%`, color: "text-primary" },
    { label: "Risk of Ruin", value: `${(ror * 100).toFixed(1)}%`, color: ror < 0.05 ? "text-emerald-500" : ror < 0.2 ? "text-amber-500" : "text-destructive" },
  ]

  return (
    <div className={cn(unifiedSectionPanelClassName, "p-4")}>
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <BarChart3 className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Strategy Metrics</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{m.label}</div>
            <div className={cn("text-sm font-bold tabular-nums mt-0.5", m.color)}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SliderInput({ label, value, onChange, min, max, step, format }: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground/80">{label}</span>
        <span className="text-[11px] font-bold tabular-nums text-foreground">{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted/40 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
      />
    </div>
  )
}

const ConsistencySimulator = React.memo(function ConsistencySimulator() {
  const rawTrades = useDataTradeItems()
  const accounts = useDataAccountsList()

  const [activeTab, setActiveTab] = React.useState<SimTab>("monte_carlo")
  const [simMode, setSimMode] = React.useState<"live" | "simulate">("live")
  const [userSelectedAccountId, setUserSelectedAccountId] = React.useState<string | null>(null)
  const [consistencyPct, setConsistencyPct] = React.useState(30)
  const [userSelectedSize, setUserSelectedSize] = React.useState<number | null>(null)
  const [phase, setPhase] = React.useState<"phase_1" | "funded">("phase_1")
  const [activePreset, setActivePreset] = React.useState<{ id: string; name: string; description: string; ratios: number[] } | null>(null)
  const [manualDays, setManualDays] = React.useState<TradingDay[]>([])

  const [selectedFirm, setSelectedFirm] = React.useState<string | null>(null)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [firmPreset, setFirmPreset] = React.useState<FirmPresetResult | null>(null)
  const [mcWinRate, setMcWinRate] = React.useState(0.5)
  const [mcRR, setMcRR] = React.useState(2)
  const [mcRisk, setMcRisk] = React.useState(0.01)
  const [mcTradesPerDay, setMcTradesPerDay] = React.useState(5)
  const [mcMaxTrades, setMcMaxTrades] = React.useState(500)
  const [mcSims, setMcSims] = React.useState(5000)
  const [mcResult, setMcResult] = React.useState<ResultsCache | null>(null)
  const [mcRunning, setMcRunning] = React.useState(false)
  const [customBalance, setCustomBalance] = React.useState("")
  const [customTarget, setCustomTarget] = React.useState("")
  const [customDrawdown, setCustomDrawdown] = React.useState("")
  const [drawdownType, setDrawdownType] = React.useState<"static" | "trailing_eod" | "trailing_intraday">("static")

  const selectedAccountId = userSelectedAccountId

  const selectedAccount = React.useMemo(() => {
    if (!selectedAccountId || accounts.length === 0) return null
    return accounts.find(a => a.id === selectedAccountId) ?? null
  }, [selectedAccountId, accounts])

  const accountDefaultSize = React.useMemo(() => {
    if (selectedAccount?.startingBalance && Number(selectedAccount.startingBalance) > 0) {
      return Number(selectedAccount.startingBalance)
    }
    if (selectedAccount?.accountSizeName) {
      const parsed = parseInt(selectedAccount.accountSizeName.replace(/[^0-9]/g, ""), 10)
      if (!isNaN(parsed) && parsed > 0) return parsed * 1000
    }
    if (selectedAccount?.accountSize) {
      const parsed = parseInt(selectedAccount.accountSize.replace(/[^0-9]/g, ""), 10)
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
    return 50000
  }, [selectedAccount])

  const effectiveStartingBalance = userSelectedSize ?? accountDefaultSize

  const effectiveProfitTarget = React.useMemo(() => {
    if (firmPreset) return firmPreset.profitTarget
    if (customTarget) return parseFloat(customTarget) || 0
    if (selectedAccount?.profitTarget && Number(selectedAccount.profitTarget) > 0) {
      return Number(selectedAccount.profitTarget)
    }
    return effectiveStartingBalance * 0.1
  }, [firmPreset, customTarget, selectedAccount, effectiveStartingBalance])

  const effectiveMaxDrawdown = React.useMemo(() => {
    if (firmPreset) return firmPreset.maxDrawdown
    if (customDrawdown) return parseFloat(customDrawdown) || 0
    if (selectedAccount?.drawdownThreshold && Number(selectedAccount.drawdownThreshold) > 0) {
      return Number(selectedAccount.drawdownThreshold)
    }
    return effectiveStartingBalance * 0.1
  }, [firmPreset, customDrawdown, selectedAccount, effectiveStartingBalance])

  const accountConsistencyPct = selectedAccount?.consistencyPercentage
    ? Number(selectedAccount.consistencyPercentage)
    : null

  const hasTrades = rawTrades.length > 0

  const selectedAccountTrades = React.useMemo(() => {
    if (!selectedAccount) return rawTrades
    return rawTrades.filter(t => t.accountNumber === selectedAccount.number)
  }, [selectedAccount, rawTrades])

  const aggregateTradesByDay = React.useCallback((trades: Trade[]) => {
    const map = new Map<string, { pnl: number; count: number; date: string }>()
    trades.forEach(t => {
      const d = toValidDate(t.entryDate) ?? toValidDate(t.closeDate)
      if (!d) return
      const key = d.toISOString().split("T")[0]
      const existing = map.get(key) || { pnl: 0, count: 0, date: key }
      existing.pnl += (t.pnl ? Number(t.pnl) : 0) - (t.commission ? Number(t.commission) : 0)
      existing.count++
      map.set(key, existing)
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  const realTradingDays = React.useMemo<TradingDay[]>(() => {
    if (!hasTrades) return []
    const days = aggregateTradesByDay(selectedAccountTrades)
    return days.map(d => ({ id: `real-${d.date}`, pnl: d.pnl, date: d.date, isReal: true, tradeCount: d.count }))
  }, [hasTrades, selectedAccountTrades, aggregateTradesByDay])

  const simulatedDays = React.useMemo<TradingDay[]>(() => {
    if (activePreset) {
      return activePreset.ratios.map((r, i) => ({
        id: `preset-${activePreset.id}-${i}`,
        pnl: r * effectiveStartingBalance,
        isReal: false,
      }))
    }
    return manualDays
  }, [activePreset, manualDays, effectiveStartingBalance])

  const activeDays = React.useMemo(() => {
    if (simMode === "live" && realTradingDays.length > 0) return realTradingDays
    return simulatedDays
  }, [simMode, realTradingDays, simulatedDays])

  const totalProfit = React.useMemo(() => activeDays.reduce((sum, d) => sum + Math.max(d.pnl, 0), 0), [activeDays])
  const totalPnl = React.useMemo(() => activeDays.reduce((sum, d) => sum + d.pnl, 0), [activeDays])
  const bestDay = React.useMemo(() => Math.max(...activeDays.map(d => d.pnl), 0), [activeDays])
  const worstDay = React.useMemo(() => Math.min(...activeDays.map(d => d.pnl), 0), [activeDays])
  const avgDay = React.useMemo(() => {
    if (activeDays.length === 0) return 0
    return activeDays.reduce((sum, d) => sum + d.pnl, 0) / activeDays.length
  }, [activeDays])
  const winningDays = React.useMemo(() => activeDays.filter(d => d.pnl > 0).length, [activeDays])
  const losingDays = React.useMemo(() => activeDays.filter(d => d.pnl < 0).length, [activeDays])
  const dayWinRate = React.useMemo(() => {
    if (activeDays.length === 0) return 0
    return winningDays / activeDays.length
  }, [activeDays, winningDays])

  const consistencyScore = React.useMemo(() => {
    if (totalProfit <= 0) return 0
    const pct = (bestDay / totalProfit) * 100
    return Math.min(100, Math.max(0, pct))
  }, [bestDay, totalProfit])

  const maxAllowedDaily = React.useMemo(() => {
    const base = totalProfit > 0 ? totalProfit : effectiveProfitTarget
    return base * (consistencyPct / 100)
  }, [totalProfit, effectiveProfitTarget, consistencyPct])

  const consistencyBreached = consistencyScore > consistencyPct
  const isWarning = consistencyScore > consistencyPct * 0.8 && !consistencyBreached
  const isPassing = !consistencyBreached && totalProfit > 0
  const currentBalance = effectiveStartingBalance + totalPnl
  const winRate = dayWinRate * 100

  const maxDrawdown = React.useMemo(() => {
    if (activeDays.length === 0) return 0
    let peak = 0
    let maxDd = 0
    let running = 0
    for (const day of activeDays) {
      running += day.pnl
      if (running > peak) peak = running
      const dd = peak - running
      if (dd > maxDd) maxDd = dd
    }
    return maxDd
  }, [activeDays])

  const maxDrawdownPct = React.useMemo(() => {
    if (effectiveStartingBalance <= 0) return 0
    return (maxDrawdown / effectiveStartingBalance) * 100
  }, [maxDrawdown, effectiveStartingBalance])

  const equityCurve = React.useMemo(() => {
    const result: number[] = []
    let running = effectiveStartingBalance
    for (const day of activeDays) {
      running += day.pnl
      result.push(running)
    }
    return result
  }, [activeDays, effectiveStartingBalance])

  const equityBounds = React.useMemo(() => {
    if (equityCurve.length === 0) return { min: 0, max: effectiveStartingBalance }
    const max = Math.max(...equityCurve, effectiveStartingBalance)
    const min = Math.min(...equityCurve, effectiveStartingBalance)
    const padding = (max - min) * 0.15 || effectiveStartingBalance * 0.1
    return { min: min - padding, max: max + padding }
  }, [equityCurve, effectiveStartingBalance])

  const peakBalances = React.useMemo(() => {
    let peak = effectiveStartingBalance
    return equityCurve.map(b => {
      if (b > peak) peak = b
      return peak
    })
  }, [equityCurve, effectiveStartingBalance])

  const dayDrawdowns = React.useMemo(() => {
    let peak = effectiveStartingBalance
    return equityCurve.map((b, i) => {
      if (b > peak) peak = b
      const dd = peak - b
      return { day: i + 1, balance: b, drawdown: dd, drawdownPct: peak > 0 ? (dd / peak) * 100 : 0 }
    })
  }, [equityCurve, effectiveStartingBalance])

  const maxConsecutiveLosses = React.useMemo(() => {
    let maxStreak = 0
    let current = 0
    for (const day of activeDays) {
      if (day.pnl < 0) {
        current++
        if (current > maxStreak) maxStreak = current
      } else {
        current = 0
      }
    }
    return maxStreak
  }, [activeDays])

  const drawdownLimit = effectiveMaxDrawdown
  const drawdownBreached = React.useMemo(() => {
    if (drawdownLimit <= 0) return false
    return maxDrawdown > drawdownLimit
  }, [maxDrawdown, drawdownLimit])

  const handleRunMonteCarlo = React.useCallback(() => {
    if (mcRunning) return
    setMcRunning(true)
    const balance = firmPreset?.balance ?? (parseFloat(customBalance) || effectiveStartingBalance)
    const target = firmPreset?.profitTarget ?? (parseFloat(customTarget) || balance * 0.1)
    const dd = firmPreset?.maxDrawdown ?? (parseFloat(customDrawdown) || balance * 0.1)
    const ddType = firmPreset?.drawdownType ?? drawdownType
    const dailyLoss = firmPreset?.dailyLossLimit ?? undefined

    const inputs: MonteCarloInputs = {
      startingBalance: balance,
      winRate: mcWinRate,
      rewardRatio: mcRR,
      riskPerTrade: mcRisk,
      tradesPerDay: mcTradesPerDay,
      maxTrades: mcMaxTrades,
      numSimulations: mcSims,
      profitTarget: target,
      maxDrawdown: dd,
      drawdownType: ddType,
      dailyLossLimit: dailyLoss,
      challengeType: firmPreset?.evaluation === false ? 'instant_funding' : '1_step',
      challengeCost: firmPreset?.price ?? 0,
      profitSplit: firmPreset ? firmPreset.profitSharing / 100 : 0.8,
    }

    const inputsKey = JSON.stringify(inputs)
    if (mcResult?.inputs === inputsKey) {
      setMcRunning(false)
      return
    }

    setTimeout(() => {
      const result = runMonteCarlo(inputs)
      setMcResult({ inputs: inputsKey, result })
      setMcRunning(false)
    }, 50)
  }, [mcRunning, firmPreset, customBalance, customTarget, customDrawdown, drawdownType, mcWinRate, mcRR, mcRisk, mcTradesPerDay, mcMaxTrades, mcSims, effectiveStartingBalance, mcResult])

  React.useEffect(() => {
    if (selectedFirm && selectedSize) {
      const preset = getFirmPreset(selectedFirm, selectedSize)
      setFirmPreset(preset ?? null)
    } else {
      setFirmPreset(null)
    }
  }, [selectedFirm, selectedSize])

  const firmSizes = React.useMemo(() => {
    if (!selectedFirm) return []
    return listFirmSizes(selectedFirm)
  }, [selectedFirm])

  const selectSize = React.useCallback((size: number) => {
    setUserSelectedSize(size === userSelectedSize ? null : size)
  }, [userSelectedSize])

  const clearSimulated = React.useCallback(() => {
    setActivePreset(null)
    setManualDays([])
  }, [])

  function detachPreset(): TradingDay[] {
    if (activePreset) {
      const frozen = presetToDays(activePreset, effectiveStartingBalance)
      setActivePreset(null)
      setManualDays(frozen)
      return frozen
    }
    return manualDays
  }

  function addDay(pnl?: number) {
    const base = detachPreset()
    setManualDays([...base, {
      id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pnl: pnl ?? 0,
      isReal: false,
    }])
  }

  function removeDay(id: string) {
    const base = detachPreset()
    setManualDays(base.filter(d => d.id !== id))
  }

  function updateDayPnl(id: string, pnl: number) {
    const base = detachPreset()
    setManualDays(base.map(d => (d.id === id ? { ...d, pnl } : d)))
  }

  function applyPreset(preset: Preset) {
    setSimMode("simulate")
    setActivePreset(preset)
    setManualDays([])
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FlaskConical className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Simulator</span>
      </div>

      <div className="flex border-b border-border/20">
        {[
          { id: "monte_carlo" as SimTab, label: "Monte Carlo", icon: BarChart3 },
          { id: "consistency" as SimTab, label: "Consistency", icon: Percent },
          { id: "drawdown" as SimTab, label: "Drawdown", icon: TrendingDown },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground/60 hover:text-foreground/80",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "monte_carlo" && (
        <div key="mc" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <FlaskConical className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Try a Prop Firm Preset</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {POPULAR_FIRMS.map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setSelectedFirm(f.key === selectedFirm ? null : f.key); setSelectedSize(null); setFirmPreset(null) }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[11px] font-semibold border transition-colors text-center",
                      selectedFirm === f.key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {selectedFirm && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {firmSizes.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setSelectedSize(s.key)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors",
                          selectedSize === s.key
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {s.name} — {formatCurrency(s.price)}
                      </button>
                    ))}
                  </div>

                  {firmPreset && (
                    <div className={cn("bg-muted/20 border border-border/20 rounded-lg p-3 sm:p-4 space-y-3")}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{firmPreset.firmName} — {firmPreset.sizeName}</span>
                        <span className="text-[11px] text-muted-foreground/60">{formatCurrency(firmPreset.price)} {firmPreset.evaluation ? "(Evaluation)" : "(Instant)"}</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Target</div><div className="text-xs font-bold tabular-nums">{formatPct(firmPreset.ratios.targetToDrawdown)}</div></div>
                        <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Drawdown</div><div className="text-xs font-bold tabular-nums">{formatCurrency(firmPreset.maxDrawdown)}</div></div>
                        <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">DD Type</div><div className="text-xs font-bold">{firmPreset.drawdownType === 'static' ? 'Static' : firmPreset.drawdownType === 'trailing_eod' ? 'EOD' : 'Intraday'}</div></div>
                        <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Daily Loss</div><div className="text-xs font-bold">{firmPreset.dailyLossLimit ? formatCurrency(firmPreset.dailyLossLimit) : 'None'}</div></div>
                        <div><div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Consistency</div><div className="text-xs font-bold">{firmPreset.consistencyPct ? `${firmPreset.consistencyPct}%` : 'None'}</div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border/10">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Sliders className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Custom Configuration</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Account Size</label>
                    <input value={customBalance} onChange={e => setCustomBalance(e.target.value)} placeholder={formatSizeLabel(effectiveStartingBalance)} className="w-full mt-1 bg-muted/20 border border-border/20 rounded-lg px-2.5 py-1.5 text-xs font-bold tabular-nums focus:outline-none focus:border-primary/40" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Profit Target ($)</label>
                    <input value={customTarget} onChange={e => setCustomTarget(e.target.value)} placeholder={formatCurrency(effectiveProfitTarget)} className="w-full mt-1 bg-muted/20 border border-border/20 rounded-lg px-2.5 py-1.5 text-xs font-bold tabular-nums focus:outline-none focus:border-primary/40" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Max Drawdown ($)</label>
                    <input value={customDrawdown} onChange={e => setCustomDrawdown(e.target.value)} placeholder={formatCurrency(effectiveMaxDrawdown)} className="w-full mt-1 bg-muted/20 border border-border/20 rounded-lg px-2.5 py-1.5 text-xs font-bold tabular-nums focus:outline-none focus:border-primary/40" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Drawdown Type</label>
                    <select
                      value={drawdownType}
                      onChange={e => setDrawdownType(e.target.value as typeof drawdownType)}
                      className="w-full mt-1 bg-muted/20 border border-border/20 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-primary/40"
                    >
                      <option value="static">Static</option>
                      <option value="trailing_eod">Trailing EOD</option>
                      <option value="trailing_intraday">Trailing Intraday</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Zap className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Strategy Stats</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SliderInput label="Win Rate" value={mcWinRate} onChange={setMcWinRate} min={0.2} max={0.9} step={0.01} format={v => `${(v * 100).toFixed(0)}%`} />
                <SliderInput label="Risk:Reward" value={mcRR} onChange={setMcRR} min={0.5} max={5} step={0.1} format={v => `1:${v.toFixed(1)}`} />
                <SliderInput label="Risk Per Trade" value={mcRisk} onChange={setMcRisk} min={0.005} max={0.03} step={0.001} format={v => `${(v * 100).toFixed(1)}%`} />
                <SliderInput label="Trades Per Day" value={mcTradesPerDay} onChange={setMcTradesPerDay} min={1} max={20} step={1} format={v => v.toFixed(0)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <SliderInput label="Max Trades" value={mcMaxTrades} onChange={setMcMaxTrades} min={100} max={10000} step={100} format={v => v.toFixed(0)} />
                <SliderInput label="Simulations" value={mcSims} onChange={setMcSims} min={1000} max={20000} step={1000} format={v => v.toLocaleString()} />
              </div>

              <StrategyMetrics
                winRate={mcWinRate}
                rewardRatio={mcRR}
                riskPerTrade={mcRisk}
                startingBalance={firmPreset?.balance ?? (parseFloat(customBalance) || effectiveStartingBalance)}
              />

              <button
                onClick={handleRunMonteCarlo}
                disabled={mcRunning}
                className={cn(
                  "w-full mt-4 px-4 py-2.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
                  mcRunning
                    ? "bg-muted/50 text-muted-foreground/60 cursor-not-allowed"
                    : "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90",
                )}
              >
                {mcRunning ? (
                  <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Running {mcSims.toLocaleString()} Simulations...</>
                ) : (
                  <><Play className="h-3.5 w-3.5" /> Run Monte Carlo</>
                )}
              </button>
            </div>

            {mcResult && (
              <MCResultDashboard
                result={mcResult.result}
                challengeCost={firmPreset?.price}
              />
            )}

            {mcResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EquityFanChart percentiles={mcResult.result.equityPercentiles} />
                <PassRateCurve result={mcResult.result} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <StrategyMetrics
              winRate={mcWinRate}
              rewardRatio={mcRR}
              riskPerTrade={mcRisk}
              startingBalance={firmPreset?.balance ?? (parseFloat(customBalance) || effectiveStartingBalance)}
            />

            {!mcResult && (
              <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">How It Works</span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground/60">
                  Monte Carlo simulation runs thousands of randomized trading paths based on your strategy stats.
                  Each path randomly determines win/loss order (because sequence matters more than averages),
                  then checks if profit target or drawdown is hit first.
                </p>
              </div>
            )}

            {mcResult && mcResult.result.pathResults.pass + mcResult.result.pathResults.fail > 0 && (
              <div className={cn(unifiedSectionPanelClassName, "p-4")}>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Repeat className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Path Breakdown</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-500 font-semibold">Passed</span>
                    <span className="text-xs font-bold tabular-nums">{mcResult.result.pathResults.pass} ({formatPct(mcResult.result.passProbability)})</span>
                  </div>
                  <Progress value={mcResult.result.passProbability * 100} className="h-1.5 bg-muted/40" indicatorClassName="bg-emerald-500" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-destructive font-semibold">Blown</span>
                    <span className="text-xs font-bold tabular-nums">{mcResult.result.pathResults.fail} ({formatPct(mcResult.result.blowoutProbability)})</span>
                  </div>
                  <Progress value={mcResult.result.blowoutProbability * 100} className="h-1.5 bg-muted/40" indicatorClassName="bg-destructive" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground/60">Max Trades</span>
                    <span className="text-xs font-bold tabular-nums">{mcResult.result.pathResults.maxTrades}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "consistency" && (
        <div key="consistency">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                Consistency Simulator
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground/60 sm:text-right">
              {accounts.length > 0
                ? "Using your real account data. Switch to simulate mode to test scenarios."
                : "Add an account and trades to see live consistency feedback."}
            </p>
          </div>

          <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5")}>
            <div>
              <div className="mb-3">
                <p className={unifiedInfoLabelClassName}>Account</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">Select account or view all</p>
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                <button
                  onClick={() => { setUserSelectedAccountId("all"); setSimMode("live"); setActivePreset(null); setManualDays([]) }}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                    selectedAccountId === "all"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span>All Accounts</span>
                  {hasTrades && <span className="text-[10px] tabular-nums opacity-60">{rawTrades.length} trades</span>}
                </button>
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setUserSelectedAccountId(acc.id || acc.number); setSimMode("live"); setActivePreset(null); setManualDays([]); setUserSelectedSize(null) }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                      selectedAccountId === (acc.id || acc.number)
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Wallet className="h-3 w-3 shrink-0 opacity-50" />
                      <span className="truncate">{acc.propfirm || acc.number}</span>
                      {acc.accountSizeName && (
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 shrink-0">{acc.accountSizeName}</span>
                      )}
                    </div>
                    {Number(acc.startingBalance) > 0 && (
                      <span className="text-[10px] tabular-nums opacity-60 shrink-0">{formatCurrency(Number(acc.startingBalance))}</span>
                    )}
                  </button>
                ))}
                {accounts.length === 0 && (
                  <div className="rounded-lg px-3 py-3 text-center border border-dashed border-border/20">
                    <p className="text-[11px] text-muted-foreground/40">No accounts found</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className={unifiedInfoLabelClassName}>Account Size</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">Starting balance for simulation</p>
                </div>
                <span className="text-lg font-black text-foreground tabular-nums">
                  {formatCurrency(effectiveStartingBalance)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ACCOUNT_SIZES.map(size => {
                  const isActive = userSelectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => selectSize(size)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-[11px] font-bold transition-all duration-200 border",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                          : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {formatSizeLabel(size)}
                    </button>
                  )
                })}
              </div>
              <div className="mt-1.5">
                <div className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
                  userSelectedSize !== null && !ACCOUNT_SIZES.includes(userSelectedSize) ? "border-primary/40 bg-primary/5" : "border-border/20 bg-muted/30",
                )}>
                  <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0">Custom</span>
                  <span className="text-muted-foreground/40">$</span>
                  <input
                    type="number"
                    value={userSelectedSize ?? accountDefaultSize}
                    onChange={e => setUserSelectedSize(Math.max(100, Number(e.target.value) || accountDefaultSize))}
                    className="w-full bg-transparent text-[12px] font-semibold tabular-nums text-foreground focus:outline-none"
                    placeholder="50000"
                    min="100"
                    step="100"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3">
                <p className={unifiedInfoLabelClassName}>Consistency Rule</p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {selectedAccount?.propfirm
                    ? `Custom \u2014 ${selectedAccount.propfirm} default`
                    : "Set the max daily profit %"}
                </p>
              </div>
              <div className="rounded-lg bg-background/40 p-3 border border-border/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground/70">Max best day</span>
                  <span className="text-xl font-black text-foreground tabular-nums">{consistencyPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={consistencyPct}
                  onChange={e => setConsistencyPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted/50 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground/30">5%</span>
                  <span className="text-[9px] text-muted-foreground/30">100%</span>
                </div>
                {accountConsistencyPct && accountConsistencyPct !== consistencyPct && (
                  <button
                    type="button"
                    onClick={() => setConsistencyPct(accountConsistencyPct)}
                    className="text-[9px] text-primary/70 mt-1.5 hover:text-primary transition-colors"
                  >
                    Your account uses {accountConsistencyPct}% \u2014 click to apply
                  </button>
                )}
              </div>
              <div className="mt-3">
                <p className="text-[10px] font-medium text-muted-foreground/50 mb-1.5">Phase</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPhase("phase_1")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border",
                      phase === "phase_1"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-muted/30 text-muted-foreground/70 border-border/20 hover:bg-muted/50",
                    )}
                  >
                    Phase 1
                  </button>
                  <button
                    onClick={() => setPhase("funded")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border",
                      phase === "funded"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-muted/30 text-muted-foreground/70 border-border/20 hover:bg-muted/50",
                    )}
                  >
                    Funded
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-1 w-fit border border-border/15">
            <button
              onClick={() => { setSimMode("live"); setActivePreset(null); setManualDays([]) }}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
                simMode === "live"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground/80",
              )}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3" />
                Live Data
                {realTradingDays.length > 0 && (
                  <span className="text-[9px] font-normal opacity-60">({realTradingDays.length} days)</span>
                )}
              </span>
            </button>
            <button
              onClick={() => setSimMode("simulate")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
                simMode === "simulate"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground/80",
              )}
            >
              <span className="flex items-center gap-1.5">
                <FlaskConical className="h-3 w-3" />
                Simulate
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
            <div className={cn("xl:col-span-2", unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Trading Sessions
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                    {activeDays.length} days
                  </span>
                  {winningDays > 0 && (
                    <span className="text-[9px] font-medium text-success">
                      {winningDays}W {losingDays}L
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {simMode === "simulate" && simulatedDays.length > 0 && (
                    <button
                      onClick={clearSimulated}
                      className="text-[11px] font-medium text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  {simMode === "simulate" && (
                    <button
                      onClick={() => addDay()}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm shadow-primary/20"
                    >
                      <Plus className="h-3 w-3" />
                      Add day
                    </button>
                  )}
                </div>
              </div>

              {activeDays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border/20">
                  {simMode === "live" ? (
                    <>
                      <BarChart3 className="h-8 w-8 text-muted-foreground/20 mb-3" />
                      <p className="text-sm font-medium text-foreground/80 mb-1">No trading data yet</p>
                      <p className="text-[12px] text-muted-foreground/50 text-center max-w-xs mb-4">
                        {hasTrades
                          ? "Select an account above to see your aggregated daily P&L."
                          : "Import trades to see your real trading sessions here."}
                      </p>
                      {!hasTrades && (
                        <button
                          onClick={() => setSimMode("simulate")}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm shadow-primary/20"
                        >
                          <FlaskConical className="h-3 w-3" />
                          Try simulation mode
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-8 w-8 text-muted-foreground/20 mb-3" />
                      <p className="text-sm font-medium text-foreground/80 mb-1">Simulate a scenario</p>
                      <p className="text-[12px] text-muted-foreground/50 text-center max-w-xs mb-4">
                        Add trading days manually or pick a preset below to see how your consistency score reacts.
                      </p>
                      <button
                        onClick={() => addDay()}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm shadow-primary/20"
                      >
                        <Plus className="h-3 w-3" />
                        Add your first day
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                  {activeDays.map((day, index) => (
                    <div
                      key={day.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-2.5 group transition-colors",
                        day.isReal ? "bg-background/30" : "bg-primary/5 border border-primary/10",
                      )}
                    >
                      <span className="text-[11px] font-bold text-muted-foreground/35 w-5 text-right">
                        {index + 1}.
                      </span>
                      {day.date && (
                        <span className="text-[10px] font-medium text-muted-foreground/40 w-12 shrink-0">
                          {formatDate(day.date)}
                        </span>
                      )}
                      {!day.date && (
                        <span className="text-[10px] font-medium text-muted-foreground/40 w-12 shrink-0">
                          Day {index + 1}
                        </span>
                      )}
                      {day.tradeCount !== undefined && day.isReal && (
                        <span className="text-[9px] font-medium text-muted-foreground/30 tabular-nums">
                          {day.tradeCount}t
                        </span>
                      )}
                      <div className="flex-1 flex items-center justify-end gap-2">
                        {day.pnl >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-success/50 shrink-0" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-destructive/50 shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm font-semibold tabular-nums text-right min-w-[80px]",
                          day.pnl >= 0 ? "text-success" : "text-destructive",
                        )}>
                          {day.pnl >= 0 ? "+" : ""}{formatCurrency(day.pnl)}
                        </span>
                        {simMode === "simulate" && (
                          <>
                            <input
                              type="number"
                              value={day.pnl}
                              onChange={e => updateDayPnl(day.id, parseFloat(e.target.value) || 0)}
                              className={cn(
                                "w-24 rounded-md bg-background/60 border border-border/20 px-2 py-1 text-right text-xs font-medium tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40",
                                day.pnl >= 0 ? "text-success" : "text-destructive",
                              )}
                            />
                            <button
                              onClick={() => removeDay(day.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all text-[10px]"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className={cn(
                "rounded-xl p-3 sm:p-4 border flex items-start gap-3 transition-all duration-300",
                consistencyBreached
                  ? "bg-destructive/5 border-destructive/20"
                  : isWarning
                    ? "bg-semantic-warning/5 border-semantic-warning/20"
                    : isPassing
                      ? "bg-success/5 border-success/20"
                      : "bg-muted/30 border-border/15",
              )}>
                {consistencyBreached ? (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                ) : isPassing ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-semantic-warning shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[12px] font-bold",
                    consistencyBreached ? "text-destructive" : isPassing ? "text-success" : "text-semantic-warning",
                  )}>
                    {consistencyBreached ? "BREACHED" : isPassing ? "PASSING" : activeDays.length > 0 ? "WARNING" : "AWAITING DATA"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-relaxed">
                    {consistencyBreached
                      ? `Best day (${formatCurrency(bestDay)}) exceeds ${consistencyPct}% of profit target.`
                      : isPassing
                        ? `Best day (${formatCurrency(bestDay)}) within the ${consistencyPct}% threshold — score ${consistencyScore.toFixed(0)}%.`
                        : activeDays.length > 0
                          ? `Score ${consistencyScore.toFixed(0)}% — keep adding profitable days.`
                          : "Add trading days to calculate your consistency score."}
                  </p>
                </div>
              </div>

              <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                <div className="flex items-center justify-between mb-1">
                  <p className={unifiedInfoLabelClassName}>Limit</p>
                  {selectedAccount?.propfirm && (
                    <span className="text-[9px] font-medium text-muted-foreground/40">{selectedAccount.propfirm}</span>
                  )}
                </div>
                <p className="text-2xl font-black text-foreground mt-1">{consistencyPct}%</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-foreground/70">SCORE</span>
                    <span className="text-[10px] text-muted-foreground/50">Best day / Profit base</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted/40 overflow-hidden">
                    <div
                      className="absolute inset-y-0 w-px bg-foreground/30 z-10"
                      style={{ left: `${Math.min(100, consistencyPct)}%` }}
                    />
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                        consistencyBreached ? "bg-destructive" : isWarning ? "bg-semantic-warning" : "bg-primary",
                      )}
                      style={{ width: `${Math.min(100, consistencyScore)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={cn("text-[10px] font-bold tabular-nums", consistencyBreached ? "text-destructive" : "text-muted-foreground/50")}>
                      {consistencyScore}%
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground/50">{consistencyPct}% limit</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                  <p className={unifiedInfoLabelClassName}>Balance</p>
                  <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                    {formatCurrency(currentBalance)}
                  </p>
                  <p className={cn("text-[10px] tabular-nums mt-0.5", totalPnl >= 0 ? "text-success/70" : "text-destructive/70")}>
                    {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                  </p>
                </div>
                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                  <p className={unifiedInfoLabelClassName}>Total Profit</p>
                  <div className={cn("text-base sm:text-lg font-black tabular-nums mt-1", totalPnl >= 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(totalPnl)}
                  </div>
                  <p className="text-[10px] text-muted-foreground/40 tabular-nums mt-0.5">
                    Target {formatCurrency(effectiveProfitTarget)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                  <p className={unifiedInfoLabelClassName}>Best Day</p>
                  <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                    {activeDays.length > 0 ? formatCurrency(bestDay) : "\u2014"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                    {winningDays > 0 ? `${winningDays} winning days` : "No wins yet"}
                  </p>
                </div>
                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                  <p className={unifiedInfoLabelClassName}>Max Allowed</p>
                  <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                    {formatCurrency(maxAllowedDaily)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                    {consistencyPct}% of target
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className={cn(unifiedSectionPanelClassName, "p-2.5 text-center")}>
                  <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Win Rate</p>
                  <p className="text-base font-black text-foreground tabular-nums mt-0.5">{winRate.toFixed(0)}%</p>
                </div>
                <div className={cn(unifiedSectionPanelClassName, "p-2.5 text-center")}>
                  <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Avg Day</p>
                  <p className={cn("text-base font-black tabular-nums mt-0.5", avgDay >= 0 ? "text-foreground" : "text-destructive")}>
                    {formatCurrency(avgDay)}
                  </p>
                </div>
                <div className={cn(unifiedSectionPanelClassName, "p-2.5 text-center")}>
                  <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Worst</p>
                  <p className="text-base font-black text-destructive tabular-nums mt-0.5">{formatCurrency(worstDay)}</p>
                </div>
              </div>

              <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
                    What This Means
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground/60">
                  {simMode === "live"
                    ? <>Your <span className="font-semibold text-foreground/80">{activeDays.length} real trading days</span> are evaluated against the{" "}
                      <span className="font-semibold text-foreground/80">{consistencyPct}%</span> rule. Best day ({formatCurrency(bestDay)}) must not exceed{" "}
                      {consistencyPct}% of profit base ({formatCurrency(Math.max(totalProfit, effectiveProfitTarget))}).</>
                    : <>Simulate scenarios to test how the{" "}
                      <span className="font-semibold text-foreground/80">{consistencyPct}%</span> consistency rule reacts to different P&amp;L patterns. Use the presets below to quickly load common scenarios.</>}
                </p>
              </div>
            </div>
          </div>

          {(simMode === "simulate" || !hasTrades) && (
            <div className="flex items-start gap-2 pt-2">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
                    Try A Preset
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">Scaled to {formatCurrency(effectiveStartingBalance)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground/40 mb-3">Each scenario auto-scales to your selected account size. Click to load it.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                  {PRESETS.map(preset => {
                    const days = presetToDays(preset, effectiveStartingBalance)
                    const presetProfit = days.reduce((s, d) => s + d.pnl, 0)
                    const presetBest = Math.max(...days.map(d => d.pnl))
                    const presetScore = presetProfit > 0 ? Math.min(100, Math.round((presetBest / presetProfit) * 100)) : 0
                    const wouldBreach = presetScore > consistencyPct
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group rounded-xl p-3 sm:p-4 text-left transition-all duration-200 border bg-card/30 border-border/20 hover:border-primary/20 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="flex items-end gap-0.5 h-8 mb-3">
                          {days.slice(0, 8).map((day, i) => {
                            const maxAbs = Math.max(...days.map(d => Math.abs(d.pnl)), 1)
                            const height = Math.max(2, (Math.abs(day.pnl) / maxAbs) * 32)
                            const isPositive = day.pnl >= 0
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "flex-1 rounded-sm min-w-[3px] transition-all",
                                  isPositive ? "bg-success/40 group-hover:bg-success/60" : "bg-destructive/40 group-hover:bg-destructive/60",
                                )}
                                style={{ height }}
                              />
                            )
                          })}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-bold text-foreground/90">{preset.name}</p>
                          {wouldBreach ? (
                            <XCircle className="h-3 w-3 text-destructive/50 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-success/50 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 line-clamp-2 mt-1 leading-relaxed">
                          {preset.description}
                        </p>
                        <p className={cn("text-[9px] font-medium mt-1.5 tabular-nums", wouldBreach ? "text-destructive/70" : "text-success/70")}>
                          Score: {presetScore}% {wouldBreach ? "(breach)" : "(pass)"}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "drawdown" && (
        <div key="dd" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Equity Curve</span>
              </div>
              {activeDays.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <svg
                    viewBox={`0 0 ${Math.max(activeDays.length * 40, 400)} 192`}
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {[0, 1, 2, 3, 4].map(i => (
                      <line key={i} x1="0" y1={i * 48} x2={Math.max(activeDays.length * 40, 400)} y2={i * 48} stroke="var(--border)" strokeOpacity="0.3" strokeWidth="0.5" />
                    ))}
                    {equityCurve.length > 1 && (
                      <>
                        <line
                          x1="0"
                          y1={192 - ((effectiveStartingBalance - drawdownLimit - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          x2={Math.max(activeDays.length * 40, 400)}
                          y2={192 - ((effectiveStartingBalance - drawdownLimit - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          stroke="var(--destructive)"
                          strokeOpacity="0.4"
                          strokeWidth="1"
                          strokeDasharray="6 3"
                        />
                        <line
                          x1="0"
                          y1={192 - ((effectiveStartingBalance - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          x2={Math.max(activeDays.length * 40, 400)}
                          y2={192 - ((effectiveStartingBalance - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          stroke="var(--border)"
                          strokeOpacity="0.2"
                          strokeWidth="1"
                          strokeDasharray="2 4"
                        />
                        <line
                          x1="0"
                          y1={192 - ((effectiveStartingBalance - drawdownLimit - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          x2={Math.max(activeDays.length * 40, 400)}
                          y2={192 - ((effectiveStartingBalance - drawdownLimit - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}
                          stroke="var(--destructive)"
                          strokeOpacity="0.4"
                          strokeWidth="1"
                          strokeDasharray="6 3"
                        />
                        <polyline
                          points={equityCurve.map((b, i) => `${(i / Math.max(equityCurve.length - 1, 1)) * Math.max(activeDays.length * 40, 400)},${192 - ((b - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}`).join(" ")}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={peakBalances.map((b, i) => `${(i / Math.max(peakBalances.length - 1, 1)) * Math.max(activeDays.length * 40, 400)},${192 - ((b - equityBounds.min) / (equityBounds.max - equityBounds.min)) * 192}`).join(" ")}
                          fill="none"
                          stroke="var(--success)"
                          strokeWidth="1"
                          strokeOpacity="0.4"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-border/20">
                  <p className="text-[11px] text-muted-foreground/40">No trading data yet</p>
                </div>
              )}
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Daily P&L</span>
              </div>
              {activeDays.length > 0 ? (
                <div className="flex items-end gap-0.5 h-20">
                  {(() => {
                    const maxAbs = Math.max(...activeDays.map(d => Math.abs(d.pnl)), 1)
                    return activeDays.map((day, i) => {
                      const height = Math.max((Math.abs(day.pnl) / maxAbs) * 72, 2)
                      return (
                        <div
                          key={day.id}
                          className={cn(
                            "flex-1 rounded-t transition-all duration-200 hover:opacity-80",
                            day.pnl >= 0 ? "bg-emerald-500/50" : "bg-destructive/50",
                          )}
                          style={{ height }}
                          title={`Day ${i + 1}: ${formatCurrency(day.pnl)}`}
                        />
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border/20">
                  <p className="text-[11px] text-muted-foreground/40">No trading data yet</p>
                </div>
              )}
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Day Details</span>
              </div>
              {dayDrawdowns.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {dayDrawdowns.map(dd => (
                    <div key={dd.day} className="flex items-center justify-between px-2 py-1.5 rounded text-xs hover:bg-muted/10">
                      <span className="text-muted-foreground/60 w-6 tabular-nums">#{dd.day}</span>
                      <span className={cn("font-bold tabular-nums flex-1", (dd.balance - effectiveStartingBalance) >= 0 ? "text-emerald-500" : "text-destructive")}>
                        {formatCurrency(dd.balance)}
                      </span>
                      <span className={cn("font-bold tabular-nums w-20 text-right", dd.drawdown > 0 ? "text-destructive" : "text-muted-foreground/40")}>
                        {dd.drawdown > 0 ? `-${formatCurrency(dd.drawdown)}` : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border/20">
                  <p className="text-[11px] text-muted-foreground/40">No day details</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Drawdown</span>
              </div>
              <div className="text-center py-3">
                <div className={cn("text-3xl font-black tabular-nums", drawdownBreached ? "text-destructive" : "text-amber-500")}>
                  {formatCurrency(maxDrawdown)}
                </div>
                <div className="text-xs text-muted-foreground/60 mt-1">
                  {maxDrawdownPct.toFixed(1)}% of {formatCurrency(effectiveStartingBalance)}
                </div>
              </div>
              <Progress
                value={drawdownLimit > 0 ? (maxDrawdown / drawdownLimit) * 100 : 0}
                className="h-2 bg-muted/40"
                indicatorClassName={drawdownBreached ? "bg-destructive" : maxDrawdown > drawdownLimit * 0.75 ? "bg-amber-500" : "bg-emerald-500"}
              />
              <div className={cn("text-[10px] font-semibold mt-2", drawdownBreached ? "text-destructive" : "text-muted-foreground/60")}>
                {drawdownBreached ? "DRAWDOWN BREACHED" : `${formatCurrency(drawdownLimit - maxDrawdown)} remaining until breach`}
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Metrics</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Peak</div>
                    <div className="text-sm font-bold tabular-nums text-emerald-500">
                      {equityCurve.length > 0 ? formatCurrency(Math.max(...equityCurve)) : "\u2014"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Current</div>
                    <div className={cn("text-sm font-bold tabular-nums", equityCurve.length > 0 && (equityCurve[equityCurve.length - 1] ?? 0) >= effectiveStartingBalance ? "text-emerald-500" : "text-destructive")}>
                      {equityCurve.length > 0 ? formatCurrency(equityCurve[equityCurve.length - 1]!) : "\u2014"}
                    </div>
                  </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Max Consec Losses</div>
                  <div className="text-sm font-bold tabular-nums text-destructive">{maxConsecutiveLosses}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Total P&L</div>
                  <div className={cn("text-sm font-bold tabular-nums", totalPnl >= 0 ? "text-emerald-500" : "text-destructive")}>
                    {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">Drawdown Types</span>
              </div>
              <div className="text-[12px] leading-relaxed text-muted-foreground/60 space-y-2">
                <p><strong className="text-foreground/80">Static:</strong> Measured from starting balance. Most forgiving.</p>
                <p><strong className="text-foreground/80">Trailing EOD:</strong> Measured from highest daily close. Stricter.</p>
                <p><strong className="text-foreground/80">Trailing Intraday:</strong> Measured from highest intraday equity. Strictest.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export { ConsistencySimulator }

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return dateStr
  }
}

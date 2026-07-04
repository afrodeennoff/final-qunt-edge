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
  Target,
  Percent,
  Gauge,
  Shield,
  Sliders,
  Repeat,
  DollarSign,
  Trophy,
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
import { kellyCriterion, halfKelly, expectancy, riskOfRuin, sharpeRatio, profitFactor } from "@/lib/trading-metrics"
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
  BarChart,
  Bar,
  Cell,
} from "recharts"

type SimTab = "monte_carlo" | "consistency" | "drawdown"
type ProgramType = "nitro" | "nitro_x" | "instant_standard" | "instant_pro" | "instant_plus" | "custom"

interface TradingDay {
  id: string
  pnl: number
  date?: string
  isReal: boolean
  tradeCount?: number
}

interface ResultsCache {
  inputs: string
  result: MonteCarloResult
}

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 150000]

const POPULAR_FIRMS = listPopularFirms()

const PROGRAMS: Record<ProgramType, { label: string; limit: number }> = {
  nitro: { label: "NITRO", limit: 50 },
  nitro_x: { label: "NITRO X", limit: 25 },
  instant_standard: { label: "INSTANT STANDARD", limit: 15 },
  instant_pro: { label: "INSTANT PRO", limit: 15 },
  instant_plus: { label: "INSTANT PLUS", limit: 15 },
  custom: { label: "CUSTOM", limit: 30 },
}

const SCENARIO_PRESETS = [
  { id: "steady", name: "Steady Grind", desc: "Small consistent wins", days: [280, 195, 340, 220, 265] },
  { id: "lucky", name: "One Big Day", desc: "One outsized day breaches", days: [85, -120, 2100, 45, -70] },
  { id: "roller", name: "Rollercoaster", desc: "Sharp wins and losses", days: [890, -650, 1120, -430, 760, -310] },
  { id: "pass", name: "Challenge Pass", desc: "~14% score, passes all", days: [420, 380, 510, 355, 475, 390, 440] },
  { id: "funded", name: "Funded Month", desc: "20 days, one best session", days: [350, 420, 280, 510, 390, 340, 460, 380, 410, 320, 360, 440, 1850, 350, 380, 420, 390, 370, 400, 360] },
]

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

function PassRateCurve({ result }: { result: MonteCarloResult }) {
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
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramType>("custom")
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

  const effectiveConsistencyPct = React.useMemo(() => {
    if (selectedProgram !== "custom") return PROGRAMS[selectedProgram].limit
    return consistencyPct
  }, [selectedProgram, consistencyPct])

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
  const totalLoss = React.useMemo(() => activeDays.reduce((sum, d) => sum + Math.min(d.pnl, 0), 0), [activeDays])
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
    return Math.max(0, Math.min(100, pct))
  }, [bestDay, totalProfit])

  const maxAllowedDaily = React.useMemo(() => {
    const base = totalProfit > 0 ? totalProfit : effectiveProfitTarget
    return base * (effectiveConsistencyPct / 100)
  }, [totalProfit, effectiveProfitTarget, effectiveConsistencyPct])

  const consistencyBreached = consistencyScore > effectiveConsistencyPct

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

  const drawdownBreached = React.useMemo(() => {
    if (effectiveProfitTarget <= 0) return false
    return maxDrawdown > effectiveProfitTarget
  }, [maxDrawdown, effectiveProfitTarget])

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Wallet className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Program Type</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(Object.entries(PROGRAMS) as [ProgramType, { label: string; limit: number }][]).map(([key, prog]) => (
                      <button
                        key={key}
                        onClick={() => { setSelectedProgram(key); if (key !== "custom") setConsistencyPct(prog.limit) }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
                          selectedProgram === key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50",
                        )}
                      >
                        {prog.label} {key !== "custom" && `(${prog.limit}%)`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Account</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {accounts.slice(0, 6).map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => { setUserSelectedAccountId(acc.id); setUserSelectedSize(null); clearSimulated() }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
                          selectedAccountId === acc.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50",
                        )}
                      >
                        {acc.propfirm || acc.accountSizeName || acc.number}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Account Size</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {ACCOUNT_SIZES.map(size => (
                      <button
                        key={size}
                        onClick={() => selectSize(size)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
                          userSelectedSize === size
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {formatSizeLabel(size)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/60 font-bold">$</span>
                    <input
                      type="number"
                      value={customBalance}
                      onChange={e => { setCustomBalance(e.target.value); setUserSelectedSize(null) }}
                      placeholder={formatSizeLabel(effectiveStartingBalance)}
                      className="w-full bg-muted/20 border border-border/20 rounded-lg pl-6 pr-2.5 py-1 text-xs font-bold tabular-nums focus:outline-none focus:border-primary/40"
                      min={100}
                      step={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Consistency Rule</label>
                  <div className="mt-1 space-y-2">
                    <input
                      type="range"
                      value={selectedProgram !== "custom" ? PROGRAMS[selectedProgram].limit : consistencyPct}
                      onChange={e => { setConsistencyPct(parseInt(e.target.value)); setSelectedProgram("custom") }}
                      min={5} max={100} step={1}
                      disabled={selectedProgram !== "custom"}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted/40 accent-primary disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/60">
                      <span>{selectedProgram !== "custom" ? PROGRAMS[selectedProgram].label : "Custom"}: {effectiveConsistencyPct}%</span>
                      <span>Max: {effectiveConsistencyPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center justify-between gap-2 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Trading Sessions {activeDays.length > 0 && <span className="text-muted-foreground/60">({activeDays.length})</span>}</span>
                </div>
                <div className="flex bg-muted/30 border border-border/20 rounded-lg p-0.5">
                  <button
                    onClick={() => setSimMode("live")}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors",
                      simMode === "live" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground",
                    )}
                  >
                    Live Data
                  </button>
                  <button
                    onClick={() => setSimMode("simulate")}
                    className={cn(
                      "px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors",
                      simMode === "simulate" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/60 hover:text-foreground",
                    )}
                  >
                    Simulate
                  </button>
                </div>
              </div>

              {activeDays.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground/40">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No trading sessions yet</p>
                  <p className="text-[10px] mt-1">Select an account with trades or switch to Simulate mode</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                  {activeDays.map((day, i) => (
                    <div key={day.id} className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs",
                      day.isReal ? "bg-muted/10" : "bg-muted/20 border border-dashed border-border/20",
                    )}>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground/60 w-5 text-right tabular-nums">{i + 1}</span>
                        {day.date && <span className="text-muted-foreground/40 text-[10px]">{formatDate(day.date)}</span>}
                        {day.tradeCount && <span className="text-muted-foreground/30 text-[10px]">({day.tradeCount})</span>}
                      </div>
                      <div className={cn("font-bold tabular-nums", day.pnl >= 0 ? "text-emerald-500" : "text-destructive")}>
                        {day.pnl >= 0 ? "+" : ""}{formatCurrency(day.pnl)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {simMode === "simulate" && (
                <>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setManualDays(prev => [...prev, { id: `manual-${Date.now()}`, pnl: 0, isReal: false }])}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-muted/30 border border-border/20 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Day
                    </button>
                    {manualDays.length > 0 && (
                      <button
                        onClick={clearSimulated}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/10">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Try Presets</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {SCENARIO_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setActivePreset({ id: preset.id, name: preset.name, description: preset.desc, ratios: preset.days.map(d => d / effectiveStartingBalance) })
                            setManualDays(preset.days.map((pnl, i) => ({ id: `preset-${preset.id}-${i}`, pnl, isReal: false })))
                          }}
                          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-border/20 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                        >
                          <div className="text-[11px] font-bold">{preset.name}</div>
                          <div className="text-[9px] text-muted-foreground/60 mt-0.5">{preset.desc}</div>
                          <div className="text-[9px] text-muted-foreground/40 mt-0.5">{preset.days.length} sessions</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Target className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Consistency Score</span>
              </div>
              <div className="text-center py-3">
                <div className={cn("text-3xl font-black tabular-nums", consistencyBreached ? "text-destructive" : "text-emerald-500")}>
                  {consistencyScore.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground/60 mt-1">
                  {consistencyBreached ? "BREACHED" : `Limit: ${effectiveConsistencyPct}%`}
                </div>
              </div>
              <Progress
                value={Math.min(consistencyScore, 100)}
                className="h-2 bg-muted/40"
                indicatorClassName={cn(consistencyBreached ? "bg-destructive" : "bg-emerald-500")}
              />
              <div className="text-[10px] text-muted-foreground/60 mt-2">
                Best day: {formatCurrency(bestDay)} / Total profit: {formatCurrency(totalProfit)}
                <br />
                Max allowed per day: {formatCurrency(maxAllowedDaily)}
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Day Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Win Rate</div>
                  <div className="text-sm font-bold tabular-nums">{(dayWinRate * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Avg Day</div>
                  <div className={cn("text-sm font-bold tabular-nums", avgDay >= 0 ? "text-emerald-500" : "text-destructive")}>
                    {avgDay >= 0 ? "+" : ""}{formatCurrency(avgDay)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Best Day</div>
                  <div className="text-sm font-bold tabular-nums text-emerald-500">{formatCurrency(bestDay)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Worst Day</div>
                  <div className="text-sm font-bold tabular-nums text-destructive">{formatCurrency(worstDay)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Winning Days</div>
                  <div className="text-sm font-bold tabular-nums text-emerald-500">{winningDays}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Losing Days</div>
                  <div className="text-sm font-bold tabular-nums text-destructive">{losingDays}</div>
                </div>
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">Consistency Rule</span>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground/60">
                Most prop firms require no single day exceeds {effectiveConsistencyPct}% of total profit.
                Best day is {formatCurrency(bestDay)} of {formatCurrency(totalProfit)} total.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "drawdown" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Equity Curve</span>
              </div>
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
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Daily P&L</span>
              </div>
              <div className="flex items-end gap-0.5 h-20">
                {activeDays.map((day, i) => {
                  const maxAbs = Math.max(...activeDays.map(d => Math.abs(d.pnl)), 1)
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
                })}
              </div>
            </div>

            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">Day Details</span>
              </div>
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
                value={effectiveProfitTarget > 0 ? (maxDrawdown / effectiveProfitTarget) * 100 : 0}
                className="h-2 bg-muted/40"
                indicatorClassName={drawdownBreached ? "bg-destructive" : maxDrawdown > effectiveProfitTarget * 0.75 ? "bg-amber-500" : "bg-emerald-500"}
              />
              <div className={cn("text-[10px] font-semibold mt-2", drawdownBreached ? "text-destructive" : "text-muted-foreground/60")}>
                {drawdownBreached ? "DRAWDOWN BREACHED" : `${formatCurrency(effectiveProfitTarget - maxDrawdown)} remaining until breach`}
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
                    {equityCurve.length > 0 ? formatCurrency(Math.max(...equityCurve)) : formatCurrency(effectiveStartingBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Current</div>
                  <div className={cn("text-sm font-bold tabular-nums", (equityCurve[equityCurve.length - 1] || 0) >= effectiveStartingBalance ? "text-emerald-500" : "text-destructive")}>
                    {equityCurve.length > 0 ? formatCurrency(equityCurve[equityCurve.length - 1]) : formatCurrency(effectiveStartingBalance)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Max Consec Losses</div>
                  <div className="text-sm font-bold tabular-nums text-destructive">{maxConsecutiveLosses}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">Total P&L</div>
                  <div className={cn("text-sm font-bold tabular-nums", activeDays.reduce((s, d) => s + d.pnl, 0) >= 0 ? "text-emerald-500" : "text-destructive")}>
                    {activeDays.reduce((s, d) => s + d.pnl, 0) >= 0 ? "+" : ""}{formatCurrency(activeDays.reduce((s, d) => s + d.pnl, 0))}
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

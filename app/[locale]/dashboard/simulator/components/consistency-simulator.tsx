"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    FlaskConical,
    Plus,
    CalendarDays,
    Sparkles,
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
} from "lucide-react"
import { unifiedSectionPanelClassName, unifiedInfoLabelClassName } from "@/components/layout/unified-page-recipes"
import { Progress } from "@/components/ui/progress"
import { useDataTradeItems, useDataAccountsList } from "@/context/providers/data-state-provider"
import type { Trade } from "@/lib/data-types"
import { toValidDate } from "@/lib/date-utils"

type PhaseType = "phase_1" | "funded"
type SimMode = "live" | "simulate"

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

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 150000]

function formatSizeLabel(value: number): string {
    if (value >= 1000) {
        const k = value / 1000
        return Number.isInteger(k) ? `$${k}K` : `$${k}K`
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

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
        return dateStr
    }
}

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
        description: "One outsized day, quiet rest — the classic breach.",
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

function aggregateTradesByDay(trades: Trade[], accountNumber?: string): TradingDay[] {
    const filtered = accountNumber ? trades.filter(t => t.accountNumber === accountNumber) : trades
    const dayMap = new Map<string, { pnl: number; count: number }>()

    for (const trade of filtered) {
        const entryDate = toValidDate(trade.entryDate)
        if (!entryDate) continue
        const key = entryDate.toISOString().split("T")[0]
        const existing = dayMap.get(key) || { pnl: 0, count: 0 }
        const netPnl = (trade.pnl || 0) - (trade.commission || 0)
        dayMap.set(key, { pnl: existing.pnl + netPnl, count: existing.count + 1 })
    }

    return Array.from(dayMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data], idx) => ({
            id: `real_${date}_${idx}`,
            pnl: Math.round(data.pnl * 100) / 100,
            date,
            isReal: true as const,
            tradeCount: data.count,
        }))
}

export function ConsistencySimulator() {
    const rawTrades = useDataTradeItems()
    const accounts = useDataAccountsList()

    const [activeTab, setActiveTab] = React.useState<"consistency" | "drawdown">("consistency")
    const [simMode, setSimMode] = React.useState<SimMode>("live")
    const [userSelectedAccountId, setUserSelectedAccountId] = React.useState<string | null>(null)
    const [consistencyPct, setConsistencyPct] = React.useState<number>(30)
    const [customSize, setCustomSize] = React.useState<string>("50000")
    const [useCustomSize, setUseCustomSize] = React.useState<boolean>(false)
    const [phase, setPhase] = React.useState<PhaseType>("phase_1")
    const [simulatedDays, setSimulatedDays] = React.useState<TradingDay[]>([])

    const hasAccounts = accounts.length > 0
    const hasTrades = rawTrades.length > 0

    const selectedAccountId = userSelectedAccountId
        ?? (accounts.length > 0 ? (accounts[0].id || accounts[0].number) : "all")

    const selectedAccount = React.useMemo(() => {
        if (selectedAccountId === "all") return null
        return accounts.find(a => a.id === selectedAccountId) || accounts.find(a => a.number === selectedAccountId) || null
    }, [selectedAccountId, accounts])

    const accountDefaultSize = React.useMemo(() => {
        if (selectedAccount?.startingBalance && selectedAccount.startingBalance > 0) {
            return selectedAccount.startingBalance
        }
        if (selectedAccount?.accountSizeName) {
            const sizeMap: Record<string, number> = { "5k": 5000, "10k": 10000, "20k": 20000, "25k": 25000, "50k": 50000, "100k": 100000, "150k": 150000, "200k": 200000, "300k": 300000 }
            return sizeMap[selectedAccount.accountSizeName.toLowerCase()] || 50000
        }
        return 50000
    }, [selectedAccount])

    const effectiveStartingBalance = useCustomSize
        ? Math.max(100, Number(customSize) || accountDefaultSize)
        : accountDefaultSize

    const effectiveProfitTarget = React.useMemo(() => {
        if (selectedAccount?.profitTarget && selectedAccount.profitTarget > 0 && !useCustomSize) {
            return Number(selectedAccount.profitTarget)
        }
        return effectiveStartingBalance * 0.1
    }, [selectedAccount, effectiveStartingBalance, useCustomSize])

    const accountConsistencyPct = selectedAccount?.consistencyPercentage
        ? Number(selectedAccount.consistencyPercentage)
        : null

    const realTradingDays = React.useMemo(() => {
        if (!hasTrades) return []
        const accNum = selectedAccountId === "all" ? undefined : (selectedAccount?.number || selectedAccountId)
        return aggregateTradesByDay(rawTrades, accNum)
    }, [rawTrades, selectedAccountId, selectedAccount, hasTrades])

    const activeDays = simMode === "live" ? realTradingDays : simulatedDays

    const totalProfit = React.useMemo(() => activeDays.reduce((sum, d) => sum + d.pnl, 0), [activeDays])
    const currentBalance = effectiveStartingBalance + totalProfit
    const bestDay = activeDays.length > 0 ? Math.max(...activeDays.map(d => d.pnl)) : 0
    const worstDay = activeDays.length > 0 ? Math.min(...activeDays.map(d => d.pnl)) : 0
    const avgDay = activeDays.length > 0 ? totalProfit / activeDays.length : 0
    const winningDays = activeDays.filter(d => d.pnl > 0).length
    const losingDays = activeDays.filter(d => d.pnl < 0).length
    const winRate = activeDays.length > 0 ? (winningDays / activeDays.length) * 100 : 0

    const consistencyScore = React.useMemo(() => {
        if (activeDays.length === 0) return 0
        if (totalProfit <= 0) return 0
        const profitBase = Math.max(totalProfit, effectiveProfitTarget)
        return Math.min(100, Math.round((bestDay / profitBase) * 100))
    }, [activeDays, totalProfit, bestDay, effectiveProfitTarget])

    const maxAllowedDaily = React.useMemo(() => {
        const profitBase = Math.max(totalProfit, effectiveProfitTarget)
        return (consistencyPct / 100) * profitBase
    }, [totalProfit, effectiveProfitTarget, consistencyPct])

    const isBreached = consistencyScore > consistencyPct
    const isWarning = consistencyScore > consistencyPct * 0.8 && !isBreached
    const isPassing = !isBreached && totalProfit > 0

    const maxDrawdown = React.useMemo(() => {
        if (activeDays.length === 0) return 0
        let peak = effectiveStartingBalance
        let maxDD = 0
        let running = effectiveStartingBalance
        for (const day of activeDays) {
            running += day.pnl
            if (running > peak) peak = running
            const dd = peak - running
            if (dd > maxDD) maxDD = dd
        }
        return maxDD
    }, [activeDays, effectiveStartingBalance])

    const maxDrawdownPct = effectiveStartingBalance > 0 ? (maxDrawdown / effectiveStartingBalance) * 100 : 0
    const dailyLossLimit = selectedAccount?.dailyLoss && !useCustomSize ? Number(selectedAccount.dailyLoss) : effectiveStartingBalance * 0.05
    const drawdownThreshold = selectedAccount?.drawdownThreshold && !useCustomSize ? Number(selectedAccount.drawdownThreshold) : effectiveStartingBalance * 0.1
    const ddUsedPct = drawdownThreshold > 0 ? (maxDrawdown / drawdownThreshold) * 100 : 0
    const remainingLoss = Math.max(0, drawdownThreshold - maxDrawdown)
    const isDrawdownBreached = maxDrawdown >= drawdownThreshold
    const ddRemainingIsSafe = remainingLoss > drawdownThreshold * 0.5
    const ddRemainingIsWarning = remainingLoss > drawdownThreshold * 0.2 && !ddRemainingIsSafe

    const maxConsecutiveLosses = React.useMemo(() => {
        if (activeDays.length === 0) return 0
        let maxStreak = 0
        let currentStreak = 0
        for (const day of activeDays) {
            if (day.pnl < 0) {
                currentStreak++
                maxStreak = Math.max(maxStreak, currentStreak)
            } else {
                currentStreak = 0
            }
        }
        return maxStreak
    }, [activeDays])

    function addDay(pnl?: number) {
        setSimulatedDays(prev => [...prev, {
            id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            pnl: pnl ?? 0,
            isReal: false,
        }])
    }

    function removeDay(id: string) {
        setSimulatedDays(prev => prev.filter(d => d.id !== id))
    }

    function updateDayPnl(id: string, pnl: number) {
        setSimulatedDays(prev => prev.map(d => (d.id === id ? { ...d, pnl } : d)))
    }

    function applyPreset(preset: Preset) {
        setSimMode("simulate")
        setSimulatedDays(presetToDays(preset, effectiveStartingBalance))
    }

    function clearSimulated() {
        setSimulatedDays([])
    }

    function selectSize(size: number) {
        setUseCustomSize(false)
        setCustomSize(String(size))
    }

    return (
        <div className="flex flex-col gap-4 sm:gap-6">
            {/* Tabs */}
            <div className="flex gap-6 border-b border-border/40 pb-3">
                <button
                    onClick={() => setActiveTab("consistency")}
                    className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors pb-1 border-b-2",
                        activeTab === "consistency"
                            ? "text-foreground border-primary"
                            : "text-muted-foreground/60 border-transparent hover:text-muted-foreground"
                    )}
                >
                    Consistency
                </button>
                <button
                    onClick={() => setActiveTab("drawdown")}
                    className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors pb-1 border-b-2",
                        activeTab === "drawdown"
                            ? "text-foreground border-primary"
                            : "text-muted-foreground/60 border-transparent hover:text-muted-foreground"
                    )}
                >
                    Drawdown
                </button>
            </div>

            {activeTab === "consistency" && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                                Consistency Simulator
                            </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground/60 sm:text-right">
                            {hasAccounts
                                ? "Using your real account data. Switch to simulate mode to test scenarios."
                                : "Add an account and trades to see live consistency feedback."}
                        </p>
                    </div>

                    {/* Config Row */}
                    <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5")}>
                        {/* Account Selector */}
                        <div>
                            <div className="mb-3">
                                <p className={unifiedInfoLabelClassName}>Account</p>
                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">Select account or view all</p>
                            </div>
                            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                                <button
                                    onClick={() => { setUserSelectedAccountId("all"); setSimMode("live"); setSimulatedDays([]) }}
                                    className={cn(
                                        "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                                        selectedAccountId === "all"
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <span>All Accounts</span>
                                    {hasTrades && <span className="text-[10px] tabular-nums opacity-60">{rawTrades.length} trades</span>}
                                </button>
                                {accounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        onClick={() => { setUserSelectedAccountId(acc.id || acc.number); setSimMode("live"); setSimulatedDays([]); setUseCustomSize(false) }}
                                        className={cn(
                                            "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                                            selectedAccountId === (acc.id || acc.number)
                                                ? "bg-primary/10 text-primary border-primary/30"
                                                : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Wallet className="h-3 w-3 shrink-0 opacity-50" />
                                            <span className="truncate">{acc.propfirm || acc.number}</span>
                                            {acc.accountSizeName && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 shrink-0">{acc.accountSizeName}</span>
                                            )}
                                        </div>
                                        {acc.startingBalance > 0 && (
                                            <span className="text-[10px] tabular-nums opacity-60 shrink-0">{formatCurrency(acc.startingBalance)}</span>
                                        )}
                                    </button>
                                ))}
                                {!hasAccounts && (
                                    <div className="rounded-lg px-3 py-3 text-center border border-dashed border-border/20">
                                        <p className="text-[11px] text-muted-foreground/40">No accounts found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Account Size */}
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
                                    const isActive = !useCustomSize && Number(customSize) === size
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => selectSize(size)}
                                            className={cn(
                                                "rounded-lg px-2 py-2 text-[11px] font-bold transition-all duration-200 border",
                                                isActive
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                                                    : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground"
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
                                    useCustomSize ? "border-primary/40 bg-primary/5" : "border-border/20 bg-muted/30"
                                )}>
                                    <span className="text-[11px] font-medium text-muted-foreground/60 shrink-0">Custom</span>
                                    <span className="text-muted-foreground/40">$</span>
                                    <input
                                        type="number"
                                        value={customSize}
                                        onFocus={() => setUseCustomSize(true)}
                                        onChange={e => { setUseCustomSize(true); setCustomSize(e.target.value) }}
                                        className="w-full bg-transparent text-[12px] font-semibold tabular-nums text-foreground focus:outline-none"
                                        placeholder="50000"
                                        min="100"
                                        step="100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consistency Rule — custom only */}
                        <div>
                            <div className="mb-3">
                                <p className={unifiedInfoLabelClassName}>Consistency Rule</p>
                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                    {selectedAccount?.propfirm
                                        ? `Custom — ${selectedAccount.propfirm} default`
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
                                        Your account uses {accountConsistencyPct}% — click to apply
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
                                                : "bg-muted/30 text-muted-foreground/70 border-border/20 hover:bg-muted/50"
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
                                                : "bg-muted/30 text-muted-foreground/70 border-border/20 hover:bg-muted/50"
                                        )}
                                    >
                                        Funded
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-1 w-fit border border-border/15">
                        <button
                            onClick={() => { setSimMode("live"); setSimulatedDays([]) }}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-200",
                                simMode === "live"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground/60 hover:text-foreground/80"
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
                                    : "text-muted-foreground/60 hover:text-foreground/80"
                            )}
                        >
                            <span className="flex items-center gap-1.5">
                                <FlaskConical className="h-3 w-3" />
                                Simulate
                            </span>
                        </button>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
                        {/* Trading Sessions */}
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
                                                day.isReal ? "bg-background/30" : "bg-primary/5 border border-primary/10"
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
                                                    day.pnl >= 0 ? "text-success" : "text-destructive"
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
                                                                day.pnl >= 0 ? "text-success" : "text-destructive"
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

                        {/* Right Sidebar Stats */}
                        <div className="space-y-3">
                            {/* Status Banner */}
                            <div className={cn(
                                "rounded-xl p-3 sm:p-4 border flex items-start gap-3",
                                isBreached
                                    ? "bg-destructive/5 border-destructive/20"
                                    : isWarning
                                        ? "bg-semantic-warning/5 border-semantic-warning/20"
                                        : isPassing
                                            ? "bg-success/5 border-success/20"
                                            : "bg-muted/30 border-border/15"
                            )}>
                                {isBreached ? (
                                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                ) : isPassing ? (
                                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-semantic-warning shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={cn(
                                        "text-[12px] font-bold",
                                        isBreached ? "text-destructive" : isPassing ? "text-success" : "text-semantic-warning"
                                    )}>
                                        {isBreached ? "BREACHED" : isPassing ? "PASSING" : activeDays.length > 0 ? "WARNING" : "AWAITING DATA"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-relaxed">
                                        {isBreached
                                            ? `Best day (${formatCurrency(bestDay)}) exceeds ${consistencyPct}% of profit target.`
                                            : isPassing
                                                ? `Your best day is within the ${consistencyPct}% threshold.`
                                                : activeDays.length > 0
                                                    ? "Add more profitable days to see your score."
                                                    : "Add trading days to calculate your consistency score."}
                                    </p>
                                </div>
                            </div>

                            {/* Limit & Score Panel */}
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
                                                isBreached ? "bg-destructive" : isWarning ? "bg-semantic-warning" : "bg-primary"
                                            )}
                                            style={{ width: `${Math.min(100, consistencyScore)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className={cn("text-[10px] font-bold tabular-nums", isBreached ? "text-destructive" : "text-muted-foreground/50")}>
                                            {consistencyScore}%
                                        </span>
                                        <span className="text-[10px] font-medium text-muted-foreground/50">{consistencyPct}% limit</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Balance</p>
                                    <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(currentBalance)}
                                    </p>
                                    <p className={cn("text-[10px] tabular-nums mt-0.5", totalProfit >= 0 ? "text-success/70" : "text-destructive/70")}>
                                        {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Total Profit</p>
                                    <p className={cn("text-base sm:text-lg font-black tabular-nums mt-1", totalProfit >= 0 ? "text-success" : "text-destructive")}>
                                        {formatCurrency(totalProfit)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 tabular-nums mt-0.5">
                                        Target {formatCurrency(effectiveProfitTarget)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Best Day</p>
                                    <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                                        {activeDays.length > 0 ? formatCurrency(bestDay) : "—"}
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
                                            {consistencyPct}% of profit ({formatCurrency(Math.max(totalProfit, effectiveProfitTarget))}).</>
                                        : <>Simulate scenarios to test how the{" "}
                                            <span className="font-semibold text-foreground/80">{consistencyPct}%</span> consistency rule reacts to different P&amp;L patterns.</>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Try A Preset */}
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
                                        const presetScore = presetProfit > 0 ? Math.round((presetBest / Math.max(presetProfit, effectiveProfitTarget)) * 100) : 0
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
                                                                    isPositive ? "bg-success/40 group-hover:bg-success/60" : "bg-destructive/40 group-hover:bg-destructive/60"
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
                </>
            )}

            {activeTab === "drawdown" && (
                <div className="flex flex-col gap-4 sm:gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingDown className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                                Drawdown Simulator
                            </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground/60 sm:text-right">
                            Track max drawdown, consecutive losses, and daily loss limits against your account rules.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
                        <div className={cn("xl:col-span-2", unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                                        Equity Curve &amp; Drawdown
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/50">{activeDays.length} days</span>
                                </div>
                            </div>

                            {activeDays.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border/20">
                                    <TrendingDown className="h-8 w-8 text-muted-foreground/20 mb-3" />
                                    <p className="text-sm font-medium text-foreground/80 mb-1">No data to analyze</p>
                                    <p className="text-[12px] text-muted-foreground/50 text-center max-w-xs">
                                        Switch to the Consistency tab and select an account with trading data.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative h-48 bg-background/30 rounded-lg overflow-hidden border border-border/10">
                                        <svg className="w-full h-full" viewBox={`0 0 ${Math.max(activeDays.length * 40, 400)} 192`} preserveAspectRatio="none">
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <line key={i} x1="0" y1={i * 48} x2="100%" y2={i * 48} stroke="currentColor" strokeWidth="0.5" className="text-border/20" />
                                            ))}
                                            {(() => {
                                                const values = getEquityCurve(activeDays, effectiveStartingBalance)
                                                const minVal = Math.min(effectiveStartingBalance, ...values) * 0.98
                                                const maxVal = Math.max(effectiveStartingBalance, ...values) * 1.02
                                                const range = maxVal - minVal || 1
                                                const zeroY = 192 - ((effectiveStartingBalance - minVal) / range) * 192
                                                return <line x1="0" y1={zeroY} x2="100%" y2={zeroY} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-muted-foreground/30" />
                                            })()}
                                            {(() => {
                                                const values = getEquityCurve(activeDays, effectiveStartingBalance)
                                                const minVal = Math.min(effectiveStartingBalance, ...values) * 0.98
                                                const maxVal = Math.max(effectiveStartingBalance, ...values) * 1.02
                                                const range = maxVal - minVal || 1
                                                const points = values.map((v, i) => {
                                                    const x = (i / Math.max(values.length - 1, 1)) * (values.length * 40)
                                                    const y = 192 - ((v - minVal) / range) * 192
                                                    return `${x},${y}`
                                                }).join(" ")
                                                return <polyline points={points} fill="none" stroke="url(#ddGradient)" strokeWidth="2" strokeLinejoin="round" />
                                            })()}
                                            {(() => {
                                                const values = getEquityCurve(activeDays, effectiveStartingBalance)
                                                const minVal = Math.min(effectiveStartingBalance, ...values) * 0.98
                                                const maxVal = Math.max(effectiveStartingBalance, ...values) * 1.02
                                                const range = maxVal - minVal || 1
                                                let peak = effectiveStartingBalance
                                                const peakPoints: string[] = []
                                                values.forEach((v, i) => {
                                                    const x = (i / Math.max(values.length - 1, 1)) * (values.length * 40)
                                                    if (v >= peak) {
                                                        peak = v
                                                        const y = 192 - ((peak - minVal) / range) * 192
                                                        peakPoints.push(`${x},${y}`)
                                                    }
                                                })
                                                if (peakPoints.length > 1) {
                                                    return <polyline points={peakPoints.join(" ")} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-success/40" />
                                                }
                                                return null
                                            })()}
                                            <defs>
                                                <linearGradient id="ddGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="currentColor" className="text-primary/60" />
                                                    <stop offset="100%" stopColor="currentColor" className="text-primary" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>

                                    <div className="flex items-end gap-1 h-20 px-1">
                                        {activeDays.map((day, i) => {
                                            const maxAbs = Math.max(...activeDays.map(d => Math.abs(d.pnl)), 1)
                                            const height = Math.max(2, (Math.abs(day.pnl) / maxAbs) * 72)
                                            const isPositive = day.pnl >= 0
                                            return (
                                                <div key={day.id} className="flex-1 flex flex-col items-center gap-0.5 min-w-[4px]">
                                                    <div
                                                        className={cn("w-full rounded-t-sm transition-all", isPositive ? "bg-success/50" : "bg-destructive/50")}
                                                        style={{ height }}
                                                        title={`${day.date || `Day ${i+1}`}: ${formatCurrency(day.pnl)}`}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                                        {activeDays.map((day, i) => {
                                            const equityValues = getEquityCurve(activeDays.slice(0, i + 1), effectiveStartingBalance)
                                            const peak = Math.max(effectiveStartingBalance, ...equityValues)
                                            const eqAfter = effectiveStartingBalance + activeDays.slice(0, i + 1).reduce((s, d) => s + d.pnl, 0)
                                            const ddFromPeak = Math.max(0, peak - eqAfter)
                                            return (
                                                <div key={day.id} className="flex items-center gap-2 rounded-md bg-background/30 px-2.5 py-1.5 text-[11px]">
                                                    <span className="text-muted-foreground/35 w-5 text-right font-mono">{i + 1}.</span>
                                                    {day.date && <span className="text-muted-foreground/40 w-12 shrink-0">{formatDate(day.date)}</span>}
                                                    <span className={cn("font-semibold tabular-nums w-20 text-right", day.pnl >= 0 ? "text-success" : "text-destructive")}>
                                                        {day.pnl >= 0 ? "+" : ""}{formatCurrency(day.pnl)}
                                                    </span>
                                                    <span className="tabular-nums text-muted-foreground/50 w-24 text-right">{formatCurrency(eqAfter)}</span>
                                                    {ddFromPeak > 0 ? (
                                                        <span className="tabular-nums text-destructive/70 w-20 text-right">-{formatCurrency(ddFromPeak)}</span>
                                                    ) : (
                                                        <span className="w-20" />
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawdown Stats */}
                        <div className="space-y-3">
                            <div className={cn(
                                unifiedSectionPanelClassName, "p-4 sm:p-5",
                                isDrawdownBreached ? "border-destructive/30 bg-destructive/5" : ""
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className={cn("h-4 w-4", isDrawdownBreached ? "text-destructive" : "text-muted-foreground")} />
                                    <p className={unifiedInfoLabelClassName}>Max Drawdown</p>
                                </div>
                                <p className={cn("text-2xl font-black tabular-nums", isDrawdownBreached ? "text-destructive" : "text-foreground")}>
                                    {formatCurrency(maxDrawdown)}
                                </p>
                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                    {maxDrawdownPct.toFixed(1)}% of starting balance
                                </p>
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-medium text-muted-foreground/50">Drawdown used</span>
                                        <span className={cn("text-[10px] font-bold tabular-nums",
                                            isDrawdownBreached ? "text-destructive" : ddUsedPct > 75 ? "text-semantic-warning" : "text-success"
                                        )}>
                                            {ddUsedPct.toFixed(0)}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={Math.min(100, ddUsedPct)}
                                        className="h-1.5 bg-muted/40"
                                        indicatorClassName={cn("transition-all",
                                            isDrawdownBreached ? "bg-destructive" : ddUsedPct > 75 ? "bg-semantic-warning" : "bg-primary/60"
                                        )}
                                    />
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] text-muted-foreground/30">{formatCurrency(maxDrawdown)}</span>
                                        <span className="text-[9px] text-muted-foreground/40">Limit: {formatCurrency(drawdownThreshold)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Remaining — same style as accounts page */}
                            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-2 text-[12px]">
                                        <span className="text-muted-foreground/70">Remaining</span>
                                        <span className={cn("tabular-nums font-medium",
                                            isDrawdownBreached ? "text-destructive"
                                                : ddRemainingIsSafe ? "text-success"
                                                    : ddRemainingIsWarning ? "text-semantic-warning" : "text-destructive"
                                        )}>
                                            {remainingLoss > 0 ? `${formatCurrency(remainingLoss)} left` : "Breached"}
                                        </span>
                                    </div>
                                    <Progress
                                        value={drawdownThreshold > 0 ? Math.max(0, 100 - ddUsedPct) : 0}
                                        className="h-1.5 bg-muted/40"
                                        indicatorClassName={cn("transition-all",
                                            isDrawdownBreached ? "bg-destructive"
                                                : ddRemainingIsSafe ? "bg-success"
                                                    : ddRemainingIsWarning ? "bg-semantic-warning" : "bg-destructive"
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Threshold</p>
                                    <p className="text-base font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(drawdownThreshold)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                        {useCustomSize ? `${(drawdownThreshold / effectiveStartingBalance * 100).toFixed(0)}% of balance` : "From account config"}
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Daily Loss Limit</p>
                                    <p className="text-base font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(dailyLossLimit)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">Per-day max</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Consec. Losses</p>
                                    <p className={cn("text-base font-black tabular-nums mt-1", maxConsecutiveLosses >= 3 ? "text-destructive" : "text-foreground")}>
                                        {maxConsecutiveLosses}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">Worst streak</p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Peak Balance</p>
                                    <p className="text-base font-black text-foreground tabular-nums mt-1">
                                        {activeDays.length > 0 ? formatCurrency(Math.max(effectiveStartingBalance, ...getEquityCurve(activeDays, effectiveStartingBalance))) : formatCurrency(effectiveStartingBalance)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">Highest reached</p>
                                </div>
                            </div>

                            {activeDays.length > 0 && (() => {
                                const breaches = activeDays.filter(d => d.pnl < -dailyLossLimit)
                                if (breaches.length === 0) return null
                                return (
                                    <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4 border-destructive/20 bg-destructive/5")}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                                            <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Daily Limit Breaches</p>
                                        </div>
                                        <p className="text-[12px] text-destructive/80">
                                            {breaches.length} day{breaches.length > 1 ? "s" : ""} exceeded the {formatCurrency(dailyLossLimit)} daily loss limit
                                        </p>
                                    </div>
                                )
                            })()}

                            <div className={cn(unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
                                        How It Works
                                    </span>
                                </div>
                                <p className="text-[12px] leading-relaxed text-muted-foreground/60">
                                    Max drawdown tracks the largest peak-to-trough decline in your equity curve. The threshold comes from your account&apos;s configured drawdown limit. Consecutive losses show your longest losing streak.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function getEquityCurve(days: TradingDay[], startBalance: number): number[] {
    const curve: number[] = []
    let running = startBalance
    for (const day of days) {
        running += day.pnl
        curve.push(running)
    }
    return curve
}

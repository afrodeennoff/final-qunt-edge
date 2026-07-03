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
import { useDataTradeItems, useDataAccountsList } from "@/context/providers/data-state-provider"
import type { Trade } from "@/lib/data-types"
import { toValidDate } from "@/lib/date-utils"

type ProgramType = "nitro" | "nitro_x" | "instant_standard" | "instant_pro" | "instant_plus" | "custom"
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
    days: TradingDay[]
}

const PROGRAMS: Record<ProgramType, { label: string; limit: number }> = {
    nitro: { label: "NITRO", limit: 50 },
    nitro_x: { label: "NITRO X", limit: 25 },
    instant_standard: { label: "INSTANT STANDARD", limit: 15 },
    instant_pro: { label: "INSTANT PRO", limit: 15 },
    instant_plus: { label: "INSTANT PLUS", limit: 15 },
    custom: { label: "CUSTOM", limit: 30 },
}

const PRESETS: Preset[] = [
    {
        id: "steady_grinder",
        name: "Steady Grinder",
        description: "Five disciplined sessions, no single day dominates.",
        days: [
            { id: "sg1", pnl: 280, isReal: false },
            { id: "sg2", pnl: 195, isReal: false },
            { id: "sg3", pnl: 340, isReal: false },
            { id: "sg4", pnl: 220, isReal: false },
            { id: "sg5", pnl: 265, isReal: false },
        ],
    },
    {
        id: "lucky_strike",
        name: "Lucky Strike",
        description: "One outsized day, quiet rest — the classic breach.",
        days: [
            { id: "ls1", pnl: 85, isReal: false },
            { id: "ls2", pnl: -120, isReal: false },
            { id: "ls3", pnl: 2100, isReal: false },
            { id: "ls4", pnl: 45, isReal: false },
            { id: "ls5", pnl: -70, isReal: false },
        ],
    },
    {
        id: "rollercoaster",
        name: "Rollercoaster",
        description: "Sharp wins and losses on alternating days.",
        days: [
            { id: "rc1", pnl: 890, isReal: false },
            { id: "rc2", pnl: -650, isReal: false },
            { id: "rc3", pnl: 1120, isReal: false },
            { id: "rc4", pnl: -430, isReal: false },
            { id: "rc5", pnl: 760, isReal: false },
            { id: "rc6", pnl: -310, isReal: false },
        ],
    },
    {
        id: "challenge_pass",
        name: "Challenge Pass",
        description: "Clears every program with a ~14.4% score.",
        days: [
            { id: "cp1", pnl: 420, isReal: false },
            { id: "cp2", pnl: 380, isReal: false },
            { id: "cp3", pnl: 510, isReal: false },
            { id: "cp4", pnl: 355, isReal: false },
            { id: "cp5", pnl: 475, isReal: false },
            { id: "cp6", pnl: 390, isReal: false },
            { id: "cp7", pnl: 440, isReal: false },
        ],
    },
    {
        id: "funded_month",
        name: "Funded Month",
        description: "Twenty active days with one best session.",
        days: Array.from({ length: 20 }, (_, i) => ({
            id: `fm${i}`,
            pnl: i === 12 ? 1850 : Math.floor(Math.random() * 400) + 150,
            isReal: false as const,
        })),
    },
]

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
    const [selectedProgram, setSelectedProgram] = React.useState<ProgramType>("custom")
    const [simMode, setSimMode] = React.useState<SimMode>("live")
    const [userSelectedAccountId, setUserSelectedAccountId] = React.useState<string | null>(null)
    const [customLimitPercent, setCustomLimitPercent] = React.useState<number>(30)
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

    const effectiveStartingBalance = React.useMemo(() => {
        if (selectedAccount?.startingBalance && selectedAccount.startingBalance > 0) {
            return selectedAccount.startingBalance
        }
        if (selectedAccount?.accountSizeName) {
            const sizeMap: Record<string, number> = { "5k": 5000, "10k": 10000, "20k": 20000, "25k": 25000, "50k": 50000, "100k": 100000, "150k": 150000, "200k": 200000, "300k": 300000 }
            return sizeMap[selectedAccount.accountSizeName.toLowerCase()] || 50000
        }
        return 50000
    }, [selectedAccount])

    const effectiveConsistencyPct = React.useMemo(() => {
        if (selectedProgram !== "custom") return PROGRAMS[selectedProgram].limit
        return customLimitPercent
    }, [selectedProgram, customLimitPercent])

    const accountConsistencyPct = selectedAccount?.consistencyPercentage
        ? Number(selectedAccount.consistencyPercentage)
        : null

    const effectiveProfitTarget = React.useMemo(() => {
        if (selectedAccount?.profitTarget && selectedAccount.profitTarget > 0) {
            return Number(selectedAccount.profitTarget)
        }
        return effectiveStartingBalance * 0.1
    }, [selectedAccount, effectiveStartingBalance])

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
        return (effectiveConsistencyPct / 100) * profitBase
    }, [totalProfit, effectiveProfitTarget, effectiveConsistencyPct])

    const isBreached = consistencyScore > effectiveConsistencyPct
    const isWarning = consistencyScore > effectiveConsistencyPct * 0.8 && !isBreached
    const isPassing = !isBreached && totalProfit > 0

    // Drawdown metrics
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
    const dailyLossLimit = selectedAccount?.dailyLoss ? Number(selectedAccount.dailyLoss) : effectiveStartingBalance * 0.05
    const drawdownThreshold = selectedAccount?.drawdownThreshold ? Number(selectedAccount.drawdownThreshold) : effectiveStartingBalance * 0.1
    const ddUsedPct = drawdownThreshold > 0 ? (maxDrawdown / drawdownThreshold) * 100 : 0
    const isDrawdownBreached = maxDrawdown >= drawdownThreshold

    // Consecutive loss days
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
        const newDay: TradingDay = {
            id: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            pnl: pnl ?? 0,
            isReal: false,
        }
        setSimulatedDays(prev => [...prev, newDay])
    }

    function removeDay(id: string) {
        setSimulatedDays(prev => prev.filter(d => d.id !== id))
    }

    function updateDayPnl(id: string, pnl: number) {
        setSimulatedDays(prev => prev.map(d => (d.id === id ? { ...d, pnl } : d)))
    }

    function applyPreset(preset: Preset) {
        setSimMode("simulate")
        setSimulatedDays(preset.days.map(d => ({ ...d, id: `${preset.id}_${d.id}` })))
    }

    function clearSimulated() {
        setSimulatedDays([])
    }

    function loadFromRealData() {
        setSimMode("live")
        setSimulatedDays([])
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
                    {/* Header */}
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

                    {/* Account & Program Row */}
                    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4", unifiedSectionPanelClassName, "p-4 sm:p-5")}>
                        {/* Account Selector */}
                        <div>
                            <div className="flex items-baseline justify-between mb-3">
                                <div>
                                    <p className={unifiedInfoLabelClassName}>Account</p>
                                    <p className="text-[11px] text-muted-foreground/50 mt-0.5">Select account or view all combined</p>
                                </div>
                                {effectiveStartingBalance > 0 && (
                                    <span className="text-lg sm:text-xl font-black text-foreground tabular-nums">
                                        {formatCurrency(effectiveStartingBalance)}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <button
                                    onClick={() => { setUserSelectedAccountId("all"); loadFromRealData() }}
                                    className={cn(
                                        "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                                        selectedAccountId === "all"
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <span>All Accounts Combined</span>
                                    {hasTrades && <span className="text-[10px] tabular-nums opacity-60">{rawTrades.length} trades</span>}
                                </button>
                                {accounts.map(acc => (
                                    <button
                                        key={acc.id}
                                        onClick={() => { setUserSelectedAccountId(acc.id || acc.number); loadFromRealData() }}
                                        className={cn(
                                            "w-full rounded-lg px-3 py-2 text-left text-[12px] font-medium transition-all duration-200 border flex items-center justify-between",
                                            selectedAccountId === (acc.id || acc.number)
                                                ? "bg-primary/10 text-primary border-primary/30"
                                                : "bg-muted/30 text-muted-foreground/80 border-border/20 hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Wallet className="h-3 w-3 shrink-0 opacity-50" />
                                            <span className="truncate">{acc.propfirm || acc.number || `Account ${acc.number}`}</span>
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
                                        <p className="text-[10px] text-muted-foreground/30 mt-0.5">Add an account in Settings to enable live data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Program / Rules */}
                        <div>
                            <div className="mb-3">
                                <p className={unifiedInfoLabelClassName}>Consistency Rule</p>
                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                    {selectedAccount?.propfirm
                                        ? `Rules from ${selectedAccount.propfirm}`
                                        : "Pick a program or set custom %"}
                                </p>
                            </div>

                            {/* Program Cards - compact row */}
                            <div className="grid grid-cols-3 gap-1.5 mb-3">
                                {(Object.entries(PROGRAMS) as [ProgramType, typeof PROGRAMS[ProgramType]][]).map(
                                    ([key, program]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedProgram(key)}
                                            className={cn(
                                                "relative rounded-lg p-2 text-left transition-all duration-200 border",
                                                selectedProgram === key
                                                    ? "bg-primary/10 border-primary/30 shadow-sm shadow-primary/10"
                                                    : "bg-card/30 border-border/20 hover:border-border/40 hover:bg-card/50"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="text-[9px] font-bold tracking-wide text-foreground/70 truncate">
                                                    {program.label}
                                                </span>
                                                {selectedProgram === key && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-primary/20" />
                                                )}
                                            </div>
                                            <span className="text-sm font-black text-foreground">{program.limit}%</span>
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Custom slider when custom is selected */}
                            {selectedProgram === "custom" && (
                                <div className="rounded-lg bg-background/40 p-3 border border-border/15">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-medium text-muted-foreground/70">Custom Limit</span>
                                        <span className="text-sm font-black text-foreground tabular-nums">{effectiveConsistencyPct}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        step="5"
                                        value={customLimitPercent}
                                        onChange={e => setCustomLimitPercent(Number(e.target.value))}
                                        className="w-full h-1.5 bg-muted/50 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between mt-1">
                                        <span className="text-[9px] text-muted-foreground/30">5%</span>
                                        <span className="text-[9px] text-muted-foreground/30">100%</span>
                                    </div>
                                    {accountConsistencyPct && (
                                        <button
                                            type="button"
                                            onClick={() => setCustomLimitPercent(accountConsistencyPct)}
                                            className="text-[9px] text-primary/60 mt-1.5 hover:text-primary transition-colors"
                                        >
                                            Your account uses {accountConsistencyPct}% — click to apply
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Phase */}
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
                            onClick={() => loadFromRealData()}
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
                                    {simMode === "live" && winningDays > 0 && (
                                        <span className="text-[9px] font-medium text-emerald-400/70">
                                            {winningDays}W {losingDays}L
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {simMode === "simulate" && simulatedDays.length > 0 && (
                                        <button
                                            onClick={clearSimulated}
                                            className="text-[11px] font-medium text-muted-foreground/50 hover:text-red-400 transition-colors"
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
                                                    <ArrowUpRight className="h-3 w-3 text-emerald-500/50 shrink-0" />
                                                ) : (
                                                    <ArrowDownRight className="h-3 w-3 text-red-500/50 shrink-0" />
                                                )}
                                                <span className={cn(
                                                    "text-sm font-semibold tabular-nums text-right min-w-[80px]",
                                                    day.pnl >= 0 ? "text-emerald-400" : "text-red-400"
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
                                                                day.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                                                            )}
                                                        />
                                                        <button
                                                            onClick={() => removeDay(day.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-red-400 transition-all text-[10px]"
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
                                    ? "bg-red-500/5 border-red-500/20"
                                    : isWarning
                                        ? "bg-yellow-500/5 border-yellow-500/20"
                                        : isPassing
                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                            : "bg-muted/30 border-border/15"
                            )}>
                                {isBreached ? (
                                    <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                                ) : isPassing ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-yellow-400/60 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={cn(
                                        "text-[12px] font-bold",
                                        isBreached ? "text-red-400" : isPassing ? "text-emerald-400" : "text-yellow-400/80"
                                    )}>
                                        {isBreached ? "BREACHED" : isPassing ? "PASSING" : activeDays.length > 0 ? "WARNING" : "AWAITING DATA"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 leading-relaxed">
                                        {isBreached
                                            ? `Best day (${formatCurrency(bestDay)}) exceeds ${effectiveConsistencyPct}% of profit target.`
                                            : isPassing
                                                ? `Your best day is within the ${effectiveConsistencyPct}% threshold.`
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
                                <p className="text-2xl font-black text-foreground mt-1">{effectiveConsistencyPct}%</p>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-semibold text-foreground/70">SCORE</span>
                                        <span className="text-[10px] text-muted-foreground/50">Best day ÷ Profit base</span>
                                    </div>
                                    <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
                                        {/* Limit marker */}
                                        <div
                                            className="absolute inset-y-0 w-px bg-foreground/30 z-10"
                                            style={{ left: `${Math.min(100, effectiveConsistencyPct)}%` }}
                                        />
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                                isBreached ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary"
                                            )}
                                            style={{ width: `${Math.min(100, consistencyScore)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className={cn("text-[10px] font-bold tabular-nums", isBreached ? "text-red-400" : "text-muted-foreground/50")}>
                                            {consistencyScore}%
                                        </span>
                                        <span className="text-[10px] font-medium text-muted-foreground/50">{effectiveConsistencyPct}% limit</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Balance</p>
                                    <p className="text-base sm:text-lg font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(currentBalance)}
                                    </p>
                                    <p className={cn("text-[10px] tabular-nums mt-0.5", totalProfit >= 0 ? "text-emerald-400/60" : "text-red-400/60")}>
                                        {totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)}
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Total Profit</p>
                                    <p className={cn("text-base sm:text-lg font-black tabular-nums mt-1", totalProfit >= 0 ? "text-emerald-400" : "text-red-400")}>
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
                                        {effectiveConsistencyPct}% of target
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
                                    <p className={cn("text-base font-black tabular-nums mt-0.5", avgDay >= 0 ? "text-foreground" : "text-red-400")}>
                                        {formatCurrency(avgDay)}
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-2.5 text-center")}>
                                    <p className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider">Worst</p>
                                    <p className="text-base font-black text-red-400 tabular-nums mt-0.5">{formatCurrency(worstDay)}</p>
                                </div>
                            </div>

                            {/* What This Means */}
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
                                            <span className="font-semibold text-foreground/80">{effectiveConsistencyPct}%</span> rule. Best day ({formatCurrency(bestDay)}) must not exceed{" "}
                                            {effectiveConsistencyPct}% of total profit ({formatCurrency(Math.max(totalProfit, effectiveProfitTarget))}).</>
                                        : <>Simulate scenarios to test how the{" "}
                                            <span className="font-semibold text-foreground/80">{effectiveConsistencyPct}%</span> consistency rule reacts to different P&amp;L patterns.</>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Try A Preset Section — only show in simulate mode or when no real data */}
                    {(simMode === "simulate" || !hasTrades) && (
                        <div className="flex items-start gap-2 pt-2">
                            <Sparkles className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 shrink-0" />
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/80">
                                        Try A Preset
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/40">Load a scenario and watch the rule respond</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                                    {PRESETS.map(preset => {
                                        const presetProfit = preset.days.reduce((s, d) => s + d.pnl, 0)
                                        const presetBest = Math.max(...preset.days.map(d => d.pnl))
                                        const presetScore = presetProfit > 0 ? Math.round((presetBest / Math.max(presetProfit, effectiveProfitTarget)) * 100) : 0
                                        const wouldBreach = presetScore > effectiveConsistencyPct
                                        return (
                                            <button
                                                key={preset.id}
                                                onClick={() => applyPreset(preset)}
                                                className={cn(
                                                    "group rounded-xl p-3 sm:p-4 text-left transition-all duration-200 border bg-card/30 border-border/20 hover:border-primary/20 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5"
                                                )}
                                            >
                                                <div className="flex items-end gap-0.5 h-8 mb-3">
                                                    {preset.days.slice(0, 8).map((day, i) => {
                                                        const maxAbs = Math.max(...preset.days.map(d => Math.abs(d.pnl)), 1)
                                                        const height = Math.max(2, (Math.abs(day.pnl) / maxAbs) * 32)
                                                        const isPositive = day.pnl >= 0
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "flex-1 rounded-sm min-w-[3px] transition-all",
                                                                    isPositive ? "bg-emerald-500/40 group-hover:bg-emerald-500/60" : "bg-red-500/40 group-hover:bg-red-500/60"
                                                                )}
                                                                style={{ height }}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[12px] font-bold text-foreground/90">{preset.name}</p>
                                                    {wouldBreach && (
                                                        <XCircle className="h-3 w-3 text-red-400/50 shrink-0" />
                                                    )}
                                                    {!wouldBreach && presetScore > 0 && (
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-400/50 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground/50 line-clamp-2 mt-1 leading-relaxed">
                                                    {preset.description}
                                                </p>
                                                <p className={cn("text-[9px] font-medium mt-1.5 tabular-nums", wouldBreach ? "text-red-400/60" : "text-emerald-400/60")}>
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
                    {/* Header */}
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
                        {/* Drawdown Chart Area */}
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
                                    {/* Visual equity curve */}
                                    <div className="relative h-48 bg-background/30 rounded-lg overflow-hidden border border-border/10">
                                        <svg className="w-full h-full" viewBox={`0 0 ${Math.max(activeDays.length * 40, 400)} 192`} preserveAspectRatio="none">
                                            {/* Grid lines */}
                                            {[0, 1, 2, 3, 4].map(i => (
                                                <line key={i} x1="0" y1={i * 48} x2="100%" y2={i * 48} stroke="currentColor" strokeWidth="0.5" className="text-border/20" />
                                            ))}

                                            {/* Zero line (starting balance) */}
                                            {(() => {
                                                const values = getEquityCurve(activeDays, effectiveStartingBalance)
                                                const minVal = Math.min(effectiveStartingBalance, ...values) * 0.98
                                                const maxVal = Math.max(effectiveStartingBalance, ...values) * 1.02
                                                const range = maxVal - minVal || 1
                                                const zeroY = 192 - ((effectiveStartingBalance - minVal) / range) * 192
                                                return <line x1="0" y1={zeroY} x2="100%" y2={zeroY} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-muted-foreground/30" />
                                            })()}

                                            {/* Equity curve path */}
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

                                                return (
                                                    <polyline
                                                        points={points}
                                                        fill="none"
                                                        stroke="url(#ddGradient)"
                                                        strokeWidth="2"
                                                        strokeLinejoin="round"
                                                    />
                                                )
                                            })()}

                                            {/* Peak line */}
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
                                                    return <polyline points={peakPoints.join(" ")} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-emerald-500/30" />
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

                                    {/* Daily bars */}
                                    <div className="flex items-end gap-1 h-20 px-1">
                                        {activeDays.map((day, i) => {
                                            const maxAbs = Math.max(...activeDays.map(d => Math.abs(d.pnl)), 1)
                                            const height = Math.max(2, (Math.abs(day.pnl) / maxAbs) * 72)
                                            const isPositive = day.pnl >= 0
                                            return (
                                                <div key={day.id} className="flex-1 flex flex-col items-center gap-0.5 min-w-[4px]">
                                                    <div
                                                        className={cn(
                                                            "w-full rounded-t-sm transition-all",
                                                            isPositive ? "bg-emerald-500/50" : "bg-red-500/50"
                                                        )}
                                                        style={{ height }}
                                                        title={`${day.date || `Day ${i+1}`}: ${formatCurrency(day.pnl)}`}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Day list summary */}
                                    <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                                        {activeDays.map((day, i) => {
                                            const eqBefore = effectiveStartingBalance + activeDays.slice(0, i).reduce((s, d) => s + d.pnl, 0)
                                            const eqAfter = eqBefore + day.pnl
                                            const ddFromPeak = Math.max(0, ...activeDays.slice(0, i + 1).reduce(
                                                (arr, d, j) => {
                                                    const running = effectiveStartingBalance + activeDays.slice(0, j + 1).reduce((ss, dd) => ss + dd.pnl, 0)
                                                    arr.push(running)
                                                    return arr
                                                }, [] as number[]
                                            )) - eqAfter

                                            return (
                                                <div key={day.id} className="flex items-center gap-2 rounded-md bg-background/30 px-2.5 py-1.5 text-[11px]">
                                                    <span className="text-muted-foreground/35 w-5 text-right font-mono">{i + 1}.</span>
                                                    {day.date && <span className="text-muted-foreground/40 w-12 shrink-nowrap">{formatDate(day.date)}</span>}
                                                    <span className={cn("font-semibold tabular-nums w-20 text-right", day.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                        {day.pnl >= 0 ? "+" : ""}{formatCurrency(day.pnl)}
                                                    </span>
                                                    <span className="tabular-nums text-muted-foreground/50 w-24 text-right">{formatCurrency(eqAfter)}</span>
                                                    {ddFromPeak > 0 && (
                                                        <span className="tabular-nums text-red-400/60 w-20 text-right">-{formatCurrency(ddFromPeak)}</span>
                                                    )}
                                                    {ddFromPeak <= 0 && <span className="w-20" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawdown Stats Sidebar */}
                        <div className="space-y-3">
                            {/* Max Drawdown Status */}
                            <div className={cn(
                                unifiedSectionPanelClassName, "p-4 sm:p-5",
                                isDrawdownBreached ? "border-red-500/30 bg-red-500/5" : ""
                            )}>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown className={cn("h-4 w-4", isDrawdownBreached ? "text-red-400" : "text-muted-foreground")} />
                                    <p className={unifiedInfoLabelClassName}>Max Drawdown</p>
                                </div>
                                <p className={cn("text-2xl font-black tabular-nums", isDrawdownBreached ? "text-red-400" : "text-foreground")}>
                                    {formatCurrency(maxDrawdown)}
                                </p>
                                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                    {maxDrawdownPct.toFixed(1)}% of starting balance
                                </p>

                                {/* DD Progress bar */}
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-medium text-muted-foreground/50">Used</span>
                                        <span className={cn("text-[10px] font-bold tabular-nums", isDrawdownBreached ? "text-red-400" : "text-muted-foreground/50")}>
                                            {ddUsedPct.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                                                isDrawdownBreached ? "bg-red-500" : ddUsedPct > 75 ? "bg-yellow-500" : "bg-primary"
                                            )}
                                            style={{ width: `${Math.min(100, ddUsedPct)}%` }}
                                        />
                                        {/* Threshold marker at configured level */}
                                        <div
                                            className="absolute inset-y-0 w-px bg-foreground/40 z-10"
                                            style={{ left: "100%" }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] text-muted-foreground/30">$0</span>
                                        <span className="text-[9px] text-muted-foreground/40">Limit: {formatCurrency(drawdownThreshold)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key DD Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Threshold</p>
                                    <p className="text-base font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(drawdownThreshold)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                        From account config
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Remaining</p>
                                    <p className={cn("text-base font-black tabular-nums mt-1", (drawdownThreshold - maxDrawdown) > 0 ? "text-foreground" : "text-red-400")}>
                                        {formatCurrency(Math.max(0, drawdownThreshold - maxDrawdown))}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                        Before breach
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Consec. Losses</p>
                                    <p className={cn("text-base font-black tabular-nums mt-1", maxConsecutiveLosses >= 3 ? "text-red-400" : "text-foreground")}>
                                        {maxConsecutiveLosses}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                        Worst streak
                                    </p>
                                </div>
                                <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4")}>
                                    <p className={unifiedInfoLabelClassName}>Daily Loss Limit</p>
                                    <p className="text-base font-black text-foreground tabular-nums mt-1">
                                        {formatCurrency(dailyLossLimit)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                                        Per-day max
                                    </p>
                                </div>
                            </div>

                            {/* Days that breached daily limit */}
                            {activeDays.length > 0 && (() => {
                                const breaches = activeDays.filter(d => d.pnl < -dailyLossLimit)
                                if (breaches.length === 0) return null
                                return (
                                    <div className={cn(unifiedSectionPanelClassName, "p-3 sm:p-4 border-red-500/20 bg-red-500/5")}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Daily Limit Breaches</p>
                                        </div>
                                        <p className="text-[12px] text-red-400/80">
                                            {breaches.length} day{breaches.length > 1 ? "s" : ""} exceeded the {formatCurrency(dailyLossLimit)} daily loss limit
                                        </p>
                                    </div>
                                )
                            })()}

                            {/* Info panel */}
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

'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, Star, Pin, Trash2, Check, Loader2,
  ChevronDown, Clock, Hash, Image as ImageIcon, PenLine,
  ArrowUpRight, ArrowDownRight, BookOpen, X, TrendingUp, TrendingDown,
} from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { RatingStars } from './components/rating-stars'
import { TagTabs } from './components/tag-tabs'
import { ScreenshotGrid } from './components/screenshot-grid'
import { SUGGESTED_TAGS } from './lib/journal-constants'
import type { JournalEntry, TradeJournalCard } from './lib/journal-types'
import { cn } from '@/lib/utils'
import { MotionStagger, MotionStaggerItem } from '@/components/animation/enhanced-motion'
import { unifiedMetricPanelClassName, unifiedInsetPanelClassName, unifiedSectionEyebrowClassName } from '@/components/layout/unified-page-recipes'

// ── Formatters ──

function formatPnl(pnl: number) {
  const num = Number(pnl)
  if (isNaN(num)) return '$0.00'
  const sign = num >= 0 ? '+' : ''
  return `${sign}$${Math.abs(num).toFixed(2)}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '—'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours < 24) return `${hours}h ${remaining}m`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

// ── Weekly Card ──

interface DayGroup {
  dateKey: string
  label: string
  shortDay: string
  trades: TradeJournalCard[]
  totalPnl: number
}

function groupByDay(cards: TradeJournalCard[]): DayGroup[] {
  const map = new Map<string, TradeJournalCard[]>()
  for (const c of cards) {
    const d = new Date(c.trade.entryDate)
    const key = d.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(c)
  }
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const result: DayGroup[] = []
  for (const [dateKey, trades] of map) {
    const d = new Date(dateKey + 'T12:00:00')
    result.push({
      dateKey,
      label: formatDate(dateKey),
      shortDay: days[d.getDay()],
      trades,
      totalPnl: trades.reduce((s, t) => s + (t.trade.pnl || 0), 0),
    })
  }
  result.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  return result.slice(0, 7)
}

// ── Inline Tag Input ──

function InlineTagInput({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
}) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    if (!input.trim()) return []
    return SUGGESTED_TAGS.filter(
      t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t),
    ).slice(0, 6)
  }, [input, tags])

  const handleAdd = useCallback((tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onAdd(tag.trim())
    }
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [tags, onAdd])

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-medium text-primary/90"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-1.5 rounded-lg bg-background/50 px-2.5 py-1.5">
          <Hash size={12} className="shrink-0 text-muted-foreground/40" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) handleAdd(input)
              if (e.key === 'Escape') { setInput(''); setShowSuggestions(false) }
            }}
            placeholder="Add a tag..."
            className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground/40 focus:outline-none"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg bg-popover p-1 shadow-lg">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onMouseDown={() => handleAdd(s)}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted/30"
              >
                <Hash size={10} className="text-muted-foreground/50" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Section Header ──

function SectionHeader({
  icon,
  title,
  isOpen,
  onToggle,
  badge,
}: {
  icon: React.ReactNode
  title: string
  isOpen: boolean
  onToggle: () => void
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2 py-2 text-left"
    >
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/80">{title}</span>
      {badge && (
        <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[9px] font-bold text-primary">
          {badge}
        </span>
      )}
      <ChevronDown
        size={12}
        className={cn(
          'ml-auto text-muted-foreground/40 transition-transform duration-150',
          isOpen && 'rotate-180',
        )}
      />
    </button>
  )
}

// ── Main Component ──

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'journaled' | 'not-journaled'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<Record<string, boolean>>({
    context: true,
    preTrade: true,
    postTrade: true,
    emotions: true,
    ratings: true,
    tags: true,
    screenshots: false,
  })
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [pendingTradeId, setPendingTradeId] = useState<string | null>(null)
  const [tradePage, setTradePage] = useState(1)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const PER_PAGE = 10
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    cards, stats, isLoading, expandedId,
    toggleExpand,
    createEntry, updateEntry, deleteEntry,
  } = useJournal(userId)

  const displayCards = cards

  // ── Weekly groups ──
  const dayGroups = useMemo(() => groupByDay(displayCards), [displayCards])
  const activeDayTrades = useMemo(() => {
    if (!selectedDayKey) return displayCards
    const group = dayGroups.find(g => g.dateKey === selectedDayKey)
    return group ? group.trades : displayCards
  }, [selectedDayKey, dayGroups, displayCards])

  // ── Selected card ──
  const selectedCard = displayCards.find(c => c.trade.id === expandedId) ?? null

  // ── Filtered + paginated ──
  const filteredCards = useMemo(() => {
    let result = activeDayTrades
    const q = search.toLowerCase()

    if (q) {
      result = result.filter(c =>
        c.trade.instrument.toLowerCase().includes(q) ||
        c.journal?.preTradeNotes?.toLowerCase().includes(q) ||
        c.journal?.postTradeReview?.toLowerCase().includes(q) ||
        c.journal?.customTags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (statusFilter === 'journaled') {
      result = result.filter(c => c.journal !== null)
    } else if (statusFilter === 'not-journaled') {
      result = result.filter(c => c.journal === null)
    }

    return result
  }, [activeDayTrades, search, statusFilter])

  const totalTradePages = Math.max(1, Math.ceil(filteredCards.length / PER_PAGE))
  const safeTradePage = Math.min(tradePage, totalTradePages)
  const paginatedCards = useMemo(
    () => filteredCards.slice((safeTradePage - 1) * PER_PAGE, safeTradePage * PER_PAGE),
    [filteredCards, safeTradePage],
  )

  // ── Day summary metrics ──
  const daySummary = useMemo(() => {
    const trades = activeDayTrades
    const totalPnl = trades.reduce((s, t) => s + (t.trade.pnl || 0), 0)
    const wins = trades.filter(t => t.trade.pnl > 0).length
    const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0
    const pnls = trades.map(t => t.trade.pnl).filter(p => p !== 0)
    const best = pnls.length ? Math.max(...pnls) : 0
    const worst = pnls.length ? Math.min(...pnls) : 0
    return { totalPnl, trades: trades.length, winRate, best, worst }
  }, [activeDayTrades])

  // ── CRUD handlers (unchanged) ──
  const handleCreate = useCallback(
    async (tradeId: string, accountNumber: string, additionalData?: Record<string, any>): Promise<JournalEntry> => {
      return createEntry({ tradeId, accountNumber, ...additionalData })
    },
    [createEntry],
  )

  const handleUpdate = useCallback(
    async (id: string, data: Record<string, any>): Promise<JournalEntry> => {
      return updateEntry(id, data)
    },
    [updateEntry],
  )

  const update = useCallback(
    (field: string, value: any) => {
      if (!selectedCard?.journal) return
      const entryId = selectedCard.journal.id
      setSaving(true)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setHasUnsaved(true)
      saveTimerRef.current = setTimeout(() => setSaving(false), 1500)
      if (entryId?.startsWith('temp-')) {
        const { preTradeNotes, postTradeReview, emotions, confidenceRating, disciplineScore, customTags, screenshots } = selectedCard.journal
        handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber, {
          preTradeNotes, postTradeReview, emotions, confidenceRating, disciplineScore, customTags, screenshots,
          [field]: value,
        })
        return
      }
      if (entryId) handleUpdate(entryId, { [field]: value })
    },
    [selectedCard, handleCreate, handleUpdate],
  )

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!selectedCard?.journal) return
    await deleteEntry(selectedCard.journal.id)
    setDeleteConfirm(false)
    toggleExpand(selectedCard.trade.id)
  }, [selectedCard, deleteEntry, toggleExpand])

  const handlePinToggle = useCallback(() => {
    if (!selectedCard?.journal) return
    update('pinned', !selectedCard.journal.pinned)
  }, [selectedCard, update])

  useEffect(() => { setTradePage(1) }, [search, statusFilter, selectedDayKey])

  const handleSelectTrade = useCallback((tradeId: string) => {
    if (hasUnsaved && selectedCard?.journal) {
      setPendingTradeId(tradeId)
      return
    }
    toggleExpand(tradeId)
    const card = displayCards.find(c => c.trade.id === tradeId)
    if (card && !card.journal) {
      handleCreate(tradeId, card.trade.accountNumber)
    }
  }, [displayCards, toggleExpand, handleCreate, hasUnsaved, selectedCard])

  const toggleSection = useCallback((section: string) => {
    setActiveSection(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  // ── Render ──
  return (
    <div className="flex h-full flex-col overflow-hidden space-y-4 p-4 lg:p-5">
      {/* ── Weekly Performance Strip ── */}
      <div>
        <div className={cn(unifiedSectionEyebrowClassName, 'mb-3')}>
          {selectedDayKey ? `Week of ${formatDate(selectedDayKey)}` : 'Recent Days'}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dayGroups.map(g => {
            const isSelected = selectedDayKey === g.dateKey
            const pnlPositive = g.totalPnl > 0
            return (
              <button
                key={g.dateKey}
                type="button"
                onClick={() => setSelectedDayKey(isSelected ? null : g.dateKey)}
                className={cn(
                  'rounded-xl p-3 text-left transition-all duration-200',
                  'bg-card/50 border border-transparent hover:border-primary/20',
                  isSelected && 'border-primary/50 shadow-[0_0_0_1px,var(--primary),0_8px_24px_rgba(0,255,159,0.08)]',
                  'hover:-translate-y-0.5 hover:shadow-lg',
                )}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{g.shortDay}</div>
                <div className="text-[10px] text-muted-foreground/40 mt-0.5">{g.label}</div>
                <div className={cn(
                  'text-sm font-semibold tabular-nums mt-2',
                  pnlPositive ? 'text-semantic-success' : g.totalPnl < 0 ? 'text-semantic-error' : 'text-muted-foreground/50',
                )}>
                  {g.totalPnl > 0 ? '+' : ''}{g.totalPnl === 0 ? '—' : formatPnl(g.totalPnl)}
                </div>
                <div className="text-[10px] text-muted-foreground/35 mt-1">{g.trades.length} trades</div>
              </button>
            )
          })}
          {dayGroups.length === 0 && !isLoading && (
            <div className="col-span-7 text-center py-4 text-xs text-muted-foreground/40">
              No trades yet. Import trades to see weekly performance.
            </div>
          )}
        </div>
      </div>

      {/* ── Day Summary + Search ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Day Summary */}
        <div className="col-span-12 lg:col-span-5 rounded-xl p-5 space-y-4 bg-card/30 border border-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground/60">
                {selectedDayKey ? formatDate(selectedDayKey) : 'All trades'}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className={cn(
                  'text-3xl font-bold tracking-tight tabular-nums',
                  daySummary.totalPnl > 0 ? 'text-semantic-success' : daySummary.totalPnl < 0 ? 'text-semantic-error' : 'text-muted-foreground',
                )}>
                  {formatPnl(daySummary.totalPnl)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={unifiedSectionEyebrowClassName}>Win Rate</div>
              <div className="text-xl font-bold tabular-nums mt-0.5">{daySummary.winRate}%</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Trades</div>
              <div className="text-base font-semibold tabular-nums mt-0.5">{daySummary.trades}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Journaled</div>
              <div className="text-base font-semibold tabular-nums mt-0.5">{activeDayTrades.filter(c => c.journal !== null).length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Best</div>
              <div className={cn('text-base font-semibold tabular-nums mt-0.5', daySummary.best > 0 ? 'text-semantic-success' : 'text-muted-foreground')}>
                {formatPnl(daySummary.best)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Worst</div>
              <div className={cn('text-base font-semibold tabular-nums mt-0.5', daySummary.worst < 0 ? 'text-semantic-error' : 'text-muted-foreground')}>
                {formatPnl(daySummary.worst)}
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="col-span-12 lg:col-span-7 rounded-xl p-4 bg-card/30 border border-transparent space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search instruments, notes, tags..."
              className="h-9 w-full rounded-lg border-0 bg-background/40 pl-9 pr-3 text-xs placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'journaled', 'not-journaled'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                  statusFilter === s
                    ? 'bg-primary/12 text-primary'
                    : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/20',
                )}
              >
                {s === 'all' ? 'All' : s === 'journaled' ? 'Journaled' : 'No entry'}
              </button>
            ))}
            <div className="ml-auto text-[10px] text-muted-foreground/35 tabular-nums">
              {filteredCards.length} of {displayCards.length} trades
            </div>
          </div>
        </div>
      </div>

      {/* ── Trade Log Table ── */}
      <div className="rounded-xl overflow-hidden bg-card/30 border border-transparent flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/50 border-b border-foreground/[0.04]">
                <th className="text-left px-4 py-2.5 font-medium">Time</th>
                <th className="text-left px-4 py-2.5 font-medium">Symbol</th>
                <th className="text-left px-4 py-2.5 font-medium">Side</th>
                <th className="text-right px-4 py-2.5 font-medium">Entry</th>
                <th className="text-right px-4 py-2.5 font-medium">Exit</th>
                <th className="text-right px-4 py-2.5 font-medium">PnL</th>
                <th className="text-right px-4 py-2.5 font-medium">Duration</th>
                <th className="text-left px-4 py-2.5 font-medium">Tags</th>
                <th className="text-center px-4 py-2.5 font-medium w-12">Journal</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-foreground/[0.03]">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-3 bg-muted/20 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <BookOpen size={20} className="mx-auto text-muted-foreground/25 mb-2" />
                    <p className="text-xs text-muted-foreground/50">No trades found</p>
                    <p className="text-[10px] text-muted-foreground/30 mt-1">Import trades or adjust your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedCards.map(card => {
                  const isWin = card.trade.pnl > 0
                  const isBreakeven = Math.abs(card.trade.pnl) < 0.01
                  const hasJournal = card.journal !== null
                  const pnlColor = isBreakeven
                    ? 'text-muted-foreground'
                    : isWin ? 'text-semantic-success' : 'text-semantic-error'
                  const isSelected = expandedId === card.trade.id

                  return (
                    <tr
                      key={card.trade.id}
                      onClick={() => handleSelectTrade(card.trade.id)}
                      className={cn(
                        'border-b border-foreground/[0.03] cursor-pointer transition-all duration-150',
                        'hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
                        isSelected
                          ? 'bg-primary/5 shadow-[0_0_0_1px,rgba(0,255,159,0.15)]'
                          : 'hover:bg-muted/15',
                      )}
                    >
                      <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground/70">{formatTime(card.trade.entryDate)}</td>
                      <td className="px-4 py-3 text-xs font-semibold">{card.trade.instrument}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
                          card.trade.side?.toUpperCase() === 'LONG'
                            ? 'bg-semantic-success/10 text-semantic-success'
                            : 'bg-semantic-error/10 text-semantic-error',
                        )}>
                          {card.trade.side?.toUpperCase() === 'LONG'
                            ? <ArrowUpRight size={8} />
                            : <ArrowDownRight size={8} />
                          }
                          {card.trade.side || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-right text-muted-foreground/70">
                        ${Number(card.trade.entryPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-right text-muted-foreground/70">
                        ${Number(card.trade.closePrice).toFixed(2)}
                      </td>
                      <td className={cn('px-4 py-3 text-xs tabular-nums text-right font-semibold', pnlColor)}>
                        {formatPnl(card.trade.pnl)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/50 text-right">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} />
                          {formatDuration(card.trade.timeInPosition)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(card.journal?.customTags ?? []).slice(0, 3).map(tag => (
                            <span key={tag} className="rounded-full bg-primary/8 px-1.5 py-0.5 text-[8px] font-medium text-primary/80">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className={cn(
                          'h-1.5 w-1.5 rounded-full mx-auto transition-colors',
                          hasJournal ? 'bg-primary' : 'bg-muted-foreground/20',
                        )} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalTradePages > 1 && (
          <div className="shrink-0 border-t border-foreground/[0.04] px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground/35 tabular-nums">
            <span>Page {safeTradePage} of {totalTradePages}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTradePage(p => Math.max(1, p - 1))}
                disabled={safeTradePage <= 1}
                className="rounded px-2 py-1 hover:bg-muted/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalTradePages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(safeTradePage - 2, totalTradePages - 4))
                const pageNum = start + i
                if (pageNum > totalTradePages) return null
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setTradePage(pageNum)}
                    className={cn(
                      'rounded px-2 py-1 transition-colors',
                      pageNum === safeTradePage ? 'bg-primary/12 text-primary font-semibold' : 'hover:bg-muted/20',
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setTradePage(p => Math.min(totalTradePages, p + 1))}
                disabled={safeTradePage >= totalTradePages}
                className="rounded px-2 py-1 hover:bg-muted/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Journal Editor (expanded trade) ── */}
      {selectedCard && (
        <div className="shrink-0 rounded-xl bg-card/30 border border-primary/10 overflow-hidden">
          {/* Context header */}
          <div className="p-4 space-y-3 border-b border-foreground/[0.04]">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold tracking-tight">{selectedCard.trade.instrument}</h2>
              <span className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                selectedCard.trade.side?.toUpperCase() === 'LONG'
                  ? 'bg-semantic-success/10 text-semantic-success'
                  : 'bg-semantic-error/10 text-semantic-error',
              )}>
                {selectedCard.trade.side?.toUpperCase() === 'LONG'
                  ? <ArrowUpRight size={10} />
                  : <ArrowDownRight size={10} />
                }
                {selectedCard.trade.side || '—'}
              </span>
              <span className={cn(
                'ml-auto text-sm font-bold tabular-nums',
                selectedCard.trade.pnl > 0 ? 'text-semantic-success' : Math.abs(selectedCard.trade.pnl) < 0.01 ? 'text-muted-foreground' : 'text-semantic-error',
              )}>
                {formatPnl(selectedCard.trade.pnl)}
              </span>
              <button
                type="button"
                onClick={() => toggleExpand(selectedCard.trade.id)}
                className="rounded-lg p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/65">
              <span>Entry ${Number(selectedCard.trade.entryPrice).toFixed(2)}</span>
              <span>Exit ${Number(selectedCard.trade.closePrice).toFixed(2)}</span>
              <span>Qty {selectedCard.trade.quantity}</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {formatDuration(selectedCard.trade.timeInPosition)}
              </span>
              <span>Comm ${Number(selectedCard.trade.commission).toFixed(2)}</span>
              {selectedCard.journal?.pinned && (
                <span className="flex items-center gap-1 text-primary/60">
                  <Pin size={10} /> Pinned
                </span>
              )}
            </div>

            {selectedCard.journal && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePinToggle}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                    selectedCard.journal.pinned
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground/45 hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  <Pin size={10} />
                  {selectedCard.journal.pinned ? 'Pinned' : 'Pin'}
                </button>
                {deleteConfirm ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-1 rounded-lg bg-destructive/12 px-2.5 py-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/20"
                    >
                      <Trash2 size={10} /> Confirm delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="rounded-lg px-2.5 py-1.5 text-[10px] text-muted-foreground/50 hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(true)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] text-muted-foreground/45 hover:text-destructive hover:bg-destructive/8 transition-colors"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                  {saving ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-primary/60" />
                      <span className="text-[9px] text-primary/50">Saving...</span>
                    </>
                  ) : selectedCard.journal.updatedAt ? (
                    <>
                      <Check size={10} className="text-semantic-success/70" />
                      <span className="text-[9px] text-muted-foreground/35">Saved</span>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Journal sections */}
          <div className="p-4 max-h-[40vh] overflow-y-auto">
            {!selectedCard.journal ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="rounded-2xl bg-primary/6 p-3">
                  <PenLine size={20} className="text-primary/40" />
                </div>
                <p className="text-xs text-muted-foreground/50">No journal entry yet</p>
                <button
                  type="button"
                  onClick={() => handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)}
                  className="rounded-xl bg-primary/10 px-5 py-2 text-xs font-semibold text-primary hover:bg-primary/18 transition-colors"
                >
                  Start journaling
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div>
                  <SectionHeader
                    icon={<PenLine size={12} className="text-primary/50" />}
                    title="Pre-trade notes"
                    isOpen={activeSection.preTrade}
                    onToggle={() => toggleSection('preTrade')}
                  />
                  {activeSection.preTrade && (
                    <textarea
                      value={selectedCard.journal.preTradeNotes ?? ''}
                      onChange={e => update('preTradeNotes', e.target.value || null)}
                      placeholder="Why did you enter this trade? What was your setup and reasoning?"
                      rows={3}
                      className="w-full resize-none rounded-lg bg-background/30 px-3.5 py-2.5 text-[13px] leading-relaxed placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/15 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon={<BookOpen size={12} className="text-semantic-success/50" />}
                    title="Post-trade review"
                    isOpen={activeSection.postTrade}
                    onToggle={() => toggleSection('postTrade')}
                  />
                  {activeSection.postTrade && (
                    <textarea
                      value={selectedCard.journal.postTradeReview ?? ''}
                      onChange={e => update('postTradeReview', e.target.value || null)}
                      placeholder="What went well? What would you change? Lessons learned?"
                      rows={3}
                      className="w-full resize-none rounded-lg bg-background/30 px-3.5 py-2.5 text-[13px] leading-relaxed placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/15 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon={<Star size={12} className="text-semantic-warning/50" />}
                    title="Emotions"
                    isOpen={activeSection.emotions}
                    onToggle={() => toggleSection('emotions')}
                  />
                  {activeSection.emotions && (
                    <textarea
                      value={selectedCard.journal.emotions ?? ''}
                      onChange={e => update('emotions', e.target.value || null)}
                      placeholder="How were you feeling during this trade?"
                      rows={2}
                      className="w-full resize-none rounded-lg bg-background/30 px-3.5 py-2.5 text-[13px] leading-relaxed placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/15 focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon={<Star size={12} className="text-primary/50" />}
                    title="Ratings"
                    isOpen={activeSection.ratings}
                    onToggle={() => toggleSection('ratings')}
                  />
                  {activeSection.ratings && (
                    <div className="flex items-start gap-8 pt-1 pb-2">
                      <div>
                        <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">Confidence</p>
                        <RatingStars value={selectedCard.journal.confidenceRating} onChange={v => update('confidenceRating', v)} />
                      </div>
                      <div>
                        <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">Discipline</p>
                        <RatingStars value={selectedCard.journal.disciplineScore} onChange={v => update('disciplineScore', v)} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon={<Hash size={12} className="text-primary/50" />}
                    title="Tags"
                    isOpen={activeSection.tags}
                    onToggle={() => toggleSection('tags')}
                    badge={(selectedCard.journal.customTags ?? []).length > 0 ? String((selectedCard.journal.customTags ?? []).length) : undefined}
                  />
                  {activeSection.tags && (
                    <div className="space-y-3">
                      <InlineTagInput
                        tags={selectedCard.journal.customTags ?? []}
                        onAdd={tag => update('customTags', [...(selectedCard.journal!.customTags ?? []), tag])}
                        onRemove={tag => update('customTags', (selectedCard.journal!.customTags ?? []).filter(t => t !== tag))}
                      />
                      <TagTabs
                        activeTags={selectedCard.journal.customTags ?? []}
                        onChange={v => update('customTags', v)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <SectionHeader
                    icon={<ImageIcon size={12} className="text-primary/50" />}
                    title="Screenshots"
                    isOpen={activeSection.screenshots}
                    onToggle={() => toggleSection('screenshots')}
                    badge={(selectedCard.journal.screenshots ?? []).length > 0 ? String((selectedCard.journal.screenshots ?? []).length) : undefined}
                  />
                  {activeSection.screenshots && (
                    <ScreenshotGrid
                      screenshots={selectedCard.journal.screenshots ?? []}
                      onChange={v => update('screenshots', v)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unsaved changes confirmation */}
      {pendingTradeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border bg-card p-6 shadow-2xl">
            <h3 className="text-sm font-semibold">Unsaved changes</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              You have unsaved journal content. Switching trades will discard these changes.
            </p>
            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPendingTradeId(null)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasUnsaved(false)
                  setPendingTradeId(null)
                  toggleExpand(pendingTradeId)
                  const card = displayCards.find(c => c.trade.id === pendingTradeId)
                  if (card && !card.journal) {
                    handleCreate(pendingTradeId, card.trade.accountNumber)
                  }
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                Discard & switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

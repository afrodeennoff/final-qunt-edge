'use client'

import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Plus, X, ArrowUpRight, ArrowDownRight, BookOpen, Clock,
  Check, Loader2, Trash2, Pin, Image as ImageIcon,
} from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { createSingleTradeAction } from '@/server/trades'
import { RatingStars } from './components/rating-stars'
import { ScreenshotGrid } from './components/screenshot-grid'
import type { JournalEntry, TradeJournalCard } from './lib/journal-types'
import { cn } from '@/lib/utils'
import {
  unifiedSectionEyebrowClassName,
  unifiedMetricPanelClassName,
  unifiedInfoLabelClassName,
} from '@/components/layout/unified-page-recipes'

// ── Constants ──

const SESSION_DEFAULTS = ['London', 'NY', 'Asia']
const TIMEFRAME_DEFAULTS = ['5m', '15m', '30m', '1H', '4H', 'Daily']
const ICT_DEFAULTS = ['OB', 'FVG', 'Liq Sweep', 'Breaker', 'MSS', 'ChoCh']
const EMOTION_CHIPS = ['Calm', 'Focused', 'Anxious', 'FOMO', 'Revenge', 'Greedy', 'Fearful'] as const

// ── Formatters ──

function formatPnl(pnl: number) {
  const num = Number(pnl)
  if (isNaN(num)) return '$0.00'
  const sign = num >= 0 ? '+' : ''
  return `${sign}$${Math.abs(num).toFixed(2)}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  })
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, {
    weekday: 'long', month: 'short', day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '--:--'
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return '--'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours < 24) return `${hours}h ${remaining}min`
  const days = Math.floor(hours / 24)
  return `${days}d ${hours % 24}h`
}

// ── Chip Component ──

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-foreground/[0.06] text-muted-foreground hover:border-primary/30',
      )}
    >
      {label}
    </button>
  )
}

// ── Tag Input Component ──

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = 'Add tag…',
}: {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim()
      if (val && !tags.includes(val)) {
        onAdd(val)
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onRemove(tags[tags.length - 1])
    }
  }

  const handleBlur = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onAdd(val)
    }
    setInput('')
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-lg border border-foreground/[0.06] bg-background/50 px-2.5 py-2 min-h-[38px] cursor-text focus-within:border-primary/40 transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary select-none"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
            className="ml-0.5 rounded-full p-0.5 text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="min-w-[60px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
      />
    </div>
  )
}

// ── Day Grouping ──

interface DayGroup {
  dateKey: string
  label: string
  shortDay: string
  fullDayName: string
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
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const result: DayGroup[] = []
  for (const [dateKey, trades] of map) {
    const d = new Date(dateKey + 'T12:00:00')
    const dayIdx = d.getDay()
    result.push({
      dateKey,
      label: formatDate(dateKey),
      shortDay: dayNames[dayIdx],
      fullDayName: fullDayNames[dayIdx],
      trades,
      totalPnl: trades.reduce((s, t) => s + (t.trade.pnl || 0), 0),
    })
  }
  result.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  return result.slice(0, 7)
}

// ── Main Component ──

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [tradePage, setTradePage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [pendingTradeId, setPendingTradeId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isNewTrade, setIsNewTrade] = useState(false)
  const PER_PAGE = 10
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Modal form state
  const [modalSession, setModalSession] = useState<string[]>([])
  const [modalTimeframe, setModalTimeframe] = useState<string[]>([])
  const [modalIctTags, setModalIctTags] = useState<string[]>([])
  const [modalEmotion, setModalEmotion] = useState<string | null>(null)
  const [modalStars, setModalStars] = useState<number | null>(null)
  const [modalPreNotes, setModalPreNotes] = useState('')
  const [modalPostNotes, setModalPostNotes] = useState('')
  const [newInstrument, setNewInstrument] = useState('')
  const [newSide, setNewSide] = useState<'LONG' | 'SHORT' | null>(null)

  const {
    cards, isLoading, expandedId,
    toggleExpand,
    createEntry, updateEntry, deleteEntry,
    addCard, refetch,
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

  // ── Paginated ──
  const filteredCards = activeDayTrades

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
    // Approximate R from pnl distribution
    const winners = pnls.filter(p => p > 0)
    const avgWin = winners.length ? winners.reduce((s, p) => s + p, 0) / winners.length : 0
    const rValue = avgWin > 0 ? totalPnl / avgWin : 0
    return { totalPnl, trades: trades.length, winRate, best, worst, netR: rValue }
  }, [activeDayTrades])

  // ── Equity curve data ──
  const equityData = useMemo(() => {
    let cumulative = 0
    const points = [{ trade: 0, value: 0 }]
    for (const card of activeDayTrades) {
      cumulative += card.trade.pnl || 0
      points.push({ trade: points.length, value: Math.round(cumulative * 100) / 100 })
    }
    return points
  }, [activeDayTrades])

  // ── CRUD handlers ──
  const handleCreate = useCallback(
    async (tradeId: string, accountNumber: string, additionalData?: Record<string, unknown>): Promise<JournalEntry> => {
      return createEntry({ tradeId, accountNumber, ...additionalData })
    },
    [createEntry],
  )

  const handleUpdate = useCallback(
    async (id: string, data: Record<string, unknown>): Promise<JournalEntry> => {
      return updateEntry(id, data)
    },
    [updateEntry],
  )

  const update = useCallback(
    (field: string, value: unknown) => {
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
    closeModal()
  }, [selectedCard, deleteEntry])

  const handlePinToggle = useCallback(() => {
    if (!selectedCard?.journal) return
    update('pinned', !selectedCard.journal.pinned)
  }, [selectedCard, update])

  useEffect(() => { setTradePage(1) }, [selectedDayKey])

  // ── Modal ──

  const openModal = useCallback((card: TradeJournalCard) => {
    toggleExpand(card.trade.id)
    if (!card.journal) {
      handleCreate(card.trade.id, card.trade.accountNumber)
    }
    // Populate modal form from existing journal data
    const j = card.journal
    const allTags: string[] = j?.customTags ?? []
    const knownSessionTags = new Set(SESSION_DEFAULTS)
    const knownTfTags = new Set(TIMEFRAME_DEFAULTS)
    const knownIctTags = new Set(ICT_DEFAULTS)
    setModalSession(allTags.filter(t => knownSessionTags.has(t)))
    setModalTimeframe(allTags.filter(t => knownTfTags.has(t)))
    setModalIctTags(allTags.filter(t => knownIctTags.has(t)))
    setModalEmotion(j?.emotions ?? null)
    setModalStars(j?.confidenceRating ?? null)
    setModalPreNotes(j?.preTradeNotes ?? '')
    setModalPostNotes(j?.postTradeReview ?? '')
    setIsNewTrade(false)
    setModalOpen(true)
  }, [toggleExpand, handleCreate])

  const openNewTradeModal = useCallback(() => {
    // Reset all modal form state
    setModalSession([])
    setModalTimeframe([])
    setModalIctTags([])
    setModalEmotion(null)
    setModalStars(null)
    setModalPreNotes('')
    setModalPostNotes('')
    setNewInstrument('')
    setNewSide(null)
    setIsNewTrade(true)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setDeleteConfirm(false)
  }, [])

  const handleSaveModal = useCallback(async () => {
    if (isNewTrade) {
      const instrument = newInstrument.trim() || 'Manual'
      const entryDate = selectedDayKey || new Date().toISOString().slice(0, 10)
      const trade = await createSingleTradeAction({
        instrument,
        side: newSide || undefined,
        entryDate,
      })
      const newCard: TradeJournalCard = {
        trade: {
          id: trade.id,
          instrument: trade.instrument,
          side: trade.side || '',
          entryPrice: Number(trade.entryPrice),
          closePrice: Number(trade.closePrice),
          pnl: Number(trade.pnl),
          commission: Number(trade.commission),
          quantity: Number(trade.quantity),
          entryDate: trade.entryDate,
          closeDate: trade.closeDate || trade.entryDate,
          timeInPosition: Number(trade.timeInPosition),
          tags: trade.tags || [],
          accountNumber: trade.accountNumber,
        },
        journal: null,
      }
      addCard(newCard)
      const tags = [...modalSession, ...modalTimeframe, ...modalIctTags]
      await handleCreate(trade.id, trade.accountNumber, {
        preTradeNotes: modalPreNotes || null,
        postTradeReview: modalPostNotes || null,
        emotions: modalEmotion,
        confidenceRating: modalStars,
        customTags: tags,
      })
      refetch()
      setModalOpen(false)
      return
    }

    if (!selectedCard?.journal) {
      setModalOpen(false)
      return
    }

    // Build custom tags from all tag arrays
    const tags = [...modalSession, ...modalTimeframe, ...modalIctTags]

    // Update all journal fields at once
    const entryId = selectedCard.journal.id
    if (entryId?.startsWith('temp-')) {
      handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber, {
        preTradeNotes: modalPreNotes || null,
        postTradeReview: modalPostNotes || null,
        emotions: modalEmotion,
        confidenceRating: modalStars,
        customTags: tags,
      })
    } else {
      handleUpdate(entryId, {
        preTradeNotes: modalPreNotes || null,
        postTradeReview: modalPostNotes || null,
        emotions: modalEmotion,
        confidenceRating: modalStars,
        customTags: tags,
      })
    }

    setModalOpen(false)
  }, [isNewTrade, selectedCard, modalSession, modalTimeframe, modalIctTags, modalEmotion, modalStars, modalPreNotes, modalPostNotes, newInstrument, newSide, selectedDayKey, handleCreate, handleUpdate])

  const handleSelectTrade = useCallback((tradeId: string) => {
    if (hasUnsaved && selectedCard?.journal) {
      setPendingTradeId(tradeId)
      return
    }
    const card = displayCards.find(c => c.trade.id === tradeId)
    if (card) {
      openModal(card)
    }
  }, [displayCards, openModal, hasUnsaved, selectedCard])

  // ── Render ──
  return (
    <div className="flex h-full flex-col overflow-hidden space-y-5 p-4 lg:p-6">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between">
        <div className={unifiedSectionEyebrowClassName}>
          {selectedDayKey ? `Week of ${formatFullDate(selectedDayKey)}` : 'Recent Days'}
        </div>
        <button
          type="button"
          onClick={openNewTradeModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Trade
        </button>
      </div>

      {/* ── Weekly Performance Strip ── */}
      <div className="grid grid-cols-7 gap-2.5">
        {dayGroups.map(g => {
          const isSelected = selectedDayKey === g.dateKey
          const pnlPositive = g.totalPnl > 0
          return (
            <button
              key={g.dateKey}
              type="button"
              onClick={() => setSelectedDayKey(isSelected ? null : g.dateKey)}
              className={cn(
                'rounded-xl p-3.5 text-left transition-all duration-200',
                'bg-card/50 border border-foreground/[0.06] hover:border-primary/20',
                isSelected && 'border-primary shadow-[0_0_0_1px,var(--primary),0_8px_24px_rgba(0,255,159,0.1)]',
                'hover:-translate-y-0.5 hover:shadow-lg',
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/50">{g.shortDay}</div>
              <div className="text-[10px] text-muted-foreground/40 mt-0.5">{g.label}</div>
              <div className={cn(
                'text-sm font-semibold tabular-nums mt-2',
                pnlPositive ? 'text-semantic-success' : g.totalPnl < 0 ? 'text-semantic-error' : 'text-muted-foreground/50',
              )}>
                {g.totalPnl > 0 ? '+' : ''}{g.totalPnl === 0 ? '--' : formatPnl(g.totalPnl)}
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

      {/* ── Day Summary + Equity Curve ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Day Summary Panel */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl p-6 space-y-5 bg-card/50 border border-foreground/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <div className={unifiedInfoLabelClassName}>
                {selectedDayKey ? formatFullDate(selectedDayKey) : 'All trades'}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={cn(
                  'text-4xl font-bold tracking-tight tabular-nums',
                  daySummary.totalPnl > 0 ? 'text-semantic-success' : daySummary.totalPnl < 0 ? 'text-semantic-error' : 'text-muted-foreground',
                )}>
                  {formatPnl(daySummary.totalPnl)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={unifiedInfoLabelClassName}>Net R</div>
              <div className={cn(
                'text-xl font-semibold tabular-nums mt-0.5',
                daySummary.netR >= 0 ? 'text-semantic-success' : 'text-semantic-error',
              )}>
                {daySummary.netR >= 0 ? '+' : ''}{daySummary.netR.toFixed(1)}R
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className={unifiedInfoLabelClassName}>Trades</div>
              <div className="text-lg font-semibold tabular-nums mt-1">{daySummary.trades}</div>
            </div>
            <div>
              <div className={unifiedInfoLabelClassName}>Win Rate</div>
              <div className="text-lg font-semibold tabular-nums mt-1">{daySummary.winRate}%</div>
            </div>
            <div>
              <div className={unifiedInfoLabelClassName}>Best</div>
              <div className={cn(
                'text-lg font-semibold tabular-nums mt-1',
                daySummary.best > 0 ? 'text-semantic-success' : 'text-muted-foreground',
              )}>
                {formatPnl(daySummary.best)}
              </div>
            </div>
            <div>
              <div className={unifiedInfoLabelClassName}>Worst</div>
              <div className={cn(
                'text-lg font-semibold tabular-nums mt-1',
                daySummary.worst < 0 ? 'text-semantic-error' : 'text-muted-foreground',
              )}>
                {formatPnl(daySummary.worst)}
              </div>
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl p-6 bg-card/50 border border-foreground/[0.06]">
          <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/50 mb-3">
            Equity Curve
          </div>
          <div className="h-[140px]">
            {equityData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <XAxis
                    dataKey="trade"
                    tick={{ fill: 'rgba(138,144,138,0.5)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(138,144,138,0.5)', fontSize: 11, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface, #111411)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      padding: 10,
                      color: '#f0f4f0',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#8a908a' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'PnL']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary, #00ff9f)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--primary, #00ff9f)', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: 'var(--primary, #00ff9f)' }}
                    fill="rgba(0,255,159,0.05)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground/30">
                No trade data for equity curve
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Trade Log ── */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div className={unifiedSectionEyebrowClassName}>Trade Log</div>
          <div className="text-xs text-muted-foreground/40">Click any row to journal</div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-card/50 border border-foreground/[0.06] flex flex-col" style={{ maxHeight: 'calc(100vh - 480px)' }}>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm">
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground/50 border-b border-foreground/[0.06]">
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">Symbol</th>
                  <th className="text-left px-5 py-3 font-medium">Side</th>
                  <th className="text-right px-5 py-3 font-medium">Entry</th>
                  <th className="text-right px-5 py-3 font-medium">Exit</th>
                  <th className="text-right px-5 py-3 font-medium">PnL</th>
                  <th className="text-right px-5 py-3 font-medium">R</th>
                  <th className="text-right px-5 py-3 font-medium">Duration</th>
                  <th className="text-left px-5 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-foreground/[0.03]">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5"><div className="h-3 bg-muted/20 rounded animate-pulse" /></td>
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
                    const pnlColor = isWin ? 'text-semantic-success' : 'text-semantic-error'

                    // Compute R-multiple approximation
                    const avgWin = activeDayTrades
                      .filter(c => c.trade.pnl > 0)
                      .reduce((s, c) => s + c.trade.pnl, 0) / Math.max(1, activeDayTrades.filter(c => c.trade.pnl > 0).length)
                    const rMultiple = avgWin > 0 ? card.trade.pnl / avgWin : 0

                    // Separate ICT tags from session/timeframe tags
                    const ictTags = (card.journal?.customTags ?? []).filter(t =>
                      ICT_DEFAULTS.includes(t as any)
                    )

                    return (
                      <tr
                        key={card.trade.id}
                        onClick={() => handleSelectTrade(card.trade.id)}
                        className="trade-row border-b border-foreground/[0.03] cursor-pointer transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-muted/15"
                      >
                        <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground/70">{formatTime(card.trade.entryDate)}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold">{card.trade.instrument}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            'text-xs font-medium',
                            card.trade.side?.toUpperCase() === 'LONG' ? 'text-semantic-success' : 'text-semantic-error',
                          )}>
                            {card.trade.side || '--'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm tabular-nums text-right text-muted-foreground/70">
                          {Number(card.trade.entryPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-3.5 text-sm tabular-nums text-right text-muted-foreground/70">
                          {Number(card.trade.closePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={cn('px-5 py-3.5 text-sm tabular-nums text-right font-semibold', pnlColor)}>
                          {formatPnl(card.trade.pnl)}
                        </td>
                        <td className={cn('px-5 py-3.5 text-sm tabular-nums text-right font-medium', pnlColor)}>
                          {rMultiple >= 0 ? '+' : ''}{rMultiple.toFixed(1)}R
                        </td>
                        <td className="px-5 py-3.5 text-xs text-right text-muted-foreground/50">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {formatDuration(card.trade.timeInPosition)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1 flex-wrap">
                            {ictTags.slice(0, 3).map(tag => (
                              <span key={tag} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                {tag}
                              </span>
                            ))}
                          </div>
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
            <div className="shrink-0 border-t border-foreground/[0.04] px-5 py-2 flex items-center justify-between text-[10px] text-muted-foreground/35 tabular-nums">
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
      </div>

      {/* ══════════ TRADE DETAIL MODAL ══════════ */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div className="flex items-start justify-center min-h-screen pt-12 px-4">
            <div
              className="w-full max-w-2xl rounded-2xl overflow-hidden bg-card border border-foreground/[0.06] animate-in slide-in-from-bottom-4 duration-250"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
                <div>
                  <div className="text-lg font-semibold">
                    {isNewTrade
                      ? `New Trade — ${selectedDayKey ? formatDate(selectedDayKey) : formatDate(new Date().toISOString())}`
                      : selectedCard
                        ? `${selectedCard.trade.instrument} ${formatDate(selectedCard.trade.entryDate)} ${formatTime(selectedCard.trade.entryDate)}`
                        : 'Trade Details'
                    }
                  </div>
                  <div className="text-xs mt-0.5 text-muted-foreground/60">
                    {isNewTrade
                      ? "Add a new entry to today's log"
                      : selectedCard
                        ? `${selectedCard.trade.side || '--'} \u2022 ${activeDayTrades.length} trades on this day`
                        : ''
                    }
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCard?.journal && !isNewTrade && (
                    <Fragment>
                      {saving ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 size={12} className="animate-spin text-primary/60" />
                          <span className="text-[9px] text-primary/50">Saving...</span>
                        </div>
                      ) : selectedCard.journal.updatedAt ? (
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-semantic-success/70" />
                          <span className="text-[9px] text-muted-foreground/35">Saved</span>
                        </div>
                      ) : null}
                    </Fragment>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/50 text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* New Trade: instrument & side */}
                {isNewTrade && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className={unifiedInfoLabelClassName}>Instrument</div>
                      <input
                        type="text"
                        value={newInstrument}
                        onChange={e => setNewInstrument(e.target.value.toUpperCase())}
                        placeholder="e.g. ES, NQ, CL…"
                        className="w-full mt-2 rounded-xl px-3 py-2 text-sm outline-none bg-background/50 border border-foreground/[0.06] text-foreground placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <div className={unifiedInfoLabelClassName}>Side</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setNewSide('LONG')}
                          className={cn(
                            'flex-1 rounded-xl px-3 py-2 text-sm font-medium border transition-all',
                            newSide === 'LONG'
                              ? 'border-semantic-success bg-semantic-success/10 text-semantic-success'
                              : 'border-foreground/[0.06] text-muted-foreground/60 hover:text-foreground',
                          )}
                        >
                          Long
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSide('SHORT')}
                          className={cn(
                            'flex-1 rounded-xl px-3 py-2 text-sm font-medium border transition-all',
                            newSide === 'SHORT'
                              ? 'border-semantic-error bg-semantic-error/10 text-semantic-error'
                              : 'border-foreground/[0.06] text-muted-foreground/60 hover:text-foreground',
                          )}
                        >
                          Short
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                {!isNewTrade && selectedCard && (
                  <div className="grid grid-cols-5 gap-3">
                    <div className="rounded-lg p-3 bg-background/50">
                      <div className={unifiedInfoLabelClassName}>Entry</div>
                      <div className="text-sm font-semibold tabular-nums mt-1">
                        {Number(selectedCard.trade.entryPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 bg-background/50">
                      <div className={unifiedInfoLabelClassName}>Exit</div>
                      <div className="text-sm font-semibold tabular-nums mt-1">
                        {Number(selectedCard.trade.closePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 bg-background/50">
                      <div className={unifiedInfoLabelClassName}>PnL</div>
                      <div className={cn(
                        'text-sm font-semibold tabular-nums mt-1',
                        selectedCard.trade.pnl > 0 ? 'text-semantic-success' : 'text-semantic-error',
                      )}>
                        {formatPnl(selectedCard.trade.pnl)}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 bg-background/50">
                      <div className={unifiedInfoLabelClassName}>R-Multiple</div>
                      <div className="text-sm font-semibold tabular-nums mt-1">
                        {(() => {
                          const avgWin = activeDayTrades
                            .filter(c => c.trade.pnl > 0)
                            .reduce((s, c) => s + c.trade.pnl, 0) / Math.max(1, activeDayTrades.filter(c => c.trade.pnl > 0).length)
                          const r = avgWin > 0 ? selectedCard.trade.pnl / avgWin : 0
                          return `${r >= 0 ? '+' : ''}${r.toFixed(1)}R`
                        })()}
                      </div>
                    </div>
                    <div className="rounded-lg p-3 bg-background/50">
                      <div className={unifiedInfoLabelClassName}>Duration</div>
                      <div className="text-sm font-semibold mt-1">
                        {formatDuration(selectedCard.trade.timeInPosition)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Tags */}
                <div>
                  <div className={unifiedInfoLabelClassName}>Session</div>
                  <TagInput
                    tags={modalSession}
                    onAdd={tag => setModalSession(prev => prev.includes(tag) ? prev : [...prev, tag])}
                    onRemove={tag => setModalSession(prev => prev.filter(t => t !== tag))}
                    placeholder="e.g. London, NY, Asia…"
                  />
                </div>

                {/* Timeframe Tags */}
                <div>
                  <div className={unifiedInfoLabelClassName}>Timeframe</div>
                  <TagInput
                    tags={modalTimeframe}
                    onAdd={tag => setModalTimeframe(prev => prev.includes(tag) ? prev : [...prev, tag])}
                    onRemove={tag => setModalTimeframe(prev => prev.filter(t => t !== tag))}
                    placeholder="e.g. 5m, 15m, 1H…"
                  />
                </div>

                {/* ICT Concept Tags */}
                <div>
                  <div className={unifiedInfoLabelClassName}>ICT Concepts</div>
                  <TagInput
                    tags={modalIctTags}
                    onAdd={tag => setModalIctTags(prev => prev.includes(tag) ? prev : [...prev, tag])}
                    onRemove={tag => setModalIctTags(prev => prev.filter(t => t !== tag))}
                    placeholder="e.g. OB, FVG, Liq Sweep…"
                  />
                </div>

                {/* Emotion Chips */}
                <div>
                  <div className={unifiedInfoLabelClassName}>Emotion</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EMOTION_CHIPS.map(emotion => (
                      <Chip
                        key={emotion}
                        label={emotion}
                        active={modalEmotion === emotion}
                        onClick={() => setModalEmotion(prev => prev === emotion ? null : emotion)}
                      />
                    ))}
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <div className={unifiedInfoLabelClassName}>Execution Rating</div>
                  <div className="flex gap-1 mt-2">
                    <RatingStars
                      value={modalStars}
                      onChange={v => setModalStars(v)}
                      size="md"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={unifiedInfoLabelClassName}>Pre-Trade Notes</div>
                    <textarea
                      rows={4}
                      value={modalPreNotes}
                      onChange={e => setModalPreNotes(e.target.value)}
                      placeholder="What was the plan?"
                      className="w-full mt-2 rounded-xl p-3 text-sm resize-none outline-none bg-background/50 border border-foreground/[0.06] text-foreground placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <div className={unifiedInfoLabelClassName}>Post-Trade Review</div>
                    <textarea
                      rows={4}
                      value={modalPostNotes}
                      onChange={e => setModalPostNotes(e.target.value)}
                      placeholder="What happened? How did you execute?"
                      className="w-full mt-2 rounded-xl p-3 text-sm resize-none outline-none bg-background/50 border border-foreground/[0.06] text-foreground placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Screenshots */}
                {!isNewTrade && selectedCard?.journal && (
                  <div>
                    <div className={unifiedInfoLabelClassName}>Screenshots</div>
                    <div className="mt-2">
                      <ScreenshotGrid
                        screenshots={selectedCard.journal.screenshots ?? []}
                        onChange={v => update('screenshots', v)}
                      />
                    </div>
                  </div>
                )}
                {isNewTrade && (
                  <div>
                    <div className={unifiedInfoLabelClassName}>Screenshots</div>
                    <div className="mt-2 flex gap-3">
                      <div className="w-24 h-20 rounded-xl flex items-center justify-center cursor-pointer border border-dashed border-foreground/[0.06] text-muted-foreground/40 hover:border-primary/30">
                        <Plus size={24} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.06]">
                <div className="flex items-center gap-2">
                  {selectedCard?.journal && !isNewTrade && (
                    <Fragment>
                      <button
                        type="button"
                        onClick={handlePinToggle}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
                          selectedCard.journal?.pinned
                            ? 'bg-primary/12 text-primary'
                            : 'text-muted-foreground/45 hover:text-foreground hover:bg-muted/20',
                        )}
                      >
                        <Pin size={10} />
                        {selectedCard.journal?.pinned ? 'Pinned' : 'Pin'}
                      </button>
                      {deleteConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-1 rounded-lg bg-destructive/12 px-2.5 py-1.5 text-[10px] font-medium text-destructive hover:bg-destructive/20"
                          >
                            <Trash2 size={10} /> Confirm
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
                    </Fragment>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 rounded-xl text-sm font-medium text-muted-foreground/60 border border-foreground/[0.06] hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModal}
                    className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Save Journal Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Unsaved changes confirmation ── */}
      {pendingTradeId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border border-foreground/[0.06] bg-card p-6 shadow-2xl">
            <h3 className="text-sm font-semibold">Unsaved changes</h3>
            <p className="mt-2 text-xs text-muted-foreground/60">
              You have unsaved journal content. Switching trades will discard these changes.
            </p>
            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPendingTradeId(null)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasUnsaved(false)
                  setPendingTradeId(null)
                  const card = displayCards.find(c => c.trade.id === pendingTradeId)
                  if (card) openModal(card)
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

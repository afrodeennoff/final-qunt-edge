'use client'

import { useState, useMemo, useCallback, useRef, useEffect, Fragment } from 'react'
import dynamic from 'next/dynamic'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  X, ChevronLeft, ChevronRight, BookOpen, Clock,
  Check, Loader2, Trash2, Pin, Image as ImageIcon, ChevronDown,
} from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { getJournalTagDefaults, saveJournalTagDefaults, type JournalTagDefaults } from '@/server/journal'
import { RatingStars } from './components/rating-stars'
import { ScreenshotGrid } from './components/screenshot-grid'
import type { JournalEntry, TradeJournalCard } from './lib/journal-types'
import { cn } from '@/lib/utils'
import {
  unifiedSectionEyebrowClassName,
  unifiedMetricPanelClassName,
  unifiedInfoLabelClassName,
} from '@/components/layout/unified-page-recipes'
import { useDashboardTrades } from '@/context/data-provider'

const TiptapEditor = dynamic(
  () => import('@/components/tiptap-editor').then(m => ({ default: m.TiptapEditor })),
  { ssr: false, loading: () => <div className="h-[200px] w-full animate-pulse rounded-lg bg-white/5" /> }
)

// ── Constants ──

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

  // Determine the full date range: earliest trade → today
  const today = new Date().toISOString().slice(0, 10)
  let earliest = today
  for (const key of map.keys()) {
    if (key < earliest) earliest = key
  }

  // Build continuous range filling empty days
  const result: DayGroup[] = []
  const current = new Date(earliest + 'T12:00:00')
  const end = new Date(today + 'T12:00:00')
  while (current <= end) {
    const dateKey = current.toISOString().slice(0, 10)
    const trades = map.get(dateKey) ?? []
    const dayIdx = current.getDay()
    result.push({
      dateKey,
      label: formatDate(dateKey),
      shortDay: dayNames[dayIdx],
      fullDayName: fullDayNames[dayIdx],
      trades,
      totalPnl: trades.reduce((s, t) => s + (t.trade.pnl || 0), 0),
    })
    current.setDate(current.getDate() + 1)
  }

  result.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
  return result
}

// ── Main Component ──

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const accounts = useUserStore(s => s.accounts)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [tradePage, setTradePage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)
  const [pendingTradeId, setPendingTradeId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const PER_PAGE = 20
  const DAYS_PER_PAGE = 7
  const [dayPage, setDayPage] = useState(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Account filter state
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountDropRef.current && !accountDropRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Modal form state
  const [modalSession, setModalSession] = useState<string[]>([])
  const [modalTimeframe, setModalTimeframe] = useState<string[]>([])
  const [modalIctTags, setModalIctTags] = useState<string[]>([])
  const [modalEmotion, setModalEmotion] = useState<string | null>(null)
  const [modalStars, setModalStars] = useState<number | null>(null)
  const [modalPreNotes, setModalPreNotes] = useState('')
  const [modalPostNotes, setModalPostNotes] = useState('')
  const [modalScreenshots, setModalScreenshots] = useState<string[]>([])

  // Featured excerpt state
  const [modalExcerptTitle, setModalExcerptTitle] = useState('')
  const [modalFeaturedExcerpt, setModalFeaturedExcerpt] = useState('')
  const [excerptEditorOpen, setExcerptEditorOpen] = useState(false)
  const excerptSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tag defaults loaded from server (persisted per user)
  const [tagDefaults, setTagDefaults] = useState<JournalTagDefaults>({
    sessions: ['London', 'NY', 'Asia'],
    timeframes: ['5m', '15m', '30m', '1H', '4H', 'Daily'],
    ictConcepts: ['OB', 'FVG', 'Liq Sweep', 'Breaker', 'MSS', 'ChoCh'],
  })

  useEffect(() => {
    getJournalTagDefaults().then(defaults => setTagDefaults(defaults))
  }, [])

  const addAndPersistTag = useCallback(
    (category: 'sessions' | 'timeframes' | 'ictConcepts', tag: string) => {
      if (!tagDefaults[category].includes(tag)) {
        const newDefaults = { ...tagDefaults, [category]: [...tagDefaults[category], tag] }
        setTagDefaults(newDefaults)
        saveJournalTagDefaults(newDefaults)
      }
    },
    [tagDefaults],
  )

  const {
    cards: journalCards, isLoading: journalLoading, expandedId,
    toggleExpand,
    createEntry, updateEntry, deleteEntry,
    addCard, refetch, setFilters,
  } = useJournal(userId)

  const { trades: allTrades } = useDashboardTrades()

  const userStoreLoading = useUserStore(s => s.isLoading)
  const isLoading = journalLoading || userStoreLoading || !Array.isArray(allTrades)

  // Sync account filter to journal hook
  useEffect(() => {
    setFilters({ accountNumber: selectedAccount })
  }, [selectedAccount, setFilters])

  // Use ALL trades from DataProvider (unfiltered) — same data as /dashboard/trades
  // Attach any existing journal metadata on top, and apply account filter
  const displayCards = useMemo(() => {
    const journalMap = new Map(journalCards.map(c => [c.trade.id, c.journal]))

    return allTrades
      .filter(t => t && t.id && t.entryDate)
      .filter(t => !selectedAccount || t.accountNumber === selectedAccount)
      .map(trade => {
        const journal = journalMap.get(trade.id) || null
        const entryDate = trade.entryDate instanceof Date 
          ? trade.entryDate.toISOString() 
          : (trade.entryDate || new Date().toISOString())
        const closeDate = trade.closeDate instanceof Date 
          ? trade.closeDate.toISOString() 
          : (trade.closeDate || entryDate)

        return {
          trade: {
            id: trade.id,
            instrument: trade.instrument || 'Unknown',
            side: trade.side || 'Long',
            entryPrice: Number(trade.entryPrice) || 0,
            closePrice: Number(trade.closePrice) || 0,
            pnl: Number(trade.pnl) || 0,
            commission: Number(trade.commission) || 0,
            quantity: Number(trade.quantity) || 0,
            entryDate,
            closeDate,
            timeInPosition: Number(trade.timeInPosition) || 0,
            tags: Array.isArray(trade.tags) ? trade.tags : [],
            accountNumber: trade.accountNumber || '',
          },
          journal,
        } as TradeJournalCard
      })
  }, [allTrades, journalCards, selectedAccount])

  // ── Weekly groups ──
  const dayGroups = useMemo(() => groupByDay(displayCards), [displayCards])

  // Paginate day groups into pages of 7
  const totalDayPages = Math.max(1, Math.ceil(dayGroups.length / DAYS_PER_PAGE))
  const safeDayPage = Math.min(dayPage, totalDayPages - 1)
  const pagedDayGroups = useMemo(
    () => dayGroups.slice(safeDayPage * DAYS_PER_PAGE, (safeDayPage + 1) * DAYS_PER_PAGE),
    [dayGroups, safeDayPage],
  )

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
        const { preTradeNotes, postTradeReview, emotions, confidenceRating, disciplineScore, customTags, screenshots, timeframe, session, excerptTitle, featuredExcerpt } = selectedCard.journal
        handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber, {
          preTradeNotes, postTradeReview, emotions, confidenceRating, disciplineScore, customTags, screenshots, timeframe, session, excerptTitle, featuredExcerpt,
          [field]: value,
        })
        return
      }
      if (entryId) handleUpdate(entryId, { [field]: value })
    },
    [selectedCard, handleCreate, handleUpdate],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (excerptSaveTimerRef.current) clearTimeout(excerptSaveTimerRef.current)
    }
  }, [])

  const handleDelete = useCallback(async () => {
    if (!selectedCard?.journal) return
    await deleteEntry(selectedCard.journal.id)
    setDeleteConfirm(false)
    setModalOpen(false)
  }, [selectedCard, deleteEntry])

  const handlePinToggle = useCallback(() => {
    if (!selectedCard?.journal) return
    update('pinned', !selectedCard.journal.pinned)
  }, [selectedCard, update])

  useEffect(() => { setTradePage(1); setDayPage(0) }, [selectedDayKey])

  // ── Modal ──

  const openModal = useCallback((card: TradeJournalCard) => {
    toggleExpand(card.trade.id)
    if (!card.journal) {
      handleCreate(card.trade.id, card.trade.accountNumber)
    }
    // Populate modal form from existing journal data
    const j = card.journal
    const allTags: string[] = j?.customTags ?? []
    setModalSession(j?.session ? j.session.split(',').map(s => s.trim()).filter(Boolean) : [])
    setModalTimeframe(j?.timeframe ? j.timeframe.split(',').map(s => s.trim()).filter(Boolean) : [])
    setModalIctTags(allTags)
    setModalEmotion(j?.emotions ?? null)
    setModalStars(j?.confidenceRating ?? null)
    setModalPreNotes(j?.preTradeNotes ?? '')
    setModalPostNotes(j?.postTradeReview ?? '')
    setModalScreenshots(j?.screenshots ?? [])
    setModalExcerptTitle(j?.excerptTitle ?? '')
    setModalFeaturedExcerpt(j?.featuredExcerpt ?? '')
    setExcerptEditorOpen(true)   // Default expanded as requested
    setModalOpen(true)
  }, [toggleExpand, handleCreate])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setDeleteConfirm(false)
  }, [])

  const handleSaveModal = useCallback(async () => {
    if (!selectedCard?.journal) {
      setModalOpen(false)
      return
    }

    // Build custom tags from ICT tags only; session/timeframe go to dedicated fields
    const tags = [...modalIctTags]

    // Update all journal fields at once
    const entryId = selectedCard.journal.id
    if (entryId?.startsWith('temp-')) {
      handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber, {
        preTradeNotes: modalPreNotes || null,
        postTradeReview: modalPostNotes || null,
        emotions: modalEmotion,
        confidenceRating: modalStars,
        customTags: tags,
        timeframe: modalTimeframe.join(', ') || null,
        session: modalSession.join(', ') || null,
        screenshots: modalScreenshots,
        excerptTitle: modalExcerptTitle || null,
        featuredExcerpt: modalFeaturedExcerpt || null,
      })
    } else {
      handleUpdate(entryId, {
        preTradeNotes: modalPreNotes || null,
        postTradeReview: modalPostNotes || null,
        emotions: modalEmotion,
        confidenceRating: modalStars,
        customTags: tags,
        timeframe: modalTimeframe.join(', ') || null,
        session: modalSession.join(', ') || null,
        screenshots: modalScreenshots,
        excerptTitle: modalExcerptTitle || null,
        featuredExcerpt: modalFeaturedExcerpt || null,
      })
    }

    setModalOpen(false)
  }, [selectedCard, modalSession, modalTimeframe, modalIctTags, modalEmotion, modalStars, modalPreNotes, modalPostNotes, selectedDayKey, handleCreate, handleUpdate, modalExcerptTitle, modalFeaturedExcerpt])

  const handleSelectTrade = useCallback((tradeId: string) => {
    const card = displayCards.find(c => c.trade.id === tradeId)
    if (card) {
      openModal(card)
    }
  }, [displayCards, openModal])

  // ── Render ──
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground space-y-4 p-4 lg:p-6">
      {/* ── Week Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {totalDayPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDayPage(p => Math.max(0, p - 1))}
                disabled={safeDayPage <= 0}
                className="rounded-lg p-1 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] tabular-nums text-white/30 min-w-[40px] text-center">{safeDayPage + 1} / {totalDayPages}</span>
              <button
                type="button"
                onClick={() => setDayPage(p => Math.min(totalDayPages - 1, p + 1))}
                disabled={safeDayPage >= totalDayPages - 1}
                className="rounded-lg p-1 text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          <div className="text-[11px] font-semibold tracking-[2px] uppercase text-primary">
            {pagedDayGroups.length > 0
              ? `${pagedDayGroups[pagedDayGroups.length - 1]?.label.toUpperCase()} \u2013 ${pagedDayGroups[0]?.label.toUpperCase()}`
              : 'TRADING DAYS'}
          </div>
          <button
            type="button"
            onClick={() => { setSelectedDayKey(null); setDayPage(0) }}
            className={cn(
              'rounded-lg px-2 py-0.5 text-[10px] border transition-colors',
              selectedDayKey === null
                ? 'border-primary/30 text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {'All (' + dayGroups.filter(g => g.trades.length > 0).length + ' trading days, ' + dayGroups.reduce((s, g) => s + g.trades.length, 0) + ' trades)'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 1 && (
            <div ref={accountDropRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <span>{selectedAccount ? 'Acct ' + selectedAccount : 'All Accounts'}</span>
                <ChevronDown size={12} className={cn('transition-transform', accountOpen && 'rotate-180')} />
              </button>
              {accountOpen && (
                <div className="absolute top-full mt-1 right-0 z-20 min-w-[180px] rounded-xl border border-border bg-card py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedAccount(null); setAccountOpen(false) }}
                    className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 transition-colors', !selectedAccount ? 'text-primary' : 'text-muted-foreground')}
                  >
                    All Accounts
                  </button>
                  {accounts.map(a => (
                    <button
                      key={a.number}
                      type="button"
                      onClick={() => { setSelectedAccount(a.number === selectedAccount ? null : a.number); setAccountOpen(false) }}
                      className={cn('w-full text-left px-3 py-1.5 text-[11px] hover:bg-muted/50 transition-colors', a.number === selectedAccount ? 'text-primary' : 'text-muted-foreground')}
                    >
                      {a.number}{a.propfirm ? ' \u2013 ' + a.propfirm : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Day Performance Strip (paginated, shows 7 days per page, continuous calendar) ── */}
      <div className="grid grid-cols-7 gap-2">
        {pagedDayGroups.map(g => {
          const isSelected = selectedDayKey === g.dateKey
          const pnlPositive = g.totalPnl > 0
          const hasTrades = g.trades.length > 0
          return (
            <button
              key={g.dateKey}
              type="button"
              onClick={() => setSelectedDayKey(isSelected ? null : g.dateKey)}
              className={cn(
                'rounded-xl p-4 text-left transition-all border min-h-[110px]',
                hasTrades
                  ? 'bg-card border-border hover:border-primary/30'
                  : 'bg-card/50 border-border',
                isSelected && 'border-primary ring-1 ring-primary/30',
              )}
            >
              <div className={cn('text-[10px] font-medium tracking-widest', hasTrades ? 'text-white/60' : 'text-white/30')}>{g.shortDay}</div>
              <div className={cn('text-[10px] mt-0.5', hasTrades ? 'text-white/40' : 'text-white/20')}>{g.label}</div>
              <div className={cn(
                'text-[17px] font-semibold tabular-nums mt-3 tracking-tight',
                pnlPositive ? 'text-primary' : g.totalPnl < 0 ? 'text-destructive' : 'text-muted-foreground/40',
              )}>
                {g.totalPnl > 0 ? '+' : ''}{g.totalPnl === 0 ? '—' : formatPnl(g.totalPnl)}
              </div>
              <div className={cn('text-[10px] mt-1.5', hasTrades ? 'text-white/30' : 'text-white/15')}>
                {hasTrades ? `${g.trades.length} trades` : 'No trades'}
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Day Summary + Equity Curve ── */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left: Day Summary */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl p-6 bg-card border border-border min-h-[200px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] text-white/50 tracking-widest">
                {selectedDayKey ? formatFullDate(selectedDayKey) : 'ALL TRADES'}
              </div>
              <div className={cn(
                'text-[42px] font-semibold tabular-nums tracking-[-1.5px] mt-1 leading-none',
                daySummary.totalPnl > 0 ? 'text-primary' : daySummary.totalPnl < 0 ? 'text-destructive' : 'text-muted-foreground/60'
              )}>
                {formatPnl(daySummary.totalPnl)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/40 tracking-[1px]">NET R</div>
              <div className={cn(
                'text-2xl font-semibold tabular-nums mt-0.5',
                daySummary.netR >= 0 ? 'text-primary' : 'text-destructive'
              )}>
                {daySummary.netR >= 0 ? '+' : ''}{daySummary.netR.toFixed(1)}R
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="text-[9px] text-white/40 tracking-widest">TRADES</div>
              <div className="text-xl font-semibold tabular-nums mt-1 text-white">{daySummary.trades}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="text-[9px] text-white/40 tracking-widest">WIN RATE</div>
              <div className="text-xl font-semibold tabular-nums mt-1 text-white">{daySummary.winRate}%</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="text-[9px] text-white/40 tracking-widest">BEST</div>
              <div className="text-xl font-semibold tabular-nums mt-1 text-primary">{formatPnl(daySummary.best)}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <div className="text-[9px] text-white/40 tracking-widest">WORST</div>
              <div className="text-xl font-semibold tabular-nums mt-1 text-destructive">{formatPnl(daySummary.worst)}</div>
            </div>
          </div>
        </div>

        {/* Right: Equity Curve */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl p-6 bg-card border border-border min-h-[200px]">
          <div className="text-[10px] font-medium tracking-[2px] text-primary/70 mb-2">EQUITY CURVE</div>
          <div className="h-[160px]">
            {equityData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData.map((p, i) => ({...p, idx: i+1}))} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 2" />
                  <XAxis
                    dataKey="idx"
                    tick={{ fill: '#4a524d', fontSize: 10 }}
                    axisLine={{ stroke: '#1f2421' }}
                    tickLine={false}
                    tickFormatter={(v) => `#${v}`}
                  />
                  <YAxis
                    tick={{ fill: '#4a524d', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#1f2421' }}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip
                    contentStyle={{ background: '#0a0c0a', border: '1px solid #222', borderRadius: 6, fontSize: 11, color: '#ddd' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--primary)', r: 3, stroke: 'var(--background)', strokeWidth: 1 }}
                    activeDot={{ r: 5, fill: 'var(--primary)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-white/20">No trades yet — equity will appear here</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Trade Log (styled to match reference) ── */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-[10px] font-medium tracking-[2px] text-primary">TRADE LOG</div>
          <div className="text-[10px] text-white/30">Click any row to journal</div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-card border border-border flex flex-col" style={{ maxHeight: 'calc(100vh - 460px)' }}>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card/80">
                <tr className="text-[10px] uppercase tracking-[1px] text-muted-foreground border-b border-border">
                  <th className="text-left pl-4 pr-3 py-2.5 font-medium">TIME</th>
                  <th className="text-left px-3 py-2.5 font-medium">SYMBOL</th>
                  <th className="text-left px-3 py-2.5 font-medium">SIDE</th>
                  <th className="text-right px-3 py-2.5 font-medium">ENTRY</th>
                  <th className="text-right px-3 py-2.5 font-medium">EXIT</th>
                  <th className="text-right px-3 py-2.5 font-medium">PNL</th>
                  <th className="text-right px-3 py-2.5 font-medium">R</th>
                  <th className="text-right px-3 py-2.5 font-medium">DURATION</th>
                  <th className="text-left pl-3 pr-4 py-2.5 font-medium">TAGS</th>
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
                      tagDefaults.ictConcepts.includes(t)
                    )

                     return (
                       <tr
                         key={card.trade.id}
                         onClick={() => handleSelectTrade(card.trade.id)}
                         className="border-b border-border cursor-pointer hover:bg-muted/30 transition-colors"
                       >
                         <td className="pl-4 pr-3 py-2.5 tabular-nums text-white/50 text-xs">{formatTime(card.trade.entryDate)}</td>
                         <td className="px-3 py-2.5 font-semibold text-white tracking-tight">{card.trade.instrument}</td>
                         <td className="px-3 py-2.5">
                           <span className={cn(
                             'text-xs font-semibold tracking-wider',
                             card.trade.side?.toUpperCase() === 'LONG' ? 'text-primary' : 'text-destructive',
                           )}>
                             {card.trade.side || '—'}
                           </span>
                         </td>
                         <td className="px-3 py-2.5 tabular-nums text-right text-white/70 text-xs">
                           {Number(card.trade.entryPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </td>
                         <td className="px-3 py-2.5 tabular-nums text-right text-white/70 text-xs">
                           {Number(card.trade.closePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </td>
                         <td className={cn('px-3 py-2.5 tabular-nums text-right font-semibold text-xs', pnlColor)}>
                           {formatPnl(card.trade.pnl)}
                         </td>
                         <td className={cn('px-3 py-2.5 tabular-nums text-right font-medium text-xs', pnlColor)}>
                           {rMultiple >= 0 ? '+' : ''}{rMultiple.toFixed(1)}R
                         </td>
                         <td className="px-3 py-2.5 text-right text-white/40 text-[10px]">
                           <span className="inline-flex items-center gap-1">
                             <Clock size={9} />
                             {formatDuration(card.trade.timeInPosition)}
                           </span>
                         </td>
                         <td className="pl-3 pr-4 py-2.5">
                           <div className="flex gap-1 flex-wrap">
                             {ictTags.slice(0, 3).map(tag => (
                               <span key={tag} className="rounded bg-primary/10 px-1.5 py-px text-[9px] font-medium text-primary border border-primary/30">
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
          <div className="flex items-center justify-center h-screen p-4">
            <div
              className="w-full max-w-5xl max-h-full flex flex-col rounded-2xl overflow-hidden bg-card border border-foreground/[0.06] animate-in slide-in-from-bottom-4 duration-250"
              onClick={e => e.stopPropagation()}
            >
               {/* Modal Header — fixed at top */}
               <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
                 <div>
                   <div className="text-[17px] font-semibold tracking-tight">
                     {selectedCard
                       ? `${selectedCard.trade.instrument} ${formatDate(selectedCard.trade.entryDate)} ${formatTime(selectedCard.trade.entryDate)}`
                       : 'Trade Details'
                     }
                   </div>
                   <div className="text-[11px] text-white/50 mt-0.5">
                     {selectedCard
                       ? `${selectedCard.trade.side || '—'} • ${activeDayTrades.length} trades on this day`
                       : ''
                     }
                   </div>
                 </div>
                 <button type="button" onClick={closeModal} className="text-white/40 hover:text-white p-1">
                   <X size={18} />
                 </button>
               </div>

              {/* Modal Body — scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background text-foreground">

                {/* 5 Stat Cards Row (exact visual from image) */}
                {selectedCard && (() => {
                  const avgWin = activeDayTrades.filter(c => c.trade.pnl > 0).reduce((s,c)=>s+c.trade.pnl,0) / Math.max(1, activeDayTrades.filter(c=>c.trade.pnl>0).length || 1)
                  const r = avgWin > 0 ? selectedCard.trade.pnl / avgWin : 0
                  return (
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        {label:'ENTRY', val: Number(selectedCard.trade.entryPrice).toLocaleString('en-US',{minimumFractionDigits:2})},
                        {label:'EXIT', val: Number(selectedCard.trade.closePrice).toLocaleString('en-US',{minimumFractionDigits:2})},
                        {label:'PNL', val: formatPnl(selectedCard.trade.pnl), green: selectedCard.trade.pnl>0, red: selectedCard.trade.pnl<0},
                        {label:'R-MULTIPLE', val: `${r>=0?'+':''}${r.toFixed(1)}R`},
                        {label:'DURATION', val: formatDuration(selectedCard.trade.timeInPosition)},
                      ].map((s,i) => (
                        <div key={i} className="rounded-lg bg-muted/40 p-2.5 text-center border border-border">
                          <div className="text-[9px] text-white/40 tracking-[1px]">{s.label}</div>
                          <div className={cn('text-sm font-semibold tabular-nums mt-1', s.green ? 'text-primary' : s.red ? 'text-destructive' : 'text-foreground')}>
                            {s.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* SESSION */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">SESSION</div>
                  <TagInput
                    tags={modalSession}
                    onAdd={(tag) => {
                      if (!modalSession.includes(tag)) {
                        setModalSession([...modalSession, tag])
                        addAndPersistTag('sessions', tag)
                      }
                    }}
                    onRemove={(tag) => setModalSession(modalSession.filter(x => x !== tag))}
                    placeholder={tagDefaults.sessions.length ? `e.g. ${tagDefaults.sessions[0]}…` : 'Add session…'}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tagDefaults.sessions
                      .filter(s => !modalSession.includes(s))
                      .map(s => (
                        <button key={s} type="button" onClick={() => setModalSession([...modalSession, s])}
                          className="px-2 py-0.5 rounded text-[10px] border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition">
                          + {s}
                        </button>
                      ))}
                  </div>
                </div>

                {/* TIMEFRAME */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">TIMEFRAME</div>
                  <TagInput
                    tags={modalTimeframe}
                    onAdd={(tag) => {
                      if (!modalTimeframe.includes(tag)) {
                        setModalTimeframe([...modalTimeframe, tag])
                        addAndPersistTag('timeframes', tag)
                      }
                    }}
                    onRemove={(tag) => setModalTimeframe(modalTimeframe.filter(x => x !== tag))}
                    placeholder={tagDefaults.timeframes.length ? `e.g. ${tagDefaults.timeframes[0]}…` : 'Add timeframe…'}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tagDefaults.timeframes
                      .filter(tf => !modalTimeframe.includes(tf))
                      .map(tf => (
                        <button key={tf} type="button" onClick={() => setModalTimeframe([...modalTimeframe, tf])}
                          className="px-2 py-0.5 rounded text-[10px] border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition">
                          + {tf}
                        </button>
                      ))}
                  </div>
                </div>

                {/* ICT CONCEPTS */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">ICT CONCEPTS</div>
                  <TagInput
                    tags={modalIctTags}
                    onAdd={(tag) => {
                      if (!modalIctTags.includes(tag)) {
                        setModalIctTags([...modalIctTags, tag])
                        addAndPersistTag('ictConcepts', tag)
                      }
                    }}
                    onRemove={(tag) => setModalIctTags(modalIctTags.filter(x => x !== tag))}
                    placeholder={tagDefaults.ictConcepts.length ? `e.g. ${tagDefaults.ictConcepts[0]}…` : 'Add concept…'}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tagDefaults.ictConcepts
                      .filter(c => !modalIctTags.includes(c))
                      .map(c => (
                        <button key={c} type="button" onClick={() => setModalIctTags([...modalIctTags, c])}
                          className="px-2 py-0.5 rounded text-[10px] border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition">
                          + {c}
                        </button>
                      ))}
                  </div>
                </div>

                {/* EMOTION */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">EMOTION</div>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOTION_CHIPS.map(em => {
                      const active = modalEmotion === em
                      return <button key={em} type="button" onClick={() => setModalEmotion(active ? null : em)}
                        className={cn('px-3 py-1 rounded-full text-xs border transition', active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30')}>
                        {em}
                      </button>
                    })}
                  </div>
                </div>

                {/* EXECUTION RATING — stars */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">EXECUTION RATING</div>
                  <div className="flex gap-1 mt-1">
                    <RatingStars value={modalStars} onChange={v => setModalStars(v)} size="md" />
                  </div>
                </div>

                {/* Notes — side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-white/50 tracking-widest mb-1.5">PRE-TRADE NOTES</div>
                    <textarea rows={3} value={modalPreNotes} onChange={e=>setModalPreNotes(e.target.value)}
                      placeholder="What was the plan?"
                      className="w-full rounded-lg p-3 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground resize-y" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/50 tracking-widest mb-1.5">POST-TRADE REVIEW</div>
                    <textarea rows={3} value={modalPostNotes} onChange={e=>setModalPostNotes(e.target.value)}
                      placeholder="What happened? How did you execute?"
                      className="w-full rounded-lg p-3 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground resize-y" />
                  </div>
                </div>

                {/* FEATURED EXCERPT — always visible, expand/collapse */}
                <div className="rounded-xl bg-muted/30 border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-white/50 tracking-widest">FEATURED EXCERPT</div>
                    <button
                      type="button"
                      onClick={() => setExcerptEditorOpen(!excerptEditorOpen)}
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded border transition-colors',
                        excerptEditorOpen
                          ? 'border-border text-muted-foreground hover:text-foreground'
                          : 'border-primary/30 text-primary hover:bg-primary/10'
                      )}
                    >
                      {excerptEditorOpen ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {/* Title input — always visible */}
                  <input
                    type="text"
                    value={modalExcerptTitle}
                    onChange={e => {
                      setModalExcerptTitle(e.target.value)
                      setHasUnsaved(true)
                    }}
                    placeholder="Give this excerpt a title..."
                    maxLength={200}
                    className="w-full rounded-lg px-3 py-2 text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />

                  {/* Rich text editor — expanded */}
                  {excerptEditorOpen && (
                    <div className="rounded-lg border border-border overflow-hidden bg-card">
                      <TiptapEditor
                        content={modalFeaturedExcerpt}
                        onChange={(html) => {
                          setModalFeaturedExcerpt(html)
                          setHasUnsaved(true)
                          if (excerptSaveTimerRef.current) clearTimeout(excerptSaveTimerRef.current)
                          excerptSaveTimerRef.current = setTimeout(() => {
                            if (selectedCard?.journal && !selectedCard.journal.id.startsWith('temp-')) {
                              update('featuredExcerpt', html || null)
                            }
                          }, 1500)
                        }}
                        placeholder="Write your featured trade reflection..."
                        height="220px"
                        width="100%"
                        className="!bg-muted"
                      />
                      <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/40">
                        <span className="text-[9px] text-white/25">Rich text formatting supported</span>
                      </div>
                    </div>
                  )}

                  {/* Collapsed preview */}
                  {!excerptEditorOpen && (modalExcerptTitle || modalFeaturedExcerpt) && (
                    <div
                      onClick={() => setExcerptEditorOpen(true)}
                      className="rounded-lg border border-border p-3 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      <div className="text-xs font-medium text-white/80 truncate">
                        {modalExcerptTitle || 'Untitled excerpt'}
                      </div>
                      {modalFeaturedExcerpt && (
                        <div
                          className="text-[11px] text-white/40 mt-2 line-clamp-3 [&_p]:mb-1 [&_strong]:text-white/60 max-w-[600px]"
                          dangerouslySetInnerHTML={{ __html: modalFeaturedExcerpt }}
                        />
                      )}
                    </div>
                  )}

                  {!excerptEditorOpen && !modalExcerptTitle && !modalFeaturedExcerpt && (
                    <div className="text-[11px] text-white/20 text-center py-2">
                      Click "Expand" to write a featured trade reflection
                    </div>
                  )}

                  <div className="text-[9px] text-white/25">Excerpts appear in your Statistics page journal log.</div>
                </div>

                {/* Screenshots */}
                <div>
                  <div className="text-[10px] text-white/50 tracking-widest mb-1.5">SCREENSHOTS</div>
                  <ScreenshotGrid
                    screenshots={selectedCard?.journal?.screenshots ?? []}
                    onChange={v => {
                      setModalScreenshots(v)
                      if (selectedCard?.journal) update('screenshots', v)
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer — fixed at bottom */}
                 <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  {selectedCard?.journal && (
                    <Fragment>
                      <button type="button" onClick={handlePinToggle}
                        className={cn('flex items-center gap-1 px-2 py-1 rounded border', selectedCard.journal.pinned ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                        <Pin size={11}/> {selectedCard.journal.pinned ? 'Pinned' : 'Pin'}
                      </button>
                      {deleteConfirm ? (
                        <span className="flex items-center gap-2 text-destructive">
                          <button onClick={handleDelete} className="hover:underline">Confirm delete</button>
                          <button onClick={() => setDeleteConfirm(false)} className="text-white/40">cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(true)} className="text-muted-foreground hover:text-destructive flex items-center gap-1">
                          <Trash2 size={11}/> Delete
                        </button>
                      )}
                    </Fragment>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={closeModal}
                    className="px-5 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl">
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveModal}
                    className="px-6 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-[0.985] transition">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/60 backdrop-blur-sm">
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

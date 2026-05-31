'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, Star, Pin, Trash2, Check, Loader2,
  ChevronDown, Clock, Hash, Image as ImageIcon, PenLine,
  ArrowUpRight, ArrowDownRight, BookOpen, X, Sparkles,
} from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { RatingStars } from './components/rating-stars'
import { TagTabs } from './components/tag-tabs'
import { JournalStatsBar } from './components/journal-stats-bar'
import { ScreenshotGrid } from './components/screenshot-grid'
import { SUGGESTED_TAGS } from './lib/journal-constants'
import type { JournalEntry, TradeJournalCard } from './lib/journal-types'
import { cn } from '@/lib/utils'

// ── Sample/Demo Data for Empty State ──
const DEMO_TRADES: TradeJournalCard[] = [
  {
    trade: {
      id: 'demo-1',
      userId: 'demo-user',
      accountNumber: 'PRO-001',
      instrument: 'NQ',
      side: 'LONG',
      pnl: 1250.50,
      entryDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      size: 3,
      stopLoss: null,
      takeProfit: null,
      notes: 'Clean breakout from consolidation. Confirmed momentum with volume spike.',
    },
    journal: {
      id: 'demo-1-journal',
      userId: 'demo-user',
      tradeId: 'demo-1',
      accountNumber: 'PRO-001',
      preTradeNotes: 'Breakout pattern confirmed at $18,500. Size reduced by 30%.',
      postTradeReview: 'Excellent execution. Did not chase the pullback. Strict discipline.',
      emotions: null,
      confidenceRating: 85,
      disciplineScore: 92,
      customTags: ['breakout', 'momentum'],
      screenshots: [],
      pinned: false,
      archived: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  },
  {
    trade: {
      id: 'demo-2',
      userId: 'demo-user',
      accountNumber: 'PRO-001',
      instrument: 'ES',
      side: 'SHORT',
      pnl: -340.25,
      entryDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      size: 5,
      stopLoss: null,
      takeProfit: null,
      notes: 'Failed attempt to fade the gap. Re-entry on pullback would have been better.',
    },
    journal: {
      id: 'demo-2-journal',
      userId: 'demo-user',
      tradeId: 'demo-2',
      accountNumber: 'PRO-001',
      preTradeNotes: 'Gap up at open. Was tempting to fade but decided to wait for retest.',
      postTradeReview: 'Should have entered on the first pullback to midday range. No valid reason to stay out.',
      emotions: null,
      confidenceRating: 65,
      disciplineScore: 58,
      customTags: ['gap', 'discipline'],
      screenshots: [],
      pinned: true,
      archived: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  },
  {
    trade: {
      id: 'demo-3',
      userId: 'demo-user',
      accountNumber: 'PRO-002',
      instrument: 'RTY',
      side: 'LONG',
      pnl: 480.00,
      entryDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      size: 2,
      stopLoss: null,
      takeProfit: null,
      notes: 'Morning range breakout with tight stops. Good use of 3R risk management.',
    },
    journal: {
      id: 'demo-3-journal',
      userId: 'demo-user',
      tradeId: 'demo-3',
      accountNumber: 'PRO-002',
      preTradeNotes: 'Waiting for retest of morning high. Stop placed 3R below entry.',
      postTradeReview: 'Perfect risk-reward execution. Booked half profit at +2R, let rest run.',
      emotions: null,
      confidenceRating: 90,
      disciplineScore: 88,
      customTags: ['risk', 'profit-taking'],
      screenshots: [],
      pinned: false,
      archived: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  },
]

// ── Formatters ──

function formatPnl(pnl: number) {
  const sign = pnl >= 0 ? '+' : ''
  return `${sign}$${Math.abs(pnl).toFixed(2)}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Formats a duration stored in **seconds** into a human-readable string.
 * The database `timeInPosition` field is stored in seconds.
 */
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
      {/* Existing tags */}
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

      {/* Input */}
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

        {/* Autocomplete dropdown */}
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

// ── Section Header (collapsible) ──

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

// ── Trade List Item ──

function TradeListItem({
  card,
  isSelected,
  onSelect,
}: {
  card: TradeJournalCard
  isSelected: boolean
  onSelect: () => void
}) {
  const isWin = card.trade.pnl > 0
  const isBreakeven = Math.abs(card.trade.pnl) < 0.01
  const hasJournal = card.journal !== null
  const pnlColor = isBreakeven
    ? 'text-muted-foreground'
    : isWin ? 'text-semantic-success' : 'text-semantic-danger'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full flex-col gap-1.5 rounded-xl px-3 py-3 text-left transition-all duration-100',
        isSelected
          ? 'bg-primary/8 shadow-sm'
          : 'hover:bg-muted/20',
      )}
    >
      {/* Row 1: instrument + side + journal dot */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
          hasJournal ? 'bg-primary' : 'bg-muted-foreground/20',
        )} />
        <span className="text-[13px] font-semibold tracking-tight truncate">
          {card.trade.instrument}
        </span>
        <span className={cn(
          'ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider',
          card.trade.side?.toUpperCase() === 'LONG'
            ? 'bg-semantic-success/10 text-semantic-success'
            : 'bg-semantic-danger/10 text-semantic-danger',
        )}>
          {card.trade.side || '—'}
        </span>
      </div>

      {/* Row 2: PnL + duration */}
      <div className="flex items-center gap-2 pl-3.5">
        <span className="text-[11px] text-muted-foreground/70">
          {formatDate(card.trade.entryDate)}
        </span>
        <span className={cn('ml-auto text-[12px] font-bold tabular-nums', pnlColor)}>
          {formatPnl(card.trade.pnl)}
        </span>
      </div>

      {/* Row 3: tags + confidence */}
      {card.journal && (
        <div className="flex items-center gap-1 pl-3.5">
          {card.journal.customTags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-full bg-primary/8 px-1.5 py-0.5 text-[8px] font-medium text-primary/80">
              {tag}
            </span>
          ))}
          {card.journal.confidenceRating != null && (
            <div className="ml-auto flex items-center gap-0.5">
              <Star size={8} className="fill-primary/60 text-primary/60" />
              <span className="text-[8px] text-muted-foreground/60 tabular-nums">
                {card.journal.confidenceRating}
              </span>
            </div>
          )}
          {card.journal.pinned && <Pin size={8} className="text-primary/50" />}
        </div>
      )}
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    cards, stats, isLoading, expandedId,
    toggleExpand,
    createEntry, updateEntry, deleteEntry,
  } = useJournal(userId)

  // Use demo data when no real trades exist
  const displayCards = useMemo(() => {
    if (cards.length > 0) return cards
    // Show demo data for visual demonstration
    return isLoading ? [] : DEMO_TRADES
  }, [cards, isLoading])

  const selectedCard = cards.find(c => c.trade.id === expandedId) ?? null

  const filteredCards = useMemo(() => {
    let result = displayCards
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
  }, [displayCards, search, statusFilter])

  const handleCreate = useCallback(
    async (tradeId: string, accountNumber: string): Promise<JournalEntry> => {
      return createEntry({ tradeId, accountNumber })
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
      saveTimerRef.current = setTimeout(() => setSaving(false), 1500)
      if (entryId.startsWith('temp-')) {
        handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)
        return
      }
      handleUpdate(entryId, { [field]: value })
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

  const handleSelectTrade = useCallback((tradeId: string) => {
    toggleExpand(tradeId)
    const card = cards.find(c => c.trade.id === tradeId)
    if (card && !card.journal) {
      handleCreate(tradeId, card.trade.accountNumber)
    }
  }, [cards, toggleExpand, handleCreate])

  const toggleSection = useCallback((section: string) => {
    setActiveSection(prev => ({ ...prev, [section]: !prev[section] }))
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Demo indicator */}
      {displayCards.length > 0 && displayCards.every(c => c.trade.id.startsWith('demo-')) && (
        <div className="shrink-0 px-5 py-2 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles size={3} className="text-primary" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
              Demo Mode — Sample Data
            </span>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="shrink-0 px-5 pb-4 pt-5">
        <JournalStatsBar stats={stats} />
      </div>

      {/* Main split pane */}
      <div className="flex flex-1 overflow-hidden rounded-xl bg-card/30">
        {/* ── Sidebar — Trade list ── */}
        <div className="flex w-[340px] shrink-0 flex-col bg-background/20">
          {/* Search + filters */}
          <div className="space-y-2.5 p-3 pb-3">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search instruments, notes, tags..."
                className="h-8 w-full rounded-lg border-0 bg-background/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'journaled', 'not-journaled'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                    statusFilter === s
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  {s === 'all' ? 'All' : s === 'journaled' ? 'Journaled' : 'No entry'}
                </button>
              ))}
            </div>
          </div>

          {/* Trade list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl bg-muted/15" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <BookOpen size={20} className="text-muted-foreground/25" />
                <p className="text-xs text-muted-foreground/50">No trades found</p>
                <p className="text-[10px] text-muted-foreground/30 mt-1">Import trades or create your first journal entry</p>
              </div>
            ) : (
              <div className="space-y-0.5 px-2 py-1">
                {filteredCards.map(card => (
                  <TradeListItem
                    key={card.trade.id}
                    card={card}
                    isSelected={expandedId === card.trade.id}
                    onSelect={() => handleSelectTrade(card.trade.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-3 py-2 text-[10px] text-muted-foreground/35 tabular-nums">
            {filteredCards.length} of {displayCards.length} trades · {displayCards.filter(c => c.journal !== null).length} journaled
          </div>
        </div>

        {/* ── Main panel — Journal editor ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {!selectedCard ? (
            /* Empty state */
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8">
              <div className="rounded-2xl bg-muted/15 p-5">
                <BookOpen size={28} className="text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground/70">Select a trade to journal</p>
                <p className="mt-1 text-xs text-muted-foreground/45 max-w-[260px]">
                  Choose a closed trade from the sidebar to review performance and add notes, tags, and reflections
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-1">
              {/* ── Trade context header ── */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold tracking-tight">{selectedCard.trade.instrument}</h2>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                    selectedCard.trade.side?.toUpperCase() === 'LONG'
                      ? 'bg-semantic-success/10 text-semantic-success'
                      : 'bg-semantic-danger/10 text-semantic-danger',
                  )}>
                    {selectedCard.trade.side?.toUpperCase() === 'LONG'
                      ? <ArrowUpRight size={10} />
                      : <ArrowDownRight size={10} />
                    }
                    {selectedCard.trade.side || '—'}
                  </span>
                  <span className={cn(
                    'ml-auto text-base font-bold tabular-nums',
                    selectedCard.trade.pnl > 0 ? 'text-semantic-success' : Math.abs(selectedCard.trade.pnl) < 0.01 ? 'text-muted-foreground' : 'text-semantic-danger',
                  )}>
                    {formatPnl(selectedCard.trade.pnl)}
                  </span>
                </div>

                {/* Trade metrics row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/65">
                  <span>Entry ${selectedCard.trade.entryPrice.toFixed(2)}</span>
                  <span>Exit ${selectedCard.trade.closePrice.toFixed(2)}</span>
                  <span>Qty {selectedCard.trade.quantity}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatDuration(selectedCard.trade.timeInPosition)}
                  </span>
                  <span>Comm ${selectedCard.trade.commission.toFixed(2)}</span>
                  {selectedCard.journal?.pinned && (
                    <span className="flex items-center gap-1 text-primary/60">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>

                {/* Action bar */}
                {selectedCard.journal && (
                  <div className="flex items-center gap-2 pt-1">
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

              <div className="h-px bg-foreground/[0.04]" />

              {/* ── Journal sections ── */}
              {!selectedCard.journal ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="rounded-2xl bg-primary/6 p-4">
                    <PenLine size={24} className="text-primary/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground/60">No journal entry yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/45">Click below to start reflecting on this trade</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)}
                    className="rounded-xl bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary/18 transition-colors"
                  >
                    Start journaling
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* Pre-trade notes */}
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

                  {/* Post-trade review */}
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

                  {/* Emotions */}
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
                        placeholder="How were you feeling during this trade? Confident, anxious, FOMO?"
                        rows={2}
                        className="w-full resize-none rounded-lg bg-background/30 px-3.5 py-2.5 text-[13px] leading-relaxed placeholder:text-muted-foreground/30 focus:ring-1 focus:ring-primary/15 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Ratings */}
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

                  {/* Tags — inline quick add + TagTabs */}
                  <div>
                    <SectionHeader
                      icon={<Hash size={12} className="text-primary/50" />}
                      title="Tags"
                      isOpen={activeSection.tags}
                      onToggle={() => toggleSection('tags')}
                      badge={selectedCard.journal.customTags.length > 0 ? String(selectedCard.journal.customTags.length) : undefined}
                    />
                    {activeSection.tags && (
                      <div className="space-y-4">
                        <InlineTagInput
                          tags={selectedCard.journal.customTags}
                          onAdd={tag => update('customTags', [...selectedCard.journal.customTags, tag])}
                          onRemove={tag => update('customTags', selectedCard.journal.customTags.filter(t => t !== tag))}
                        />
                        <div className="pt-1">
                          <TagTabs
                            activeTags={selectedCard.journal.customTags}
                            onChange={v => update('customTags', v)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Screenshots */}
                  <div>
                    <SectionHeader
                      icon={<ImageIcon size={12} className="text-primary/50" />}
                      title="Screenshots"
                      isOpen={activeSection.screenshots}
                      onToggle={() => toggleSection('screenshots')}
                      badge={selectedCard.journal.screenshots.length > 0 ? String(selectedCard.journal.screenshots.length) : undefined}
                    />
                    {activeSection.screenshots && (
                      <ScreenshotGrid
                        screenshots={selectedCard.journal.screenshots}
                        onChange={v => update('screenshots', v)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Search, Star, Pin, Trash2, Check, Loader2 } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { RatingStars } from './components/rating-stars'
import { TagTabs } from './components/tag-tabs'
import { JournalStatsBar } from './components/journal-stats-bar'
import { ScreenshotGrid } from './components/screenshot-grid'
import type { JournalEntry } from './lib/journal-types'
import { cn } from '@/lib/utils'

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'journaled' | 'not-journaled'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    cards, stats, isLoading, expandedId,
    toggleExpand,
    createEntry, updateEntry, deleteEntry,
  } = useJournal(userId)

  const selectedCard = cards.find(c => c.trade.id === expandedId) ?? null

  const filteredCards = useMemo(() => {
    let result = cards
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
  }, [cards, search, statusFilter])

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
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
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

  function formatPnl(pnl: number) {
    return `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Stats bar */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <JournalStatsBar stats={stats} />
      </div>

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden rounded-xl bg-card/30 border-0">
        {/* Sidebar — trade list */}
        <div className="flex w-[320px] shrink-0 flex-col border-r-0 bg-background/20">
          {/* Search + filters */}
          <div className="space-y-2 border-b-0 p-3 pb-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search trades..."
                className="h-8 w-full rounded-lg border-0 bg-background/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
              />
            </div>
            {/* Status filter pills */}
            <div className="flex gap-1">
              {(['all', 'journaled', 'not-journaled'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider transition-colors',
                    statusFilter === s
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  {s === 'all' ? 'All' : s === 'journaled' ? 'Journaled' : 'No entry'}
                </button>
              ))}
            </div>
          </div>

          {/* Trade list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/20" />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No trades found</div>
            ) : (
              <div className="space-y-0.5 px-1.5 py-1">
                {filteredCards.map(card => {
                  const isSelected = expandedId === card.trade.id
                  const isWin = card.trade.pnl > 0
                  const hasJournal = card.journal !== null
                  return (
                    <button
                      key={card.trade.id}
                      type="button"
                      onClick={() => toggleExpand(card.trade.id)}
                      className={cn(
                        'flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/20',
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            hasJournal ? 'bg-primary' : 'bg-muted-foreground/25',
                          )} />
                          <span className="text-sm font-semibold truncate">{card.trade.instrument}</span>
                        </div>
                        <span className={cn(
                          'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                          card.trade.side?.toUpperCase() === 'LONG' ? 'bg-semantic-success/15 text-semantic-success' : 'bg-semantic-danger/15 text-semantic-danger',
                        )}>
                          {card.trade.side || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pl-3.5">
                        <span className="text-[10px] text-muted-foreground">{formatDate(card.trade.entryDate)}</span>
                        <span className={cn(
                          'text-xs font-bold tabular-nums',
                          isWin ? 'text-semantic-success' : 'text-semantic-danger',
                        )}>
                          {formatPnl(card.trade.pnl)}
                        </span>
                      </div>
                      {card.journal && (
                        <div className="flex items-center gap-1 pl-3.5">
                          {card.journal.customTags.slice(0, 2).map(tag => (
                            <span key={tag} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] text-primary">{tag}</span>
                          ))}
                          {card.journal.pinned && <Pin size={8} className="text-primary/60" />}
                          {card.journal.confidenceRating && (
                            <div className="ml-auto flex items-center gap-0.5">
                              <Star size={8} className="fill-primary text-primary" />
                              <span className="text-[8px] text-muted-foreground">{card.journal.confidenceRating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary footer */}
          <div className="shrink-0 border-t-0 px-3 py-2 text-[9px] text-muted-foreground/40">
            {cards.length} trades · {stats.journaledCount} journaled
          </div>
        </div>

        {/* Main panel — journal editor */}
        <div className="flex-1 overflow-y-auto">
          {!selectedCard ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full bg-muted/30 p-4">
                <BookOpen size={24} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select a trade to journal</p>
              <p className="text-xs text-muted-foreground/50 max-w-[240px]">Choose a trade from the sidebar to add notes, tags, and reflections</p>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {/* Trade context header */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{selectedCard.trade.instrument}</h2>
                  <span className={cn(
                    'rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                    selectedCard.trade.side?.toUpperCase() === 'LONG' ? 'bg-semantic-success/15 text-semantic-success' : 'bg-semantic-danger/15 text-semantic-danger',
                  )}>
                    {selectedCard.trade.side || '—'}
                  </span>
                  <span className={cn(
                    'ml-auto text-lg font-bold tabular-nums',
                    selectedCard.trade.pnl > 0 ? 'text-semantic-success' : 'text-semantic-danger',
                  )}>
                    {formatPnl(selectedCard.trade.pnl)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>Entry: ${selectedCard.trade.entryPrice.toFixed(2)}</span>
                  <span>Exit: ${selectedCard.trade.closePrice.toFixed(2)}</span>
                  <span>Qty: {selectedCard.trade.quantity}</span>
                  <span>Comm: ${selectedCard.trade.commission.toFixed(2)}</span>
                  <span>{formatDate(selectedCard.trade.entryDate)}</span>
                  {selectedCard.journal?.pinned && (
                    <span className="flex items-center gap-1 text-primary/60"><Pin size={10} />Pinned</span>
                  )}
                </div>
                {/* Action bar */}
                {selectedCard.journal && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePinToggle}
                      className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                        selectedCard.journal.pinned
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/20',
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
                          className="flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/25"
                        >
                          <Trash2 size={10} /> Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(false)}
                          className="rounded-md px-2 py-1 text-[10px] text-muted-foreground/50 hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(true)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      {saving ? (
                        <>
                          <Loader2 size={10} className="animate-spin text-muted-foreground/50" />
                          <span className="text-[9px] text-muted-foreground/40">Saving...</span>
                        </>
                      ) : selectedCard.journal.updatedAt ? (
                        <>
                          <Check size={10} className="text-semantic-success" />
                          <span className="text-[9px] text-muted-foreground/40">Saved</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/15" />

              {/* Journal fields or start prompt */}
              {!selectedCard.journal ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <p className="text-sm text-muted-foreground">No journal entry yet for this trade.</p>
                  <button
                    type="button"
                    onClick={() => handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)}
                    className="rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    Start journaling
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Pre-trade notes</label>
                    <textarea
                      value={selectedCard.journal.preTradeNotes ?? ''}
                      onChange={e => update('preTradeNotes', e.target.value || null)}
                      placeholder="Why did you enter this trade? What was your setup?"
                      rows={3}
                      className="w-full resize-none rounded-lg border-0 bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Post-trade review</label>
                    <textarea
                      value={selectedCard.journal.postTradeReview ?? ''}
                      onChange={e => update('postTradeReview', e.target.value || null)}
                      placeholder="What went well? What would you change next time?"
                      rows={3}
                      className="w-full resize-none rounded-lg border-0 bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Emotions</label>
                    <textarea
                      value={selectedCard.journal.emotions ?? ''}
                      onChange={e => update('emotions', e.target.value || null)}
                      placeholder="How were you feeling during this trade?"
                      rows={2}
                      className="w-full resize-none rounded-lg border-0 bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Confidence</label>
                      <RatingStars value={selectedCard.journal.confidenceRating} onChange={v => update('confidenceRating', v)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Discipline</label>
                      <RatingStars value={selectedCard.journal.disciplineScore} onChange={v => update('disciplineScore', v)} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Tags</label>
                    <TagTabs activeTags={selectedCard.journal.customTags} onChange={v => update('customTags', v)} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Screenshots</label>
                    <ScreenshotGrid screenshots={selectedCard.journal.screenshots} onChange={v => update('screenshots', v)} />
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

function BookOpen(props: { size?: number; className?: string }) {
  return (
    <svg width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

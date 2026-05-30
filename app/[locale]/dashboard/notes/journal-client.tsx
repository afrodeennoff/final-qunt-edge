'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Star } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { RatingStars } from './components/rating-stars'
import { TagInput } from './components/tag-input'
import { ScreenshotGrid } from './components/screenshot-grid'
import type { JournalEntry } from './lib/journal-types'
import { cn } from '@/lib/utils'

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const [search, setSearch] = useState('')

  const {
    cards, filters, isLoading, expandedId,
    setFilters, toggleExpand,
    createEntry, updateEntry,
  } = useJournal(userId)

  const selectedCard = cards.find(c => c.trade.id === expandedId) ?? null

  const filteredCards = useMemo(() => {
    if (!search.trim()) return cards
    const q = search.toLowerCase()
    return cards.filter(c =>
      c.trade.instrument.toLowerCase().includes(q) ||
      c.journal?.preTradeNotes?.toLowerCase().includes(q) ||
      c.journal?.postTradeReview?.toLowerCase().includes(q) ||
      c.journal?.customTags?.some(t => t.toLowerCase().includes(q))
    )
  }, [cards, search])

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
      if (entryId.startsWith('temp-')) {
        handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)
        return
      }
      handleUpdate(entryId, { [field]: value })
    },
    [selectedCard, handleCreate, handleUpdate],
  )

  function formatPnl(pnl: number) {
    return `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full overflow-hidden rounded-xl border-0 bg-card/30">
      {/* Sidebar — trade list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r-0 bg-background/20">
        {/* Search */}
        <div className="border-b-0 p-3">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trades..."
              className="h-8 w-full rounded-lg border-0 bg-background/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
            />
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
            filteredCards.map(card => {
              const isSelected = expandedId === card.trade.id
              const isWin = card.trade.pnl > 0
              return (
                <button
                  key={card.trade.id}
                  type="button"
                  onClick={() => toggleExpand(card.trade.id)}
                  className={cn(
                    'flex w-full flex-col gap-1 border-b-0 px-4 py-3 text-left transition-colors',
                    isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/20 border-l-2 border-l-transparent',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{card.trade.instrument}</span>
                    <span className={cn(
                      'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                      card.trade.side?.toUpperCase() === 'LONG' ? 'bg-semantic-success/15 text-semantic-success' : 'bg-semantic-danger/15 text-semantic-danger',
                    )}>
                      {card.trade.side || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">{formatDate(card.trade.entryDate)}</span>
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      isWin ? 'text-semantic-success' : 'text-semantic-danger',
                    )}>
                      {formatPnl(card.trade.pnl)}
                    </span>
                  </div>
                  {card.journal && (
                    <div className="flex items-center gap-1.5">
                      {card.journal.customTags.slice(0, 2).map(tag => (
                        <span key={tag} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">{tag}</span>
                      ))}
                      {card.journal.confidenceRating && (
                        <div className="ml-auto flex items-center gap-0.5">
                          <Star size={9} className="fill-primary text-primary" />
                          <span className="text-[9px] text-muted-foreground">{card.journal.confidenceRating}</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main panel — journal editor */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCard ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">Select a trade to journal</p>
            <p className="text-xs text-muted-foreground/60">Choose a trade from the sidebar to add notes and reflections</p>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Trade context header */}
            <div className="space-y-1">
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
              <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span>Entry: {selectedCard.trade.entryPrice.toFixed(2)}</span>
                <span>Exit: {selectedCard.trade.closePrice.toFixed(2)}</span>
                <span>Qty: {selectedCard.trade.quantity}</span>
                <span>Commission: ${selectedCard.trade.commission.toFixed(2)}</span>
                <span>{formatDate(selectedCard.trade.entryDate)}</span>
              </div>
            </div>

            <div className="h-px bg-border/15" />

            {/* Journal fields or start prompt */}
            {!selectedCard.journal ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <p className="text-sm text-muted-foreground">No journal entry yet for this trade.</p>
                <button
                  type="button"
                  onClick={() => handleCreate(selectedCard.trade.id, selectedCard.trade.accountNumber)}
                  className="rounded-lg bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/20"
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
                    placeholder="Why did you enter this trade?"
                    rows={3}
                    className="w-full resize-none rounded-lg border-0 bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Post-trade review</label>
                  <textarea
                    value={selectedCard.journal.postTradeReview ?? ''}
                    onChange={e => update('postTradeReview', e.target.value || null)}
                    placeholder="What went well? What would you change?"
                    rows={3}
                    className="w-full resize-none rounded-lg border-0 bg-background/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Emotions</label>
                  <textarea
                    value={selectedCard.journal.emotions ?? ''}
                    onChange={e => update('emotions', e.target.value || null)}
                    placeholder="How were you feeling?"
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
                  <TagInput tags={selectedCard.journal.customTags} onChange={v => update('customTags', v)} />
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
  )
}

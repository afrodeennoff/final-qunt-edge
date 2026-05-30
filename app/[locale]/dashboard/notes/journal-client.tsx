'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { JournalCard } from './components/journal-card'
import { JournalStatsBar } from './components/journal-stats-bar'
import { JournalSearchBar } from './components/journal-search-bar'
import { JournalFiltersPanel } from './components/journal-filters'
import type { JournalEntry } from './lib/journal-types'

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const [showFilters, setShowFilters] = useState(false)

  const {
    cards, stats, filters, page, totalPages,
    isLoading, expandedId,
    setFilters, setPage, toggleExpand,
    createEntry, updateEntry,
  } = useJournal(userId)

  const instruments = useMemo(
    () => [...new Set(cards.map(c => c.trade.instrument))].sort(),
    [cards],
  )

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

  return (
    <div className="flex h-full flex-col gap-4">
      <JournalSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        showFilters={showFilters}
      />

      {showFilters && (
        <JournalFiltersPanel
          filters={filters}
          onChange={setFilters}
          instruments={instruments}
        />
      )}

      <JournalStatsBar stats={stats} />

      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl border border-border/20 bg-card/30" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No trades found.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Adjust your filters or wait for trades to sync.</p>
          </div>
        ) : (
          cards.map(card => (
            <JournalCard
              key={card.trade.id}
              card={card}
              isExpanded={expandedId === card.trade.id}
              onToggle={() => toggleExpand(card.trade.id)}
              onCreateEntry={handleCreate}
              onUpdateEntry={handleUpdate}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
                  pageNum === page
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'border border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

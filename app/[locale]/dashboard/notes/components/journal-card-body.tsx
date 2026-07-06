'use client'

import { useCallback } from 'react'
import { RatingStars } from './rating-stars'
import { TagInput } from './tag-input'
import { ScreenshotGrid } from './screenshot-grid'
import type { TradeJournalCard, JournalEntry } from '../lib/journal-types'

interface JournalCardBodyProps {
  card: TradeJournalCard
  onCreateEntry: (tradeId: string, accountNumber: string) => Promise<JournalEntry>
  onUpdateEntry: (id: string, data: Record<string, any>) => Promise<JournalEntry>
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function JournalCardBody({ card, onCreateEntry, onUpdateEntry }: JournalCardBodyProps) {
  const { trade, journal } = card
  const entryId = journal?.id

  const update = useCallback(
    (field: string, value: any) => {
      if (!entryId || entryId.startsWith('temp-')) {
        onCreateEntry(trade.id, trade.accountNumber)
        return
      }
      onUpdateEntry(entryId, { [field]: value })
    },
    [entryId, trade.id, trade.accountNumber, onCreateEntry, onUpdateEntry],
  )

  const handleCreate = async () => {
    await onCreateEntry(trade.id, trade.accountNumber)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border-0 bg-muted/30 p-3 sm:grid-cols-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Entry</span>
          <p className="text-xs font-medium tabular-nums">{formatPrice(trade.entryPrice)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Exit</span>
          <p className="text-xs font-medium tabular-nums">{formatPrice(trade.closePrice)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Qty</span>
          <p className="text-xs font-medium tabular-nums">{trade.quantity}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Commission</span>
          <p className="text-xs font-medium tabular-nums">${trade.commission.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Opened</span>
          <p className="text-xs tabular-nums">{formatDate(trade.entryDate)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Closed</span>
          <p className="text-xs tabular-nums">{formatDate(trade.closeDate)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Account</span>
          <p className="text-xs tabular-nums">{trade.accountNumber}</p>
        </div>
      </div>

      {!journal && (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-sm text-muted-foreground">No journal entry for this trade yet.</p>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
          >
            Start journaling
          </button>
        </div>
      )}

      {journal && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Pre-trade notes</label>
            <textarea
              value={journal.preTradeNotes ?? ''}
              onChange={e => update('preTradeNotes', e.target.value || null)}
              placeholder="Why did you enter this trade? What setup did you see?"
              rows={2}
              className="w-full resize-none rounded-md border-0 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Post-trade review</label>
            <textarea
              value={journal.postTradeReview ?? ''}
              onChange={e => update('postTradeReview', e.target.value || null)}
              placeholder="What went well? What would you change?"
              rows={2}
              className="w-full resize-none rounded-md border-0 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Emotions</label>
            <textarea
              value={journal.emotions ?? ''}
              onChange={e => update('emotions', e.target.value || null)}
              placeholder="How were you feeling during this trade?"
              rows={1}
              className="w-full resize-none rounded-md border-0 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Confidence</label>
              <RatingStars value={journal.confidenceRating} onChange={v => update('confidenceRating', v)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Discipline</label>
              <RatingStars value={journal.disciplineScore} onChange={v => update('disciplineScore', v)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Tags</label>
            <TagInput tags={journal.customTags} onChange={v => update('customTags', v)} />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">Screenshots</label>
            <ScreenshotGrid screenshots={journal.screenshots} onChange={v => update('screenshots', v)} />
          </div>
        </div>
      )}
    </div>
  )
}

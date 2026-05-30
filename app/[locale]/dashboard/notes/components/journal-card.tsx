'use client'

import { cn } from '@/lib/utils'
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { JournalCardHeader } from './journal-card-header'
import { JournalCardBody } from './journal-card-body'
import type { TradeJournalCard, JournalEntry } from '../lib/journal-types'

interface JournalCardProps {
  card: TradeJournalCard
  isExpanded: boolean
  onToggle: () => void
  onCreateEntry: (tradeId: string, accountNumber: string) => Promise<JournalEntry>
  onUpdateEntry: (id: string, data: Record<string, any>) => Promise<JournalEntry>
}

export function JournalCard({ card, isExpanded, onToggle, onCreateEntry, onUpdateEntry }: JournalCardProps) {
  return (
    <div className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <JournalCardHeader card={card} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <JournalCardBody card={card} onCreateEntry={onCreateEntry} onUpdateEntry={onUpdateEntry} />
      )}
    </div>
  )
}

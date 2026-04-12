'use client'

import type { UnifiedFirm } from '@/server/deals'
import FirmCard from './FirmCard'

interface FirmCardsGridProps {
 firms: UnifiedFirm[]
 locale: string
}

export default function FirmCardsGrid({ firms, locale }: FirmCardsGridProps) {
 if (firms.length === 0) {
 return (
 <section className="classes "">
 <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--frost-border)] bg-[var(--surface-card)] px-6 text-center">
 <p className="text-sm font-medium text-foreground/95">No firms match these filters.</p>
 <p className="mt-2 max-w-md text-sm text-muted-foreground">
 Try widening platform or drawdown preferences to bring more firms back into the comparison board.
 </p>
 </div>
 </section>
 )
 }

 return (
 <section className="classes "">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
 {firms.map((firm) => (
 <FirmCard key={firm.id} firm={firm} locale={locale} />
 ))}
 </div>
 </section>
 )
}

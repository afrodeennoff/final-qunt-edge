'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { UnifiedFirm } from '@/server/deals'

interface FirmCardsGridProps {
  firms: UnifiedFirm[]
  locale: string
}

export default function FirmCardsGrid({ firms, locale }: FirmCardsGridProps) {
  if (firms.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.02)] p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No firms match your current filters. Try adjusting your search.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {firms.slice(0, 6).map((firm) => (
        <div
          key={firm.id}
          className="group rounded-lg border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.04)] p-4 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[oklch(0.65_0.22_260/0.12)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.10),0_8px_20px_rgba(0,0,0,0.32)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {firm.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {firm.platform} &middot; {firm.drawdownType}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {firm.profitSplit}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Accounts
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                {firm.catalogueStats.accountsCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Max Alloc
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                {firm.maxAllocation}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Paid Out
              </p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                ${firm.catalogueStats.paidPayoutAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/propfirms/${firm.slug}`}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
          >
            View details
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ))}
    </div>
  )
}

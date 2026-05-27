'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

export function TrustBar() {
  return (
    <div className="relative border-b border-border/30 py-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">8,241</span> funded traders
            <span className="inline-flex items-center gap-0.5 text-[11px] text-success">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            <span className="hidden text-muted-foreground/40 sm:inline">&bull;</span>
            <span className="hidden sm:inline">
              <span className="font-semibold text-foreground">142,893</span> trades analyzed today
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] text-success">
              <TrendingUp className="h-3 w-3" /> +8.3%
            </span>
          </div>
          <div className="text-xs text-muted-foreground/60 tracking-wide">
            Trusted by traders at FTMO &bull; Topstep &bull; Apex &bull; FundedNext &bull; MyForexFunds
          </div>
        </div>
      </div>
    </div>
  )
}

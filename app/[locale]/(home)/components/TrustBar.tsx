'use client'

import { TrendingUp } from 'lucide-react'

export function TrustBar() {
  return (
    <div className="animate-fade-in-up relative border-b-0 py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="animate-stagger flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-base">8,241</span>
              funded traders
              <span className="inline-flex items-center gap-0.5 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" /> +12%
              </span>
            </span>
            <span className="text-muted-foreground/30 hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-base">142,893</span>
              trades analyzed today
              <span className="inline-flex items-center gap-0.5 text-[11px] text-success">
                <TrendingUp className="h-3 w-3" /> +8.3%
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-wide text-muted-foreground/50">
            <span>Trusted by traders at</span>
            {['FTMO', 'Topstep', 'Apex', 'FundedNext', 'MyForexFunds'].map((name) => (
              <span
                key={name}
                className="font-medium text-muted-foreground/70 tracking-wider"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

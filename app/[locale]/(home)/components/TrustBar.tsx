'use client'

export function TrustBar() {
  return (
    <div className="border-b border-border/40 py-6">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">8,241</span> funded traders &nbsp;•&nbsp; 
            <span className="font-semibold text-foreground">142,893</span> trades analyzed today
          </div>
          <div className="text-xs text-muted-foreground/60 tracking-wide">
            Trusted by traders at FTMO • Topstep • Apex • FundedNext • MyForexFunds
          </div>
        </div>
      </div>
    </div>
  )
}

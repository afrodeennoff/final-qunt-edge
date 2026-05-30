'use client'

import { useMemo } from "react"
import { BarChart3 } from "lucide-react"
import PnLPerContractChartEmbed from "@/app/[locale]/embed/components/pnl-per-contract"

export function PnlPerContractPreview() {
 const trades = useMemo(
 () => [
 { instrument:"ES", pnl: 820, commission: 14, quantity: 6 },
 { instrument:"ES", pnl: -260, commission: 8, quantity: 4 },
 { instrument:"NQ", pnl: 540, commission: 10, quantity: 5 },
 { instrument:"NQ", pnl: 110, commission: 6, quantity: 2 },
 { instrument:"CL", pnl: -180, commission: 5, quantity: 3 },
 { instrument:"CL", pnl: 320, commission: 5, quantity: 3 },
 { instrument:"GC", pnl: 210, commission: 4, quantity: 2 },
 { instrument:"GC", pnl: -90, commission: 3, quantity: 1 },
 { instrument:"YM", pnl: 430, commission: 7, quantity: 4 },
 { instrument:"YM", pnl: -70, commission: 3, quantity: 2 },
 { instrument:"RTY", pnl: 260, commission: 6, quantity: 3 },
 { instrument:"RTY", pnl: -120, commission: 4, quantity: 2 },
 { instrument:"6E", pnl: 140, commission: 3, quantity: 2 },
 { instrument:"6E", pnl: -60, commission: 2, quantity: 1 },
 { instrument:"ZN", pnl: 90, commission: 2, quantity: 2 },
 { instrument:"ZN", pnl: -40, commission: 2, quantity: 1 },
 ],
 []
 )

 return (
 <div className="mx-6 rounded-xl p-6 bg-muted/40 shadow-card">
 <div className="flex items-center gap-3 mb-4">
 <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
 <BarChart3 className="size-[18px] text-primary" strokeWidth={2} />
 </div>
 <p className="text-[12px] uppercase tracking-[0.05em] text-foreground font-medium">
 PnL Per Contract
 </p>
 </div>
  <div className="h-full w-full rounded-xl border-0 bg-card pointer-events-none pt-5">
 <PnLPerContractChartEmbed trades={trades} />
 </div>
 </div>
 )
}
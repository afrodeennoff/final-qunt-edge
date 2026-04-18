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
 <div className="mx-6 rounded-xl p-6 bg-[oklch(0.65_0.22_260/0.03)] shadow-card">
 <div className="flex items-center gap-3 mb-4">
 <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
 <BarChart3 className="size-[18px] text-primary" strokeWidth={2} />
 </div>
 <p className="text-[12px] uppercase tracking-[0.05em] text-foreground/85 font-medium">
 PnL Per Contract
 </p>
 </div>
 <div className="h-full w-full rounded-xl border bg-[oklch(0.65_0.22_260/0.03)] shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.06),0_4px_16px_-4px_rgba(0,0,0,0.3)] pointer-events-none border-t border-border/30-muted pt-5">
 <PnLPerContractChartEmbed trades={trades} />
 </div>
 </div>
 )
}
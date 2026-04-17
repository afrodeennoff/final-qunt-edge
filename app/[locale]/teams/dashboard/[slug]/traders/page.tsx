'use client'

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { Zap } from "lucide-react"
import { TeamEquityGridClient } from "../../../components/user-equity/team-equity-grid-client"
import { unifiedSectionPanelClassName } from "@/components/layout/unified-page-recipes"
import { cn } from "@/lib/utils"

export default function TeamTradersPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  return (
    <section className="space-y-6">
<<<<<<< HEAD
      <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
=======
      <header className="rounded-2xl border border-border/28 bg-card/70 p-5 sm:p-6">
>>>>>>> origin/main
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Execution Layer</p>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Traders Performance</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Compare individual trader behavior, consistency, and outcomes in one place.
        </p>
      </header>

<<<<<<< HEAD
      <Suspense fallback={<div className={cn(unifiedSectionPanelClassName, 'p-5 text-sm text-muted-foreground')}>Loading trader metrics…</div>}>
=======
      <Suspense fallback={<div className="rounded-2xl border border-border/28 bg-card/60 p-5 text-sm text-muted-foreground">Loading trader metrics…</div>}>
>>>>>>> origin/main
        <TeamEquityGridClient teamId={slug} />
      </Suspense>
    </section>
  )
}

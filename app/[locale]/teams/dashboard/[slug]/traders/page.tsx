'use client'

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { Zap } from "lucide-react"
import { TeamEquityGridClient } from "../../../components/user-equity/team-equity-grid-client"
import { unifiedSectionPanelClassName } from "@/components/layout/unified-page-recipes"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamTradersPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  return (
    <section className="space-y-6">
      <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.12em]">Execution Layer</p>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Traders Performance</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Compare individual trader behavior, consistency, and outcomes in one place.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <TeamEquityGridClient teamId={slug} />
      </Suspense>
    </section>
  )
}

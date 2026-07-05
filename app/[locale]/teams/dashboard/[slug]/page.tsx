import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamOverviewClient } from "../../components/team-overview-client"
import { unifiedSectionPanelClassName } from "@/components/layout/unified-page-recipes"
import { cn } from "@/lib/utils"

interface TeamDashboardPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TeamDashboardPage({ params }: TeamDashboardPageProps) {
  const { slug } = await params

  return (
    <section className="space-y-6">
      <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">Team Workspace</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Overview</h1>
        <p className="mt-2 max-w-2xl text-sm leading-[1.55] text-muted-foreground">
          Live visibility into team equity, aggregate performance, and cross-trader behavior.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        }
      >
        <TeamOverviewClient teamId={slug} />
      </Suspense>
    </section>
  )
}

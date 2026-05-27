import { AnalysisOverview } from "../components/analysis/analysis-overview"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function DashboardReportsPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex min-h-[calc(100dvh-10rem)] min-h-[40rem] w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <UnifiedSurface className="h-full overflow-hidden">
          <AnalysisOverview />
        </UnifiedSurface>
      </div>
    </UnifiedPageShell>
  )
}

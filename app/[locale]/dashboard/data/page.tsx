import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataManagementCard } from "@/app/[locale]/dashboard/data/components/data-management/data-management-card"
import { TradeTableReview } from "../components/tables/trade-table-review"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"

export default function DashboardPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex w-full flex-1 flex-col min-h-0">
        <Tabs defaultValue="accounts" className="flex w-full flex-1 flex-col space-y-4 min-h-0">
          <TabsList className="h-auto shrink-0 rounded-xl border border-border/30 bg-muted/40 p-1">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
          </TabsList>
          <TabsContent value="accounts" className="mt-0">
            <UnifiedSurface className="rounded-xl border border-border/30 shadow-sm">
              <DataManagementCard />
            </UnifiedSurface>
          </TabsContent>
          <TabsContent value="trades" className="mt-0 flex min-h-0 flex-1 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <UnifiedSurface className="h-full w-full rounded-xl border border-border/30 shadow-sm">
              <TradeTableReview />
            </UnifiedSurface>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedPageShell>
  )
}

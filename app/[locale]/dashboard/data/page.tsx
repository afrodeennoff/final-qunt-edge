import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataManagementCard } from "@/app/[locale]/dashboard/data/components/data-management/data-management-card"
import { UnifiedPageShell, UnifiedSurface } from "@/components/layout/unified-page-shell"
import dynamic from "next/dynamic"

// Only load TradeTableReview when trades tab is active
const TradeTableReview = dynamic(
  () => import("../components/tables/trade-table-review"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <UnifiedPageShell density="compact">
      <div className="flex w-full flex-1 flex-col">
        <Tabs defaultValue="accounts" className="w-full space-y-4">
          <TabsList className="h-auto rounded-xl border border-border/30 bg-background/0.09 p-1">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            {/* <TabsTrigger value="propfirm">Prop Firm</TabsTrigger> */}
          </TabsList>
          <TabsContent value="accounts" className="mt-0">
            <UnifiedSurface>
              <DataManagementCard />
            </UnifiedSurface>
          </TabsContent>
          <TabsContent value="trades" className="mt-0 h-[calc(100dvh-var(--navbar-height)-var(--tabs-height)-16px)] pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <UnifiedSurface className="h-full">
              <TradeTableReview />
            </UnifiedSurface>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedPageShell>
  )
}

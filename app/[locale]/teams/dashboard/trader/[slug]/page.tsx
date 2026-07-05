import { DataProvider } from "@/context/data-provider";
import { TraderInfo } from "../../../components/trader-info";
import { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { unifiedSectionPanelClassName, unifiedInsetPanelClassName } from "@/components/layout/unified-page-recipes";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, BarChart3, Activity } from "lucide-react";
import { getTraderById, getTraderVarSummary } from "../../../actions/user";
import { prisma } from "@/lib/prisma";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";

function formatCurrency(value: number): string {
  return `${value >= 0 ? '+' : '-'}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

async function TraderStats({ userId }: { userId: string }) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    select: { pnl: true, commission: true },
  })

  if (!trades.length) {
    return (
      <div className={cn(unifiedInsetPanelClassName, 'p-5 text-sm text-muted-foreground')}>
        No trade history recorded yet.
      </div>
    )
  }

  let totalPnL = 0
  let wins = 0
  let losses = 0
  let grossProfit = 0
  let grossLoss = 0

  for (const t of trades) {
    const pnl = toNumber(t.pnl) - toNumber(t.commission ?? 0)
    totalPnL += pnl
    if (pnl > 0) { wins++; grossProfit += pnl }
    else if (pnl < 0) { losses++; grossLoss += Math.abs(pnl) }
  }

  const total = trades.length
  const winRate = total > 0 ? (wins / total) * 100 : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        label="Total PnL"
        value={formatCurrency(totalPnL)}
        valueClassName={totalPnL >= 0 ? 'text-primary' : 'text-destructive'}
        icon={TrendingUp}
        size="md"
      />
      <DashboardStatCard
        label="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        icon={BarChart3}
        size="md"
      />
      <DashboardStatCard
        label="Total Trades"
        value={total}
        icon={Activity}
        size="md"
      />
      <DashboardStatCard
        label="Profit Factor"
        value={profitFactor.toFixed(2)}
        size="md"
      />
    </div>
  )
}

export default async function TraderDashboard(props: { params: Promise<{ slug: string; locale?: string }> }) {
  const params = await props.params;
  const { slug, locale } = params;
  const localePrefix = locale ? `/${locale}` : '';

  const trader = await getTraderById(slug)

  return (
    <DataProvider adminView={{ userId: slug }}>
      <section className="space-y-6">
        {/* Breadcrumb + Header */}
        <header className={cn(unifiedSectionPanelClassName, 'p-5 sm:p-6')}>
          <Link
            href={`${localePrefix}/teams/manage`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Teams
          </Link>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.12em]">Trader Profile</p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {trader?.email?.split('@')[0] || 'Trader'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {trader?.email || 'No email available'}
          </p>
        </header>

        {/* Quick Stats */}
        <Suspense fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        }>
          <TraderStats userId={slug} />
        </Suspense>

        {/* VaR Section */}
        <Suspense fallback={
          <div className={cn(unifiedInsetPanelClassName, 'p-5')}>
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          </div>
        }>
          <TraderInfo slug={slug} />
        </Suspense>
      </section>
    </DataProvider>
  );
}

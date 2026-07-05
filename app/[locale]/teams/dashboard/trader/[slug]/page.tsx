import { DataProvider } from "@/context/data-provider";
import { TraderInfo } from "../../../components/trader-info";
import { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { unifiedSectionPanelClassName } from "@/components/layout/unified-page-recipes";
import { cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getTraderById, getTraderFullData } from "../../../actions/user";
import { TraderDetailClient } from "../../../components/trader-detail-client";

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
            <p className="text-[10px] font-black uppercase tracking-[0.12em]">Trade Journal</p>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {trader?.email?.split('@')[0] || 'Trader'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {trader?.email || 'No email available'}
          </p>
        </header>

        {/* Full Mentor Dashboard */}
        <Suspense fallback={
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        }>
          <TraderDetailClient userId={slug} />
        </Suspense>

        {/* VaR Section */}
        <Suspense fallback={
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
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

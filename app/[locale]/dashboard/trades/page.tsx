import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { cn } from '@/lib/utils'

const TradeTableReview = dynamic(
  () => import("../components/tables/trade-table-review").then(m => ({ default: m.TradeTableReview })),
  { loading: () => <div className="flex h-[80vh] items-center justify-center"><Skeleton className="h-32 w-full max-w-4xl rounded-xl" /></div> }
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard/trades");

  return {
    title: "Trade Journal | Qunt Edge",
    description: "Review, tag, and analyze your trades in a detailed journal view.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
    },
  };
}

export default function TradesPage() {
  return (
    <div className="flex min-h-full w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className={cn(unifiedSectionPanelClassName, 'p-4 sm:p-6')}>
        <TradeTableReview />
      </div>
    </div>
  );
}

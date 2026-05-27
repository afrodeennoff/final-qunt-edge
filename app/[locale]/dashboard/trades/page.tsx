import { TradeTableReview } from "../components/tables/trade-table-review";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";

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
    <div className="flex min-h-[calc(100dvh-10rem)] min-h-[40rem] w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
        <TradeTableReview />
      </div>
    </div>
  );
}

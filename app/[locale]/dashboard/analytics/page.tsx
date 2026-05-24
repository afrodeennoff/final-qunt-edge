import { ChartTheFuturePanel } from "../components/chart-the-future-panel";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard/analytics");

  return {
    title: "Scenario Lab | Qunt Edge",
    description: "Explore hypothetical trade scenarios and simulate performance outcomes.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
    },
  };
}

export default function AnalyticsPage() {
  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[40rem] w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
        <ChartTheFuturePanel />
      </div>
    </div>
  );
}

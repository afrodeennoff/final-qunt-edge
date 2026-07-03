import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from '@/lib/utils'
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'

const ConsistencySimulator = dynamic(
  () => import("./components/consistency-simulator").then(m => ({ default: m.ConsistencySimulator })),
  { loading: () => <div className="flex h-[80vh] items-center justify-center"><Skeleton className="h-32 w-full max-w-4xl rounded-xl" /></div> }
)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard/simulator");

  return {
    title: "Consistency Simulator | Qunt Edge",
    description: "Simulate trading scenarios and test consistency rules across different prop firm programs.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
    },
  };
}

export default function SimulatorPage() {
  return (
    <div className="flex min-h-full w-full flex-col pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className={cn(unifiedSectionPanelClassName, 'p-4 sm:p-6')}>
        <ConsistencySimulator />
      </div>
    </div>
  );
}

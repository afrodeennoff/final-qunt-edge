import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { DashboardSkeleton } from "./components/skeletons/dashboard-skeleton";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { Spinner } from "@/components/ui/skeleton";
import { CheckoutSuccessHandler } from "./components/checkout-success-handler";

const tabLoadingFallback = (
  <div className="flex items-center justify-center h-64">
    <Spinner size={24} />
  </div>
);

const WidgetCanvas = dynamic(() => import("./components/widget-canvas"), {
  loading: () => tabLoadingFallback,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard");

  return {
    title: "Dashboard | Qunt Edge",
    description:
      "Access your trading analytics dashboard with real-time performance metrics, behavioral insights, and comprehensive trade analysis.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
    },
  };
}

export default async function DashboardPage(props: {
  searchParams: Promise<{ success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const checkoutSuccess = searchParams?.success === "true";
  const shouldUseEnhancedSkeleton = FEATURE_FLAGS.ENABLE_SKELETON_LOADING;

  return (
    <>
      {checkoutSuccess && <CheckoutSuccessHandler />}
      <Suspense
        fallback={
          shouldUseEnhancedSkeleton ? (
            <DashboardSkeleton activeTab="widgets" />
          ) : null
        }
      >
        <WidgetCanvas />
      </Suspense>
    </>
  );
}

import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { CheckoutSuccessHandler } from "./components/checkout-success-handler";
import { Skeleton } from "@/components/ui/skeleton";

const WidgetCanvas = dynamic(() => import("./components/widget-canvas"), {
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl" />
      ))}
    </div>
  ),
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

  return (
    <>
      {checkoutSuccess && <CheckoutSuccessHandler />}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 sm:h-32 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <WidgetCanvas />
      </Suspense>
    </>
  );
}

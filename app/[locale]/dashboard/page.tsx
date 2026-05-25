import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { CheckoutSuccessHandler } from "./components/checkout-success-handler";

const WidgetCanvas = dynamic(() => import("./components/widget-canvas"), {
  loading: () => (
    <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4 lg:p-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-border/30 bg-muted/40"
        />
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
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4 lg:p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border border-border/30 bg-muted/40"
              />
            ))}
          </div>
        }
      >
        <WidgetCanvas />
      </Suspense>
    </>
  );
}

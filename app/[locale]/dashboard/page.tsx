import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";
import { CheckoutSuccessHandler } from "./components/checkout-success-handler";

const WidgetCanvas = dynamic(() => import("./components/widget-canvas"), {
  loading: () => null,
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
      <Suspense fallback={null}>
        <WidgetCanvas />
      </Suspense>
    </>
  );
}

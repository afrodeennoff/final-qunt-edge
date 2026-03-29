import { DashboardTabShell } from "./components/dashboard-tab-shell";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard");

  return {
    title: "Dashboard | Qunt Edge",
    description: "Access your trading analytics dashboard with real-time performance metrics, behavioral insights, and comprehensive trade analysis.",
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
  searchParams: Promise<{ tab?: string; success?: string }>;
}) {
  const searchParams = await props.searchParams;
  const rawTab = searchParams?.tab;
  const activeTab =
    rawTab === "table" ||
    rawTab === "accounts" ||
    rawTab === "chart" ||
    rawTab === "widgets"
      ? rawTab
      : "widgets";
  const checkoutSuccess = searchParams?.success === "true";

  return (
    <DashboardTabShell activeTab={activeTab} checkoutSuccess={checkoutSuccess} />
  );
}

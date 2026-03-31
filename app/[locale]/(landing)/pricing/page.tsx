import type { Metadata } from "next";
import { PricingPageClient } from "./pricing-page-client";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    title: "Pricing | Qunt Edge",
    description:
      "Compare Qunt Edge plans for individual traders and teams. Start free, then upgrade for AI debriefs and behavior analytics.",
    path: "/pricing",
    locale,
  });
}

export default function PricingPage() {
  return <PricingPageClient />;
}

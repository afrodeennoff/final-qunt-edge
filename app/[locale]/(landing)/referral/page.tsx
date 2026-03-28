import type { Metadata } from "next";
import ReferralPageClient from "./page-client";
import { getSiteOrigin } from "@/lib/site-url";

const SITE_ORIGIN = getSiteOrigin();
const PAGE_PATH = "/referral";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Referral Program | Qunt Edge",
    description:
      "Invite traders to Qunt Edge and earn rewards through the official referral program.",
    openGraph: {
      title: "Referral Program | Qunt Edge",
      description: "Invite traders to Qunt Edge and earn rewards through the official referral program.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Referral Program | Qunt Edge",
      description: "Invite traders to Qunt Edge and earn rewards through the official referral program.",
    },
    alternates: {
      canonical,
      languages: {
        "en-US": `${SITE_ORIGIN}/en${PAGE_PATH}`,
        "fr-FR": `${SITE_ORIGIN}/fr${PAGE_PATH}`,
      },
    },
  };
}

export default function ReferralPage() {
  return <ReferralPageClient />;
}

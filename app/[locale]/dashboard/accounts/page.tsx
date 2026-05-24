import { AccountsOverview } from "../components/accounts/accounts-overview";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = getCanonicalUrl(locale, "/dashboard/accounts");

  return {
    title: "Accounts | Qunt Edge",
    description: "Manage and view your connected trading accounts.",
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
    },
  };
}

export default function AccountsPage() {
  return <AccountsOverview size="large" />;
}

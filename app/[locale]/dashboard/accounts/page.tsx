import dynamic from 'next/dynamic'
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/seo";

const AccountsOverview = dynamic(
  () => import("../components/accounts/accounts-overview").then(m => ({ default: m.AccountsOverview })),
  { loading: () => <div className="flex h-[80vh] items-center justify-center"><div className="h-32 w-full max-w-4xl animate-pulse rounded-xl bg-muted/30" /></div> }
)

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

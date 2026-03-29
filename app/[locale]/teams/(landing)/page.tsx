import type { Metadata } from "next";
import TeamsPageClient from "./page-client";
import { buildPublicMetadata } from "@/lib/seo";

const PAGE_PATH = "/teams";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    path: PAGE_PATH,
    title: "Teams | Qunt Edge",
    description: "Manage trading teams with unified analytics, risk monitoring, and performance tracking. Perfect for prop firms and funds.",
  });
}

export default function TeamsPage() {
  return <TeamsPageClient />;
}

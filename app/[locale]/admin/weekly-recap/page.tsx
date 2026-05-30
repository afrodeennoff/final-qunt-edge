import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WeeklyRecapProvider } from "../components/weekly-stats/weekly-recap-context";
import { WeeklyRecapPreview } from "../components/weekly-stats/weekly-recap-preview";
import { getSiteOrigin } from "@/lib/site-url";
import { assertAdminAccess } from "@/server/authz";
const SITE_ORIGIN = getSiteOrigin();
const PAGE_PATH = "/admin/weekly-recap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Weekly Recap | Qunt Edge Admin",
    description: "Preview and customize weekly recap emails for traders.",
    openGraph: {
      title: "Weekly Recap | Qunt Edge Admin",
      description: "Preview and customize weekly recap emails for traders.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Weekly Recap | Qunt Edge Admin",
      description: "Preview and customize weekly recap emails for traders.",
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

export default async function WeeklyRecapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    await assertAdminAccess();
  } catch {
    redirect(`/${locale}/authentication`);
  }

  return (
    <WeeklyRecapProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 border-b-0 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-primary/80">
              Email Management
            </p>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight">Weekly Recap Preview</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Preview and customize the weekly recap email that will be sent to traders.
              </p>
            </div>
          </div>
        </div>
      <WeeklyRecapPreview />
      </div>
    </WeeklyRecapProvider>
  );
}

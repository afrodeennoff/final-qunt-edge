import type { Metadata } from "next";
import { Suspense } from 'react';
import { AdminDashboard } from '@/app/[locale]/admin/components/dashboard/admin-dashboard';
import { assertAdminAccess } from '@/server/authz';
import { getSiteOrigin } from '@/lib/site-url';
import { Skeleton } from '@/components/ui/skeleton';
const SITE_ORIGIN = getSiteOrigin();
const PAGE_PATH = "/admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `${SITE_ORIGIN}/${locale}${PAGE_PATH}`;

  return {
    title: "Admin Dashboard | Qunt Edge",
    description: "Administrative controls and platform management dashboard for Qunt Edge.",
    openGraph: {
      title: "Admin Dashboard | Qunt Edge",
      description: "Administrative controls and platform management dashboard for Qunt Edge.",
      url: canonical,
      siteName: "Qunt Edge",
      locale: locale === "en" ? "en_US" : "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Admin Dashboard | Qunt Edge",
      description: "Administrative controls and platform management dashboard for Qunt Edge.",
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

const adminFallback = (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
    <div className="grid gap-4 xl:grid-cols-2">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  </div>
)

export default async function AdminPage() {
  await assertAdminAccess()
  return (
    <Suspense fallback={adminFallback}>
      <AdminDashboard />
    </Suspense>
  );
}

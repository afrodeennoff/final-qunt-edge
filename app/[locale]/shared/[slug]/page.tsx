import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getShared } from "@/server/shared"
import { SharedPageClient } from "./shared-page-client"
import { DataProvider } from "@/context/data-provider"
import { buildPublicMetadata } from "@/lib/seo"

interface SharedPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>
}

export async function generateMetadata({ params }: SharedPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  return buildPublicMetadata({
    title: "Shared Trading Performance | Qunt Edge",
    description: "View shared trading performance dashboard on Qunt Edge.",
    path: `/shared/${slug}`,
    locale,
  })
}

// Main page component - Server Component
export default async function SharedPage({ params }: SharedPageProps) {
  // Await the params Promise
  const resolvedParams = await params
  // Fetch shared data on the server
  const sharedData = await getShared(resolvedParams.slug)
  
  if (!sharedData) {
    notFound()
  }

  // Pass the resolved params and fetched data to the client component
  return (
    <DataProvider
      isSharedView
      initialSharedSlug={resolvedParams.slug}
      initialSharedData={sharedData}
    >
      <SharedPageClient />
    </DataProvider>
  )
}

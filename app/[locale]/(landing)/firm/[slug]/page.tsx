import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUnifiedFirmBySlug } from '@/server/deals'
import { FirmDetailClient } from './page-client'
import { getSiteOrigin } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

const SITE_ORIGIN = getSiteOrigin()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const firm = await getUnifiedFirmBySlug(slug)

  if (!firm) {
    return {
      title: 'Firm Not Found | Qunt Edge',
    }
  }

  const canonical = `${SITE_ORIGIN}/${locale}/firm/${firm.slug}`
  const description =
    firm.description ??
    firm.shortDesc ??
    `Review ${firm.name} payout data, challenge details, rules, and current coupons on Qunt Edge.`

  return {
    title: `${firm.name} Review | Qunt Edge`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${firm.name} Review | Qunt Edge`,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const firm = await getUnifiedFirmBySlug(slug)
  if (!firm) notFound()
  return <FirmDetailClient firm={firm} />
}

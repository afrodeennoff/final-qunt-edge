import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUnifiedFirmBySlug } from '@/server/deals'
import { FirmDetailClient } from './page-client'
import { getLocaleAlternates } from '@/lib/seo'

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

  const alternates = getLocaleAlternates(locale, `/firm/${firm.slug}`)
  const canonical = alternates.canonical
  const description =
    firm.description ??
    firm.shortDesc ??
    `Review ${firm.name} user reviews, payout data, challenge details, rules, and current coupons on Qunt Edge.`

  return {
    title: `${firm.name} Review | Qunt Edge`,
    description,
    alternates,
    openGraph: {
      title: `${firm.name} Review | Qunt Edge`,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function FirmDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const firm = await getUnifiedFirmBySlug(slug)
  if (!firm) notFound()
  return <FirmDetailClient firm={firm} localePrefix={`/${locale}`} />
}

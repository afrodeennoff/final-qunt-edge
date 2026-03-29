import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUnifiedFirmBySlug } from '@/server/deals'
import { FirmDetailClient } from './page-client'
import { getLocaleAlternates } from '@/lib/seo'
import { buildOrganizationSchema } from '@/lib/seo'
import { getSiteOrigin } from '@/lib/site-url'

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
  const siteOrigin = getSiteOrigin()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                ...buildOrganizationSchema(),
              },
              {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Prop Firms',
                    item: `${siteOrigin}/propfirms`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: firm.name,
                    item: `${siteOrigin}/firm/${firm.slug}`,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <FirmDetailClient firm={firm} localePrefix={`/${locale}`} />
    </>
  )
}

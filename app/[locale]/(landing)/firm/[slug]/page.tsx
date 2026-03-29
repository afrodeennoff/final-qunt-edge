import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUnifiedFirmBySlug } from '@/server/deals'
import { FirmDetailClient } from './page-client'
import { getLocaleAlternates } from '@/lib/seo'
import { buildOrganizationSchema } from '@/lib/seo'
import { getSiteOrigin } from '@/lib/site-url'
import {
  getVerifiedPropFirmProfileByName,
  getVerifiedPropFirmProfileBySlug,
} from '@/lib/prop-firms/verified-profiles'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const requestedSlug = slug.trim()
  const matchedProfile =
    getVerifiedPropFirmProfileByName(requestedSlug) ??
    getVerifiedPropFirmProfileBySlug(requestedSlug)
  const firm =
    (await getUnifiedFirmBySlug(requestedSlug)) ??
    (await getUnifiedFirmBySlug(matchedProfile?.slug ?? requestedSlug))

  if (!firm) {
    return {
      title: 'Prop Firms | Qunt Edge',
      description:
        'Review futures prop firms, challenge rules, payout data, and active promos on Qunt Edge.',
      alternates: getLocaleAlternates(locale, '/propfirms'),
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
  const requestedSlug = slug.trim()
  const directFirm = await getUnifiedFirmBySlug(requestedSlug)

  if (directFirm) {
    if (directFirm.slug !== requestedSlug) {
      redirect(`/${locale}/firm/${directFirm.slug}`)
    }
  } else {
    const matchedProfile =
      getVerifiedPropFirmProfileByName(requestedSlug) ??
      getVerifiedPropFirmProfileBySlug(requestedSlug)
    if (matchedProfile && matchedProfile.slug !== requestedSlug) {
      const canonicalFirm = await getUnifiedFirmBySlug(matchedProfile.slug)
      if (canonicalFirm) {
        redirect(`/${locale}/firm/${canonicalFirm.slug}`)
      }
    }
    redirect(`/${locale}/propfirms`)
  }

  const firm = directFirm
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
                    item: `${siteOrigin}/${locale}/propfirms`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: firm.name,
                    item: `${siteOrigin}/${locale}/firm/${firm.slug}`,
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

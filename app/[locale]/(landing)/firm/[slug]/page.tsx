import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { getUnifiedFirmBySlug, getUnifiedFirms } from '@/server/deals'
import type { UnifiedFirm } from '@/server/deals'
import { FirmDetailClient } from './page-client'
import { getLocaleAlternates } from '@/lib/seo'
import { buildOrganizationSchema } from '@/lib/seo'
import { getSiteOrigin } from '@/lib/site-url'
import {
  getVerifiedPropFirmProfileByName,
  getVerifiedPropFirmProfileBySlug,
  type VerifiedPropFirmProfile,
} from '@/lib/prop-firms/verified-profiles'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'

function getFallbackAccountSizes(profileName: string): UnifiedFirm['accountSizes'] {
  const normalizedProfileName = normalizeFirmName(profileName)
  const configMatch = Object.values(propFirms).find(
    (firm) => normalizeFirmName(firm.name) === normalizedProfileName
  )
  if (!configMatch) return {}

  const mapped: UnifiedFirm['accountSizes'] = {}
  for (const [key, size] of Object.entries(configMatch.accountSizes)) {
    mapped[key] = {
      name: size.name,
      balance: size.balance,
      price: size.price,
      priceWithPromo: size.priceWithPromo,
      target: size.target,
      dailyLoss: size.dailyLoss ?? null,
      drawdown: size.drawdown,
      trailing: size.trailing,
      profitSharing: size.profitSharing,
      evaluation: size.evaluation,
    }
  }
  return mapped
}

function buildFallbackUnifiedFirm(profile: VerifiedPropFirmProfile): UnifiedFirm {
  return {
    id: `fallback-${profile.slug}`,
    slug: profile.slug,
    name: profile.name,
    description: profile.shortDesc,
    shortDesc: profile.shortDesc,
    referralUrl: profile.referralUrl,
    logoUrl: undefined,
    category: profile.category,
    platform: profile.platform,
    payoutModel: profile.payoutModel,
    drawdownType: profile.drawdownType,
    profitSplit: profile.profitSplit,
    maxAllocation: profile.maxAllocation,
    challengeCount: 0,
    spotlight: null,
    catalogueStats: {
      accountsCount: 0,
      totalAccountValue: 0,
      paidPayoutAmount: 0,
      paidPayoutCount: 0,
      pendingPayoutAmount: 0,
      sizeBreakdown: 'Live database stats unavailable in current snapshot',
    },
    accountSizes: getFallbackAccountSizes(profile.name),
    coupons: [],
    _count: {
      reviews: 0,
      coupons: 0,
    },
    liveReviewStats: {
      averageRating: null,
      approvedCount: 0,
    },
  }
}

function decodeFirmSlugParam(requestedSlugRaw: string): string {
  const trimmed = requestedSlugRaw.trim()
  if (!trimmed) return trimmed

  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

async function resolveFirmBySlugInput(requestedSlugRaw: string) {
  const requestedSlug = decodeFirmSlugParam(requestedSlugRaw)
  const normalizedRequested = normalizeFirmName(requestedSlug)
  const directFirm = await getUnifiedFirmBySlug(requestedSlug)
  if (directFirm) {
    return {
      firm: directFirm,
      requestedSlug,
    }
  }

  const matchedProfile =
    getVerifiedPropFirmProfileByName(requestedSlug) ??
    getVerifiedPropFirmProfileBySlug(requestedSlug)

  if (!matchedProfile) {
    return {
      firm: null,
      requestedSlug,
    }
  }

  const canonicalSlugFirm = await getUnifiedFirmBySlug(matchedProfile.slug)
  if (canonicalSlugFirm) {
    return {
      firm: canonicalSlugFirm,
      requestedSlug,
    }
  }

  const unifiedFirms = await getUnifiedFirms()
  const canonicalNameFirm = unifiedFirms.find((firm) => {
    const normalizedFirmSlug = normalizeFirmName(firm.slug)
    const normalizedFirmName = normalizeFirmName(firm.name)
    const normalizedProfileName = normalizeFirmName(matchedProfile.name)
    const normalizedProfileSlug = normalizeFirmName(matchedProfile.slug)

    return (
      normalizedFirmSlug === normalizedRequested ||
      normalizedFirmName === normalizedRequested ||
      normalizedFirmSlug === normalizedProfileSlug ||
      normalizedFirmName === normalizedProfileName
    )
  }) ?? null

  return {
    firm: canonicalNameFirm ?? buildFallbackUnifiedFirm(matchedProfile),
    requestedSlug,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}): Promise<Metadata> {
  const { slug, locale } = await params
  const { firm } = await resolveFirmBySlugInput(slug)

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
  await connection()
  const { firm, requestedSlug } = await resolveFirmBySlugInput(slug)
  if (!firm) {
    redirect(`/${locale}/propfirms`)
  }
  if (firm.slug !== requestedSlug) {
    redirect(`/${locale}/firm/${firm.slug}`)
  }

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

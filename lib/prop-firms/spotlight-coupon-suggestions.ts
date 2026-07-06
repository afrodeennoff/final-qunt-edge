import { propFirms } from '@/lib/prop-firms-config'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
import {
  getVerifiedPropFirmProfileByName,
  getVerifiedPropFirmProfileBySlug,
} from '@/lib/prop-firms/verified-profiles'
import { PROP_FIRM_MATCH_SPOTLIGHTS } from '@/lib/propfirmmatch/source'

export type SpotlightCouponSuggestion = {
  spotlightSlug: string
  firmSlug: string
  firmName: string
  discountPercent: number
  couponCode: string
  challengeFee: number
  claimUrl: string
  platform: string
  payoutModel: string
  drawdownType: string
  description: string
  sourceUrl: string
}

function parseDiscountPercentFromPromoText(promoText: string): number | null {
  // Match percentage discounts: "85% off", "20% off all accounts"
  const percentMatch = promoText.match(/(\d{1,3}(?:\.\d+)?)\s*%/i)
  if (percentMatch) {
    const parsed = Number(percentMatch[1])
    if (Number.isFinite(parsed) && parsed > 0) return Math.min(100, Math.round(parsed))
  }

  return null
}

function getAccountSizesFromConfig(firmName: string) {
  const normalizedFirmName = normalizeFirmName(firmName)

  const matchedEntry = Object.values(propFirms).find(
    (firm) => normalizeFirmName(firm.name) === normalizedFirmName,
  )

  return matchedEntry?.accountSizes ?? {}
}

function estimateChallengeFeeFromConfig(firmName: string): number {
  const accountSizes = getAccountSizesFromConfig(firmName)
  const prices = Object.values(accountSizes)
    .flatMap((size) => [size.priceWithPromo, size.price])
    .filter((value) => Number.isFinite(value) && value > 0)

  if (prices.length === 0) return 0
  return Math.round(Math.min(...prices))
}

function toSpotlightCouponSuggestion(
  spotlight: (typeof PROP_FIRM_MATCH_SPOTLIGHTS)[number],
): SpotlightCouponSuggestion | null {
  const discountPercent = parseDiscountPercentFromPromoText(spotlight.promoText)
  // Include spotlights even without a % discount — they still have a code and claim URL
  // discountPercent will be null/0, but the description carries the real promo text

  const profile =
    getVerifiedPropFirmProfileBySlug(spotlight.slug) ??
    getVerifiedPropFirmProfileByName(spotlight.name)

  const firmName = profile?.name ?? spotlight.name
  const firmSlug = profile?.slug ?? spotlight.slug

  return {
    spotlightSlug: spotlight.slug,
    firmSlug,
    firmName,
    discountPercent: discountPercent ?? 0,
    couponCode: spotlight.promoCode?.trim() || 'MATCH',
    challengeFee: estimateChallengeFeeFromConfig(firmName),
    claimUrl: profile?.referralUrl ?? spotlight.sourceUrl,
    platform: profile?.platform ?? 'Tradovate',
    payoutModel: profile?.payoutModel ?? 'Monthly',
    drawdownType: profile?.drawdownType ?? 'Static',
    description: spotlight.promoText,
    sourceUrl: spotlight.sourceUrl,
  }
}

export function listSpotlightCouponSuggestions(): SpotlightCouponSuggestion[] {
  return PROP_FIRM_MATCH_SPOTLIGHTS.map(toSpotlightCouponSuggestion).filter(
    (suggestion): suggestion is SpotlightCouponSuggestion => suggestion !== null,
  )
}

export function getSpotlightCouponSuggestionForFirm(input: {
  name?: string | null
  slug?: string | null
}): SpotlightCouponSuggestion | null {
  const normalizedName = input.name ? normalizeFirmName(input.name) : null
  const normalizedSlug = input.slug ? input.slug.trim().toLowerCase() : null

  return (
    listSpotlightCouponSuggestions().find((suggestion) => {
      return (
        (normalizedSlug !== null && suggestion.firmSlug.trim().toLowerCase() === normalizedSlug) ||
        (normalizedName !== null && normalizeFirmName(suggestion.firmName) === normalizedName)
      )
    }) ?? null
  )
}

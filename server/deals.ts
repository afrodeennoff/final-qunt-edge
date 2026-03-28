import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { cacheLife, cacheTag } from 'next/cache'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import {
  PROP_FIRM_MATCH_SOURCE_DATE,
  PROP_FIRM_MATCH_SPOTLIGHTS,
  type PropFirmMatchSpotlight,
} from '@/lib/propfirmmatch/source'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
import { getVerifiedPropFirmProfileByName } from '@/lib/prop-firms/verified-profiles'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'

export type MarketType = 'Futures' | 'Forex' | 'Crypto'
export type TradingPlatform = 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
export type PayoutModel = 'Bi-weekly' | 'Weekly' | 'On-demand' | 'Monthly'
export type DrawdownType = 'Trailing' | 'Static' | 'End-of-day'

export interface DealItem {
  id: string
  firmId: string
  firmSlug: string
  firmName: string
  logoUrl?: string
  category: MarketType
  platform: TradingPlatform
  payoutModel: PayoutModel
  drawdownType: DrawdownType
  discountPercent: number
  couponCode: string
  challengeFee: number
  expiryDate: string
  claimUrl: string | null
}

export interface AccountSizeData {
  name: string
  balance: number
  price: number
  priceWithPromo: number
  target: number
  dailyLoss: number | null
  drawdown: number
  trailing?: string
  profitSharing: number
  evaluation: boolean
}

export interface UnifiedFirm {
  id: string
  slug: string
  name: string
  description?: string
  shortDesc?: string
  referralUrl?: string
  logoUrl?: string
  category: MarketType
  platform: TradingPlatform
  payoutModel: PayoutModel
  drawdownType: DrawdownType
  profitSplit: string
  maxAllocation: string
  challengeCount: number
  spotlight: PropFirmMatchSpotlight | null
  catalogueStats: {
    accountsCount: number
    totalAccountValue: number
    paidPayoutAmount: number
    paidPayoutCount: number
    pendingPayoutAmount: number
    sizeBreakdown: string
  }
  accountSizes: Record<string, AccountSizeData>
  coupons: FirmCoupon[]
  _count: {
    reviews: number
    coupons: number
  }
  liveReviewStats: {
    averageRating: number | null
    approvedCount: number
  }
}

interface FirmCoupon {
  id: string
  code: string
  discountPercent: number
  challengeFee: number | null
  expiresAt: Date | null
  claimUrl: string | null
}

interface CatalogueStatsSnapshot {
  accountsCount: number
  totalAccountValue: number
  paidPayoutAmount: number
  paidPayoutCount: number
  pendingPayoutAmount: number
  sizeBreakdown: string
}

interface CouponRecord {
  id: string
  code: string
  discountPercent: number | null
  challengeFee: number | null
  expiresAt: Date | null
  claimUrl: string | null
}

interface FirmRecord {
  id: string
  slug: string
  name: string
  description: string | null
  shortDesc: string | null
  referralUrl: string | null
  logoUrl: string | null
  category: string | null
  platform: string | null
  payoutModel: string | null
  drawdownType: string | null
  profitSplit: string | null
  maxAllocation: string | null
  coupons: CouponRecord[]
  reviews: Array<{ id: string; rating: number; status: string }>
  _count: {
    reviews: number
    coupons: number
  }
}

export interface DealsOverview {
  totalTrackedFirms: number
  totalLiveDeals: number
  totalAccounts: number
  totalAccountValue: number
  totalPaidPayoutAmount: number
  totalPaidPayoutCount: number
}

export interface DealsSpotlightCollection {
  updatedAt: string
  futures: PropFirmMatchSpotlight[]
  cfd: PropFirmMatchSpotlight[]
}

function withTextFallback(value: string | null | undefined, fallback: string): string {
  return value ?? fallback
}

function withMeaningfulText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const normalized = trimmed.toLowerCase()
  if (normalized === 'unknown' || normalized === 'n/a' || normalized === 'na') return null
  return trimmed
}

function withNumberFallback(value: number | null | undefined, fallback = 0): number {
  return value ?? fallback
}

function mapFirmCategory(value: string | null | undefined): MarketType {
  return (value || 'Futures') as MarketType
}

function mapFirmPlatform(value: string | null | undefined): TradingPlatform {
  return (value || 'Tradovate') as TradingPlatform
}

function mapFirmPayoutModel(value: string | null | undefined): PayoutModel {
  return (value || 'Monthly') as PayoutModel
}

function mapFirmDrawdownType(value: string | null | undefined): DrawdownType {
  return (value || 'Static') as DrawdownType
}

function getCataloguePayoutStats(catalogueEntry?: {
  payouts: {
    paidAmount: number
    paidCount: number
    pendingAmount: number
  }
}) {
  return {
    paidPayoutAmount: withNumberFallback(catalogueEntry?.payouts.paidAmount),
    paidPayoutCount: withNumberFallback(catalogueEntry?.payouts.paidCount),
    pendingPayoutAmount: withNumberFallback(catalogueEntry?.payouts.pendingAmount),
  }
}

function buildCatalogueStats(catalogueEntry?: {
  accountsCount: number
  totalAccountValue: number
  payouts: {
    paidAmount: number
    paidCount: number
    pendingAmount: number
  }
  sizeBreakdown: string
}): CatalogueStatsSnapshot {
  const payoutStats = getCataloguePayoutStats(catalogueEntry)

  return {
    accountsCount: withNumberFallback(catalogueEntry?.accountsCount),
    totalAccountValue: withNumberFallback(catalogueEntry?.totalAccountValue),
    sizeBreakdown: withTextFallback(catalogueEntry?.sizeBreakdown, 'No live account data yet'),
    ...payoutStats,
  }
}

function mapFirmCoupon(coupon: CouponRecord): FirmCoupon {
  return {
    id: coupon.id,
    code: coupon.code,
    discountPercent: coupon.discountPercent ?? 0,
    challengeFee: coupon.challengeFee ?? 0,
    expiresAt: coupon.expiresAt,
    claimUrl: coupon.claimUrl,
  }
}

function buildUnifiedFirm(
  firm: FirmRecord,
  catalogueEntry?: Parameters<typeof buildCatalogueStats>[0],
  spotlight: PropFirmMatchSpotlight | null = null
): UnifiedFirm {
  const profile = getVerifiedPropFirmProfileByName(firm.name)
  const description = withMeaningfulText(firm.description) ?? profile?.shortDesc
  const shortDesc = withMeaningfulText(firm.shortDesc) ?? profile?.shortDesc
  const referralUrl = withMeaningfulText(firm.referralUrl) ?? profile?.referralUrl
  const logoUrl = firm.logoUrl ?? undefined

  const approvedReviews = firm.reviews.filter((review) => review.status.toLowerCase() === 'approved')
  const ratingValues = approvedReviews
    .map((review) => review.rating)
    .filter((rating) => Number.isFinite(rating) && rating > 0)
  const averageRating = ratingValues.length > 0
    ? ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length
    : null

  return {
    id: firm.id,
    slug: firm.slug,
    name: firm.name,
    description,
    shortDesc,
    referralUrl,
    logoUrl,
    category: mapFirmCategory(withMeaningfulText(firm.category) ?? profile?.category ?? 'Futures'),
    platform: mapFirmPlatform(withMeaningfulText(firm.platform) ?? profile?.platform ?? 'Tradovate'),
    payoutModel: mapFirmPayoutModel(withMeaningfulText(firm.payoutModel) ?? profile?.payoutModel ?? 'Monthly'),
    drawdownType: mapFirmDrawdownType(withMeaningfulText(firm.drawdownType) ?? profile?.drawdownType ?? 'Static'),
    profitSplit: withTextFallback(withMeaningfulText(firm.profitSplit), profile?.profitSplit ?? '80/20'),
    maxAllocation: withTextFallback(withMeaningfulText(firm.maxAllocation), profile?.maxAllocation ?? '$100K'),
    challengeCount: firm.reviews.length,
    spotlight,
    catalogueStats: buildCatalogueStats(catalogueEntry),
    accountSizes: getAccountSizesFromConfig(firm.name),
    coupons: firm.coupons.map(mapFirmCoupon),
    _count: {
      reviews: firm._count.reviews,
      coupons: firm._count.coupons,
    },
    liveReviewStats: {
      averageRating,
      approvedCount: approvedReviews.length,
    },
  }
}

function findCatalogueEntry(
  firmName: string,
  catalogueEntries: Array<{
    propfirmName: string
    accountsCount: number
    totalAccountValue: number
    payouts: {
      paidAmount: number
      paidCount: number
      pendingAmount: number
    }
    sizeBreakdown: string
  }>
) {
  const normalizedFirmName = normalizeFirmName(firmName)
  return catalogueEntries.find((entry) => normalizeFirmName(entry.propfirmName) === normalizedFirmName)
}

function findSpotlight(firmName: string): PropFirmMatchSpotlight | null {
  const normalizedFirmName = normalizeFirmName(firmName)
  return PROP_FIRM_MATCH_SPOTLIGHTS.find((entry) => normalizeFirmName(entry.name) === normalizedFirmName) ?? null
}

function slugifyFirmName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isPrismaUnavailableError(error: unknown): boolean {
  if (isPrismaSchemaMismatchError(error)) return true

  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'ECONNREFUSED' ||
    maybeError.code === 'P1001' ||
    message.includes('database connection is not configured') ||
    message.includes('attempted to access prisma.') ||
    message.includes('prisma missing connection proxy') ||
    message.includes('econnrefused') ||
    message.includes('can\'t reach database server')
  )
}

function logDealsFallback(source: string, error: unknown) {
  console.warn(`[Deals] Falling back in ${source}`, error)
}

function buildFallbackUnifiedFirmFromConfig(key: string, firm: (typeof propFirms)[keyof typeof propFirms]): UnifiedFirm {
  const profile = getVerifiedPropFirmProfileByName(firm.name)
  return {
    id: `fallback-${key}`,
    slug: profile?.slug ?? slugifyFirmName(firm.name),
    name: firm.name,
    description: profile?.shortDesc,
    shortDesc: profile?.shortDesc,
    referralUrl: profile?.referralUrl,
    logoUrl: undefined,
    category: profile?.category ?? 'Futures',
    platform: profile?.platform ?? 'Tradovate',
    payoutModel: profile?.payoutModel ?? 'Monthly',
    drawdownType: profile?.drawdownType ?? 'Static',
    profitSplit: profile?.profitSplit ?? '80/20',
    maxAllocation: profile?.maxAllocation ?? '$100K',
    challengeCount: 0,
    spotlight: findSpotlight(firm.name),
    catalogueStats: buildCatalogueStats(),
    accountSizes: getAccountSizesFromConfig(firm.name),
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

function getFallbackUnifiedFirms(): UnifiedFirm[] {
  return Object.entries(propFirms)
    .map(([key, firm]) => buildFallbackUnifiedFirmFromConfig(key, firm))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function getFallbackUnifiedFirmBySlug(slug: string): UnifiedFirm | null {
  const normalizedSlug = normalizeFirmName(slug)

  for (const [key, firm] of Object.entries(propFirms)) {
    const fallbackFirm = buildFallbackUnifiedFirmFromConfig(key, firm)
    if (
      normalizeFirmName(fallbackFirm.slug) === normalizedSlug ||
      normalizeFirmName(firm.name) === normalizedSlug ||
      normalizeFirmName(key) === normalizedSlug
    ) {
      return fallbackFirm
    }
  }

  return null
}

async function loadFirmWithRelations(where: { id?: string; slug?: string }): Promise<FirmRecord | null> {
  if (!hasConfiguredDatabaseConnection) {
    return null
  }

  const now = new Date()

  try {
    return await prisma.propFirm.findFirst({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        coupons: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          orderBy: [
            { challengeFee: 'asc' },
            { discountPercent: 'desc' },
          ],
        },
        reviews: { select: { id: true, rating: true, status: true } },
        _count: { select: { reviews: true, coupons: true } },
      },
    })
  } catch (error) {
    if (!isPrismaUnavailableError(error)) {
      throw error
    }

    logDealsFallback('loadFirmWithRelations', error)
    return null
  }
}

async function getUnifiedFirm(where: { id?: string; slug?: string }): Promise<UnifiedFirm | null> {
  const firm = await loadFirmWithRelations(where)
  if (!firm) {
    return where.slug ? getFallbackUnifiedFirmBySlug(where.slug) : null
  }

  const catalogue = await getPropfirmCatalogueData('allTime')
  return buildUnifiedFirm(
    firm,
    findCatalogueEntry(firm.name, catalogue.stats),
    findSpotlight(firm.name)
  )
}

function getAccountSizesFromConfig(firmName: string): Record<string, AccountSizeData> {
  const normalized = normalizeFirmName(firmName)
  for (const [, firm] of Object.entries(propFirms)) {
    if (normalizeFirmName(firm.name) === normalized) {
      const result: Record<string, AccountSizeData> = {}
      for (const [key, size] of Object.entries(firm.accountSizes)) {
        result[key] = {
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
      return result
    }
  }
  return {}
}

export interface FaqItem {
  question: string
  answer: string
}

const DEALS_CACHE_LIFETIME = {
  stale: 3_600,
  revalidate: 3_600,
  expire: 7_200,
} as const

const DEALS_CACHE_TAG = 'deals'
const PROP_FIRMS_CACHE_TAG = 'prop-firms'

const _getActiveDeals = async (): Promise<DealItem[]> => {
  if (!hasConfiguredDatabaseConnection) {
    return getFallbackDeals()
  }

  const now = new Date()
  try {
    const coupons = await prisma.propFirmCoupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      include: {
        propFirm: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            category: true,
            platform: true,
            payoutModel: true,
            drawdownType: true,
          },
        },
      },
      orderBy: { discountPercent: 'desc' },
    })

    if (coupons.length === 0) {
      return getFallbackDeals()
    }

    return coupons.map((coupon) => ({
      id: coupon.id,
      firmId: coupon.propFirm.id,
      firmSlug: coupon.propFirm.slug,
      firmName: coupon.propFirm.name,
      logoUrl: coupon.propFirm.logoUrl ?? undefined,
      category: (coupon.propFirm.category || 'Futures') as MarketType,
      platform: (coupon.propFirm.platform || 'Tradovate') as TradingPlatform,
      payoutModel: (coupon.propFirm.payoutModel || 'Monthly') as PayoutModel,
      drawdownType: (coupon.propFirm.drawdownType || 'Static') as DrawdownType,
      discountPercent: coupon.discountPercent ?? 0,
      couponCode: coupon.code,
      challengeFee: coupon.challengeFee ?? 0,
      expiryDate: coupon.expiresAt ? coupon.expiresAt.toISOString().split('T')[0] : 'No expiry',
      claimUrl: coupon.claimUrl ?? null,
    }))
  } catch (error) {
    if (!isPrismaUnavailableError(error)) {
      throw error
    }

    logDealsFallback('getActiveDeals', error)
    return getFallbackDeals()
  }
}

function getFallbackDeals(): DealItem[] {
  return PROP_FIRM_MATCH_SPOTLIGHTS.map((spotlight) => {
    const match = spotlight.promoText.match(/(\d+)%?\s*off/i)
    const discountPercent = match ? parseInt(match[1], 10) : 0
    const category: MarketType = spotlight.category === 'Futures' ? 'Futures' : 'Forex'
    const platform: TradingPlatform = spotlight.category === 'Futures' ? 'Tradovate' : 'MetaTrader 5'
    const challengeFee = Math.round(250 * (1 - discountPercent / 100))
    return {
      id: `fallback-${spotlight.slug}`,
      firmId: `fallback-${spotlight.slug}`,
      firmSlug: spotlight.slug,
      firmName: spotlight.name,
      logoUrl: undefined,
      category,
      platform,
      payoutModel: 'Monthly' as PayoutModel,
      drawdownType: 'Static' as DrawdownType,
      discountPercent,
      couponCode: spotlight.promoCode ?? 'PROMO',
      challengeFee: Math.max(challengeFee, 0),
      expiryDate: 'No expiry',
      claimUrl: spotlight.sourceUrl,
    }
  })
}

async function getActiveDealsCached(): Promise<DealItem[]> {
  'use cache'
  cacheLife(DEALS_CACHE_LIFETIME)
  cacheTag(DEALS_CACHE_TAG)
  return _getActiveDeals()
}

const _getUnifiedFirms = async (): Promise<UnifiedFirm[]> => {
  if (!hasConfiguredDatabaseConnection) {
    return getFallbackUnifiedFirms()
  }

  const now = new Date()
  const catalogue = await getPropfirmCatalogueData('allTime')
  const catalogueMap = new Map(
    catalogue.stats.map((entry) => [normalizeFirmName(entry.propfirmName), entry])
  )
  const spotlightMap = new Map(
    PROP_FIRM_MATCH_SPOTLIGHTS.map((entry) => [normalizeFirmName(entry.name), entry])
  )

  try {
    const firms = await prisma.propFirm.findMany({
      where: { isActive: true },
      include: {
        coupons: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
          orderBy: [
            { challengeFee: 'asc' },
            { discountPercent: 'desc' },
          ],
        },
        reviews: { select: { id: true, rating: true, status: true } },
        _count: { select: { reviews: true, coupons: true } },
      },
      orderBy: { name: 'asc' },
    })

    return firms.map((firm) => {
      const normalizedName = normalizeFirmName(firm.name)
      return buildUnifiedFirm(
        firm,
        catalogueMap.get(normalizedName),
        spotlightMap.get(normalizedName) ?? null
      )
    })
  } catch (error) {
    if (!isPrismaUnavailableError(error)) {
      throw error
    }

    logDealsFallback('getUnifiedFirms', error)
    return getFallbackUnifiedFirms()
  }
}

async function getUnifiedFirmsCached(): Promise<UnifiedFirm[]> {
  'use cache'
  cacheLife(DEALS_CACHE_LIFETIME)
  cacheTag(DEALS_CACHE_TAG, PROP_FIRMS_CACHE_TAG)
  return _getUnifiedFirms()
}

export async function getActiveDeals(): Promise<DealItem[]> {
  return getActiveDealsCached()
}

export async function getUnifiedFirms(): Promise<UnifiedFirm[]> {
  return getUnifiedFirmsCached()
}

export async function getDealsOverview(): Promise<DealsOverview> {
  const [firms, deals, catalogue] = await Promise.all([
    getUnifiedFirms(),
    getActiveDeals(),
    getPropfirmCatalogueData('allTime'),
  ])

  const totalAccounts = catalogue.stats.reduce((sum, item) => sum + item.accountsCount, 0)
  const totalAccountValue = catalogue.stats.reduce((sum, item) => sum + item.totalAccountValue, 0)
  const totalPaidPayoutAmount = catalogue.stats.reduce((sum, item) => sum + item.payouts.paidAmount, 0)
  const totalPaidPayoutCount = catalogue.stats.reduce((sum, item) => sum + item.payouts.paidCount, 0)

  return {
    totalTrackedFirms: firms.length,
    totalLiveDeals: deals.length,
    totalAccounts,
    totalAccountValue,
    totalPaidPayoutAmount,
    totalPaidPayoutCount,
  }
}

export function getDealsSpotlights(): DealsSpotlightCollection {
  return {
    updatedAt: PROP_FIRM_MATCH_SOURCE_DATE,
    futures: PROP_FIRM_MATCH_SPOTLIGHTS.filter((item) => item.category === 'Futures'),
    cfd: PROP_FIRM_MATCH_SPOTLIGHTS.filter((item) => item.category === 'CFD'),
  }
}

export const getFirmById = async (firmId: string): Promise<UnifiedFirm | null> => {
  return getUnifiedFirm({ id: firmId })
}

export const getUnifiedFirmBySlug = async (slug: string): Promise<UnifiedFirm | null> => {
  return getUnifiedFirm({ slug })
}

export const getFirmDeals = async (firmId: string): Promise<DealItem[]> => {
  if (!hasConfiguredDatabaseConnection) {
    return getFallbackDealsForFirm(firmId)
  }

  const now = new Date()
  try {
    const firm = await prisma.propFirm.findUnique({
      where: { id: firmId, isActive: true },
    })
    if (!firm) return getFallbackDealsForFirm(firmId)

    const coupons = await prisma.propFirmCoupon.findMany({
      where: {
        propFirmId: firmId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      include: {
        propFirm: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            category: true,
            platform: true,
            payoutModel: true,
            drawdownType: true,
          },
        },
      },
      orderBy: { discountPercent: 'desc' },
    })

    if (coupons.length === 0) {
      return getFallbackDealsForFirm(firmId)
    }

    return coupons.map((coupon) => ({
      id: coupon.id,
      firmId: coupon.propFirm.id,
      firmSlug: coupon.propFirm.slug,
      firmName: coupon.propFirm.name,
      logoUrl: coupon.propFirm.logoUrl ?? undefined,
      category: (coupon.propFirm.category || 'Futures') as MarketType,
      platform: (coupon.propFirm.platform || 'Tradovate') as TradingPlatform,
      payoutModel: (coupon.propFirm.payoutModel || 'Monthly') as PayoutModel,
      drawdownType: (coupon.propFirm.drawdownType || 'Static') as DrawdownType,
      discountPercent: coupon.discountPercent ?? 0,
      couponCode: coupon.code,
      challengeFee: coupon.challengeFee ?? 0,
      expiryDate: coupon.expiresAt ? coupon.expiresAt.toISOString().split('T')[0] : 'No expiry',
      claimUrl: coupon.claimUrl ?? null,
    }))
  } catch (error) {
    if (!isPrismaUnavailableError(error)) {
      throw error
    }

    logDealsFallback('getFirmDeals', error)
    return getFallbackDealsForFirm(firmId)
  }
}

function getFallbackDealsForFirm(firmId: string): DealItem[] {
  const spotlight = PROP_FIRM_MATCH_SPOTLIGHTS.find((s) => s.slug === firmId || `fallback-${slugifyFirmName(s.name)}` === firmId)
  if (!spotlight) return []
  const match = spotlight.promoText.match(/(\d+)%?\s*off/i)
  const discountPercent = match ? parseInt(match[1], 10) : 0
  const category: MarketType = spotlight.category === 'Futures' ? 'Futures' : 'Forex'
  const platform: TradingPlatform = spotlight.category === 'Futures' ? 'Tradovate' : 'MetaTrader 5'
  const challengeFee = Math.round(250 * (1 - discountPercent / 100))
  return [{
    id: `fallback-${spotlight.slug}`,
    firmId: `fallback-${spotlight.slug}`,
    firmSlug: spotlight.slug,
    firmName: spotlight.name,
    logoUrl: undefined,
    category,
    platform,
    payoutModel: 'Monthly' as PayoutModel,
    drawdownType: 'Static' as DrawdownType,
    discountPercent,
    couponCode: spotlight.promoCode ?? 'PROMO',
    challengeFee: Math.max(challengeFee, 0),
    expiryDate: 'No expiry',
    claimUrl: spotlight.sourceUrl,
  }]
}

export const getDefaultFaqs = async (): Promise<FaqItem[]> => [
  { question: 'What is Qunt Edge Deals?', answer: 'Qunt Edge Deals is a curated deals surface for futures prop firms. It helps you spot active promos quickly, then move into deeper analysis before you commit to a challenge.' },
  { question: 'How are deals verified?', answer: 'Each deal is manually checked against public checkout pages and then stamped with a verification timestamp in our editorial queue.' },
  { question: 'Are these offers maintained in real time?', answer: 'Offers are reviewed frequently and refreshed when terms change. Because firms can update campaigns without notice, always confirm the final checkout details before purchase.' },
  { question: 'Can I trust the ratings?', answer: 'Ratings are based on approved user reviews and reflect real trader experiences with each firm.' },
  { question: 'How should I choose between deals?', answer: 'Start with your risk model and payout timeline, not just the biggest headline discount. Fees, drawdown mechanics, and reset costs can matter more than the first promo percentage.' },
  { question: 'Where can I ask a question that is not listed here?', answer: 'You can reach Qunt Edge support from the support page. Include the firm name and the offer you saw so we can help you verify the best current path.' },
]

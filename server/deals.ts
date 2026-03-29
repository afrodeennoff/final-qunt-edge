import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { cacheLife, cacheTag } from 'next/cache'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import {
  type PropFirmMatchSpotlight,
} from '@/lib/propfirmmatch/source'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'
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
  const description = withMeaningfulText(firm.description) ?? undefined
  const shortDesc = withMeaningfulText(firm.shortDesc) ?? undefined
  const referralUrl = withMeaningfulText(firm.referralUrl) ?? undefined
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
    ...(description ? { description } : {}),
    ...(shortDesc ? { shortDesc } : {}),
    ...(referralUrl ? { referralUrl } : {}),
    logoUrl,
    category: mapFirmCategory(withMeaningfulText(firm.category) ?? 'Futures'),
    platform: mapFirmPlatform(withMeaningfulText(firm.platform) ?? 'Tradovate'),
    payoutModel: mapFirmPayoutModel(withMeaningfulText(firm.payoutModel) ?? 'Monthly'),
    drawdownType: mapFirmDrawdownType(withMeaningfulText(firm.drawdownType) ?? 'Static'),
    profitSplit: withTextFallback(withMeaningfulText(firm.profitSplit), 'Not listed'),
    maxAllocation: withTextFallback(withMeaningfulText(firm.maxAllocation), 'Not listed'),
    challengeCount: firm.reviews.length,
    spotlight,
    catalogueStats: buildCatalogueStats(catalogueEntry),
    accountSizes: {},
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
  if (!firm) return null

  const catalogue = await getPropfirmCatalogueData('allTime')
  return buildUnifiedFirm(
    firm,
    findCatalogueEntry(firm.name, catalogue.stats),
    null
  )
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
    return []
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

    if (coupons.length === 0) return []

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
    return []
  }
}

async function getActiveDealsCached(): Promise<DealItem[]> {
  'use cache'
  cacheLife(DEALS_CACHE_LIFETIME)
  cacheTag(DEALS_CACHE_TAG)
  return _getActiveDeals()
}

const _getUnifiedFirms = async (): Promise<UnifiedFirm[]> => {
  if (!hasConfiguredDatabaseConnection) {
    return []
  }

  const now = new Date()
  const catalogue = await getPropfirmCatalogueData('allTime')
  const catalogueMap = new Map(
    catalogue.stats.map((entry) => [normalizeFirmName(entry.propfirmName), entry])
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
        null
      )
    })
  } catch (error) {
    if (!isPrismaUnavailableError(error)) {
      throw error
    }

    logDealsFallback('getUnifiedFirms', error)
    return []
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

export async function getDealsSpotlights(): Promise<DealsSpotlightCollection> {
  const firms = await getUnifiedFirms()
  const buildCategorySpotlights = (category: 'Futures' | 'CFD') => {
    const candidates = firms
      .filter((firm) => (category === 'Futures' ? firm.category === 'Futures' : firm.category !== 'Futures'))
      .map((firm): PropFirmMatchSpotlight => {
        const topCoupon = [...firm.coupons]
          .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))[0]

        const hasDiscount = typeof topCoupon?.discountPercent === 'number' && topCoupon.discountPercent > 0
        const promoText = hasDiscount
          ? `${Math.round(topCoupon.discountPercent)}% off${topCoupon?.code ? ` with ${topCoupon.code}` : ''}`
          : topCoupon?.code
            ? `Use code ${topCoupon.code}`
            : 'Live offers'

        return {
          slug: firm.slug,
          name: firm.name,
          category,
          rating: firm.liveReviewStats.averageRating ?? 0,
          reviewCount: firm.liveReviewStats.approvedCount,
          promoText,
          promoCode: topCoupon?.code,
          maxAllocation: firm.maxAllocation,
          sourceUrl: firm.referralUrl ?? `/firm/${firm.slug}`,
        }
      })
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)

    return candidates.slice(0, 4)
  }

  return {
    updatedAt: new Date().toISOString().split('T')[0] ?? '',
    futures: buildCategorySpotlights('Futures'),
    cfd: buildCategorySpotlights('CFD'),
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
    return []
  }

  const now = new Date()
  try {
    const firm = await prisma.propFirm.findUnique({
      where: { id: firmId, isActive: true },
    })
    if (!firm) return []

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

    if (coupons.length === 0) return []

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
    return []
  }
}

export const getDefaultFaqs = async (): Promise<FaqItem[]> => [
  { question: 'What is Qunt Edge Deals?', answer: 'Qunt Edge Deals is a curated deals surface for futures prop firms. It helps you spot active promos quickly, then move into deeper analysis before you commit to a challenge.' },
  { question: 'How are deals verified?', answer: 'Each deal is manually checked against public checkout pages and then stamped with a verification timestamp in our editorial queue.' },
  { question: 'Are these offers maintained in real time?', answer: 'Offers are reviewed frequently and refreshed when terms change. Because firms can update campaigns without notice, always confirm the final checkout details before purchase.' },
  { question: 'Can I trust the ratings?', answer: 'Ratings are based on approved user reviews and reflect real trader experiences with each firm.' },
  { question: 'How should I choose between deals?', answer: 'Start with your risk model and payout timeline, not just the biggest headline discount. Fees, drawdown mechanics, and reset costs can matter more than the first promo percentage.' },
  { question: 'Where can I ask a question that is not listed here?', answer: 'You can reach Qunt Edge support from the support page. Include the firm name and the offer you saw so we can help you verify the best current path.' },
]

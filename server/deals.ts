import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import {
  PROP_FIRM_MATCH_SOURCE_DATE,
  PROP_FIRM_MATCH_SPOTLIGHTS,
  type PropFirmMatchSpotlight,
} from '@/lib/propfirmmatch/source'
import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { normalizeFirmName } from '@/lib/prop-firms/normalize'

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
  reviews: Array<{ id: string }>
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
  const description = firm.description ?? undefined
  const shortDesc = firm.shortDesc ?? undefined
  const referralUrl = firm.referralUrl ?? undefined
  const logoUrl = firm.logoUrl ?? undefined

  return {
    id: firm.id,
    slug: firm.slug,
    name: firm.name,
    description,
    shortDesc,
    referralUrl,
    logoUrl,
    category: mapFirmCategory(firm.category),
    platform: mapFirmPlatform(firm.platform),
    payoutModel: mapFirmPayoutModel(firm.payoutModel),
    drawdownType: mapFirmDrawdownType(firm.drawdownType),
    profitSplit: withTextFallback(firm.profitSplit, '80/20'),
    maxAllocation: withTextFallback(firm.maxAllocation, '$100K'),
    challengeCount: firm.reviews.length,
    spotlight,
    catalogueStats: buildCatalogueStats(catalogueEntry),
    accountSizes: getAccountSizesFromConfig(firm.name),
    coupons: firm.coupons.map(mapFirmCoupon),
    _count: {
      reviews: firm._count.reviews,
      coupons: firm._count.coupons,
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

async function loadFirmWithRelations(where: { id?: string; slug?: string }): Promise<FirmRecord | null> {
  const now = new Date()

  return prisma.propFirm.findFirst({
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
      reviews: { select: { id: true } },
      _count: { select: { reviews: true, coupons: true } },
    },
  })
}

async function getUnifiedFirm(where: { id?: string; slug?: string }): Promise<UnifiedFirm | null> {
  const firm = await loadFirmWithRelations(where)
  if (!firm) return null

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

const _getActiveDeals = async (): Promise<DealItem[]> => {
  const now = new Date()
  
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
}

export const getActiveDeals = unstable_cache(
  _getActiveDeals,
  ['deals-active'],
  { revalidate: 3600, tags: ['deals'] }
)

const _getUnifiedFirms = async (): Promise<UnifiedFirm[]> => {
  const now = new Date()
  const catalogue = await getPropfirmCatalogueData('allTime')
  const catalogueMap = new Map(
    catalogue.stats.map((entry) => [normalizeFirmName(entry.propfirmName), entry])
  )
  const spotlightMap = new Map(
    PROP_FIRM_MATCH_SPOTLIGHTS.map((entry) => [normalizeFirmName(entry.name), entry])
  )

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
      reviews: { select: { id: true } },
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
}

export const getUnifiedFirms = unstable_cache(
  _getUnifiedFirms,
  ['deals-firms'],
  { revalidate: 3600, tags: ['deals', 'prop-firms'] }
)

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
  const now = new Date()
  
  // First verify the firm exists and is active
  const firm = await prisma.propFirm.findUnique({
    where: { id: firmId, isActive: true },
  })
  
  if (!firm) return []
  
  // Get active coupons/deals for this firm
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
}

export const getDefaultFaqs = async (): Promise<FaqItem[]> => [
  { question: 'How are deals verified?', answer: 'Each deal is manually checked against public checkout pages and then stamped with a verification timestamp in our editorial queue.' },
  { question: 'How often is this page updated?', answer: 'The deal board is reviewed daily and refreshed faster if firms publish urgent promo changes.' },
  { question: 'Can I filter for futures only?', answer: 'Yes. Use the Market Type filter and select Futures to narrow all cards and comparison rows.' },
  { question: 'What does drawdown type mean?', answer: 'Drawdown type explains how loss limits are measured. Trailing, static, and end-of-day each impact strategy differently.' },
  { question: 'Do you include expired offers?', answer: 'Expired deals are automatically excluded from the featured board to keep the page actionable.' },
  { question: 'Can I trust the ratings?', answer: 'Ratings are based on verified user reviews and reflect real trader experiences with each firm.' },
  { question: 'Is this financial advice?', answer: 'No. The page is an informational comparison and discount directory. Final decisions remain your responsibility.' },
  { question: 'Why do some links use affiliate tracking?', answer: 'Some external claim links may include referral parameters. This helps fund maintenance while keeping tools free.' },
  { question: 'How do I compare payout models?', answer: 'Sort the table by payout frequency and profit split, then filter by drawdown type to match your risk profile.' },
  { question: 'Can I plug in live API data later?', answer: 'Yes. The page uses typed structures designed to be refreshed from the database without UI rewrites.' },
]

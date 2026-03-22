import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { getPropfirmCatalogueData } from '@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue'
import {
  PROP_FIRM_MATCH_SOURCE_DATE,
  PROP_FIRM_MATCH_SPOTLIGHTS,
  type PropFirmMatchSpotlight,
} from '@/lib/propfirmmatch/source'

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

function normalizeFirmName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export interface FaqItem {
  question: string
  answer: string
}

const _getActiveDeals = async (): Promise<DealItem[]> => {
  const now = new Date()
  
  const coupons = await prisma.firmCoupon.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    include: {
      propfirm: {
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
    firmId: coupon.propfirm.id,
    firmSlug: coupon.propfirm.slug,
    firmName: coupon.propfirm.name,
    logoUrl: coupon.propfirm.logoUrl ?? undefined,
    category: (coupon.propfirm.category || 'Futures') as MarketType,
    platform: (coupon.propfirm.platform || 'Tradovate') as TradingPlatform,
    payoutModel: (coupon.propfirm.payoutModel || 'Monthly') as PayoutModel,
    drawdownType: (coupon.propfirm.drawdownType || 'Static') as DrawdownType,
    discountPercent: coupon.discountPercent,
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
      challenges: {
        where: { isActive: true },
        select: { id: true },
      },
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
      _count: { select: { reviews: true, coupons: true } },
    },
    orderBy: { name: 'asc' },
  })

  return firms.map((firm) => ({
    id: firm.id,
    slug: firm.slug,
    name: firm.name,
    description: firm.description ?? undefined,
    shortDesc: firm.shortDesc ?? undefined,
    referralUrl: firm.referralUrl ?? undefined,
    logoUrl: firm.logoUrl ?? undefined,
    category: (firm.category || 'Futures') as MarketType,
    platform: (firm.platform || 'Tradovate') as TradingPlatform,
    payoutModel: (firm.payoutModel || 'Monthly') as PayoutModel,
    drawdownType: (firm.drawdownType || 'Static') as DrawdownType,
    profitSplit: firm.profitSplit || '80/20',
    maxAllocation: firm.maxAllocation || '$100K',
    challengeCount: firm.challenges.length,
    spotlight: spotlightMap.get(normalizeFirmName(firm.name)) ?? null,
    catalogueStats: {
      accountsCount: catalogueMap.get(normalizeFirmName(firm.name))?.accountsCount ?? 0,
      totalAccountValue: catalogueMap.get(normalizeFirmName(firm.name))?.totalAccountValue ?? 0,
      paidPayoutAmount: catalogueMap.get(normalizeFirmName(firm.name))?.payouts.paidAmount ?? 0,
      paidPayoutCount: catalogueMap.get(normalizeFirmName(firm.name))?.payouts.paidCount ?? 0,
      pendingPayoutAmount: catalogueMap.get(normalizeFirmName(firm.name))?.payouts.pendingAmount ?? 0,
      sizeBreakdown: catalogueMap.get(normalizeFirmName(firm.name))?.sizeBreakdown ?? 'No live account data yet',
    },
    coupons: firm.coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent,
      challengeFee: c.challengeFee,
      expiresAt: c.expiresAt,
      claimUrl: c.claimUrl,
    })),
    _count: {
      reviews: firm._count.reviews,
      coupons: firm._count.coupons,
    },
  }))
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
  const now = new Date()
  
  const firm = await prisma.propFirm.findUnique({
    where: { id: firmId, isActive: true },
    include: {
      challenges: {
        where: { isActive: true },
        select: { id: true },
      },
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
      _count: { select: { reviews: true, coupons: true } },
    },
  })
  
  if (!firm) return null
  
  // Get catalogue data for this firm
  const catalogue = await getPropfirmCatalogueData('allTime')
  const catalogueEntry = catalogue.stats.find(entry => 
    normalizeFirmName(entry.propfirmName) === normalizeFirmName(firm.name)
  )
  
  // Get spotlight data
  const spotlight = PROP_FIRM_MATCH_SPOTLIGHTS.find(entry => 
    normalizeFirmName(entry.name) === normalizeFirmName(firm.name)
  ) ?? null
  
  return {
    id: firm.id,
    slug: firm.slug,
    name: firm.name,
    description: firm.description ?? undefined,
    shortDesc: firm.shortDesc ?? undefined,
    referralUrl: firm.referralUrl ?? undefined,
    logoUrl: firm.logoUrl ?? undefined,
    category: (firm.category || 'Futures') as MarketType,
    platform: (firm.platform || 'Tradovate') as TradingPlatform,
    payoutModel: (firm.payoutModel || 'Monthly') as PayoutModel,
    drawdownType: (firm.drawdownType || 'Static') as DrawdownType,
    profitSplit: firm.profitSplit || '80/20',
    maxAllocation: firm.maxAllocation || '$100K',
    challengeCount: firm.challenges.length,
    spotlight: spotlight,
    catalogueStats: {
      accountsCount: catalogueEntry?.accountsCount ?? 0,
      totalAccountValue: catalogueEntry?.totalAccountValue ?? 0,
      paidPayoutAmount: catalogueEntry?.payouts.paidAmount ?? 0,
      paidPayoutCount: catalogueEntry?.payouts.paidCount ?? 0,
      pendingPayoutAmount: catalogueEntry?.payouts.pendingAmount ?? 0,
      sizeBreakdown: catalogueEntry?.sizeBreakdown ?? 'No live account data yet',
    },
    coupons: firm.coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent,
      challengeFee: c.challengeFee,
      expiresAt: c.expiresAt,
      claimUrl: c.claimUrl,
    })),
    _count: {
      reviews: firm._count.reviews,
      coupons: firm._count.coupons,
    },
  }
}

export const getFirmDeals = async (firmId: string): Promise<DealItem[]> => {
  const now = new Date()
  
  // First verify the firm exists and is active
  const firm = await prisma.propFirm.findUnique({
    where: { id: firmId, isActive: true },
  })
  
  if (!firm) return []
  
  // Get active coupons/deals for this firm
  const coupons = await prisma.firmCoupon.findMany({
    where: {
      propfirmId: firmId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    include: {
      propfirm: {
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
    firmId: coupon.propfirm.id,
    firmSlug: coupon.propfirm.slug,
    firmName: coupon.propfirm.name,
    logoUrl: coupon.propfirm.logoUrl ?? undefined,
    category: (coupon.propfirm.category || 'Futures') as MarketType,
    platform: (coupon.propfirm.platform || 'Tradovate') as TradingPlatform,
    payoutModel: (coupon.propfirm.payoutModel || 'Monthly') as PayoutModel,
    drawdownType: (coupon.propfirm.drawdownType || 'Static') as DrawdownType,
    discountPercent: coupon.discountPercent,
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

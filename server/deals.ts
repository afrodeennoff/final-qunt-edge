import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

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
  claimUrl: string
}

export interface UnifiedFirm {
  id: string
  slug: string
  name: string
  logoUrl?: string
  category: MarketType
  platform: TradingPlatform
  payoutModel: PayoutModel
  drawdownType: DrawdownType
  profitSplit: string
  maxAllocation: string
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
    claimUrl: coupon.claimUrl || `https://example.com/${coupon.propfirm.slug}`,
  }))
}

export const getActiveDeals = unstable_cache(
  _getActiveDeals,
  ['deals-active'],
  { revalidate: 3600, tags: ['deals'] }
)

const _getUnifiedFirms = async (): Promise<UnifiedFirm[]> => {
  const firms = await prisma.propFirm.findMany({
    where: { isActive: true },
    include: {
      coupons: {
        where: { isActive: true },
        orderBy: { discountPercent: 'desc' },
      },
      _count: { select: { reviews: true, coupons: true } },
    },
    orderBy: { name: 'asc' },
  })

  return firms.map((firm) => ({
    id: firm.id,
    slug: firm.slug,
    name: firm.name,
    logoUrl: firm.logoUrl ?? undefined,
    category: (firm.category || 'Futures') as MarketType,
    platform: (firm.platform || 'Tradovate') as TradingPlatform,
    payoutModel: (firm.payoutModel || 'Monthly') as PayoutModel,
    drawdownType: (firm.drawdownType || 'Static') as DrawdownType,
    profitSplit: firm.profitSplit || '80/20',
    maxAllocation: firm.maxAllocation || '$100K',
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

export type PropFirmMatchCategory = 'Futures' | 'CFD'

export interface PropFirmMatchSpotlight {
  slug: string
  name: string
  category: PropFirmMatchCategory
  rating: number
  reviewCount: number
  promoText: string
  promoCode?: string
  maxAllocation?: string
  countryCode?: string
  founded?: string
  yearsInOperation?: number
  sourceUrl: string
}

export const PROP_FIRM_MATCH_SOURCE_DATE = '2026-03-21'

export const PROP_FIRM_MATCH_SPOTLIGHTS: PropFirmMatchSpotlight[] = [
  {
    slug: 'top-one-futures',
    name: 'Top One Futures',
    category: 'Futures',
    rating: 4.7,
    reviewCount: 63,
    promoText: '60% off with MATCH',
    promoCode: 'MATCH',
    maxAllocation: '$2.6M',
    sourceUrl: 'https://propfirmmatch.com/futures/',
  },
  {
    slug: 'tradeify',
    name: 'Tradeify',
    category: 'Futures',
    rating: 4.8,
    reviewCount: 149,
    promoText: '30% off all accounts',
    promoCode: 'MATCH',
    sourceUrl: 'https://propfirmmatch.com/futures/prop-firm-lists/payout-methods',
  },
  {
    slug: 'my-funded-futures',
    name: 'My Funded Futures',
    category: 'Futures',
    rating: 4.6,
    reviewCount: 207,
    promoText: '50% off all Pro accounts for new users',
    promoCode: 'MATCH',
    sourceUrl: 'https://propfirmmatch.com/futures/prop-firm-lists/payout-methods',
  },
  {
    slug: 'apex-trader-funding',
    name: 'Apex Trader Funding',
    category: 'Futures',
    rating: 3.8,
    reviewCount: 94,
    promoText: '85% off the first month on all evaluations',
    promoCode: 'MATCH',
    sourceUrl: 'https://propfirmmatch.com/futures/prop-firm-lists/payout-methods',
  },
  {
    slug: 'ftmo',
    name: 'FTMO',
    category: 'CFD',
    rating: 4.6,
    reviewCount: 183,
    promoText: 'EUR 101 off',
    maxAllocation: '$1M',
    promoCode: 'MATCH',
    countryCode: 'CZ',
    founded: 'Jan 2015',
    yearsInOperation: 11,
    sourceUrl: 'https://propfirmmatch.com/prop-firms/ftmo/reviews',
  },
  {
    slug: 'the5ers',
    name: 'The5ers',
    category: 'CFD',
    rating: 4.8,
    reviewCount: 1099,
    promoText: '5% off plus free account credits on qualifying plans',
    promoCode: 'MATCH',
    countryCode: 'GB',
    founded: 'Jan 2016',
    yearsInOperation: 10,
    sourceUrl: 'https://propfirmmatch.com/prop-firms/the-5-ers/offers',
  },
  {
    slug: 'fundednext',
    name: 'FundedNext',
    category: 'CFD',
    rating: 4.4,
    reviewCount: 703,
    promoText: '7% off all accounts for new users',
    promoCode: 'MATCH',
    countryCode: 'AE',
    founded: 'Mar 2022',
    yearsInOperation: 3,
    sourceUrl: 'https://propfirmmatch.com/prop-firms/fundednext/offers',
  },
  {
    slug: 'funding-pips',
    name: 'FundingPips',
    category: 'CFD',
    rating: 4.3,
    reviewCount: 942,
    promoText: '20% off current offer',
    promoCode: 'MATCH',
    countryCode: 'AE',
    founded: 'Nov 2022',
    yearsInOperation: 3,
    sourceUrl: 'https://propfirmmatch.com/prop-firms/funding-pips/reviews',
  },
]

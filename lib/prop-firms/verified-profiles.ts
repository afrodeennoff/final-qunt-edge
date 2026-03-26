import { normalizeFirmName } from './normalize'

export type FirmMarketCategory = 'Futures' | 'Forex' | 'Crypto'
export type FirmPlatform = 'Tradovate' | 'Rithmic' | 'MetaTrader 5' | 'cTrader' | 'DXtrade'
export type FirmPayoutModel = 'Bi-weekly' | 'Weekly' | 'On-demand' | 'Monthly'
export type FirmDrawdownType = 'Trailing' | 'Static' | 'End-of-day'

export interface VerifiedPropFirmProfile {
  slug: string
  name: string
  aliases?: string[]
  category: FirmMarketCategory
  platform: FirmPlatform
  payoutModel: FirmPayoutModel
  drawdownType: FirmDrawdownType
  profitSplit: string
  maxAllocation: string
  shortDesc: string
  referralUrl: string
  lastVerifiedOn: string
  confidence: 'high' | 'medium' | 'low'
  sources: string[]
}

export const VERIFIED_PROPFIRM_PROFILES: VerifiedPropFirmProfile[] = [
  {
    slug: 'earn2trade',
    name: 'Earn2Trade',
    category: 'Futures',
    platform: 'Rithmic',
    payoutModel: 'Weekly',
    drawdownType: 'End-of-day',
    profitSplit: '80/20',
    maxAllocation: '$400K',
    shortDesc: 'Futures evaluation with end-of-day drawdown and a growth path up to $400K.',
    referralUrl: 'https://www.earn2trade.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://www.earn2trade.com/trader-career-path',
      'https://help.earn2trade.com/en/articles/5372687-how-does-end-of-day-drawdown-work',
      'https://help.earn2trade.com/en/articles/8966763-earn2trade-scraps-upfront-setup-fees-pay-later-from-your-profits',
    ],
  },
  {
    slug: 'apex-trader-funding',
    name: 'Apex Trader Funding',
    aliases: ['Apex'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'Weekly',
    drawdownType: 'Trailing',
    profitSplit: 'Up to 100%',
    maxAllocation: 'Up to $300K per account',
    shortDesc: 'Futures prop firm with trailing drawdown models and up to weekly payout eligibility.',
    referralUrl: 'https://apextraderfunding.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://support.apextraderfunding.com/hc/en-us/articles/47205823183003-EOD-Payouts',
      'https://support.apextraderfunding.com/hc/en-us/articles/40507212951451-PA-Payout-Parameters',
      'https://support.apextraderfunding.com/hc/en-us/articles/4404866580123-On-What-Platforms-Can-I-Use-Your-Service',
    ],
  },
  {
    slug: 'topstep',
    name: 'TopStep',
    aliases: ['Topstep'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: '90/10',
    maxAllocation: 'Up to $750K across 5 Express accounts',
    shortDesc: 'Futures evaluation path with daily payout eligibility once funded milestones are met.',
    referralUrl: 'https://www.topstep.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://help.topstep.com/en/articles/8284233-topstep-payout-policy',
      'https://help.topstep.com/en/articles/8284218-multiple-express-funded-accounts',
      'https://www.topstep.com/no-activation-fee/',
    ],
  },
  {
    slug: 'my-funded-futures',
    name: 'My Funded Futures',
    aliases: ['MFFU'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: 'Up to 90/10',
    maxAllocation: '$150K per account',
    shortDesc: 'Futures-focused prop firm offering rapid payout plans and no activation fees.',
    referralUrl: 'https://myfundedfutures.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://myfundedfutures.com/',
      'https://help.myfundedfutures.com/en/articles/11819568-changes-at-myfunded-futures',
      'https://help.myfundedfutures.com/en/articles/12398151-does-myfunded-futures-charge-activation-fee',
    ],
  },
  {
    slug: 'bulenox',
    name: 'Bulenox',
    category: 'Futures',
    platform: 'Rithmic',
    payoutModel: 'Weekly',
    drawdownType: 'End-of-day',
    profitSplit: 'First $10K at 100%, then up to 90%',
    maxAllocation: '$250K account tier',
    shortDesc: 'Futures funding program with Rithmic-based execution and weekly payout processing.',
    referralUrl: 'https://bulenox.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://bulenox.com/index.php/',
      'https://bulenox.com/help/funded-account/',
      'https://bulenox.com/index.php/help/frequently-asked-questions/',
    ],
  },
  {
    slug: 'phidias-propfirm',
    name: 'Phidias Propfirm',
    aliases: ['Phidias'],
    category: 'Futures',
    platform: 'Rithmic',
    payoutModel: 'On-demand',
    drawdownType: 'Static',
    profitSplit: '80/20',
    maxAllocation: 'Up to 5 x $25K validation accounts',
    shortDesc: 'Futures prop firm positioning around daily payout access and fixed 80/20 split.',
    referralUrl: 'https://phidiaspropfirm.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'medium',
    sources: [
      'https://phidiaspropfirm.com/education/daily-payout-prop-firm',
      'https://phidiaspropfirm.com/Contract-CASH-Phidias-Propfirm-Eng_2025.pdf',
    ],
  },
  {
    slug: 'take-profit-trader',
    name: 'Take Profit Trader',
    aliases: ['TPT'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: '80/20 (PRO), 90/10 (PRO+)',
    maxAllocation: 'Up to $750K across 5 PRO accounts',
    shortDesc: 'Futures prop firm with day-one daily withdrawal model and PRO/PRO+ structure.',
    referralUrl: 'https://takeprofittrader.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://try.takeprofittrader.com/futures-traders-tab1-0725',
      'https://takeprofittrader.com/userinfo/',
      'https://takeprofittrader.com/es',
    ],
  },
  {
    slug: 'tradeify',
    name: 'Tradeify',
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: '90/10 (funded), 80/20 on Elite over starting balance',
    maxAllocation: '$150K account size',
    shortDesc: 'Futures prop firm with daily payout plans and tiered scaling in funded accounts.',
    referralUrl: 'https://tradeify.co',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://help.tradeify.co/en/articles/12853966-select-flex-and-select-daily-payout-policies',
      'https://help.tradeify.co/en/articles/10468250-profit-splits',
      'https://tradeify.co/funded-trader-agreement',
    ],
  },
  {
    slug: 'lucid-trading',
    name: 'Lucid Trading',
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: '90/10',
    maxAllocation: '$150K account size',
    shortDesc: 'Futures prop firm with daily payout eligibility and multi-platform support.',
    referralUrl: 'https://lucidtrading.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://support.lucidtrading.com/en/articles/12890092-lucidpro-payouts',
      'https://support.lucidtrading.com/en/articles/11404614-supported-platforms',
      'https://lucidtrading.com/wp-content/uploads/2025/04/LucidPro-Trader-Agreement.pdf',
    ],
  },
  {
    slug: 'ftmo',
    name: 'FTMO',
    category: 'Forex',
    platform: 'MetaTrader 5',
    payoutModel: 'Bi-weekly',
    drawdownType: 'Static',
    profitSplit: '80/20 to 90/10',
    maxAllocation: '$400K (up to $2M scaling)',
    shortDesc: 'Global forex/CFD prop firm with multi-platform support and scaling to $2M.',
    referralUrl: 'https://ftmo.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://ftmo.com/en/',
      'https://ftmo.com/en/reward-growth-and-scaling-plan/',
      'https://ftmo.com/en/ftmo-trading-platforms/',
    ],
  },
  {
    slug: 'the5ers',
    name: 'The5ers',
    aliases: ['The 5ers'],
    category: 'Forex',
    platform: 'MetaTrader 5',
    payoutModel: 'Bi-weekly',
    drawdownType: 'Static',
    profitSplit: 'Up to 100%',
    maxAllocation: 'Up to $4M',
    shortDesc: 'Forex prop firm offering growth programs with scaling up to $4M.',
    referralUrl: 'https://the5ers.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://the5ers.com/',
      'https://wp.the5ers.com/instant-funding',
      'https://help.the5ers.com/market-trading-hours/',
    ],
  },
  {
    slug: 'fundednext',
    name: 'FundedNext',
    category: 'Forex',
    platform: 'MetaTrader 5',
    payoutModel: 'Bi-weekly',
    drawdownType: 'Static',
    profitSplit: '80/20 to 90/10 (up to 95% with add-ons)',
    maxAllocation: 'Up to $4M scaling',
    shortDesc: 'Multi-market prop firm with tiered reward-share models and scaling pathways.',
    referralUrl: 'https://fundednext.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://fundednext.com/',
      'https://help.fundednext.com/en/articles/8020768-how-much-is-the-profit-split-in-fundednext',
      'https://help.fundednext.com/en/articles/13349186-the-fundednext-prestige-the-scaling-up-program/',
    ],
  },
  {
    slug: 'funding-pips',
    name: 'FundingPips',
    aliases: ['Funding Pips'],
    category: 'Forex',
    platform: 'MetaTrader 5',
    payoutModel: 'Weekly',
    drawdownType: 'Static',
    profitSplit: '80/20 to 100/0 (plan-based)',
    maxAllocation: '$100K+ account sizes (plan-based)',
    shortDesc: 'Forex-focused prop firm with reward-cycle options from weekly to monthly.',
    referralUrl: 'https://www.fundingpips.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'medium',
    sources: [
      'https://www.fundingpips.com/?gad_campaignid=21766626400&gad_source=1',
      'https://app.fundingpips.com/files/terms-and-conditions.pdf',
    ],
  },
  {
    slug: 'top-one-futures',
    name: 'Top One Futures',
    aliases: ['TopOne Futures'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand',
    drawdownType: 'End-of-day',
    profitSplit: '90/10 (sim funded), 80/20 live',
    maxAllocation: 'Up to $1.5M simulated funds',
    shortDesc: 'Futures prop firm with EOD drawdown models and daily payout pathways.',
    referralUrl: 'https://www.toponefutures.com',
    lastVerifiedOn: '2026-03-27',
    confidence: 'high',
    sources: [
      'https://www.toponefutures.com/home',
      'https://help.toponefutures.com/en/articles/13904665-elite-daily-overview',
      'https://help.toponefutures.com/en/articles/11003130-path-to-trading-live',
    ],
  },
]

const profileLookup = new Map<string, VerifiedPropFirmProfile>()

for (const profile of VERIFIED_PROPFIRM_PROFILES) {
  profileLookup.set(normalizeFirmName(profile.name), profile)
  for (const alias of profile.aliases ?? []) {
    profileLookup.set(normalizeFirmName(alias), profile)
  }
}

export function getVerifiedPropFirmProfileByName(name: string): VerifiedPropFirmProfile | undefined {
  return profileLookup.get(normalizeFirmName(name))
}

export function getVerifiedPropFirmProfileBySlug(slug: string): VerifiedPropFirmProfile | undefined {
  const normalizedSlug = normalizeFirmName(slug)
  return VERIFIED_PROPFIRM_PROFILES.find((profile) => normalizeFirmName(profile.slug) === normalizedSlug)
}

export function getVerifiedPropFirmSeedRows() {
  return VERIFIED_PROPFIRM_PROFILES.map((profile) => ({
    slug: profile.slug,
    name: profile.name,
    category: profile.category,
    platform: profile.platform,
    shortDesc: profile.shortDesc,
    payoutModel: profile.payoutModel,
    drawdownType: profile.drawdownType,
    profitSplit: profile.profitSplit,
    maxAllocation: profile.maxAllocation,
    referralUrl: profile.referralUrl,
  }))
}

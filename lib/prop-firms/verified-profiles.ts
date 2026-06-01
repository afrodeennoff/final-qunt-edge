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
    platform: 'Tradovate, Rithmic',
    payoutModel: '5 Trading Days',
    drawdownType: 'Trailing (Intraday or End-of-Day options)',
    profitSplit: '100% of first $25,000 per account, then 90/10',
    maxAllocation: 'Up to $150,000 per account, up to 20 simultaneous accounts',
    shortDesc: 'Premier futures prop firm offering flexible evaluation accounts with Intraday or EOD trailing drawdown, 1-day minimum to pass, 5-trading-day payout eligibility, 100% profit share on the first $25,000 per account (then 90/10), no consistency rule in evaluation, and scaling up to $150K per account with support for up to 20 active Performance Accounts.',
    referralUrl: 'https://apextraderfunding.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://apextraderfunding.com/',
      'https://support.apextraderfunding.com/hc/en-us/articles/47205823183003-EOD-Payouts',
      'https://support.apextraderfunding.com/hc/en-us/articles/40507212951451-PA-Payout-Parameters',
      'https://support.apextraderfunding.com/hc/en-us/articles/4404866580123-On-What-Platforms-Can-I-Use-Your-Service',
      'https://apextraderfunding.com/help-center/intraday-trailing-drawdown-accounts/intraday-trailing-drawdown-payouts/',
      'https://propfirmapp.com/prop-firms/apex-trader-funding',
      'https://phidiaspropfirm.com/education/apex-trader-funding-4-0-explained',
      'https://damnpropfirms.com/prop-firm-rules/',
    ],
  },
  {
    slug: 'topstep',
    name: 'TopStep',
    aliases: ['Topstep'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand (as fast as 3 days for Express Funded)',
    drawdownType: 'End-of-day',
    profitSplit: '90/10 (100% on first $10K lifetime for pre-2026 joiners)',
    maxAllocation: 'Up to $150K Live Funded starting balance (scaling higher)',
    shortDesc: 'Futures prop firm with Express Funded Accounts, fast 3-day payouts, 90/10 split, and path to Live Funded Account with up to $150K+ starting balance and daily payouts.',
    referralUrl: 'https://www.topstep.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://www.topstep.com/',
      'https://help.topstep.com/en/articles/8284233-topstep-payout-policy',
      'https://help.topstep.com/en/articles/8284218-multiple-express-funded-accounts',
      'https://www.topstep.com/our-program',
      'https://damnpropfirms.com/futures-prop-firms/topstep/',
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
    profitSplit: 'First $10K at 100%, then 90/10',
    maxAllocation: 'Up to $250K account tier (with balance caps)',
    shortDesc: 'Futures prop firm with Rithmic execution, weekly payouts, 10-day trading requirement for payouts, and transition to Funded Account with real capital after 3 successful payouts.',
    referralUrl: 'https://bulenox.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://bulenox.com/',
      'https://bulenox.com/help/master-account/',
      'https://bulenox.com/help/funded-account/',
      'https://bulenox.com/help/qualification-account/',
      'https://www.quantvps.com/blog/bulenox-payout-rules',
    ],
  },
  {
    slug: 'phidias-propfirm',
    name: 'Phidias Propfirm',
    aliases: ['Phidias'],
    category: 'Futures',
    platform: 'Rithmic',
    payoutModel: 'Daily (on-demand after eligibility)',
    drawdownType: 'Static',
    profitSplit: '80/20',
    maxAllocation: 'Up to 5 x $25K validation accounts (scaling available)',
    shortDesc: 'Futures prop firm with daily payout access, fixed 80/20 split, and validation accounts up to $25K with path to funded trading.',
    referralUrl: 'https://phidiaspropfirm.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://phidiaspropfirm.com/',
      'https://phidiaspropfirm.com/education/daily-payout-prop-firm',
      'https://phidiaspropfirm.com/Contract-CASH-Phidias-Propfirm-Eng_2025.pdf',
      'https://phidiaspropfirm.com/education/apex-trader-funding-4-0-explained',
    ],
  },
  {
    slug: 'take-profit-trader',
    name: 'Take Profit Trader',
    aliases: ['TPT', 'TakeProfitTrader'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand (same-day possible)',
    drawdownType: 'End-of-day (trailing in Test)',
    profitSplit: '80/20 (PRO), 90/10 (PRO+)',
    maxAllocation: 'Up to $150K+ per account, unlimited accounts',
    shortDesc: 'Futures prop firm with Test/PRO/PRO+ structure, same-day payouts, 80-90% profit split, and no scaling rules in funded accounts.',
    referralUrl: 'https://takeprofittrader.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://takeprofittrader.com/',
      'https://propfirmapp.com/prop-firms/take-profit-trader',
      'https://damnpropfirms.com/futures-prop-firms/take-profit-trader/',
      'https://www.quantvps.com/blog/takeprofit-trader-payout-rules',
    ],
  },
  {
    slug: 'tradeify',
    name: 'Tradeify',
    aliases: ['Tradeify'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand (Select Daily or Flex policies)',
    drawdownType: 'End-of-day (Intraday options in some)',
    profitSplit: '90/10 on Sim Funded',
    maxAllocation: 'Up to $150K per account, up to 5 total',
    shortDesc: 'Futures prop firm with Select (daily or 5-day) and Growth evaluation paths, 90/10 profit split, daily or flex payout policies, and up to 5 simultaneous funded accounts.',
    referralUrl: 'https://tradeify.co',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://tradeify.co/',
      'https://help.tradeify.co/en/articles/12853966-select-flex-and-select-daily-payout-policies',
      'https://help.tradeify.co/en/articles/10468250-profit-splits',
      'https://tradeify.co/funded-trader-agreement',
      'https://tradeify.co/post/prop-firms-fastest-payouts-2026',
    ],
  },
  {
    slug: 'lucid-trading',
    name: 'Lucid Trading',
    aliases: ['Lucid'],
    category: 'Futures',
    platform: 'Tradovate',
    payoutModel: 'On-demand (daily for Flex, after buffer for Pro)',
    drawdownType: 'End-of-day',
    profitSplit: '90/10 (100% first $10K in some plans)',
    maxAllocation: 'Up to $150K per account, multiple accounts supported',
    shortDesc: 'Futures prop firm with LucidFlex (daily payouts) and LucidPro plans, 90/10 split, and transition to LucidLive real-money trading.',
    referralUrl: 'https://lucidtrading.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://lucidtrading.com/',
      'https://support.lucidtrading.com/en/articles/12890092-lucidpro-payouts',
      'https://support.lucidtrading.com/en/articles/11404614-supported-platforms',
      'https://phidiaspropfirm.com/education/lucid-trading-explained',
      'https://damnpropfirms.com/futures-prop-firms/lucid-trading/',
    ],
  },
  {
    slug: 'ftmo',
    name: 'FTMO',
    aliases: ['FTMO'],
    category: 'Forex',
    platform: 'MetaTrader 4, MetaTrader 5, cTrader',
    payoutModel: 'Bi-weekly (or on-demand after eligibility)',
    drawdownType: 'Static (tick-by-tick trailing in some programs)',
    profitSplit: '80% starting, scales to 90% via Scaling Plan',
    maxAllocation: 'Up to $200K per account, scaling up to $2M+ combined',
    shortDesc: 'Established forex/CFD prop firm with 2-step Challenge + Verification evaluation, 80-90% profit split, scaling plan to $2M, and bi-weekly payouts with fee refund on first payout.',
    referralUrl: 'https://ftmo.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://ftmo.com/en/',
      'https://ftmo.com/en/how-it-works/',
      'https://ftmo.com/en/reward-growth-and-scaling-plan/',
      'https://ftmo.com/en/ftmo-trading-platforms/',
      'https://velotrade.com/blog/ftmo-review',
      'https://www.luxalgo.com/blog/ftmo-prop-firm-review-how-to-pass-in-2025/',
    ],
  },
  {
    slug: 'the5ers',
    name: 'The5ers',
    aliases: ['The 5ers'],
    category: 'Forex',
    platform: 'MetaTrader 5, cTrader, DXtrade',
    payoutModel: 'Bi-weekly (after 14 days minimum for funded)',
    drawdownType: 'Static',
    profitSplit: 'Up to 100% (plan-dependent, 80/20 base in some)',
    maxAllocation: 'Up to $4M through scaling',
    shortDesc: 'Forex prop firm with multiple programs (High Stakes, Hyper Growth, Bootcamp), unlimited time in some, scaling to $4M, and bi-weekly payouts with fee refund options.',
    referralUrl: 'https://the5ers.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://the5ers.com/',
      'https://the5ers.com/terms-and-conditions/',
      'https://help.the5ers.com/payout-policy-and-hub-credit-in-the-high-stakes-program/',
      'https://propfirmapp.com/prop-firms/the5ers',
    ],
  },
  {
    slug: 'fundednext',
    name: 'FundedNext',
    aliases: ['Funded Next'],
    category: 'Forex',
    platform: 'MetaTrader 5, cTrader, DXtrade',
    payoutModel: 'Bi-weekly (24-hour processing guarantee)',
    drawdownType: 'Static',
    profitSplit: '80/20 to 95% (plan and performance dependent)',
    maxAllocation: 'Up to $300K per account (scaling to $4M in some programs)',
    shortDesc: 'Multi-asset prop firm with Stellar, Instant, and Futures challenges, up to 95% profit split, 24-hour payout processing, and scaling up to $4M.',
    referralUrl: 'https://fundednext.com',
    lastVerifiedOn: '2026-06-01',
    confidence: 'high',
    sources: [
      'https://fundednext.com/',
      'https://help.fundednext.com/en/articles/8020768-how-much-is-the-profit-split-in-fundednext',
      'https://help.fundednext.com/en/articles/13349186-the-fundednext-prestige-the-scaling-up-program/',
      'https://damnpropfirms.com/futures-prop-firms/fundednext/',
      'https://fundednext.com/blog/fundednext-payout-report-feb-2026',
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

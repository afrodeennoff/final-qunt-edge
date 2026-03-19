import { prisma } from '@/lib/prisma'

const FIRMS = [
  { slug: 'funding-pips', name: 'FundingPips', category: 'Forex', platform: 'MetaTrader 5', shortDesc: 'Fast-growing forex prop firm with flexible evaluation.', payoutModel: 'Weekly', drawdownType: 'Static', profitSplit: '90/10', maxAllocation: '$200K', referralUrl: 'https://fundingpips.com' },
  { slug: 'the5ers', name: 'The5ers', category: 'Forex', platform: 'cTrader', shortDesc: 'Growth-focused forex prop firm with instant funding options.', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', profitSplit: '80/20', maxAllocation: '$500K', referralUrl: 'https://the5ers.com' },
  { slug: 'fundednext', name: 'FundedNext', category: 'Forex', platform: 'MetaTrader 5', shortDesc: 'Popular forex prop firm with multiple challenge types.', payoutModel: 'Weekly', drawdownType: 'Static', profitSplit: '90/10', maxAllocation: '$200K', referralUrl: 'https://fundednext.com' },
  { slug: 'topstep', name: 'Topstep', category: 'Futures', platform: 'Tradovate', shortDesc: 'Premier futures evaluation with Trading Combine.', payoutModel: 'Weekly', drawdownType: 'End-of-day', profitSplit: '90/10', maxAllocation: '$300K', referralUrl: 'https://topstep.com' },
  { slug: 'apex-trader-funding', name: 'Apex Trader Funding', category: 'Futures', platform: 'Tradovate', shortDesc: 'High-payout futures prop firm with bi-weekly evaluations.', payoutModel: 'Bi-weekly', drawdownType: 'Trailing', profitSplit: '90/10', maxAllocation: '$300K', referralUrl: 'https://apextraderfunding.com' },
  { slug: 'my-funded-futures', name: 'My Funded Futures', category: 'Futures', platform: 'Rithmic', shortDesc: 'On-demand payouts with flexible evaluation rules.', payoutModel: 'On-demand', drawdownType: 'Trailing', profitSplit: '90/10', maxAllocation: '$600K', referralUrl: 'https://myfundedfutures.com' },
  { slug: 'take-profit-trader', name: 'Take Profit Trader', category: 'Futures', platform: 'Rithmic', shortDesc: 'Weekly payouts with static drawdown for futures traders.', payoutModel: 'Weekly', drawdownType: 'Static', profitSplit: '80/20', maxAllocation: '$250K', referralUrl: 'https://takeprofittrader.com' },
  { slug: 'tradeify', name: 'Tradeify', category: 'Futures', platform: 'Tradovate', shortDesc: 'Modern futures prop firm with instant funding.', payoutModel: 'Weekly', drawdownType: 'Static', profitSplit: '85/15', maxAllocation: '$500K', referralUrl: 'https://tradeify.co' },
  { slug: 'lucid-trading', name: 'Lucid Trading', category: 'Futures', platform: 'Tradovate', shortDesc: 'Flexible futures evaluation with competitive pricing.', payoutModel: 'Monthly', drawdownType: 'End-of-day', profitSplit: '85/15', maxAllocation: '$400K', referralUrl: 'https://lucidtrading.com' },
  { slug: 'ftmo', name: 'FTMO', category: 'Forex', platform: 'MetaTrader 5', shortDesc: 'Industry-leading forex prop firm with FTMO Challenge.', payoutModel: 'Monthly', drawdownType: 'Static', profitSplit: '90/10', maxAllocation: '$400K', referralUrl: 'https://ftmo.com' },
]

async function main() {
  console.log('Seeding prop firms...')
  for (const firm of FIRMS) {
    await prisma.propFirm.upsert({
      where: { slug: firm.slug },
      update: firm,
      create: firm,
    })
    console.log(`  ✓ ${firm.name}`)
  }
  console.log(`Done. Seeded ${FIRMS.length} firms.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())

import { propFirms } from '@/app/[locale]/dashboard/components/accounts/config'
import { safeArrayMax, safeArrayMin } from '@/lib/array-utils'

export type ConfigFirm = (typeof propFirms)[string]
export type ConfigFirmEntry = [string, ConfigFirm]

export interface FilterState {
  platform: string
  challengeType: string
  drawdown: string
}

export interface FirmSummary {
  slug: string
  name: string
  challengeType: string
  drawdownType: string
  payoutSpeed: number
  maxAllocation: number
  priceFrom: number
  priceTo: number
  accountCount: number
  profitSplit: number
  maxFundedAccounts: number
}

export const platformMap: Record<string, string[]> = {
  All: [],
  Tradovate: ['earn2trade', 'apex', 'topstep', 'myFundedFutures'],
  Rithmic: ['bulenox', 'phidias', 'takeProfitTrader', 'tradeify', 'lucidTrading'],
  'MetaTrader 5': ['bulenox', 'phidias'],
  cTrader: ['bulenox'],
  DXtrade: ['topstep', 'myFundedFutures'],
}

export const platformOptions = Object.keys(platformMap)
export const challengeTypeOptions = ['All', 'One-phase', 'Two-phase', 'Instant']
export const drawdownOptions = ['All', 'Static', 'Trailing', 'EOD']

export function getChallengeType(firm: ConfigFirm): string {
  const sizes = Object.values(firm.accountSizes)
  const hasInstant = sizes.some((size) => !size.evaluation)
  if (hasInstant) return 'Instant'

  const hasSinglePhase = sizes.some(
    (size) => size.evaluation && typeof size.minDays === 'number' && size.minDays <= 10
  )
  return hasSinglePhase ? 'One-phase' : 'Two-phase'
}

export function getDrawdownType(firm: ConfigFirm): string {
  const trailingTypes = Object.values(firm.accountSizes)
    .map((size) => size.trailing)
    .filter(Boolean)

  if (trailingTypes.some((type) => type === 'Static')) return 'Static'
  if (trailingTypes.some((type) => type === 'EOD')) return 'EOD'
  if (trailingTypes.some((type) => type === 'Intraday')) return 'Trailing'
  return 'N/A'
}

export function summarizeFirm(slug: string, firm: ConfigFirm): FirmSummary {
  const sizes = Object.values(firm.accountSizes)
  const priceValues = sizes.map((size) => size.priceWithPromo || size.price)
  const payoutDays = sizes
    .map((size) => size.minTradingDaysForPayout)
    .filter((value) => Number.isFinite(value) && value > 0)

  return {
    slug,
    name: firm.name,
    challengeType: getChallengeType(firm),
    drawdownType: getDrawdownType(firm),
    payoutSpeed: payoutDays.length > 0 ? safeArrayMin(payoutDays) : 0,
    maxAllocation: safeArrayMax(sizes.map((size) => size.balance)),
    priceFrom: safeArrayMin(priceValues),
    priceTo: safeArrayMax(priceValues),
    accountCount: sizes.length,
    profitSplit: safeArrayMax(sizes.map((size) => size.profitSharing)),
    maxFundedAccounts: safeArrayMax(sizes.map((size) => size.maxFundedAccounts)),
  }
}

export function matchesPlatform(slug: string, platform: string): boolean {
  if (platform === 'All') return true
  return platformMap[platform]?.includes(slug) ?? false
}

export function matchesChallengeType(firm: ConfigFirm, challengeType: string): boolean {
  if (challengeType === 'All') return true
  return getChallengeType(firm) === challengeType
}

export function matchesDrawdown(firm: ConfigFirm, drawdown: string): boolean {
  if (drawdown === 'All') return true
  return getDrawdownType(firm) === drawdown
}

export function matchesSearch(name: string, query: string): boolean {
  if (!query) return true
  return name.toLowerCase().includes(query.toLowerCase())
}

export function filterFirmEntries(
  entries: ConfigFirmEntry[],
  searchQuery: string,
  filters: FilterState
): ConfigFirmEntry[] {
  return entries.filter(([slug, firm]) => {
    if (!matchesSearch(firm.name, searchQuery)) return false
    if (!matchesPlatform(slug, filters.platform)) return false
    if (!matchesChallengeType(firm, filters.challengeType)) return false
    if (!matchesDrawdown(firm, filters.drawdown)) return false
    return true
  })
}

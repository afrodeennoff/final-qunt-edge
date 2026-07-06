import { propFirms, type AccountSize } from './prop-firms-config'

export interface FirmPresetResult {
  firmName: string
  firmKey: string
  sizeKey: string
  sizeName: string
  balance: number
  price: number
  priceWithPromo: number
  profitTarget: number
  maxDrawdown: number
  dailyLossLimit: number | null
  drawdownType: 'static' | 'trailing_eod' | 'trailing_intraday'
  consistencyPct: number | null
  minDays: number | null
  evaluation: boolean
  profitSharing: number
  ratios: { targetToDrawdown: number; riskEfficiency: number }
}

function mapDrawdownType(
  trailing: AccountSize['trailing'],
): FirmPresetResult['drawdownType'] {
  if (!trailing || trailing === 'DIRECTLY FUNDED') return 'static'
  switch (trailing) {
    case 'EOD':
      return 'trailing_eod'
    case 'Intraday':
      return 'trailing_intraday'
    case 'Static':
      return 'static'
    default:
      return 'static'
  }
}

function mapConsistency(
  consistency: AccountSize['consistency'],
): number | null {
  if (consistency === 'DIRECTLY FUNDED') return null
  return consistency ?? null
}

function mapMinDays(minDays: AccountSize['minDays']): number | null {
  if (minDays === 'DIRECTLY FUNDED') return null
  return minDays ?? null
}

export function getFirmPreset(
  firmKey: string,
  sizeKey: string,
): FirmPresetResult | null {
  const firm = propFirms[firmKey]
  if (!firm) return null
  const size = firm.accountSizes[sizeKey]
  if (!size) return null

  const drawdownType = mapDrawdownType(size.trailing)
  const maxDrawdown = size.drawdown
  const dailyLossLimit = size.dailyLoss ?? null

  return {
    firmName: firm.name,
    firmKey,
    sizeKey,
    sizeName: size.name,
    balance: size.balance,
    price: size.price,
    priceWithPromo: size.priceWithPromo,
    profitTarget: size.target,
    maxDrawdown,
    dailyLossLimit,
    drawdownType,
    consistencyPct: mapConsistency(size.consistency),
    minDays: mapMinDays(size.minDays),
    evaluation: size.evaluation,
    profitSharing: size.profitSharing,
    ratios: {
      targetToDrawdown:
        maxDrawdown === 0 ? 0 : size.target / maxDrawdown,
      riskEfficiency:
        size.target /
        (maxDrawdown + (dailyLossLimit ?? maxDrawdown)),
    },
  }
}

export function listFirmSizes(
  firmKey: string,
): { key: string; name: string; balance: number; price: number }[] {
  const firm = propFirms[firmKey]
  if (!firm) return []
  return Object.entries(firm.accountSizes)
    .map(([key, size]) => ({
      key,
      name: size.name,
      balance: size.balance,
      price: size.price,
    }))
    .sort((a, b) => a.balance - b.balance)
}

export function listPopularFirms(): {
  key: string
  name: string
  sizeCount: number
}[] {
  return Object.entries(propFirms)
    .map(([key, firm]) => ({
      key,
      name: firm.name,
      sizeCount: Object.keys(firm.accountSizes).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getFirmByKey(
  firmKey: string,
): { name: string; key: string } | null {
  const firm = propFirms[firmKey]
  if (!firm) return null
  return { name: firm.name, key: firmKey }
}

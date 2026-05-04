/**
 * Trading-specific number formatters for Qunt Edge
 * All formatters use macOS-native token colors via CSS variables
 */

/** Format currency P&L with sign: +$1,234.56 or -$1,234.56 */
export const formatCurrency = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
  }).format(n)

/** Format currency without sign */
export const formatCurrencyAbs = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(n))

/** Format percentage with sign: +12.4% or -8.3% */
export const formatPercent = (n: number, decimals = 1): string => {
  const fixed = n.toFixed(decimals)
  return n >= 0 ? `+${fixed}%` : `${fixed}%`
}

/** Format percentage without sign: 67.3% */
export const formatPercentAbs = (n: number, decimals = 1): string =>
  `${Math.abs(n).toFixed(decimals)}%`

/** Format R-multiple with sign: +2.4R or -0.8R */
export const formatRMultiple = (n: number): string => {
  const fixed = n.toFixed(1)
  return n >= 0 ? `+${fixed}R` : `${fixed}R`
}

/** Format volume/contracts with commas */
export const formatVolume = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n)

/** Return CSS variable color name for a numeric value */
export const colorForValue = (n: number): string =>
  n > 0 ? 'var(--success)' : n < 0 ? 'var(--destructive)' : 'var(--muted-foreground)'

/** Return Tailwind color class for a P&L value */
export const pnlColorClass = (n: number): string =>
  n > 0 ? 'text-[var(--success)]' : n < 0 ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'

/** Format a price with appropriate precision */
export const formatPrice = (n: number, decimals = 2): string =>
  n.toFixed(decimals)

/** Format win rate: 67.3% */
export const formatWinRate = (wins: number, total: number): string => {
  if (total === 0) return '0%'
  return `${((wins / total) * 100).toFixed(1)}%`
}

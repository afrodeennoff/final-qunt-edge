/**
 * Parses currency strings from NinjaTrader exports.
 * Handles formats like: $1,234.56, ($1,234.56), -$1,234.56, 1,234.56, (1,234.56)
 */
export function formatCurrencyValue(value: string): { pnl: number; error: string | null } {
  if (!value || value.trim() === '') {
    return { pnl: 0, error: 'Empty value' }
  }

  const cleaned = value.trim()

  // Parentheses indicate negative: ($1,234.56) or (1,234.56)
  const isParenNegative = cleaned.startsWith('(') && cleaned.endsWith(')')
  const stripped = cleaned.replace(/[()$]/g, '').replace(/\s/g, '')

  const parsed = parseFloat(stripped.replace(/,/g, ''))
  if (isNaN(parsed)) {
    return { pnl: 0, error: `Invalid currency value: "${value}"` }
  }

  const result = isParenNegative || stripped.startsWith('-') ? -Math.abs(parsed) : parsed
  return { pnl: result, error: null }
}

/**
 * Parses price strings from NinjaTrader exports.
 * Handles formats like: 5,123.25, 123.50, .5, 0.5
 */
export function formatPriceValue(value: string): { price: number; error: string | null } {
  if (!value || value.trim() === '') {
    return { price: 0, error: 'Empty value' }
  }

  const cleaned = value.trim().replace(/,/g, '')
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed)) {
    return { price: 0, error: `Invalid price value: "${value}"` }
  }

  return { price: parsed, error: null }
}

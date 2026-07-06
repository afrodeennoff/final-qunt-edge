/**
 * Utility functions to handle complex union types in translations
 * This prevents TypeScript "Expression produces a union type that is too complex to represent" errors
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslateFunction = (...args: any[]) => string

export function safeTranslate(t: TranslateFunction, key: string): string {
  return t(key)
}

export function translateWeekday(t: TranslateFunction, day: string): string {
  switch (day) {
    case 'calendar.weekdays.sun': return t('calendar.weekdays.sun')
    case 'calendar.weekdays.mon': return t('calendar.weekdays.mon')
    case 'calendar.weekdays.tue': return t('calendar.weekdays.tue')
    case 'calendar.weekdays.wed': return t('calendar.weekdays.wed')
    case 'calendar.weekdays.thu': return t('calendar.weekdays.thu')
    case 'calendar.weekdays.fri': return t('calendar.weekdays.fri')
    case 'calendar.weekdays.sat': return t('calendar.weekdays.sat')
    default: return day
  }
}

const FEE_TYPE_LABELS: Record<string, string> = {
  commission: 'import.tradovate.feeTypes.commission',
  exchangeFee: 'import.tradovate.feeTypes.exchangeFee',
  clearingFee: 'import.tradovate.feeTypes.clearingFee',
  nfaFee: 'import.tradovate.feeTypes.nfaFee',
  brokerageFee: 'import.tradovate.feeTypes.brokerageFee',
  orderRoutingFee: 'import.tradovate.feeTypes.orderRoutingFee',
}

export function translateTradovateFeeType(t: TranslateFunction, feeType: string): string {
  const key = FEE_TYPE_LABELS[feeType]
  if (!key) return feeType
  const translated = t(key)
  return translated === key ? feeType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()) : translated
}

export function translateWeekdayPnL(t: TranslateFunction, day: number): string {
  switch (day) {
    case 0: return t('weekdayPnl.days.sunday')
    case 1: return t('weekdayPnl.days.monday')
    case 2: return t('weekdayPnl.days.tuesday')
    case 3: return t('weekdayPnl.days.wednesday')
    case 4: return t('weekdayPnl.days.thursday')
    case 5: return t('weekdayPnl.days.friday')
    case 6: return t('weekdayPnl.days.saturday')
    default: return ''
  }
}

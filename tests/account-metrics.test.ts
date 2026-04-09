import { describe, expect, it } from 'vitest'
import { getAccountStartDate } from '@/lib/account-metrics'
import { Account } from '@/lib/data-types'

describe('getAccountStartDate', () => {
  it('returns earliest trade entry date', () => {
    const account = {
      trades: [
        { entryDate: new Date('2024-01-05') },
        { entryDate: new Date('2024-01-01') },
        { entryDate: new Date('2024-01-03') },
      ]
    } as unknown as Account
    const result = getAccountStartDate(account)
    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toContain('2024-01-01')
  })

  it('returns earliest daily metric date if no trades', () => {
    const account = {
      trades: [],
      dailyMetrics: [
        { date: new Date('2024-02-05') },
        { date: new Date('2024-02-01') },
      ]
    } as unknown as Account
    const result = getAccountStartDate(account)
    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toContain('2024-02-01')
  })

  it('returns earliest trade date even if daily metrics exist (priority to trades as per logic)', () => {
      // The logic: if (tradeDates.length > 0) return tradeDates[0]
      // So trades take precedence.
    const account = {
      trades: [
        { entryDate: new Date('2024-01-10') },
      ],
      dailyMetrics: [
        { date: new Date('2024-01-01') },
      ]
    } as unknown as Account
    const result = getAccountStartDate(account)
    expect(result?.toISOString()).toContain('2024-01-10')
  })

  it('returns null if no trades and no daily metrics', () => {
    const account = {
      trades: [],
      dailyMetrics: []
    } as unknown as Account
    const result = getAccountStartDate(account)
    expect(result).toBeNull()
  })

  it('returns null if trades and daily metrics are undefined', () => {
    const account = {} as unknown as Account
    const result = getAccountStartDate(account)
    expect(result).toBeNull()
  })

  it('ignores invalid dates in trades', () => {
    const account = {
      trades: [
        { entryDate: 'invalid' },
        { entryDate: new Date('2024-03-01') },
      ]
    } as unknown as Account
    const result = getAccountStartDate(account)
    expect(result?.toISOString()).toContain('2024-03-01')
  })
})

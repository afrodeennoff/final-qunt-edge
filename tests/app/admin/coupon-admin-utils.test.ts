import { describe, expect, it } from 'vitest'
import { formatAdminDateTimeInput } from '@/app/[locale]/admin/components/coupon-admin-utils'

describe('formatAdminDateTimeInput', () => {
  it('renders datetime-local values in local wall time instead of UTC', () => {
    const value = new Date('2026-04-18T00:00:00.000Z')

    expect(formatAdminDateTimeInput(value)).toBe('2026-04-18T05:30')
  })
})

import { describe, expect, it } from 'vitest'
import { getPropFirmAdminPageState } from '@/lib/prop-firms/admin-state'

describe('getPropFirmAdminPageState', () => {
  it('locks all writes when the database connection is unavailable', () => {
    expect(
      getPropFirmAdminPageState({
        hasConfiguredDatabaseConnection: false,
        firmId: null,
      }),
    ).toEqual({
      isFallbackRecord: false,
      isReadOnly: true,
      canManageFirm: false,
      canManageReviews: false,
      canManageCoupons: false,
    })
  })

  it('locks fallback firm records even when they render inside the admin detail page', () => {
    expect(
      getPropFirmAdminPageState({
        hasConfiguredDatabaseConnection: true,
        firmId: 'fallback-topstep',
      }),
    ).toEqual({
      isFallbackRecord: true,
      isReadOnly: true,
      canManageFirm: false,
      canManageReviews: false,
      canManageCoupons: false,
    })
  })
})

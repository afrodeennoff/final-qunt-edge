import { beforeEach, describe, expect, it, vi } from 'vitest'

const findManyCoupons = vi.fn()

vi.mock('@/lib/prisma', () => ({
  hasConfiguredDatabaseConnection: true,
  prisma: {
    propFirmCoupon: {
      findMany: findManyCoupons,
    },
  },
}))

vi.mock('@/app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue', () => ({
  getPropfirmCatalogueData: vi.fn(),
}))

vi.mock('@/lib/prisma-guard', () => ({
  isPrismaOperationCoolingDown: vi.fn(() => false),
  isPrismaSchemaMismatchError: vi.fn(() => false),
  isPrismaTableAvailable: vi.fn(async () => true),
  markPrismaTableUnavailable: vi.fn(),
  markPrismaOperationSchemaMismatch: vi.fn(),
}))

describe('getActiveDeals', () => {
  beforeEach(() => {
    findManyCoupons.mockReset()
    findManyCoupons.mockResolvedValue([
      {
        id: 'coupon_123',
        code: 'SAVE20',
        discountPercent: 20,
        challengeFee: 99,
        expiresAt: null,
        claimUrl: 'https://example.com/deal',
        platform: null,
        payoutModel: null,
        drawdownType: null,
        propFirm: {
          id: 'firm_123',
          slug: 'firm-slug',
          name: 'Firm Name',
          logoUrl: null,
          category: 'Futures',
          platform: 'Tradovate',
          payoutModel: 'Monthly',
          drawdownType: 'Static',
        },
      },
    ])
  })

  it('applies the coupon start window before exposing public deals', async () => {
    const { getActiveDeals } = await import('@/server/deals')

    await getActiveDeals()

    expect(findManyCoupons).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          propFirm: { isActive: true },
          AND: expect.arrayContaining([
            {
              OR: [{ startsAt: null }, { startsAt: { lte: expect.any(Date) } }],
            },
            {
              OR: [{ expiresAt: null }, { expiresAt: { gte: expect.any(Date) } }],
            },
          ]),
        }),
      }),
    )
  })
})

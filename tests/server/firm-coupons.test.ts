import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  hasConfiguredDatabaseConnection: true,
  prisma: {
    propFirmCoupon: {
      findMany,
    },
  },
}))

describe('listFirmCoupons', () => {
  beforeEach(() => {
    findMany.mockReset()
    findMany.mockResolvedValue([])
  })

  it('hides coupons whose startsAt is in the future', async () => {
    const { listFirmCoupons } = await import('@/server/firm-coupons')

    await listFirmCoupons('firm_123')

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          propFirmId: 'firm_123',
          isActive: true,
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

import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMany = vi.fn()
const findUnique = vi.fn()

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  hasConfiguredDatabaseConnection: true,
  prisma: {
    propFirm: {
      findMany,
      findUnique,
    },
  },
}))

vi.mock('@/app/[locale]/dashboard/components/accounts/config', () => ({
  propFirms: {},
}))

vi.mock('@/lib/prop-firms/verified-profiles', () => ({
  getVerifiedPropFirmProfileByName: vi.fn(() => null),
}))

vi.mock('@/lib/prisma-guard', () => ({
  isPrismaOperationCoolingDown: vi.fn(() => false),
  isPrismaSchemaMismatchError: vi.fn(() => false),
  isPrismaTableAvailable: vi.fn(async () => true),
  markPrismaTableUnavailable: vi.fn(),
  markPrismaOperationSchemaMismatch: vi.fn(),
  withPrismaSchemaMismatchFallback: vi.fn(async (_key: string, run: () => Promise<unknown>) =>
    run(),
  ),
}))

describe('prop firm public coupon visibility', () => {
  beforeEach(() => {
    findMany.mockReset()
    findUnique.mockReset()
    findMany.mockResolvedValue([])
    findUnique.mockResolvedValue(null)
  })

  it('applies the coupon start window to banner items', async () => {
    const { listPropFirmBannerItems } = await import('@/server/prop-firms')

    await listPropFirmBannerItems()

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          coupons: expect.objectContaining({
            where: expect.objectContaining({
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
        }),
      }),
    )
  })

  it('applies the coupon start window to firm detail coupons', async () => {
    const { getPropFirmBySlug } = await import('@/server/prop-firms')

    await getPropFirmBySlug('firm-slug')

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          coupons: expect.objectContaining({
            where: expect.objectContaining({
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
        }),
      }),
    )
  })
})

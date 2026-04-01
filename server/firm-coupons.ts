'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'
import { cacheLife, cacheTag } from 'next/cache'

const COUPONS_CACHE_LIFETIME = { stale: 1_800, revalidate: 1_800, expire: 3_600 } as const

function loadFirmCoupons(propfirmId: string) {
  if (!hasConfiguredDatabaseConnection) {
    return []
  }

  const now = new Date()

  return prisma.propFirmCoupon.findMany({
    where: {
      propFirmId: propfirmId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: now } },
      ],
    },
    orderBy: [
      { challengeFee: 'asc' },
      { discountPercent: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

async function listFirmCouponsCached(propfirmId: string) {
  'use cache'
  cacheLife(COUPONS_CACHE_LIFETIME)
  cacheTag('firm-coupons', `prop-firm-${propfirmId}`)
  return loadFirmCoupons(propfirmId)
}

export async function listFirmCoupons(propfirmId: string) {
  return listFirmCouponsCached(propfirmId)
}

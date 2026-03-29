'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'

export async function listFirmCoupons(propfirmId: string) {
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

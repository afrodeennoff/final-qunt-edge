'use server'
import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'

export async function listFirmCoupons(propfirmId: string) {
  if (!hasConfiguredDatabaseConnection) {
    return []
  }

  return prisma.propFirmCoupon.findMany({
    where: { propFirmId: propfirmId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

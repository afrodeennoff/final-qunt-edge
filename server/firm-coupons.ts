'use server'
import { prisma } from '@/lib/prisma'

export async function listFirmCoupons(propfirmId: string) {
  return prisma.propFirmCoupon.findMany({
    where: { propFirmId: propfirmId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

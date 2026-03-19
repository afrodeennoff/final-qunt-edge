'use server'
import { prisma } from '@/lib/prisma'

export async function listFirmCoupons(propfirmId: string) {
  return prisma.firmCoupon.findMany({
    where: { propfirmId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

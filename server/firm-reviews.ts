'use server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'

export async function createFirmReview(data: { propfirmId: string; rating: number; title?: string; body?: string }) {
  const userId = await getDatabaseUserId()
  return prisma.propFirmReview.create({
    data: {
      propFirmId: data.propfirmId,
      rating: data.rating,
      title: data.title,
      content: data.body,
      userId,
    },
  })
}

export async function listFirmReviews(propfirmId: string, page = 1) {
  const take = 10
  return prisma.propFirmReview.findMany({
    where: { propFirmId: propfirmId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * take,
    take,
  })
}

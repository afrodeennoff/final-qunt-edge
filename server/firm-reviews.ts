'use server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'

export async function createFirmReview(data: { propfirmId: string; rating: number; title?: string; body?: string; avatarUrl?: string }) {
  const userId = await getDatabaseUserId()
  return prisma.firmReview.create({
    data: {
      propfirmId: data.propfirmId,
      rating: data.rating,
      title: data.title,
      body: data.body,
      avatarUrl: data.avatarUrl,
      userId,
      username: userId,
    },
  })
}

export async function listFirmReviews(propfirmId: string, page = 1) {
  const take = 10
  return prisma.firmReview.findMany({
    where: { propfirmId },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * take,
    take,
  })
}

'use server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest'

export interface ListFirmReviewsParams {
  propfirmId: string
  page?: number
  sort?: ReviewSortOption
  status?: 'approved' | 'pending' | 'rejected' | 'flagged'
}

export interface ReviewWithUser {
  id: string
  propFirmId: string
  userId: string | null
  rating: number
  title: string | null
  content: string | null
  isVerified: boolean
  helpfulVotes: number
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface ListFirmReviewsResult {
  items: ReviewWithUser[]
  total: number
  page: number
  totalPages: number
}

const REVIEWS_PAGE_SIZE = 10

function getReviewOrderBy(sort: ReviewSortOption) {
  if (sort === 'oldest') {
    return [{ createdAt: 'asc' as const }]
  }

  if (sort === 'highest') {
    return [{ rating: 'desc' as const }, { createdAt: 'desc' as const }]
  }

  if (sort === 'lowest') {
    return [{ rating: 'asc' as const }, { createdAt: 'desc' as const }]
  }

  return [{ createdAt: 'desc' as const }]
}

export async function createFirmReview(data: { propfirmId: string; rating: number; title?: string; body?: string }) {
  const userId = await getDatabaseUserId()
  
  // Check if user already reviewed this firm
  const existingReview = await prisma.propFirmReview.findFirst({
    where: {
      propFirmId: data.propfirmId,
      userId,
    },
  })
  
  if (existingReview) {
    throw new Error('You have already reviewed this firm')
  }
  
  return prisma.propFirmReview.create({
    data: {
      propFirmId: data.propfirmId,
      rating: data.rating,
      title: data.title,
      content: data.body,
      userId,
      isVerified: true, // Auto-verify users who are logged in
      status: 'approved', // Auto-approve for now, could be 'pending' for moderation
    },
  })
}

export async function listFirmReviews(
  propfirmId: string,
  page = 1,
  sort: ReviewSortOption = 'newest'
): Promise<ListFirmReviewsResult> {
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const skip = (normalizedPage - 1) * REVIEWS_PAGE_SIZE
  const where = {
    propFirmId: propfirmId,
    status: 'approved' as const,
  }

  const [items, total] = await Promise.all([
    prisma.propFirmReview.findMany({
      where,
      orderBy: getReviewOrderBy(sort),
      skip,
      take: REVIEWS_PAGE_SIZE,
    }),
    prisma.propFirmReview.count({ where }),
  ])

  return {
    items: items as ReviewWithUser[],
    total,
    page: normalizedPage,
    totalPages: Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE)),
  }
}

export async function getFirmReviewStats(propfirmId: string) {
  const reviews = await prisma.propFirmReview.findMany({
    where: { 
      propFirmId: propfirmId,
      status: 'approved',
    },
    select: { rating: true },
  })
  
  if (reviews.length === 0) {
    return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0
  
  for (const review of reviews) {
    sum += review.rating
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating as keyof typeof distribution]++
    }
  }
  
  return {
    average: sum / reviews.length,
    total: reviews.length,
    distribution,
  }
}

export async function flagReview(data: { reviewId: string; reason: string; description?: string }) {
  const userId = await getDatabaseUserId()
  
  // Get the review to find the propFirmId
  const review = await prisma.propFirmReview.findUnique({
    where: { id: data.reviewId },
  })
  
  if (!review) {
    throw new Error('Review not found')
  }
  
  // Check if user already flagged this review
  const existingFlag = await prisma.reviewModeration.findFirst({
    where: {
      reviewId: data.reviewId,
      reporterId: userId,
    },
  })
  
  if (existingFlag) {
    throw new Error('You have already reported this review')
  }
  
  // Create the moderation report
  await prisma.reviewModeration.create({
    data: {
      reviewId: data.reviewId,
      reporterId: userId,
      reason: data.reason,
      description: data.description,
      status: 'pending',
    },
  })
  
  // Update the review status to flagged
  await prisma.propFirmReview.update({
    where: { id: data.reviewId },
    data: {
      status: 'flagged',
      flaggedAt: new Date(),
    },
  })
}

export async function getReviewModerationQueue(page = 1, status?: string) {
  const take = 20
  const skip = (page - 1) * take
  
  const where = status && status !== 'all' 
    ? { status }
    : {}
  
  const [items, total] = await Promise.all([
    prisma.reviewModeration.findMany({
      where,
      include: {
        review: {
          include: {
            propFirm: {
              select: { name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.reviewModeration.count({ where }),
  ])
  
  return { items, total, page, totalPages: Math.ceil(total / take) }
}

export async function moderateReview(data: { 
  moderationId: string
  action: 'upheld' | 'dismissed' | 'warning_issued'
  notes?: string
}) {
  const adminUserId = await getDatabaseUserId()
  
  // Get the moderation record
  const moderation = await prisma.reviewModeration.findUnique({
    where: { id: data.moderationId },
    include: { review: true },
  })
  
  if (!moderation) {
    throw new Error('Moderation record not found')
  }
  
  // Update moderation record
  await prisma.reviewModeration.update({
    where: { id: data.moderationId },
    data: {
      status: 'resolved',
      reviewedAt: new Date(),
      reviewerId: adminUserId,
      resolution: data.action,
    },
  })
  
  // Update the review based on action
  if (data.action === 'upheld') {
    // Remove the review (soft delete - mark as rejected)
    await prisma.propFirmReview.update({
      where: { id: moderation.reviewId },
      data: { status: 'rejected' },
    })
  } else if (data.action === 'dismissed') {
    // Restore the review to approved
    await prisma.propFirmReview.update({
      where: { id: moderation.reviewId },
      data: { 
        status: 'approved',
        flaggedAt: null,
      },
    })
  }
  // If 'warning_issued', keep the review flagged but mark as reviewed
  
  return { success: true }
}

export async function getFlaggedReviewCount() {
  return prisma.reviewModeration.count({
    where: { status: 'pending' },
  })
}

export async function getReviewById(reviewId: string) {
  return prisma.propFirmReview.findUnique({
    where: { id: reviewId },
    include: {
      propFirm: {
        select: { name: true, slug: true },
      },
    },
  })
}

export async function deleteReview(reviewId: string) {
  const userId = await getDatabaseUserId()
  
  const review = await prisma.propFirmReview.findUnique({
    where: { id: reviewId },
  })
  
  if (!review) {
    throw new Error('Review not found')
  }
  
  // Only allow users to delete their own reviews
  if (review.userId !== userId) {
    throw new Error('You can only delete your own reviews')
  }
  
  return prisma.propFirmReview.delete({
    where: { id: reviewId },
  })
}

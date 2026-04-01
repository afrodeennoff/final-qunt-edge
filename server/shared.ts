'use server'

import { TickDetails } from '@/prisma/generated/prisma'
import { Prisma } from '@/prisma/generated/prisma'
import { normalizeTradesForClient, Trade, type TradeInput } from '@/lib/data-types'
import { cacheLife, cacheTag, updateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { GroupWithAccounts } from './groups'
import { createSecureSlug } from '@/lib/security/slug'
import { isSharedAccessible } from '@/lib/security/shared-access'
import { getDatabaseUserId } from './auth'

export interface SharedParams {
  userId: string
  title?: string
  description?: string
  isPublic: boolean
  accountNumbers: string[]
  dateRange: {
    from: Date
    to?: Date
  }
  desktop?: unknown[]
  mobile?: unknown[]
  expiresAt?: Date
  viewCount?: number
  createdAt?: Date
  tickDetails?: TickDetails[]
}

type SharedCreateParams = Omit<SharedParams, 'userId'>

interface DateRange {
  from: string;
  to?: string;
}

const SHARED_VIEW_CACHE_LIFETIME = {
  stale: 900,
  revalidate: 900,
  expire: 3_600,
} as const

const SHARED_VIEW_CACHE_TAG = (slug: string) => `shared-view-${slug}` as const

export async function createShared(data: SharedCreateParams): Promise<string> {
  try {
    const userId = await getDatabaseUserId()

    // Validate date range
    if (!data.dateRange?.from) {
      throw new Error('Start date is required')
    }


    // Generate a unique slug
    let slug = createSecureSlug(12)
    let attempts = 0
    const maxAttempts = 5

    // Keep trying to find a unique slug
    while (attempts < maxAttempts) {
      try {
        await prisma.shared.create({
          data: {
            userId,
            title: data.title,
            description: data.description,
            isPublic: data.isPublic,
            accountNumbers: data.accountNumbers,
            dateRange: {
              from: data.dateRange.from.toISOString(),
              ...(data.dateRange.to && { to: data.dateRange.to.toISOString() })
            },
            desktop: (data.desktop || []) as Prisma.InputJsonValue,
            mobile: (data.mobile || []) as Prisma.InputJsonValue,
            expiresAt: data.expiresAt,
            slug,
          },
        })

        updateTag(`shared-view-${slug}`)
        return slug
      } catch (error) {
        if ((error as { code?: string })?.code === 'P2002') {
          // P2002 is Prisma's error code for unique constraint violation
          slug = createSecureSlug(12)
          attempts++
          continue
        }
        throw error
      }
    }

    throw new Error('Failed to generate unique slug after multiple attempts')
  } catch (error) {
    console.error('Error creating shared trades:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to share trades: ${error.message}`)
    }
    throw new Error('An unexpected error occurred while sharing trades')
  }
}

export async function getShared(slug: string): Promise<{ params: SharedParams, trades: Trade[], groups: GroupWithAccounts[] } | null> {
  if (!slug) return null

  try {
    const result = await getSharedCached(slug)

    if (!result) return null
    if (!isSharedAccessible({ isPublic: result.params.isPublic, expiresAt: result.params.expiresAt ?? null })) return null

    // View count is intentionally fire-and-forget — it's non-sensitive public metadata.
    // The slug must exist and isSharedAccessible() must pass first, so no auth needed.
    // Background update of view count to not block response
    prisma.shared.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    }).catch(err => console.error('[getShared] Failed to update view count:', err))

    return {
      ...result,
      trades: normalizeTradesForClient(result.trades)
    }
  } catch (error) {
    console.error('[getShared] Error:', error)
    return null
  }
}

async function getSharedCached(slug: string): Promise<{ params: SharedParams, trades: TradeInput[], groups: GroupWithAccounts[] } | null> {
  'use cache'
  cacheLife(SHARED_VIEW_CACHE_LIFETIME)
  cacheTag(SHARED_VIEW_CACHE_TAG(slug))

  const shared = await prisma.shared.findFirst({
    where: {
      slug,
      isPublic: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (!isSharedAccessible(shared)) return null
  if (!shared) return null

  // Parse the date range
  const dateRange = shared.dateRange as unknown as DateRange
  if (!dateRange?.from) {
    throw new Error('Invalid date range: from date is required')
  }
  const fromDate = new Date(dateRange.from)
  const toDate = dateRange.to ? new Date(dateRange.to) : undefined

  // Parallel fetch of trades, tick details, and groups
  const [trades, tickDetails, groups] = await Promise.all([
    prisma.trade.findMany({
      where: {
        userId: shared.userId,
        ...(shared.accountNumbers.length > 0 && {
          accountNumber: {
            in: shared.accountNumbers,
          },
        }),
        entryDate: {
          gte: fromDate.toISOString(),
          ...(toDate && { lte: toDate.toISOString() })
        }
      },
      orderBy: {
        entryDate: 'desc',
      },
      select: {
        id: true,
        accountNumber: true,
        instrument: true,
        side: true,
        quantity: true,
        entryPrice: true,
        closePrice: true,
        pnl: true,
        commission: true,
        entryDate: true,
        closeDate: true,
        entryId: true,
        closeId: true,
        timeInPosition: true,
        comment: true,
        tags: true,
        groupId: true,
        imageBase64: true,
        imageBase64Second: true,
        images: true,
        userId: true,
        videoUrl: true,
        createdAt: true,
      }
    }),
    prisma.tickDetails.findMany(),
    prisma.group.findMany({
      where: {
        userId: shared.userId,
      },
      include: {
        accounts: true,
      },
    })
  ])

  return {
    params: {
      userId: shared.userId,
      title: shared.title || undefined,
      description: shared.description || undefined,
      isPublic: shared.isPublic,
      accountNumbers: shared.accountNumbers,
      dateRange: {
        from: fromDate,
        ...(toDate && { to: toDate })
      },
      desktop: shared.desktop as unknown[],
      mobile: shared.mobile as unknown[],
      expiresAt: shared.expiresAt || undefined,
      tickDetails,
    },
    trades,
    groups: groups as GroupWithAccounts[],
  }
}

export async function getUserShared() {
  try {
    const userId = await getDatabaseUserId()
    const sharedTrades = await prisma.shared.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return sharedTrades
  } catch (error) {
    console.error('Error getting user shared trades:', error)
    throw error
  }
}

export async function deleteShared(slug: string) {
  try {
    const userId = await getDatabaseUserId()
    const shared = await prisma.shared.findUnique({
      where: { slug },
    })

    if (!shared || shared.userId !== userId) {
      throw new Error('Unauthorized')
    }

    await prisma.shared.delete({
      where: { slug },
    })

    updateTag(`shared-view-${slug}`)
  } catch (error) {
    console.error('Error deleting shared:', error)
    throw error
  }
}

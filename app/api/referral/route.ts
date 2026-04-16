import { withRateLimited } from '@/lib/api/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { connection } from 'next/server'
import { getDatabaseUserId } from '@/server/auth'
import {
  getOrCreateReferral,
  getReferralBySlug,
  addReferredUser,
  getReferralTier,
  getNextTier,
  ReferralAlreadyAppliedError,
} from '@/server/referral'
import { logger } from '@/lib/logger'
import { apiError } from '@/lib/api-response'
import { parseJson } from '../_utils/validate'
import { z } from 'zod'

const ApplyReferralSchema = z.object({
  slug: z.string().min(1, 'Referral slug is required'),
})

function isUnauthenticatedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === 'User not authenticated' ||
      error.message.includes('Missing Supabase environment variables'))
  )
}

function noStoreHeaders(): HeadersInit {
  return {
    'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  }
}

async function handleGet(request: NextRequest) {
  await connection()
  try {
    const userId = await getDatabaseUserId()

    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    // Get or create referral for the user
    const referral = await getOrCreateReferral(userId)
    const count = referral.redemptions.length
    const tier = await getReferralTier(count)
    const nextTier = await getNextTier(count)

    const referredUsers = referral.redemptions
      .map((redemption) => redemption.referredUser)
      .sort((a, b) => a.email.localeCompare(b.email))

    return NextResponse.json(
      {
        success: true,
        data: {
          referral: {
            id: referral.id,
            slug: referral.slug,
            count,
            tier,
            nextTier,
            referredUsers,
          },
        },
      },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }
    logger.error('[referral/GET] Error', { error })
    return apiError('INTERNAL_ERROR', 'Failed to fetch referral data', 500)
  }
}

async function handlePost(request: NextRequest) {
  await connection()
  try {
    const { slug } = await parseJson(request, ApplyReferralSchema)

    const userId = await getDatabaseUserId()

    if (!userId) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    // Find referral by slug
    const referral = await getReferralBySlug(slug)

    if (!referral) {
      return apiError('NOT_FOUND', 'Invalid referral code', 404)
    }

    // Check if user is trying to use their own referral code
    if (referral.userId === userId) {
      return apiError('BAD_REQUEST', 'You cannot use your own referral code', 400)
    }

    await addReferredUser(referral.id, userId)

    return NextResponse.json(
      {
        success: true,
        message: 'Referral code applied successfully',
      },
      { headers: noStoreHeaders() }
    )
  } catch (error) {
    if (isUnauthenticatedError(error)) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401)
    }
    if (error instanceof ReferralAlreadyAppliedError) {
      return apiError('BAD_REQUEST', 'You have already been referred', 400)
    }
    logger.error('[referral/POST] Error', { error })
    return apiError('INTERNAL_ERROR', 'Failed to apply referral code', 500)
  }
}

export const GET = withRateLimited(handleGet, {
  rateLimitId: 'referral',
  rateLimitMax: 30,
  rateLimitWindow: 60_000,
  routeName: 'referral',
})

export const POST = withRateLimited(handlePost, {
  rateLimitId: 'referral',
  rateLimitMax: 30,
  rateLimitWindow: 60_000,
  routeName: 'referral',
})

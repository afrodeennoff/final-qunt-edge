import { NextRequest } from 'next/server'
import { Prisma } from '@/prisma/generated/prisma'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/api-response'
import { createRouteClient } from '@/lib/supabase/route-client'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeWithDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) {
        return nested.toNumber()
      }
      if (nested instanceof Date) {
        return nested.toISOString()
      }
      return nested
    }),
  ) as T
}

// Allowed fields for partial update
const UPDATE_FIELDS = [
  'preTradeNotes',
  'postTradeReview',
  'emotions',
  'confidenceRating',
  'disciplineScore',
  'customTags',
  'screenshots',
  'timeframe',
  'session',
  'pinned',
  'archived',
] as const

type UpdateField = (typeof UPDATE_FIELDS)[number]

// ---------------------------------------------------------------------------
// PUT /api/dashboard/journal/[id] — Update journal entry
// ---------------------------------------------------------------------------

async function handlePut(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, { requestId })
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true },
    })
    if (!dbUser) {
      return apiError('UNAUTHORIZED', 'User not found', 401, { requestId })
    }

    const { id } = await ctx.params

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: dbUser.id },
    })
    if (!existing) {
      return apiError('NOT_FOUND', 'Journal entry not found', 404, { requestId })
    }

    const body = await request.json()

    // Build update data with whitelisted fields only
    const data: Prisma.JournalEntryUpdateInput = {}
    for (const field of UPDATE_FIELDS) {
      if (field in body) {
        (data as Record<string, unknown>)[field] = body[field]
      }
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data,
    })

    return apiSuccess(serializeWithDecimals(updated))
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to update journal entry', 500, { requestId })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/dashboard/journal/[id] — Delete journal entry
// ---------------------------------------------------------------------------

async function handleDelete(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.id) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401, { requestId })
    }

    const dbUser = await prisma.user.findUnique({
      where: { auth_user_id: user.id },
      select: { id: true },
    })
    if (!dbUser) {
      return apiError('UNAUTHORIZED', 'User not found', 401, { requestId })
    }

    const { id } = await ctx.params

    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: dbUser.id },
    })
    if (!existing) {
      return apiError('NOT_FOUND', 'Journal entry not found', 404, { requestId })
    }

    await prisma.journalEntry.delete({
      where: { id },
    })

    return apiSuccess({ deleted: true })
  } catch (error) {
    return apiError('INTERNAL_ERROR', 'Failed to delete journal entry', 500, { requestId })
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const PUT = withRateLimited(handlePut, {
  rateLimitId: 'journal-update',
  rateLimitMax: 120,
  rateLimitWindow: 60_000,
  routeName: 'PUT /api/dashboard/journal/[id]',
})

export const DELETE = withRateLimited(handleDelete, {
  rateLimitId: 'journal-delete',
  rateLimitMax: 60,
  rateLimitWindow: 60_000,
  routeName: 'DELETE /api/dashboard/journal/[id]',
})

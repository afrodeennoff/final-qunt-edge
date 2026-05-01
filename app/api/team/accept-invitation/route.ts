import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createRouteClient } from '@/lib/supabase/route-client'
import { MemberRole } from '@/prisma/generated/prisma'
import { ensureTeamMembership, resolveTeamUserId } from '@/server/team-membership'
import { apiError } from '@/lib/api-response'
import { apiSuccess, withRateLimited } from '@/lib/api/with-api-route'

const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1),
})

async function handlePost(request: NextRequest, _ctx: { params: Promise<Record<string, string>> }) {
  const requestId = crypto.randomUUID()
  try {
    const supabase = createRouteClient(request)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.id) {
      return apiError('UNAUTHORIZED', 'Unauthorized', 401, { requestId })
    }

    const body = await request.json()
    const parsed = acceptInvitationSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('VALIDATION_FAILED', 'Invalid request body', 400, { requestId, issues: parsed.error.issues })
    }
    const { invitationId } = parsed.data

    // Find the invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: { team: { select: { id: true } } },
    })

    if (!invitation) {
      return apiError('NOT_FOUND', 'Invitation not found', 404, { requestId })
    }

    // Check if invitation is still valid
    if (invitation.status !== 'PENDING') {
      return apiError('BAD_REQUEST', 'Invitation has already been used or expired', 400, {
        requestId,
      })
    }

    if (invitation.expiresAt < new Date()) {
      return apiError('BAD_REQUEST', 'Invitation has expired', 400, { requestId })
    }

    // Check if the email matches the current user
    if (invitation.email !== user.email) {
      return apiError('FORBIDDEN', 'This invitation was sent to a different email address', 403, {
        requestId,
      })
    }

    const teamUserId = await resolveTeamUserId(user.id)

    await prisma.$transaction(async (tx) => {
      await ensureTeamMembership(tx, {
        teamId: invitation.teamId,
        userId: teamUserId,
        role: invitation.role ?? MemberRole.TRADER,
      })

      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
        },
      })
    })

    return apiSuccess({ success: true, teamId: invitation.teamId })
  } catch (error) {
    console.error('Error accepting team invitation:', error)
    return apiError('INTERNAL_ERROR', 'Internal server error', 500, { requestId })
  }
}

export const POST = withRateLimited(handlePost, {
  rateLimitId: 'team-accept-invitation',
  rateLimitMax: 20,
  rateLimitWindow: 60_000,
  routeName: 'team/accept-invitation',
})

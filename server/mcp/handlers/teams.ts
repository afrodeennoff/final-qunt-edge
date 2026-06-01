/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * For team operations: ALWAYS perform explicit membership checks (owner or ADMIN role in TeamMember)
 * before calling any team mutation. Full isolation - no cross-team or cross-user access.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import type { McpAuthContext } from '../../mcp-auth'
import { requireUserId } from '../security'
import { prisma } from '@/lib/prisma'
import { MemberRole } from '@/prisma/generated/prisma'
import {
  createTeam as serverCreateTeam,
  inviteMember as serverInviteMember,
  acceptInvitation as serverAcceptInvitation,
  removeMember as serverRemoveMember,
} from '@/server/teams'
import { requireParam } from '../../mcp-helpers'

async function assertTeamAdminMembership(teamId: string, userId: string): Promise<boolean> {
  // Check owner
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { userId: true },
  })
  if (team?.userId === userId) return true

  // Check active ADMIN member
  const adminMembership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
      role: MemberRole.ADMIN,
      isActive: true,
    },
    select: { id: true },
  })
  return !!adminMembership
}

export async function createTeamHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const name = requireParam(args, 'name')
  // ignore any userId in args - use only ctx
  const organizationId = typeof args.organizationId === 'string' ? args.organizationId : undefined

  const result = await serverCreateTeam(userId, name, organizationId)
  if (!result.success) {
    throw new Error(result.error || 'Failed to create team')
  }
  return { team: result.team }
}

export async function inviteTeamMemberHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const teamId = requireParam(args, 'teamId')
  const email = requireParam(args, 'email')
  const role = (typeof args.role === 'string' ? args.role : 'TRADER') as 'TRADER' | 'ANALYST' | 'VIEWER'

  // Strict membership check - only admins/owner can invite. Uses ctx.userId only.
  const canManage = await assertTeamAdminMembership(teamId, userId)
  if (!canManage) {
    throw new Error('Admin membership required to invite members')
  }

  const result = await serverInviteMember(teamId, email, userId, role)
  if (!result.success) {
    throw new Error(result.error || 'Failed to invite member')
  }
  return { invitation: result.invitation }
}

export async function acceptTeamInviteHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const invitationId = requireParam(args, 'invitationId')
  // wrapped fn does email match against ctx userId's email - isolation enforced

  const result = await serverAcceptInvitation(invitationId, userId)
  if (!result.success) {
    throw new Error(result.error || 'Failed to accept invitation')
  }
  return result
}

export async function removeTeamMemberHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const requesterId = requireUserId(ctx)
  const teamId = requireParam(args, 'teamId')
  const targetUserId = requireParam(args, 'userId') // the member to remove

  // Explicit admin membership check using ONLY ctx user (requester)
  const canManage = await assertTeamAdminMembership(teamId, requesterId)
  if (!canManage) {
    throw new Error('Admin membership required to remove members')
  }

  const result = await serverRemoveMember(teamId, targetUserId, requesterId)
  if (!result.success) {
    throw new Error(result.error || 'Failed to remove member')
  }
  return result
}

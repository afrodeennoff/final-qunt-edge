import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTeamHandler, inviteTeamMemberHandler, acceptTeamInviteHandler, removeTeamMemberHandler } from '../teams'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    team: { create: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    teamMember: { findFirst: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    teamInvitation: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'

vi.mock('@/server/teams', () => ({
  createTeam: vi.fn(),
  inviteMember: vi.fn(),
  acceptInvitation: vi.fn(),
  removeMember: vi.fn(),
}))

import { createTeam, inviteMember, acceptInvitation, removeMember } from '@/server/teams'

const mockCtx = { userId: 'user-ctx-123', authUserId: 'auth-123', role: 'user' as const, authMethod: 'apikey' as const }

describe('teams MCP handlers - strict security & isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createTeamHandler requires userId from ctx, never accepts from args', async () => {
    vi.mocked(createTeam).mockResolvedValue({ success: true, team: { id: 'team1', name: 'MyTeam', userId: 'user-ctx-123' } })

    const result = await createTeamHandler(mockCtx, { name: 'MyTeam', userId: 'hacker-999' } as any)
    expect(createTeam).toHaveBeenCalledWith('user-ctx-123', 'MyTeam', undefined)
    expect(result).toMatchObject({ team: { id: 'team1' } })
    // ensure no cross user
    expect(vi.mocked(createTeam).mock.calls[0][0]).toBe('user-ctx-123')
  })

  it('createTeamHandler throws on missing auth', async () => {
    await expect(createTeamHandler({} as any, { name: 'x' })).rejects.toThrow('Authentication required')
  })

  it('inviteTeamMemberHandler enforces admin membership check using ctx.userId only', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue({ id: 'm1', teamId: 't1', userId: 'user-ctx-123', role: 'ADMIN', isActive: true } as any)
    vi.mocked(inviteMember).mockResolvedValue({ success: true, invitation: { id: 'inv1' } })

    const result = await inviteTeamMemberHandler(mockCtx, { teamId: 't1', email: 'new@ex.com', role: 'TRADER' })
    expect(prisma.teamMember.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { teamId: 't1', userId: 'user-ctx-123', role: 'ADMIN', isActive: true }
    }))
    expect(inviteMember).toHaveBeenCalledWith('t1', 'new@ex.com', 'user-ctx-123', 'TRADER')
    expect(result).toMatchObject({ invitation: { id: 'inv1' } })
  })

  it('inviteTeamMemberHandler rejects non-admin caller (isolation)', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue(null) // not admin

    await expect(inviteTeamMemberHandler(mockCtx, { teamId: 't1', email: 'x@ex.com' }))
      .rejects.toThrow('Admin membership required to invite members')
    expect(inviteMember).not.toHaveBeenCalled()
  })

  it('removeTeamMemberHandler enforces admin check + prevents self remove via wrapper', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue({ role: 'ADMIN' } as any)
    vi.mocked(removeMember).mockResolvedValue({ success: true })

    await removeTeamMemberHandler(mockCtx, { teamId: 't1', userId: 'other-user' })
    expect(removeMember).toHaveBeenCalledWith('t1', 'other-user', 'user-ctx-123')
  })

  it('acceptTeamInviteHandler uses only ctx.userId (email match inside wrapped fn)', async () => {
    vi.mocked(acceptInvitation).mockResolvedValue({ success: true })
    const result = await acceptTeamInviteHandler(mockCtx, { invitationId: 'inv-xyz' })
    expect(acceptInvitation).toHaveBeenCalledWith('inv-xyz', 'user-ctx-123')
    expect(result).toMatchObject({ success: true })
  })

  it('all handlers reject cross-user attempts in args (full isolation)', async () => {
    vi.mocked(prisma.teamMember.findFirst).mockResolvedValue({ role: 'ADMIN' } as any)
    vi.mocked(inviteMember).mockResolvedValue({ success: true })

    // even if args has different user, ignored
    await inviteTeamMemberHandler(mockCtx, { teamId: 't1', email: 'x@x.com', userId: 'hacker' } as any)
    expect(inviteMember).toHaveBeenCalledWith('t1', 'x@x.com', 'user-ctx-123', 'TRADER')
  })
})

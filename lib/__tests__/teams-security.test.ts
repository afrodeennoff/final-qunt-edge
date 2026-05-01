import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    teamInvitation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    team: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    teamMember: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
    },
    teamAnalytics: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  updateTag: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/server/team-membership', () => ({
  ensureTeamMembership: vi.fn(),
  resolveTeamUserId: vi.fn(),
}))

import { inviteMember, acceptInvitation, getTeamAnalytics } from '@/server/teams'

describe('teams security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inviteMember', () => {
    it('blocks invite creation when caller is not authorized for the team', async () => {
      prismaMock.team.findUnique.mockResolvedValue(null)
      prismaMock.teamInvitation.findFirst.mockResolvedValue(null)
      prismaMock.teamInvitation.create.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'new@example.com',
        status: 'PENDING',
      })

      const result = await inviteMember('team_1', 'new@example.com', 'caller_1')

      expect(result.success).toBe(false)
      expect(prismaMock.teamInvitation.create).not.toHaveBeenCalled()
    })

    it('succeeds when caller is team admin', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team_1',
        userId: 'owner_1',
        members: [{ userId: 'admin_1', role: 'ADMIN', isActive: true }],
        managers: [],
      })
      prismaMock.teamInvitation.findFirst.mockResolvedValue(null)
      prismaMock.teamInvitation.create.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'new@example.com',
        status: 'PENDING',
      })

      const result = await inviteMember('team_1', 'new@example.com', 'admin_1')

      expect(result.success).toBe(true)
      expect(prismaMock.teamInvitation.create).toHaveBeenCalled()
    })

    it('succeeds when caller is team owner', async () => {
      prismaMock.team.findUnique.mockResolvedValue({
        id: 'team_1',
        userId: 'owner_1',
        members: [],
        managers: [],
      })
      prismaMock.teamInvitation.findFirst.mockResolvedValue(null)
      prismaMock.teamInvitation.create.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'new@example.com',
        status: 'PENDING',
      })

      const result = await inviteMember('team_1', 'new@example.com', 'owner_1')

      expect(result.success).toBe(true)
    })
  })

  describe('acceptInvitation', () => {
    it('blocks acceptance when the authenticated user email does not match the invitation', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'original@example.com',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60_000),
        role: 'TRADER',
      })

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_1',
        email: 'different@example.com',
      })

      prismaMock.$transaction.mockImplementation(async (fn: (tx: Record<string, unknown>) => Promise<void>) => {
        await fn({
          teamInvitation: {
            update: vi.fn().mockResolvedValue({}),
          },
          teamMember: {
            upsert: vi.fn().mockResolvedValue({}),
          },
        })
      })

      const result = await acceptInvitation('inv_1', 'user_1')

      expect(result.success).toBe(false)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('succeeds when user email matches invitation email', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'user@example.com',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60_000),
        role: 'TRADER',
      })

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_1',
        email: 'user@example.com',
      })

      prismaMock.$transaction.mockImplementation(async (fn: (tx: Record<string, unknown>) => Promise<void>) => {
        await fn({
          teamInvitation: {
            update: vi.fn().mockResolvedValue({}),
          },
          teamMember: {
            upsert: vi.fn().mockResolvedValue({}),
          },
        })
      })

      const result = await acceptInvitation('inv_1', 'user_1')

      expect(result.success).toBe(true)
      expect(prismaMock.$transaction).toHaveBeenCalled()
    })

    it('throws error when invitation is not found', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue(null)

      const result = await acceptInvitation('invalid_inv', 'user_1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invitation not found')
    })

    it('throws error when invitation is expired', async () => {
      prismaMock.teamInvitation.findUnique.mockResolvedValue({
        id: 'inv_1',
        teamId: 'team_1',
        email: 'user@example.com',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 60_000),
        role: 'TRADER',
      })

      const result = await acceptInvitation('inv_1', 'user_1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invitation expired')
    })
  })

  describe('getTeamAnalytics', () => {
    it('returns analytics data for valid team request', async () => {
      prismaMock.teamAnalytics.findFirst.mockResolvedValue({
        teamId: 'team_1',
        period: 'monthly',
        totalPnl: 1000,
        totalTrades: 50,
        winRate: 60,
        averageRr: 1.5,
      })

      const result = await getTeamAnalytics('team_1')

      expect(result).toBeDefined()
      expect(result.teamId).toBe('team_1')
      expect(result.totalPnl).toBe(1000)
    })

    it('creates default analytics when none exist', async () => {
      prismaMock.teamAnalytics.findFirst.mockResolvedValue(null)
      prismaMock.teamAnalytics.create.mockResolvedValue({
        teamId: 'team_1',
        period: 'monthly',
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
        averageRr: 0,
      })

      const result = await getTeamAnalytics('team_1')

      expect(result).toBeDefined()
      expect(result.totalPnl).toBe(0)
      expect(prismaMock.teamAnalytics.create).toHaveBeenCalled()
    })

    it('supports different period options', async () => {
      prismaMock.teamAnalytics.findFirst.mockResolvedValue({
        teamId: 'team_1',
        period: 'weekly',
        totalPnl: 500,
        totalTrades: 25,
        winRate: 55,
        averageRr: 1.2,
      })

      const result = await getTeamAnalytics('team_1', 'weekly')

      expect(result).toBeDefined()
      expect(result.teamId).toBe('team_1')
    })
  })
})

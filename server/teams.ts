import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'
import { MemberRole, Prisma } from '@/prisma/generated/prisma'
import { ensureTeamMembership } from '@/server/team-membership'
import { cacheLife, cacheTag, updateTag } from 'next/cache'

const TEAMS_CACHE_LIFETIME = { stale: 300, revalidate: 300, expire: 1_800 } as const

/** Invalidate teams cache for all affected user IDs after a mutation */
function invalidateTeamsCache(userIds: string[]): void {
  for (const uid of userIds) {
    updateTag(`teams-${uid}`)
  }
}

export async function createTeam(userId: string, name: string, organizationId?: string) {
  try {
    const team = await prisma.$transaction(async (tx) => {
      const createdTeam = await tx.team.create({
        data: {
          name,
          userId,
          organizationId,
          traderIds: [userId],
        }
      })

      await ensureTeamMembership(tx, {
        teamId: createdTeam.id,
        userId,
        role: MemberRole.ADMIN,
      })

      return createdTeam
    })

    invalidateTeamsCache([userId])
    return { success: true, team }
  } catch (error) {
    console.error('Error creating team:', error)
    return { success: false, error: 'Failed to create team' }
  }
}


async function _getTeamsByUser(userId: string) {
  const teams = await prisma.team.findMany({
    where: {
      userId,
    },
    include: {
      members: {
        include: {
          user: true,
        }
      },
      invitations: true,
      teamSubscription: true,
      analytics: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  })

  return teams
}

async function _getTeamsByUserCached(userId: string) {
  'use cache'
  cacheLife(TEAMS_CACHE_LIFETIME)
  cacheTag(`teams-${userId}`)
  return _getTeamsByUser(userId)
}

export async function getTeamsByUser(userId: string) {
  try {
    return _getTeamsByUserCached(userId)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return []
  }
}

export async function getTeamById(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: true,
          }
        },
        invitations: true,
        teamSubscription: true,
        analytics: {
          orderBy: {
            createdAt: 'desc',
          }
        },
      }
    })

    if (!team) {
      throw new Error('Team not found')
    }

    // Defensive post-query membership verification
    const isOwner = team.userId === userId
    const isMember = team.members.some(m => m.userId === userId)
    if (!isOwner && !isMember) {
      throw new Error('Team not found')
    }

    return team
  } catch (error) {
    console.error('Error fetching team:', error)
    throw error
  }
}

export async function updateTeam(teamId: string, userId: string, data: { name?: string }) {
  try {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId,
      }
    })

    if (!team) {
      throw new Error('Team not found or unauthorized')
    }

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data
    })

    invalidateTeamsCache([userId])
    return { success: true, team: updatedTeam }
  } catch (error) {
    console.error('Error updating team:', error)
    return { success: false, error: 'Failed to update team' }
  }
}

export async function deleteTeam(teamId: string, userId?: string) {
  try {
    const actorUserId = userId ?? await getDatabaseUserId()
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        userId: actorUserId,
      }
    })

    if (!team) {
      throw new Error('Team not found or unauthorized')
    }

    await prisma.team.delete({
      where: { id: teamId }
    })

    // Invalidate for all team members before the team is gone
    invalidateTeamsCache(team.traderIds || [actorUserId])
    return { success: true }
  } catch (error) {
    console.error('Error deleting team:', error)
    return { success: false, error: 'Failed to delete team' }
  }
}

export async function inviteMember(teamId: string, email: string, invitedBy: string, role: 'TRADER' | 'ANALYST' | 'VIEWER' = 'TRADER') {
  try {
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId,
        email,
        status: 'PENDING'
      }
    })

    if (existingInvitation) {
      throw new Error('Invitation already sent')
    }

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId,
        email: email.toLowerCase(),
        invitedBy,
        status: 'PENDING',
        role,
      }
    })

    invalidateTeamsCache([invitedBy])
    return { success: true, invitation }
  } catch (error) {
    console.error('Error inviting member:', error)
    return { success: false, error: 'Failed to send invitation' }
  }
}

export async function acceptInvitation(invitationId: string, userId: string) {
  try {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId }
    })

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired')
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation already processed')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    await prisma.$transaction(async (tx) => {
      await ensureTeamMembership(tx, {
        teamId: invitation.teamId,
        userId,
        role: invitation.role || MemberRole.TRADER,
      })

      await tx.teamInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' }
      })
    })

    // Invalidate for the accepting user and the team owner
    const team = await prisma.team.findUnique({ where: { id: invitation.teamId }, select: { userId: true, traderIds: true } })
    const affectedUsers = [userId, ...(team?.traderIds || [])]
    invalidateTeamsCache(affectedUsers)
    return { success: true }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to accept invitation' }
  }
}

export async function updateMemberRole(teamId: string, userId: string, requesterUserId: string, role: 'ADMIN' | 'TRADER' | 'ANALYST' | 'VIEWER') {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: { members: true }
    }) as unknown as Prisma.TeamGetPayload<{ include: { members: true } }>

    if (!team) {
      throw new Error('Team not found')
    }

    const requester = team.members.find(m => m.userId === requesterUserId)
    if (!requester || requester.role !== MemberRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can update roles')
    }

    const member = team.members.find(m => m.userId === userId)
    if (!member) {
      throw new Error('Member not found')
    }

    if (requester.userId === userId && member.role === MemberRole.ADMIN) {
      throw new Error('Cannot remove admin role from yourself')
    }

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { role }
    })

    invalidateTeamsCache([userId, requesterUserId])
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' }
  }
}

export async function removeMember(teamId: string, userId: string, requesterUserId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: { members: true }
    }) as unknown as Prisma.TeamGetPayload<{ include: { members: true } }>

    if (!team) {
      throw new Error('Team not found')
    }

    const requester = team.members.find(m => m.userId === requesterUserId)
    if (!requester || requester.role !== MemberRole.ADMIN) {
      throw new Error('Unauthorized: Only admins can remove members')
    }

    const member = team.members.find(m => m.userId === userId)
    if (!member) {
      throw new Error('Member not found')
    }

    if (requester.userId === userId) {
      throw new Error('Cannot remove yourself from team. Delete the team instead.')
    }

    await prisma.teamMember.delete({
      where: { id: member.id }
    })

    await prisma.team.update({
      where: { id: teamId },
      data: {
        traderIds: team.traderIds.filter(id => id !== userId)
      }
    })

    invalidateTeamsCache([userId, requesterUserId])
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

export async function getTeamAnalytics(teamId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
  try {
    const analytics = await prisma.teamAnalytics.findFirst({
      where: {
        teamId,
        period,
      }
    })

    if (analytics) {
      return analytics
    }

    const created = await prisma.teamAnalytics.create({
      data: {
        teamId,
        period,
        totalPnl: 0,
        totalTrades: 0,
        winRate: 0,
        averageRr: 0,
      }
    })

    return created
  } catch (error) {
    console.error('Error fetching team analytics:', error)
    throw error
  }
}

export async function updateTeamAnalytics(
  teamId: string,
  userId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
) {
  try {
    // Check authorization
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
        role: { in: [MemberRole.ADMIN, MemberRole.TRADER, MemberRole.ANALYST] }
      }
    });

    if (!teamMember) {
      throw new Error('Unauthorized');
    }

    // Get all team member user IDs
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { userId: true }
    });

    const userIds = teamMembers.map(m => m.userId);

    if (userIds.length === 0) {
      return { success: true, analytics: null };
    }

    const periodDays = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - periodDays);

    const [tradeStats, bestMemberResult] = await Promise.all([
      prisma.trade.aggregate({
        where: {
          userId: { in: userIds },
          entryDate: { gte: periodStart }
        },
        _sum: {
          pnl: true
        },
        _count: {
          id: true
        }
      }),
      prisma.trade.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, entryDate: { gte: periodStart } },
        _sum: {
          pnl: true
        },
        orderBy: {
          _sum: {
            pnl: 'desc'
          }
        },
        take: 1
      })
    ]);

    const totalPnl = Number(tradeStats._sum.pnl || 0);
    const totalTrades = tradeStats._count.id || 0;
    
    const rrTrades = await prisma.trade.findMany({
      where: { userId: { in: userIds }, pnl: { not: 0 }, entryDate: { gte: periodStart } },
      select: { pnl: true }
    });
    const wins = rrTrades.filter(t => Number(t.pnl) > 0);
    const losses = rrTrades.filter(t => Number(t.pnl) < 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length) : 0;
    const averageRr = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    // Get winning trades count
    const winningTradesResult = await prisma.trade.count({
      where: {
        userId: { in: userIds },
        pnl: { gt: 0 }
      }
    });

    const winRate = totalTrades > 0 ? (winningTradesResult / totalTrades) * 100 : 0;
    const bestMemberId = bestMemberResult[0]?.userId || null;
    const bestMemberPnl = Number(bestMemberResult[0]?._sum?.pnl || 0);

    // Upsert analytics
    const analytics = await prisma.teamAnalytics.upsert({
      where: {
        teamId_period: {
          teamId,
          period,
        }
      },
      create: {
        teamId,
        period,
        totalPnl,
        totalTrades,
        winRate,
        averageRr,
        bestMemberId,
        bestMemberPnl
      },
      update: {
        totalPnl,
        totalTrades,
        winRate,
        averageRr,
        bestMemberId,
        bestMemberPnl
      }
    })

    invalidateTeamsCache(userIds)
    return { success: true, analytics }
  } catch (error) {
    console.error('Error updating team analytics:', error)
    return { success: false, error: 'Failed to update analytics' }
  }
}

export async function getTeamOverviewData(teamId: string, userId: string) {
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              include: {
                accounts: {
                  include: {
                    trades: {
                      orderBy: {
                        createdAt: 'desc'
                      },
                      take: 5
                    }
                  }
                }
              }
            }
          }
        },
        analytics: {
          where: { period: 'monthly' },
          take: 1
        }
      }
    })

    if (!team) throw new Error('Team not found')

    // Find if user is a member
    const isMember = team.members.some(m => m.userId === userId)
    if (!isMember) throw new Error('Unauthorized')

    let totalBalance = 0
    let activeTraders = 0
    let recentActivity: Array<{ id: string; type: string; description: string; amount: number; date: Date; userEmail: string }> = []

    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    team.members.forEach(member => {
      let memberHasRecentActivity = false
      member.user.accounts.forEach(account => {
        totalBalance += Number(account.startingBalance) + Number(account.balanceRequired || 0) // Basic balance calc

        // Check for recent activity
        const hasRecentTrades = account.trades.some(t => t.createdAt > lastWeek)
        if (hasRecentTrades) memberHasRecentActivity = true

        // Collect recent activity
        account.trades.forEach(trade => {
          recentActivity.push({
            id: trade.id,
            type: 'TRADE_CLOSED',
            description: `${member.user.email} closed ${trade.instrument} with PnL ${trade.pnl}`,
            amount: Number(trade.pnl),
            date: trade.createdAt,
            userEmail: member.user.email
          })
        })
      })
      if (memberHasRecentActivity) activeTraders++
    })

    // Sort and limit activity
    recentActivity = recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

    return {
      success: true,
      data: {
        totalBalance,
        activeTraders,
        totalPnl: team.analytics[0]?.totalPnl || 0,
        winRate: team.analytics[0]?.winRate || 0,
        recentActivity
      }
    }

  } catch (error) {
    console.error('Error fetching team overview:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to fetch overview' }
  }
}

export async function getTeamInvitations(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    if (!user?.email) return []

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        email: user.email,
        status: 'PENDING',
      },
      include: {
        team: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return invitations
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
}

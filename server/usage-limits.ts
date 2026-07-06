'use server'

import { prisma } from '@/lib/prisma'
import { getPlanLimits, getUserPlan } from './plans'

export interface LimitCheckResult {
  allowed: boolean
  current: number
  limit: number
  plan: string | null
}

export async function checkAccountLimit(userId: string): Promise<LimitCheckResult> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.maxAccounts === -1) {
    return { allowed: true, current: 0, limit: -1, plan }
  }

  const current = await prisma.account.count({ where: { userId } })
  return {
    allowed: current < limits.maxAccounts,
    current,
    limit: limits.maxAccounts,
    plan,
  }
}

export async function checkScreenshotLimit(userId: string): Promise<LimitCheckResult> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.maxScreenshots === -1) {
    return { allowed: true, current: 0, limit: -1, plan }
  }

  const current = await prisma.trade.count({
    where: {
      userId,
      OR: [
        { imageBase64: { not: null } },
        { imageBase64Second: { not: null } },
      ],
    },
  })
  return {
    allowed: current < limits.maxScreenshots,
    current,
    limit: limits.maxScreenshots,
    plan,
  }
}

export async function checkTradeImportLimit(userId: string, _incomingCount: number): Promise<LimitCheckResult> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.dataRetentionDays === -1) {
    return { allowed: true, current: 0, limit: -1, plan }
  }

  const current = await prisma.trade.count({ where: { userId } })
  return {
    allowed: true,
    current,
    limit: -1,
    plan,
  }
}

export async function checkTeamCreationLimit(userId: string): Promise<LimitCheckResult> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)

  if (limits.maxTeamMembers === 0) {
    const current = await prisma.team.count({ where: { userId } })
    return { allowed: false, current, limit: 0, plan }
  }

  return { allowed: true, current: 0, limit: limits.maxTeamMembers, plan }
}

export async function getDataRetentionDays(userId: string): Promise<number | null> {
  const plan = await getUserPlan(userId)
  const limits = getPlanLimits(plan)
  return limits.dataRetentionDays === -1 ? null : limits.dataRetentionDays
}

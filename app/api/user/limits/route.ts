import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDatabaseUserId } from '@/server/auth'
import { getPlanLimits, getUserPlan } from '@/server/plans'

export async function GET() {
  try {
    const userId = await getDatabaseUserId()
    const plan = await getUserPlan(userId)
    const limits = getPlanLimits(plan)

    const [accountCount, tradeCount, screenshotCount] = await Promise.all([
      prisma.account.count({ where: { userId } }),
      prisma.trade.count({ where: { userId } }),
      prisma.trade.count({
        where: {
          userId,
          OR: [
            { imageBase64: { not: null } },
            { imageBase64Second: { not: null } },
          ],
        },
      }),
    ])

    return NextResponse.json({
      plan,
      accounts: {
        used: accountCount,
        max: limits.maxAccounts === -1 ? null : limits.maxAccounts,
      },
      trades: {
        used: tradeCount,
        max: null,
      },
      screenshots: {
        used: screenshotCount,
        max: limits.maxScreenshots === -1 ? null : limits.maxScreenshots,
      },
      dataRetentionDays: limits.dataRetentionDays === -1 ? null : limits.dataRetentionDays,
      maxTeamMembers: limits.maxTeamMembers === 0 ? null : limits.maxTeamMembers,
      features: limits.allowedFeatures,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch limits' }, { status: 500 })
  }
}

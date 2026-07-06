import { prisma } from '@/lib/prisma'

export class PlanGateError extends Error {
  constructor(
    public feature: string,
    public plan: string | null,
  ) {
    super(`Feature "${feature}" requires a Pro subscription`)
    this.name = 'PlanGateError'
  }
}

export const Feature = {
  BASIC_ANALYTICS: 'basic_analytics',
  EQUITY_CURVE: 'equity_curve',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BEHAVIORAL_ANALYTICS: 'behavioral_analytics',
  AI_ANALYSIS: 'ai_analysis',
  AI_JOURNALING: 'ai_journaling',
  AI_COACHING: 'ai_coaching',
  MANUAL_JOURNAL: 'manual_journal',
  CREATE_TEAM: 'create_team',
  JOIN_TEAM: 'join_team',
  AUTO_SYNC: 'auto_sync',
  PRIORITY_SUPPORT: 'priority_support',
  CSV_EXPORT_FULL: 'csv_export_full',
} as const

export type PlanId = 'FREE' | 'PLUS'

export interface PlanLimits {
  maxAccounts: number
  maxScreenshots: number
  dataRetentionDays: number
  maxAiTokens: number
  maxTeamMembers: number
  allowedFeatures: string[]
}

export const PLANS: Record<PlanId, PlanLimits> = {
  FREE: {
    maxAccounts: 5,
    maxScreenshots: 50,
    dataRetentionDays: 90,
    maxAiTokens: 150_000,
    maxTeamMembers: 0,
    allowedFeatures: [
      Feature.BASIC_ANALYTICS,
      Feature.EQUITY_CURVE,
      Feature.MANUAL_JOURNAL,
      Feature.JOIN_TEAM,
      Feature.CSV_EXPORT_FULL,
    ],
  },
  PLUS: {
    maxAccounts: -1,
    maxScreenshots: -1,
    dataRetentionDays: -1,
    maxAiTokens: 2_000_000,
    maxTeamMembers: 20,
    allowedFeatures: [
      Feature.BASIC_ANALYTICS,
      Feature.EQUITY_CURVE,
      Feature.ADVANCED_ANALYTICS,
      Feature.BEHAVIORAL_ANALYTICS,
      Feature.AI_ANALYSIS,
      Feature.AI_JOURNALING,
      Feature.AI_COACHING,
      Feature.MANUAL_JOURNAL,
      Feature.CREATE_TEAM,
      Feature.JOIN_TEAM,
      Feature.AUTO_SYNC,
      Feature.PRIORITY_SUPPORT,
      Feature.CSV_EXPORT_FULL,
    ],
  },
}

export function getPlanLimits(planName: string | null | undefined): PlanLimits {
  const key = planName?.toUpperCase() as PlanId
  return PLANS[key] ?? PLANS.FREE
}

export function hasFeature(planName: string | null | undefined, feature: string): boolean {
  return getPlanLimits(planName).allowedFeatures.includes(feature)
}

export async function getUserPlan(userId: string): Promise<string | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  })
  return subscription?.plan ?? null
}

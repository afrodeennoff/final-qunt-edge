import { getSubscriptionDetails } from '../../server/subscription'
import { prisma } from '../prisma'
import { isAdmin } from '@/server/authz'

export type AiGuardFeature =
  | 'chat'
  | 'support'
  | 'editor'
  | 'analysis'
  | 'mappings'
  | 'format-trades'
  | 'search'
  | 'transcribe'
  | 'journal-insights'
  | 'analyze-patterns'

type EntitlementResult = {
  allowed: boolean
  reason?: string
  plan?: string
  isActive: boolean
}

// Features available without a subscription, subject to FREE_TIER_FEATURE_LIMITS
const INACTIVE_ALLOWED_FEATURES = new Set<AiGuardFeature>([
  'chat',
  'search',
  'mappings',
  'format-trades',
  'journal-insights',
  'analyze-patterns',
])

// Per-feature monthly request limits for free-tier users.
// Omitted features are unlimited on the free tier.
const FREE_TIER_FEATURE_LIMITS: Partial<Record<AiGuardFeature, number>> = {
  chat: 2,
}

function getUtcMonthStartEnd(): { start: Date; end: Date } {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  return {
    start: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)),
  }
}

async function countMonthlyFeatureUsage(userId: string, feature: AiGuardFeature): Promise<number> {
  const { start, end } = getUtcMonthStartEnd()
  return prisma.aiUsageLedger.count({
    where: {
      userId,
      feature,
      createdAt: { gte: start, lt: end },
    },
  })
}

export async function canAccessAiFeature(
  userId: string,
  feature: AiGuardFeature,
): Promise<EntitlementResult> {
  // Admin bypass — skip subscription check
  if (isAdmin(userId)) return { allowed: true, plan: 'ADMIN', isActive: true }

  const userSubscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      status: true,
      plan: true,
      trialEndsAt: true,
    },
  })

  const now = new Date()
  const hasActiveSubscription = Boolean(
    userSubscription && (
      userSubscription.status === 'ACTIVE' ||
      (userSubscription.status === 'PENDING' && userSubscription.trialEndsAt && userSubscription.trialEndsAt > now)
    ),
  )

  const fallbackSubscription = hasActiveSubscription ? null : await getSubscriptionDetails()
  const isActive = hasActiveSubscription || Boolean(fallbackSubscription?.isActive)
  const plan = userSubscription?.plan ?? fallbackSubscription?.plan ?? undefined

  // Active subscription (paid tier) — unlimited everything
  if (isActive) {
    return { allowed: true, plan, isActive: true }
  }

  // Free tier — check if the feature is available at all
  if (!INACTIVE_ALLOWED_FEATURES.has(feature)) {
    return {
      allowed: false,
      reason: 'Active subscription required for this AI feature.',
      plan,
      isActive: false,
    }
  }

  // Free tier — check per-feature request limit
  const freeLimit = FREE_TIER_FEATURE_LIMITS[feature]
  if (freeLimit !== undefined) {
    const usageCount = await countMonthlyFeatureUsage(userId, feature)
    if (usageCount >= freeLimit) {
      return {
        allowed: false,
        reason: `You've used your ${freeLimit} free ${feature} requests. Upgrade to Pro for unlimited access.`,
        plan,
        isActive: false,
      }
    }
  }

  return {
    allowed: true,
    reason: 'Allowed on inactive plan for baseline features.',
    plan,
    isActive: false,
  }
}

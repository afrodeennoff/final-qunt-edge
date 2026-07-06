import { getSubscriptionDetails } from '../../server/subscription'
import { prisma } from '../prisma'
import { isAdmin } from '@/server/authz'
import { hasFeature, getUserPlan } from '@/server/plans'

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

const AI_FEATURE_MAP: Partial<Record<AiGuardFeature, string>> = {
  chat: 'ai_analysis',
  support: 'ai_analysis',
  editor: 'ai_journaling',
  analysis: 'ai_analysis',
  'journal-insights': 'ai_coaching',
  'analyze-patterns': 'ai_analysis',
}

const INACTIVE_ALLOWED_FEATURES = new Set<AiGuardFeature>([
  'search',
  'mappings',
  'format-trades',
  'transcribe',
])

export async function canAccessAiFeature(
  userId: string,
  feature: AiGuardFeature,
): Promise<EntitlementResult> {
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
  const plan = userSubscription?.plan ?? fallbackSubscription?.plan ?? null

  if (isActive) {
    const requiredFeature = AI_FEATURE_MAP[feature]
    if (requiredFeature && !hasFeature(plan, requiredFeature)) {
      return {
        allowed: false,
        reason: 'This AI feature requires a Pro subscription.',
        plan: plan ?? undefined,
        isActive,
      }
    }
    return { allowed: true, plan: plan ?? undefined, isActive: true }
  }

  if (INACTIVE_ALLOWED_FEATURES.has(feature)) {
    return {
      allowed: true,
      reason: 'Allowed on inactive plan for baseline features.',
      plan: plan ?? undefined,
      isActive: false,
    }
  }

  return {
    allowed: false,
    reason: 'Active subscription required for this AI feature.',
    plan: plan ?? undefined,
    isActive: false,
  }
}

'use server'

import { getDatabaseUserId } from './auth'
import { getUserPlan, hasFeature, PlanGateError } from './plans'

export async function requireFeature(feature: string): Promise<{ userId: string; plan: string | null }> {
  const userId = await getDatabaseUserId()
  const plan = await getUserPlan(userId)
  if (!hasFeature(plan, feature)) {
    throw new PlanGateError(feature, plan)
  }
  return { userId, plan }
}

'use server'

import { getDatabaseUserId } from './auth'
import { getUserPlan, hasFeature } from './plans'

export class PlanGateError extends Error {
  constructor(
    public feature: string,
    public plan: string | null,
  ) {
    super(`Feature "${feature}" requires a Pro subscription`)
    this.name = 'PlanGateError'
  }
}

export async function requireFeature(feature: string): Promise<{ userId: string; plan: string | null }> {
  const userId = await getDatabaseUserId()
  const plan = await getUserPlan(userId)
  if (!hasFeature(plan, feature)) {
    throw new PlanGateError(feature, plan)
  }
  return { userId, plan }
}

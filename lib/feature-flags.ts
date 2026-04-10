/*** Feature Flag System for Performance Optimization Rollout
 *
 * This system provides controlled, gradual rollout of performance optimizations
 * with emergency rollback capabilities.
 */
function getFeatureFlags() {
  return {
    // Performance optimizations
    ENABLE_SKELETON_LOADING: process.env.NEXT_PUBLIC_ENABLE_SKELETON_LOADING === 'true',
    ENABLE_DEFERRED_COMPUTATIONS: process.env.NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS === 'true',
    ENABLE_LAZY_LOADING: process.env.NEXT_PUBLIC_ENABLE_LAZY_LOADING === 'true',
    ENABLE_QUERY_CACHING: process.env.NEXT_PUBLIC_ENABLE_QUERY_CACHING === 'true',

    // Rollout controls
    ROLLOUT_PERCENTAGE: Number(process.env.NEXT_PUBLIC_PERF_ROLLOUT_PCT) || 0,

    // Server Dashboard Bootstrap
    SERVER_DASHBOARD_BOOTSTRAP: process.env.NEXT_PUBLIC_SERVER_DASHBOARD_BOOTSTRAP === 'true',
    SERVER_DASHBOARD_ROLLOUT_PCT: Number(process.env.NEXT_PUBLIC_SERVER_DASHBOARD_BOOTSTRAP_PCT) || 0,

    // Theme rollout
    DARK_ONLY_SURFACE_ENFORCEMENT:
      process.env.NEXT_PUBLIC_DARK_ONLY_SURFACE_ENFORCEMENT !== 'false',

    // Safety
    ENABLE_EMERGENCY_ROLLBACK: process.env.NEXT_PUBLIC_EMERGENCY_ROLLBACK === 'true',
  } as const
}

// Export a frozen object for normal usage
export const FEATURE_FLAGS = Object.freeze(getFeatureFlags())

export type FeatureFlag = keyof typeof FEATURE_FLAGS

/***
 * Simple deterministic string hash function
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/***
 * Determines if a user should see performance optimizations based on:
 * 1. Emergency rollback status (always false if enabled)
 * 2. Gradual rollout percentage
 * 3. Deterministic user ID hashing
 */
export function shouldShowOptimizations(userId?: string): boolean {
  if (FEATURE_FLAGS.ENABLE_EMERGENCY_ROLLBACK) return false
  const pct = FEATURE_FLAGS.ROLLOUT_PERCENTAGE
  if (pct >= 100) return true
  if (pct <= 0) return false
  if (userId) {
    const hash = hashCode(userId)
    return (hash % 100) < pct
  }
  return Math.random() * 100 < pct
}

/***
 * Determines if the server dashboard bootstrap should be used for a given user.
 * Defaults to off (0%) — enable via NEXT_PUBLIC_SERVER_DASHBOARD_BOOTSTRAP=true
 */
export function shouldUseServerBootstrap(userId?: string): boolean {
  if (!FEATURE_FLAGS.SERVER_DASHBOARD_BOOTSTRAP) return false
  const pct = FEATURE_FLAGS.SERVER_DASHBOARD_ROLLOUT_PCT
  if (pct >= 100) return true
  if (pct <= 0) return false
  if (userId) {
    const hash = hashCode(userId)
    return (hash % 100) < pct
  }
  return false
}

/***
 * Dark-only surfaces are enabled by default and can be rolled back explicitly.
 */
export function shouldEnforceDarkOnlySurfaces(): boolean {
  return FEATURE_FLAGS.DARK_ONLY_SURFACE_ENFORCEMENT
}

/***
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return !!FEATURE_FLAGS[flag]
}

/***
 * Get current rollout status as a human-readable string
 */
export function getRolloutStatus(): string {
  if (FEATURE_FLAGS.ENABLE_EMERGENCY_ROLLBACK) return 'EMERGENCY_ROLLBACK'
  const pct = FEATURE_FLAGS.ROLLOUT_PERCENTAGE
  if (pct === 0) return 'DISABLED'
  if (pct >= 100) return 'FULL_ROLLOUT'
  if (pct < 10) return 'PILOT'
  if (pct < 50) return 'EARLY_ACCESS'
  return 'GRADUAL_ROLLOUT'
}

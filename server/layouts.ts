'use server'

import { DashboardLayout, Prisma } from '@/prisma/generated/prisma'
import { cacheLife, cacheTag } from 'next/cache'
import { Widget, Layouts } from '@/app/[locale]/dashboard/types/dashboard'
import { createClient, getUserId, getDatabaseUserId } from './auth'
import { prisma } from '@/lib/prisma'
import { defaultLayouts } from '@/lib/default-layouts'
import { logger } from '@/lib/logger'
import { isPrismaSchemaMismatchError } from '@/lib/prisma-guard'
import { CACHE_TAGS, invalidateDashboardLayout, invalidateEquityChart } from '@/lib/cache/cache-invalidation'

async function assertLayoutOwnership(layoutId: string): Promise<DashboardLayout> {
  const userId = await getUserId()
  const layout = await prisma.dashboardLayout.findUnique({
    where: { id: layoutId }
  })
  if (!layout) {
    throw new Error('Layout not found')
  }
  if (layout.userId !== userId) {
    throw new Error('Unauthorized access to layout')
  }
  return layout
}

interface SaveLayoutResult {
  success: boolean
  error?: string
}

const saveLocks = new Map<string, { promise: Promise<SaveLayoutResult>; timestamp: number }>()
const LOCK_TIMEOUT_MS = 30000 // 30 second max lock lifetime
const LAYOUT_CACHE_LIFETIME = { stale: 120, revalidate: 120, expire: 600 } as const

function validateLayouts(layouts: DashboardLayout): boolean {
  if (!layouts || typeof layouts !== 'object') return false

  const validateArray = (arr: unknown): arr is Prisma.JsonArray => {
    if (!Array.isArray(arr)) return false
    return arr.every(item =>
      item &&
      typeof item === 'object' &&
      'i' in item &&
      'type' in item &&
      'x' in item &&
      'y' in item &&
      'w' in item &&
      'h' in item
    )
  }

  return validateArray(layouts.desktop) && validateArray(layouts.mobile)
}

async function _loadDashboardLayout(userId: string): Promise<Layouts | null> {
  let dashboard = await prisma.dashboardLayout.findUnique({
    where: { userId },
  })

  if (!dashboard) {
    await createDefaultDashboardLayout(userId)
    dashboard = await prisma.dashboardLayout.findUnique({
      where: { userId },
    })
  }

  if (!dashboard) return null

  const parse = (json: unknown): Widget[] => {
    if (Array.isArray(json)) return json as unknown as Widget[]
    return []
  }

  return {
    desktop: parse(dashboard.desktop),
    mobile: parse(dashboard.mobile)
  }
}

async function _loadDashboardLayoutCached(userId: string): Promise<Layouts | null> {
  'use cache'
  cacheLife(LAYOUT_CACHE_LIFETIME)
  cacheTag(CACHE_TAGS.DASHBOARD_LAYOUT(userId))
  cacheTag(CACHE_TAGS.DASHBOARD(userId))
  return _loadDashboardLayout(userId)
}

export async function loadDashboardLayoutAction(forceRefresh = false): Promise<Layouts | null> {
  const userId = await getUserId()
  if (!userId) return null
  try {
    return forceRefresh ? _loadDashboardLayout(userId) : _loadDashboardLayoutCached(userId)
  } catch (error) {
    logger.error('[loadDashboardLayout] Error', { error })
    return null
  }
}

export async function saveDashboardLayoutAction(layouts: DashboardLayout): Promise<SaveLayoutResult> {
  const authUserId = await getUserId()
  const databaseUserId = await getDatabaseUserId()
  const layoutUserId = authUserId

  if (!databaseUserId || !layoutUserId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayout] Validation failed', { userId: databaseUserId })
    return { success: false, error: 'Invalid layout structure' }
  }

  let resolvedEmail = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    resolvedEmail = user?.email || ''

    if (!resolvedEmail) {
      logger.error('[saveDashboardLayout] Missing user email for ensureUserInDatabase', {
        userId: databaseUserId,
      })
      return { success: false, error: 'User email not available' }
    }

    await prisma.user.upsert({
      where: { id: databaseUserId },
      create: {
        id: databaseUserId,
        auth_user_id: authUserId,
        email: resolvedEmail,
      },
      update: {
        email: resolvedEmail,
      },
    })
  } catch (error: unknown) {
    if (
      isPrismaSchemaMismatchError(error)
    ) {
      await prisma.$executeRaw`
        INSERT INTO "public"."User" ("id", "email", "auth_user_id")
        VALUES (${databaseUserId}, ${resolvedEmail}, ${authUserId})
        ON CONFLICT ("id")
        DO UPDATE SET "email" = EXCLUDED."email"
      `
    } else {
      logger.error('[saveDashboardLayout] Failed to ensure user record', {
        error,
        userId: databaseUserId,
      })
      return { success: false, error: 'Failed to ensure user record' }
    }
  }

  let verifiedUser: { id: string } | null = null
  try {
    verifiedUser = await prisma.user.findUnique({
      where: { id: databaseUserId },
      select: { id: true },
    })
  } catch (error) {
    logger.error('[saveDashboardLayout] Failed to ensure user record', {
      error,
      userId: databaseUserId,
    })
    return { success: false, error: 'Failed to ensure user record' }
  }

  if (!verifiedUser) {
    logger.error('[saveDashboardLayout] Missing user record for layout save', {
      userId: databaseUserId,
    })
    return { success: false, error: 'User record not found' }
  }

  const lockKey = `layout:${layoutUserId}`
  const now = Date.now()

  // Check and clean expired locks first
  for (const [key, value] of saveLocks.entries()) {
    if (now - value.timestamp > LOCK_TIMEOUT_MS) {
      saveLocks.delete(key)
    }
  }

  if (saveLocks.has(lockKey)) {
    logger.info('[saveDashboardLayout] Debouncing concurrent save', { userId: layoutUserId })
    return { success: true }
  }

  const savePromise = (async (): Promise<SaveLayoutResult> => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.dashboardLayout.upsert({
          where: { userId: layoutUserId },
          update: {
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray,
            updatedAt: new Date()
          },
          create: {
            userId: layoutUserId,
            desktop: layouts.desktop as unknown as Prisma.JsonArray,
            mobile: layouts.mobile as unknown as Prisma.JsonArray
          },
        })
      })

      invalidateDashboardLayout(layoutUserId)
      invalidateEquityChart(databaseUserId)

      logger.info('[saveDashboardLayout] Success', { userId: layoutUserId })
      return { success: true }
    } catch (error) {
      logger.error('[saveDashboardLayout] Error', { error, userId: layoutUserId })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    }
  })()

  saveLocks.set(lockKey, { promise: savePromise, timestamp: Date.now() })

  try {
    const result = await savePromise
    return result
  } finally {
    saveLocks.delete(lockKey)
  }
}

export async function createDefaultDashboardLayout(userId: string): Promise<void> {
  try {
    const existing = await prisma.dashboardLayout.findUnique({ where: { userId } })
    if (existing) return

    await prisma.dashboardLayout.create({
      data: {
        userId,
        desktop: defaultLayouts.desktop as unknown as Prisma.JsonArray,
        mobile: defaultLayouts.mobile as unknown as Prisma.JsonArray
      }
    })
  } catch (error) {
    logger.warn('[createDefaultDashboardLayout] Failed (likely exists)', { error })
  }
}

export async function createLayoutVersionAction(
  layoutId: string,
  versionData: {
    desktop: unknown
    mobile: unknown
    version: number
    checksum: string
    description?: string
    deviceId: string
    changeType: string
  }
): Promise<void> {
  try {
    // Verify ownership before creating version
    const layout = await assertLayoutOwnership(layoutId)

    await prisma.layoutVersion.create({
      data: {
        layoutId,
        desktop: versionData.desktop as Prisma.JsonArray,
        mobile: versionData.mobile as Prisma.JsonArray,
        version: versionData.version,
        checksum: versionData.checksum,
        description: versionData.description,
        deviceId: versionData.deviceId,
        changeType: versionData.changeType
      }
    })

    await prisma.dashboardLayout.update({
      where: { id: layoutId },
      data: {
        version: versionData.version,
        checksum: versionData.checksum,
        deviceId: versionData.deviceId
      }
    })

    const databaseUserId = await getDatabaseUserId()
    invalidateDashboardLayout(layout.userId)
    if (databaseUserId) {
      invalidateEquityChart(databaseUserId)
    }
    logger.info('[createLayoutVersion] Success', { layoutId, version: versionData.version })
  } catch (error) {
    logger.error('[createLayoutVersion] Error', { error, layoutId })
    throw error
  }
}

export async function getLayoutVersionHistoryAction(
  layoutId: string,
  limit = 20
): Promise<Array<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
}>> {
  try {
    // Verify ownership before reading history
    await assertLayoutOwnership(layoutId)

    const versions = await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      take: limit
    })

    return versions.map(v => ({
      id: v.id,
      version: v.version,
      desktop: v.desktop,
      mobile: v.mobile,
      checksum: v.checksum,
      description: v.description ?? undefined,
      deviceId: v.deviceId,
      changeType: v.changeType,
      createdAt: v.createdAt
    }))
  } catch (error) {
    logger.error('[getLayoutVersionHistory] Error', { error, layoutId })
    return []
  }
}

export async function getLayoutVersionByNumberAction(
  layoutId: string,
  versionNumber: number
): Promise<{
  id: string
  version: number
  desktop: unknown
  mobile: unknown
  checksum: string
  description?: string
  deviceId: string
  changeType: string
  createdAt: Date
} | null> {
  try {
    // Verify ownership before reading version
    await assertLayoutOwnership(layoutId)

    const found = await prisma.layoutVersion.findFirst({
      where: { layoutId, version: versionNumber },
      select: { id: true },
    })
    if (!found) return null

    const version = await prisma.layoutVersion.findUnique({
      where: { id: found.id }
    })

    if (!version) return null

    return {
      id: version.id,
      version: version.version,
      desktop: version.desktop,
      mobile: version.mobile,
      checksum: version.checksum,
      description: version.description ?? undefined,
      deviceId: version.deviceId,
      changeType: version.changeType,
      createdAt: version.createdAt
    }
  } catch (error) {
    logger.error('[getLayoutVersionByNumber] Error', { error, layoutId, versionNumber })
    return null
  }
}

export async function cleanupOldLayoutVersionsAction(
  layoutId: string,
  keepCount = 50
): Promise<void> {
  try {
    // Verify ownership before cleanup
    await assertLayoutOwnership(layoutId)

    const totalCount = await prisma.layoutVersion.count({ where: { layoutId } })

    if (totalCount <= keepCount) return

    const versionsToDelete = (await prisma.layoutVersion.findMany({
      where: { layoutId },
      orderBy: { version: 'desc' },
      skip: keepCount,
      select: { id: true }
    })) ?? []

    if (versionsToDelete.length === 0) return

    await prisma.layoutVersion.deleteMany({
      where: {
        id: { in: versionsToDelete.map(v => v.id) }
      }
    })

    logger.info('[cleanupOldLayoutVersions] Success', {
      layoutId,
      deletedCount: versionsToDelete.length
    })
  } catch (error) {
    logger.error('[cleanupOldLayoutVersions] Error', { error, layoutId })
  }
}

export async function saveDashboardLayoutWithVersionAction(
  layouts: DashboardLayout,
  versionData: {
    description?: string
    changeType: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
    deviceId: string
  }
): Promise<SaveLayoutResult> {
  const userId = await getUserId()
  const databaseUserId = await getDatabaseUserId()

  if (!userId || !databaseUserId) {
    return { success: false, error: 'User not authenticated' }
  }

  if (!layouts) {
    return { success: false, error: 'Layouts data is required' }
  }

  if (!validateLayouts(layouts)) {
    logger.error('[saveDashboardLayoutWithVersion] Validation failed', { userId })
    return { success: false, error: 'Invalid layout structure' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.dashboardLayout.findUnique({
        where: { userId },
        select: { id: true, version: true, checksum: true }
      })

      const newVersion = (existing?.version ?? 0) + 1

      const crypto = await import('crypto')
      const checksum = crypto.createHash('sha256')
        .update(JSON.stringify({ desktop: layouts.desktop, mobile: layouts.mobile }))
        .digest('hex')

      const savedLayout = await tx.dashboardLayout.upsert({
        where: { userId },
        update: {
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId,
          updatedAt: new Date()
        },
        create: {
          userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          deviceId: versionData.deviceId
        },
      })

      await tx.layoutVersion.create({
        data: {
          layoutId: savedLayout.id,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          version: newVersion,
          checksum,
          description: versionData.description,
          deviceId: versionData.deviceId,
          changeType: versionData.changeType
        }
      })
    })

    invalidateDashboardLayout(userId)
    invalidateEquityChart(databaseUserId)

    logger.info('[saveDashboardLayoutWithVersion] Success', { userId })
    return { success: true }
  } catch (error) {
    logger.error('[saveDashboardLayoutWithVersion] Error', { error, userId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

/**
 * SECURITY ENHANCEMENT for MCP (Top 15 #12):
 * These *ForUser variants are called ONLY from MCP handlers with ctx.userId.
 * Web actions unchanged (still use getDatabaseUserId + session).
 * All internal Prisma calls remain user-scoped.
 */
export async function getDashboardLayoutForUser(userId: string): Promise<Layouts | null> {
  if (!userId) return null
  try {
    return await _loadDashboardLayoutCached(userId)
  } catch (error) {
    logger.error('[getDashboardLayoutForUser] Error', { error, userId })
    return null
  }
}

export async function saveDashboardLayoutForUser(
  userId: string,
  layouts: { desktop: unknown; mobile: unknown }
): Promise<SaveLayoutResult> {
  if (!userId) return { success: false, error: 'User required' }
  if (!layouts || !validateLayouts(layouts as any)) {
    return { success: false, error: 'Invalid layout structure' }
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.dashboardLayout.upsert({
        where: { userId },
        update: {
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
          updatedAt: new Date(),
        },
        create: {
          userId,
          desktop: layouts.desktop as unknown as Prisma.JsonArray,
          mobile: layouts.mobile as unknown as Prisma.JsonArray,
        },
      })
    })
    invalidateDashboardLayout(userId)
    // Note: equity invalidate skipped for MCP path (no databaseUserId lookup)
    logger.info('[saveDashboardLayoutForUser] Success (MCP path)', { userId })
    return { success: true }
  } catch (error) {
    logger.error('[saveDashboardLayoutForUser] Error', { error, userId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

import { hasConfiguredDatabaseConnection, prisma } from '@/lib/prisma'

type AsyncOperation<T> = () => Promise<T>

const globalForPrismaGuard = globalThis as unknown as {
  prismaGuardCooldowns: Map<string, number> | undefined
  prismaTableAvailability: Map<string, boolean> | undefined
  prismaTableProbes: Map<string, Promise<boolean>> | undefined
  prismaColumnAvailability: Map<string, boolean> | undefined
  prismaColumnProbes: Map<string, Promise<boolean>> | undefined
}

const schemaMismatchCooldowns =
  globalForPrismaGuard.prismaGuardCooldowns ?? new Map<string, number>()
const prismaTableAvailability =
  globalForPrismaGuard.prismaTableAvailability ?? new Map<string, boolean>()
const prismaTableProbes =
  globalForPrismaGuard.prismaTableProbes ?? new Map<string, Promise<boolean>>()
const prismaColumnAvailability =
  globalForPrismaGuard.prismaColumnAvailability ?? new Map<string, boolean>()
const prismaColumnProbes =
  globalForPrismaGuard.prismaColumnProbes ?? new Map<string, Promise<boolean>>()

if (!globalForPrismaGuard.prismaGuardCooldowns) {
  globalForPrismaGuard.prismaGuardCooldowns = schemaMismatchCooldowns
}
if (!globalForPrismaGuard.prismaTableAvailability) {
  globalForPrismaGuard.prismaTableAvailability = prismaTableAvailability
}
if (!globalForPrismaGuard.prismaTableProbes) {
  globalForPrismaGuard.prismaTableProbes = prismaTableProbes
}
if (!globalForPrismaGuard.prismaColumnAvailability) {
  globalForPrismaGuard.prismaColumnAvailability = prismaColumnAvailability
}
if (!globalForPrismaGuard.prismaColumnProbes) {
  globalForPrismaGuard.prismaColumnProbes = prismaColumnProbes
}

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000

export function isPrismaSchemaMismatchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }
  const message = (maybeError.message ?? '').toLowerCase()

  return (
    maybeError.code === 'P2021' ||
    maybeError.code === 'P2022' ||
    message.includes('does not exist in the current database') ||
    message.includes('column') && message.includes('does not exist')
  )
}

export function isPrismaOperationCoolingDown(key: string): boolean {
  const blockedUntil = schemaMismatchCooldowns.get(key)
  if (!blockedUntil) return false

  const now = Date.now()
  if (now >= blockedUntil) {
    schemaMismatchCooldowns.delete(key)
    return false
  }

  return true
}

export function markPrismaOperationSchemaMismatch(
  key: string,
  cooldownMs = DEFAULT_COOLDOWN_MS
): void {
  schemaMismatchCooldowns.set(key, Date.now() + cooldownMs)
}

function getPrismaTableCacheKey(tableName: string, schema: string): string {
  return `${schema}.${tableName}`
}

function getPrismaColumnCacheKey(tableName: string, columnName: string, schema: string): string {
  return `${schema}.${tableName}.${columnName}`
}

export function markPrismaTableUnavailable(tableName: string, schema = 'public'): void {
  prismaTableAvailability.set(getPrismaTableCacheKey(tableName, schema), false)
}

export function markPrismaColumnUnavailable(
  tableName: string,
  columnName: string,
  schema = 'public'
): void {
  prismaColumnAvailability.set(getPrismaColumnCacheKey(tableName, columnName, schema), false)
}

export async function isPrismaTableAvailable(tableName: string, schema = 'public'): Promise<boolean> {
  if (!hasConfiguredDatabaseConnection) return false

  const cacheKey = getPrismaTableCacheKey(tableName, schema)
  const cached = prismaTableAvailability.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const existingProbe = prismaTableProbes.get(cacheKey)
  if (existingProbe) {
    return existingProbe
  }

  const probe = (async (): Promise<boolean> => {
    try {
      const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = ${schema}
            AND table_name = ${tableName}
        ) AS "exists"
      `

      const exists = Boolean(result[0]?.exists)
      prismaTableAvailability.set(cacheKey, exists)
      return exists
    } catch {
      // Assume available when the probe itself cannot run (connection/auth issues).
      prismaTableAvailability.set(cacheKey, true)
      return true
    } finally {
      prismaTableProbes.delete(cacheKey)
    }
  })()

  prismaTableProbes.set(cacheKey, probe)
  return probe
}

export async function isPrismaColumnAvailable(
  tableName: string,
  columnName: string,
  schema = 'public'
): Promise<boolean> {
  if (!hasConfiguredDatabaseConnection) return false

  const cacheKey = getPrismaColumnCacheKey(tableName, columnName, schema)
  const cached = prismaColumnAvailability.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const existingProbe = prismaColumnProbes.get(cacheKey)
  if (existingProbe) {
    return existingProbe
  }

  const probe = (async (): Promise<boolean> => {
    try {
      const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = ${schema}
            AND table_name = ${tableName}
            AND column_name = ${columnName}
        ) AS "exists"
      `

      const exists = Boolean(result[0]?.exists)
      prismaColumnAvailability.set(cacheKey, exists)
      return exists
    } catch {
      // Assume available when the probe itself cannot run (connection/auth issues).
      prismaColumnAvailability.set(cacheKey, true)
      return true
    } finally {
      prismaColumnProbes.delete(cacheKey)
    }
  })()

  prismaColumnProbes.set(cacheKey, probe)
  return probe
}

export async function withPrismaSchemaMismatchFallback<T>(
  key: string,
  operation: AsyncOperation<T>,
  fallbackValue: T,
  cooldownMs = DEFAULT_COOLDOWN_MS
): Promise<T> {
  if (isPrismaOperationCoolingDown(key)) {
    return fallbackValue
  }

  try {
    return await operation()
  } catch (error) {
    if (isPrismaSchemaMismatchError(error)) {
      markPrismaOperationSchemaMismatch(key, cooldownMs)
      console.warn(`[PrismaGuard] Schema mismatch in '${key}', serving fallback for ${cooldownMs}ms`)
      return fallbackValue
    }

    throw error
  }
}

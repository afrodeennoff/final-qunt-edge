'use server'
import { prisma } from "@/lib/prisma"
import { getDatabaseUserId } from "@/server/auth"
import { Synchronization } from "@/prisma/generated/prisma"
import { withPrismaSchemaMismatchFallback } from "@/lib/prisma-guard"
import { CACHE_TAGS } from "@/lib/cache/cache-invalidation"
import { authSecurityConfig } from "@/lib/security/auth-config"
import { encryptToken } from "@/lib/security/token-crypto"

type RithmicSynchronizationInput = Pick<
  Partial<Synchronization>,
  "accountId" | "dailySyncTime" | "lastSyncedAt" | "service" | "token" | "tokenExpiresAt"
>

async function resolveSyncUserIds() {
  const databaseUserId = await getDatabaseUserId()
  return {
    databaseUserId,
  }
}

export async function getRithmicSynchronizations() {
  const { databaseUserId } = await resolveSyncUserIds()
  const synchronizations = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:list',
    () => prisma.synchronization.findMany({
      where: { userId: databaseUserId, service: "rithmic" },
    }),
    []
  )
  return synchronizations
}

function buildTokenFields(token: string | null | undefined) {
  if (!token) return {}

  if (!authSecurityConfig.tradovateTokenEncryptionEnabled) {
    return {
      token,
      tokenCiphertext: null,
      tokenIv: null,
      tokenTag: null,
      tokenKeyVersion: null,
    }
  }

  const encryptedEnvelope = encryptToken(token)
  return {
    token: null,
    tokenCiphertext: encryptedEnvelope.tokenCiphertext,
    tokenIv: encryptedEnvelope.tokenIv,
    tokenTag: encryptedEnvelope.tokenTag,
    tokenKeyVersion: encryptedEnvelope.tokenKeyVersion,
  }
}

export async function setRithmicSynchronization(synchronization: RithmicSynchronizationInput) {
  const { databaseUserId } = await resolveSyncUserIds()
  const service = synchronization.service || 'rithmic'
  const accountId = synchronization.accountId || ''
  const tokenFields = buildTokenFields(synchronization.token)
  const syncData = {
    service,
    accountId,
    userId: databaseUserId,
    lastSyncedAt: synchronization.lastSyncedAt || new Date(),
    dailySyncTime: synchronization.dailySyncTime,
    tokenExpiresAt: synchronization.tokenExpiresAt,
    ...tokenFields,
  }

  await withPrismaSchemaMismatchFallback<void>(
    'sync:rithmic:upsert',
    async () => {
      await prisma.synchronization.upsert({
        where: {
          userId_service_accountId: {
            userId: databaseUserId,
            service,
            accountId,
          }
        },
        update: syncData,
        create: syncData,
      })
    },
    undefined
  )
  // Invalidate user data caches so sync status reflects immediately
  const { updateTag } = await import('next/cache')
  updateTag(CACHE_TAGS.USER_DATA(databaseUserId))
  updateTag(CACHE_TAGS.DASHBOARD(databaseUserId))
}

export async function removeRithmicSynchronization(accountId: string) {
  const { databaseUserId } = await resolveSyncUserIds()

  const deletedCount = await withPrismaSchemaMismatchFallback(
    'sync:rithmic:delete',
    async () => {
      const result = await prisma.synchronization.deleteMany({
        where: {
          userId: databaseUserId,
          service: "rithmic",
          accountId,
        },
      })
      return result.count
    },
    0
  )

  // Invalidate user data caches so sync removal reflects immediately
  if (deletedCount > 0) {
    const { updateTag } = await import('next/cache')
    updateTag(CACHE_TAGS.USER_DATA(databaseUserId))
    updateTag(CACHE_TAGS.DASHBOARD(databaseUserId))
    updateTag(CACHE_TAGS.USER_DATA_CORE(databaseUserId))
    updateTag(CACHE_TAGS.USER_DATA_SUPPLEMENTAL(databaseUserId))
  }

  return { deletedCount }
}

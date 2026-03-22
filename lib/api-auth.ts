import crypto from 'crypto'
import { prisma } from './prisma'
import { getRedisJson, invalidateCacheNamespace, setRedisJson } from './redis-client'

const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

export type SecureTokenType = 'etp' | 'thor' | 'mt5'

export async function generateSecureToken(userId: string, tokenType: SecureTokenType) {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)
  
  const fieldMap: Record<SecureTokenType, string> = {
    etp: 'etpTokenHash',
    thor: 'thorTokenHash',
    mt5: 'mt5TokenHash'
  }
  
  const legacyFieldMap: Record<SecureTokenType, string> = {
    etp: 'etpToken',
    thor: 'thorToken',
    mt5: null as unknown as string
  }
  
  const field = fieldMap[tokenType]
  const legacyField = legacyFieldMap[tokenType]
  
  const updateData: Record<string, unknown> = {
    [field]: tokenHash,
    [`${tokenType}TokenExpiresAt`]: expiresAt
  }
  
  if (legacyField) {
    updateData[legacyField] = null
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  await invalidateCacheNamespace(`secure-token-${tokenType}`)
  
  return token
}

export async function verifySecureToken(token: string, tokenType: SecureTokenType) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const cacheKey = `hash:${tokenHash}`
  const namespace = `secure-token-${tokenType}`
  const cachedUser = await getRedisJson<{ id: string }>(namespace, cacheKey)
  if (cachedUser?.id) {
    return cachedUser
  }

  const fieldMap: Record<SecureTokenType, string> = {
    etp: 'etpTokenHash',
    thor: 'thorTokenHash',
    mt5: 'mt5TokenHash'
  }
  
  const field = fieldMap[tokenType]
  const expiresField = `${tokenType}TokenExpiresAt`
  
  const user = await prisma.user.findFirst({
    where: {
      [field]: tokenHash,
      [expiresField]: {
        gte: new Date()
      }
    }
  })

  if (user?.id) {
    await setRedisJson(namespace, cacheKey, { id: user.id }, 60)
  }
  
  return user
}

export async function revokeSecureToken(userId: string, tokenType: SecureTokenType) {
  const fieldMap: Record<SecureTokenType, string> = {
    etp: 'etpTokenHash',
    thor: 'thorTokenHash',
    mt5: 'mt5TokenHash'
  }
  
  const legacyFieldMap: Record<SecureTokenType, string | null> = {
    etp: 'etpToken',
    thor: 'thorToken',
    mt5: null as unknown as string
  }
  
  const field = fieldMap[tokenType]
  const legacyField = legacyFieldMap[tokenType]
  const expiresField = `${tokenType}TokenExpiresAt`
  
  const updateData: Record<string, unknown> = {
    [field]: null,
    [expiresField]: null
  }
  
  if (legacyField) {
    updateData[legacyField] = null
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  await invalidateCacheNamespace(`secure-token-${tokenType}`)
}

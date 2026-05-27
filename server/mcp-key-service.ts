'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/server/auth'
import { randomBytes, createHash } from 'node:crypto'
import { isAdminUser } from '@/server/authz'

const KEY_PREFIX_USER = 'qunt_usr_'
const KEY_PREFIX_ADMIN = 'qunt_adm_'
const KEY_BYTES = 32

export interface ApiKeyResult {
  id: string
  key: string
  keyPrefix: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  lastUsedAt: Date | null
}

function generateApiKey(role: 'user' | 'admin'): { key: string; keyPrefix: string; keyHash: string } {
  const prefix = role === 'admin' ? KEY_PREFIX_ADMIN : KEY_PREFIX_USER
  const raw = randomBytes(KEY_BYTES).toString('base64url')
  const key = `${prefix}${raw}`
  const keyHash = createHash('sha256').update(key).digest('hex')
  return { key, keyPrefix: prefix, keyHash }
}

export async function generateUserApiKey(name: string): Promise<{ success: true; result: ApiKeyResult } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    if (!name || name.trim().length < 2 || name.trim().length > 64) {
      return { success: false, error: 'Key name must be 2-64 characters' }
    }

    const { key, keyPrefix, keyHash } = generateApiKey('user')

    const apiKey = await prisma.apiKey.create({
      data: {
        key: keyHash,
        keyPrefix,
        name: name.trim(),
        userId: user.id,
        role: 'user',
      },
    })

    return {
      success: true,
      result: {
        id: apiKey.id,
        key,
        keyPrefix,
        name: apiKey.name,
        role: 'user',
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate API key' }
  }
}

export async function generateAdminApiKey(name: string): Promise<{ success: true; result: ApiKeyResult } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !isAdminUser(user as any)) {
      return { success: false, error: 'Forbidden: Admin access required' }
    }

    const { key, keyPrefix, keyHash } = generateApiKey('admin')

    const apiKey = await prisma.apiKey.create({
      data: {
        key: keyHash,
        keyPrefix,
        name: name.trim(),
        userId: user.id,
        role: 'admin',
      },
    })

    return {
      success: true,
      result: {
        id: apiKey.id,
        key,
        keyPrefix,
        name: apiKey.name,
        role: 'admin',
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate admin API key' }
  }
}

export async function listUserApiKeys(): Promise<{ success: true; keys: ApiKeyResult[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, keyPrefix: true, name: true, role: true, createdAt: true, lastUsedAt: true },
    })

    return {
      success: true,
      keys: keys.map((k) => ({ ...k, key: '' })),
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to list API keys' }
  }
}

export async function revokeApiKey(keyId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    const existing = await prisma.apiKey.findUnique({ where: { id: keyId } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'API key not found' }
    }

    await prisma.apiKey.delete({ where: { id: keyId } })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to revoke API key' }
  }
}

export async function validateApiKey(rawKey: string): Promise<{ userId: string; role: 'user' | 'admin' } | null> {
  try {
    const keyHash = createHash('sha256').update(rawKey).digest('hex')

    const record = await prisma.apiKey.findUnique({ where: { key: keyHash } })
    if (!record) return null
    if (record.expiresAt && record.expiresAt < new Date()) return null

    await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })

    return { userId: record.userId, role: record.role as 'user' | 'admin' }
  } catch {
    return null
  }
}

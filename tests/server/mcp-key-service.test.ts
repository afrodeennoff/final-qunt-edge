import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  apiKeyCreateMock,
  apiKeyFindManyMock,
  apiKeyFindUniqueMock,
  apiKeyUpdateMock,
  apiKeyUpdateManyMock,
  ensureMcpTablesMock,
} = vi.hoisted(() => ({
  apiKeyCreateMock: vi.fn(),
  apiKeyFindManyMock: vi.fn(),
  apiKeyFindUniqueMock: vi.fn(),
  apiKeyUpdateMock: vi.fn(),
  apiKeyUpdateManyMock: vi.fn(),
  ensureMcpTablesMock: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      create: apiKeyCreateMock,
      findMany: apiKeyFindManyMock,
      findUnique: apiKeyFindUniqueMock,
      update: apiKeyUpdateMock,
      updateMany: apiKeyUpdateManyMock,
    },
  },
}))

vi.mock('@/server/auth', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/server/authz', () => ({
  isAdminUser: vi.fn(() => false),
}))

vi.mock('@/server/mcp-auto-migrate', () => ({
  ensureMcpTables: ensureMcpTablesMock,
  isMissingTableError: vi.fn(() => false),
}))

import {
  generateApiKeyForAuthUser,
  listApiKeysForAuthUser,
  revokeApiKeyForAuthUser,
  validateApiKey,
} from '@/server/mcp-key-service'

describe('MCP API key service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a unique hashed key and returns the raw key only on creation', async () => {
    apiKeyCreateMock.mockResolvedValue({
      id: 'key_1',
      keyPrefix: 'qunt_usr_',
      name: 'Claude',
      role: 'user',
      createdAt: new Date('2026-06-02T00:00:00Z'),
      lastUsedAt: null,
    })

    const result = await generateApiKeyForAuthUser('auth-user-1', 'Claude')

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.result.key).toMatch(/^qunt_usr_/)
    expect(apiKeyCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        key: expect.not.stringMatching(/^qunt_usr_/),
        keyPrefix: 'qunt_usr_',
        userId: 'auth-user-1',
        role: 'user',
      }),
    })
  })

  it('lists only active keys for the authenticated user and never returns raw keys', async () => {
    apiKeyFindManyMock.mockResolvedValue([
      {
        id: 'key_1',
        keyPrefix: 'qunt_usr_',
        name: 'Cursor',
        role: 'user',
        createdAt: new Date('2026-06-02T00:00:00Z'),
        lastUsedAt: null,
        revokedAt: null,
      },
    ])

    const result = await listApiKeysForAuthUser('auth-user-1')

    expect(apiKeyFindManyMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'auth-user-1', revokedAt: null },
    }))
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.keys).toHaveLength(1)
    expect(result.keys[0]).not.toHaveProperty('key')
  })

  it('soft revokes keys instead of deleting them', async () => {
    apiKeyUpdateManyMock.mockResolvedValue({ count: 1 })

    const result = await revokeApiKeyForAuthUser('auth-user-1', 'key_1')

    expect(result).toEqual({ success: true })
    expect(apiKeyUpdateManyMock).toHaveBeenCalledWith({
      where: { id: 'key_1', userId: 'auth-user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    })
  })

  it('rejects revoked keys during MCP authentication', async () => {
    apiKeyFindUniqueMock.mockResolvedValue({
      id: 'key_1',
      userId: 'auth-user-1',
      role: 'user',
      revokedAt: new Date('2026-06-02T00:00:00Z'),
      expiresAt: null,
      lastUsedAt: null,
    })

    await expect(validateApiKey('qunt_usr_revoked')).resolves.toBeNull()
    expect(apiKeyUpdateMock).not.toHaveBeenCalled()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getDatabaseUserIdMock,
  groupFindFirstMock,
  groupDeleteMock,
  accountUpdateManyMock,
  invalidateGroupRelatedCachesMock,
} = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  groupFindFirstMock: vi.fn(),
  groupDeleteMock: vi.fn(),
  accountUpdateManyMock: vi.fn(),
  invalidateGroupRelatedCachesMock: vi.fn(),
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('@/lib/cache/cache-invalidation', () => ({
  invalidateGroupRelatedCaches: invalidateGroupRelatedCachesMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findFirst: groupFindFirstMock,
      delete: groupDeleteMock,
    },
    account: {
      updateMany: accountUpdateManyMock,
    },
  },
}))

import { deleteGroupAction } from '@/server/groups'

describe('deleteGroupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Happy Path ──────────────────────────────────────────────────────

  it('nulls linked accounts, deletes the group, and invalidates caches', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue({ id: 'group-1' })
    accountUpdateManyMock.mockResolvedValue({ count: 2 })
    groupDeleteMock.mockResolvedValue({})

    await deleteGroupAction('group-1')

    // Step 1: Ownership check via findFirst with userId constraint
    expect(groupFindFirstMock).toHaveBeenCalledWith({
      where: { id: 'group-1', userId: 'db-user-1' },
      select: { id: true },
    })

    // Step 2: Unlink all accounts in the group (scoped to userId)
    expect(accountUpdateManyMock).toHaveBeenCalledWith({
      where: { groupId: 'group-1', userId: 'db-user-1' },
      data: { groupId: null },
    })

    // Step 3: Delete the group record
    expect(groupDeleteMock).toHaveBeenCalledWith({
      where: { id: 'group-1' },
    })

    // Step 4: Invalidate group-related caches
    expect(invalidateGroupRelatedCachesMock).toHaveBeenCalledWith('db-user-1')

    // Execution order: unlink accounts before deleting the group
    expect(accountUpdateManyMock.mock.invocationCallOrder[0]).toBeLessThan(
      groupDeleteMock.mock.invocationCallOrder[0],
    )
  })

  // ─── Authorization ───────────────────────────────────────────────────

  it('throws "Group not found" when group does not belong to user', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue(null)

    await expect(deleteGroupAction('group-1')).rejects.toThrow('Group not found')

    expect(accountUpdateManyMock).not.toHaveBeenCalled()
    expect(groupDeleteMock).not.toHaveBeenCalled()
    expect(invalidateGroupRelatedCachesMock).not.toHaveBeenCalled()
  })

  it('throws "Group not found" for a non-existent group ID', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue(null)

    await expect(deleteGroupAction('non-existent-id')).rejects.toThrow('Group not found')

    expect(groupFindFirstMock).toHaveBeenCalledWith({
      where: { id: 'non-existent-id', userId: 'db-user-1' },
      select: { id: true },
    })
    expect(invalidateGroupRelatedCachesMock).not.toHaveBeenCalled()
  })

  // ─── Edge Cases ──────────────────────────────────────────────────────

  it('succeeds when group has zero linked accounts', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue({ id: 'group-empty' })
    accountUpdateManyMock.mockResolvedValue({ count: 0 })
    groupDeleteMock.mockResolvedValue({})

    await deleteGroupAction('group-empty')

    // updateMany is still called even with 0 matches
    expect(accountUpdateManyMock).toHaveBeenCalledWith({
      where: { groupId: 'group-empty', userId: 'db-user-1' },
      data: { groupId: null },
    })
    expect(groupDeleteMock).toHaveBeenCalledWith({
      where: { id: 'group-empty' },
    })
    expect(invalidateGroupRelatedCachesMock).toHaveBeenCalledWith('db-user-1')
  })

  // ─── Error Propagation ───────────────────────────────────────────────

  it('propagates error when account unlinking fails', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue({ id: 'group-1' })
    accountUpdateManyMock.mockRejectedValue(new Error('Foreign key constraint'))

    await expect(deleteGroupAction('group-1')).rejects.toThrow('Foreign key constraint')

    expect(groupDeleteMock).not.toHaveBeenCalled()
    expect(invalidateGroupRelatedCachesMock).not.toHaveBeenCalled()
  })

  it('propagates error when group deletion fails', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue({ id: 'group-1' })
    accountUpdateManyMock.mockResolvedValue({ count: 1 })
    groupDeleteMock.mockRejectedValue(new Error('Database connection lost'))

    await expect(deleteGroupAction('group-1')).rejects.toThrow('Database connection lost')

    // Cache invalidation only runs after successful deletion
    expect(invalidateGroupRelatedCachesMock).not.toHaveBeenCalled()
  })

  it('does not invalidate caches on any error path', async () => {
    getDatabaseUserIdMock.mockResolvedValue('db-user-1')
    groupFindFirstMock.mockResolvedValue(null)

    await expect(deleteGroupAction('group-1')).rejects.toThrow()

    expect(invalidateGroupRelatedCachesMock).not.toHaveBeenCalled()
  })
})

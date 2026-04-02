import { beforeEach, describe, expect, it, vi } from 'vitest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    reviewModeration: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    propFirmReview: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

vi.mock('@/server/auth', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
      }),
    },
  }),
}))

import { getReviewModerationQueue, moderateReview, getFlaggedReviewCount } from '@/server/firm-reviews'

describe('firm-reviews security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getReviewModerationQueue', () => {
    it('throws 401 for unauthenticated users', async () => {
      await expect(getReviewModerationQueue()).rejects.toMatchObject({
        status: 401,
      })
    })
  })

  describe('moderateReview', () => {
    it('throws 401 for unauthenticated users', async () => {
      await expect(
        moderateReview({ moderationId: 'mod_1', action: 'upheld' })
      ).rejects.toMatchObject({
        status: 401,
      })
    })
  })

  describe('getFlaggedReviewCount', () => {
    it('throws 401 for unauthenticated users', async () => {
      await expect(getFlaggedReviewCount()).rejects.toMatchObject({
        status: 401,
      })
    })
  })
})
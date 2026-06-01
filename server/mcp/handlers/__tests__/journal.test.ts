import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createJournalEntryHandler,
  listJournalEntriesHandler,
  updateJournalEntryHandler,
  deleteJournalEntryHandler,
} from '../journal'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mood: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCtx = { userId: 'user-mcp-journal-123', authUserId: 'auth-123', role: 'user' as const, authMethod: 'apikey' as const }

describe('journal handlers (TDD - Top 15 #10#11)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('SECURITY: requireUserId - throws without ctx.userId', async () => {
    await expect(createJournalEntryHandler({} as any, { day: '2026-05-29', mood: 'HAPPY' }))
      .rejects.toThrow('Authentication required')
  })

  it('SECURITY: assertNoCrossUserAccess - rejects userId in args', async () => {
    await expect(listJournalEntriesHandler(mockCtx, { userId: 'attacker' }))
      .rejects.toThrow('Cross-user access denied')
  })

  it('listJournalEntriesHandler scopes to ctx.userId only, supports date range + pagination', async () => {
    vi.mocked(prisma.mood.findMany).mockResolvedValue([{ id: 'm1', day: new Date('2026-05-29'), mood: 'HAPPY' } as any])
    const res = await listJournalEntriesHandler(mockCtx, { startDate: '2026-05-01', limit: 10 })
    expect(prisma.mood.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ userId: 'user-mcp-journal-123' }),
      take: 10,
    }))
    expect(res[0].id).toBe('m1')
  })

  it('createJournalEntryHandler (enhanced) uses ctx only, creates or updates by day', async () => {
    vi.mocked(prisma.mood.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.mood.create).mockResolvedValue({ id: 'new1' } as any)
    const res = await createJournalEntryHandler(mockCtx, { day: '2026-05-29', mood: 'FOCUSED', emotionValue: 75, journalContent: 'Good day' })
    expect(prisma.mood.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'user-mcp-journal-123', mood: 'FOCUSED' })
    }))
    expect(res.id).toBe('new1')
  })

  it('updateJournalEntryHandler updates by day, scoped', async () => {
    vi.mocked(prisma.mood.findFirst).mockResolvedValue({ id: 'm1', userId: 'user-mcp-journal-123' } as any)
    vi.mocked(prisma.mood.update).mockResolvedValue({ id: 'm1', mood: 'UPDATED' } as any)
    const res = await updateJournalEntryHandler(mockCtx, { day: '2026-05-29', mood: 'UPDATED' })
    expect(res.mood).toBe('UPDATED')
  })

  it('deleteJournalEntryHandler deletes by day, scoped, returns success', async () => {
    vi.mocked(prisma.mood.findFirst).mockResolvedValue({ id: 'm1' } as any)
    vi.mocked(prisma.mood.delete).mockResolvedValue({} as any)
    const res = await deleteJournalEntryHandler(mockCtx, { day: '2026-05-29' })
    expect(res.success).toBe(true)
    expect(prisma.mood.delete).toHaveBeenCalledWith({ where: { id: 'm1' } })
  })
})

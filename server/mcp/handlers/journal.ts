import { prisma } from '@/lib/prisma'
import type { AccountHealthContext } from './account'

export async function createJournalEntryHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const day = typeof args.day === 'string' && args.day ? new Date(args.day) : null
  if (!day || isNaN(day.getTime())) throw new Error('Missing or invalid required parameter: day')
  const mood = typeof args.mood === 'string' && args.mood ? args.mood : null
  if (!mood) throw new Error('Missing required parameter: mood')

  const emotionValue = typeof args.emotionValue === 'number' ? Math.min(100, Math.max(0, Math.floor(args.emotionValue))) : 50
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : ''

  const existing = await prisma.mood.findUnique({ where: { userId_day: { userId: ctx.userId, day } } })
  if (existing) {
    return prisma.mood.update({
      where: { id: existing.id },
      data: { mood, emotionValue, journalContent: journalContent || existing.journalContent },
    })
  }
  return prisma.mood.create({ data: { userId: ctx.userId, day, mood, emotionValue, journalContent } })
}

// Stubs for brutal_journal_audit, generate_daily_briefing — extraction in progress

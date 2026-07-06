/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import { prisma } from '@/lib/prisma'
import type { McpAuthContext } from '../../mcp-auth'
import { requireUserId, assertNoCrossUserAccess } from '../security'

export async function createJournalEntryHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const day = typeof args.day === 'string' && args.day ? new Date(args.day) : null
  if (!day || isNaN(day.getTime())) throw new Error('Missing or invalid required parameter: day')
  const mood = typeof args.mood === 'string' && args.mood ? args.mood : null
  if (!mood) throw new Error('Missing required parameter: mood')

  const emotionValue = typeof args.emotionValue === 'number' ? Math.min(100, Math.max(0, Math.floor(args.emotionValue))) : 50
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : ''

  const existing = await prisma.mood.findUnique({ where: { userId_day: { userId, day } } })
  if (existing) {
    return prisma.mood.update({
      where: { id: existing.id },
      data: { mood, emotionValue, journalContent: journalContent || existing.journalContent },
    })
  }
  return prisma.mood.create({ data: { userId, day, mood, emotionValue, journalContent } })
}

export async function listJournalEntriesHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200)
  const offset = Math.max(Number(args.offset) || 0, 0)
  const where: any = { userId }
  if (args.startDate) where.day = { ...(where.day || {}), gte: new Date(args.startDate as string) }
  if (args.endDate) where.day = { ...(where.day || {}), lte: new Date(args.endDate as string) }
  return prisma.mood.findMany({
    where,
    orderBy: { day: 'desc' },
    take: limit,
    skip: offset,
    select: { id: true, day: true, mood: true, emotionValue: true, journalContent: true, selectedNews: true, createdAt: true, updatedAt: true },
  })
}

export async function updateJournalEntryHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const dayStr = typeof args.day === 'string' ? args.day : null
  if (!dayStr) throw new Error('day (ISO date) is required to identify entry')
  const day = new Date(dayStr)
  if (isNaN(day.getTime())) throw new Error('Invalid day format')
  const existing = await prisma.mood.findFirst({
    where: { userId, day: { gte: day, lt: new Date(day.getTime() + 86400000) } },
  })
  if (!existing) throw new Error('Journal entry not found for that day')
  const mood = typeof args.mood === 'string' ? args.mood : existing.mood
  const emotionValue = typeof args.emotionValue === 'number' ? Math.min(100, Math.max(0, Math.floor(args.emotionValue))) : existing.emotionValue
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : existing.journalContent
  return prisma.mood.update({
    where: { id: existing.id },
    data: { mood, emotionValue, journalContent, updatedAt: new Date() },
  })
}

export async function deleteJournalEntryHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)
  const dayStr = typeof args.day === 'string' ? args.day : null
  if (!dayStr) throw new Error('day (ISO date) is required')
  const day = new Date(dayStr)
  if (isNaN(day.getTime())) throw new Error('Invalid day')
  const existing = await prisma.mood.findFirst({
    where: { userId, day: { gte: day, lt: new Date(day.getTime() + 86400000) } },
  })
  if (!existing) return { success: false, message: 'No entry for that day' }
  await prisma.mood.delete({ where: { id: existing.id } })
  return { success: true, deletedId: existing.id }
}

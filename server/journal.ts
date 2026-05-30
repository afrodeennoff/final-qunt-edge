'use server'

import { prisma } from '@/lib/prisma'
import { Prisma, Mood } from '@/prisma/generated/prisma';
import { cacheLife, cacheTag } from 'next/cache'
import { getDatabaseUserId } from './auth';
import { CACHE_TAGS, invalidateJournalRelatedCaches } from '@/lib/cache/cache-invalidation';
import { isStoredChatConversationExpired, readStoredChatConversation } from '@/lib/chat-retention';

const JOURNAL_CACHE_LIFETIME = { stale: 300, revalidate: 300, expire: 1_800 } as const

export type Conversation = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type MindsetData = {
  emotionValue: number;
  selectedNews: string[];
  journalContent: string;
};

export async function saveMindset(
  data: MindsetData,
  date?: string
) {
  try {
    const userId = await getDatabaseUserId()

    // Convert date string to Date at midday UTC
    let today: Date
    if (date) {
      today = new Date(date + 'T12:00:00Z')
    } else {
      const now = new Date()
      today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))
    }
    const now = new Date()

    // Get the mood label based on emotion value
    const getMoodLabel = (value: number) => {
      if (value < 20) return 'VERY_SAD'
      if (value < 40) return 'SAD'
      if (value < 60) return 'NEUTRAL'
      if (value < 80) return 'HAPPY'
      return 'VERY_HAPPY'
    }

    // Check if mood already exists for today
    const existingMood = await prisma.mood.findFirst({
      where: {
        userId: userId,
        day: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    })

    if (existingMood) {
      // Update existing mood
      const updatedMood = await prisma.mood.update({
        where: { id: existingMood.id },
        data: {
          emotionValue: data.emotionValue,
          selectedNews: data.selectedNews,
          journalContent: data.journalContent,
          mood: getMoodLabel(data.emotionValue),
          updatedAt: now,
        },
      })
      invalidateJournalRelatedCaches(userId)
      return updatedMood
    }

    // Create new mood
    const newMood = await prisma.mood.create({
      data: {
        userId: userId,
        day: today,
        emotionValue: data.emotionValue,
        selectedNews: data.selectedNews,
        journalContent: data.journalContent,
        mood: getMoodLabel(data.emotionValue),
      },
    })

    invalidateJournalRelatedCaches(userId)
    return newMood
  } catch (error) {
    console.error('Error saving mindset:', error)
    throw error
  }
}

export async function saveMood(
  mood: 'bad' | 'okay' | 'great',
  conversation?: Conversation[],
  date?: string
) {
  try {
    const userId = await getDatabaseUserId()
    // Convert date string to Date at midday UTC
    let today: Date
    if (date) {
      today = new Date(date + 'T12:00:00Z')
    } else {
      const now = new Date()
      today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))
    }
    const now = new Date()

    // Check if mood already exists for today
    const existingMood = await prisma.mood.findFirst({
      where: {
        userId: userId,
        day: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    })

    if (existingMood) {
      // Update existing mood
      const updatedMood = await prisma.mood.update({
        where: { id: existingMood.id },
        data: {
          mood,
          conversation: conversation ? JSON.stringify(conversation) : undefined,
          updatedAt: now,
        },
      })
      invalidateJournalRelatedCaches(userId)
      return updatedMood
    }

    // Create new mood
    const newMood = await prisma.mood.create({
      data: {
        userId: userId,
        day: today,
        mood,
        conversation: conversation ? JSON.stringify(conversation) : undefined,
      },
    })

    invalidateJournalRelatedCaches(userId)
    return newMood
  } catch (error) {
    console.error('Error saving mood:', error)
    throw error
  }
}

async function _getMoodForDay(userId: string, date: string) {
  // Convert date string to Date at midday UTC
  const targetDate = new Date(date + 'T12:00:00Z')
  const nextDay = new Date(targetDate)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)

  const mood = await prisma.mood.findFirst({
    where: {
      userId: userId,
      day: {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate()),
      },
    },
  })

  return (mood
    ? {
        ...mood,
        conversation: mood.conversation
          ? readStoredChatConversation(mood.conversation)
          : null,
      }
    : null) as Mood | null
}

async function _getMoodForDayCached(userId: string, date: string) {
  'use cache'
  cacheLife(JOURNAL_CACHE_LIFETIME)
  cacheTag(CACHE_TAGS.MOOD(userId))
  return _getMoodForDay(userId, date)
}

export async function getMoodForDay(date: string) {
  try {
    const userId = await getDatabaseUserId()
    return _getMoodForDayCached(userId, date)
  } catch (error) {
    console.error('Error getting mood:', error)
    throw error
  }
}

async function _getMoodHistory(userId: string, fromDate?: Date, toDate?: Date): Promise<Mood[]> {
  const moods = await prisma.mood.findMany({
    where: {
      userId: userId,
      day: fromDate ? {
        gte: fromDate,
        lt: toDate ? toDate : undefined,
      } : undefined,
    },
    orderBy: {
      day: 'desc',
    },
  })

  return moods.map((mood) => ({
    ...mood,
    conversation: mood.conversation
      ? readStoredChatConversation(mood.conversation)
      : null,
  })) as Mood[]
}

async function _getMoodHistoryCached(userId: string, fromDate?: Date, toDate?: Date): Promise<Mood[]> {
  'use cache'
  cacheLife(JOURNAL_CACHE_LIFETIME)
  cacheTag(CACHE_TAGS.MOOD(userId))
  return _getMoodHistory(userId, fromDate, toDate)
}

export async function cleanupExpiredChatConversations(now: Date = new Date()) {
  const moods = await prisma.mood.findMany({
    where: {
      conversation: { not: Prisma.DbNull },
    },
    select: {
      id: true,
      userId: true,
      conversation: true,
    },
    take: 500,
  })

  let cleaned = 0
  const batchUpdateIds: string[] = []

  for (const mood of moods) {
    if (!mood.conversation || !isStoredChatConversationExpired(mood.conversation, now)) {
      continue
    }
    batchUpdateIds.push(mood.id)
    invalidateJournalRelatedCaches(mood.userId)
    cleaned += 1
  }

  if (batchUpdateIds.length > 0) {
    await prisma.mood.updateMany({
      where: { id: { in: batchUpdateIds } },
      data: { conversation: Prisma.JsonNull },
    })
  }

  return { scanned: moods.length, cleaned }
}

export async function getMoodHistory(fromDate?: Date, toDate?: Date): Promise<Mood[]> {
  const userId = await getDatabaseUserId()
  try {
    return _getMoodHistoryCached(userId, fromDate, toDate)
  } catch (error) {
    console.error('Error getting mood history:', error)
    throw error
  }
}

export async function deleteMindset(date: string) {
  try {
    const userId = await getDatabaseUserId()

    // Convert date string to Date at midday UTC
    const targetDate = new Date(date + 'T12:00:00Z')
    const nextDay = new Date(targetDate)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)

    const existingMood = await prisma.mood.findFirst({
      where: {
        userId: userId,
        day: {
          gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          lt: new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate()),
        },
      },
    })

    if (existingMood) {
      await prisma.mood.delete({
        where: { id: existingMood.id },
      })

      invalidateJournalRelatedCaches(userId)
    }
  } catch (error) {
    console.error('Error deleting mood:', error)
    throw error
  }
}

export async function saveJournal(
  journalContent: string,
  date?: string
) {
  try {
    const userId = await getDatabaseUserId()

    // Convert date string to Date at midday UTC
    let today: Date
    if (date) {
      today = new Date(date + 'T12:00:00Z')
    } else {
      const now = new Date()
      today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12))
    }
    const now = new Date()

    // Check if mood already exists for today
    const existingMood = await prisma.mood.findFirst({
      where: {
        userId: userId,
        day: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    })

    if (existingMood) {
      // Update existing mood with only journal content
      const updatedMood = await prisma.mood.update({
        where: { id: existingMood.id },
        data: {
          journalContent,
          updatedAt: now,
        },
      })
      invalidateJournalRelatedCaches(userId)
      return updatedMood
    }

    // Create new mood with only journal content
    const newMood = await prisma.mood.create({
      data: {
        userId: userId,
        day: today,
        journalContent,
        mood: 'NEUTRAL', // Default mood
        emotionValue: 50, // Default emotion value
      },
    })

    invalidateJournalRelatedCaches(userId)
    return newMood
  } catch (error) {
    console.error('Error saving journal:', error)
    throw error
  }
}

// ---------------------------------------------------------------------------
// Journal Trades — reliable server action (not REST API)
// ---------------------------------------------------------------------------

function serializeDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) return nested.toString()
      if (nested instanceof Date) return nested.toISOString()
      return nested
    }),
  ) as T
}

export interface JournalTradesFilters {
  status?: string
  search?: string
  instrument?: string
  direction?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  sort?: string
}

export interface JournalTradesResult {
  entries: Array<{
    trade: Record<string, unknown>
    journal: Record<string, unknown> | null
  }>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getJournalTradesAction(
  page: number = 1,
  pageSize: number = 30,
  filters?: JournalTradesFilters,
): Promise<JournalTradesResult> {
  const userId = await getDatabaseUserId()

  const status = filters?.status || undefined
  const search = filters?.search || undefined
  const instrument = filters?.instrument || undefined
  const direction = filters?.direction || undefined
  const dateFrom = filters?.dateFrom || undefined
  const dateTo = filters?.dateTo || undefined
  const tags = filters?.tags?.filter(Boolean) || undefined
  const sort = filters?.sort || 'date-desc'

  const where: Prisma.TradeWhereInput = { userId }

  if (status === 'journaled') where.journal = { isNot: null }
  else if (status === 'not-journaled') where.journal = { is: null }
  if (instrument) where.instrument = instrument
  if (direction) where.side = direction
  if (dateFrom || dateTo) {
    where.entryDate = {}
    if (dateFrom) (where.entryDate as Prisma.DateTimeFilter).gte = new Date(dateFrom)
    if (dateTo) (where.entryDate as Prisma.DateTimeFilter).lte = new Date(dateTo)
  }
  if (tags && tags.length > 0) {
    where.journal = {
      ...((where.journal as any) || {}),
      customTags: { hasEvery: tags },
    }
  }
  if (search) {
    where.OR = [
      { instrument: { contains: search, mode: 'insensitive' } },
      { journal: { preTradeNotes: { contains: search, mode: 'insensitive' } } },
      { journal: { postTradeReview: { contains: search, mode: 'insensitive' } } },
      { journal: { emotions: { contains: search, mode: 'insensitive' } } },
      { journal: { customTags: { has: search } } },
    ]
  }

  let orderBy: Prisma.TradeOrderByWithRelationInput = { entryDate: 'desc' }
  if (sort === 'date-asc') orderBy = { entryDate: 'asc' }
  else if (sort === 'pnl-desc') orderBy = { pnl: 'desc' }
  else if (sort === 'pnl-asc') orderBy = { pnl: 'asc' }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: { journal: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: Math.min(pageSize, 200),
    }),
    prisma.trade.count({ where }),
  ])

  const entries = trades.map(trade => ({
    trade: serializeDecimals(trade),
    journal: trade.journal ? serializeDecimals(trade.journal) : null,
  }))

  return { entries, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
} 

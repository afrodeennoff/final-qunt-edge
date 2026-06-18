'use server'

import { prisma } from '@/lib/prisma'
import { Prisma, Mood } from '@/prisma/generated/prisma';
import { cacheLife, cacheTag } from 'next/cache'
import { getDatabaseUserId } from './auth';
import { CACHE_TAGS, invalidateJournalRelatedCaches } from '@/lib/cache/cache-invalidation';
import { isStoredChatConversationExpired, readStoredChatConversation } from '@/lib/chat-retention';
import { logger } from '@/lib/logger'

const JOURNAL_CACHE_LIFETIME = { stale: 300, revalidate: 300, expire: 1_800 } as const

export type Conversation = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type MindsetData = {
  emotionValue: number;
  selectedNews: string[];
  journalContent: string;
  screenshots?: string[];
  customTags?: string[];
};

/**
 * Rich daily reflection / journal entry data (used by the advanced daily journal view).
 * Extends the classic mindset with attachments and structured tags.
 */
export type DailyJournalData = {
  emotionValue?: number;
  journalContent?: string;
  selectedNews?: string[];
  screenshots?: string[];
  customTags?: string[];
  // Future: separate structured fields (Mental State, Daily Goals, Market Bias, Rate Your Day)
  // can be stored inside journalContent (rich text) or as dedicated JSON if needed.
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
          screenshots: data.screenshots ?? [],
          customTags: data.customTags ?? [],
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
        screenshots: data.screenshots ?? [],
        customTags: data.customTags ?? [],
      },
    })

    invalidateJournalRelatedCaches(userId)
    return newMood
  } catch (error) {
    logger.error('Error saving mindset:', { error: error instanceof Error ? error.message : String(error) })
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
    logger.error('Error saving mood:', { error: error instanceof Error ? error.message : String(error) })
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
    logger.error('Error getting mood:', { error: error instanceof Error ? error.message : String(error) })
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
    take: 730,
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
    logger.error('Error getting mood history:', { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

/**
 * AI-safe version: fetch mood/journal history for a specific userId without relying on request auth context.
 * Use this from AI tool executes and MCP handlers.
 */
export async function getMoodHistoryForUser(userId: string, fromDate?: Date, toDate?: Date): Promise<Mood[]> {
  try {
    const logger = (await import('@/lib/logger')).createLogger('ai-journal')
    logger.info('AI journal history fetch', { userId, fromDate, toDate })
    return _getMoodHistoryCached(userId, fromDate, toDate)
  } catch (error) {
    logger.error('Error getting mood history for user:', { error: error instanceof Error ? error.message : String(error) })
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
    logger.error('Error deleting mood:', { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

export async function saveJournal(
  journalContent: string,
  dateOrOptions?: string | { date?: string; screenshots?: string[]; customTags?: string[] }
) {
  const date = typeof dateOrOptions === 'string' ? dateOrOptions : dateOrOptions?.date;
  const screenshots = typeof dateOrOptions === 'object' ? (dateOrOptions.screenshots ?? []) : [];
  const customTags = typeof dateOrOptions === 'object' ? (dateOrOptions.customTags ?? []) : [];
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
      // Update existing mood with journal content + optional daily reflection attachments/tags
      const updatedMood = await prisma.mood.update({
        where: { id: existingMood.id },
        data: {
          journalContent,
          screenshots: screenshots.length ? screenshots : undefined,
          customTags: customTags.length ? customTags : undefined,
          updatedAt: now,
        },
      })
      invalidateJournalRelatedCaches(userId)
      return updatedMood
    }

    // Create new mood with journal content + optional daily reflection attachments/tags
    const newMood = await prisma.mood.create({
      data: {
        userId: userId,
        day: today,
        journalContent,
        mood: 'NEUTRAL', // Default mood
        emotionValue: 50, // Default emotion value
        screenshots,
        customTags,
      },
    })

    invalidateJournalRelatedCaches(userId)
    return newMood
  } catch (error) {
    logger.error('Error saving journal:', { error: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

// ---------------------------------------------------------------------------
// Journal Trades — reliable server action (not REST API)
// ---------------------------------------------------------------------------

/**
 * Converts Prisma results into plain JSON-safe objects.
 * Prisma Decimal fields are converted to **numbers** so that client-side
 * code can use numeric operations (`.toFixed()`, comparisons, etc.)
 * without an extra parsing step.
 */
function serializeDecimals<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, nested) => {
      if (nested instanceof Prisma.Decimal) return nested.toNumber()
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
  accountNumber?: string
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
  // SECURITY: userId MUST come from the session, never from a client argument.
  // The previous signature accepted an `inputUserId` param that bypassed session
  // resolution and allowed cross-user reads of trades + journal entries.
  const userId = await getDatabaseUserId().catch(() => null)
  if (!userId) {
    return { entries: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const status = filters?.status || undefined
  const search = filters?.search || undefined
  const instrument = filters?.instrument || undefined
  const direction = filters?.direction || undefined
  const dateFrom = filters?.dateFrom || undefined
  const dateTo = filters?.dateTo || undefined
  const tags = filters?.tags?.filter(Boolean) || undefined
  const sort = filters?.sort || 'date-desc'
  const accountNumber = filters?.accountNumber || undefined

  const where: Prisma.TradeWhereInput = { userId }
  if (accountNumber) where.accountNumber = accountNumber

  // Build journal filter incrementally so status + tags are AND-ed correctly.
  const journalFilter: Record<string, unknown> = {}
  if (status === 'journaled') journalFilter.isNot = null
  else if (status === 'not-journaled') journalFilter.is = null
  if (tags && tags.length > 0) {
    journalFilter.customTags = { hasEvery: tags }
  }
  if (Object.keys(journalFilter).length > 0) {
    // When status was set we need to flip the semantics:
    // `isNot: null` means "journal exists", but spreading it into the relation
    // filter requires the Prisma compound form: { NOT: [{ journal: null }] }.
    // Simplification: just set `where.journal` directly.
    if (journalFilter.isNot !== undefined) {
      // journaled — journal must exist (and optionally have specific tags)
      const { isNot: _isNot, ...rest } = journalFilter
      where.journal = Object.keys(rest).length > 0 ? rest : { isNot: null }
    } else if (journalFilter.is !== undefined) {
      // not-journaled — journal must not exist; tags filter is contradictory here
      where.journal = { is: null }
    } else {
      // only tags filter, no status filter
      where.journal = journalFilter
    }
  }

  if (instrument) where.instrument = instrument
  if (direction) where.side = direction
  if (dateFrom || dateTo) {
    where.entryDate = {}
    if (dateFrom) (where.entryDate as Prisma.DateTimeFilter).gte = new Date(dateFrom)
    if (dateTo) (where.entryDate as Prisma.DateTimeFilter).lte = new Date(dateTo)
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

// ── Journal Tag Defaults ──

export interface JournalTagDefaults {
  sessions: string[]
  timeframes: string[]
  ictConcepts: string[]
}

const DEFAULT_TAG_DEFAULTS: JournalTagDefaults = {
  sessions: ['London', 'NY', 'Asia'],
  timeframes: ['5m', '15m', '30m', '1H', '4H', 'Daily'],
  ictConcepts: ['OB', 'FVG', 'Liq Sweep', 'Breaker', 'MSS', 'ChoCh'],
}

export async function getJournalTagDefaults(): Promise<JournalTagDefaults> {
  const userId = await getDatabaseUserId().catch(() => null)
  if (!userId) return DEFAULT_TAG_DEFAULTS
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { journalTagDefaults: true } })
  if (!user?.journalTagDefaults || user.journalTagDefaults === '{}') return DEFAULT_TAG_DEFAULTS
  try {
    const parsed = JSON.parse(JSON.stringify(user.journalTagDefaults)) as Partial<JournalTagDefaults>
    return {
      sessions: parsed.sessions ?? DEFAULT_TAG_DEFAULTS.sessions,
      timeframes: parsed.timeframes ?? DEFAULT_TAG_DEFAULTS.timeframes,
      ictConcepts: parsed.ictConcepts ?? DEFAULT_TAG_DEFAULTS.ictConcepts,
    }
  } catch {
    return DEFAULT_TAG_DEFAULTS
  }
}

export async function saveJournalTagDefaults(defaults: JournalTagDefaults): Promise<void> {
  const userId = await getDatabaseUserId()
  await prisma.user.update({ where: { id: userId }, data: { journalTagDefaults: defaults as any } })
}

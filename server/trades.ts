'use server'

import { Trade as PrismaTrade, Prisma } from '@/prisma/generated/prisma'
import { Trade as NormalizedTrade } from '@/lib/data-types'
import { cacheLife, cacheTag, updateTag } from 'next/cache'
import { getDatabaseUserId, getUserId } from './auth'
import { isAfter } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { formatTimestamp, isChronologicalRange, normalizeToUtcTimestamp } from '@/lib/date-utils'
import { v5 as uuidv5 } from 'uuid'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { invalidateCacheNamespace } from '@/lib/redis-client'
import { invalidateTradeDataCaches } from '@/lib/cache/cache-invalidation'

const TRADE_PAGE_CACHE_LIFETIME = {
  stale: 3_600,
  revalidate: 3_600,
  expire: 7_200,
} as const

const importTradeSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  side: z.string().optional(),
  quantity: z.union([z.string(), z.number()]).transform(v => v.toString()),
  entryPrice: z.union([z.string(), z.number()]).transform(v => v.toString()),
  closePrice: z.union([z.string(), z.number()]).transform(v => v.toString()),
  pnl: z.union([z.string(), z.number()]).transform(v => v.toString()),
  commission: z.union([z.string(), z.number()]).default('0').transform(v => v.toString()),
  entryDate: z.string().transform((value, ctx) => {
    try {
      return normalizeToUtcTimestamp(value)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid entry date' })
      return z.NEVER
    }
  }),
  closeDate: z.string().transform((value, ctx) => {
    try {
      return normalizeToUtcTimestamp(value)
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid close date' })
      return z.NEVER
    }
  }),
  timeInPosition: z.union([z.string(), z.number()]).optional().transform(v => v?.toString()),
  entryId: z.string().optional(),
  closeId: z.string().optional(),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
  groupId: z.string().nullish(),
}).refine((trade) => isChronologicalRange(trade.entryDate, trade.closeDate), {
  path: ['closeDate'],
  message: 'Close date must be equal to or later than entry date',
})

type TradeError =
  | 'DUPLICATE_TRADES'
  | 'NO_TRADES_ADDED'
  | 'DATABASE_ERROR'
  | 'INVALID_DATA'

interface TradeResponse {
  error: TradeError | false
  numberOfTradesAdded: number
  details?: unknown
}

export type SerializedTrade = Omit<PrismaTrade, 'entryPrice' | 'closePrice' | 'pnl' | 'commission' | 'quantity' | 'timeInPosition' | 'entryDate' | 'closeDate'> & {
  entryPrice: string
  closePrice: string
  pnl: string
  commission: string
  quantity: string
  timeInPosition: string
  entryDate: string
  closeDate: string | null
}

export interface PaginatedTrades {
  trades: SerializedTrade[]
  metadata: {
    total: number
    page: number
    totalPages: number
    hasMore: boolean
  }
}

type SerializableTrade = Partial<PrismaTrade> & {
  entryPrice?: { toString: () => string } | string | number
  closePrice?: { toString: () => string } | string | number
  pnl?: { toString: () => string } | string | number
  commission?: { toString: () => string } | string | number
  quantity?: { toString: () => string } | string | number
  timeInPosition?: { toString: () => string } | string | number
  entryDate?: Date | string
  closeDate?: Date | string | null
}

function serializeTrade(trade: SerializableTrade): SerializedTrade {
  const entryDate = trade.entryDate
    ? (trade.entryDate instanceof Date ? trade.entryDate.toISOString() : new Date(trade.entryDate).toISOString())
    : new Date(0).toISOString()

  const closeDate = trade.closeDate
    ? (trade.closeDate instanceof Date ? trade.closeDate.toISOString() : new Date(trade.closeDate).toISOString())
    : null

  return {
    ...trade,
    entryPrice: trade.entryPrice?.toString() || "0",
    closePrice: trade.closePrice?.toString() || "0",
    pnl: trade.pnl?.toString() || "0",
    commission: trade.commission?.toString() || "0",
    quantity: trade.quantity?.toString() || "0",
    timeInPosition: trade.timeInPosition?.toString() || "0",
    entryDate,
    closeDate,
  } as SerializedTrade
}

export async function revalidateCache(tags: string[]) {
  logger.info(`[revalidateCache] Starting cache invalidation`, { tags })
  await Promise.all(
    tags.map(async (tag) => {
      try {
        await updateTag(tag)
      } catch (error) {
        logger.error(`[revalidateCache] Error revalidating tag ${tag}`, { error })
      }
    })
  )
}

export async function invalidateTradeRelatedCaches(userId: string): Promise<void> {
  invalidateTradeDataCaches(userId)
  await Promise.all([
    invalidateCacheNamespace('ai-trades'),
    invalidateCacheNamespace('behavior-insights'),
  ])
}

const TRADE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

export async function resolveWritableUserId(rawUserId: string): Promise<string> {
  const byId = await prisma.user.findUnique({
    where: { id: rawUserId },
    select: { id: true },
  })

  const byAuthId = await prisma.user.findUnique({
    where: { auth_user_id: rawUserId },
    select: { id: true },
  })
  if (byAuthId?.id && byAuthId.id !== rawUserId) {
    logger.warn('[resolveWritableUserId] Divergent auth mapping detected; using auth_user_id row', {
      rawUserId,
      resolvedUserId: byAuthId.id,
    })
    return byAuthId.id
  }

  if (byId?.id) return byId.id
  if (byAuthId?.id) return byAuthId.id

  throw new Error('Unable to resolve writable user')
}

/**
 * TradeUUIDSource defines the minimum set of fields required to generate a unique
 * trade identifier.
 *
 * Why entryId/closeId are optional:
 * - Not all broker APIs provide entry/close IDs. Some exports (CSV, manual entry) only
 *   include the trade data itself without broker-assigned identifiers.
 * - When provided by the broker (Tradovate, Rithmic, MT5), these IDs offer the strongest
 *   uniqueness guarantee for duplicate detection.
 * - When absent, uniqueness must be derived from the trade's data fields.
 */
type TradeUUIDSource = {
  userId?: string
  accountNumber?: string
  instrument?: string
  entryDate?: Date | string
  closeDate?: Date | string | null
  entryPrice?: { toString: () => string } | string | number
  closePrice?: { toString: () => string } | string | number
  quantity?: { toString: () => string } | string | number
  entryId?: string | null
  closeId?: string | null
  timeInPosition?: { toString: () => string } | string | number
  side?: string | null
  pnl?: { toString: () => string } | string | number
  commission?: { toString: () => string } | string | number
}

/**
 * Generates a deterministic UUID for a trade to enable reliable duplicate detection.
 *
 * Duplicate detection behavior:
 * - WITH entryId/closeId: These broker-assigned IDs provide the strongest uniqueness
 *   guarantee. When present, they dominate the UUID signature (lines 222-223) so that
 *   re-importing the exact same broker trade always produces the same UUID → deduplication
 *   works reliably.
 * - WITHOUT entryId/closeId (CSV imports, manual entry): Falls back to a composite fingerprint
 *   of userId + accountNumber + instrument + dates + prices + quantity + side + pnl +
 *   commission. Two trades with identical field values are treated as duplicates. This is
 *   intentional — it prevents accidental double-import of the same CSV row. To force a unique
 *   UUID when broker IDs are absent, at least one distinguishing field must differ.
 */
function generateTradeUUID(trade: TradeUUIDSource): string {
  const tradeSignature = [
    trade.userId || '',
    trade.accountNumber || '',
    trade.instrument || '',
    trade.entryDate instanceof Date ? trade.entryDate.toISOString() : (trade.entryDate || ''),
    trade.closeDate instanceof Date ? trade.closeDate.toISOString() : (trade.closeDate || ''),
    trade.entryPrice?.toString() || '',
    trade.closePrice?.toString() || '',
    (trade.quantity || 0).toString(),
    trade.entryId || '',
    trade.closeId || '',
    (trade.timeInPosition || 0).toString(),
    trade.side || '',
    trade.pnl?.toString() || '',
    trade.commission?.toString() || '',
  ].join('|')

  return uuidv5(tradeSignature, TRADE_NAMESPACE)
}

function getTradeLabel(rawTrade: unknown): string {
  if (typeof rawTrade === 'object' && rawTrade !== null && 'instrument' in rawTrade) {
    const instrument = (rawTrade as { instrument?: unknown }).instrument
    if (typeof instrument === 'string' && instrument.trim()) {
      return instrument
    }
  }

  return 'unknown'
}

async function saveTradesForResolvedUser(
  data: unknown[],
  userId: string,
  rawUserId: string
): Promise<TradeResponse> {
  logger.info(`[saveTrades] Saving trades`, { count: data.length, userId, rawUserId })

  if (!Array.isArray(data) || data.length === 0) {
    return { error: 'INVALID_DATA', numberOfTradesAdded: 0, details: 'No trades provided' }
  }

  try {
    const now = new Date()
    const userAssignedTrades: Prisma.TradeCreateManyInput[] = []
    const validationErrors: string[] = []

    for (const rawTrade of data) {
      const validation = importTradeSchema.safeParse(rawTrade)

      if (!validation.success) {
        validationErrors.push(`Validation failed for trade ${getTradeLabel(rawTrade)}: ${validation.error.message}`)
        continue
      }

      const trade = validation.data

      if (isAfter(new Date(trade.entryDate), now)) {
        validationErrors.push(`Trade ${trade.instrument} has a future entry date`)
        continue
      }
      if (isAfter(new Date(trade.closeDate), now)) {
        validationErrors.push(`Trade ${trade.instrument} has a future close date`)
        continue
      }

      userAssignedTrades.push({
        ...trade,
        userId: userId,
        accountNumber: trade.accountNumber.trim(),
        entryPrice: new Prisma.Decimal(trade.entryPrice),
        closePrice: new Prisma.Decimal(trade.closePrice),
        pnl: new Prisma.Decimal(trade.pnl),
        commission: new Prisma.Decimal(trade.commission || '0'),
        quantity: new Prisma.Decimal(trade.quantity),
        timeInPosition: new Prisma.Decimal(trade.timeInPosition || '0'),
        entryDate: new Date(trade.entryDate),
        closeDate: new Date(trade.closeDate),
        id: generateTradeUUID({ ...trade, userId: userId }),
      })
    }

    if (validationErrors.length > 0 && userAssignedTrades.length === 0) {
      return {
        error: 'INVALID_DATA',
        numberOfTradesAdded: 0,
        details: validationErrors.join('; ')
      }
    }

    const missingAccountNumberTrades = userAssignedTrades.filter(
      trade => !trade.accountNumber || trade.accountNumber.length === 0
    )
    if (missingAccountNumberTrades.length > 0) {
      return {
        error: 'INVALID_DATA',
        numberOfTradesAdded: 0,
        details: 'One or more trades are missing account numbers'
      }
    }

    const uniqueAccountNumbers = Array.from(
      new Set(userAssignedTrades.map(trade => trade.accountNumber))
    )

    const result = await prisma.$transaction(async tx => {
      const existingAccounts = await tx.account.findMany({
        where: {
          userId,
          number: { in: uniqueAccountNumbers }
        },
        select: { number: true }
      })

      const existingAccountNumbers = new Set(existingAccounts.map(account => account.number))
      const missingAccountNumbers = uniqueAccountNumbers.filter(
        accountNumber => !existingAccountNumbers.has(accountNumber)
      )

      if (missingAccountNumbers.length > 0) {
        logger.info('[saveTrades] Creating missing accounts for imported trades', {
          userId,
          count: missingAccountNumbers.length
        })
        await tx.account.createMany({
          data: missingAccountNumbers.map(accountNumber => ({
            number: accountNumber,
            userId
          })),
          skipDuplicates: true
        })
      }

      const tradeResult = await tx.trade.createMany({
        data: userAssignedTrades,
        skipDuplicates: true
      })

      await updateTag(`user-data-core-${userId}`)
      await updateTag(`user-data-supplemental-${userId}`)
      await updateTag(`user-data-${userId}`)
      await Promise.all([
        updateTag(`trades-${userId}`),
        invalidateCacheNamespace('ai-trades'),
        invalidateCacheNamespace('behavior-insights'),
      ])

      return tradeResult
    })

    if (result.count === 0) {
      logger.info('[saveTrades] No trades added. Duplicate check.')
      return {
        error: 'DUPLICATE_TRADES',
        numberOfTradesAdded: 0
      }
    }

    return { error: false, numberOfTradesAdded: result.count }
  } catch (error) {
    logger.error('[saveTrades] Database error', { error })
    return {
      error: 'DATABASE_ERROR',
      numberOfTradesAdded: 0,
      details: 'Database operation failed'
    }
  }
}

export async function saveTradesAction(
  data: unknown[],
  _options?: { userId?: string }
): Promise<TradeResponse> {
  void _options
  const rawUserId = await getUserId()
  const userId = await resolveWritableUserId(rawUserId)
  return saveTradesForResolvedUser(data, userId, rawUserId)
}

export async function saveTradesForUserAction(
  data: unknown[],
  rawUserId: string
): Promise<TradeResponse> {
  const userId = await resolveWritableUserId(rawUserId)
  return saveTradesForResolvedUser(data, userId, rawUserId)
}

// Pre-computed statistics type
export interface PrecomputedStats {
  cumulativeFees: number;
  cumulativePnl: number;
  winningStreak: number;
  winRate: number;
  nbTrades: number;
  nbBe: number;
  nbWin: number;
  nbLoss: number;
  totalPositionTime: number;
  averagePositionTime: string;
  profitFactor: number;
  grossLosses: number;
  grossWin: number;
}

function computeStatsFromTrades(trades: SerializedTrade[]): PrecomputedStats {
  if (!trades.length) {
    return {
      cumulativeFees: 0,
      cumulativePnl: 0,
      winningStreak: 0,
      winRate: 0,
      nbTrades: 0,
      nbBe: 0,
      nbWin: 0,
      nbLoss: 0,
      totalPositionTime: 0,
      averagePositionTime: '0s',
      profitFactor: 1,
      grossLosses: 0,
      grossWin: 0,
    };
  }

  let cumulativeFees = 0;
  let cumulativePnl = 0;
  let grossWin = 0;
  let grossLosses = 0;
  let totalPositionTime = 0;
  let nbWin = 0;
  let nbLoss = 0;
  let nbBe = 0;
  let winningStreak = 0;
  let currentStreak = 0;

  trades.forEach((trade) => {
    const pnl = Number(trade.pnl) || 0;
    const commission = Number(trade.commission) || 0;
    const timeInPos = Number(trade.timeInPosition) || 0;

    cumulativePnl += pnl;
    cumulativeFees += commission;
    totalPositionTime += timeInPos;

    if (pnl === 0) {
      nbBe++;
      currentStreak = 0;
    } else if (pnl > 0) {
      nbWin++;
      currentStreak++;
      winningStreak = Math.max(winningStreak, currentStreak);
      grossWin += pnl;
    } else {
      nbLoss++;
      currentStreak = 0;
      grossLosses += Math.abs(pnl);
    }
  });

  const totalTrades = nbWin + nbLoss;
  const winRate = totalTrades > 0 ? (nbWin / totalTrades) * 100 : 0;
  const profitFactor = grossLosses === 0 ? (grossWin === 0 ? 1 : 100) : grossWin / grossLosses;

  const avgTime = trades.length > 0 ? totalPositionTime / trades.length : 0;
  const hours = Math.floor(avgTime / 3600);
  const minutesLeft = Math.floor((avgTime % 3600) / 60);
  const secondsLeft = Math.floor(avgTime % 60);
  const averagePositionTime = [
    hours > 0 ? `${hours}h` : '',
    `${minutesLeft}m`,
    `${secondsLeft}s`
  ].filter(Boolean).join(' ') || '0s';

  return {
    cumulativeFees,
    cumulativePnl,
    winningStreak,
    winRate,
    nbTrades: trades.length,
    nbBe,
    nbWin,
    nbLoss,
    totalPositionTime,
    averagePositionTime,
    profitFactor,
    grossLosses,
    grossWin,
  };
}

export async function getTradesAction(
  userId: string | null = null,
  page: number = 1,
  pageSize: number = 50,
  forceRefresh: boolean = false,
  includeStats: boolean = true
): Promise<PaginatedTrades & { statistics?: PrecomputedStats }> {
  const authenticatedUserId = await getDatabaseUserId()
  if (!authenticatedUserId) throw new Error('User not found')

  let currentUserId = authenticatedUserId

  if (userId) {
    const resolvedUserId = await resolveWritableUserId(userId)
    if (resolvedUserId !== authenticatedUserId) {
      throw new Error('Forbidden')
    }
    currentUserId = resolvedUserId
  }

  const tag = `trades-${currentUserId}`

  if (forceRefresh) {
    updateTag(tag)
  }

  try {
    return await (forceRefresh
      ? loadTradesPage(currentUserId, page, pageSize, includeStats)
      : getTradesPageCached(currentUserId, page, pageSize, includeStats))
  } catch (error) {
    logger.error('getTradesAction failed', { error })
    throw error
  }
}

async function loadTradesPage(
  uid: string,
  page: number,
  pageSize: number,
  computeStats: boolean
): Promise<PaginatedTrades & { statistics?: PrecomputedStats }> {
  const where: Prisma.TradeWhereInput = { userId: uid }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        accountNumber: true,
        instrument: true,
        side: true,
        quantity: true,
        entryPrice: true,
        closePrice: true,
        pnl: true,
        commission: true,
        entryDate: true,
        closeDate: true,
        timeInPosition: true,
        comment: true,
        tags: true,
        groupId: true,
        userId: true,
        videoUrl: true,
        createdAt: true,
      }
    }),
    prisma.trade.count({ where })
  ])

  const serializedTrades = trades.map(serializeTrade)
  const totalPages = Math.ceil(total / pageSize)

  const result: PaginatedTrades & { statistics?: PrecomputedStats } = {
    trades: serializedTrades,
    metadata: {
      total,
      page,
      totalPages,
      hasMore: page < totalPages
    }
  }

  // Compute stats on server for first page (most common case)
  if (computeStats && page === 1) {
    // Fetch all trades for stats calculation (cached separately)
    const allTrades = await prisma.trade.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      select: {
        pnl: true,
        commission: true,
        timeInPosition: true,
      }
    })
    result.statistics = computeStatsFromTrades(allTrades.map(serializeTrade))
  }

  return result
}

async function getTradesPageCached(
  uid: string,
  page: number,
  pageSize: number,
  computeStats: boolean
): Promise<PaginatedTrades & { statistics?: PrecomputedStats }> {
  'use cache'
  cacheLife(TRADE_PAGE_CACHE_LIFETIME)
  cacheTag(`trades-${uid}`)
  return loadTradesPage(uid, page, pageSize, computeStats)
}

export async function getTradeImagesAction(tradeId: string): Promise<{
  imageBase64: string | null;
  imageBase64Second: string | null;
} | null> {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) return null

  try {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId, userId },
      select: {
        imageBase64: true,
        imageBase64Second: true,
      }
    })
    return trade
  } catch (error) {
    logger.error('[getTradeImagesAction] Error', { error, tradeId })
    return null
  }
}

export async function updateTradesAction(tradesIds: string[], update: Partial<NormalizedTrade> & {
  entryDateOffset?: number
  closeDateOffset?: number
  instrumentTrim?: { fromStart: number; fromEnd: number }
  instrumentPrefix?: string
  instrumentSuffix?: string
}): Promise<number> {
  const TRADE_UPDATE_BATCH_SIZE = 100
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) return 0

  const {
    entryDateOffset,
    closeDateOffset,
    instrumentTrim,
    instrumentPrefix,
    instrumentSuffix,
    ...standardUpdates
  } = update

  try {
    const ownedTrades = await prisma.trade.findMany({
      where: { id: { in: tradesIds }, userId },
      select: { id: true }
    })
    if (ownedTrades.length !== tradesIds.length) {
      throw new Error('Forbidden')
    }

    if (entryDateOffset || closeDateOffset || instrumentTrim || instrumentPrefix || instrumentSuffix) {
      const trades = await prisma.trade.findMany({
        where: { id: { in: tradesIds }, userId },
        select: { id: true, entryDate: true, closeDate: true, instrument: true }
      })

      const updateOps = trades.map((trade) => {
        const data = {} as Prisma.TradeUpdateManyMutationInput

        if (entryDateOffset) {
          const d = new Date(trade.entryDate)
          d.setHours(d.getHours() + entryDateOffset)
          data.entryDate = formatTimestamp(d.toISOString())
        }
        if (closeDateOffset && trade.closeDate) {
          const d = new Date(trade.closeDate)
          d.setHours(d.getHours() + closeDateOffset)
          data.closeDate = formatTimestamp(d.toISOString())
        }

        let newInst = trade.instrument
        if (instrumentTrim) {
          newInst = newInst.substring(instrumentTrim.fromStart, newInst.length - instrumentTrim.fromEnd)
        }
        if (instrumentPrefix) newInst = instrumentPrefix + newInst
        if (instrumentSuffix) newInst = newInst + instrumentSuffix

        if (newInst !== trade.instrument) data.instrument = newInst

        if (Object.keys(data).length > 0) {
          return prisma.trade.update({ where: { id: trade.id }, data })
        }
        return null
      }).filter((op): op is ReturnType<typeof prisma.trade.update> => op !== null)

      for (let index = 0; index < updateOps.length; index += TRADE_UPDATE_BATCH_SIZE) {
        const batch = updateOps.slice(index, index + TRADE_UPDATE_BATCH_SIZE)
        await prisma.$transaction(batch)
      }
    }

    if (Object.keys(standardUpdates).length > 0) {
      const data = { ...standardUpdates } as Prisma.TradeUpdateManyMutationInput
      if (standardUpdates.entryPrice !== undefined) data.entryPrice = new Prisma.Decimal(standardUpdates.entryPrice)
      if (standardUpdates.closePrice !== undefined && standardUpdates.closePrice !== null) {
        data.closePrice = new Prisma.Decimal(standardUpdates.closePrice)
      }
      if (standardUpdates.pnl !== undefined) data.pnl = new Prisma.Decimal(standardUpdates.pnl)
      if (standardUpdates.commission !== undefined && standardUpdates.commission !== null) {
        data.commission = new Prisma.Decimal(standardUpdates.commission)
      }
      if (standardUpdates.quantity !== undefined) data.quantity = new Prisma.Decimal(standardUpdates.quantity)
      if (standardUpdates.timeInPosition !== undefined && standardUpdates.timeInPosition !== null) {
        data.timeInPosition = new Prisma.Decimal(standardUpdates.timeInPosition)
      }

      const updated = await prisma.trade.updateMany({
        where: { id: { in: tradesIds }, userId },
        data,
      })
      if (updated.count !== tradesIds.length) {
        throw new Error('Forbidden')
      }
    }

    await invalidateTradeRelatedCaches(userId)
    return ownedTrades.length
  } catch (error) {
    logger.error('[updateTrades] Error', { error })
    throw error
  }
}

export async function updateTradeCommentAction(tradeId: string, comment: string | null) {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) {
    throw new Error('User not found')
  }

  try {
    await prisma.trade.update({
      where: { id: tradeId, userId },
      data: { comment }
    })
    await invalidateTradeRelatedCaches(userId)
  } catch (error) {
    logger.error("[updateTradeComment] Error", { error })
    throw error
  }
}

export async function updateTradeVideoUrlAction(tradeId: string, videoUrl: string | null) {
  const userId = await resolveWritableUserId(await getUserId())
  if (!userId) {
    throw new Error('User not found')
  }

  try {
    await prisma.trade.update({
      where: { id: tradeId, userId },
      data: { videoUrl }
    })
    await invalidateTradeRelatedCaches(userId)
  } catch (error) {
    logger.error("[updateTradeVideoUrl] Error", { error })
    throw error
  }
}

export async function addTagToTrade(tradeId: string, tag: string) {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  try {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId, userId },
      select: { tags: true }
    })
    if (!trade) {
      throw new Error('Trade not found')
    }
    if (trade.tags.includes(tag.trim())) {
      return await prisma.trade.findUnique({ where: { id: tradeId } })
    }
    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId, userId },
      data: {
        tags: {
          push: tag.trim()
        }
      }
    })

    await invalidateTradeRelatedCaches(userId)
    return updatedTrade
  } catch (error) {
    logger.error('[trades] Failed to add tag', { error })
    throw error
  }
}

export async function removeTagFromTrade(tradeId: string, tagToRemove: string) {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  try {
    // First get current tags to filter
    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId },
      select: { tags: true }
    })

    if (!trade) {
      throw new Error('Trade not found')
    }

    // Use update instead of updateMany to return the updated record directly
    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId, userId },
      data: {
        tags: {
          set: trade.tags.filter(tag => tag !== tagToRemove)
        }
      }
    })

    await invalidateTradeRelatedCaches(userId)
    return updatedTrade
  } catch (error) {
    logger.error('[trades] Failed to remove tag', { error })
    throw error
  }
}

export async function deleteTagFromAllTrades(tag: string) {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  try {
    // Use single executeRaw to remove tag from all trades that have it
    // This eliminates the N+1 query pattern
    const result = await prisma.$executeRaw`
      UPDATE "public"."Trade" 
      SET tags = tags - ${tag}
      WHERE "userId" = ${userId} 
      AND tags @> ${JSON.stringify([tag])}
    `

    await invalidateTradeRelatedCaches(userId)
    return { success: true, tradesUpdated: Number(result) }
  } catch (error) {
    logger.error('[trades] Failed to delete tag', { error })
    throw error
  }
}

export async function updateTradeImage(
  tradeIds: string[],
  imageData: string | null,
  field: 'imageBase64' | 'imageBase64Second' = 'imageBase64'
) {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  try {
    const trades = await prisma.trade.findMany({
      where: { id: { in: tradeIds }, userId }
    })

    if (trades.length !== tradeIds.length) {
      throw new Error('Some trades not found')
    }

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: {
        [field]: imageData
      }
    })

    await invalidateTradeRelatedCaches(userId)
    return trades
  } catch (error) {
    logger.error('[trades] Failed to update trade image', { error })
    throw error
  }
}

export async function groupTradesAction(tradeIds: string[]): Promise<void> {
  const userId = await getDatabaseUserId()
  if (!userId) throw new Error('Unauthorized')
  if (!tradeIds.length) return

  const groupId = tradeIds[0]

  try {
    const owned = await prisma.trade.count({
      where: { id: { in: tradeIds }, userId },
    })
    if (owned !== tradeIds.length) throw new Error('Forbidden')

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId },
    })
    await invalidateTradeRelatedCaches(userId)
  } catch (error) {
    logger.error('[groupTrades] Error', { error })
    throw error
  }
}

export async function ungroupTradesAction(tradeIds: string[]): Promise<void> {
  const userId = await getDatabaseUserId()
  if (!userId) throw new Error('Unauthorized')
  if (!tradeIds.length) return

  try {
    const owned = await prisma.trade.count({
      where: { id: { in: tradeIds }, userId },
    })
    if (owned !== tradeIds.length) throw new Error('Forbidden')

    await prisma.trade.updateMany({
      where: { id: { in: tradeIds }, userId },
      data: { groupId: null },
    })
    await invalidateTradeRelatedCaches(userId)
  } catch (error) {
    logger.error('[ungroupTrades] Error', { error })
    throw error
  }
}

export async function addTagsToTradesForDay(date: string, tags: string[]) {
  const userId = await getDatabaseUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  try {
    const targetDate = new Date(date + 'T00:00:00Z')
    const nextDay = new Date(targetDate)
    nextDay.setUTCDate(nextDay.getUTCDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    // Use single executeRaw to add tags to all trades for the day
    // This eliminates the N+1 query pattern by using bulk array concatenation
    const result = await prisma.$executeRaw`
      UPDATE "public"."Trade" 
      SET tags = tags || ${JSON.stringify(tags)}::jsonb
      WHERE "userId" = ${userId} 
      AND (
        ("entryDate" >= ${date} AND "entryDate" < ${nextDayStr})
        OR
        ("closeDate" >= ${date} AND "closeDate" < ${nextDayStr})
      )
    `

    await invalidateTradeRelatedCaches(userId)
    return { success: true, tradesUpdated: Number(result) }
  } catch (error) {
    logger.error('[trades] Failed to add tags to trades for day', { error })
    throw error
  }
}

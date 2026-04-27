'use server'

import { formatTimestamp } from '@/lib/date-utils'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateDeterministicTradeId } from '@/lib/trade-id-utils'
import { createTradeWithDefaults } from '@/lib/trade-factory'
import type { ImportTradeDraft } from '@/lib/trade-types'
import { decryptToken, encryptToken } from '@/lib/security/token-crypto'
import { authSecurityConfig } from '@/lib/security/auth-config'
import { getDatabaseUserId, getUserId } from '@/server/auth'
import { resolveWritableUserId, saveTradesForUserAction } from '@/server/database'

interface DxFeedLoginRequest {
  login: string
  password: string
  environment: number
  version: number
  withDetails: boolean
  connectOnlyTrading: boolean
}

interface DxFeedLoginResponse {
  status: string
  token?: string
  reason?: string
  tradingWss?: string
  tradingWssEndpoint?: string
  tradingRestReportHost?: string
  tradingRestReportToken?: string
}

interface DxFeedStoredCredentials {
  accessToken: string
  historicalHost: string
  accountNumbers?: string[]
}

interface DxFeedTradingAccount {
  accountId: number
  accountReference: string | null
  accountHeader: string | null
}

interface DxFeedAccountListResponse {
  data: DxFeedTradingAccount[] | null
}

interface DxFeedContractDetail {
  symbol: string | null
  contractName: string | null
}

interface DxFeedReportTrade {
  tradeId: number
  contract: DxFeedContractDetail | null
  entryDate: number
  exitDate: number
  quantity: number
  entryPrice: number
  exitPrice: number
  grossPl: number
  netPl: number
}

interface DxFeedTradesResponse {
  data: DxFeedReportTrade[] | null
}

interface DxFeedTradesResult {
  processedTrades?: ImportTradeDraft[]
  savedCount?: number
  tradesCount?: number
  error?: string
}

export interface DxFeedSynchronizationSummary {
  id: string
  userId: string
  service: string
  accountId: string
  hasToken: boolean
  accountNumbers: string[]
  lastSyncedAt: Date
  tokenExpiresAt: Date | null
  dailySyncTime: Date | null
  createdAt: Date
  updatedAt: Date
}

const DXFEED_AUTH_URL = process.env.DXFEED_AUTH_URL
const DXFEED_PLATFORM_KEY = process.env.DXFEED_PLATFORM_KEY
const DXFEED_ENVIRONMENT = Number(
  process.env.DXFEED_ENVIRONMENT ?? (process.env.NODE_ENV === 'production' ? '0' : '1'),
)
const DXFEED_HISTORY_LOOKBACK_DAYS = Math.max(
  1,
  Number(process.env.DXFEED_HISTORY_LOOKBACK_DAYS ?? '364'),
)

function parseStoredCredentials(tokenField: string): DxFeedStoredCredentials | null {
  try {
    const parsed = JSON.parse(tokenField) as Partial<DxFeedStoredCredentials>
    if (parsed.accessToken && parsed.historicalHost) {
      return {
        accessToken: parsed.accessToken,
        historicalHost: parsed.historicalHost,
        accountNumbers: Array.isArray(parsed.accountNumbers) ? parsed.accountNumbers : [],
      }
    }
  } catch {
    return null
  }

  return null
}

function normalizeHistoricalHost(value?: string | null): string {
  if (!value) return ''

  try {
    const parsed = new URL(value)
    return `${parsed.protocol}//${parsed.host}`.replace(/\/$/, '')
  } catch {
    return value.replace(/\/$/, '')
  }
}

function parseHistoricalHostFromTradingWss(wssUrl?: string | null): string {
  if (!wssUrl) return ''

  try {
    const parsed = new URL(wssUrl)
    return `https://${parsed.hostname}`
  } catch {
    logger.warn('Failed to parse DxFeed trading websocket URL')
    return ''
  }
}

function extractArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: T[] }).data
  }
  return []
}

function extractApiErrorMessage(payload: unknown): string | null {
  if (!payload) return null

  if (Array.isArray(payload)) {
    const firstError = payload.find(
      (item): item is { message?: string } =>
        !!item && typeof item === 'object' && 'message' in item,
    )
    return firstError?.message ?? null
  }

  if (typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }

  return null
}

function extractInstrumentSymbol(contract: DxFeedReportTrade['contract']): string {
  if (!contract) return 'Unknown'

  const raw = (contract.symbol || contract.contractName || '').toUpperCase()
  const withoutExchange = raw.split(':')[0]
  const clean = withoutExchange.startsWith('/') ? withoutExchange.slice(1) : withoutExchange
  const monthCodeMatch = clean.match(/^([A-Z]+?)[FGHJKMNQUVXZ]\d+$/i)

  if (monthCodeMatch) return monthCodeMatch[1].toUpperCase()

  return clean.replace(/[^A-Z]/g, '') || 'Unknown'
}

function buildTokenFields(tokenJson: string) {
  if (!authSecurityConfig.tradovateTokenEncryptionEnabled) {
    return {
      token: tokenJson,
      tokenCiphertext: null,
      tokenIv: null,
      tokenTag: null,
      tokenKeyVersion: null,
    }
  }

  const encryptedEnvelope = encryptToken(tokenJson)
  return {
    token: null,
    tokenCiphertext: encryptedEnvelope.tokenCiphertext,
    tokenIv: encryptedEnvelope.tokenIv,
    tokenTag: encryptedEnvelope.tokenTag,
    tokenKeyVersion: encryptedEnvelope.tokenKeyVersion,
  }
}

function readStoredToken(syncData: {
  token: string | null
  tokenCiphertext: string | null
  tokenIv: string | null
  tokenTag: string | null
}): string | null {
  if (syncData.token) return syncData.token
  return decryptToken(syncData)
}

async function getWritableUserId(rawUserId?: string): Promise<string> {
  if (rawUserId) return resolveWritableUserId(rawUserId)
  return getDatabaseUserId()
}

export async function authenticateDxFeed(
  login: string,
  password: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!DXFEED_AUTH_URL || !DXFEED_PLATFORM_KEY) {
      return { error: 'DxFeed configuration not set' }
    }

    await getDatabaseUserId()

    const body: DxFeedLoginRequest = {
      login,
      password,
      environment: DXFEED_ENVIRONMENT,
      version: 3,
      withDetails: true,
      connectOnlyTrading: true,
    }

    const response = await fetch(DXFEED_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        PltfKey: DXFEED_PLATFORM_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      return { error: `Authentication failed (${response.status}): ${text || response.statusText}` }
    }

    const data = (await response.json()) as DxFeedLoginResponse
    if (data.status !== 'OK' || !data.token) {
      return { error: data.reason || 'Authentication failed' }
    }

    const historicalHost =
      normalizeHistoricalHost(data.tradingRestReportHost) ||
      parseHistoricalHostFromTradingWss(data.tradingWss || data.tradingWssEndpoint) ||
      parseHistoricalHostFromTradingWss(response.headers.get('wss'))

    const reportAccessToken = data.tradingRestReportToken || data.token
    const accounts = historicalHost ? await getDxFeedAccounts(reportAccessToken, historicalHost) : []
    const accountNumbers = accounts.map(
      (account) => account.accountHeader || account.accountReference || account.accountId.toString(),
    )

    const credentials: DxFeedStoredCredentials = {
      accessToken: reportAccessToken,
      historicalHost,
      accountNumbers,
    }

    const storeResult = await storeDxFeedToken(JSON.stringify(credentials), login)
    if (storeResult.error) return storeResult

    return { success: true }
  } catch (error) {
    logger.error('Failed to authenticate with DxFeed', { error })
    return { error: 'Failed to authenticate with DxFeed' }
  }
}

export async function getDxFeedAccounts(
  accessToken: string,
  historicalHost: string,
): Promise<DxFeedTradingAccount[]> {
  try {
    if (!historicalHost) return []

    const baseUrl = historicalHost.endsWith('/') ? historicalHost.slice(0, -1) : historicalHost
    const response = await fetch(`${baseUrl}/api/historical/TradingAccount/List`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      logger.warn('Failed to fetch DxFeed accounts', { status: response.status })
      return []
    }

    const data = (await response.json()) as DxFeedAccountListResponse | DxFeedTradingAccount[]
    return extractArrayPayload<DxFeedTradingAccount>(data)
  } catch (error) {
    logger.error('Error fetching DxFeed accounts', { error })
    return []
  }
}

function buildTradesFromDxFeedReport(
  reportTrades: DxFeedReportTrade[],
  accountLabel: string,
  userId: string,
): ImportTradeDraft[] {
  const trades: ImportTradeDraft[] = []

  for (const reportTrade of reportTrades) {
    try {
      if (reportTrade.exitDate === 0 || reportTrade.exitDate == null) continue

      const instrument = extractInstrumentSymbol(reportTrade.contract)
      const side = reportTrade.quantity > 0 ? 'Long' : 'Short'
      const quantity = Math.abs(reportTrade.quantity)
      const entryDate = new Date(reportTrade.entryDate)
      const exitDate = new Date(reportTrade.exitDate)
      const durationSeconds = Math.max(
        0,
        Math.round((exitDate.getTime() - entryDate.getTime()) / 1000),
      )
      const commission = Math.abs(reportTrade.grossPl - reportTrade.netPl)

      const tradeData = {
        accountNumber: accountLabel,
        entryId: `dxfeed_${reportTrade.tradeId}_entry`,
        closeId: `dxfeed_${reportTrade.tradeId}_exit`,
        instrument,
        entryPrice: reportTrade.entryPrice.toString(),
        closePrice: reportTrade.exitPrice.toString(),
        entryDate: formatTimestamp(entryDate.toISOString()),
        closeDate: formatTimestamp(exitDate.toISOString()),
        quantity,
        side,
        userId,
      }

      trades.push(
        createTradeWithDefaults({
          id: generateDeterministicTradeId(tradeData),
          accountNumber: accountLabel,
          entryId: `dxfeed_${reportTrade.tradeId}_entry`,
          closeId: `dxfeed_${reportTrade.tradeId}_exit`,
          instrument,
          entryPrice: reportTrade.entryPrice,
          closePrice: reportTrade.exitPrice,
          entryDate: formatTimestamp(entryDate.toISOString()),
          closeDate: formatTimestamp(exitDate.toISOString()),
          quantity,
          side,
          userId,
          pnl: reportTrade.netPl,
          timeInPosition: durationSeconds,
          commission,
          tags: ['dxfeed'],
        }),
      )
    } catch (error) {
      logger.error('Error processing DxFeed trade', { tradeId: reportTrade.tradeId, error })
    }
  }

  return trades
}

export async function getDxFeedTrades(
  initialTokenJson: string,
  options?: { userId?: string; accountId?: string },
): Promise<DxFeedTradesResult> {
  try {
    const credentials = parseStoredCredentials(initialTokenJson)
    if (!credentials) return { error: 'Invalid stored DxFeed credentials' }

    const { accessToken, historicalHost } = credentials
    if (!historicalHost) return { error: 'No historical API host found in stored credentials' }

    const rawUserId = options?.userId ?? await getUserId()
    const userId = await getWritableUserId(rawUserId)
    const accountId = options?.accountId ?? 'default'
    const baseUrl = historicalHost.endsWith('/') ? historicalHost.slice(0, -1) : historicalHost
    let storedTokenJson = initialTokenJson

    const accounts = await getDxFeedAccounts(accessToken, historicalHost)
    const accountNumbers = accounts.map(
      (account) => account.accountHeader || account.accountReference || account.accountId.toString(),
    )

    if (accountNumbers.length > 0) {
      const updatedCredentials: DxFeedStoredCredentials = { ...credentials, accountNumbers }
      storedTokenJson = JSON.stringify(updatedCredentials)
      await updateStoredCredentials(userId, accountId, storedTokenJson)
    }

    if (accounts.length === 0) {
      await updateLastSyncedAt(userId, accountId)
      return { processedTrades: [], savedCount: 0, tradesCount: 0 }
    }

    const allTrades: ImportTradeDraft[] = []
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - DXFEED_HISTORY_LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

    for (const account of accounts) {
      const accountLabel = account.accountHeader || account.accountReference || account.accountId.toString()
      const historicalAccountId = account.accountReference || account.accountId.toString()
      const tradesUrl = new URL(`${baseUrl}/api/historical/TradingAccount/Trades/${historicalAccountId}`)
      tradesUrl.searchParams.set('startDt', startDate.toISOString())
      tradesUrl.searchParams.set('endDt', endDate.toISOString())

      const response = await fetch(tradesUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        logger.warn('Failed to fetch DxFeed trades', {
          account: accountLabel,
          status: response.status,
        })
        continue
      }

      const data = (await response.json()) as
        | DxFeedTradesResponse
        | DxFeedReportTrade[]
        | Array<{ message?: string }>
      const apiError = extractApiErrorMessage(data)
      if (apiError) {
        logger.warn('DxFeed returned an account trade error', { account: accountLabel, apiError })
        continue
      }

      const reportTrades = extractArrayPayload<DxFeedReportTrade>(data)
      allTrades.push(...buildTradesFromDxFeedReport(reportTrades, accountLabel, userId))
    }

    await updateLastSyncedAt(userId, accountId)

    if (allTrades.length === 0) {
      return { processedTrades: [], savedCount: 0, tradesCount: 0 }
    }

    const saveResult = await saveTradesForUserAction(allTrades, rawUserId)
    if (saveResult.error) {
      if (saveResult.error === 'DUPLICATE_TRADES') {
        return {
          error: 'DUPLICATE_TRADES',
          processedTrades: allTrades,
          tradesCount: allTrades.length,
        }
      }

      return {
        error: `Failed to save trades: ${saveResult.error}`,
        processedTrades: allTrades,
        tradesCount: allTrades.length,
      }
    }

    return {
      processedTrades: allTrades,
      savedCount: saveResult.numberOfTradesAdded,
      tradesCount: allTrades.length,
    }
  } catch (error) {
    logger.error('Failed to get DxFeed trades', { error })
    return { error: 'Failed to get trades' }
  }
}

async function updateLastSyncedAt(userId: string, accountId: string) {
  await prisma.synchronization.updateMany({
    where: { userId, service: 'dxfeed', accountId },
    data: { lastSyncedAt: new Date() },
  })
}

async function updateStoredCredentials(userId: string, accountId: string, tokenJson: string) {
  await prisma.synchronization.updateMany({
    where: { userId, service: 'dxfeed', accountId },
    data: buildTokenFields(tokenJson),
  })
}

export async function storeDxFeedToken(tokenJson: string, accountId: string = 'default') {
  try {
    const userId = await getDatabaseUserId()
    const tokenFields = buildTokenFields(tokenJson)

    await prisma.synchronization.upsert({
      where: {
        userId_service_accountId: {
          userId,
          service: 'dxfeed',
          accountId,
        },
      },
      update: {
        ...tokenFields,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        service: 'dxfeed',
        accountId,
        ...tokenFields,
        lastSyncedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    logger.error('Failed to store DxFeed token', { error })
    return { error: 'Failed to store token' }
  }
}

export async function getDxFeedToken(accountId: string = 'default') {
  try {
    const userId = await getDatabaseUserId()
    const syncData = await prisma.synchronization.findFirst({
      where: { userId, service: 'dxfeed', accountId },
      orderBy: { updatedAt: 'desc' },
      select: {
        accountId: true,
        token: true,
        tokenCiphertext: true,
        tokenIv: true,
        tokenTag: true,
      },
    })

    if (!syncData) return { error: 'No DxFeed token found' }

    const storedTokenJson = readStoredToken(syncData)
    if (!storedTokenJson) return { error: 'No DxFeed token found' }

    return {
      storedTokenJson,
      accountId: syncData.accountId,
    }
  } catch (error) {
    logger.error('Failed to get DxFeed token', { error })
    return { error: 'Failed to get token' }
  }
}

export async function removeDxFeedToken(accountId?: string) {
  try {
    const userId = await getDatabaseUserId()
    const result = await prisma.synchronization.deleteMany({
      where: {
        userId,
        service: 'dxfeed',
        ...(accountId ? { accountId } : {}),
      },
    })

    return { success: true, deletedCount: result.count }
  } catch (error) {
    logger.error('Failed to remove DxFeed token', { error })
    return { error: 'Failed to remove token' }
  }
}

export async function getDxFeedSynchronizations(): Promise<{
  synchronizations?: DxFeedSynchronizationSummary[]
  error?: string
}> {
  try {
    const userId = await getDatabaseUserId()
    const synchronizations = await prisma.synchronization.findMany({
      where: { userId, service: 'dxfeed' },
      orderBy: { lastSyncedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        service: true,
        accountId: true,
        lastSyncedAt: true,
        tokenExpiresAt: true,
        dailySyncTime: true,
        createdAt: true,
        updatedAt: true,
        token: true,
        tokenCiphertext: true,
        tokenIv: true,
        tokenTag: true,
      },
    })

    return {
      synchronizations: synchronizations.map((sync) => {
        const storedTokenJson = readStoredToken(sync)
        const credentials = storedTokenJson ? parseStoredCredentials(storedTokenJson) : null

        return {
          id: sync.id,
          userId: sync.userId,
          service: sync.service,
          accountId: sync.accountId,
          hasToken: Boolean(storedTokenJson),
          accountNumbers: credentials?.accountNumbers ?? [],
          lastSyncedAt: sync.lastSyncedAt,
          tokenExpiresAt: sync.tokenExpiresAt,
          dailySyncTime: sync.dailySyncTime,
          createdAt: sync.createdAt,
          updatedAt: sync.updatedAt,
        }
      }),
    }
  } catch (error) {
    logger.error('Failed to get DxFeed synchronizations', { error })
    return { error: 'Failed to get synchronizations' }
  }
}

export async function updateDxFeedDailySyncTimeAction(
  accountId: string,
  utcTimeString: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getDatabaseUserId()
    await prisma.synchronization.updateMany({
      where: { userId, service: 'dxfeed', accountId },
      data: { dailySyncTime: utcTimeString ? new Date(utcTimeString) : null },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error updating DxFeed daily sync time', { error })
    return { success: false, error: 'Failed to update daily sync time' }
  }
}

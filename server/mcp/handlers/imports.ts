/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) and assertNoCrossUserAccess from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */

import { prisma } from '@/lib/prisma'
import { requireUserId } from '../security'
import type { McpAuthContext } from '../../mcp-auth'
import { parseOrders, parseInstrumentInformation } from '@/app/api/imports/ibkr/extract-orders/route'
import { matchOrdersWithFIFO } from '@/app/api/imports/ibkr/fifo-computation/route'
import { extractTextFromPdf } from '@/app/api/imports/ibkr/ocr/route'
import { orderSchema, tradeSchema } from '@/app/api/imports/ibkr/fifo-computation/schema'
import type { FinancialInstrument } from '@/app/api/imports/ibkr/extract-orders/schema'
import { saveTradesForUserAction } from '@/server/database'
import { createTradeWithDefaults } from '@/lib/trade-factory'
import { getTradovateToken, getTradovateTrades } from '@/server/imports/tradovate-actions'

export async function extractIbkrOrdersHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const text = typeof args.text === 'string' ? args.text : ''
  if (!text) throw new Error('text (extracted PDF text) is required')
  const orders = parseOrders(text)
  const instruments = parseInstrumentInformation(text)
  const validOrders = orders.filter(order => {
    try {
      orderSchema.parse(order)
      return true
    } catch {
      return false
    }
  })
  return { orders: validOrders, instruments, userId }
}

export async function computeIbkrFifoHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const orders = Array.isArray(args.orders) ? args.orders : []
  const instruments: FinancialInstrument[] = Array.isArray(args.instruments) ? args.instruments : []
  if (orders.length === 0) throw new Error('orders array required')
  const trades = matchOrdersWithFIFO(orders, instruments)
  const validTrades = trades.filter((trade: any) => {
    try {
      tradeSchema.parse(trade)
      return true
    } catch {
      return false
    }
  })
  return { trades: validTrades, count: validTrades.length, userId }
}

export async function importIbkrPdfHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const accountNumber = typeof args.accountNumber === 'string' ? args.accountNumber.trim() : null
  const pdfBase64 = typeof args.pdfBase64 === 'string' ? args.pdfBase64 : null
  if (!accountNumber) throw new Error('accountNumber is required')
  if (!pdfBase64) throw new Error('pdfBase64 (base64 encoded PDF content) is required')

  // Strict scoping: verify account owned by ctx userId only
  const account = await prisma.account.findFirst({
    where: { number: accountNumber, userId },
    select: { number: true },
  })
  if (!account) throw new Error('Account not found')

  // 1. Extract text (wrap OCR)
  const pdfBuffer = Buffer.from(pdfBase64, 'base64')
  const extractedText = await extractTextFromPdf(pdfBuffer)
  if (!extractedText || extractedText.length < 50 || extractedText.includes('failed')) {
    throw new Error('PDF text extraction failed')
  }

  // 2. Extract orders + instruments (wrap)
  const extractRes = await extractIbkrOrdersHandler(ctx, { text: extractedText })
  const orders = extractRes.orders
  const instruments = extractRes.instruments
  if (orders.length === 0) throw new Error('No valid orders extracted from IBKR PDF')

  // 3. FIFO compute (wrap)
  const fifoRes = await computeIbkrFifoHandler(ctx, { orders, instruments })
  const trades = fifoRes.trades
  if (trades.length === 0) throw new Error('No trades matched via FIFO from orders')

  // 4. Convert to save format + save with userId from ctx ONLY
  const tradeDrafts = trades.map((t: any) => createTradeWithDefaults({
    accountNumber,
    userId,
    quantity: t.quantity,
    entryId: t.entryId || '',
    closeId: t.closeId || '',
    instrument: t.instrument,
    entryPrice: t.entryPrice,
    closePrice: t.closePrice,
    entryDate: t.entryDate,
    closeDate: t.closeDate,
    pnl: t.pnl,
    timeInPosition: t.timeInPosition || 0,
    side: t.side || '',
    commission: Math.abs(Number(t.commission) || 0),
  }))

  const saveResult = await saveTradesForUserAction(tradeDrafts, userId)
  if (saveResult.error) {
    throw new Error(`Save failed: ${saveResult.error}`)
  }

  return {
    imported: saveResult.numberOfTradesAdded || 0,
    accountNumber,
    ordersProcessed: orders.length,
    tradesMatched: trades.length,
    progress: '100%',
    userId,
  }
}

export async function syncTradovateHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : 'default'

  // Credential safety: NEVER accept or return tokens/creds from args; always load from user-scoped DB via userId
  const tokenResult = await getTradovateToken(accountId, userId)
  if (tokenResult.error || !tokenResult.accessToken) {
    throw new Error(tokenResult.error || 'No Tradovate credentials configured for this account. Connect via web dashboard first.')
  }

  // Sync with userId scoping (existing logic handles user isolation internally)
  const syncResult = await getTradovateTrades(tokenResult.accessToken, {
    userId,
    accountId,
  })

  if (syncResult.error) {
    throw new Error(syncResult.error)
  }

  return {
    success: true,
    savedCount: syncResult.savedCount ?? 0,
    ordersCount: syncResult.ordersCount ?? 0,
    accountId,
    progress: '100%',
    message: 'Tradovate sync completed successfully',
    // credential safety: no token, no sensitive data in response
  }
}

import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { toolError, toolSuccess, clampInt, requireParam, buildDateFilter, parseOptionalDate, type McpToolResult, type ToolDefinition } from './mcp-helpers'
import {
  extractIbkrOrdersHandler,
  computeIbkrFifoHandler,
  importIbkrPdfHandler,
  syncTradovateHandler,
} from './mcp/handlers/imports'
import {
  listJournalEntriesHandler,
  updateJournalEntryHandler,
  deleteJournalEntryHandler,
} from './mcp/handlers/journal'
import {
  getDashboardLayoutHandler,
  saveDashboardLayoutHandler,
} from './mcp/handlers/layout'

const WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
const READ = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
const DESTROY = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false }

export const userWriteTools: ToolDefinition[] = [
  // ── Account CRUD ──
  {
    name: 'create_account',
    description: `Create a new trading account.

Args:
  - number (string, required): Account number/identifier
  - startingBalance (number, required): Starting balance
  - propfirm (string, optional): Prop firm name (default "")
  - accountSize (string, optional): Account size label
  - drawdownThreshold (number, optional): Max drawdown allowed (default 0)
  - dailyLoss (number, optional): Max daily loss (default 0)
  - profitTarget (number, optional): Profit target to reach (default 0)
  - buffer (number, optional): Drawdown buffer (default 0)
  - evaluation (boolean, optional): Is this an evaluation account? (default true)
  - groupId (string, optional): Group to assign the account to

Returns: Created account object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        number: { type: 'string', description: 'Account number/identifier' },
        startingBalance: { type: 'number', description: 'Starting balance' },
        propfirm: { type: 'string', description: 'Prop firm name' },
        accountSize: { type: 'string', description: 'Account size label' },
        drawdownThreshold: { type: 'number', description: 'Max drawdown allowed' },
        dailyLoss: { type: 'number', description: 'Max daily loss' },
        profitTarget: { type: 'number', description: 'Profit target' },
        buffer: { type: 'number', description: 'Drawdown buffer' },
        evaluation: { type: 'boolean', description: 'Evaluation account?' },
        groupId: { type: 'string', description: 'Group ID to assign' },
      },
      required: ['number', 'startingBalance'],
    },
    annotations: WRITE,
  },
  {
    name: 'update_account',
    description: `Update an existing trading account's settings.

Args:
  - accountId (string, required): Account ID to update
  - propfirm (string, optional): Prop firm name
  - accountSize (string, optional): Account size label
  - drawdownThreshold (number, optional): Max drawdown allowed
  - dailyLoss (number, optional): Max daily loss
  - profitTarget (number, optional): Profit target
  - buffer (number, optional): Drawdown buffer
  - evaluation (boolean, optional): Evaluation flag
  - trailingDrawdown (boolean, optional): Trailing drawdown enabled
  - groupId (string, optional): Move to group (null to remove)

Returns: Updated account object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Account ID' },
        propfirm: { type: 'string' },
        accountSize: { type: 'string' },
        drawdownThreshold: { type: 'number' },
        dailyLoss: { type: 'number' },
        profitTarget: { type: 'number' },
        buffer: { type: 'number' },
        evaluation: { type: 'boolean' },
        trailingDrawdown: { type: 'boolean' },
        groupId: { type: 'string', description: 'Group ID (null to remove)' },
      },
      required: ['accountId'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_account',
    description: `Delete a trading account and all its associated trades. This action is irreversible.

Args:
  - accountId (string, required): Account ID to delete

Returns: Confirmation with deleted account number`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Account ID to delete' },
      },
      required: ['accountId'],
    },
    annotations: DESTROY,
  },

  // ── Trade Mutations ──
  {
    name: 'import_trades',
    description: `Batch import trades into an account. Each trade must include instrument, side, prices, and dates.

Args:
  - accountNumber (string, required): Account number to import trades into
  - trades (array, required): Array of trade objects, each with:
    - instrument (string): Trading instrument (e.g. "EURUSD")
    - side (string): "LONG" or "SHORT"
    - quantity (number): Trade size
    - entryPrice (number): Entry price
    - closePrice (number): Exit price
    - pnl (number): Profit/loss amount
    - commission (number, optional): Commission (default 0)
    - entryDate (string): Entry date (ISO 8601)
    - closeDate (string): Close date (ISO 8601)
    - tags (string[], optional): Tags for the trade
    - comment (string, optional): Trade note

Returns: Count of imported trades`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountNumber: { type: 'string', description: 'Account number' },
        trades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              instrument: { type: 'string' },
              side: { type: 'string' },
              quantity: { type: 'number' },
              entryPrice: { type: 'number' },
              closePrice: { type: 'number' },
              pnl: { type: 'number' },
              commission: { type: 'number' },
              entryDate: { type: 'string' },
              closeDate: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              comment: { type: 'string' },
            },
            required: ['instrument', 'side', 'entryPrice', 'closePrice', 'pnl', 'entryDate', 'closeDate'],
          },
        },
      },
      required: ['accountNumber', 'trades'],
    },
    annotations: WRITE,
  },
  {
    name: 'create_trade',
    description: `Create a single trade manually (equivalent to manual journal entry in dashboard).

SECURITY: Trade is always created for the authenticated MCP user (from API key / OAuth). Any userId in args is ignored.

Args:
  - accountNumber (string, required): Must match an existing account owned by you
  - instrument (string, required): e.g. "ES", "AAPL", "EURUSD"
  - side (string, optional): "LONG" | "SHORT" | "BUY" | "SELL" (default "")
  - quantity (number, optional): Default 0
  - entryPrice (number, required)
  - closePrice (number, required)
  - entryDate (string, required): ISO 8601 datetime
  - closeDate (string, required): ISO 8601 datetime
  - pnl (number, optional): If omitted, computed from prices/side/quantity - commission
  - commission (number, optional): Default 0
  - comment (string, optional)
  - tags (string[], optional)

Returns: The created trade object (with generated id, userId from your auth context, createdAt, etc.)

This is a write operation (creates data in your journal).`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountNumber: { type: 'string', description: 'Account number (must belong to you)' },
        instrument: { type: 'string', description: 'Trading instrument symbol' },
        side: { type: 'string', description: 'LONG, SHORT, BUY, SELL etc.' },
        quantity: { type: 'number', description: 'Position size' },
        entryPrice: { type: 'number', description: 'Entry/fill price' },
        closePrice: { type: 'number', description: 'Exit/close price' },
        entryDate: { type: 'string', description: 'Entry timestamp (ISO 8601)' },
        closeDate: { type: 'string', description: 'Close timestamp (ISO 8601)' },
        pnl: { type: 'number', description: 'Profit/loss (computed if omitted)' },
        commission: { type: 'number', description: 'Commission/fees' },
        comment: { type: 'string', description: 'Trade review comment' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for filtering' },
      },
      required: ['accountNumber', 'instrument', 'entryPrice', 'closePrice', 'entryDate', 'closeDate'],
    },
    annotations: WRITE,
  },
  {
    name: 'update_trade',
    description: `Update fields on an existing trade (prices, quantity, dates, instrument, side, commission, pnl, comment, tags, account).

SECURITY: Only updates trades owned by the authenticated MCP user (from API key / OAuth). Any userId in args is ignored. Trade and (if changing) account must belong to you.

Args:
  - tradeId (string, required): ID of your trade to edit
  - accountNumber (string, optional): Move to different account you own
  - instrument (string, optional)
  - side (string, optional)
  - quantity (number, optional)
  - entryPrice (number, optional)
  - closePrice (number, optional)
  - entryDate (string, optional): ISO 8601
  - closeDate (string, optional): ISO 8601
  - pnl (number, optional): If omitted and price/qty/side/comm changed, auto-recomputed
  - commission (number, optional)
  - comment (string, optional)
  - tags (string[], optional)

Returns: The full updated trade object.

This is a write operation (mutates your journal data).`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string', description: 'Trade ID to update (must belong to you)' },
        accountNumber: { type: 'string', description: 'New account number (must belong to you)' },
        instrument: { type: 'string', description: 'Trading instrument symbol' },
        side: { type: 'string', description: 'LONG, SHORT, BUY, SELL etc.' },
        quantity: { type: 'number', description: 'Position size' },
        entryPrice: { type: 'number', description: 'Entry/fill price' },
        closePrice: { type: 'number', description: 'Exit/close price' },
        entryDate: { type: 'string', description: 'Entry timestamp (ISO 8601)' },
        closeDate: { type: 'string', description: 'Close timestamp (ISO 8601)' },
        pnl: { type: 'number', description: 'Profit/loss (auto-recomputed if omitted on price changes)' },
        commission: { type: 'number', description: 'Commission/fees' },
        comment: { type: 'string', description: 'Trade review comment' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags for filtering' },
      },
      required: ['tradeId'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_trades',
    description: `Delete trades by their IDs. Verifies all trades belong to the authenticated user.

Args:
  - tradeIds (string[], required): Array of trade IDs to delete

Returns: Count of deleted trades`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeIds: { type: 'array', items: { type: 'string' }, description: 'Trade IDs to delete' },
      },
      required: ['tradeIds'],
    },
    annotations: DESTROY,
  },
  {
    name: 'upload_trade_image',
    description: `Upload or set an image on one or more trades (stores reference in imageBase64 / imageBase64Second or accepts storage path).

SECURITY: Only your own trades (ctx.userId from API key). Any userId in args is ignored + assertNoCrossUserAccess enforced in handler.
Reuses ownership + update logic pattern from server/trades.ts (updateTradeImage / updateTradesAction).

Args:
  - tradeId (string, optional): Single trade ID (use this or tradeIds)
  - tradeIds (string[], optional): Multiple trades to apply same image to
  - imageBase64 (string | null, required): Base64 data URL (e.g. "data:image/png;base64,...") or raw base64, or a Supabase storage path like "user-id/trades/hash.png". Null to clear.
  - field (string, optional): "imageBase64" (default) or "imageBase64Second"
  - image (string, alias for imageBase64)

Returns: { success, updated count, field, tradeIds }

This is a write (stores image data/reference for your trades).`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string', description: 'Single trade ID to update image for' },
        tradeIds: { type: 'array', items: { type: 'string' }, description: 'Trade IDs (bulk apply same image)' },
        imageBase64: { type: ['string', 'null'], description: 'Base64 image data or storage path; null clears' },
        image: { type: ['string', 'null'], description: 'Alias for imageBase64' },
        field: { type: 'string', enum: ['imageBase64', 'imageBase64Second'], description: 'Which image slot (default imageBase64)' },
      },
      required: [],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_trade_image',
    description: `Delete/clear an image from your trade(s). Clears legacy field and optionally removes path from images[] + cleans Supabase storage bucket.

SECURITY: Strict userId from ctx only. Ownership verified. Cross-user blocked via assertNoCrossUserAccess + query filter.
Reuses server/trades.ts image update pattern + lib/trade-image-path for safe storage delete.

Args:
  - tradeId / tradeIds (as in upload)
  - field (optional): which legacy field to null
  - imagePath (string, optional): storage path to also remove from images[] array + delete from Supabase "trade-images" bucket (uses service role + ensureOwned check)

Returns: { success, cleared count, ... }

Destructive write operation.`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string' },
        tradeIds: { type: 'array', items: { type: 'string' } },
        field: { type: 'string', enum: ['imageBase64', 'imageBase64Second'] },
        imagePath: { type: 'string', description: 'Storage path to purge from DB array + bucket' },
      },
      required: [],
    },
    annotations: DESTROY,
  },
  {
    name: 'group_trades',
    description: `Group multiple trades together by setting a shared groupId.

Args:
  - tradeIds (string[], required): Trade IDs to group
  - groupId (string, optional): Existing group ID. If omitted, a new group ID is generated.

Returns: Updated trades with their groupId`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeIds: { type: 'array', items: { type: 'string' } },
        groupId: { type: 'string', description: 'Optional existing group ID' },
      },
      required: ['tradeIds'],
    },
    annotations: WRITE,
  },
  {
    name: 'ungroup_trades',
    description: `Remove trades from their group by clearing the groupId field.

Args:
  - tradeIds (string[], required): Trade IDs to ungroup

Returns: Count of ungrouped trades`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['tradeIds'],
    },
    annotations: WRITE,
  },

  // ── Tag CRUD ──
  {
    name: 'create_tag',
    description: `Create a new trade tag.

Args:
  - name (string, required): Tag name (must be unique per user)
  - color (string, optional): Hex color code (default "#CBD5E1")
  - description (string, optional): Tag description

Returns: Created tag object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string', description: 'Tag name' },
        color: { type: 'string', description: 'Hex color (e.g. "#FF5733")' },
        description: { type: 'string', description: 'Tag description' },
      },
      required: ['name'],
    },
    annotations: WRITE,
  },
  {
    name: 'update_tag',
    description: `Update an existing tag's name, color, or description.

Args:
  - tagId (string, required): Tag ID
  - name (string, optional): New name
  - color (string, optional): New hex color
  - description (string, optional): New description

Returns: Updated tag object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tagId: { type: 'string', description: 'Tag ID' },
        name: { type: 'string' },
        color: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['tagId'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_tag',
    description: `Delete a tag. Does not remove tag strings from existing trades.

Args:
  - tagId (string, required): Tag ID to delete

Returns: Confirmation message`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tagId: { type: 'string', description: 'Tag ID' },
      },
      required: ['tagId'],
    },
    annotations: DESTROY,
  },

  // ── Group Management ──
  {
    name: 'list_groups',
    description: `List all account groups for the authenticated user.

Args: none

Returns: Array of group objects with their accounts`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    annotations: READ,
  },
  {
    name: 'create_group',
    description: `Create a new account group.

Args:
  - name (string, required): Group name (must be unique per user)

Returns: Created group object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string', description: 'Group name' },
      },
      required: ['name'],
    },
    annotations: WRITE,
  },
  {
    name: 'update_group',
    description: `Update a group's name.

Args:
  - groupId (string, required): Group ID
  - name (string, required): New name

Returns: Updated group object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
        name: { type: 'string', description: 'New name' },
      },
      required: ['groupId', 'name'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_group',
    description: `Delete a group. Associated accounts have their groupId set to null.

Args:
  - groupId (string, required): Group ID to delete

Returns: Confirmation message`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
      },
      required: ['groupId'],
    },
    annotations: DESTROY,
  },

  // ── Payouts ──
  {
    name: 'list_payouts',
    description: `List payouts for the user's trading accounts.

Args:
  - accountId (string, optional): Filter to a specific account

Returns: Array of payout objects`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID filter' },
      },
    },
    annotations: READ,
  },
  {
    name: 'save_payout',
    description: `Create or update a payout record for a trading account.

Args:
  - accountId (string, required): Account ID
  - amount (number, required): Payout amount
  - date (string, required): Payout date (ISO 8601)
  - status (string, optional): "PENDING", "PAID", "REFUSED", or "CANCELLED" (default "PENDING")
  - payoutId (string, optional): Payout ID to update (omit to create new)

Returns: Created/updated payout object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Account ID' },
        amount: { type: 'number', description: 'Payout amount' },
        date: { type: 'string', description: 'Payout date (ISO 8601)' },
        status: { type: 'string', enum: ['PENDING', 'PAID', 'REFUSED', 'CANCELLED'], description: 'Payout status' },
        payoutId: { type: 'string', description: 'Payout ID (for updates)' },
      },
      required: ['accountId', 'amount', 'date'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_payout',
    description: `Delete a payout record.

Args:
  - payoutId (string, required): Payout ID

Returns: Confirmation message`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        payoutId: { type: 'string', description: 'Payout ID' },
      },
      required: ['payoutId'],
    },
    annotations: DESTROY,
  },

  // ── Additional Reads ──
  {
    name: 'get_equity_chart',
    description: `Get equity curve data computed from trade history. Returns an array of data points with date and running balance.

Args:
  - accountId (string, optional): Filter to a specific account
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)

Returns: Array of { date, balance, pnl, tradeCount } data points`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Account ID' },
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
      },
    },
    annotations: READ,
  },
  {
    name: 'get_mood_history',
    description: `Get mood/journal entries over time with optional date filtering.

Args:
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)
  - limit (number, optional): Max entries (default 50, max 200)
  - offset (number, optional): Pagination offset

Returns: Array of mood entries`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max entries (default 50, max 200)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
    annotations: READ,
  },
  // Journal full CRUD (Top 15 #10#11) - wired to handlers for ctx.userId only
  {
    name: 'list_journal_entries',
    description: `List journal/mood entries with optional date range + pagination. Strict user scoping via ctx only.
Args: startDate, endDate, limit, offset
Returns: array of {id, day, mood, emotionValue, journalContent, ...}`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        startDate: { type: 'string', description: 'Start date ISO' },
        endDate: { type: 'string', description: 'End date ISO' },
        limit: { type: 'number', description: 'Max 200' },
        offset: { type: 'number', description: 'Pagination' },
      },
    },
    annotations: READ,
  },
  {
    name: 'update_journal_entry',
    description: `Update journal entry for a specific day. Uses ctx.userId only.
Args: day (required), mood, emotionValue, journalContent
Returns: updated entry`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        day: { type: 'string', description: 'ISO day to update' },
        mood: { type: 'string' },
        emotionValue: { type: 'number' },
        journalContent: { type: 'string' },
      },
      required: ['day'],
    },
    annotations: WRITE,
  },
  {
    name: 'delete_journal_entry',
    description: `Delete journal entry by day. ctx.userId only.
Args: day (required)
Returns: {success, deletedId?}`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        day: { type: 'string', description: 'ISO day' },
      },
      required: ['day'],
    },
    annotations: WRITE,
  },
  // Dashboard layout (Top 15 #12)
  {
    name: 'get_dashboard_layout',
    description: `Get current dashboard widget layout (desktop/mobile). ctx.userId only.
Returns: {desktop: Widget[], mobile: Widget[]}`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    annotations: READ,
  },
  {
    name: 'save_dashboard_layout',
    description: `Save dashboard layout. Strict ctx.userId scoping + validation.
Args: layouts {desktop, mobile}
Returns: {success, error?}`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        layouts: {
          type: 'object',
          properties: { desktop: { type: 'array' }, mobile: { type: 'array' } },
        },
      },
      required: ['layouts'],
    },
    annotations: WRITE,
  },
  {
    name: 'get_subscription',
    description: `Get the authenticated user's subscription details including plan, status, and end date.

Args: none

Returns: Subscription object or null if no subscription`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    annotations: READ,
  },
  {
    name: 'update_profile',
    description: `Update the authenticated user's profile settings.

Args:
  - username (string, optional): New username
  - language (string, optional): Language preference
  - showOnLeaderboard (boolean, optional): Toggle leaderboard visibility

Returns: Updated profile fields`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        username: { type: 'string', description: 'New username' },
        language: { type: 'string', description: 'Language code (e.g. "en", "es")' },
        showOnLeaderboard: { type: 'boolean', description: 'Show on public leaderboard' },
      },
    },
    annotations: WRITE,
  },

  // ── IBKR Import Tools (Phase 2, Top 15 #7) - wrap /api/imports/ibkr/* with strict scoping + progress
  {
    name: 'extract_ibkr_orders',
    description: `Extract orders from IBKR PDF statement text (post-OCR). Pure compute, user auth required for tool access.
Args:
  - text (string, required): Extracted text from IBKR PDF (Trades section)
Returns: { orders: TradeOrder[], instruments: FinancialInstrument[] }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        text: { type: 'string', description: 'Raw extracted text from IBKR PDF containing Trades and Financial Instrument sections' },
      },
      required: ['text'],
    },
    annotations: READ,
  },
  {
    name: 'compute_ibkr_fifo',
    description: `Compute FIFO matched trades from IBKR orders + instruments (no DB write).
Args:
  - orders (array, required): Array of order objects from extract_ibkr_orders
  - instruments (array, required): Array of instrument metadata
Returns: { trades: Trade[], count: number }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        orders: { type: 'array', items: { type: 'object' }, description: 'Orders from extract step' },
        instruments: { type: 'array', items: { type: 'object' }, description: 'Instruments from extract step' },
      },
      required: ['orders'],
    },
    annotations: READ,
  },
  {
    name: 'import_ibkr_pdf',
    description: `Full IBKR PDF import: OCR extract -> parse orders -> FIFO match -> save trades to account.
Strict userId from context only. Credential-free (no secrets in args).
Args:
  - accountNumber (string, required)
  - pdfBase64 (string, required): base64 of the IBKR PDF statement
Returns: { imported, accountNumber, ordersProcessed, tradesMatched, progress: '100%' }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountNumber: { type: 'string', description: 'Target account number (must belong to authenticated user)' },
        pdfBase64: { type: 'string', description: 'Base64-encoded IBKR PDF file content' },
      },
      required: ['accountNumber', 'pdfBase64'],
    },
    annotations: WRITE,
  },

  // ── Tradovate Sync (Phase 2, Top 15 #6) - wrap server/imports/tradovate-actions with userId ctx + credential safety
  {
    name: 'sync_tradovate',
    description: `Trigger Tradovate sync for connected account using stored encrypted credentials (never accepts tokens in args, never returns them).
Progress reporting included. Strict user isolation.
Args:
  - accountId (string, optional): 'default' or specific accountId from sync records
Returns: { success, savedCount, ordersCount, accountId, progress: '100%', message }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Tradovate account identifier (defaults to "default")' },
      },
    },
    annotations: WRITE,
  },

  // ── Teams & Collaboration (Top 15 #13) - wrap server/teams.ts + /api/team/* with strict requireUserId + membership checks
  {
    name: 'create_team',
    description: `Create a new team for collaboration (traders, shared analytics, views). Owner is auto-added as ADMIN.
Strictly scoped to authenticated user (ctx.userId only). No cross-user teams.

Args:
  - name (string, required): Team name (unique per owner)
  - organizationId (string, optional): Link to organization if any

Returns: Created team object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        name: { type: 'string', description: 'Team display name' },
        organizationId: { type: 'string', description: 'Optional organization ID' },
      },
      required: ['name'],
    },
    annotations: WRITE,
  },
  {
    name: 'invite_team_member',
    description: `Invite a user (by email) to join a team. Sender must be team owner or ADMIN member (enforced via membership check on ctx.userId).
Invitation record created; email sent via /api/team/invite surface. Full isolation.

Args:
  - teamId (string, required)
  - email (string, required): Invitee's email (must match their account when accepting)
  - role (string, optional): TRADER | ANALYST | VIEWER (default TRADER)

Returns: { invitation }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        teamId: { type: 'string', description: 'Target team ID' },
        email: { type: 'string', description: 'Email of user to invite' },
        role: { type: 'string', enum: ['TRADER', 'ANALYST', 'VIEWER'], description: 'Role for invitee' },
      },
      required: ['teamId', 'email'],
    },
    annotations: WRITE,
  },
  {
    name: 'accept_team_invite',
    description: `Accept a pending team invitation. The authenticated user's email (from ctx) MUST match the invitation email (enforced in wrapped logic).
Adds user to team members. Isolation: only the invitee can accept their invite.

Args:
  - invitationId (string, required)

Returns: { success: true }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        invitationId: { type: 'string', description: 'ID from the invitation email/link' },
      },
      required: ['invitationId'],
    },
    annotations: WRITE,
  },
  {
    name: 'remove_team_member',
    description: `Remove a member from team (leave for others). Caller (ctx.userId) must be team ADMIN/owner. Cannot remove self (use delete team).
Strict membership check enforced. No cross-team.

Args:
  - teamId (string, required)
  - userId (string, required): The member to remove (must be current member)

Returns: { success: true }`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        teamId: { type: 'string', description: 'Team to modify' },
        userId: { type: 'string', description: 'Member user ID to remove' },
      },
      required: ['teamId', 'userId'],
    },
    annotations: WRITE,
  },
]

export async function handleUserWriteToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  switch (toolName) {
    case 'create_account': return await createAccount(ctx, args)
    case 'update_account': return await updateAccount(ctx, args)
    case 'delete_account': return await deleteAccount(ctx, args)
    case 'import_trades': return await importTrades(ctx, args)
    case 'create_trade': return await createTrade(ctx, args)
    case 'update_trade': return await updateTrade(ctx, args)
    case 'upload_trade_image': return await uploadTradeImage(ctx, args)
    case 'delete_trade_image': return await deleteTradeImage(ctx, args)
    case 'delete_trades': return await deleteTrades(ctx, args)
    case 'group_trades': return await groupTrades(ctx, args)
    case 'ungroup_trades': return await ungroupTrades(ctx, args)
    case 'create_tag': return await createTag(ctx, args)
    case 'update_tag': return await updateTag(ctx, args)
    case 'delete_tag': return await deleteTag(ctx, args)
    case 'list_groups': return await listGroups(ctx)
    case 'create_group': return await createGroup(ctx, args)
    case 'update_group': return await updateGroup(ctx, args)
    case 'delete_group': return await deleteGroup(ctx, args)
    case 'list_payouts': return await listPayouts(ctx, args)
    case 'save_payout': return await savePayout(ctx, args)
    case 'delete_payout': return await deletePayout(ctx, args)
    case 'get_equity_chart': return await getEquityChart(ctx, args)
    case 'get_mood_history': return await getMoodHistory(ctx, args)
    // New journal + layout (Top 15) wired via handlers (ctx.userId enforced inside)
    case 'list_journal_entries': return await listJournalEntriesHandler(ctx, args).then(toolSuccess).catch(e => toolError(e.message))
    case 'update_journal_entry': return await updateJournalEntryHandler(ctx, args).then(toolSuccess).catch(e => toolError(e.message))
    case 'delete_journal_entry': return await deleteJournalEntryHandler(ctx, args).then(toolSuccess).catch(e => toolError(e.message))
    case 'get_dashboard_layout': return await getDashboardLayoutHandler(ctx, args).then(toolSuccess).catch(e => toolError(e.message))
    case 'save_dashboard_layout': return await saveDashboardLayoutHandler(ctx, args).then(toolSuccess).catch(e => toolError(e.message))
    case 'get_subscription': return await getSubscription(ctx)
    case 'update_profile': return await updateProfile(ctx, args)
    case 'extract_ibkr_orders': return await extractIbkrOrders(ctx, args)
    case 'compute_ibkr_fifo': return await computeIbkrFifo(ctx, args)
    case 'import_ibkr_pdf': return await importIbkrPdf(ctx, args)
    case 'sync_tradovate': return await syncTradovate(ctx, args)
    // Teams (Top 15 #13) - strict userId + membership checks via handler
    case 'create_team': return await createTeam(ctx, args)
    case 'invite_team_member': return await inviteTeamMember(ctx, args)
    case 'accept_team_invite': return await acceptTeamInvite(ctx, args)
    case 'remove_team_member': return await removeTeamMember(ctx, args)
    default: return toolError(`Unknown user write tool: ${toolName}`)
  }
}

// ── Account CRUD ──

async function createAccount(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const number = requireParam(args, 'number')
  const startingBalance = Number(args.startingBalance)
  if (!Number.isFinite(startingBalance) || startingBalance < 0) {
    return toolError('startingBalance must be a non-negative number')
  }

  const existing = await prisma.account.findUnique({
    where: { number_userId: { number, userId: ctx.userId } },
  })
  if (existing) {
    return toolError(`Account number "${number}" already exists`)
  }

  const account = await prisma.account.create({
    data: {
      number,
      userId: ctx.userId,
      startingBalance,
      propfirm: typeof args.propfirm === 'string' ? args.propfirm : '',
      accountSize: typeof args.accountSize === 'string' ? args.accountSize : null,
      drawdownThreshold: typeof args.drawdownThreshold === 'number' ? args.drawdownThreshold : 0,
      dailyLoss: typeof args.dailyLoss === 'number' ? args.dailyLoss : 0,
      profitTarget: typeof args.profitTarget === 'number' ? args.profitTarget : 0,
      buffer: typeof args.buffer === 'number' ? args.buffer : 0,
      evaluation: typeof args.evaluation === 'boolean' ? args.evaluation : true,
      groupId: typeof args.groupId === 'string' ? args.groupId : null,
    },
  })

  return toolSuccess({ id: account.id, number: account.number, propfirm: account.propfirm, startingBalance: Number(account.startingBalance), createdAt: account.createdAt })
}

async function updateAccount(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = requireParam(args, 'accountId')

  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: ctx.userId },
  })
  if (!existing) return toolError('Account not found')

  const data: Record<string, unknown> = {}
  if (typeof args.propfirm === 'string') data.propfirm = args.propfirm
  if (typeof args.accountSize === 'string') data.accountSize = args.accountSize
  if (typeof args.drawdownThreshold === 'number') data.drawdownThreshold = args.drawdownThreshold
  if (typeof args.dailyLoss === 'number') data.dailyLoss = args.dailyLoss
  if (typeof args.profitTarget === 'number') data.profitTarget = args.profitTarget
  if (typeof args.buffer === 'number') data.buffer = args.buffer
  if (typeof args.evaluation === 'boolean') data.evaluation = args.evaluation
  if (typeof args.trailingDrawdown === 'boolean') data.trailingDrawdown = args.trailingDrawdown
  if (args.groupId !== undefined) data.groupId = args.groupId === null ? null : args.groupId

  if (Object.keys(data).length === 0) return toolError('No fields to update')

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: data as Parameters<typeof prisma.account.update>[0]['data'],
    select: { id: true, number: true, propfirm: true, accountSize: true, startingBalance: true, drawdownThreshold: true, dailyLoss: true, profitTarget: true, buffer: true, evaluation: true, groupId: true },
  })

  return toolSuccess(updated)
}

async function deleteAccount(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = requireParam(args, 'accountId')

  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: ctx.userId },
    select: { id: true, number: true },
  })
  if (!existing) return toolError('Account not found')

  await prisma.account.delete({ where: { id: accountId } })

  return toolSuccess({ deleted: true, accountId: existing.id, number: existing.number })
}

// ── Trade Mutations ──

async function importTrades(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountNumber = requireParam(args, 'accountNumber')
  const tradesRaw = args.trades

  if (!Array.isArray(tradesRaw) || tradesRaw.length === 0) {
    return toolError('trades must be a non-empty array')
  }
  if (tradesRaw.length > 500) {
    return toolError('Maximum 500 trades per import')
  }

  const account = await prisma.account.findFirst({
    where: { number: accountNumber, userId: ctx.userId },
  })
  if (!account) return toolError('Account not found')

  const tradeRecords: unknown[] = []
  for (let i = 0; i < tradesRaw.length; i++) {
    const t = tradesRaw[i] as Record<string, unknown>
    if (typeof t.instrument !== 'string' || !t.instrument) return toolError(`Trade ${i}: instrument is required`)
    if (typeof t.entryPrice !== 'number') return toolError(`Trade ${i}: entryPrice must be a number`)
    if (typeof t.closePrice !== 'number') return toolError(`Trade ${i}: closePrice must be a number`)
    if (typeof t.pnl !== 'number') return toolError(`Trade ${i}: pnl must be a number`)

    const entryDate = typeof t.entryDate === 'string' ? t.entryDate : null
    const closeDate = typeof t.closeDate === 'string' ? t.closeDate : null
    if (!entryDate) return toolError(`Trade ${i}: invalid entryDate`)

    tradeRecords.push({
      accountNumber,
      instrument: t.instrument,
      side: typeof t.side === 'string' ? t.side : '',
      quantity: t.quantity,
      entryPrice: t.entryPrice,
      closePrice: t.closePrice,
      pnl: t.pnl,
      commission: typeof t.commission === 'number' ? t.commission : 0,
      entryDate,
      closeDate,
      tags: Array.isArray(t.tags) ? t.tags.filter((x: unknown) => typeof x === 'string') : [],
      comment: typeof t.comment === 'string' ? t.comment : null,
    })
  }

  const { saveTradesForUserAction } = await import('@/server/database')
  const saveResult = await saveTradesForUserAction(tradeRecords, ctx.userId)
  if (saveResult.error) {
    return toolError(`Import failed: ${saveResult.error}`)
  }

  return toolSuccess({ imported: saveResult.numberOfTradesAdded || 0, accountNumber })
}

async function createTrade(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { createTradeHandler } = await import('@/server/mcp/handlers/trade')
    const data = await createTradeHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to create trade')
  }
}

async function updateTrade(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { updateTradeHandler } = await import('@/server/mcp/handlers/trade')
    const data = await updateTradeHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to update trade')
  }
}

async function uploadTradeImage(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { uploadTradeImageHandler } = await import('@/server/mcp/handlers/trade')
    const data = await uploadTradeImageHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to upload trade image')
  }
}

async function deleteTradeImage(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { deleteTradeImageHandler } = await import('@/server/mcp/handlers/trade')
    const data = await deleteTradeImageHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to delete trade image')
  }
}

async function deleteTrades(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeIds = args.tradeIds
  if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
    return toolError('tradeIds must be a non-empty array')
  }

  const userTrades = await prisma.trade.findMany({
    where: { id: { in: tradeIds }, userId: ctx.userId },
    select: { id: true },
  })

  if (userTrades.length === 0) return toolError('No matching trades found')

  await prisma.trade.deleteMany({ where: { id: { in: userTrades.map(t => t.id) } } })

  return toolSuccess({ deleted: userTrades.length })
}

async function groupTrades(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeIds = args.tradeIds
  if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
    return toolError('tradeIds must be a non-empty array')
  }

  const groupId = typeof args.groupId === 'string' && args.groupId
    ? args.groupId
    : crypto.randomUUID()

  const userTrades = await prisma.trade.findMany({
    where: { id: { in: tradeIds }, userId: ctx.userId },
    select: { id: true },
  })
  if (userTrades.length === 0) return toolError('No matching trades found')

  await prisma.trade.updateMany({
    where: { id: { in: userTrades.map(t => t.id) } },
    data: { groupId },
  })

  return toolSuccess({ grouped: userTrades.length, groupId })
}

async function ungroupTrades(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeIds = args.tradeIds
  if (!Array.isArray(tradeIds) || tradeIds.length === 0) {
    return toolError('tradeIds must be a non-empty array')
  }

  const result = await prisma.trade.updateMany({
    where: { id: { in: tradeIds }, userId: ctx.userId },
    data: { groupId: '' },
  })

  return toolSuccess({ ungrouped: result.count })
}

// ── Tag CRUD ──

async function createTag(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const name = requireParam(args, 'name')

  const existing = await prisma.tag.findUnique({
    where: { name_userId: { name, userId: ctx.userId } },
  })
  if (existing) return toolError(`Tag "${name}" already exists`)

  const tag = await prisma.tag.create({
    data: {
      name,
      userId: ctx.userId,
      color: typeof args.color === 'string' ? args.color : '#CBD5E1',
      description: typeof args.description === 'string' ? args.description : null,
    },
  })

  return toolSuccess(tag)
}

async function updateTag(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tagId = requireParam(args, 'tagId')

  const existing = await prisma.tag.findFirst({ where: { id: tagId, userId: ctx.userId } })
  if (!existing) return toolError('Tag not found')

  const data: Record<string, unknown> = {}
  if (typeof args.name === 'string') data.name = args.name
  if (typeof args.color === 'string') data.color = args.color
  if (typeof args.description === 'string') data.description = args.description
  if (Object.keys(data).length === 0) return toolError('No fields to update')

  const updated = await prisma.tag.update({ where: { id: tagId }, data: data as Parameters<typeof prisma.tag.update>[0]['data'] })

  return toolSuccess({ id: updated.id, name: updated.name, color: updated.color, description: updated.description })
}

async function deleteTag(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tagId = requireParam(args, 'tagId')

  const existing = await prisma.tag.findFirst({ where: { id: tagId, userId: ctx.userId } })
  if (!existing) return toolError('Tag not found')

  await prisma.tag.delete({ where: { id: tagId } })

  return toolSuccess({ deleted: true, tagId, name: existing.name })
}

// ── Group Management ──

async function listGroups(ctx: McpAuthContext): Promise<McpToolResult> {
  const groups = await prisma.group.findMany({
    where: { userId: ctx.userId },
    include: {
      accounts: { select: { id: true, number: true, propfirm: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return toolSuccess(groups)
}

async function createGroup(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const name = requireParam(args, 'name')

  const existing = await prisma.group.findUnique({
    where: { name_userId: { name, userId: ctx.userId } },
  })
  if (existing) return toolError(`Group "${name}" already exists`)

  const group = await prisma.group.create({
    data: { name, userId: ctx.userId },
  })

  return toolSuccess(group)
}

async function updateGroup(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const groupId = requireParam(args, 'groupId')
  const name = requireParam(args, 'name')

  const existing = await prisma.group.findFirst({ where: { id: groupId, userId: ctx.userId } })
  if (!existing) return toolError('Group not found')

  const updated = await prisma.group.update({
    where: { id: groupId },
    data: { name },
  })

  return toolSuccess({ id: updated.id, name: updated.name })
}

async function deleteGroup(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const groupId = requireParam(args, 'groupId')

  const existing = await prisma.group.findFirst({ where: { id: groupId, userId: ctx.userId } })
  if (!existing) return toolError('Group not found')

  // Null out groupId on associated accounts before deleting
  await prisma.account.updateMany({
    where: { groupId, userId: ctx.userId },
    data: { groupId: null },
  })

  await prisma.group.delete({ where: { id: groupId } })

  return toolSuccess({ deleted: true, groupId, name: existing.name })
}

// ── Payouts ──

async function listPayouts(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountFilter: Record<string, unknown> = { userId: ctx.userId }
  if (typeof args.accountId === 'string' && args.accountId) {
    accountFilter.id = args.accountId
  }

  const accounts = await prisma.account.findMany({
    where: accountFilter,
    select: { id: true, number: true, propfirm: true },
  })

  if (!accounts.length) return toolSuccess([])

  const payouts = await prisma.payout.findMany({
    where: { accountId: { in: accounts.map(a => a.id) } },
    orderBy: { date: 'desc' },
    take: 200,
  })

  return toolSuccess(payouts.map(p => ({
    ...p,
    amount: Number(p.amount),
    account: accounts.find(a => a.id === p.accountId),
  })))
}

async function savePayout(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = requireParam(args, 'accountId')
  const amount = Number(args.amount)
  const dateStr = requireParam(args, 'date')

  if (!Number.isFinite(amount) || amount <= 0) return toolError('amount must be a positive number')

  const date = parseOptionalDate(dateStr)
  if (!date) return toolError('Invalid date format')

  const account = await prisma.account.findFirst({ where: { id: accountId, userId: ctx.userId } })
  if (!account) return toolError('Account not found')

  const validStatuses = ['PENDING', 'PAID', 'REFUSED', 'CANCELLED']
  const status = typeof args.status === 'string' && validStatuses.includes(args.status)
    ? args.status
    : 'PENDING'

  if (typeof args.payoutId === 'string' && args.payoutId) {
    // Update existing
    const existing = await prisma.payout.findFirst({ where: { id: args.payoutId, accountId } })
    if (!existing) return toolError('Payout not found')

    const updated = await prisma.payout.update({
      where: { id: args.payoutId },
      data: { amount, status: status as 'PENDING' | 'PAID' | 'REFUSED' | 'CANCELLED', date },
    })
    return toolSuccess({ ...updated, amount: Number(updated.amount) })
  }

  // Create new
  const payout = await prisma.payout.create({
    data: { accountId, accountNumber: account.number, amount, status: status as 'PENDING' | 'PAID' | 'REFUSED' | 'CANCELLED', date },
  })

  return toolSuccess({ ...payout, amount: Number(payout.amount) })
}

async function deletePayout(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const payoutId = requireParam(args, 'payoutId')

  const payout = await prisma.payout.findFirst({ where: { id: payoutId, account: { userId: ctx.userId } } })
  if (!payout) return toolError('Payout not found')

  await prisma.payout.delete({ where: { id: payoutId } })

  return toolSuccess({ deleted: true, payoutId })
}

// ── Additional Reads ──

async function getEquityChart(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const where: Record<string, unknown> = { userId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter

  if (typeof args.accountId === 'string' && args.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: args.accountId, userId: ctx.userId },
    })
    if (!account) return toolError('Account not found')
    where.accountNumber = account.number
  }

  const trades = await prisma.trade.findMany({
    where: where as any,
    orderBy: { entryDate: 'asc' },
    take: 10_000,
    select: { pnl: true, entryDate: true },
  })

  if (!trades.length) return toolSuccess([])

  // Aggregate by date
  let runningBalance = 0
  const byDate = new Map<string, { pnl: number; count: number }>()
  for (const t of trades) {
    const dateKey = t.entryDate.toISOString().slice(0, 10)
    const existing = byDate.get(dateKey) || { pnl: 0, count: 0 }
    existing.pnl += Number(t.pnl)
    existing.count++
    byDate.set(dateKey, existing)
  }

  const points = Array.from(byDate.entries()).map(([date, data]) => {
    runningBalance += data.pnl
    return { date, balance: Number(runningBalance.toFixed(2)), pnl: Number(data.pnl.toFixed(2)), tradeCount: data.count }
  })

  return toolSuccess(points)
}

async function getMoodHistory(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const limit = clampInt(args.limit, 1, 200, 50)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { userId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.day = dateFilter

  const moods = await prisma.mood.findMany({
    where,
    orderBy: { day: 'desc' },
    take: limit,
    skip: offset,
    select: { id: true, day: true, mood: true, emotionValue: true, journalContent: true, createdAt: true },
  })

  return toolSuccess(moods)
}

async function getSubscription(ctx: McpAuthContext): Promise<McpToolResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: ctx.userId },
    select: { id: true, email: true, plan: true, status: true, cancelAtPeriodEnd: true, interval: true, endDate: true, trialEndsAt: true, createdAt: true },
  })

  if (!subscription) return toolSuccess({ subscribed: false })

  return toolSuccess({ subscribed: true, ...subscription })
}

async function updateProfile(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const data: Record<string, unknown> = {}
  if (typeof args.username === 'string' && args.username.trim()) data.username = args.username.trim()
  if (typeof args.language === 'string' && args.language.trim()) data.language = args.language.trim()
  if (typeof args.showOnLeaderboard === 'boolean') data.showOnLeaderboard = args.showOnLeaderboard

  if (Object.keys(data).length === 0) return toolError('No fields to update')

  // Check username uniqueness if changing
  if (data.username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: ctx.userId } },
    })
    if (existing) return toolError(`Username "${data.username}" is already taken`)
  }

  const updated = await prisma.user.update({
    where: { id: ctx.userId },
    data: data as Parameters<typeof prisma.user.update>[0]['data'],
    select: { id: true, username: true, language: true, showOnLeaderboard: true },
  })

  return toolSuccess(updated)
}

// ── IBKR & Tradovate wrappers (TDD implemented, use handlers with security guards) ──

async function extractIbkrOrders(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const data = await extractIbkrOrdersHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to extract IBKR orders')
  }
}

async function computeIbkrFifo(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const data = await computeIbkrFifoHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to compute IBKR FIFO')
  }
}

async function importIbkrPdf(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const data = await importIbkrPdfHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to import IBKR PDF')
  }
}

async function syncTradovate(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const data = await syncTradovateHandler(ctx, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to sync Tradovate')
  }
}

// ── Teams (Top 15 #13) wrappers - TDD, strict security.ts requireUserId + membership checks, wrap server/teams.ts
async function createTeam(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { createTeamHandler } = await import('@/server/mcp/handlers/teams')
    const data = await createTeamHandler({ userId: ctx.userId, authUserId: ctx.authUserId, role: ctx.role, authMethod: ctx.authMethod }, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to create team')
  }
}

async function inviteTeamMember(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { inviteTeamMemberHandler } = await import('@/server/mcp/handlers/teams')
    const data = await inviteTeamMemberHandler({ userId: ctx.userId, authUserId: ctx.authUserId, role: ctx.role, authMethod: ctx.authMethod }, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to invite team member')
  }
}

async function acceptTeamInvite(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { acceptTeamInviteHandler } = await import('@/server/mcp/handlers/teams')
    const data = await acceptTeamInviteHandler({ userId: ctx.userId, authUserId: ctx.authUserId, role: ctx.role, authMethod: ctx.authMethod }, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to accept team invite')
  }
}

async function removeTeamMember(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { removeTeamMemberHandler } = await import('@/server/mcp/handlers/teams')
    const data = await removeTeamMemberHandler({ userId: ctx.userId, authUserId: ctx.authUserId, role: ctx.role, authMethod: ctx.authMethod }, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message || 'Failed to remove team member')
  }
}

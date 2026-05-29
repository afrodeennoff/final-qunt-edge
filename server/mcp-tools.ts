import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { maskEmail } from '@/lib/redact-pii'
import { toolError, toolSuccess, clampInt, buildDateFilter, requireParam, type McpToolResult, type ToolDefinition } from './mcp-helpers'

function computeDrawdown(account: { startingBalance: number; drawdownThreshold: number; buffer: number }, currentBalance: number): {
  drawdownUsed: number
  drawdownUsedPct: string
  bufferRemaining: number
  atRisk: boolean
} {
  const maxLossAllowed = Number(account.drawdownThreshold) || 0
  const buffer = Number(account.buffer) || 0
  const balanceUsed = Number(account.startingBalance) - currentBalance
  const adjustedDrawdown = maxLossAllowed + buffer
  const drawdownUsed = Math.max(0, balanceUsed)
  const drawdownUsedPct = adjustedDrawdown > 0 ? ((drawdownUsed / adjustedDrawdown) * 100) : 0
  return {
    drawdownUsed,
    drawdownUsedPct: drawdownUsedPct.toFixed(1),
    bufferRemaining: Math.max(0, adjustedDrawdown - drawdownUsed),
    atRisk: drawdownUsedPct > 80,
  }
}

async function getAccountHealth(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  try {
    const { getAccountHealthHandler } = await import('@/server/mcp/handlers/account')
    const data = await getAccountHealthHandler({ userId: ctx.userId }, args)
    return toolSuccess(data)
  } catch (e: any) {
    return toolError(e.message)
  }
}

export const standardTools: ToolDefinition[] = [
  {
    name: 'get_account_health',
    description: `Get a complete health snapshot for all trading accounts. Returns current balance, drawdown used %, buffer remaining, trailing stop status, profit target progress, payout eligibility, and days traded.

Args:
  - accountId (string, optional): Filter to a specific account by ID

Returns: Array of account health objects with balance, drawdown, buffer, trailing, profit target, payout, days traded`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID to get health for a specific account' },
      },
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string' },
          propfirm: { type: 'string' },
          accountSize: { type: 'string' },
          startingBalance: { type: 'number' },
          currentBalance: { type: 'number' },
          pnl: { type: 'number' },
          drawdownUsed: { type: 'number' },
          drawdownUsedPct: { type: 'string' },
          bufferRemaining: { type: 'number' },
          atRisk: { type: 'boolean' },
          status: { type: 'string', enum: ['HEALTHY', 'WARNING', 'CRITICAL'] },
          profitTargetPct: { type: 'string' },
          trailingActive: { type: 'boolean' },
          daysTraded: { type: 'number' },
          isEvaluation: { type: 'boolean' },
          payoutEligible: { type: 'boolean' },
          payoutsReceived: { type: 'number' },
          recentPerformance: { type: 'object', properties: { last10TradesPnL: { type: 'number' }, tradeCount: { type: 'number' } } },
          dailyLossLimit: { type: 'number' },
          lastUpdated: { type: 'string' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_accounts',
    description: `List all trading accounts for the authenticated user.

Returns account number, prop firm name, account size, starting balance, and creation date.

Args: none

Returns: Array of account objects with id, number, propfirm, accountSize, startingBalance, createdAt`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'string' },
          propfirm: { type: 'string' },
          accountSize: { type: 'number' },
          startingBalance: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_account_details',
    description: `Get detailed information about a specific trading account, including its recent trades.

Args:
  - accountId (string, required): The account ID

Returns: Account object with trades array (last 10 trades)`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'The account ID' },
      },
      required: ['accountId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        number: { type: 'string' },
        propfirm: { type: 'string' },
        accountSize: { type: 'number' },
        startingBalance: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        trades: { type: 'array', items: { type: 'object' } },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_trades',
    description: `List trades for the authenticated user with optional date range filtering and pagination.

Args:
  - startDate (string, optional): Start date (ISO 8601, e.g. "2024-01-01")
  - endDate (string, optional): End date (ISO 8601)
  - limit (number, optional): Max trades to return (default 50, max 200)
  - offset (number, optional): Pagination offset (default 0)

Returns: Array of trade objects sorted by entryDate descending`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601, e.g. "2024-01-01")' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max trades to return (default 50, max 200)' },
        offset: { type: 'number', description: 'Pagination offset (default 0)' },
      },
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          accountId: { type: 'string' },
          instrument: { type: 'string' },
          direction: { type: 'string', enum: ['LONG', 'SHORT'] },
          entryDate: { type: 'string', format: 'date-time' },
          exitDate: { type: 'string', format: 'date-time' },
          pnl: { type: 'number' },
          commission: { type: 'number' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_performance_summary',
    description: `Get overall trading performance metrics including PnL, win rate, profit factor, and averages.

Args:
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)

Returns: Object with totalTrades, grossPnL, netPnL, winRate, totalWins, totalLosses, avgWin, avgLoss, profitFactor`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalTrades: { type: 'number' },
        grossPnL: { type: 'string' },
        netPnL: { type: 'string' },
        winRate: { type: 'string' },
        totalWins: { type: 'number' },
        totalLosses: { type: 'number' },
        avgWin: { type: 'string' },
        avgLoss: { type: 'string' },
        profitFactor: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_user_profile',
    description: `Get the authenticated user's profile information.

Returns username, masked email, language preference, and account creation date.

Args: none

Returns: Object with id, username, email (masked), language, createdAt`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string' },
        language: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'list_tags',
    description: `List all trade tags for the authenticated user.

Args: none

Returns: Array of tag objects with id, name, color, and userId`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
    outputSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          color: { type: 'string' },
          userId: { type: 'string' },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_risk_metrics',
    description: `Get key risk metrics across all trades: max drawdown, avg risk per trade, RR distribution, violation count, expectancy, Sharpe-like ratio.

Args:
  - startDate (string, optional): Start date (ISO 8601)
  - endDate (string, optional): End date (ISO 8601)
  - accountId (string, optional): Filter to specific account

Returns: Object with totalTrades, maxDrawdown, maxDrawdownPct, avgRiskPerTrade, avgRR, bestRR, worstRR, expectancy, profitFactor, sharpeRatio, violationCount`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        accountId: { type: 'string', description: 'Optional account ID filter' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        totalTrades: { type: 'number' },
        maxDrawdown: { type: 'number' },
        maxDrawdownPct: { type: 'string' },
        avgRiskPerTrade: { type: 'string' },
        avgRR: { type: 'string' },
        bestRR: { type: 'string' },
        worstRR: { type: 'string' },
        expectancy: { type: 'string' },
        profitFactor: { type: 'string' },
        sharpeRatio: { type: 'string' },
        violationCount: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'create_journal_entry',
    description: `Create a journal entry (Mood) for a specific day with emotional state, trade reflections, and TTFM checklist.

Args:
  - day (string, required): Date (ISO 8601, e.g. "2024-01-15")
  - mood (string, required): Mood label (e.g. "focused", "anxious", "confident", "tilted", "neutral")
  - emotionValue (number, optional): 0-100 emotion score (default 50)
  - journalContent (string, optional): Detailed journal text
  - tradeIds (string[], optional): Trade IDs to link to this entry

Returns: Created mood entry object`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        day: { type: 'string', description: 'Date (ISO 8601, e.g. "2024-01-15")' },
        mood: { type: 'string', description: 'Mood label: focused, anxious, confident, tilted, neutral, etc.' },
        emotionValue: { type: 'number', description: 'Emotion score 0-100 (default 50)' },
        journalContent: { type: 'string', description: 'Detailed journal text' },
        tradeIds: { type: 'array', items: { type: 'string' }, description: 'Trade IDs to link to this entry' },
      },
      required: ['day', 'mood'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        day: { type: 'string', format: 'date-time' },
        mood: { type: 'string' },
        emotionValue: { type: 'number' },
        journalContent: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'analyze_trade',
    description: `Deep single-trade analysis using TradeAnalytics (MAE/MFE, efficiency, RR).
Args:
  - tradeId (string, required): The trade ID to analyze
Returns: Trade basics plus MAE, MFE, riskRewardRatio, efficiency from TradeAnalytics, and computed risk %`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string', description: 'The trade ID to analyze' },
      },
      required: ['tradeId'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        instrument: { type: 'string' },
        side: { type: 'string' },
        quantity: { type: 'number' },
        entryPrice: { type: 'number' },
        closePrice: { type: 'number' },
        pnl: { type: 'number' },
        commission: { type: 'number' },
        entryDate: { type: 'string', format: 'date-time' },
        closeDate: { type: 'string', format: 'date-time' },
        tags: { type: 'array', items: { type: 'string' } },
        mae: { type: 'number' },
        mfe: { type: 'number' },
        riskRewardRatio: { type: 'number' },
        efficiency: { type: 'number' },
        riskPct: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'run_monte_carlo',
    description: `Run Monte Carlo simulations based on user's trade history to estimate ruin probability.
Args:
  - accountId (string, optional): Filter to a specific account
  - simulations (number, optional): Number of simulations to run (default 1000, max 10000)
Returns: Simulation results with ruin probability, median outcome, worst 5% and best 5% outcomes`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID to filter trades' },
        simulations: { type: 'number', description: 'Number of simulations (default 1000, max 10000)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        simulations: { type: 'number' },
        tradeCount: { type: 'number' },
        initialBalance: { type: 'number' },
        parameters: {
          type: 'object',
          properties: {
            winRate: { type: 'number' },
            avgWin: { type: 'number' },
            avgLoss: { type: 'number' },
          },
        },
        results: {
          type: 'object',
          properties: {
            ruinProbability: { type: 'number' },
            medianOutcome: { type: 'number' },
            worst5PercentOutcome: { type: 'number' },
            best5PercentOutcome: { type: 'number' },
            expectedOutcome: { type: 'number' },
          },
        },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'suggest_position_size',
    description: `Dynamic position sizing based on account health and risk parameters.
Args:
  - accountId (string, optional): Specific account ID
  - targetRiskPct (number, required): % of account to risk (e.g. 0.5 for 0.5%)
  - stopLossPct (number, required): Stop loss distance in % (e.g. 2 for 2%)
  - accountSize (number, optional): Override account size
Returns: Suggested position size with risk amount, account balance, and warnings`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID' },
        targetRiskPct: { type: 'number', description: '% of account to risk (e.g. 0.5 for 0.5%)' },
        stopLossPct: { type: 'number', description: 'Stop loss distance in % (e.g. 2 for 2%)' },
        accountSize: { type: 'number', description: 'Override account size' },
      },
      required: ['targetRiskPct', 'stopLossPct'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        suggestedSize: { type: 'number' },
        riskAmount: { type: 'number' },
        accountBalance: { type: 'number' },
        drawdownAdjustment: { type: 'number' },
        drawdownPct: { type: 'number' },
        targetRiskPct: { type: 'number' },
        stopLossPct: { type: 'number' },
        warnings: { type: 'array', items: { type: 'string' } },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_behavioral_patterns',
    description: `Analyze correlation between Mood entries and trading performance over a lookback period.
Shows average PnL grouped by emotional state, best/worst performing moods, and trading frequency per mood.

Args:
  - days (number, optional): Lookback period in days (default 90)

Returns: Mood-performance breakdown, best/worst mood, total entries, period days`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        days: { type: 'number', description: 'Lookback period in days (default 90)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        moodPerformance: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
        mood: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            score: { type: 'number' },
          },
        },
              tradeCount: { type: 'number' },
              avgPnL: { type: 'number' },
              totalPnL: { type: 'number' },
            },
          },
        },
        bestMood: { type: 'string' },
        worstMood: { type: 'string' },
        totalEntries: { type: 'number' },
        periodDays: { type: 'number' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_prop_compliance',
    description: `Check a trading account against prop firm rules and challenge requirements.
Evaluates max daily loss, max total loss, profit target progress, min trading days,
trailing drawdown status, payout eligibility, and compares against PropFirmRule entries.

Args:
  - accountId (string, optional): Specific account ID (defaults to first evaluation account)

Returns: Compliance report with rules, violations, and overall status`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID (defaults to first evaluation account)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string' },
        propfirm: { type: 'string' },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rule: { type: 'string' },
              status: { type: 'string' },
              detail: { type: 'string' },
            },
          },
        },
        overallCompliant: { type: 'boolean' },
        violations: { type: 'array', items: { type: 'string' } },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'get_challenge_progress',
    description: `Track progress on active prop firm challenges.
Shows current PnL vs target, progress %, days traded, drawdown usage, and whether
the account is on track to pass the challenge.

Args:
  - accountId (string, optional): Specific account ID (defaults to first evaluation account)

Returns: Challenge progress snapshot with phase, profit target, drawdown, and on-track status`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        accountId: { type: 'string', description: 'Optional account ID (defaults to first evaluation account)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string' },
        challengePhase: { type: 'string' },
        targetProfit: { type: 'number' },
        currentProfit: { type: 'number' },
        progressPct: { type: 'number' },
        daysTraded: { type: 'number' },
        minDaysRequired: { type: 'number' },
        daysRemaining: { type: 'number' },
        maxDrawdownUsed: { type: 'number' },
        drawdownLimit: { type: 'number' },
        onTrack: { type: 'boolean' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'update_trade_tags',
    description: `Update the tags on a specific trade. Replaces existing tags with the provided array.
Verifies the trade belongs to the authenticated user.

Args:
  - tradeId (string, required): The trade ID
  - tags (string[], required): New tags array

Returns: Updated trade id and tags`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string', description: 'The trade ID' },
        tags: { type: 'array', items: { type: 'string' }, description: 'New tags array' },
      },
      required: ['tradeId', 'tags'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'add_trade_review_note',
    description: `Add a review comment to a specific trade. Updates the trade's comment field.
Verifies the trade belongs to the authenticated user.

Args:
  - tradeId (string, required): The trade ID
  - comment (string, required): Review note text

Returns: Trade id and updated comment`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        tradeId: { type: 'string', description: 'The trade ID' },
        comment: { type: 'string', description: 'Review note' },
      },
      required: ['tradeId', 'comment'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        comment: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'generate_daily_briefing',
    description: `Generate a structured daily trading summary using platform data (no external AI).
Aggregates trades for the day, includes mood entry, win rate, best/worst trade,
compares to previous day, account health snapshot, and risk flags.

Args:
  - date (string, optional): Date to summarize (ISO 8601, default: today)

Returns: Structured daily briefing with all aggregated data`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        date: { type: 'string', description: 'Date to summarize (ISO 8601, e.g. "2024-01-15")' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        tradeCount: { type: 'number' },
        totalPnL: { type: 'number' },
        winRate: { type: 'string' },
        wins: { type: 'number' },
        losses: { type: 'number' },
        bestTrade: { type: 'object', properties: { id: { type: 'string' }, pnl: { type: 'number' }, instrument: { type: 'string' } } },
        worstTrade: { type: 'object', properties: { id: { type: 'string' }, pnl: { type: 'number' }, instrument: { type: 'string' } } },
        previousDayPnL: { type: 'number' },
        pnlChange: { type: 'number' },
        mood: { type: 'string' },
        accountSnapshot: { type: 'array', items: { type: 'object' } },
        riskFlags: { type: 'array', items: { type: 'string' } },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'brutal_journal_audit',
    description: `No-mercy review of the last N trades for emotional patterns, risk violations,
and improvement areas. Checks: risk > 2% violations, low RR trades (< 1:1),
overtrading (> 5/day), emotional state patterns. Returns aggregated violations,
emotional patterns, suggestions, and overall grade.

Args:
  - limit (number, optional): Number of trades to review (default 20, max 100)

Returns: Audit report with violations, emotional patterns, suggestions, and grade`,
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: { type: 'number', description: 'Number of trades to review (default 20, max 100)' },
      },
    },
    outputSchema: {
      type: 'object',
      properties: {
        tradesReviewed: { type: 'number' },
        violations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              count: { type: 'number' },
              examples: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        emotionalPatterns: { type: 'array', items: { type: 'object' } },
        suggestions: { type: 'array', items: { type: 'string' } },
        overallGrade: { type: 'string' },
      },
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
]

export async function handleMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext): Promise<McpToolResult> {
  switch (toolName) {
    case 'get_account_health':
      return await getAccountHealth(ctx, args)
    case 'get_risk_metrics':
      return await getRiskMetrics(ctx, args)
    case 'create_journal_entry':
      return await createJournalEntry(ctx, args)
    case 'analyze_trade':
      return await analyzeTrade(ctx, args)
    case 'run_monte_carlo':
      return await runMonteCarlo(ctx, args)
    case 'suggest_position_size':
      return await suggestPositionSize(ctx, args)
    case 'list_accounts':
      return await listAccounts(ctx)
    case 'get_account_details':
      return await getAccountDetails(ctx, requireParam(args, 'accountId'))
    case 'list_trades':
      return await listTrades(ctx, args)
    case 'get_performance_summary':
      return await getPerformanceSummary(ctx, args)
    case 'get_user_profile':
      return await getUserProfile(ctx)
    case 'list_tags':
      return await listTags(ctx)
    case 'get_behavioral_patterns':
      return await getBehavioralPatterns(ctx, args)
    case 'get_prop_compliance':
      return await getPropCompliance(ctx, args)
    case 'get_challenge_progress':
      return await getChallengeProgress(ctx, args)
    case 'update_trade_tags':
      return await updateTradeTags(ctx, args)
    case 'add_trade_review_note':
      return await addTradeReviewNote(ctx, args)
    case 'generate_daily_briefing':
      return await generateDailyBriefing(ctx, args)
    case 'brutal_journal_audit':
      return await brutalJournalAudit(ctx, args)
    default:
      return toolError(`Unknown tool: ${toolName}`)
  }
}

async function getRiskMetrics(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const dateFilter = buildDateFilter(args)
  const where: Record<string, unknown> = { userId: ctx.userId }
  if (dateFilter) where.entryDate = dateFilter
  if (typeof args.accountId === 'string' && args.accountId) {
    where.accountNumber = args.accountId
  }

  const trades = await prisma.trade.findMany({
    where: where as Parameters<typeof prisma.trade.findMany>[0]['where'],
    orderBy: { entryDate: 'asc' },
    select: { pnl: true, entryPrice: true, closePrice: true, entryDate: true },
  })

  if (!trades.length) {
    return toolSuccess({ message: 'No trades in selected period' })
  }

  const pnls = trades.map((t) => Number(t.pnl))
  const totalPnL = pnls.reduce((s, v) => s + v, 0)
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const winRate = trades.length > 0 ? wins.length / trades.length : 0

  // Running max drawdown
  let runningSum = 0
  let peak = 0
  let maxDD = 0
  for (const p of pnls) {
    runningSum += p
    if (runningSum > peak) peak = runningSum
    const dd = peak - runningSum
    if (dd > maxDD) maxDD = dd
  }

  // Risk per trade (|entry - close| / entry as proxy when quantity unknown)
  const riskPcts = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return Math.abs(Number(t.closePrice) - entry) / entry * 100
  })
  const avgRiskPerTrade = riskPcts.length > 0
    ? (riskPcts.reduce((s, v) => s + v, 0) / riskPcts.length).toFixed(2)
    : '0.00'

  // RR distribution using entry/close for each trade
  const rrs = trades.map((t) => {
    const entry = Number(t.entryPrice)
    if (entry === 0) return 0
    return (Number(t.closePrice) - entry) / entry
  })
  const validRRs = rrs.filter((r) => r !== 0)
  const avgRR = validRRs.length > 0
    ? (validRRs.reduce((s, v) => s + v, 0) / validRRs.length).toFixed(2)
    : '0.00'
  const bestRR = validRRs.length > 0 ? Math.max(...validRRs).toFixed(2) : '0.00'
  const worstRR = validRRs.length > 0 ? Math.min(...validRRs).toFixed(2) : '0.00'

  // Expectancy
  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss

  // Profit factor
  const totalWinAmount = wins.reduce((s, v) => s + v, 0)
  const totalLossAmount = Math.abs(losses.reduce((s, v) => s + v, 0))
  const profitFactor = totalLossAmount > 0 ? (totalWinAmount / totalLossAmount) : totalWinAmount > 0 ? Infinity : 0

  // Simple Sharpe-like ratio (PnL / std of PnL)
  const meanPnL = totalPnL / trades.length
  const variance = pnls.reduce((s, v) => s + (v - meanPnL) ** 2, 0) / trades.length
  const stdPnL = Math.sqrt(variance)
  const sharpeRatio = stdPnL > 0 ? (meanPnL / stdPnL * Math.sqrt(trades.length)).toFixed(2) : '0.00'

  // Violation count: trades where risk > 2% (proxy)
  const violationCount = riskPcts.filter((r) => r > 2).length

  return toolSuccess({
    totalTrades: trades.length,
    maxDrawdown: Math.round(maxDD * 100) / 100,
    maxDrawdownPct: peak > 0 ? ((maxDD / peak) * 100).toFixed(1) : '0.0',
    avgRiskPerTrade: `${avgRiskPerTrade}%`,
    avgRR,
    bestRR: `${bestRR}:1`,
    worstRR: `${worstRR}:1`,
    expectancy: expectancy.toFixed(2),
    profitFactor: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
    sharpeRatio,
    violationCount,
  })
}

async function createJournalEntry(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const day = requireParam(args, 'day')
  const mood = requireParam(args, 'mood')
  const emotionValue = typeof args.emotionValue === 'number'
    ? Math.min(100, Math.max(0, Math.floor(args.emotionValue)))
    : 50
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : ''
  const tradeIds = Array.isArray(args.tradeIds) ? args.tradeIds.filter((t): t is string => typeof t === 'string') : []

  const dayDate = new Date(day)
  if (Number.isNaN(dayDate.getTime())) {
    return toolError('Invalid day format. Use ISO 8601 (e.g. "2024-01-15")')
  }

  const existing = await prisma.mood.findUnique({
    where: { userId_day: { userId: ctx.userId, day: dayDate } },
  })

  if (existing) {
    // Update existing entry
    const updated = await prisma.mood.update({
      where: { id: existing.id },
      data: {
        mood,
        emotionValue,
        journalContent: journalContent || existing.journalContent,
        selectedNews: tradeIds.length > 0 ? tradeIds : existing.selectedNews,
      },
    })
    return toolSuccess(updated)
  }

  // Create new entry
  const created = await prisma.mood.create({
    data: {
      userId: ctx.userId,
      day: dayDate,
      mood,
      emotionValue,
      journalContent,
      selectedNews: tradeIds,
      hasTradingExperience: tradeIds.length > 0,
    },
  })
  return toolSuccess(created)
}

async function listAccounts(ctx: McpAuthContext) {
  const accounts = await prisma.account.findMany({
    where: { userId: ctx.userId },
    select: { id: true, number: true, propfirm: true, accountSize: true, startingBalance: true, createdAt: true },
  })
  return toolSuccess(accounts)
}

async function getAccountDetails(ctx: McpAuthContext, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: ctx.userId },
    include: { trades: { take: 10, orderBy: { entryDate: 'desc' } } },
  })
  if (!account) return toolError('Account not found')
  return toolSuccess(account)
}

async function listTrades(ctx: McpAuthContext, args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 200, 50)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { userId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter
  const trades = await prisma.trade.findMany({
    where: where as Parameters<typeof prisma.trade.findMany>[0]['where'],
    orderBy: { entryDate: 'desc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(trades)
}

async function getPerformanceSummary(ctx: McpAuthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { userId: ctx.userId }
  const dateFilter = buildDateFilter(args)
  if (dateFilter) where.entryDate = dateFilter

  const [totals, winCount, lossCount, winSum, lossSum] = await Promise.all([
    prisma.trade.aggregate({
      where: where as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true, commission: true },
      _count: { id: true },
    }),
    prisma.trade.count({
      where: { ...where, pnl: { gt: 0 } } as Parameters<typeof prisma.trade.count>[0]['where'],
    }),
    prisma.trade.count({
      where: { ...where, pnl: { lt: 0 } } as Parameters<typeof prisma.trade.count>[0]['where'],
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { gt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
    prisma.trade.aggregate({
      where: { ...where, pnl: { lt: 0 } } as Parameters<typeof prisma.trade.aggregate>[0]['where'],
      _sum: { pnl: true },
    }),
  ])

  const totalTrades = totals._count.id
  const grossPnL = Number(totals._sum.pnl ?? 0)
  const totalCommission = Number(totals._sum.commission ?? 0)
  const netPnL = grossPnL - totalCommission
  const totalWinAmount = Number(winSum._sum.pnl ?? 0)
  const totalLossAmount = Number(lossSum._sum.pnl ?? 0)

  const summary = {
    totalTrades,
    grossPnL: grossPnL.toFixed(2),
    netPnL: netPnL.toFixed(2),
    winRate: totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0.0',
    totalWins: winCount,
    totalLosses: lossCount,
    avgWin: winCount > 0 ? (totalWinAmount / winCount).toFixed(2) : '0.00',
    avgLoss: lossCount > 0 ? (totalLossAmount / lossCount).toFixed(2) : '0.00',
    profitFactor: totalLossAmount !== 0
      ? (Math.abs(totalWinAmount / totalLossAmount)).toFixed(2)
      : 'N/A',
  }
  return toolSuccess(summary)
}

async function getUserProfile(ctx: McpAuthContext) {
  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { id: true, username: true, email: true, language: true, createdAt: true },
  })
  if (!user) return toolError('User not found')
  return toolSuccess({
    ...user,
    email: maskEmail(user.email),
  })
}

async function listTags(ctx: McpAuthContext) {
  const tags = await prisma.tag.findMany({ where: { userId: ctx.userId } })
  return toolSuccess(tags)
}

async function analyzeTrade(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeId = requireParam(args, 'tradeId')

  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId: ctx.userId },
  })

  if (!trade) {
    return toolError('Trade not found')
  }

  const analytics = await prisma.tradeAnalytics.findUnique({
    where: { tradeId: trade.id },
  })

  const entryPrice = Number(trade.entryPrice)
  const riskPct = entryPrice !== 0
    ? (Math.abs(Number(trade.closePrice) - entryPrice) / entryPrice * 100)
    : 0

  return toolSuccess({
    id: trade.id,
    instrument: trade.instrument,
    side: trade.side,
    quantity: Number(trade.quantity),
    entryPrice: Number(trade.entryPrice),
    closePrice: Number(trade.closePrice),
    pnl: Number(trade.pnl),
    commission: Number(trade.commission),
    entryDate: trade.entryDate,
    closeDate: trade.closeDate,
    tags: trade.tags,
    ...(analytics
      ? {
          mae: Number(analytics.mae),
          mfe: Number(analytics.mfe),
          riskRewardRatio: analytics.riskRewardRatio ? Number(analytics.riskRewardRatio) : null,
          efficiency: analytics.efficiency ? Number(analytics.efficiency) : null,
        }
      : { mae: null, mfe: null, riskRewardRatio: null, efficiency: null }),
    riskPct: Number(riskPct.toFixed(2)),
  })
}

async function runMonteCarlo(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : undefined
  const simulations = clampInt(args.simulations, 1, 10000, 1000)

  let initialBalance = 10000
  let accountNumber: string | undefined

  if (accountId) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: ctx.userId },
    })
    if (account) {
      initialBalance = Number(account.startingBalance)
      accountNumber = account.number
    }
  } else {
    const firstAccount = await prisma.account.findFirst({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'asc' },
    })
    if (firstAccount) {
      initialBalance = Number(firstAccount.startingBalance)
    }
  }

  const where: Record<string, unknown> = { userId: ctx.userId }
  if (accountNumber) {
    where.accountNumber = accountNumber
  }

  const trades = await prisma.trade.findMany({
    where: where as Parameters<typeof prisma.trade.findMany>[0]['where'],
    select: { pnl: true },
  })

  if (trades.length < 5) {
    return toolError('Need at least 5 trades to run Monte Carlo simulation')
  }

  const pnls = trades.map((t) => Number(t.pnl))
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const winRate = wins.length / pnls.length
  const avgWin = wins.length > 0 ? wins.reduce((s, v) => s + v, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, v) => s + v, 0) / losses.length) : 0

  const outcomes: number[] = []
  let ruinCount = 0

  for (let sim = 0; sim < simulations; sim++) {
    let balance = initialBalance
    let ruined = false

    for (let i = 0; i < trades.length; i++) {
      const randomPnl = pnls[Math.floor(Math.random() * pnls.length)]
      balance += randomPnl
      if (balance <= 0) {
        ruined = true
        break
      }
    }

    if (ruined) ruinCount++
    outcomes.push(balance)
  }

  outcomes.sort((a, b) => a - b)

  const medianIndex = Math.floor(outcomes.length / 2)
  const worst5Index = Math.floor(outcomes.length * 0.05)
  const best5Index = Math.floor(outcomes.length * 0.95)

  return toolSuccess({
    simulations,
    tradeCount: trades.length,
    initialBalance,
    parameters: {
      winRate: Number((winRate * 100).toFixed(1)),
      avgWin: Number(avgWin.toFixed(2)),
      avgLoss: Number(avgLoss.toFixed(2)),
    },
    results: {
      ruinProbability: Number(((ruinCount / simulations) * 100).toFixed(1)),
      medianOutcome: Number(outcomes[medianIndex].toFixed(2)),
      worst5PercentOutcome: Number(outcomes[worst5Index].toFixed(2)),
      best5PercentOutcome: Number(outcomes[best5Index].toFixed(2)),
      expectedOutcome: Number((outcomes.reduce((s, v) => s + v, 0) / outcomes.length).toFixed(2)),
    },
  })
}

async function suggestPositionSize(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const targetRiskPct = Number(args.targetRiskPct)
  const stopLossPct = Number(args.stopLossPct)

  if (!Number.isFinite(targetRiskPct) || targetRiskPct <= 0) {
    return toolError('targetRiskPct must be a positive number')
  }
  if (!Number.isFinite(stopLossPct) || stopLossPct <= 0) {
    return toolError('stopLossPct must be a positive number')
  }

  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : undefined
  const accountSizeOverride = typeof args.accountSize === 'number' ? args.accountSize : undefined
  const warnings: string[] = []

  let balance: number
  let drawdownPct = 0

  if (accountSizeOverride) {
    balance = accountSizeOverride
  } else {
    let account
    if (accountId) {
      account = await prisma.account.findFirst({
        where: { id: accountId, userId: ctx.userId },
      })
      if (!account) return toolError('Account not found')
    } else {
      account = await prisma.account.findFirst({
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'asc' },
      })
      if (!account) return toolError('No accounts found and no accountSize provided')
    }

    const trades = await prisma.trade.findMany({
      where: { accountNumber: account.number, userId: ctx.userId },
      select: { pnl: true, entryDate: true },
      orderBy: { entryDate: 'asc' },
    })

    const totalPnL = trades.reduce((sum, t) => sum + Number(t.pnl), 0)
    balance = Number(account.startingBalance) + totalPnL
    const drawdownThreshold = Number(account.drawdownThreshold)

    let runningSum = 0
    let peak = Number(account.startingBalance)
    let maxDD = 0
    for (const t of trades) {
      runningSum += Number(t.pnl)
      const currentVal = Number(account.startingBalance) + runningSum
      if (currentVal > peak) peak = currentVal
      const dd = peak - currentVal
      if (dd > maxDD) maxDD = dd
    }
    drawdownPct = drawdownThreshold > 0 ? (maxDD / drawdownThreshold) * 100 : 0
  }

  let drawdownAdjustment = 1.0
  if (drawdownPct > 50) {
    drawdownAdjustment = 0.5
    warnings.push(`Drawdown at ${drawdownPct.toFixed(1)}% of max allowed — risk reduced by 50%`)
  }

  const adjustedRiskPct = targetRiskPct * drawdownAdjustment
  const riskAmount = balance * (adjustedRiskPct / 100)
  const suggestedSize = stopLossPct > 0 ? riskAmount / (stopLossPct / 100) : 0

  return toolSuccess({
    suggestedSize: Number(suggestedSize.toFixed(2)),
    riskAmount: Number(riskAmount.toFixed(2)),
    accountBalance: Number(balance.toFixed(2)),
    drawdownAdjustment,
    drawdownPct: Number(drawdownPct.toFixed(1)),
    targetRiskPct,
    stopLossPct,
    warnings,
  })
}

async function getBehavioralPatterns(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const days = clampInt(args.days, 1, 365, 90)
  const since = new Date()
  since.setDate(since.getDate() - days)

  const moods = await prisma.mood.findMany({
    where: { userId: ctx.userId, day: { gte: since } },
    orderBy: { day: 'asc' },
  })

  if (!moods.length) {
    return toolSuccess({
      moodPerformance: [],
      bestMood: null,
      worstMood: null,
      totalEntries: 0,
      periodDays: days,
    })
  }

  const moodEnd = new Date(moods[moods.length - 1].day)
  moodEnd.setDate(moodEnd.getDate() + 1)

  const trades = await prisma.trade.findMany({
    where: {
      userId: ctx.userId,
      entryDate: { gte: since, lte: moodEnd },
    },
    select: { pnl: true, entryDate: true },
  })

  const moodByDate = new Map<string, { mood: string; emotionValue: number }>()
  for (const m of moods) {
    moodByDate.set(m.day.toISOString().slice(0, 10), { mood: m.mood, emotionValue: m.emotionValue })
  }

  const moodGroups = new Map<string, { mood: string; pnls: number[] }>()

  for (const t of trades) {
    const dateKey = t.entryDate.toISOString().slice(0, 10)
    const moodInfo = moodByDate.get(dateKey)
    if (!moodInfo) continue
    if (!moodGroups.has(moodInfo.mood)) {
      moodGroups.set(moodInfo.mood, { mood: moodInfo.mood, pnls: [] })
    }
    moodGroups.get(moodInfo.mood)!.pnls.push(Number(t.pnl))
  }

  const moodPerformance = Array.from(moodGroups.entries()).map(([, data]) => {
    const totalPnL = data.pnls.reduce((s, v) => s + v, 0)
    return {
      mood: data.mood,
      tradeCount: data.pnls.length,
      avgPnL: Number((totalPnL / data.pnls.length).toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
    }
  })

  moodPerformance.sort((a, b) => b.avgPnL - a.avgPnL)

  return toolSuccess({
    moodPerformance,
    bestMood: moodPerformance.length > 0 ? moodPerformance[0].mood : null,
    worstMood: moodPerformance.length > 0 ? moodPerformance[moodPerformance.length - 1].mood : null,
    totalEntries: moods.length,
    periodDays: days,
  })
}

async function getPropCompliance(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : undefined

  let account
  if (accountId) {
    account = await prisma.account.findFirst({ where: { id: accountId, userId: ctx.userId } })
  } else {
    account = await prisma.account.findFirst({
      where: { userId: ctx.userId, evaluation: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (!account) return toolError('No evaluation account found')

  const trades = await prisma.trade.findMany({
    where: { accountNumber: account.number, userId: ctx.userId },
    select: { pnl: true, entryDate: true },
    orderBy: { entryDate: 'asc' },
  })

  const totalPnL = trades.reduce((s, t) => s + Number(t.pnl), 0)
  const currentBalance = Number(account.startingBalance) + totalPnL
  const ddThreshold = Number(account.drawdownThreshold)
  const maxDailyLoss = Number(account.dailyLoss)
  const profitTarget = Number(account.profitTarget)

  let runningSum = 0
  let peak = 0
  let maxDD = 0
  for (const t of trades) {
    runningSum += Number(t.pnl)
    if (runningSum > peak) peak = runningSum
    const dd = peak - runningSum
    if (dd > maxDD) maxDD = dd
  }

  const highWaterMark = Number(account.startingBalance) + peak

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayPnL = trades.filter(t => t.entryDate >= today).reduce((s, t) => s + Number(t.pnl), 0)

  const propFirm = await prisma.propFirm.findFirst({
    where: {
      OR: [
        { name: account.propfirm },
        { slug: account.propfirm },
      ],
    },
    include: { rules: { where: { isActive: true } } },
  })

  const rules: Array<{ rule: string; status: string; detail: string }> = []
  const violations: string[] = []

  if (maxDailyLoss > 0) {
    const dailyLossUsed = Math.abs(todayPnL)
    const compliant = dailyLossUsed <= maxDailyLoss
    rules.push({
      rule: 'Max Daily Loss',
      status: compliant ? 'pass' : 'fail',
      detail: compliant
        ? `${dailyLossUsed.toFixed(2)} used of ${maxDailyLoss.toFixed(2)} limit`
        : `${dailyLossUsed.toFixed(2)} exceeds limit of ${maxDailyLoss.toFixed(2)}`,
    })
    if (!compliant) violations.push(`Max daily loss exceeded: ${dailyLossUsed.toFixed(2)} / ${maxDailyLoss.toFixed(2)}`)
  }

  if (ddThreshold > 0) {
    const compliant = maxDD <= ddThreshold
    rules.push({
      rule: 'Max Total Loss',
      status: compliant ? 'pass' : 'fail',
      detail: compliant
        ? `${maxDD.toFixed(2)} drawn of ${ddThreshold.toFixed(2)} limit`
        : `${maxDD.toFixed(2)} exceeds limit of ${ddThreshold.toFixed(2)}`,
    })
    if (!compliant) violations.push(`Max total loss exceeded: ${maxDD.toFixed(2)} / ${ddThreshold.toFixed(2)}`)
  }

  const profitTargetProgress = profitTarget > 0 ? (totalPnL / profitTarget) * 100 : 0
  if (profitTarget > 0) {
    rules.push({
      rule: 'Profit Target',
      status: totalPnL >= profitTarget ? 'pass' : 'in_progress',
      detail: `${totalPnL.toFixed(2)} / ${profitTarget.toFixed(2)} (${profitTargetProgress.toFixed(1)}%)`,
    })
  }

  const uniqueTradeDays = new Set(trades.map(t => t.entryDate.toISOString().slice(0, 10))).size
  const minDays = account.minTradingDaysForPayout || account.minDays || 0
  if (minDays > 0) {
    const compliant = uniqueTradeDays >= minDays
    rules.push({
      rule: 'Minimum Trading Days',
      status: compliant ? 'pass' : 'in_progress',
      detail: `${uniqueTradeDays} / ${minDays} days`,
    })
  }

  if (account.trailingDrawdown && Number(account.trailingStopProfit || 0) > 0) {
    const trailingThreshold = Number(account.trailingStopProfit)
    const trailingActive = totalPnL >= trailingThreshold
    const trailingStopLevel = trailingActive ? Math.max(0, highWaterMark - ddThreshold) : 0
    const trailingDDUsed = trailingActive ? Math.max(0, highWaterMark - currentBalance) : 0
    const trailingCompliant = !trailingActive || trailingDDUsed <= ddThreshold

    rules.push({
      rule: 'Trailing Drawdown',
      status: trailingActive ? (trailingCompliant ? 'active' : 'breached') : 'inactive',
      detail: trailingActive
        ? `Stop level at ${trailingStopLevel.toFixed(2)}, drawdown used: ${trailingDDUsed.toFixed(2)} / ${ddThreshold.toFixed(2)}`
        : `Not yet active (${totalPnL.toFixed(2)} / ${trailingThreshold.toFixed(2)} threshold)`,
    })
    if (trailingActive && !trailingCompliant) {
      violations.push(`Trailing drawdown breached: ${trailingDDUsed.toFixed(2)} exceeds limit of ${ddThreshold.toFixed(2)}`)
    }
  }

  if (account.evaluation) {
    const payoutEligible = profitTargetProgress >= 100 && uniqueTradeDays >= (account.minTradingDaysForPayout || 0)
    const minPayout = Number(account.minPayout || 0)
    const profitSharing = Number(account.profitSharing || 0)
    rules.push({
      rule: 'Payout Eligibility',
      status: payoutEligible ? 'eligible' : 'not_eligible',
      detail: payoutEligible
        ? `Eligible${minPayout > 0 ? ` (min $${minPayout.toFixed(2)})` : ''}${profitSharing > 0 ? ` at ${profitSharing}% profit share` : ''}`
        : `Target: ${profitTargetProgress.toFixed(1)}%, Days: ${uniqueTradeDays}/${account.minTradingDaysForPayout || 0}`,
    })
  }

  if (propFirm && propFirm.rules.length > 0) {
    for (const rule of propFirm.rules) {
      const ruleLower = rule.ruleType.toLowerCase()
      let matched = false
      if (ruleLower.includes('daily_loss') || ruleLower.includes('daily loss')) {
        const ruleVal = parseFloat(rule.value)
        if (!Number.isNaN(ruleVal)) {
          const match = Math.abs(maxDailyLoss - ruleVal) < 0.01
          rules.push({
            rule: `PropFirm: ${rule.ruleType}`,
            status: match ? 'pass' : 'review',
            detail: match
              ? `Account matches rule: ${rule.value}`
              : `Rule requires ${rule.value}, account has ${maxDailyLoss.toFixed(2)}`,
          })
          matched = true
        }
      } else if (ruleLower.includes('total_loss') || ruleLower.includes('total loss') || ruleLower.includes('drawdown')) {
        const ruleVal = parseFloat(rule.value)
        if (!Number.isNaN(ruleVal)) {
          const match = Math.abs(ddThreshold - ruleVal) < 0.01
          rules.push({
            rule: `PropFirm: ${rule.ruleType}`,
            status: match ? 'pass' : 'review',
            detail: match
              ? `Account matches rule: ${rule.value}`
              : `Rule requires ${rule.value}, account has ${ddThreshold.toFixed(2)}`,
          })
          matched = true
        }
      }
      if (!matched) {
        rules.push({
          rule: `PropFirm: ${rule.ruleType}`,
          status: 'info',
          detail: `${rule.description || rule.ruleType}: ${rule.value}`,
        })
      }
    }
  }

  const overallCompliant = violations.length === 0

  return toolSuccess({
    accountId: account.id,
    propfirm: account.propfirm,
    rules,
    overallCompliant,
    violations,
  })
}

async function getChallengeProgress(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const accountId = typeof args.accountId === 'string' && args.accountId ? args.accountId : undefined

  let account
  if (accountId) {
    account = await prisma.account.findFirst({ where: { id: accountId, userId: ctx.userId } })
  } else {
    account = await prisma.account.findFirst({
      where: { userId: ctx.userId, evaluation: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (!account) return toolError('No evaluation account found')

  const trades = await prisma.trade.findMany({
    where: { accountNumber: account.number, userId: ctx.userId },
    select: { pnl: true, entryDate: true },
    orderBy: { entryDate: 'asc' },
  })

  const totalPnL = trades.reduce((s, t) => s + Number(t.pnl), 0)
  const profitTarget = Number(account.profitTarget)
  const drawdownLimit = Number(account.drawdownThreshold)

  let runningSum = 0
  let peak = 0
  let maxDD = 0
  for (const t of trades) {
    runningSum += Number(t.pnl)
    const currentVal = Number(account.startingBalance) + runningSum
    if (currentVal > peak) peak = currentVal
    const dd = peak - currentVal
    if (dd > maxDD) maxDD = dd
  }

  const progressPct = profitTarget > 0 ? (totalPnL / profitTarget) * 100 : 0
  const daysTraded = new Set(trades.map(t => t.entryDate.toISOString().slice(0, 10))).size
  const minDaysRequired = account.minTradingDaysForPayout || account.minDays || 0
  const daysRemaining = Math.max(0, minDaysRequired - daysTraded)
  const onTrack = progressPct >= 100 && maxDD <= drawdownLimit && daysTraded >= minDaysRequired

  const challengePhase = !account.evaluation
    ? 'Funded'
    : progressPct >= 100
      ? 'Complete'
      : 'Evaluation'

  return toolSuccess({
    accountId: account.id,
    challengePhase,
    targetProfit: profitTarget,
    currentProfit: Number(totalPnL.toFixed(2)),
    progressPct: Number(progressPct.toFixed(1)),
    daysTraded,
    minDaysRequired,
    daysRemaining,
    maxDrawdownUsed: Number(maxDD.toFixed(2)),
    drawdownLimit,
    onTrack,
  })
}

async function updateTradeTags(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeId = requireParam(args, 'tradeId')
  const tags = args.tags
  if (!Array.isArray(tags) || !tags.every(t => typeof t === 'string')) {
    return toolError('tags must be an array of strings')
  }

  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId: ctx.userId },
    select: { id: true },
  })

  if (!trade) return toolError('Trade not found')

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { tags: tags as string[] },
    select: { id: true, tags: true },
  })

  return toolSuccess(updated)
}

async function addTradeReviewNote(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const tradeId = requireParam(args, 'tradeId')
  const comment = requireParam(args, 'comment')

  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId: ctx.userId },
    select: { id: true },
  })

  if (!trade) return toolError('Trade not found')

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { comment },
    select: { id: true, comment: true },
  })

  return toolSuccess(updated)
}

async function generateDailyBriefing(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const dateStr = typeof args.date === 'string' ? args.date : new Date().toISOString().slice(0, 10)
  const targetDate = new Date(dateStr)
  if (Number.isNaN(targetDate.getTime())) return toolError('Invalid date format')

  const dayStart = new Date(dateStr + 'T00:00:00.000Z')
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const prevDayStart = new Date(dayStart)
  prevDayStart.setDate(prevDayStart.getDate() - 1)

  const [dayTrades, prevDayTrades, mood, accounts] = await Promise.all([
    prisma.trade.findMany({
      where: { userId: ctx.userId, entryDate: { gte: dayStart, lt: dayEnd } },
      orderBy: { pnl: 'desc' },
    }),
    prisma.trade.findMany({
      where: { userId: ctx.userId, entryDate: { gte: prevDayStart, lt: dayStart } },
      select: { pnl: true },
    }),
    prisma.mood.findUnique({
      where: { userId_day: { userId: ctx.userId, day: dayStart } },
      select: { mood: true, emotionValue: true },
    }),
    prisma.account.findMany({
      where: { userId: ctx.userId },
      select: { id: true, number: true, propfirm: true, startingBalance: true, drawdownThreshold: true, buffer: true },
    }),
  ])

  const totalPnL = dayTrades.reduce((s, t) => s + Number(t.pnl), 0)
  const wins = dayTrades.filter(t => Number(t.pnl) > 0)
  const losses = dayTrades.filter(t => Number(t.pnl) < 0)
  const winRate = dayTrades.length > 0 ? (wins.length / dayTrades.length) * 100 : 0
  const prevPnL = prevDayTrades.reduce((s, t) => s + Number(t.pnl), 0)

  const bestTrade = dayTrades.length > 0
    ? { id: dayTrades[0].id, pnl: Number(dayTrades[0].pnl), instrument: dayTrades[0].instrument }
    : null
  const worstTrade = dayTrades.length > 0
    ? { id: dayTrades[dayTrades.length - 1].id, pnl: Number(dayTrades[dayTrades.length - 1].pnl), instrument: dayTrades[dayTrades.length - 1].instrument }
    : null

  const accountSnapshot = accounts.map(a => {
    const ddInfo = computeDrawdown(
      { startingBalance: Number(a.startingBalance), drawdownThreshold: Number(a.drawdownThreshold), buffer: Number(a.buffer) },
      Number(a.startingBalance),
    )
    return {
      id: a.id,
      number: a.number,
      propfirm: a.propfirm,
      drawdownUsedPct: ddInfo.drawdownUsedPct,
      atRisk: ddInfo.atRisk,
    }
  })

  const riskFlags: string[] = []
  for (const t of dayTrades) {
    const entry = Number(t.entryPrice)
    if (entry !== 0) {
      const riskPct = Math.abs(Number(t.closePrice) - entry) / entry * 100
      if (riskPct > 2) {
        riskFlags.push(`Trade ${t.id.slice(0, 8)} risk ${riskPct.toFixed(1)}% exceeds 2% threshold`)
      }
    }
  }

  return toolSuccess({
    date: dateStr,
    tradeCount: dayTrades.length,
    totalPnL: Number(totalPnL.toFixed(2)),
    winRate: winRate.toFixed(1),
    wins: wins.length,
    losses: losses.length,
    bestTrade,
    worstTrade,
    previousDayPnL: Number(prevPnL.toFixed(2)),
    pnlChange: totalPnL !== 0 || prevPnL !== 0 ? Number((totalPnL - prevPnL).toFixed(2)) : 0,
    mood: mood ? { label: mood.mood, score: mood.emotionValue } : null,
    accountSnapshot,
    riskFlags,
  })
}

async function brutalJournalAudit(ctx: McpAuthContext, args: Record<string, unknown>): Promise<McpToolResult> {
  const limit = clampInt(args.limit, 1, 100, 20)

  const trades = await prisma.trade.findMany({
    where: { userId: ctx.userId },
    orderBy: { entryDate: 'desc' },
    take: limit,
    select: {
      id: true,
      pnl: true,
      entryPrice: true,
      closePrice: true,
      entryDate: true,
      side: true,
      instrument: true,
    },
  })

  if (!trades.length) {
    return toolSuccess({ tradesReviewed: 0, violations: [], emotionalPatterns: [], suggestions: ['No trades to review'], overallGrade: 'N/A' })
  }

  // Get mood entries for the trade date range
  const tradeDates = trades.map(t => t.entryDate)
  const minDate = new Date(Math.min(...tradeDates.map(d => d.getTime())))
  minDate.setHours(0, 0, 0, 0)
  const maxDate = new Date(Math.max(...tradeDates.map(d => d.getTime())))
  maxDate.setDate(maxDate.getDate() + 1)

  const moods = await prisma.mood.findMany({
    where: { userId: ctx.userId, day: { gte: minDate, lte: maxDate } },
    select: { day: true, mood: true },
  })

  const moodByDate = new Map<string, string>()
  for (const m of moods) {
    moodByDate.set(m.day.toISOString().slice(0, 10), m.mood)
  }

  const tradesByDay = new Map<string, typeof trades>()
  for (const t of trades) {
    const dateKey = t.entryDate.toISOString().slice(0, 10)
    if (!tradesByDay.has(dateKey)) tradesByDay.set(dateKey, [])
    tradesByDay.get(dateKey)!.push(t)
  }

  interface ViolationAccum {
    type: string
    count: number
    examples: string[]
  }

  const overRiskTrades: string[] = []
  const lowRRTrades: string[] = []
  const overTradingDays: string[] = []
  const moodPnLMap = new Map<string, number[]>()
  const suggestions: Set<string> = new Set()

  for (const t of trades) {
    const entry = Number(t.entryPrice)
    const close = Number(t.closePrice)
    const pnl = Number(t.pnl)

    if (entry !== 0) {
      const riskPct = Math.abs(close - entry) / entry * 100
      if (riskPct > 2) {
        overRiskTrades.push(t.id.slice(0, 8))
        suggestions.add('Reduce position size — multiple trades exceed 2% risk')
      }

      const direction = t.side?.toUpperCase() === 'SHORT' ? -1 : 1
      const rr = (close - entry) / entry * direction
      if (rr > 0 && rr < 1) {
        lowRRTrades.push(t.id.slice(0, 8))
        suggestions.add('Aim for minimum 1:1 risk-reward ratio')
      }
    }

    const dateKey = t.entryDate.toISOString().slice(0, 10)
    const mood = moodByDate.get(dateKey)
    if (mood) {
      if (!moodPnLMap.has(mood)) moodPnLMap.set(mood, [])
      moodPnLMap.get(mood)!.push(pnl)
    }
  }

  for (const [dateKey, dayTrades] of tradesByDay.entries()) {
    if (dayTrades.length > 5) {
      overTradingDays.push(dateKey)
      suggestions.add(`Reduce trading frequency — overtrading detected on ${dateKey} (${dayTrades.length} trades)`)
    }
  }

  const violations: ViolationAccum[] = []
  if (overRiskTrades.length > 0) {
    violations.push({ type: 'risk_over_2pct', count: overRiskTrades.length, examples: overRiskTrades.slice(0, 5) })
  }
  if (lowRRTrades.length > 0) {
    violations.push({ type: 'low_rr', count: lowRRTrades.length, examples: lowRRTrades.slice(0, 5) })
  }
  if (overTradingDays.length > 0) {
    violations.push({ type: 'overtrading', count: overTradingDays.length, examples: overTradingDays.slice(0, 5) })
  }

  const emotionalPatterns = Array.from(moodPnLMap.entries()).map(([mood, pnls]) => {
    const totalPnL = pnls.reduce((s, v) => s + v, 0)
    return {
      mood,
      tradeCount: pnls.length,
      avgPnL: Number((totalPnL / pnls.length).toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
    }
  })
  emotionalPatterns.sort((a, b) => b.avgPnL - a.avgPnL)

  const violationCount = violations.reduce((s, v) => s + v.count, 0)
  const tradeCount = trades.length
  const violationRatio = tradeCount > 0 ? violationCount / tradeCount : 0

  let overallGrade: string
  if (violationRatio === 0) {
    overallGrade = 'A'
    suggestions.add('Excellent discipline — maintain current approach')
  } else if (violationRatio < 0.2) {
    overallGrade = 'B'
  } else if (violationRatio < 0.4) {
    overallGrade = 'C'
  } else if (violationRatio < 0.6) {
    overallGrade = 'D'
  } else {
    overallGrade = 'F'
  }

  return toolSuccess({
    tradesReviewed: tradeCount,
    violations,
    emotionalPatterns,
    suggestions: Array.from(suggestions),
    overallGrade,
  })
}

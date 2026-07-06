import { groupBy } from "@/lib/utils";
import { normalizeTrades, type AnalyticsTrade } from "@/lib/ai/trade-normalization";
import { getAiTrades } from "@/lib/ai/trade-access";
import { tool } from "ai";
import { z } from 'zod/v3';
import { isToday } from "date-fns";

interface TradeSummary {
    accountNumber: string;
    pnl: number;
    commission: number;
    longTrades: number;
    shortTrades: number;
    instruments: string[];
    tradeCount: number;
}

function generateTradeSummary(trades: AnalyticsTrade[]): TradeSummary[] {
    if (!trades || trades.length === 0) return [];

    const accountGroups = groupBy(trades, 'accountNumber');
    return Object.entries(accountGroups).map(([accountNumber, trades]) => {
        const accountPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
        const accountCommission = trades.reduce((sum, trade) => sum + trade.commission, 0);
        const longTrades = trades.filter(t => t.side?.toLowerCase() === 'long').length || 0;
        const shortTrades = trades.filter(t => t.side?.toLowerCase() === 'short').length || 0;
        const instruments = [...new Set(trades.map(t => t.instrument))];

        return {
            accountNumber,
            pnl: accountPnL - accountCommission,
            commission: accountCommission,
            longTrades,
            shortTrades,
            instruments,
            tradeCount: trades.length
        };
    });
}

export function createGetCurrentDayDataTool(userId?: string) {
  return tool({
    description: 'Get trades database for the current day.',
    inputSchema: z.object({}).catch({}),
    execute: async () => {
        if (!userId) return { error: 'AI editor tool executed without explicit user context — cross-user data access prevented' };
        const resolvedUserId = userId;
        const tradesResult = await getAiTrades({ userId: resolvedUserId, profile: 'detail' });
        const allTrades = tradesResult.trades || [];
        const filteredTrades = normalizeTrades(allTrades).filter(trade => {
            const tradeDate = trade.entryDate;
            return isToday(tradeDate);
        })

        return {
            summary: generateTradeSummary(filteredTrades),
            truncated: tradesResult.truncated,
            dataQualityWarning: tradesResult.dataQualityWarning,
        };
    },
  });
}

export const getCurrentDayData = createGetCurrentDayDataTool();

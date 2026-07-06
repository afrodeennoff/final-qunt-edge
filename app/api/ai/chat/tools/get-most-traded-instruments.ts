import { getAiTrades } from "@/lib/ai/trade-access";
import { tool } from "ai";
import { z } from 'zod/v3';

export function createGetMostTradedInstrumentsTool(userId?: string) {
  return tool({
    description: 'Get the most traded instruments',
    inputSchema: z.object({}).catch({}),
    execute: async () => {
      if (!userId) return { error: 'AI tool executed without explicit user context — cross-user data access prevented' };
      const resolvedUserId = userId;
      const tradesResult = await getAiTrades({ userId: resolvedUserId, profile: 'analysis' });
      const allTrades = tradesResult.trades || [];
      const instruments = allTrades.map(trade => trade.instrument);
      const instrumentCount = instruments.reduce((acc, instrument) => {
        acc[instrument] = (acc[instrument] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const items = Object.entries(instrumentCount)
        .sort((a, b) => b[1] - a[1])
        .map(([instrument, count]) => ({ instrument, count }));
      return {
        items,
        truncated: tradesResult.truncated,
        dataQualityWarning: tradesResult.dataQualityWarning,
      };
    }
  });
}

export const getMostTradedInstruments = createGetMostTradedInstrumentsTool();

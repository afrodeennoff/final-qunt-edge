import { getMoodHistory, getMoodHistoryForUser } from '@/server/journal';
import { Mood } from '@/prisma/generated/prisma';
import { tool } from 'ai';
import { z } from 'zod/v3';

/**
 * Create previous conversation tool bound to a specific userId (for AI tool context reliability).
 */
export function createGetPreviousConversationTool(userId?: string) {
  return tool({
    description: 'Get the previous conversation with the user. For a given timeframe, it will return the conversation with the user.',
    inputSchema: z.object({
      fromDate: z.string().describe('Date in format 2025-01-14'),
      toDate: z.string().describe('Date in format 2025-01-14').optional(),
    }),
    execute: async ({ fromDate, toDate }: { fromDate: string, toDate?: string }) => {
      const from = new Date(fromDate);
      const to = toDate ? new Date(toDate) : undefined;
      if (!userId) return { error: 'AI journal tool executed without explicit user context — data access denied for isolation' };
    const journalEntries = await getMoodHistoryForUser(userId, from, to);
      return journalEntries.map(entry => ({
        day: entry.day,
        conversation: entry.conversation,
      })) as Partial<Mood>[];
    }
  });
}

export const getPreviousConversation = createGetPreviousConversationTool();
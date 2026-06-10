import { getMoodHistory, getMoodHistoryForUser } from '@/server/journal';
import { Mood } from '@/prisma/generated/prisma';
import { tool } from 'ai';
import { z } from 'zod/v3';

/**
 * Create a journal entries tool bound to a specific userId.
 * Use from chat/editor routes after guardAiRequest so tool executes work in detached AI SDK callbacks.
 */
export function createGetJournalEntriesTool(userId?: string) {
  return tool({
    description: 'Get journal entries from a given date. This can be useful to understand the user\'s mood and trading patterns',
    inputSchema: z.object({
      fromDate: z.string().describe('Date in format 2025-01-14'),
      toDate: z.string().describe('Date in format 2025-01-14').optional(),
    }),
    execute: async ({ fromDate, toDate }: { fromDate: string, toDate?: string }) => {
      const from = new Date(fromDate);
      const to = toDate ? new Date(toDate) : undefined;
      const journalEntries = userId
        ? await getMoodHistoryForUser(userId, from, to)
        : await getMoodHistory(from, to);
      return journalEntries.map(entry => ({
        day: entry.day,
        mood: entry.mood,
        journalContent: entry.journalContent,
      })) as Partial<Mood>[];
    }
  });
}

export const getJournalEntries = createGetJournalEntriesTool();
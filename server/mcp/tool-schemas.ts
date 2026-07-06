import { z } from 'zod'

// Tier 1 - Core
export const GetAccountHealthInput = z.object({
  accountId: z.string().optional()
}).strict()

export const ListAccountsInput = z.object({}).strict()

export const GetAccountDetailsInput = z.object({
  accountId: z.string()
}).strict()

// Add more schemas here as tools are migrated (Tasks 5-12)

// Journal (Top 15 #10#11)
export const ListJournalEntriesInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
}).strict()

export const CreateJournalEntryInput = z.object({
  day: z.string(),
  mood: z.string(),
  emotionValue: z.number().min(0).max(100).optional(),
  journalContent: z.string().optional(),
}).strict()

export const UpdateJournalEntryInput = z.object({
  day: z.string(),
  mood: z.string().optional(),
  emotionValue: z.number().min(0).max(100).optional(),
  journalContent: z.string().optional(),
}).strict()

export const DeleteJournalEntryInput = z.object({
  day: z.string(),
}).strict()

// Dashboard layouts (Top 15 #12)
export const GetDashboardLayoutInput = z.object({}).strict()

export const SaveDashboardLayoutInput = z.object({
  layouts: z.object({
    desktop: z.array(z.any()),
    mobile: z.array(z.any()),
  }),
}).strict()

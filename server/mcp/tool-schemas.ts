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

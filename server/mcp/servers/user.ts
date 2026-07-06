import { McpServer } from '@modelcontextprotocol/server'
import { getAccountHealthHandler } from '../handlers/account'
import {
  createJournalEntryHandler,
  listJournalEntriesHandler,
  updateJournalEntryHandler,
  deleteJournalEntryHandler,
} from '../handlers/journal'
import {
  getDashboardLayoutHandler,
  saveDashboardLayoutHandler,
} from '../handlers/layout'
import {
  GetAccountHealthInput,
  ListJournalEntriesInput,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  DeleteJournalEntryInput,
  GetDashboardLayoutInput,
  SaveDashboardLayoutInput,
} from '../tool-schemas'

export function createUserMcpServer(): McpServer {
  return new McpServer({ name: 'qunt-edge-user', version: '3.0.0' })
}

export async function registerUserTools(server: McpServer, authContext: { userId: string }) {
  server.registerTool(
    'get_account_health',
    {
      title: 'Get Account Health',
      description: 'Full account health snapshot with drawdown, buffer, trailing, payout eligibility, and recent performance.',
      inputSchema: GetAccountHealthInput,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
    },
    async (args) => {
      try {
        const data = await getAccountHealthHandler({ userId: authContext.userId } as any, args)
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
      } catch (e: any) {
        return { content: [{ type: 'text' as const, text: e.message }], isError: true }
      }
    }
  )

  // Journal (Top 15 #10#11) + layouts (#12) - wired per swarm isolation task
  const mkHandler = (h: (c: any, a: any) => Promise<any>) => async (args: any) => {
    try {
      const data = await h({ userId: authContext.userId }, args)
      // SDK expects ContentBlock with type: "text" (literal)
      return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: e.message }], isError: true }
    }
  }

  server.registerTool('list_journal_entries', { title: 'List Journal Entries', description: 'List mood/journal entries (scoped to user).', inputSchema: ListJournalEntriesInput, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, mkHandler(listJournalEntriesHandler) as any)
  server.registerTool('update_journal_entry', { title: 'Update Journal Entry', description: 'Update mood/journal for a day (scoped).', inputSchema: UpdateJournalEntryInput, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } }, mkHandler(updateJournalEntryHandler) as any)
  server.registerTool('delete_journal_entry', { title: 'Delete Journal Entry', description: 'Delete journal/mood entry by day (scoped).', inputSchema: DeleteJournalEntryInput, annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false } }, mkHandler(deleteJournalEntryHandler) as any)
  server.registerTool('create_journal_entry', { title: 'Create Journal Entry', description: 'Create a new mood/journal entry for a specific day (scoped to user).', inputSchema: CreateJournalEntryInput, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } }, mkHandler(createJournalEntryHandler) as any)
  server.registerTool('get_dashboard_layout', { title: 'Get Dashboard Layout', description: 'Get saved desktop/mobile widget layout (scoped).', inputSchema: GetDashboardLayoutInput, annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }, mkHandler(getDashboardLayoutHandler) as any)
  server.registerTool('save_dashboard_layout', { title: 'Save Dashboard Layout', description: 'Persist widget layout (scoped to user only).', inputSchema: SaveDashboardLayoutInput, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } }, mkHandler(saveDashboardLayoutHandler) as any)

  // TODO: Register remaining 18 personal tools
  // Each uses a Zod schema from tool-schemas.ts and a handler from handlers/
}

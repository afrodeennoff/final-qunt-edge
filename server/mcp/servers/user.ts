import { McpServer } from '@modelcontextprotocol/server'
import { getAccountHealthHandler } from '../handlers/account'
import { GetAccountHealthInput } from '../tool-schemas'

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
        const data = await getAccountHealthHandler({ userId: authContext.userId }, args)
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      } catch (e: any) {
        return { content: [{ type: 'text', text: e.message }], isError: true }
      }
    }
  )

  // TODO: Register remaining 18 personal tools
  // Each uses a Zod schema from tool-schemas.ts and a handler from handlers/
}

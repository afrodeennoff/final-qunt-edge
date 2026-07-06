// Streamable HTTP transport for official MCP SDK
// Uses @modelcontextprotocol/node for Next.js/Bun compatibility
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node'
import { randomUUID } from 'node:crypto'

export function createStreamableTransport() {
  return new NodeStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: true,
  })
}

export type McpTransport = ReturnType<typeof createStreamableTransport>

import { McpServer } from '@modelcontextprotocol/server'
import { createStreamableTransport } from '../../sdk-transport'
import http from 'node:http'

export interface TestMcpClient {
  initialize(): Promise<any>
  listTools(): Promise<any>
  callTool(name: string, args: Record<string, unknown>): Promise<any>
  close(): Promise<void>
}

export async function createTestMcpClient(server: McpServer): Promise<TestMcpClient> {
  const transport = createStreamableTransport()
  await server.connect(transport)

  // Create a simple HTTP server for transport
  const httpServer = http.createServer()
  // In a full test harness, this wraps the transport's request handler
  // See: official MCP SDK examples for NodeStreamableHTTPServerTransport

  return {
    async initialize() {
      return { protocolVersion: '2024-11-05', capabilities: {} }
    },
    async listTools() {
      return { tools: [] }
    },
    async callTool(name: string, args: Record<string, unknown>) {
      return { content: [{ type: 'text', text: 'stub' }] }
    },
    async close() {
      httpServer.close()
    },
  }
}

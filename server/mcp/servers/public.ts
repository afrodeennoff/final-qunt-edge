import { McpServer } from '@modelcontextprotocol/server'

export function createPublicMcpServer() {
  return new McpServer({ name: 'qunt-edge-public', version: '3.0.0' })
}

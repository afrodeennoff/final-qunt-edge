import { McpServer } from '@modelcontextprotocol/server'

export function createAdminMcpServer() {
  return new McpServer({ name: 'qunt-edge-admin', version: '3.0.0' })
}

// server/mcp/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest'
import { createUserMcpServer } from '../servers/user'

describe('MCP SDK smoke', () => {
  it('can instantiate the user McpServer', () => {
    const server = createUserMcpServer()
    expect(server).toBeDefined()
  })
})

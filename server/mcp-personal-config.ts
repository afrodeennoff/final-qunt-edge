import type { NextRequest } from 'next/server'
import { authenticateMcpRequest, extractMcpCredential } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleUserWriteToolCall, userWriteTools } from '@/server/mcp-user-write-tools'
import { handleWebsiteMcpToolCall, websiteTools } from '@/server/mcp-website-tools'
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from '@/lib/mcp-constants'
import type { McpAuthChallengeMode, McpRouteConfig } from '@/server/mcp-route-utils'

export const PERSONAL_MCP_TOOLS = [...standardTools, ...userWriteTools, ...websiteTools]

export function createPersonalMcpRouteConfig(authChallenge: McpAuthChallengeMode): McpRouteConfig {
  return {
    tools: PERSONAL_MCP_TOOLS,
    authChallenge,
    authenticate: async (request: NextRequest) => {
      return authenticateMcpRequest(extractMcpCredential(request))
    },
    handleToolCall: async (toolName, args, ctx) => {
      if (websiteTools.some((t) => t.name === toolName)) {
        return handleWebsiteMcpToolCall(toolName, args, ctx!)
      }
      if (userWriteTools.some((t) => t.name === toolName)) {
        return handleUserWriteToolCall(toolName, args, ctx!)
      }
      return handleMcpToolCall(toolName, args, ctx!)
    },
    serverName: authChallenge === 'api-key' ? `${MCP_SERVER_NAME}/key` : MCP_SERVER_NAME,
    serverVersion: MCP_SERVER_VERSION,
  }
}
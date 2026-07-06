#!/usr/bin/env node
/**
 * Qunt Edge MCP Stdio Server (for local stdio-only clients)
 *
 * This provides a stdio MCP server that forwards all calls to your hosted
 * Qunt Edge MCP endpoint (the same one used for remote clients like Grok via xAI API,
 * Claude Custom Connectors, etc.).
 *
 * This gives full access to ALL functions (95+ tools) over stdio, while your data
 * stays on your hosted Vercel instance.
 *
 * Usage (stdio clients that don't support remote HTTP directly):
 *   MCP_KEY=qunt_usr_... MCP_URL=https://qunt-edge.vercel.app/api/mcp npx tsx server/mcp/stdio.ts
 *
 * Or after build: MCP_KEY=... node build/server/mcp/stdio.js
 *
 * For local dev:
 *   MCP_KEY=... MCP_URL=http://localhost:3000/api/mcp bun server/mcp/stdio.ts
 *
 * The stdio server will:
 * - Perform initialize + tools/list against the remote (with your key)
 * - Dynamically register every tool the remote advertises
 * - Forward tools/call to the remote and return the exact content
 *
 * This way you get zero-drift "all functions are correct" over stdio.
 */

import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server'

const REMOTE_URL = process.env.MCP_URL || 'https://qunt-edge.vercel.app/api/mcp/key'
const REMOTE_KEY = process.env.MCP_KEY

if (!REMOTE_KEY) {
  console.error('MCP_KEY env var is required (your qunt_usr_... or qunt_adm_... key)')
  process.exit(1)
}

async function callRemote(method: string, params?: Record<string, unknown>) {
  const res = await fetch(REMOTE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${REMOTE_KEY}`,
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params: params || {},
      id: Date.now(),
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Remote MCP error ${res.status}: ${text}`)
  }

  const json = await res.json()
  if (json.error) {
    throw new Error(json.error.message || 'Remote MCP error')
  }
  return json.result
}

async function main() {
  const server = new McpServer({
    name: 'qunt-edge-stdio',
    version: '1.0.0',
  })

  // Bootstrap: get the full tool catalog from the remote (this gives us ALL functions with zero drift)
  console.error('[qunt-mcp-stdio] Connecting to', REMOTE_URL)
  const initResult = await callRemote('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'qunt-edge-stdio-forwarder', version: '1.0.0' },
  }).catch((e) => {
    console.error('[qunt-mcp-stdio] initialize failed:', e.message)
    process.exit(1)
  })

  console.error('[qunt-mcp-stdio] Remote protocolVersion:', initResult?.protocolVersion)

  const listResult = await callRemote('tools/list').catch((e) => {
    console.error('[qunt-mcp-stdio] tools/list failed:', e.message)
    process.exit(1)
  })

  const tools = listResult?.tools || []
  console.error(`[qunt-mcp-stdio] Discovered ${tools.length} tools from remote. Registering for stdio...`)

  for (const t of tools) {
    server.registerTool(
      t.name,
      {
        title: t.name,
        description: t.description || t.name,
        inputSchema: t.inputSchema || {},
        annotations: t.annotations || { readOnlyHint: false },
      },
      async (args: Record<string, unknown>) => {
        try {
          const result = await callRemote('tools/call', {
            name: t.name,
            arguments: args || {},
          })
          return result || { content: [{ type: 'text', text: 'ok' }] }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          return { content: [{ type: 'text', text: msg }], isError: true }
        }
      }
    )
  }

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[qunt-mcp-stdio] Ready on stdio. All remote tools forwarded.')
}

main().catch((err) => {
  console.error('[qunt-mcp-stdio] fatal:', err)
  process.exit(1)
})

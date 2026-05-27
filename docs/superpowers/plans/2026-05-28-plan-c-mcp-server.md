# Plan C: MCP Server Implementation

> **For agentic workers:** Sub-plan of `2026-05-28-dashboard-restructure-mcp-audit.md`. Execute after Plan B to ensure the codebase is clean before adding new infrastructure.

**Goal:** Implement an MCP (Model Context Protocol) server that exposes app data and actions as tools. API key auth with RBAC (standard user vs admin). Keys generated from settings (user) and admin panel (admin).

**Architecture:** Express-style HTTP server using `@modelcontextprotocol/sdk` with SSE transport. Standard user keys get read/write access to own data. Admin keys get full access including admin resources. Keys are validated via middleware that checks the `Authorization: Bearer <key>` header against the `ApiKey` table in Prisma.

**Tech Stack:** `@modelcontextprotocol/sdk` (^1.10), Prisma, Supabase Auth, Node.js crypto (uuid), Next.js API routes for key management.

---

## Prisma Schema Addition

Add `ApiKey` model to `prisma/schema.prisma`:

```prisma
model ApiKey {
  id          String   @id @default(cuid())
  key         String   @unique
  keyPrefix   String   // First 8 chars for identification, e.g., "qunt_usr_"
  name        String   // User-defined label like "My Trading Bot"
  userId      String   // References auth_user_id in User model
  role        String   @default("user") // "user" | "admin"
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([key])
  @@index([userId])
  @@index([keyPrefix])
  @@schema("public")
}
```

---

## Task C1: Install MCP SDK and generate migration

**Files:**
- Modify: `package.json` (add dependency)
- Create: `prisma/migrations/XXXXXX_add_api_key_model/migration.sql`

- [ ] **Step 1: Install @modelcontextprotocol/sdk**

The MCP endpoint in Task C5 uses a custom JSON-RPC handler (no SDK import needed for the server). The SDK is useful for MCP client development.

Run: `npm install @modelcontextprotocol/sdk 2>&1 | tail -5`

- [ ] **Step 2: Add ApiKey model to Prisma schema and generate migration**

In `prisma/schema.prisma`, add the ApiKey model (shown above).

Run: `npx prisma migrate dev --name add_api_key_model 2>&1 | tail -10`

Expected: Migration created and applied. Client regenerated.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ package.json package-lock.json
git commit -m "feat: add ApiKey model to Prisma schema for MCP auth"
```

---

## Task C2: Create API key generation server action

**Files:**
- Create: `server/mcp-key-service.ts`
- Create: `app/[locale]/dashboard/actions/generate-api-key.ts`

- [ ] **Step 1: Create MCP key service**

Write `server/mcp-key-service.ts`:

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/server/auth'
import { randomBytes } from 'node:crypto'
import { isAdminUser } from '@/server/authz'

const KEY_PREFIX_USER = 'qunt_usr_'
const KEY_PREFIX_ADMIN = 'qunt_adm_'
const KEY_BYTES = 32 // 256-bit keys

export interface ApiKeyResult {
  id: string
  key: string // Full key shown only once at creation
  keyPrefix: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  lastUsedAt: Date | null
}

function generateApiKey(role: 'user' | 'admin'): { key: string; keyPrefix: string; keyHash: string } {
  const prefix = role === 'admin' ? KEY_PREFIX_ADMIN : KEY_PREFIX_USER
  const raw = randomBytes(KEY_BYTES).toString('base64url')
  const key = `${prefix}${raw}`
  // Hash the full key for storage (never store raw keys)
  const { createHash } = require('node:crypto')
  const keyHash = createHash('sha256').update(key).digest('hex')
  return { key, keyPrefix: prefix, keyHash }
}

export async function generateUserApiKey(name: string): Promise<{ success: true; result: ApiKeyResult } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    if (!name || name.trim().length < 2 || name.trim().length > 64) {
      return { success: false, error: 'Key name must be 2-64 characters' }
    }

    const { key, keyPrefix, keyHash } = generateApiKey('user')

    const apiKey = await prisma.apiKey.create({
      data: {
        key: keyHash,
        keyPrefix,
        name: name.trim(),
        userId: user.id,
        role: 'user',
      },
    })

    return {
      success: true,
      result: {
        id: apiKey.id,
        key, // Only time this is returned
        keyPrefix,
        name: apiKey.name,
        role: 'user',
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate API key' }
  }
}

export async function generateAdminApiKey(name: string): Promise<{ success: true; result: ApiKeyResult } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !isAdminUser(user as any)) {
      return { success: false, error: 'Forbidden: Admin access required' }
    }

    const { key, keyPrefix, keyHash } = generateApiKey('admin')

    const apiKey = await prisma.apiKey.create({
      data: {
        key: keyHash,
        keyPrefix,
        name: name.trim(),
        userId: user.id,
        role: 'admin',
      },
    })

    return {
      success: true,
      result: {
        id: apiKey.id,
        key,
        keyPrefix,
        name: apiKey.name,
        role: 'admin',
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate admin API key' }
  }
}

export async function listUserApiKeys(): Promise<{ success: true; keys: ApiKeyResult[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, keyPrefix: true, name: true, role: true, createdAt: true, lastUsedAt: true },
    })

    return {
      success: true,
      keys: keys.map((k) => ({ ...k, key: '' })), // Never return full keys from list
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to list API keys' }
  }
}

export async function revokeApiKey(keyId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return { success: false, error: 'Unauthorized' }

    const existing = await prisma.apiKey.findUnique({ where: { id: keyId } })
    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'API key not found' }
    }

    await prisma.apiKey.delete({ where: { id: keyId } })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to revoke API key' }
  }
}

// Validate a raw API key and return the associated user + role
export async function validateApiKey(rawKey: string): Promise<{ userId: string; role: 'user' | 'admin' } | null> {
  try {
    const { createHash } = require('node:crypto')
    const keyHash = createHash('sha256').update(rawKey).digest('hex')

    const record = await prisma.apiKey.findUnique({ where: { key: keyHash } })
    if (!record) return null
    if (record.expiresAt && record.expiresAt < new Date()) return null

    // Update lastUsedAt
    await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })

    return { userId: record.userId, role: record.role as 'user' | 'admin' }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/mcp-key-service.ts
git commit -m "feat: add MCP API key generation, listing, revocation, and validation service"
```

---

## Task C3: Add API key management UI to settings page

**Files:**
- Modify: `app/[locale]/dashboard/settings/page.tsx` (add API Keys section)

- [ ] **Step 1: Add API key section to settings page**

In `app/[locale]/dashboard/settings/page.tsx`, add a new card component for API key management. Insert it after the LinkedAccounts section:

```tsx
// Add imports at the top:
import { Key, Copy, Trash2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Add this component before the SettingsPage function:
function ApiKeySection() {
  const [keys, setKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; role: string; createdAt: string; lastUsedAt: string | null }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const loadKeys = async () => {
    setIsLoading(true)
    const { listUserApiKeys } = await import('@/server/mcp-key-service')
    const result = await listUserApiKeys()
    if (result.success) setKeys(result.keys as any)
    setIsLoading(false)
  }

  useEffect(() => { loadKeys() }, [])

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setIsCreating(true)
    const { generateUserApiKey } = await import('@/server/mcp-key-service')
    const result = await generateUserApiKey(newKeyName.trim())
    if (result.success) {
      setCreatedKey(result.result.key)
      setNewKeyName('')
      await loadKeys()
    } else {
      toast.error(result.error || 'Failed to create key')
    }
    setIsCreating(false)
  }

  const handleRevoke = async (keyId: string) => {
    const { revokeApiKey } = await import('@/server/mcp-key-service')
    const result = await revokeApiKey(keyId)
    if (result.success) {
      toast.success('API key revoked')
      await loadKeys()
    } else {
      toast.error(result.error || 'Failed to revoke key')
    }
  }

  return (
    <Card className="rounded-xl border border-border/30 bg-card shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>Manage API keys for programmatic access to your trading data via the MCP server.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Key className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No API keys yet. Create one to connect external tools.</p>
            </div>
          ) : (
            keys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between rounded-xl border border-border/25 bg-muted/40 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{apiKey.name}</p>
                    <Badge variant="outline" className="text-[10px]">{apiKey.keyPrefix}...</Badge>
                    <Badge variant="secondary" className="text-[10px]">{apiKey.role}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.lastUsedAt ? ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => handleRevoke(apiKey.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreatedKey(null) }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" /> Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Give this key a name so you can identify it later. The key will only be shown once.</DialogDescription>
            </DialogHeader>
            {createdKey ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">Your API key:</p>
                <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-muted/40 p-3">
                  <code className="flex-1 text-xs break-all select-all">{createdKey}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Copied!') }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">Copy this key now. You won&apos;t be able to see it again.</p>
              </div>
            ) : (
              <>
                <Input
                  placeholder="e.g., My Trading Bot"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isCreating || !newKeyName.trim()}>
                    {isCreating ? 'Creating...' : 'Create Key'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

Add `<ApiKeySection />` inside the grid at the end (before the closing `</div>` of the grid):

```tsx
<ApiKeySection />
```

- [ ] **Step 2: Add admin API key generator to admin panel**

Create `app/[locale]/admin/components/admin-api-key-generator.tsx`:

```typescript
'use client'

import { generateAdminApiKey } from '@/server/mcp-key-service'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Key, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function AdminApiKeyGenerator() {
  const [name, setName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)
    const result = await generateAdminApiKey(name.trim())
    if (result.success) {
      setCreatedKey(result.result.key)
      setName('')
      toast.success('Admin API key created')
    } else {
      toast.error(result.error || 'Failed to create key')
    }
    setIsCreating(false)
  }

  return (
    <Card className="border-border/30 bg-card">
      <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Admin API Keys</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {createdKey ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Admin API Key (show once):</p>
            <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-muted/40 p-3">
              <code className="flex-1 text-xs break-all select-all">{createdKey}</code>
              <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(createdKey); toast.success('Copied!') }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-destructive">This key grants full admin access. Store it securely.</p>
            <Button variant="outline" onClick={() => setCreatedKey(null)}>Create Another</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>Generate Admin Key</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Add AdminApiKeyGenerator to admin page**

Read `app/[locale]/admin/page.tsx` and import `<AdminApiKeyGenerator />` from `@/app/[locale]/admin/components/admin-api-key-generator`, then add it in the admin dashboard.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/settings/page.tsx app/[locale]/admin/components/admin-api-key-generator.tsx
git commit -m "feat: add API key management UI to settings and admin panel"
```

---

## Task C4: Implement MCP server with RBAC

**Files:**
- Create: `lib/mcp-constants.ts`
- Create: `server/mcp-auth.ts`
- Create: `server/mcp-tools.ts`
- Create: `server/mcp-admin-tools.ts`

- [ ] **Step 1: Create MCP constants**

Write `lib/mcp-constants.ts`:

```typescript
export const MCP_SERVER_NAME = 'qunt-edge-mcp'
export const MCP_SERVER_VERSION = '1.0.0'
export const MCP_AUTH_HEADER = 'authorization'
export const MCP_KEY_PREFIX_USER = 'qunt_usr_'
export const MCP_KEY_PREFIX_ADMIN = 'qunt_adm_'
```

- [ ] **Step 2: Create MCP auth middleware**

Write `server/mcp-auth.ts`:

```typescript
import { validateApiKey } from './mcp-key-service'

export interface McpAuthContext {
  userId: string
  role: 'user' | 'admin'
}

export async function authenticateMcpRequest(authHeader: string | null): Promise<McpAuthContext> {
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const result = await validateApiKey(token)
  if (!result) {
    throw new Error('Invalid or expired API key')
  }

  return result
}

export function requireAdminAccess(ctx: McpAuthContext): void {
  if (ctx.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
}
```

- [ ] **Step 3: Create MCP tool definitions**

Write `server/mcp-tools.ts`:

```typescript
import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { getCoreUserDataCached } from './user-data'

// ── Tool Definitions ──

export const standardTools = [
  {
    name: 'list_accounts',
    description: 'List all trading accounts for the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_account_details',
    description: 'Get detailed information about a specific trading account',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: { type: 'string', description: 'The account ID' },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'list_trades',
    description: 'List trades with optional date range and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
        limit: { type: 'number', description: 'Max trades to return (default 50, max 200)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_performance_summary',
    description: 'Get overall performance metrics (PnL, win rate, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' },
      },
    },
  },
  {
    name: 'get_user_profile',
    description: 'Get the authenticated user profile information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_tags',
    description: 'List all trade tags for the user',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

// ── Tool Handlers ──

export async function handleMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext) {
  switch (toolName) {
    case 'list_accounts':
      return await listAccounts(ctx)
    case 'get_account_details':
      return await getAccountDetails(ctx, args.accountId as string)
    case 'list_trades':
      return await listTrades(ctx, args)
    case 'get_performance_summary':
      return await getPerformanceSummary(ctx, args)
    case 'get_user_profile':
      return await getUserProfile(ctx)
    case 'list_tags':
      return await listTags(ctx)
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

async function listAccounts(ctx: McpAuthContext) {
  const accounts = await prisma.account.findMany({
    where: { authUserId: ctx.userId },
    select: { id: true, number: true, name: true, broker: true, startingBalance: true, createdAt: true },
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(accounts, null, 2) }] }
}

async function getAccountDetails(ctx: McpAuthContext, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, authUserId: ctx.userId },
    include: { trades: { take: 10, orderBy: { entryDate: 'desc' } } },
  })
  if (!account) throw new Error('Account not found')
  return { content: [{ type: 'text' as const, text: JSON.stringify(account, null, 2) }] }
}

async function listTrades(ctx: McpAuthContext, args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 50, 200)
  const offset = Number(args.offset) || 0
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  if (args.startDate || args.endDate) {
    where.entryDate = {}
    if (args.startDate) (where.entryDate as Record<string, unknown>).gte = new Date(args.startDate as string)
    if (args.endDate) (where.entryDate as Record<string, unknown>).lte = new Date(args.endDate as string)
  }
  const trades = await prisma.trade.findMany({
    where: where as any,
    orderBy: { entryDate: 'desc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(trades, null, 2) }] }
}

async function getPerformanceSummary(ctx: McpAuthContext, args: Record<string, unknown>) {
  const where: Record<string, unknown> = { authUserId: ctx.userId }
  if (args.startDate || args.endDate) {
    where.entryDate = {}
    if (args.startDate) (where.entryDate as Record<string, unknown>).gte = new Date(args.startDate as string)
    if (args.endDate) (where.entryDate as Record<string, unknown>).lte = new Date(args.endDate as string)
  }
  const trades = await prisma.trade.findMany({ where: where as any, select: { pnl: true, commission: true } })
  const pnlValues = trades.map((t) => Number(t.pnl || 0))
  const netValues = trades.map((t) => Number(t.pnl || 0) - Number(t.commission || 0))
  const wins = pnlValues.filter((v) => v > 0)
  const losses = pnlValues.filter((v) => v < 0)
  const summary = {
    totalTrades: trades.length,
    grossPnL: pnlValues.reduce((a, v) => a + v, 0).toFixed(2),
    netPnL: netValues.reduce((a, v) => a + v, 0).toFixed(2),
    winRate: trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : '0.0',
    totalWins: wins.length,
    totalLosses: losses.length,
    avgWin: wins.length > 0 ? (wins.reduce((a, v) => a + v, 0) / wins.length).toFixed(2) : '0.00',
    avgLoss: losses.length > 0 ? (losses.reduce((a, v) => a + v, 0) / losses.length).toFixed(2) : '0.00',
    profitFactor: losses.length > 0 && losses.reduce((a, v) => a + v, 0) !== 0
      ? (Math.abs(wins.reduce((a, v) => a + v, 0) / losses.reduce((a, v) => a + v, 0))).toFixed(2)
      : 'N/A',
  }
  return { content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }] }
}

async function getUserProfile(ctx: McpAuthContext) {
  const user = await prisma.user.findUnique({
    where: { authUserId: ctx.userId },
    select: { id: true, username: true, email: true, language: true, createdAt: true },
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] }
}

async function listTags(ctx: McpAuthContext) {
  const tags = await prisma.tag.findMany({ where: { userId: ctx.userId } })
  return { content: [{ type: 'text' as const, text: JSON.stringify(tags, null, 2) }] }
}
```

- [ ] **Step 4: Create admin MCP tools**

Write `server/mcp-admin-tools.ts`:

```typescript
import type { McpAuthContext } from './mcp-auth'
import { requireAdminAccess } from './mcp-auth'
import { prisma } from '@/lib/prisma'

export const adminTools = [
  {
    name: 'admin_list_users',
    description: 'List all users (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'admin_get_user',
    description: 'Get details for a specific user by ID (admin only)',
    inputSchema: {
      type: 'object',
      properties: { userId: { type: 'string', description: 'The user ID' } },
      required: ['userId'],
    },
  },
  {
    name: 'admin_list_subscriptions',
    description: 'List all subscriptions (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'admin_get_analytics',
    description: 'Get platform-wide analytics (admin only)',
    inputSchema: { type: 'object', properties: {} },
  },
]

export async function handleAdminMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext) {
  requireAdminAccess(ctx)

  switch (toolName) {
    case 'admin_list_users':
      return await adminListUsers()
    case 'admin_get_user':
      return await adminGetUser(args.userId as string)
    case 'admin_list_subscriptions':
      return await adminListSubscriptions()
    case 'admin_get_analytics':
      return await adminGetAnalytics()
    default:
      throw new Error(`Unknown admin tool: ${toolName}`)
  }
}

async function adminListUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, language: true, isBeta: true, createdAt: true, showOnLeaderboard: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(users, null, 2) }] }
}

async function adminGetUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: true, subscription: true },
  })
  if (!user) throw new Error('User not found')
  return { content: [{ type: 'text' as const, text: JSON.stringify(user, null, 2) }] }
}

async function adminListSubscriptions() {
  const subs = await prisma.subscription.findMany({
    include: { user: { select: { email: true, username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(subs, null, 2) }] }
}

async function adminGetAnalytics() {
  const totalUsers = await prisma.user.count()
  const totalAccounts = await prisma.account.count()
  const totalTrades = await prisma.trade.count()
  const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } })
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ totalUsers, totalAccounts, totalTrades, activeSubscriptions }, null, 2),
    }],
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/mcp-constants.ts server/mcp-auth.ts server/mcp-tools.ts server/mcp-admin-tools.ts
git commit -m "feat: implement MCP tool definitions with user and admin RBAC"
```

---

## Task C5: Create MCP HTTP endpoint (SSE transport)

**Files:**
- Create: `app/api/mcp/route.ts`

- [ ] **Step 1: Create SSE endpoint**

Write `app/api/mcp/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { authenticateMcpRequest, requireAdminAccess } from '@/server/mcp-auth'
import { handleMcpToolCall, standardTools } from '@/server/mcp-tools'
import { handleAdminMcpToolCall, adminTools } from '@/server/mcp-admin-tools'
import { toErrorResponse } from '@/server/authz'

const ALL_TOOLS = [...standardTools, ...adminTools]

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authCtx = await authenticateMcpRequest(request.headers.get('authorization'))

    const body = await request.json()
    const { method, params } = body as { method: string; params: { name: string; arguments?: Record<string, unknown> } }

    if (!method || !params) {
      return Response.json(
        { jsonrpc: '2.0', error: { code: -32600, message: 'Invalid request' }, id: null },
        { status: 400 },
      )
    }

    // Handle methods per MCP spec
    if (method === 'initialize') {
      return Response.json({
        jsonrpc: '2.0',
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'qunt-edge-mcp', version: '1.0.0' },
        },
        id: params.id ?? null,
      })
    }

    if (method === 'tools/list') {
      return Response.json({
        jsonrpc: '2.0',
        result: { tools: authCtx.role === 'admin' ? ALL_TOOLS : standardTools },
        id: params.id ?? null,
      })
    }

    if (method === 'tools/call') {
      const toolName = params.name
      const toolArgs = params.arguments ?? {}

      // Check if it's an admin tool
      const isAdminTool = adminTools.some((t) => t.name === toolName)
      if (isAdminTool) {
        requireAdminAccess(authCtx)
        const result = await handleAdminMcpToolCall(toolName, toolArgs, authCtx)
        return Response.json({ jsonrpc: '2.0', result, id: params.id ?? null })
      }

      const result = await handleMcpToolCall(toolName, toolArgs, authCtx)
      return Response.json({ jsonrpc: '2.0', result, id: params.id ?? null })
    }

    return Response.json(
      { jsonrpc: '2.0', error: { code: -32601, message: `Method not found: ${method}` }, id: params.id ?? null },
      { status: 404 },
    )
  } catch (error) {
    const errResponse = toErrorResponse(error)
    const errBody = await errResponse.json() as { error: string; code?: string }
    return Response.json(
      { jsonrpc: '2.0', error: { code: -32000, message: errBody.error }, id: null },
      { status: errResponse.status },
    )
  }
}

// GET for SSE connection (future: streaming)
export async function GET() {
  return Response.json(
    { error: 'Use POST with JSON-RPC body. See MCP specification at https://spec.modelcontextprotocol.io' },
    { status: 400 },
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/mcp/route.ts
git commit -m "feat: add MCP HTTP endpoint with SSE transport and JSON-RPC handling"
```

---

## Task C6: Run build verification

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck 2>&1 | tail -30
```

Expected: No type errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: No lint errors.

- [ ] **Step 3: Run tests**

```bash
npm run test 2>&1 | tail -20
```

Expected: All tests passing.

- [ ] **Step 4: Final commit and push**

```bash
git add -A
git commit -m "feat: complete MCP server with RBAC, API key management, and 10+ tools"
git push origin v3
```

Expected: Push succeeds. Vercel deploy triggers.

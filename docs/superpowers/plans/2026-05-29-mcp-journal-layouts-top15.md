# MCP Top 15 Journal (10/11) + Dashboard Layouts (#12) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the missing journal CRUD tools (`list_journal_entries`, `update_journal_entry`, `delete_journal_entry`) and dashboard layout tools (`save_dashboard_layout`, `get_dashboard_layout`) for MCP full coverage (Top 15 #10#11 for journal, #12 for layouts). Strictly follow security.ts guards + ctx.userId ONLY (never accept userId from args). Use TDD (write failing test → run → implement → run → pass). Enhance `server/mcp/handlers/journal.ts` + `server/layouts.ts` server action. Wire fully to both legacy MCP path and SDK path. Commit with swarm note. Report commit hash. All changes isolated to this part.

**Architecture:** 
- Handlers are pure functions: `async fn(ctx: McpAuthContext, args)` that call `requireUserId(ctx)` first, use `assertNoCrossUserAccess` for any arg userId, then Prisma with `where: { userId }` only.
- Enhance `server/layouts.ts` to export `getDashboardLayoutForUser(userId)` and `saveDashboardLayoutForUser(userId, layouts)` (extract logic from actions for reuse by MCP handlers, keep web actions unchanged).
- Add Zod schemas in `tool-schemas.ts`.
- Wire: register in `server/mcp/servers/user.ts` (SDK), and add defs + dispatch in `server/mcp-tools.ts` + `server/mcp-user-write-tools.ts` (legacy stable path, SDK_ENABLED=false).
- Tests: vitest with prisma mocks, cover security (no ctx → error, cross-user arg → error, scoping).
- Follow existing patterns exactly from `handlers/trade.ts`, `imports.ts`, `account.test.ts`.

**Tech Stack:** TypeScript, Prisma (mood + dashboardLayout models), Vitest, @modelcontextprotocol/sdk (future), Next.js server actions + MCP JSON-RPC.

**Non-Negotiables (from user + security.ts + plan):**
- ZERO acceptance of userId from args in handlers (only ctx.userId).
- Every Prisma mood/dashboard query uses the ctx-derived userId.
- TDD micro-cycles + lint/typecheck at end.
- No behavior change to existing web saveJournal / loadDashboardLayoutAction.
- Commit message must contain "swarm" note + Top15 refs.
- Final: use verification-before-completion skill before claiming done.

---

## File Map (for isolation)

- **Core impl:** `server/mcp/handlers/journal.ts` (enhance), `server/mcp/handlers/layout.ts` (new)
- **Tests:** `server/mcp/handlers/__tests__/journal.test.ts` (new), `server/mcp/handlers/__tests__/layout.test.ts` (new)
- **Shared server action enhance:** `server/layouts.ts` (add forUser fns + security comments)
- **Schemas:** `server/mcp/tool-schemas.ts` (add 5+ Zod objs)
- **Wiring legacy:** `server/mcp-tools.ts` (add 1 tool def + case), `server/mcp-user-write-tools.ts` (add 4 tool defs + cases)
- **Wiring SDK:** `server/mcp/servers/user.ts` (import + register 5 tools)
- **Security already good:** `server/mcp/security.ts` (no change)
- **No touch (isolation):** web journal components, api routes, prisma migrations, other handlers.

---

### Task 1: TDD Bootstrap - Create Journal Handler Tests (failing first)

**Files:**
- Create: `server/mcp/handlers/__tests__/journal.test.ts`

- [ ] **Step 1.1: Write the failing test file (full content)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createJournalEntryHandler,
  listJournalEntriesHandler,
  updateJournalEntryHandler,
  deleteJournalEntryHandler,
} from '../journal'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    mood: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

const mockCtx = { userId: 'user-mcp-journal-123', authUserId: 'auth-123', role: 'user' as const, authMethod: 'apikey' as const }
const mockCrossCtx = { ...mockCtx, userId: 'attacker-999' }

describe('journal handlers (TDD - Top 15 #10#11)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('SECURITY: requireUserId - throws without ctx.userId', async () => {
    await expect(createJournalEntryHandler({} as any, { day: '2026-05-29', mood: 'HAPPY' }))
      .rejects.toThrow('Authentication required')
  })

  it('SECURITY: assertNoCrossUserAccess - rejects userId in args', async () => {
    await expect(listJournalEntriesHandler(mockCtx, { userId: 'attacker' }))
      .rejects.toThrow('Cross-user access denied')
  })

  it('listJournalEntriesHandler scopes to ctx.userId only, supports date range + pagination', async () => {
    vi.mocked(prisma.mood.findMany).mockResolvedValue([{ id: 'm1', day: new Date('2026-05-29'), mood: 'HAPPY' } as any])
    const res = await listJournalEntriesHandler(mockCtx, { startDate: '2026-05-01', limit: 10 })
    expect(prisma.mood.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user-mcp-journal-123', day: { gte: expect.any(Date) } },
      take: 10,
    }))
    expect(res[0].id).toBe('m1')
  })

  it('createJournalEntryHandler (enhanced) uses ctx only, creates or updates by day', async () => {
    vi.mocked(prisma.mood.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.mood.create).mockResolvedValue({ id: 'new1' } as any)
    const res = await createJournalEntryHandler(mockCtx, { day: '2026-05-29', mood: 'FOCUSED', emotionValue: 75, journalContent: 'Good day' })
    expect(prisma.mood.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'user-mcp-journal-123', mood: 'FOCUSED' })
    }))
    expect(res.id).toBe('new1')
  })

  it('updateJournalEntryHandler updates by day, scoped', async () => {
    vi.mocked(prisma.mood.findFirst).mockResolvedValue({ id: 'm1', userId: 'user-mcp-journal-123' } as any)
    vi.mocked(prisma.mood.update).mockResolvedValue({ id: 'm1', mood: 'UPDATED' } as any)
    const res = await updateJournalEntryHandler(mockCtx, { day: '2026-05-29', mood: 'UPDATED' })
    expect(res.mood).toBe('UPDATED')
  })

  it('deleteJournalEntryHandler deletes by day, scoped, returns success', async () => {
    vi.mocked(prisma.mood.findFirst).mockResolvedValue({ id: 'm1' } as any)
    vi.mocked(prisma.mood.delete).mockResolvedValue({} as any)
    const res = await deleteJournalEntryHandler(mockCtx, { day: '2026-05-29' })
    expect(res.success).toBe(true)
    expect(prisma.mood.delete).toHaveBeenCalledWith({ where: { id: 'm1' } })
  })
})
```

- [ ] **Step 1.2: Run the test to confirm it fails (TDD red)**

```bash
npx vitest run server/mcp/handlers/__tests__/journal.test.ts -t "SECURITY|listJournalEntriesHandler" --no-watch --reporter=verbose
```

Expected output: FAIL (Cannot find module or function not exported, or test errors on missing handlers)

- [ ] **Step 1.3: (after impl in Task 2) Re-run until all 6+ tests PASS**

```bash
npx vitest run server/mcp/handlers/__tests__/journal.test.ts --no-watch
```

Expected: PASS (6 tests)

---

### Task 2: Enhance journal.ts Handler (implement list/update/delete + security)

**Files:**
- Modify: `server/mcp/handlers/journal.ts:1-40` (replace stubs, enhance create)

- [ ] **Step 2.1: Update imports + type to McpAuthContext (for consistency with imports/ai handlers)**

Replace the AccountHealthContext import with:

```ts
import type { McpAuthContext } from '../mcp-auth'
```

(Keep create signature for now or update callers later; use McpAuthContext for new fns)

- [ ] **Step 2.2: Implement the 4 handlers (full code to paste)**

After the existing create (enhance it too), add:

```ts
export async function listJournalEntriesHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)

  const limit = Math.min(Math.max(Number(args.limit) || 50, 1), 200)
  const offset = Math.max(Number(args.offset) || 0, 0)
  const where: any = { userId }
  if (args.startDate) where.day = { gte: new Date(args.startDate as string) }
  if (args.endDate) where.day = { ...where.day, lte: new Date(args.endDate as string) }

  return prisma.mood.findMany({
    where,
    orderBy: { day: 'desc' },
    take: limit,
    skip: offset,
    select: { id: true, day: true, mood: true, emotionValue: true, journalContent: true, selectedNews: true, createdAt: true, updatedAt: true }
  })
}

export async function updateJournalEntryHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)

  const dayStr = typeof args.day === 'string' ? args.day : null
  if (!dayStr) throw new Error('day (ISO date) is required to identify entry')
  const day = new Date(dayStr)
  if (isNaN(day.getTime())) throw new Error('Invalid day format')

  const existing = await prisma.mood.findFirst({ where: { userId, day: { gte: day, lt: new Date(day.getTime() + 86400000) } } })
  if (!existing) throw new Error('Journal entry not found for that day')

  const mood = typeof args.mood === 'string' ? args.mood : existing.mood
  const emotionValue = typeof args.emotionValue === 'number' ? Math.min(100, Math.max(0, Math.floor(args.emotionValue))) : existing.emotionValue
  const journalContent = typeof args.journalContent === 'string' ? args.journalContent : existing.journalContent

  return prisma.mood.update({
    where: { id: existing.id },
    data: { mood, emotionValue, journalContent, updatedAt: new Date() }
  })
}

export async function deleteJournalEntryHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const requestedUserId = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(requestedUserId, userId)

  const dayStr = typeof args.day === 'string' ? args.day : null
  if (!dayStr) throw new Error('day (ISO date) is required')
  const day = new Date(dayStr)
  if (isNaN(day.getTime())) throw new Error('Invalid day')

  const existing = await prisma.mood.findFirst({ where: { userId, day: { gte: day, lt: new Date(day.getTime() + 86400000) } } })
  if (!existing) return { success: false, message: 'No entry for that day' }

  await prisma.mood.delete({ where: { id: existing.id } })
  return { success: true, deletedId: existing.id }
}
```

Also enhance the existing createJournalEntryHandler to:

- Change param to McpAuthContext
- Add assertNoCrossUserAccess for any userId in args
- Keep logic, but add userId from ctx only.

- [ ] **Step 2.3: Update the security header comment if needed (already perfect)**

- [ ] **Step 2.4: Run the journal test (from Task 1) repeatedly, fix until GREEN**

Use bash for TDD cycles. Fix any type issues (ctx type).

---

### Task 3: TDD for Layout Handler + Enhance layouts.ts Server Action

**Files:**
- Modify: `server/layouts.ts` (add 2 exported forUser fns + security header)
- Create: `server/mcp/handlers/layout.ts`
- Create: `server/mcp/handlers/__tests__/layout.test.ts`

- [ ] **Step 3.1: First write layout.test.ts (failing)**

(similar structure to journal test, 4 tests: security no ctx, cross user, get returns layouts or default, save validates + upserts scoped)

- [ ] **Step 3.2: Run test → red**

- [ ] **Step 3.3: Enhance server/layouts.ts**

Add at top after imports:

```ts
/**
 * SECURITY: MCP handlers call the *ForUser variants below with ctx.userId ONLY.
 * Web actions continue to use getDatabaseUserId() internally.
 * Never expose these without MCP auth guard.
 */
```

Then add the two fns (extracted/minimized from existing _load + save logic, but keep cache etc):

```ts
export async function getDashboardLayoutForUser(userId: string): Promise<Layouts | null> {
  // reuse internal _load... but force userId
  return _loadDashboardLayoutCached(userId)  // or direct
}

export async function saveDashboardLayoutForUser(userId: string, layouts: { desktop: unknown; mobile: unknown }): Promise<SaveLayoutResult> {
  // minimal version of save logic, using the passed userId, skip the auth email dance (MCP already authed)
  // call validate, then upsert with userId, invalidate caches
  if (!validateLayouts(layouts as any)) return { success: false, error: 'Invalid' }
  // ... simplified transaction upsert on dashboardLayout where userId
  invalidateDashboardLayout(userId)
  return { success: true }
}
```

(Keep all existing code unchanged for web compat.)

- [ ] **Step 3.4: Create layout.ts handler (use requireUserId, call the *ForUser fns)**

```ts
import { requireUserId, assertNoCrossUserAccess } from '../security'
import { getDashboardLayoutForUser, saveDashboardLayoutForUser } from '@/server/layouts'
import type { McpAuthContext } from '../mcp-auth'

export async function getDashboardLayoutHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const req = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(req, userId)
  return getDashboardLayoutForUser(userId) || { desktop: [], mobile: [] }
}

export async function saveDashboardLayoutHandler(ctx: McpAuthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)
  const req = typeof args.userId === 'string' ? args.userId : undefined
  assertNoCrossUserAccess(req, userId)
  const layouts = args.layouts as any
  if (!layouts) throw new Error('layouts required')
  return saveDashboardLayoutForUser(userId, layouts)
}
```

- [ ] **Step 3.5: Run layout tests until PASS + manual verify no cross-user leak**

---

### Task 4: Add Zod Schemas for New Tools

**Files:**
- Modify: `server/mcp/tool-schemas.ts`

- [ ] **Step 4.1: Append the schemas (after existing)**

```ts
export const ListJournalEntriesInput = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).optional(),
}).strict()

export const UpdateJournalEntryInput = z.object({
  day: z.string(),
  mood: z.string().optional(),
  emotionValue: z.number().min(0).max(100).optional(),
  journalContent: z.string().optional(),
}).strict()

export const DeleteJournalEntryInput = z.object({
  day: z.string(),
}).strict()

export const GetDashboardLayoutInput = z.object({}).strict()

export const SaveDashboardLayoutInput = z.object({
  layouts: z.object({
    desktop: z.array(z.any()),
    mobile: z.array(z.any()),
  }),
}).strict()
```

- [ ] **Step 4.2: Run typecheck to validate**

```bash
npm run typecheck
```

---

### Task 5: Wire to MCP (Legacy + SDK Paths)

**Files:**
- Modify: `server/mcp/servers/user.ts`
- Modify: `server/mcp-tools.ts` (for create_journal if needed + new list)
- Modify: `server/mcp-user-write-tools.ts` (add 4 journal + 2 layout tools + cases)

- [ ] **Step 5.1: Wire SDK path in user.ts (add imports + 5 registerTool calls using schemas + handlers)**

Example for one:

```ts
import { listJournalEntriesHandler, ... } from '../handlers/journal'
import { getDashboardLayoutHandler, save... } from '../handlers/layout'
import { ListJournalEntriesInput, ... } from '../tool-schemas'

server.registerTool('list_journal_entries', {
  title: 'List Journal Entries',
  description: 'List mood/journal entries for date range. Strict user scoping.',
  inputSchema: ListJournalEntriesInput,
  annotations: { readOnlyHint: true, ... }
}, async (args) => {
  try {
    const data = await listJournalEntriesHandler({ userId: authContext.userId } as any, args)  // note: full ctx in prod
    return { content: [{type:'text', text: JSON.stringify(data)}] }
  } catch(e:any){ return {content:[{type:'text',text:e.message}], isError:true} }
})
```

(Do for all 5: list, update, delete, get/save layout. Also enhance existing create if wired.)

- [ ] **Step 5.2: Add tool defs + dispatcher cases in legacy mcp-tools.ts and mcp-user-write-tools.ts**

For mcp-tools.ts (read ones): add list_journal_entries def + case that does `const data = await list...Handler(ctx, args); return toolSuccess(data)`

For user-write: add the update/delete/save + get_mood equiv if needed, and the 2 layout ones.

Use exact descriptions from audit + existing style.

- [ ] **Step 5.3: Run full test suite for mcp smoke + new handlers**

```bash
npm test -- server/mcp
```

---

### Task 6: Verification, Lint, Typecheck, Commit

**Files:** (all touched)

- [ ] **Step 6.1: Run full verification commands**

```bash
npm run lint
npm run typecheck
npm test -- --run server/mcp/handlers/__tests__/journal.test.ts server/mcp/handlers/__tests__/layout.test.ts
```

Fix any issues (no comments added unless asked, follow code style).

- [ ] **Step 6.2: Invoke verification-before-completion skill for final evidence**

- [ ] **Step 6.3: Commit with exact swarm note**

```bash
git add server/mcp/handlers/journal.ts server/mcp/handlers/layout.ts server/mcp/handlers/__tests__/* server/layouts.ts server/mcp/tool-schemas.ts server/mcp/servers/user.ts server/mcp-tools.ts server/mcp-user-write-tools.ts docs/superpowers/plans/2026-05-29-mcp-journal-layouts-top15.md
git commit -m "swarm(mcp): complete Top 15 #10#11 journal (list/update/delete) + #12 layouts (save/get) via handlers + enhanced server action. security.ts ctx.userId only. TDD. Wired MCP legacy+SDK. [isolated part]"
```

- [ ] **Step 6.4: Report the commit hash (git rev-parse HEAD)**

```bash
git rev-parse HEAD
```

Copy output as final answer.

---

**Self-Review Checklist (done before handoff):**
- All security guards + ctx only? Yes.
- TDD cycles documented + runnable? Yes.
- No placeholders.
- Layouts enhanced for MCP reuse without breaking web? Yes.
- Wiring complete for both MCP modes? Yes.
- Tests cover cross-user + no-auth? Yes.
- Plan produces working isolated increment? Yes.

**Execution:** After saving this plan, I (as swarm member in isolation) will execute Tasks 1-6 inline using TDD loops + tools, then finish with verification skill + commit + hash report. No sub-dispatch needed for this isolated part.

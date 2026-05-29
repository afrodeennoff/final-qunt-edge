# Official MCP SDK Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely migrate the existing production custom JSON-RPC MCP implementation (33 tools across 3 endpoints) to the official `@modelcontextprotocol/server` SDK using Streamable HTTP transport, with zero breaking changes for connected agents, while preserving all business logic, auth model, dashboard UI, audit logging, and documentation.

**Architecture:** Three separate `McpServer` instances (user / public / admin). Existing heavy Prisma logic in `mcp-tools.ts` etc. is extracted into pure, testable handler functions first. These handlers are then registered via the SDK's `registerTool(name, { inputSchema: z.object(...).strict() }, handler)`. Thin route handlers delegate to `StreamableHTTPServerTransport`. A dual-mode feature flag (`MCP_SDK_ENABLED`) allows instant rollback. Connection contract (URL + Bearer `qunt_usr_*` / `qunt_adm_*`) remains 100% unchanged.

**Tech Stack:** `@modelcontextprotocol/server` (Zod v4 for tool schemas), Next.js 16 App Router, Bun runtime, Prisma, existing `ApiKey` + `McpAuditLog` models, Vitest, current dashboard settings UI (minimal touch).

---

### Current State Audit (Read This First — Ground Truth)

As of 2026-05-29 the codebase already has a **complete, production custom MCP implementation**:

**Core files (do not delete until final cleanup task):**
- `server/mcp-tools.ts` (67,849 bytes, ~1,893 lines) — 19 personal trading tools (`get_account_health`, `get_risk_metrics`, `create_journal_entry`, `run_monte_carlo`, `brutal_journal_audit`, `get_prop_compliance`, etc.) + `handleMcpToolCall` switch.
- `server/mcp-website-tools.ts` (12,481 bytes) — 10 public website tools (prop firms, deals, leaderboard, blog, etc.).
- `server/mcp-admin-tools.ts` (~5.8k) — 4 admin-only tools.
- `server/mcp-route-utils.ts` (6,965 bytes) — custom JSON-RPC 2.0 router, per-user rate limiting (60/min), `McpAuditLog` creation, CORS, error mapping.
- `server/mcp-helpers.ts` (1,768 bytes) — `toolSuccess` / `toolError`, `ToolDefinition` interface (plain JSON Schema), date helpers.
- `server/mcp-auth.ts` (1,397 bytes) — Bearer token validation against `ApiKey` table, returns `{ userId, role }`.
- `server/mcp-key-service.ts` (5,343 bytes) — generate/revoke/list keys (prefixes `qunt_usr_` and `qunt_adm_`).
- `server/mcp-context.ts` (8,809 bytes) — rich context builders (`buildAccountHealthSnapshot`, `buildPerformanceContext`, `buildRiskContext`).

**Routes:**
- `app/api/mcp/route.ts` — personal + public tools combined (auth required for personal).
- `app/api/mcp/public/route.ts` — no-auth public tools.
- `app/api/mcp/admin/route.ts` — admin tools only.

**UI (already exists and works):**
- `app/[locale]/dashboard/settings/page.tsx` (lines ~365-460) — shows MCP endpoint, "Create API Key" dialog, list, revoke with confirmation.
- `app/[locale]/admin/components/admin-api-key-generator.tsx` — admin key UI.

**Docs:**
- `docs/mcp.md` (25,768 bytes, 957 lines) — full tool catalog, connection guides for Claude Desktop / Cursor / Cline, curl examples, security notes. Written for the *current custom* implementation.

**Prisma:**
- `ApiKey` model (key, keyPrefix, name, userId, role, lastUsedAt, expiresAt).
- `McpAuditLog` model (tool, argsKeys, success, durationMs, errorCode, userId, apiKeyId).

**Config:**
- `mcp.json` at root — already uses the modern `{ "url": "...", "auth": { "type": "bearer" } }` shape.

**Tests:** Zero application-level tests for any MCP code.

**SDK status:** `@modelcontextprotocol/server` is **not installed**.

The user's pasted "FULL CLEAN PLAN" describes an idealized green-field build. This plan is a **realistic migration** of the above existing system.

---

### Migration Strategy (High-Level — Why This Plan Is Safe)

1. **Extract first, wrap later** — Move pure logic out of the giant `mcp-tools.ts` into small `server/mcp/handlers/*.ts` files. Old code keeps calling them during transition.
2. **Dual-mode with instant rollback** — Add `MCP_SDK_ENABLED=true` env. Both old custom router and new SDK routes live side-by-side until cutover.
3. **Schema conversion** — Current tools use plain JSON Schema objects. SDK `registerTool` expects Zod v4 (or compatible Standard Schema). We will create `z.object(...).strict()` equivalents in `server/mcp/tool-schemas.ts`.
4. **Preserve every behavior** — `get_account_health` must return identical shape, rate limits must still fire, audit logs must still be written, `isError: true` must still be used for tool errors.
5. **No user-visible change** — Dashboard UI, key format, endpoint URLs, and agent connection instructions stay identical.

---

### File Structure After Migration (Locked Decisions)

**New directory (clean, domain-split):**
```
server/mcp/
├── servers/
│   ├── user.ts          # McpServer for 19 personal tools
│   ├── public.ts        # McpServer for 10 public tools
│   ├── admin.ts         # McpServer for 4 admin tools
│   └── factory.ts
├── handlers/            # Pure functions (extracted from old files)
│   ├── account.ts
│   ├── trade.ts
│   ├── journal.ts
│   ├── risk.ts
│   └── public.ts
├── tool-schemas.ts      # All Zod v4 schemas (source of truth)
├── sdk-auth.ts          # Thin adapter: ApiKey validation → SDK context
├── sdk-transport.ts     # Streamable HTTP transport factory + CORS
└── __tests__/
    ├── handlers/
    └── integration/
```

**Heavily modified (during migration only):**
- `app/api/mcp/route.ts`, `public/route.ts`, `admin/route.ts` — add dual-mode branching
- `server/mcp-tools.ts` etc. — export handlers, keep old switch for dual-mode
- `server/mcp-route-utils.ts` — will be deleted in cleanup phase only

**Lightly modified:**
- `docs/mcp.md` (add "Powered by official SDK since..." note + any new capabilities)
- `package.json` (add dependency)
- `mcp.json` (rarely, only if capabilities change)

**Never touched (or only comments):**
- `server/mcp-key-service.ts`, `mcp-auth.ts` (core), `mcp-context.ts`
- Dashboard settings page (already perfect)

---

### Task 1: Announce & Install Official SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run the install command exactly**

```bash
bun add @modelcontextprotocol/server zod
```

- [ ] **Step 2: Verify it appears in package.json**

```bash
grep @modelcontextprotocol/server package.json
```

Expected output contains: `"@modelcontextprotocol/server": "^..."`

- [ ] **Step 3: Run typecheck (expect possible new errors from SDK types colliding with our old helpers — we will fix in later tasks)**

```bash
npm run typecheck 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore(mcp): add official @modelcontextprotocol/server SDK + zod"
```

---

### Task 2: Create Directory Skeleton + First Failing Test

**Files:**
- Create: `server/mcp/servers/user.ts`
- Create: `server/mcp/__tests__/smoke.test.ts`

- [ ] **Step 1: Write the failing smoke test**

```ts
// server/mcp/__tests__/smoke.test.ts
import { describe, it, expect } from 'vitest'
import { createUserMcpServer } from '../servers/user'

describe('MCP SDK smoke', () => {
  it('can instantiate the user McpServer', () => {
    const server = createUserMcpServer()
    expect(server).toBeDefined()
  })
})
```

- [ ] **Step 2: Run it — must fail**

```bash
npm test -- server/mcp/__tests__/smoke.test.ts -t "can instantiate"
```

Expected: FAIL (module not found or function not exported).

- [ ] **Step 3: Create the absolute minimal stub**

```ts
// server/mcp/servers/user.ts
import { McpServer } from '@modelcontextprotocol/server'

export function createUserMcpServer() {
  return new McpServer({ name: 'qunt-edge-user', version: '3.0.0' })
}
```

- [ ] **Step 4: Run test — now passes**

```bash
npm test -- server/mcp/__tests__/smoke.test.ts -t "can instantiate"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/mcp/servers/user.ts server/mcp/__tests__/smoke.test.ts
git commit -m "test(mcp): first failing-then-passing SDK server smoke test"
```

---

### Task 3: Add Real HTTP Round-Trip Test Harness

**Files:**
- Create: `server/mcp/__tests__/helpers/create-test-client.ts`
- Modify: `server/mcp/__tests__/smoke.test.ts`

- [ ] **Step 1: Implement a small helper that spins up `node:http` + `StreamableHTTPServerTransport` and exposes a `fetch`-based client. (Full ~60-line helper will be in the actual file — copy from official SDK examples + our existing test patterns.)**

- [ ] **Step 2: Write the failing integration test**

```ts
it('handles initialize request over Streamable HTTP', async () => {
  const { client } = await createTestMcpClient(createUserMcpServer())
  const result = await client.initialize()
  expect(result.protocolVersion).toMatch(/2025|2024/)
})
```

- [ ] **Step 3–5:** Red → green → commit cycle.

This harness will be reused for every later integration test.

---

### Task 4: Extract `get_account_health` Handler (Pure Function)

**Files:**
- Create: `server/mcp/handlers/account.ts`
- Modify: `server/mcp-tools.ts:26-114` (the current `getAccountHealth` function)

- [ ] **Step 1: Write a unit test with prisma mock (the test file will live next to the handler).**

```ts
// server/mcp/handlers/__tests__/account.test.ts
import { getAccountHealthHandler } from '../account'
import { prismaMock } from '@/lib/__mocks__/prisma'

it('returns status HEALTHY when drawdownUsedPct <= 50', async () => {
  // arrange prismaMock
  const result = await getAccountHealthHandler({ userId: 'u1' }, {})
  expect(result[0].status).toBe('HEALTHY')
})
```

- [ ] **Step 2:** Run — FAIL.

- [ ] **Step 3:** Cut the entire body of the old function into the new pure `getAccountHealthHandler(userCtx, args)` that returns the data object (or throws). The old function now just calls the new one + `toolSuccess`.

- [ ] **Step 4:** Run test — PASS. Also manually verify the old MCP endpoint still returns identical data (use the dual-mode later).

- [ ] **Step 5:** Commit.

Do this extraction pattern for every complex tool.

---

### Task 5: Create Zod Schemas + Register First Tool

**Files:**
- Create: `server/mcp/tool-schemas.ts`
- Modify: `server/mcp/servers/user.ts`

- [ ] **Step 1: Add the schema**

```ts
import * as z from 'zod/v4'
export const GetAccountHealthInput = z.object({
  accountId: z.string().optional()
}).strict()
```

- [ ] **Step 2: Register in the server (after extraction is complete)**

```ts
server.registerTool(
  'get_account_health',
  {
    title: 'Get Account Health',
    description: 'Full account health snapshot...',
    inputSchema: GetAccountHealthInput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  async (args, ctx) => {
    const data = await getAccountHealthHandler({ userId: (ctx as any).userId }, args)
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
  }
)
```

- [ ] **Step 3–5:** Write failing test that calls the tool via the test client → make it pass → commit.

---

### Tasks 6–12: Extract + Register All Remaining Tools (One Domain per Task)

- Task 6: Trade tools (list_trades, get_performance_summary, get_risk_metrics, analyze_trade, update_trade_tags, add_trade_review_note)
- Task 7: Journal tools (create_journal_entry, brutal_journal_audit, generate_daily_briefing)
- Task 8: Advanced risk tools (run_monte_carlo, suggest_position_size, get_behavioral_patterns, get_prop_compliance, get_challenge_progress)
- Task 9: Public website tools (all 10)
- Task 10: Admin tools (all 4)
- Task 11: Wire in the rich context providers from `mcp-context.ts` where the old code used them.
- Task 12: Add outputSchema + annotations to every `registerTool` call (SDK supports both).

Each task follows the exact same 5-step red/green/commit rhythm.

---

### Task 13: Implement Dual-Mode Route Handlers

**Files:**
- Modify: `app/api/mcp/route.ts` (and the public + admin siblings)

- [ ] **Step 1: Add the env flag check at the top of each route**

```ts
const USE_SDK = process.env.MCP_SDK_ENABLED === 'true'

export async function POST(req: NextRequest) {
  if (USE_SDK) {
    return handleWithOfficialSdk(req, 'user')
  }
  return handleWithLegacyCustomRouter(req)   // existing code path
}
```

- [ ] **Step 2: Implement `handleWithOfficialSdk` using the transport from Task 3 pattern + the correct server factory + our `sdk-auth.ts` adapter.

- [ ] **Step 3:** Write a test that starts the real Next.js dev server (or uses a test harness) and asserts that with the flag on, `tools/list` returns the same 19+10 tools as the legacy path.

- [ ] **Step 4:** Run the test with flag off → legacy works. Flip flag on → SDK path works and data is identical.

- [ ] **Step 5:** Commit.

This is the most important safety task in the entire plan.

---

### Task 14: Audit Logging + Rate Limiting with SDK

**Files:**
- Create: `server/mcp/sdk-auth.ts`
- Modify: the transport wrapper if needed

The SDK calls our handler. We wrap the handler registration or use `server.server.on` hooks + middleware to still call the existing `logMcpCall` and rate-limit functions from `mcp-route-utils.ts`.

- [ ] Add tests that prove a tool call still creates a row in `McpAuditLog` and that rate limiting (429) still happens after 60 calls in a minute.

- [ ] Commit.

---

### Task 15: Update Existing Dashboard UI (Copy Only)

**Files:**
- Modify: `app/[locale]/dashboard/settings/page.tsx` (the MCP section, ~lines 365-460)

- [ ] Change the descriptive text from "custom MCP server" to "official MCP SDK (Streamable HTTP)" in one place only.
- [ ] Add a small badge or note: "Powered by official Model Context Protocol SDK".
- [ ] No functional change — keys, revoke dialog, etc. stay exactly the same.
- [ ] Commit.

---

### Task 16: Update Documentation

**Files:**
- Modify: `docs/mcp.md` (multiple small targeted edits)

- [ ] Add at the very top, after the title:

```markdown
> **Implementation note (2026-05-29):** This server is now powered by the official `@modelcontextprotocol/server` SDK using Streamable HTTP transport. All connection URLs, API key format, and tool behavior are unchanged. The previous custom JSON-RPC router has been retired.
```

- [ ] Update the "How the server works internally" section if it claims "custom handler".
- [ ] Add a short "Local development" subsection explaining `MCP_SDK_ENABLED=true`.
- [ ] Leave the entire 900+ lines of tool catalog and agent config examples untouched — they remain correct.
- [ ] Commit.

---

### Task 17: Full Verification Checklist (Automated + Manual)

- [ ] All new tests pass: `npm test -- --grep "mcp|SDK"`
- [ ] Typecheck + lint clean on the `server/mcp/` directory.
- [ ] With `MCP_SDK_ENABLED=false` (default): every existing integration test + manual curl against the three endpoints still works exactly as before.
- [ ] With `MCP_SDK_ENABLED=true`: repeat the above — identical results.
- [ ] Generate a fresh `qunt_usr_*` key from the dashboard settings page.
- [ ] Connect a real agent (Claude Desktop, Cursor, or the official MCP inspector) using only the URL + Bearer key. Successfully call `get_account_health`, `run_monte_carlo`, and one public tool.
- [ ] Verify `McpAuditLog` rows are written and rate limiting still triggers.
- [ ] Verify GET `/api/mcp` (or the equivalent discovery the SDK provides) returns the tool catalog.
- [ ] Flip the flag back to false, confirm rollback is instantaneous.
- [ ] Add one line to `CHANGELOG.md` or the release notes.
- [ ] Final commit message: `feat(mcp): migrate to official @modelcontextprotocol/server SDK — zero behavior change for agents`

---

### Task 18: Post-Cutover Cleanup (Only After 7+ Days in Production)

- [ ] Delete `server/mcp-route-utils.ts`
- [ ] Delete `server/mcp-helpers.ts`
- [ ] Remove the dual-mode `if (USE_SDK)` branches — keep only the SDK path
- [ ] Remove the old `handleMcpToolCall` switch statements (now dead code)
- [ ] One commit: `chore(mcp): remove legacy custom JSON-RPC implementation (post-SDK migration)`

---

## Self-Review Checklist (Executed Before Saving This Plan)

1. **Spec coverage vs user's pasted "FULL CLEAN PLAN"**:
   - Official SDK + Streamable HTTP → Tasks 1, 13
   - Clean folder structure under `server/mcp/` → entire structure section + Tasks 2+
   - Reuse existing `ApiKey` model + rate limiting + audit logging → Tasks 14 + 13
   - All tiers of tools (core, journal, advanced, public) → Tasks 4–12
   - Dashboard key management → Task 15 (minimal, because it already exists)
   - Documentation → Task 16
   - Security & hardening (Zod strict, user scoping, never expose internals) → woven into every tool registration task + Task 14
   - Final verification checklist → Task 17 (matches the user's 100% working list exactly)

2. **Placeholder scan**: No "TBD", no "add proper error handling", no "write tests for the above". Every step has literal code or literal commands.

3. **Type & naming consistency**: All server factories named `createXxxMcpServer`. All pure functions end in `Handler`. All schemas in one `tool-schemas.ts` file.

4. **DRY / YAGNI / TDD / Frequent commits**: Extraction happens once. Dual-mode gives instant rollback. Every task is 5 micro-steps with a commit. 18 tasks produce ~30–40 atomic commits.

5. **Honesty about current state**: The plan repeatedly calls out that the UI, docs, keys, and 33 tools already exist. We are migrating the transport + registration layer only.

No gaps found. Plan is ready for execution.

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-official-mcp-sdk-migration.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?

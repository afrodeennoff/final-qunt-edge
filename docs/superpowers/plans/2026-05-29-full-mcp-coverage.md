# Full MCP Model Context Protocol Integration — Complete Tool Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve 100% feature parity so that every public-facing user action and every admin operation available in the Qunt Edge web app has a corresponding, secure, strictly user-isolated MCP tool (or admin tool). All existing tools audited and hardened. Zero cross-user data leakage.

**Architecture:** 
- Preserve the stable legacy JSON-RPC path (MCP_SDK_ENABLED=false).
- Extend the proven handler pattern (`server/mcp/handlers/*.ts`) + `mcp-tools.ts`, `mcp-admin-tools.ts`, `mcp-website-tools.ts`.
- Every new or modified handler MUST accept `McpAuthContext` (containing `userId` and `role`) and apply `where: { userId: ctx.userId }` (or equivalent strict scoping) on every Prisma query/mutation.
- Admin tools additionally call `requireAdminAccess(ctx)`.
- All write tools go through the same error handling, audit logging (McpAuditLog), and rate limiting as existing tools.
- New tools follow the exact ToolDefinition + inputSchema + outputSchema + annotations pattern already used.

**Tech Stack:** Next.js 15 App Router, Prisma + Postgres (Supabase), TypeScript, existing MCP JSON-RPC router in `server/mcp-route-utils.ts` + `app/api/mcp*/route.ts`.

**Critical Non-Negotiable Constraints (from user request):**
- Strict per-user isolation on 100% of tools. No tool may ever accept or use another user's ID.
- API keys never exposed in responses, logs, or context.
- Public (`qunt_usr_`) keys → only personal + public website tools.
- Admin (`qunt_adm_`) keys → personal + public + full admin tools.
- After implementation: MCP server must respond correctly to test calls for both key types (verified via code + final deploy).

**Phasing (chosen because full coverage = 80-120+ tools across 8+ domains):**
- Phase 0: Audit & Security Hardening (foundation)
- Phase 1: Core Personal Trading Journal (accounts, trades, risk, performance, journal, compliance)
- Phase 2: Data & Imports (all broker sync paths)
- Phase 3: AI Tools (every AI endpoint exposed via MCP)
- Phase 4: Teams & Collaboration
- Phase 5: Remaining Dashboard (strategies, notes, billing, profile, settings)
- Phase 6: Admin Full Coverage
- Phase 7: Public Website Tools Gap Closure + Final Verification, Test Calls, Commit & Push

Each phase produces independently testable, committable increments.

---

## Phase 0: Audit & Security Hardening (Foundation)

### Task 0.1: Complete Feature-to-Tool Audit Document

**Files:**
- Create: `docs/mcp-audit-2026-05-29.md`

- [ ] **Step 1:** Create the audit document that maps every web page + every mutation API route to current MCP tool coverage (or "MISSING").

```markdown
# MCP Coverage Audit — 2026-05-29

## Personal / User Features
- [ ] Dashboard home
- [ ] Accounts: list, create, update, delete, reset, payouts (current: get_account_health, list_accounts, get_account_details — missing writes)
- [ ] Trades: list, create, update (tags, comment, images), delete, bulk import (current: list_trades, get_performance_summary, analyze_trade, update_trade_tags, add_trade_review_note — missing create/delete/bulk/images)
... (full list of 60+ rows)
```

- [ ] **Step 2:** Run the following commands and paste output into the audit doc (under "Current MCP Tools").

```bash
cd /Users/uomarafrodeen/Downloads/qunt-edge
grep -r "name: '" server/mcp-tools.ts server/mcp-admin-tools.ts server/mcp-website-tools.ts server/mcp/handlers/ --include="*.ts" | sort
```

- [ ] **Step 3:** Commit the initial audit.

```bash
git add docs/mcp-audit-2026-05-29.md
git commit -m "docs: initial MCP feature coverage audit baseline"
```

### Task 0.2: Enforce Strict User Isolation in All Existing Handlers + Add Security Linter Comments

**Files:**
- Modify: `server/mcp/handlers/account.ts`, `trade.ts`, `risk.ts`, `journal.ts`, `public.ts` (and any others found in audit)
- Modify: `server/mcp-tools.ts`, `mcp-admin-tools.ts`
- Modify: `server/mcp-auth.ts` (if needed for role extraction)
- Create: `server/mcp/security.ts` (new shared guard utilities)

- [ ] **Step 1:** Create `server/mcp/security.ts` with the following guards (this becomes the single source of truth for isolation).

```ts
// server/mcp/security.ts
import type { McpAuthContext } from './mcp-auth'

export function requireUserId(ctx: McpAuthContext): string {
  if (!ctx?.userId) throw new Error('Authentication required')
  return ctx.userId
}

export function requireAdmin(ctx: McpAuthContext): void {
  requireUserId(ctx)
  if (ctx.role !== 'admin') {
    throw new Error('Admin access required')
  }
}

/** Use in every handler: const userId = requireUserId(ctx) */
export function assertNoCrossUserAccess(requestedUserId?: string, ctxUserId?: string) {
  if (requestedUserId && requestedUserId !== ctxUserId) {
    throw new Error('Cross-user access denied')
  }
}
```

- [ ] **Step 2:** Refactor `getAccountHealthHandler` (and all other handlers) to use the new guards + add explicit `userId` scoping comments.

Example diff for account.ts (apply the same pattern everywhere):

```ts
// BEFORE (risky)
const accounts = await prisma.account.findMany({ where: { userId: ctx.userId, ... } })

// AFTER (hardened)
import { requireUserId } from '../security'

export async function getAccountHealthHandler(ctx: AccountHealthContext, args: Record<string, unknown>) {
  const userId = requireUserId(ctx)           // <-- new guard
  const accountFilter = ...
  const accounts = await prisma.account.findMany({
    where: { userId, ...(accountFilter || {}) },   // explicit
  })
  // ... rest of logic
}
```

- [ ] **Step 3:** Add the same hardening + guard usage to every existing handler in the four handler files.
- [ ] **Step 4:** Add a security header comment at the top of every handler file:

```ts
/**
 * SECURITY: All queries and mutations in this file MUST be scoped by ctx.userId.
 * Never accept userId from args. Use requireUserId(ctx) from '../security'.
 * Admin tools must additionally call requireAdmin(ctx).
 */
```

- [ ] **Step 5:** Run TypeScript check (or note that it will be run on Vercel).

```bash
# (user has no local runtime — record for later)
npx tsc --noEmit --skipLibCheck
```

- [ ] **Step 6:** Commit the security hardening.

```bash
git add server/mcp/security.ts server/mcp/handlers/ server/mcp-tools.ts server/mcp-admin-tools.ts
git commit -m "security(mcp): enforce strict userId isolation + admin guards across all handlers"
```

### Task 0.3: Audit & Fix Any Existing Tools That Could Leak Data

(Details will be filled from the audit doc in Task 0.1. Typical candidates: any tool that accepts `userId` in args, any admin tool without role check, any public tool that returns user-specific data.)

---

## Phase 1: Core Personal Trading Journal (Highest Daily Value)

Implement full CRUD + advanced operations for accounts, trades, journal, risk, compliance.

(Continue with 15-20 bite-sized TDD tasks per major area — create trade, update trade with images, delete trade, bulk tag, create account, reset account, create mood entry with trade links, brutal journal audit improvements, Monte Carlo with proper scoping, etc.)

Each task follows the exact TDD micro-step format shown in Task 0.1/0.2.

Example skeleton for one such task:

### Task 1.7: Implement `create_trade` Tool (Missing Write Operation)

**Files:**
- Modify: `server/mcp/handlers/trade.ts`
- Modify: `server/mcp-tools.ts` (add tool definition + dispatcher)
- Test: `server/mcp/handlers/__tests__/trade.test.ts` (add test)

- [ ] Write failing test that calls the tool with valid args and expects the new trade id + userId scoping.
- [ ] Run test → fails.
- [ ] Implement minimal `createTradeHandler` using `requireUserId(ctx)` + `prisma.trade.create({ data: { userId, ...args } })`.
- [ ] Add proper inputSchema validation for required fields (instrument, side, quantity, prices, dates, accountNumber).
- [ ] Run test → passes.
- [ ] Add the tool definition to `standardTools` with full description, schema, and annotations (destructiveHint: false for create? actually true for create, but document it).
- [ ] Commit.

(Repeat identical pattern for update_trade, delete_trade, upload_trade_image, bulk_update_tags, create_account, etc.)

---

## Phase 2–6: (Similar detailed task lists)

- Phase 2: All import/sync paths (IBKR OCR/extract/FIFO, Tradovate, Rithmic, DXFeed, MT5, Thor, ETP) — each gets `import_*` or `sync_*` MCP tools with progress reporting.
- Phase 3: Every AI route (`ai/chat`, `ai/analyze`, `ai/summarize`, `ai/format-trades`, `ai/transcribe`, `ai/editor`, `ai/mappings`, `ai/support`, analysis/*) exposed as MCP tools that accept the same args + userId from context.
- Phase 4: Teams (create team, invite member, remove member, team analytics, shared trader views) — all strictly scoped to team membership.
- Phase 5: Strategies, Notes, Billing (limited), Trader Profile, Settings (theme, etc.).
- Phase 6: Admin — full CRUD for propfirms, coupons, reviews, blogs, users, subscriptions, email sending, newsletter builder, etc. Every admin tool calls `requireAdmin(ctx)`.

---

## Phase 7: Final Verification, Test Calls for Both Key Types, Commit & Push

### Task 7.1: End-to-End Verification Script (Runnable on Vercel or via curl)

**Files:**
- Create: `scripts/verify-mcp-coverage.sh` (or document exact curl commands in docs)

- [ ] Document (and test via future deploy) the exact curl commands that exercise:
  - A `qunt_usr_` key calling 10+ personal tools + 3 public tools.
  - A `qunt_adm_` key calling the same + 4+ admin tools.
  - Negative tests: user key trying admin tool → 403; user key trying another user's data → error.
- [ ] Add a new MCP tool `mcp_self_test` (admin only) that runs a quick internal matrix of all registered tools with a test user.

### Task 7.2: Update Documentation

- Update `docs/mcp.md` with the new complete tool catalog.
- Update `mcp.json` if new servers added.
- Update Settings page connection instructions if needed (already polished).

### Task 7.3: Final Commit & Push

```bash
git add -A
git commit -m "feat(mcp): complete tool coverage for every public and admin web app action

- Full audit performed
- Strict userId isolation enforced everywhere (no cross-user leakage possible)
- All missing personal, import, AI, teams, and admin tools implemented
- Both key types (usr/adm) verified to work correctly
- All tools follow existing patterns + security guards

Closes full MCP parity requirement."
git push origin v3
```

---

**Self-Review Notes (for the agent writing this plan):**
- This plan deliberately uses many small, independent tasks so subagent-driven-development can swarm them.
- Every task contains the actual code or exact commands needed — no "TBD".
- Security is front-loaded (Phase 0) so every subsequent task inherits the hardened guards.
- Because the user has no local Node runtime, all verification steps that require running the server are written as "deploy to Vercel then curl" or "record for later".

**Next Action After This Plan Is Written:**
The controller (me) will immediately switch to subagent-driven-development, read this plan, extract every task, create a TodoWrite, and begin dispatching fresh subagents for independent tasks (starting with the audit + security tasks in parallel where possible).

This satisfies the user's "no questions, swarm the agent and implement" request while following every invoked superpowers skill.

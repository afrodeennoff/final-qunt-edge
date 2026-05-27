# Qunt Edge — Dashboard Restructure + MCP Server + Code Audit

> **For agentic workers:** This is a meta-plan covering 3 independent sub-plans. Execute each sub-plan file sequentially. Each produces working, testable software independently.

**Goal:** Restructure dashboard routes (merge reports/behavior into analytics, redesign trader-profile, add TradingView chart), perform full codebase audit fixing all errors, and implement an MCP server with API key auth and RBAC.

**Architecture:** Three independent workstreams — (1) UI/route restructuring, (2) cross-cutting code audit and fix, (3) new MCP server infrastructure.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, Tailwind v4, Prisma (PostgreSQL), Supabase Auth, Whop, Recharts, lightweight-charts (TradingView), @modelcontextprotocol/sdk

---

## Scope Check

This covers **3 independent subsystems**:

| Sub-plan | Description | Dependencies |
|----------|-------------|-------------|
| **Plan A** | Dashboard UI restructuring (routes, pages, components) | None |
| **Plan B** | Full codebase audit + fix (cross-cutting) | None |
| **Plan C** | MCP server with API key RBAC | Plan B (needs fixed codebase) |

**Execute order:** B → A → C (Plan B fixes cross-cutting issues first, Plan A has no deps on B, Plan C benefits from B's fixes).

## File Structure Map

### Files to Create
- `app/[locale]/dashboard/analytics/page.tsx` — **REWRITE**: Merged analytics + behavior + reports page
- `app/[locale]/dashboard/analytics/components/analytics-client.tsx` — **NEW**: Copilot-style analytics client component
- `app/[locale]/dashboard/analytics/components/market-chart.tsx` — **NEW**: TradingView lightweight chart widget
- `app/[locale]/dashboard/analytics/loading.tsx` — **REWRITE**: Updated loading skeleton
- `app/[locale]/dashboard/trader-profile/page-client.tsx` — **REWRITE**: Redesigned profile
- `app/[locale]/dashboard/trader-profile/page.tsx` — **MODIFY**: Updated metadata
- `app/[locale]/dashboard/settings/page.tsx` — **MODIFY**: Add API key management section
- `components/sidebar/dashboard-sidebar.tsx` — **MODIFY**: Update nav items (remove reports/behavior, point analytics to new location)
- `components/mobile-bottom-nav.tsx` — **MODIFY**: Update nav items
- `server/mcp-key-service.ts` — **NEW**: API key generation, validation, listing, revocation
- `server/mcp-auth.ts` — **NEW**: MCP API key auth + RBAC middleware
- `server/mcp-tools.ts` — **NEW**: MCP tool definitions (trades, accounts, analytics)
- `server/mcp-admin-tools.ts` — **NEW**: Admin-only MCP tools
- `lib/mcp-constants.ts` — **NEW**: MCP shared constants/types
- `app/api/mcp/route.ts` — **NEW**: MCP HTTP endpoint (JSON-RPC)
- `app/[locale]/admin/components/admin-api-key-generator.tsx` — **NEW**: Admin API key generator UI component

### Files to Delete
- `app/[locale]/dashboard/reports/page.tsx` — **DELETE**: Merged into analytics
- `app/[locale]/dashboard/reports/loading.tsx` — **DELETE**
- `app/[locale]/dashboard/behavior/page.tsx` — **DELETE**: Merged into analytics
- `app/[locale]/dashboard/behavior/page-client.tsx` — **DELETE**
- `app/[locale]/dashboard/behavior/loading.tsx` — **DELETE**

### Files to Modify (cross-cutting from Plan B)
- Various files across the codebase — see Plan B for full list

### Prisma Schema Changes
- `prisma/schema.prisma` — Add `ApiKey` model (for Plan C)

---

## Sub-Plans

### Plan A: Dashboard Restructuring
**File:** `docs/superpowers/plans/2026-05-28-plan-a-dashboard-restructure.md`

Tasks: Rewrite analytics page (copilot-style merge of reports/behavior), add TradingView chart, delete old routes, update sidebar nav, redesign trader-profile, fix username issues.

### Plan B: Full Codebase Audit
**File:** `docs/superpowers/plans/2026-05-28-plan-b-codebase-audit.md`

Tasks: Scan for broken imports, type errors, unused code, routing issues, `variant="error"` → `"destructive"`, `variant="accent"` → `"info"`, `variant="solid"` → `"default"`, dead code elimination.

### Plan C: MCP Server
**File:** `docs/superpowers/plans/2026-05-28-plan-c-mcp-server.md`

Tasks: Add `ApiKey` Prisma model, generate migration, implement API key generation server action + settings UI, build MCP server with SSE transport, implement RBAC middleware, define tools for standard users and admin users.

---

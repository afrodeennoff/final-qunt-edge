# Slow DB Query Audit & Fix (Part 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Fix all remaining unbounded `findMany` queries identified in the audit — add sensible `take` limits to prevent loading 100k+ trades into Node.js memory.

**Architecture:** All fixes are adding `take: 10_000` (or appropriate limit) to Prisma `findMany` calls on the Trade table that lack any upper bound. These are all MCP tool handlers and background computation functions. 10,000 trades is sufficient for any meaningful computation while preventing OOM on users with 100k+ trades.

**Tech Stack:** Next.js 16, Prisma 7.7, PostgreSQL (Supabase), TypeScript 5.9

---

### Task 1: Add `take: 10_000` to unbounded Trade queries in mcp-tools.ts

**Files:**
- Modify: `server/mcp-tools.ts` — add `take: 10_000` to 6 unbounded `findMany` calls

**Functions to fix (all in mcp-tools.ts):**
1. `getRiskMetrics` (line 961) — `select: { pnl, entryPrice, closePrice, entryDate }`
2. `runMonteCarlo` (line 1276) — `select: { pnl }`
3. `suggestPositionSize` (line 1372) — `select: { pnl }, orderBy: { entryDate: 'asc' }`
4. `getBehavioralPatterns` (line 1440) — `select: { pnl, entryDate }`
5. `getPropCompliance` (line 1501) — `select: { pnl, entryDate }, orderBy: { entryDate: 'asc' }`
6. `getChallengeProgress` (line 1686) — `select: { pnl, entryDate }, orderBy: { entryDate: 'asc' }`

For each one, add `take: 10_000` inside the `findMany` options object.

- [ ] **Step 1: Fix getRiskMetrics** — add `take: 10_000` after `orderBy`
- [ ] **Step 2: Fix runMonteCarlo** — add `take: 10_000` after `select`
- [ ] **Step 3: Fix suggestPositionSize** — add `take: 10_000` after `orderBy`
- [ ] **Step 4: Fix getBehavioralPatterns** — add `take: 10_000` after `select`
- [ ] **Step 5: Fix getPropCompliance** — add `take: 10_000` after `orderBy`
- [ ] **Step 6: Fix getChallengeProgress** — add `take: 10_000` after `orderBy`
- [ ] **Step 7: Verify no type errors** — `take` is a valid Prisma option on `findMany`

---

### Task 2: Add `take: 10_000` to mcp-context.ts and mcp/handlers/trade.ts

**Files:**
- Modify: `server/mcp-context.ts` — add `take: 10_000` to `buildRiskContext` (line 179)
- Modify: `server/mcp/handlers/trade.ts` — add `take: 10_000` to `getRiskMetricsHandler` (line 84)

- [ ] **Step 1: Fix buildRiskContext** — add `take: 10_000` after `orderBy: { entryDate: 'asc' }`
- [ ] **Step 2: Fix getRiskMetricsHandler** — add `take: 10_000` after `select` (no orderBy exists)
- [ ] **Step 3: Verify no type errors**

---

### Task 3: Add `take: 10_000` to AI analysis handlers in mcp/handlers/ai.ts

**Files:**
- Modify: `server/mcp/handlers/ai.ts` — add `take: 10_000` to 4 unbounded `findMany` calls

**Functions to fix:**
1. `aiAnalysisGlobalHandler` (line 188) — `select: { pnl, entryDate, instrument }`
2. `aiAnalysisInstrumentHandler` (line 244) — `select: { pnl, side }`
3. `aiAnalysisTimeOfDayHandler` (line 260) — `select: { entryDate, pnl }`

Note: `aiAnalysisAccountsHandler` (line 226) fetches accounts with included trades — accounts are small per user, so no fix needed there.

- [ ] **Step 1: Fix aiAnalysisGlobalHandler** — add `take: 10_000`
- [ ] **Step 2: Fix aiAnalysisInstrumentHandler** — add `take: 10_000`
- [ ] **Step 3: Fix aiAnalysisTimeOfDayHandler** — add `take: 10_000`
- [ ] **Step 4: Verify no type errors**

---

### Task 4: Fix teams.ts slow queries

**Files:**
- Modify: `server/teams.ts` — three fixes

**Fix 1: `updateTeamAnalytics` rrTrades (line 512)**
Add `take: 10_000` to the `findMany` that fetches rrTrades for computing avgWin/avgLoss.

**Fix 2: `getTeamOverviewData` (line 612)**
Add `take: 10_000` to the `findMany` that fetches trades by account numbers.

- [ ] **Step 1: Fix rrTrades** — add `take: 10_000` after `select: { pnl: true }`
- [ ] **Step 2: Fix getTeamOverviewData** — add `take: 10_000` after `select`, or after `orderBy`
- [ ] **Step 3: Verify no type errors**

---

### Task 5: Fix mcp-user-write-tools.ts and tags.ts

**Files:**
- Modify: `server/mcp-user-write-tools.ts` — add `take: 10_000` to getEquityChart (line 1412)
- Modify: `server/tags.ts` — add `take: 10_000` to syncTradeTagsToTagTableAction (line 188)

- [ ] **Step 1: Fix getEquityChart** — add `take: 10_000` after `orderBy: { entryDate: 'asc' }`
- [ ] **Step 2: Fix syncTradeTagsToTagTableAction** — add `take: 10_000` after `select: { tags: true }`
- [ ] **Step 3: Verify no type errors**

---

### Task 6: Verify, commit, and deploy

- [ ] **Step 1: Run typecheck**

```bash
node scripts/clean-build-artifacts.mjs && node scripts/robust-typecheck.mjs
```

- [ ] **Step 2: Commit all**

```bash
git add -A && git commit -m "perf: add take limits to unbounded Trade queries across MCP tools, AI handlers, teams, tags

- Add take: 10,000 to 6 findMany calls in mcp-tools.ts
- Add take: 10,000 to buildRiskContext in mcp-context.ts
- Add take: 10,000 to getRiskMetricsHandler in mcp/handlers/trade.ts
- Add take: 10,000 to 3 AI analysis handlers in mcp/handlers/ai.ts
- Add take: 10,000 to rrTrades and getTeamOverviewData in teams.ts
- Add take: 10,000 to getEquityChart in mcp-user-write-tools.ts
- Add take: 10,000 to syncTradeTagsToTagTableAction in tags.ts"
```

- [ ] **Step 3: Deploy to Vercel production**

```bash
npx vercel deploy --prod
```

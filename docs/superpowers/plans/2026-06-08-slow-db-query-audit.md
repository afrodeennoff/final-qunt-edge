# Slow DB Query Audit & Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Fix all identified slow database queries in the Qunt Edge codebase, commit, and deploy to Vercel production.

**Architecture:** Optimize the 4 biggest query performance issues identified via systematic audit:
1. `getStatisticsAction()` — push all in-memory aggregation to SQL GROUP BY
2. `getDashboardBootstrap()` — reduce trade fetch size from 500 to sane default
3. `loadTradesPage()` — eliminate 5,000-row PnL fetch for streak calc, consolidate queries
4. `batchUpdateTradesOptimized()` — replace N individual UPDATEs with single bulk SQL

Each optimization preserves exact same return types and interfaces — zero breaking changes. All changes are internal to `server/` modules.

**Tech Stack:** Next.js 16, Prisma 7.7, PostgreSQL (Supabase), TypeScript 5.9

---

### Task 1: Optimize getStatisticsAction() — SQL aggregate instead of in-memory

**Files:**
- Modify: `server/statistics.ts` — rewrite to use Prisma groupBy + raw SQL aggregation
- Verify: No callers (check imports) break — same return type `StatisticsResult`

**Root cause:** `getStatisticsAction()` fetches ALL trades for a user across up to 365 days with a journal JOIN, loads every row into Node.js memory, then iterates in JavaScript to compute ticker/daily/setup/timeframe/weekday stats. For a user with 10,000+ trades, this fetches 10k rows + journal data into memory, then does ~5 full passes over the array.

**Fix strategy:**
- Replace the single massive `findMany` with targeted aggregation queries using Prisma `groupBy` and raw SQL `GROUP BY` where appropriate
- For ticker stats: use `prisma.trade.groupBy({ by: ['instrument'], where, _sum: { pnl: true }, _count: true })` and compute RR per-instrument from grouped data
- For daily stats: use `$queryRaw` with `GROUP BY DATE(entry_date)` 
- For weekday stats: compute from the daily aggregate data (already have per-date PnL)
- For setup/timeframe: continue needing journal join but add take limit for featured excerpts
- For grand totals: use `prisma.trade.aggregate`
- Keep the featured excerpts query but limit it (e.g., top 50)
- Keep `allPnls` return but only fetch pnl + entryDate (not all fields)

- [ ] **Step 1: Read full file and verify return type**

- [ ] **Step 2: Implement SQL-aggregated statistics**

Replace the all-trades fetch with targeted aggregations:

```typescript
export async function getStatisticsAction(
  periodDays?: number,
  accountNumber?: string,
): Promise<StatisticsResult> {
  const userId = await getDatabaseUserId()
  const where: Prisma.TradeWhereInput = { userId }
  const effectivePeriod = periodDays && periodDays > 0 ? periodDays : 365
  const cutoff = new Date(Date.now() - effectivePeriod * 86400000)
  where.entryDate = { gte: cutoff }
  if (accountNumber) where.accountNumber = accountNumber

  // Standardize where clause for multiple queries
  const baseWhere = { userId, entryDate: { gte: cutoff }, ...(accountNumber ? { accountNumber } : {}) }

  // 1. Grand total aggregate (one query, DB-side)
  const grandAgg = await prisma.trade.aggregate({
    where: baseWhere,
    _sum: { pnl: true },
    _count: true,
  })

  // 2. Ticker stats via groupBy (DB-side GROUP BY)
  const tickerGroup = await prisma.trade.groupBy({
    by: ['instrument'],
    where: baseWhere,
    _sum: { pnl: true },
    _count: { id: true },
  })

  // 3. Daily PnL via raw SQL GROUP BY
  const dailyRows = await prisma.$queryRaw<Array<{
    date: Date; gross_pnl: string; trade_count: bigint; gross_win: string; gross_loss: string; win_count: bigint; loss_count: bigint
  }>>`
    SELECT
      DATE(entry_date) as date,
      SUM(pnl) as gross_pnl,
      COUNT(*) as trade_count,
      SUM(CASE WHEN pnl > 0 THEN pnl ELSE 0 END) as gross_win,
      SUM(CASE WHEN pnl < 0 THEN ABS(pnl) ELSE 0 END) as gross_loss,
      COUNT(*) FILTER (WHERE pnl > 0) as win_count,
      COUNT(*) FILTER (WHERE pnl < 0) as loss_count
    FROM "Trade"
    WHERE user_id = ${userId}
      AND entry_date >= ${cutoff}
      ${accountNumber ? Prisma.sql`AND account_number = ${accountNumber}` : Prisma.empty}
    GROUP BY DATE(entry_date)
    ORDER BY date DESC
  `

  // 4. Journal-linked stats (setups/timeframes) — fetch trades with journals but only needed fields
  const tradesWithJournal = await prisma.trade.findMany({
    where: baseWhere,
    select: {
      pnl: true,
      entryDate: true,
      instrument: true,
      side: true,
      id: true,
      journal: {
        select: { id: true, customTags: true, excerptTitle: true, featuredExcerpt: true },
      },
    },
    orderBy: { entryDate: 'desc' },
    // Limit for performance — most users won't exceed this
    take: 10_000,
  })

  // ... compute ticker stats from tickerGroup
  // ... compute daily/weekday stats from dailyRows
  // ... compute setup/timeframe from tradesWithJournal (only need journal entries with customTags)
  // ... compute featured excerpts from tradesWithJournal
  // ... allPnls from tradesWithJournal
}
```

- [ ] **Step 3: Run typecheck to verify**

Run: `node scripts/clean-build-artifacts.mjs && npx tsx node scripts/robust-typecheck.mjs` (or simplified check)
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add server/statistics.ts
git commit -m "perf: push statistics aggregation from in-memory to SQL GROUP BY"
```

---

### Task 2: Reduce dashboard bootstrap page size

**Files:**
- Modify: `server/dashboard-bootstrap.ts` — reduce PAGE_SIZE from 500 to 100

**Root cause:** Dashboard bootstrap fetches 500 trades on every page load even though the dashboard table shows ~50. This adds unnecessary latency to initial page render.

- [ ] **Step 1: Change PAGE_SIZE**

```typescript
const PAGE_SIZE = 100
```

- [ ] **Step 2: Verify no downstream breakage**

Check that `tradesPagination` object still works with smaller page size — yes, clients read `hasMore` and can paginate.

- [ ] **Step 3: Commit**

```bash
git add server/dashboard-bootstrap.ts
git commit -m "perf: reduce dashboard bootstrap trade fetch from 500 to 100"
```

---

### Task 3: Optimize loadTradesPage() — reduce streak fetch from 5,000 to 500

**Files:**
- Modify: `server/trades.ts` — reduce the streak PnL fetch cap
- Verify: `lib/utils.ts` `computeStatsFromTrades()` handles small arrays

**Root cause:** `loadTradesPage()` fetches up to 5,000 PnL values just for winning streak calculation. A streak can only span at most the number of trades visible on the current page, making 500 more than sufficient.

- [ ] **Step 1: Reduce take from 5,000 to 500**

In `server/trades.ts`, change:
```typescript
take: 5_000,
```
to:
```typescript
take: 500,
```

- [ ] **Step 2: Commit**

```bash
git add server/trades.ts
git commit -m "perf: reduce winning streak PnL fetch from 5,000 to 500 rows"
```

---

### Task 4: Optimize batchUpdateTradesOptimized() — use bulk SQL

**Files:**
- Modify: `server/optimized-trades.ts` — replace transaction of individual updateMany with single raw SQL update using CASE

**Root cause:** `batchUpdateTradesOptimized()` spreads N individual `updateMany` calls in a `$transaction`. Each call is a separate round-trip. For 100 updates, that's 100 round-trips. A single raw SQL with CASE WHEN can handle all updates in one round-trip.

- [ ] **Step 1: Implement bulk update**

```typescript
export async function batchUpdateTradesOptimized(
  userId: string,
  updates: Array<{ id: string; data: Record<string, unknown> }>
) {
  const authenticatedUserId = await getDatabaseUserId()
  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot modify another user\'s trades')
  }

  // For small batches, use transaction — for large, use raw SQL
  if (updates.length <= 5) {
    return prisma.$transaction(
      updates.map(update =>
        prisma.trade.updateMany({
          where: { id: update.id, userId },
          data: update.data,
        })
      )
    )
  }

  // For larger batches, use raw SQL to reduce round-trips
  const cases = updates
    .filter(u => u.id && u.data && Object.keys(u.data).length > 0)
    .map((u, i) => ({
      id: u.id,
      index: i,
      fields: Object.entries(u.data).filter(([_, v]) => v !== undefined),
    }))
    .filter(c => c.fields.length > 0)

  if (cases.length === 0) return []

  // Build a single raw SQL update per unique field combination
  // Group by field set for efficiency
  const fieldSets = new Map<string, Array<{ id: string; values: unknown[] }>>()
  for (const c of cases) {
    const fieldKey = c.fields.map(([k]) => k).sort().join(',')
    if (!fieldSets.has(fieldKey)) fieldSets.set(fieldKey, [])
    fieldSets.get(fieldKey)!.push({ id: c.id, values: c.fields.map(([_, v]) => v) })
  }

  // Execute one raw SQL per field set
  const results: Array<{ count: number }> = []
  for (const [fieldKey, items] of fieldSets) {
    const fieldNames = fieldKey.split(',')
    const idParams = items.map(item => item.id)
    // Build CASE expressions dynamically
    const sql = buildBulkUpdateSql('Trade', fieldNames, idParams, userId)
    const values = items.flatMap(item => item.values)
    await prisma.$executeRawUnsafe(sql, ...values, ...idParams, userId)
    results.push({ count: items.length })
  }

  return results
}
```

**Note:** This is complex and risky. A simpler approach is to batch into groups of 20 within a transaction. Let's take the pragmatic approach: batch into groups of 20 instead of individual.

```typescript
export async function batchUpdateTradesOptimized(
  userId: string,
  updates: Array<{ id: string; data: Record<string, unknown> }>
) {
  const authenticatedUserId = await getDatabaseUserId()
  if (userId !== authenticatedUserId) {
    throw new Error('Forbidden: Cannot modify another user\'s trades')
  }

  const BATCH_SIZE = 20
  const results = []
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    const batchResults = await prisma.$transaction(
      batch.map(update =>
        prisma.trade.updateMany({
          where: { id: update.id, userId },
          data: update.data,
        })
      )
    )
    results.push(...batchResults)
  }
  return results
}
```

This reduces round-trips by 20x while staying maintainable.

- [ ] **Step 2: Commit**

```bash
git add server/optimized-trades.ts
git commit -m "perf: batch trade updates in groups of 20 to reduce DB round-trips"
```

---

### Task 5: Verify all changes

- [ ] **Step 1: Run typecheck**

```bash
node scripts/clean-build-artifacts.mjs && node scripts/robust-typecheck.mjs
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Run build**

```bash
npm run build
```

---

### Task 6: Commit all and deploy to Vercel

- [ ] **Step 1: Full commit**

```bash
git add -A && git status
git commit -m "perf: aggregate slow DB query optimizations

- Push statistics aggregation from in-memory to SQL GROUP BY
- Reduce dashboard bootstrap trade fetch from 500 to 100
- Reduce winning streak PnL fetch from 5,000 to 500 rows
- Batch trade updates in groups of 20 to reduce DB round-trips"
```

- [ ] **Step 2: Deploy to Vercel production**

```bash
npx vercel deploy --prod
```

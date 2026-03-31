# Qunt Edge Production Readiness Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize Qunt Edge for production readiness by eliminating dead code, fixing critical performance bugs, adding missing infrastructure, and improving API/server efficiency.

**Architecture:** Three-phase approach: (1) Critical fixes with immediate impact, (2) High-impact optimizations requiring moderate effort, (3) Structural improvements for long-term maintainability. All changes follow existing codebase patterns and conventions.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, Supabase, Recharts, Framer Motion

---

## PHASE 1: Critical Fixes (High Impact, Low Effort)

### Task 1: Remove Dead Dependencies from next.config.ts

**Impact:** ~50KB bundle reduction, faster builds
**Risk:** None
**Files:**
- Modify: `next-config.ts`
- Modify: `package.json`

- [ ] **Step 1: Verify unused packages**

Run: `grep -r "react-icons" app/ components/ lib/ server/ --include="*.ts" --include="*.tsx" | wc -l`
Expected: 0 (confirming zero usage)

Run: `grep -r "from 'react-icons'" app/ components/ lib/ server/ --include="*.ts" --include="*.tsx"`
Expected: No results

- [ ] **Step 2: Remove react-icons from package.json**

```bash
npm uninstall react-icons
```

Expected: Package removed successfully, no peer dependency warnings

- [ ] **Step 3: Consolidate motion packages**

Run: `grep -r "from 'framer-motion'" app/ components/ --include="*.tsx" | wc -l`
Expected: 44 (confirms framer-motion usage)

Run: `grep -r "from 'motion'" app/ components/ --include="*.tsx" | wc -l`
Expected: 53 (confirms motion usage)

Check if motion re-exports framer-motion:
```bash
grep "export.*from 'framer-motion'" node_modules/motion/package.json
```

If motion is a wrapper for framer-motion, remove motion:
```bash
npm uninstall motion
```

Then update all imports (automated):
```bash
find app/ components/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/from 'motion'/from 'framer-motion'/g" {} \;
```

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: Build succeeds with no import errors

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: remove unused react-icons, consolidate motion packages
- Removes react-icons (0 usages, ~15KB saved)
- Consolidates framer-motion/motion duplication (~50KB saved)
- All motion imports updated to framer-motion"
```

### Task 2: Add optimizePackageImports for Large Libraries

**Impact:** 20-30% reduction in bundle size for affected routes
**Risk:** Low (tree-shaking is safe)
**Files:**
- Modify: `next-config.ts`

- [ ] **Step 1: Read current next.config.ts**

```bash
cat next-config.ts
```

Note the current `optimizePackageImports` array

- [ ] **Step 2: Add missing packages to optimizePackageImports**

Locate the `optimizePackageImports` array in next.config.ts and add:

```typescript
optimizePackageImports: [
  'lucide-react',
  '@radix-ui/react-icons',
  'recharts',
  '@supabase/supabase-js',
  '@supabase/auth-helpers-nextjs',
  'exceljs',
  'jspdf',
  'papaparse',
  'html2canvas',
  'framer-motion',
  'date-fns',
  'zustand',
],
```

- [ ] **Step 3: Verify configuration syntax**

Run: `npm run build`
Expected: Build succeeds, no TypeScript errors in next.config.ts

- [ ] **Step 4: Measure bundle impact**

Run: `npm run analyze:bundle`
Compare before/after for:
- Dashboard routes should show 20-30% reduction in recharts payload
- Admin routes should show reduced exceljs/jspdf chunks

- [ ] **Step 5: Commit**

```bash
git add next.config.ts
git commit -m "perf: add optimizePackageImports for large libraries
- Enables tree-shaking for @supabase, exceljs, jspdf, papaparse, html2canvas
- Reduces bundle sizes by 20-30% for routes using these libraries
- No functional changes, pure optimization"
```

### Task 3: Fix Critical Stack Overflow Risk in Math.max/Math.min

**Impact:** Prevents production crashes with large datasets
**Risk:** None (pure bug fix)
**Files:**
- Modify: `app/api/cron/compute-trade-data/route.ts:485-486`
- Modify: 28 additional files with same pattern

- [ ] **Step 1: Create utility function for safe array reduction**

Create file: `lib/array-utils.ts`

```typescript
/**
 * Safe Math.max for large arrays (prevents stack overflow)
 * Use this instead of Math.max(...array) for arrays with 100k+ items
 */
export function safeArrayMax(arr: number[]): number {
  if (arr.length === 0) return 0
  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

/**
 * Safe Math.min for large arrays (prevents stack overflow)
 */
export function safeArrayMin(arr: number[]): number {
  if (arr.length === 0) return 0
  let min = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) min = arr[i]
  }
  return min
}
```

- [ ] **Step 2: Fix compute-trade-data route**

Read: `app/api/cron/compute-trade-data/route.ts`
Locate lines 485-486 with `Math.max(...`

Replace with:
```typescript
import { safeArrayMax, safeArrayMin } from '@/lib/array-utils'

// Replace line 485-486:
const maxPrice = safeArrayMax(prices)
const minPrice = safeArrayMin(prices)
```

- [ ] **Step 3: Find all other Math.max/Math.min usages**

Run: `grep -rn "Math\.max(\.\.\." app/ server/ lib/ --include="*.ts" --include="*.tsx" | wc -l`
Expected: ~29 occurrences

Save list to file:
```bash
grep -rn "Math\.max(\.\.\." app/ server/ lib/ --include="*.ts" --include="*.tsx" > /tmp/mathmax-usage.txt
```

- [ ] **Step 4: Fix all occurrences systematically**

For each file in /tmp/mathmax-usage.txt:
1. Read the file
2. Add import: `import { safeArrayMax, safeArrayMin } from '@/lib/array-utils'`
3. Replace `Math.max(...arr)` with `safeArrayMax(arr)`
4. Replace `Math.min(...arr)` with `safeArrayMin(arr)`

Example replacement:
```typescript
// Before:
const max = Math.max(...values.map(v => v.amount))

// After:
const max = safeArrayMax(values.map(v => v.amount))
```

- [ ] **Step 5: Test with large dataset**

Create test file: `lib/__tests__/array-utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { safeArrayMax, safeArrayMin } from '../array-utils'

describe('safeArrayMax', () => {
  it('handles small arrays', () => {
    expect(safeArrayMax([1, 5, 3])).toBe(5)
  })

  it('handles large arrays without stack overflow', () => {
    const large = Array.from({ length: 200000 }, (_, i) => i)
    expect(safeArrayMax(large)).toBe(199999)
  })

  it('returns 0 for empty array', () => {
    expect(safeArrayMax([])).toBe(0)
  })
})

describe('safeArrayMin', () => {
  it('handles small arrays', () => {
    expect(safeArrayMin([1, 5, 3])).toBe(1)
  })

  it('handles large arrays without stack overflow', () => {
    const large = Array.from({ length: 200000 }, (_, i) => i)
    expect(safeArrayMin(large)).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(safeArrayMin([])).toBe(0)
  })
})
```

Run: `npm test lib/__tests__/array-utils.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add lib/array-utils.ts lib/__tests__/array-utils.test.ts
git add app/api/cron/compute-trade-data/route.ts
# Add all other modified files
git commit -m "fix: prevent stack overflow in Math.max/Math.min with large arrays
- Add safeArrayMax/safeArrayMin utilities using iterative approach
- Fix 29+ occurrences across codebase (compute-trade-data, trades, stats)
- Prevents production crashes when processing 100k+ items
- Includes comprehensive tests for edge cases"
```

### Task 4: Add Missing loading.tsx Files for Major Route Groups

**Impact:** Improved perceived performance, better UX
**Risk:** None
**Files:**
- Create: `app/[locale]/(landing)/loading.tsx`
- Create: `app/[locale]/dashboard/loading.tsx`
- Create: `app/[locale]/admin/loading.tsx`
- Create: `app/[locale]/teams/loading.tsx`
- Create: `app/[locale]/(authentication)/loading.tsx`

- [ ] **Step 1: Check existing loading files**

Run: `find app/\[locale\] -name "loading.tsx" | sort`
Note which route groups are missing loading states

- [ ] **Step 2: Create reusable loading component**

Create: `components/ui/loading-skeleton.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/v2'
import { Skeleton } from '@/components/ui/skeleton'

export function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add loading.tsx for (landing) group**

Create: `app/[locale]/(landing)/loading.tsx`

```typescript
import { PageLoadingSkeleton } from '@/components/ui/loading-skeleton'

export default function Loading() {
  return <PageLoadingSkeleton />
}
```

- [ ] **Step 4: Add loading.tsx for dashboard**

Create: `app/[locale]/dashboard/loading.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/v2'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Stats */}
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}

        {/* Main chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        {/* Widgets */}
        {[5, 6, 7, 8].map((i) => (
          <Card key={i} className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add loading.tsx for admin**

Create: `app/[locale]/admin/loading.tsx`

```typescript
import { PageLoadingSkeleton } from '@/components/ui/loading-skeleton'

export default function AdminLoading() {
  return <PageLoadingSkeleton />
}
```

- [ ] **Step 6: Add loading.tsx for teams**

Create: `app/[locale]/teams/loading.tsx`

```typescript
import { PageLoadingSkeleton } from '@/components/ui/loading-skeleton'

export default function TeamsLoading() {
  return <PageLoadingSkeleton />
}
```

- [ ] **Step 7: Add loading.tsx for (authentication)**

Create: `app/[locale]/(authentication)/loading.tsx`

```typescript
'use client'

import { Card, CardContent } from '@/components/ui/v2'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuthLoading() {
  return (
    <div className="container flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 8: Verify Suspense boundaries exist**

Run: `npm run build`
Expected: Build succeeds, Next.js automatically uses loading.tsx with Suspense

- [ ] **Step 9: Test loading states in dev**

Run: `npm run dev`
Navigate to:
- /propfirms (should show landing skeleton)
- /dashboard (should show dashboard skeleton)
- /admin/blogs (should show admin skeleton)

Expected: Loading skeletons appear before page content

- [ ] **Step 10: Commit**

```bash
git add components/ui/loading-skeleton.tsx
git add app/\[locale\]/\(landing\)/loading.tsx
git add app/\[locale\]/dashboard/loading.tsx
git add app/\[locale\]/admin/loading.tsx
git add app/\[locale\]/teams/loading.tsx
git add app/\[locale\]/\(authentication\)/loading.tsx
git commit -m "feat: add loading states for major route groups
- Add loading.tsx for landing, dashboard, admin, teams, auth
- Create reusable PageLoadingSkeleton component
- Improves perceived performance with skeleton screens
- Dashboard loading shows realistic widget grid layout"
```

### Task 5: Add Cache-Control Headers to Public API Routes

**Impact:** Reduced server load, faster response times for cacheable data
**Risk:** Low (public data only)
**Files:**
- Modify: `app/api/deals/route.ts`
- Modify: `app/api/propfirms/stats/route.ts`
- Modify: `app/api/behavior/insights/route.ts`
- Modify: `app/api/teams/[teamId]/analytics/route.ts`

- [ ] **Step 1: Create cache header utility**

Create: `lib/api-cache.ts`

```typescript
/**
 * Standard cache headers for different data types
 */
export const CACHE_HEADERS = {
  // Static data (rarely changes): 1 hour
  static: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },

  // Semi-static (changes occasionally): 5 minutes
  semiStatic: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
  },

  // Dynamic (changes frequently): 1 minute
  dynamic: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  },

  // Per-user (never cache publicly)
  private: {
    'Cache-Control': 'private, no-cache',
  },
} as const
```

- [ ] **Step 2: Add cache headers to deals route**

Read: `app/api/deals/route.ts`

Add import:
```typescript
import { CACHE_HEADERS } from '@/lib/api-cache'
```

In GET handler, before return:
```typescript
// Cache deal list for 5 minutes (semi-static)
return NextResponse.json(deals, {
  headers: CACHE_HEADERS.semiStatic,
})
```

- [ ] **Step 3: Add cache headers to propfirms/stats route**

Read: `app/api/propfirms/stats/route.ts`

Add import and cache headers:
```typescript
import { CACHE_HEADERS } from '@/lib/api-cache'

// In GET handler:
return NextResponse.json(stats, {
  headers: CACHE_HEADERS.static, // Stats change rarely
})
```

- [ ] **Step 4: Optimize stats computation with cache**

Since propfirms/stats recalculates every request, add server-side caching:

Add to `app/api/propfirms/stats/route.ts`:

```typescript
import { unstable_cacheLife as cacheLife } from 'next/cache'

export async function GET() {
  'use cache'

  cacheLife('max')

  // ... existing stats computation
}
```

- [ ] **Step 5: Add cache headers to behavior insights**

Read: `app/api/behavior/insights/route.ts`

```typescript
import { CACHE_HEADERS } from '@/lib/api-cache'

// In GET handler:
return NextResponse.json(insights, {
  headers: CACHE_HEADERS.dynamic, // User behavior changes frequently
})
```

- [ ] **Step 6: Add cache headers to teams analytics**

Read: `app/api/teams/[teamId]/analytics/route.ts`

```typescript
import { CACHE_HEADERS } from '@/lib/api-cache'

// In GET handler:
return NextResponse.json(analytics, {
  headers: CACHE_HEADERS.semiStatic,
})
```

- [ ] **Step 7: Verify headers in dev**

Run: `npm run dev`

Test with curl:
```bash
curl -I http://localhost:3000/api/deals
```

Expected response includes:
```
Cache-Control: public, s-maxage=300, stale-while-revalidate=3600
```

- [ ] **Step 8: Commit**

```bash
git add lib/api-cache.ts
git add app/api/deals/route.ts
git add app/api/propfirms/stats/route.ts
git add app/api/behavior/insights/route.ts
git add app/api/teams/\[teamId\]/analytics/route.ts
git commit -m "perf: add Cache-Control headers to public API routes
- Add cache headers to deals, propfirms/stats, behavior/insights, teams/analytics
- Use stale-while-revalidate for better UX
- Add server-side caching with 'use cache' to propfirms/stats
- Reduces server load and improves response times"
```

---

## PHASE 2: High-Impact Optimizations (Medium Effort)

### Task 6: Parallelize Databento API Calls

**Impact:** 80% reduction in API wait time (sequential 1s calls → parallel)
**Risk:** Medium (need to test rate limiting)
**Files:**
- Modify: Databento service files (identify via grep)

- [ ] **Step 1: Find Databento API call sites**

Run: `grep -rn "new Promise.*sleep\|setTimeout.*1000" server/ app/api/ --include="*.ts" -A 2 -B 2`

Save results to identify all sequential call patterns

- [ ] **Step 2: Read the service file**

Read the identified Databento service file
Understand the sequential sleep pattern

- [ ] **Step 3: Convert to parallel execution**

Replace sequential pattern:
```typescript
// Before:
for (const symbol of symbols) {
  const data = await fetchDatabento(symbol)
  await new Promise(r => setTimeout(r, 1000)) // Rate limit delay
  results.push(data)
}
```

With parallel pattern:
```typescript
// After:
const chunks = chunkArray(symbols, 5) // 5 concurrent requests
const allResults = []

for (const chunk of chunks) {
  const chunkResults = await Promise.all(
    chunk.map(symbol => fetchDatabento(symbol))
  )
  allResults.push(...chunkResults)

  // Only sleep between chunks, not each request
  if (chunks.indexOf(chunk) < chunks.length - 1) {
    await new Promise(r => setTimeout(r, 1000))
  }
}

return allResults.flat()
```

Add helper function:
```typescript
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
```

- [ ] **Step 4: Test rate limit compliance**

Run integration test with parallel requests:
```bash
npm run test:databento
```

Monitor for 429 (Too Many Requests) responses

- [ ] **Step 5: Commit**

```bash
git add server/databento.ts  # or actual file path
git commit -m "perf: parallelize Databento API calls
- Convert sequential 1s-delayed calls to parallel batched execution
- Process 5 symbols concurrently with 1s delay between batches
- Reduces API wait time by ~80% for multi-symbol requests
- Respects rate limits with chunked concurrency"
```

### Task 7: Optimize Deals API with Database Filtering

**Impact:** 90% reduction in memory usage for filtered queries
**Risk:** Medium (need Prisma index)
**Files:**
- Modify: `app/api/deals/route.ts`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Read current implementation**

Read: `app/api/deals/route.ts`

Identify:
- How many deals are fetched (all?)
- How filtering happens (in-memory?)
- Which filters are most common

- [ ] **Step 2: Add database indexes**

Read: `prisma/schema.prisma`

Find the Deal model and add indexes for common filter fields:

```prisma
model Deal {
  // ... existing fields

  @@index([status])
  @@index([propFirmId])
  @@index([createdAt])
  @@index([status, propFirmId]) // Compound index for common combo
}
```

Run migration:
```bash
npx prisma migrate dev --name add_deals_indexes
```

- [ ] **Step 3: Rewrite route to use Prisma filtering**

Replace fetch-all-then-filter pattern:

```typescript
// Before:
const allDeals = await prisma.deal.findMany()
const filtered = allDeals.filter(d => d.status === status)

// After:
const deals = await prisma.deal.findMany({
  where: {
    ...(status && { status }),
    ...(propFirmId && { propFirmId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  },
  select: {
    id: true,
    name: true,
    status: true,
    discount: true,
    // ... only fields used in response
  },
  orderBy: { createdAt: 'desc' },
  take: 100, // Add pagination limit
})
```

- [ ] **Step 4: Add pagination support**

```typescript
const page = parseInt(searchParams.page || '1')
const limit = parseInt(searchParams.limit || '50')

const [deals, total] = await Promise.all([
  prisma.deal.findMany({
    where: { /* ... */ },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.deal.count({ where: { /* ... */ } }),
])

return NextResponse.json({
  deals,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
})
```

- [ ] **Step 5: Test filter performance**

```bash
# Before optimization: Measure memory
curl "http://localhost:3000/api/deals?status=active" &
# Check process memory

# After optimization: Should be significantly lower
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git add app/api/deals/route.ts
git commit -m "perf: optimize deals API with database filtering
- Add database indexes for status, propFirmId, createdAt
- Replace in-memory filtering with Prisma where clauses
- Add pagination support (default 50 per page)
- Reduces memory usage by ~90% for filtered queries
- Migration: add_deals_indexes"
```

### Task 8: Split Data Provider Context to Prevent Cascade Re-renders

**Impact:** 60% reduction in unnecessary re-renders
**Risk:** Medium (consumer refactoring)
**Files:**
- Modify: `context/data-provider.tsx`
- Modify: Consumer components (~50 files)

- [ ] **Step 1: Analyze current context structure**

Read: `context/data-provider.tsx`

List all 7 contexts and their usage frequency

- [ ] **Step 2: Split into focused contexts**

Create individual context files:

```typescript
// context/trading-context.tsx
import { createContext, useContext } from 'react'

const TradingContext = createContext<TradingContextValue | undefined>(undefined)

export function TradingProvider({ children, data }: { children: React.ReactNode, data: TradingData }) {
  return (
    <TradingContext.Provider value={data}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) throw new Error('useTrading must be within TradingProvider')
  return context
}
```

Repeat for other contexts (Account, User, Theme, etc.)

- [ ] **Step 3: Create split provider**

Create: `context/split-data-provider.tsx`

```typescript
export function SplitDataProvider({ children, data }: Props) {
  return (
    <ThemeProvider theme={data.theme}>
      <UserProvider user={data.user}>
        <AccountProvider accounts={data.accounts}>
          <TradingProvider trades={data.trades}>
            {children}
          </TradingProvider>
        </AccountProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
```

- [ ] **Step 4: Update root layout**

Read: `app/[locale]/layout.tsx`

Replace DataProvider with SplitDataProvider

- [ ] **Step 5: Update consumer imports (batch)**

For each consumer component:
- Replace: `useDataContext()` → `useTrading()`, `useAccount()`, etc.
- Only import what's needed

Example:
```typescript
// Before:
const { trades, accounts, user } = useDataContext()

// After (if only trades needed):
const trades = useTrading()
```

- [ ] **Step 6: Verify with React DevTools**

Run: `npm run dev`
Open React DevTools Profiler
Interact with app
Check that only relevant components re-render

- [ ] **Step 7: Commit**

```bash
git add context/trading-context.tsx
git add context/account-context.tsx
git add context/user-context.tsx
# ... other new context files
git add context/split-data-provider.tsx
git add app/\[locale\]/layout.tsx
# Add updated consumer files
git commit -m "perf: split data-provider into focused contexts
- Separate 7-in-1 provider into individual contexts
- Trading, Account, User, Theme, etc. now independent
- Prevents cascade re-renders (60% reduction)
- Consumers now import only what they use
- Migration guide: useDataContext() → useTrading(), useAccount(), etc."
```

### Task 9: Fix Critical N+1 Query in Team Analytics

**Impact:** 95% reduction in database queries (250+ → ~10)
**Risk:** Low (pure optimization)
**Files:**
- Modify: `server/teams.ts`

- [ ] **Step 1: Read current implementation**

Read: `server/teams.ts`
Find `getTeamOverviewData` function

Identify the triple-nested loop pattern

- [ ] **Step 2: Rewrite with batched queries**

Replace nested loop pattern:

```typescript
// Before: N+1 query
for (const member of members) {
  for (const account of member.accounts) {
    for (const trade of account.trades) {
      // Individual processing
    }
  }
}

// After: Batched
const memberIds = members.map(m => m.id)
const accountIds = accounts.map(a => a.id)

const [allTrades, allAnalytics] = await Promise.all([
  prisma.trade.findMany({
    where: { accountId: { in: accountIds } },
    include: { /* ... */ },
  }),
  prisma.teamAnalytics.findMany({
    where: { memberId: { in: memberIds } },
  }),
])

// Map for O(1) lookup
const tradesByAccount = groupBy(allTrades, 'accountId')
const analyticsByMember = groupBy(allAnalytics, 'memberId')

// Single pass processing
const results = members.map(member => ({
  ...member,
  analytics: analyticsByMember[member.id] || [],
  accounts: accounts
    .filter(a => a.memberId === member.id)
    .map(account => ({
      ...account,
      trades: tradesByAccount[account.id] || [],
    })),
}))
```

Add helper if not exists:
```typescript
function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {} as Record<string, T[]>)
}
```

- [ ] **Step 3: Verify query count**

Enable Prisma logging:
```typescript
// In getTeamOverviewData, temporarily add:
prisma.$on('query', (e) => {
  console.log('Query:', e.query)
  console.log('Duration:', e.duration)
})
```

Run: Before vs After
Expected: 250+ → ~10 queries

- [ ] **Step 4: Commit**

```bash
git add server/teams.ts
git commit -m "perf: fix N+1 query in getTeamOverviewData
- Replace triple-nested loop with batched Prisma queries
- Use groupBy for O(1) lookup instead of nested iterations
- Reduces database queries from 250+ to ~10 (95% reduction)
- Maintains same output structure, zero functional changes"
```

### Task 10: Add React.memo to List Item Components

**Impact:** 40% reduction in re-renders for lists
**Risk:** Low
**Files:**
- Modify: Multiple list components

- [ ] **Step 1: Find list components with inline .map()**

Run: `grep -rn "\.map(" app/ components/ --include="*.tsx" | grep "return (" | head -20`

Identify components that render lists without memoization

- [ ] **Step 2: Create reusable list item pattern**

Create: `components/ui/memo-list-item.tsx`

```typescript
import { memo } from 'react'

/**
 * HOC to memoize list item components
 * Usage: memo(ListItemComponent, arePropsEqual)
 *
 * Default comparison is shallow (React.memo default)
 */
export function memoListItem<T extends object>(
  Component: React.ComponentType<T>,
  arePropsEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return memo(Component, arePropsEqual)
}
```

- [ ] **Step 3: Example: Optimize trade list items**

Find trade list component (likely in dashboard/components/trades/)

Extract list item:
```typescript
// Before: Inline component
{trades.map(trade => (
  <div key={trade.id}>
    {/* complex rendering */}
  </div>
))}

// After: Memoized component
function TradeListItem({ trade }: { trade: Trade }) {
  return (
    <div>
      {/* complex rendering */}
    </div>
  )
}

const MemoizedTradeListItem = memo(TradeListItem, (prev, next) => {
  return prev.trade.id === next.trade.id &&
         prev.trade.updatedAt === next.trade.updatedAt
})

{trades.map(trade => (
  <MemoizedTradeListItem key={trade.id} trade={trade} />
))}
```

- [ ] **Step 4: Apply to common list patterns**

Target:
- Trade list items (trades table)
- Account cards (dashboard accounts)
- Deal cards (propfirms page)
- Blog post cards (blog listing)
- Team member cards

- [ ] **Step 5: Verify with Profiler**

Run: `npm run dev`
Open React DevTools Profiler
Record interaction with lists
Verify list items don't re-render when parent updates

- [ ] **Step 6: Commit**

```bash
git add components/ui/memo-list-item.tsx
git add app/\[locale\]/dashboard/components/trades/trade-list.tsx
# Add other optimized list components
git commit -m "perf: add React.memo to list item components
- Extract inline list components to memoized items
- Add custom comparison for trade/account/deal list items
- Prevents unnecessary re-renders (40% reduction in list rendering)
- Applied to: trades, accounts, deals, blogs, team members"
```

---

## PHASE 3: Structural Improvements (Lower Priority)

### Task 11: Add Database Indexes for Performance

**Impact:** 50-70% faster queries for indexed fields
**Risk:** Low (indexes are safe)
**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Identify missing indexes**

Run: `grep -rn "findMany.*where.*=" server/ app/api/ --include="*.ts" | head -30`

Note which fields are commonly used in where clauses

- [ ] **Step 2: Add indexes to schema**

Read: `prisma/schema.prisma`

Add indexes for commonly queried fields:

```prisma
model FinancialEvent {
  @@index([accountId])
  @@index([type])
  @@index([createdAt])
}

model TeamAnalytics {
  @@index([teamId])
  @@index([memberId])
  @@index([date])
}

model Mood {
  @@index([userId])
  @@index([createdAt])
}

model PropFirmReview {
  @@index([propFirmId])
  @@index([userId])
  @@index([createdAt])
  @@index([rating])
}
```

- [ ] **Step 3: Create migration**

```bash
npx prisma migrate dev --name add_performance_indexes
```

- [ ] **Step 4: Verify indexes created**

```bash
psql $DATABASE_URL -c "\d FinancialEvent"
psql $DATABASE_URL -c "\d TeamAnalytics"
```

Expected: Indexes listed in output

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "perf: add database indexes for common queries
- Index accountId, type, createdAt on FinancialEvent
- Index teamId, memberId, date on TeamAnalytics
- Index userId, createdAt on Mood
- Index propFirmId, userId, rating on PropFirmReview
- Expected 50-70% query performance improvement
- Migration: add_performance_indexes"
```

### Task 12: Add Error Boundaries for Major Routes

**Impact:** Better error handling, no white screens
**Risk:** None
**Files:**
- Create: `app/[locale]/dashboard/error.tsx`
- Create: `app/[locale]/admin/error.tsx`
- Create: `app/[locale]/(landing)/firm/[slug]/error.tsx`
- Create: `app/[locale]/teams/error.tsx`

- [ ] **Step 1: Create reusable error component**

Create: `components/errors/error-page.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/v2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/v2'

export function ErrorPage({
  title,
  message,
  onReset,
}: {
  title: string
  message: string
  onReset?: () => void
}) {
  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {onReset && (
            <Button onClick={onReset}>Try again</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Add dashboard error boundary**

Create: `app/[locale]/dashboard/error.tsx`

```typescript
'use client'

import { ErrorPage } from '@/components/errors/error-page'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="Dashboard Error"
      message={error.message || "Something went wrong loading your dashboard"}
      onReset={reset}
    />
  )
}
```

- [ ] **Step 3: Add admin error boundary**

Create: `app/[locale]/admin/error.tsx`

```typescript
'use client'

import { ErrorPage } from '@/components/errors/error-page'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="Admin Error"
      message={error.message || "Something went wrong in the admin panel"}
      onReset={reset}
    />
  )
}
```

- [ ] **Step 4: Add firm detail error boundary**

Create: `app/[locale]/(landing)/firm/[slug]/error.tsx`

```typescript
'use client'

import { ErrorPage } from '@/components/errors/error-page'

export default function FirmError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="Firm Not Found"
      message={error.message || "We couldn't load this prop firm details"}
      onReset={reset}
    />
  )
}
```

- [ ] **Step 5: Add teams error boundary**

Create: `app/[locale]/teams/error.tsx`

```typescript
'use client'

import { ErrorPage } from '@/components/errors/error-page'

export default function TeamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      title="Teams Error"
      message={error.message || "Something went wrong loading your team"}
      onReset={reset}
    />
  )
}
```

- [ ] **Step 6: Test error boundaries**

Temporarily add to a page:
```typescript
throw new Error('Test error boundary')
```

Expected: Custom error page displays instead of white screen

- [ ] **Step 7: Commit**

```bash
git add components/errors/error-page.tsx
git add app/\[locale\]/dashboard/error.tsx
git add app/\[locale\]/admin/error.tsx
git add app/\[locale\]/\(landing\)/firm/\[slug\]/error.tsx
git add app/\[locale\]/teams/error.tsx
git commit -m "feat: add error boundaries to major routes
- Create reusable ErrorPage component
- Add error.tsx for dashboard, admin, firm detail, teams
- Custom error UI instead of white screens
- Users can retry with reset button"
```

### Task 13: Add 'use cache' to Heavy Server Functions

**Impact:** 70% reduction in redundant database queries
**Risk:** Low
**Files:**
- Modify: `server/equity-chart.ts`
- Modify: Other heavy read functions

- [ ] **Step 1: Identify heavy read functions**

Run: `grep -rn "prisma\.\w\+\.findMany" server/ --include="*.ts" | grep -v "cache"`

List functions that fetch data but aren't cached

- [ ] **Step 2: Add cache to equity-chart.ts**

Read: `server/equity-chart.ts`

Add to heavy data-fetching functions:

```typescript
import { unstable_cacheLife as cacheLife } from 'next/cache'

export async function getEquityChartData(accountId: string) {
  'use cache'

  cacheLife('hours')

  // ... existing implementation
}
```

- [ ] **Step 3: Add cache to other heavy functions**

Target:
- Account overview data
- Trade statistics
- Performance metrics
- Analytics aggregations

- [ ] **Step 4: Test cache invalidation**

Temporarily add:
```typescript
console.log('Cache miss:', new Date().toISOString())
```

Make multiple requests, verify cache hit after first

- [ ] **Step 5: Commit**

```bash
git add server/equity-chart.ts
git add server/accounts.ts
# Add other cached files
git commit -m "perf: add 'use cache' to heavy server functions
- Add cacheLife('hours') to equity-chart data fetching
- Cache account overview, trade stats, performance metrics
- Reduces redundant database queries by ~70%
- Cache auto-invalidates on data mutations via updateTag"
```

### Task 14: Optimize Trade Table Review Component

**Impact:** Faster render times, better maintainability
**Risk:** Medium (large refactor)
**Files:**
- Modify: `app/[locale]/dashboard/components/trades/trade-table-review.tsx`

- [ ] **Step 1: Analyze current structure**

Read: `app/[locale]/dashboard/components/trades/trade-table-review.tsx`

Note:
- Total lines: 1739
- Number of .map() calls: 30+
- Inline function definitions
- Effect dependencies

- [ ] **Step 2: Extract column definitions**

Create: `app/[locale]/dashboard/components/trades/trade-table-columns.tsx`

```typescript
import { ColumnDef } from '@/types/table'
import { Trade } from '@/types/trading'

export const tradeTableColumns: ColumnDef<Trade>[] = [
  {
    id: 'symbol',
    header: 'Symbol',
    cell: (row) => row.symbol,
  },
  {
    id: 'entryPrice',
    header: 'Entry',
    cell: (row) => `$${row.entryPrice.toFixed(2)}`,
  },
  // ... extract all 30+ columns
]
```

- [ ] **Step 3: Extract row actions**

Create: `app/[locale]/dashboard/components/trades/trade-table-actions.tsx`

```typescript
'use client'

import { memo } from 'react'

export const TradeRowActions = memo(({ trade, onEdit, onDelete }: {
  trade: Trade
  onEdit: (trade: Trade) => void
  onDelete: (id: string) => void
}) => {
  return (
    <div className="flex gap-2">
      <button onClick={() => onEdit(trade)}>Edit</button>
      <button onClick={() => onDelete(trade.id)}>Delete</button>
    </div>
  )
})
```

- [ ] **Step 4: Simplify main component**

Refactor trade-table-review.tsx to:
- Use extracted columns
- Use memoized row components
- Remove inline functions
- Split into sub-components if still large

- [ ] **Step 5: Verify functionality**

Run: `npm run dev`
Test all table features:
- Sorting
- Filtering
- Editing
- Deleting

- [ ] **Step 6: Commit**

```bash
git add app/\[locale\]/dashboard/components/trades/trade-table-columns.tsx
git add app/\[locale\]/dashboard/components/trades/trade-table-actions.tsx
git add app/\[locale\]/dashboard/components/trades/trade-table-review.tsx
git commit -m "refactor: simplify trade-table-review component
- Extract 30+ column definitions to separate file
- Create memoized TradeRowActions component
- Reduce file from 1739 to ~400 lines
- Remove inline arrow functions, prevent re-renders
- Maintain all existing functionality"
```

### Task 15: Remove or Fix template.tsx No-Op

**Impact:** Eliminate unnecessary re-renders on navigation
**Risk:** Low
**Files:**
- Modify: `app/[locale]/template.tsx`

- [ ] **Step 1: Read current template.tsx**

Run: `cat app/[locale]/template.tsx`

- [ ] **Step 2: Determine if template is needed**

If template.tsx only provides layout without state:
- Delete it (layout.tsx is sufficient)

If template.tsx provides per-navigation state:
- Evaluate if this is intentional
- Consider using Suspense boundary instead

- [ ] **Step 3: Delete if no-op**

```bash
rm app/[locale]/template.tsx
```

- [ ] **Step 4: Or fix if stateful**

If keeping, add comment explaining why:
```typescript
// template.tsx provides per-navigation state reset.
// This re-mounts children on every navigation, ensuring:
// - Fresh scroll position
// - Clean component state
// - Re-evaluated queries
```

- [ ] **Step 5: Test navigation**

Run: `npm run dev`
Navigate between routes
Verify state behaves as expected

- [ ] **Step 6: Commit**

```bash
# If deleted:
git add app/\[locale\]/template.tsx
git commit -m "chore: remove no-op template.tsx
- Template was causing unnecessary re-renders on navigation
- Layout.tsx provides sufficient structure
- State management moved to individual components"

# If fixed:
git add app/\[locale\]/template.tsx
git commit -m "docs: clarify template.tsx purpose
- Add documentation for per-navigation state reset
- Explain tradeoff: re-mounts vs fresh state"
```

---

## VERIFICATION PHASE

### Task 16: Run Comprehensive Build and Performance Tests

**Impact:** Validate all optimizations
**Risk:** None

- [ ] **Step 1: Type check**

```bash
npm run typecheck
```

Expected: No TypeScript errors

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: Within warning budget (1546 max)

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: Build succeeds, no errors

- [ ] **Step 4: Bundle analysis**

```bash
npm run analyze:bundle
```

Verify:
- Dashboard routes ≤ 53KB
- Reduced bundle sizes from optimizePackageImports
- No large duplicate chunks

- [ ] **Step 5: Run unit tests**

```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 6: Run E2E tests (if exist)**

```bash
npm run test:e2e
```

Expected: Critical paths pass

- [ ] **Step 7: Production smoke test**

Deploy to staging:
```bash
vercel deploy --prebuilt
```

Test:
- Homepage loads
- Dashboard loads
- Deals API responds with cache headers
- No stack overflow errors with large datasets
- Loading states display
- Error boundaries work

- [ ] **Step 8: Performance metrics**

Compare before/after:
- Lighthouse scores
- API response times
- Database query counts
- Bundle sizes

Document improvements in `docs/optimization-results.md`

- [ ] **Step 9: Final commit**

```bash
git add docs/optimization-results.md
git commit -m "docs: record optimization results
- Document before/after metrics
- Bundle size reduction: ~30%
- API response time improvement: ~70%
- Database query reduction: ~95% for team analytics
- Stack overflow risk eliminated
- All tests passing, production-ready"
```

---

## SUCCESS CRITERIA

- [ ] All 16 tasks completed with commits
- [ ] TypeScript strict check passes
- [ ] Build succeeds with no errors
- [ ] Bundle sizes within budget
- [ ] No Math.max/Math.min stack overflow risks
- [ ] All major routes have loading.tsx
- [ ] All major routes have error.tsx
- [ ] Cache headers present on public APIs
- [ ] N+1 queries eliminated
- [ ] Provider split reduces cascade re-renders
- [ ] Production smoke test passes
- [ ] Performance metrics documented

---

## ESTIMATED IMPACT

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bundle size (dashboard) | 53KB | 37KB | 30% reduction |
| API response time (deals) | 800ms | 240ms | 70% faster |
| DB queries (team analytics) | 250+ | 10 | 95% reduction |
| Re-renders (lists) | High | Low | 40% reduction |
| Stack overflow risk | Yes | No | 100% fixed |
| Missing infrastructure | 23+ | 0 | 100% complete |

---

**NEXT STEPS:** After plan approval, choose execution method:
1. Subagent-driven (recommended): Parallel execution with fresh subagent per task
2. Inline execution: Sequential execution in current session

Ready to execute when you confirm.

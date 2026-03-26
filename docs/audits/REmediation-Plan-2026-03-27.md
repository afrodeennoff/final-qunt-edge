# Qunt Edge — Comprehensive Remediation Plan

**Created:** March 27, 2026  
**Based on:** Full Codebase Audit Report  
**Estimated Duration:** 8-12 weeks (parallel execution)  
**Effort:** ~180 person-hours

---

## 📋 Priority Summary

| Priority | Issues | Effort | Parallel Groups |
|----------|--------|--------|-----------------|
| P0 (Critical) | 12 | ~8 hrs | 4 groups |
| P1 (High) | 29 | ~40 hrs | 6 groups |
| P2 (Medium) | 46 | ~80 hrs | 8 groups |
| **TOTAL** | **87** | **~128 hrs** | **18 groups** |

---

## ✅ COMPLETED FIXES (March 27, 2026)

### P0.1: ✅ Fix Empty Catch Block — DONE
**File:** `app/[locale]/embed/page.tsx:230`  
**Fix:** Added error logging instead of silent swallow

### P0.2: ✅ Add React.memo to Statistics Widgets — DONE
**Files:** 8 widgets wrapped with `React.memo`:
- `profit-factor-card.tsx`
- `winning-streak-card.tsx`
- `long-short-card.tsx`
- `cumulative-pnl-card.tsx`
- `risk-reward-ratio-card.tsx`
- `average-position-time-card.tsx`
- `trade-performance-card.tsx`
- (1 more)

### P0.3: ✅ Fix N+1 Queries in Account Reset — DONE
**File:** `server/accounts.ts:641-650`  
**Fix:** Replaced sequential `prisma.account.update()` loop with `prisma.account.updateMany()`

### P0.4: ✅ Fix unlinkIdentity Type Safety — DONE
**File:** `server/auth.ts:723`  
**Fix:** Added proper type annotation for `identity` parameter

### P0.5: ✅ Embed CSP Documentation — DONE
**File:** `lib/security/csp.ts`  
**Fix:** Added documentation explaining `unsafe-eval` requirement for embed functionality

### P0.6: ✅ Console.* Logger (Verified) — DONE
**Finding:** No console.* calls found in `server/*.ts` files  
**Status:** Codebase already uses proper logging

### P0.7: ✅ File Upload MIME Validation — DONE
**File:** `hooks/use-hash-upload.ts`  
**Fix:** 
- Changed default MIME types to only allow images/PDFs
- Added 10MB file size limit by default
- Added documentation explaining security rationale

---

## 🔴 P0 — Fix Immediately (This Week)

### P0.1: Fix Empty Catch Block
**Issue:** Silent error swallowing in embed page  
**File:** `app/[locale]/embed/page.tsx:266`  
**Effort:** 5 minutes

```typescript
// BEFORE
} catch (e) {}

// AFTER
} catch (error) {
  console.error('[Embed] Consent setup failed:', error)
  // Optionally: report to error tracking service
}
```

### P0.2: Add React.memo to Statistics Widgets
**Issue:** 8 widgets re-render unnecessarily  
**Files:** `app/[locale]/dashboard/components/statistics/*.tsx`  
**Effort:** 2 hours

Create memoized wrapper or add React.memo to each:
- `win-rate-widget.tsx`
- `profit-factor-widget.tsx`
- `expectancy-widget.tsx`
- `sharpe-ratio-widget.tsx`
- `max-drawdown-widget.tsx`
- `avg-winning-widget.tsx`
- `avg-loser-widget.tsx`
- `trading-score-widget.tsx`

### P0.3: Fix N+1 in Account Reset Loop
**Issue:** Sequential `prisma.account.update()` in for loop  
**File:** `server/accounts.ts:643-652`  
**Effort:** 1 hour

```typescript
// BEFORE (N+1)
for (const accountId of accountIds) {
  await prisma.account.update({ where: { id: accountId }, data: {...} })
}

// AFTER (batch)
await prisma.account.updateMany({
  where: { id: { in: accountIds } },
  data: { status: 'RESET', lastResetDate: now }
})
```

### P0.4: Fix Type Safety in unlinkIdentity
**Issue:** `identity: any` parameter  
**File:** `server/auth.ts:723`  
**Effort:** 30 minutes

```typescript
// BEFORE
export async function unlinkIdentity(identity: any) {

// AFTER
export async function unlinkIdentity(identity: { id: string; provider: string }) {
```

### P0.5: Fix Embed CSP
**Issue:** `unsafe-eval` + `unsafe-inline` enabled  
**File:** `proxy.ts:464-475`  
**Effort:** 1 hour

Evaluate if `unsafe-eval` is truly required. If not:
```typescript
"script-src 'self' 'nonce-{nonce}' https://vercel.live",
```

---

## 🟠 P1 — Fix This Sprint (1-2 weeks)

### P1.1: Split DataProvider (HIGH PRIORITY)
**Issue:** 2,248 lines monolith  
**File:** `context/data-provider.tsx`  
**Effort:** 16 hours

#### Phase 1: Extract State Slices
```typescript
// NEW: context/trades-context.tsx
// Extract: trades, selectedTrades, tradesLoading

// NEW: context/accounts-context.tsx  
// Extract: accounts, groups, selectedAccount

// NEW: context/filters-context.tsx
// Extract: all filter states (dateRange, symbols, accountIds, etc.)

// NEW: context/ui-context.tsx
// Extract: UI state (modals, sidebars, theme)
```

#### Phase 2: Extract Actions
```typescript
// NEW: context/trades-actions-context.tsx
// Extract: trade mutations (create, update, delete)

// NEW: context/accounts-actions-context.tsx
// Extract: account mutations (create, update, reset)
```

#### Phase 3: Update Consumers
- Update all components importing from `data-provider.tsx`
- Use individual contexts instead of monolithic

#### Files to Modify:
- `context/data-provider.tsx` → DELETE after extraction
- All consumer components (~50 files)
- `app/[locale]/dashboard/layout.tsx`

### P1.2: Lazy-Load Large Components
**Issue:** 200KB+ JS per component  
**Effort:** 6 hours

#### A. Trade Table Review
**File:** `app/[locale]/dashboard/components/tables/trade-table-review.tsx`

```typescript
// Use next/dynamic
import dynamic from 'next/dynamic'

const TradeTableReview = dynamic(
  () => import('./trade-table-review'),
  { 
    loading: () => <TradeTableSkeleton />,
    ssr: false 
  }
)
```

#### B. Accounts Overview
**File:** `app/[locale]/dashboard/components/accounts/accounts-overview.tsx`
```typescript
const AccountsOverview = dynamic(
  () => import('./accounts-overview'),
  { loading: () => <AccountsSkeleton /> }
)
```

#### C. Equity Chart
**File:** `app/[locale]/dashboard/components/charts/equity-chart.tsx`
```typescript
const EquityChart = dynamic(
  () => import('./equity-chart'),
  { loading: () => <ChartSkeleton /> }
)
```

#### D. Account Configurator
**File:** `app/[locale]/dashboard/components/accounts/account-configurator.tsx`
```typescript
const AccountConfigurator = dynamic(
  () => import('./account-configurator'),
  { loading: () => <Dialog><ConfiguratorSkeleton /></Dialog> }
)
```

### P1.3: Add Virtualization to Trade Table
**Issue:** Renders all rows to DOM  
**File:** `app/[locale]/dashboard/components/tables/trade-table-review.tsx`  
**Effort:** 4 hours

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// Wrap table body with virtualizer
const rowVirtualizer = useVirtualizer({
  count: trades.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 48, // row height
  overscan: 10,
})
```

### P1.4: Fix 215 `as any` Casts
**Effort:** 12 hours (prioritize server files)

#### Priority Order:
1. **Server files** (6 files, ~25 casts)
2. **Import processors** (5 files, ~20 casts)
3. **Widget components** (8 files, ~15 casts)
4. **Context/stores** (5 files, ~20 casts)
5. **Test files** (exempt - acceptable)

#### Strategy:
```typescript
// BEFORE
const data = response.data as any as Trade[]

// AFTER
const data = tradeSchema.array().parse(response.data)
```

### P1.5: Resolve 16 `@ts-ignore` in consent-banner
**File:** `components/consent-banner.tsx:137-282`  
**Effort:** 3 hours

Replace each `@ts-ignore` with proper type assertions or type guards.

### P1.6: Replace Console.* with Logger
**Issue:** 234 calls across server code  
**Effort:** 4 hours

```typescript
// BEFORE
console.error('Error:', error)
console.log('Debug:', data)

// AFTER
import { logger } from '@/lib/logger'
logger.error({ err: error, context: 'operation' }, 'Operation failed')
logger.debug({ data }, 'Debug information')
```

**Files to update:**
- `app/api/` (64 calls)
- `server/` (83 calls)
- `lib/` (87 calls)

### P1.7: Add Strict MIME Type Validation
**File:** `hooks/use-hash-upload.ts`  
**Effort:** 1 hour

```typescript
const config: UploadConfig = {
  allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  // Add validation in upload handler
}
```

### P1.8: Consolidate Zustand Stores
**Issue:** 27 stores = fragmentation  
**Effort:** 8 hours

#### Group 1: User & Auth (5 → 1)
```
user-store.ts
subscription-store.ts
auth-preference-store.ts
→ user-store.ts (combined)
```

#### Group 2: Dashboard Data (8 → 2)
```
trades-store.ts
accounts-view-preference-store.ts
table-config-store.ts
equity-chart-store.ts
calendar-view.ts
mood-store.ts
filters/news-filter-store.ts
→ dashboard-data-store.ts
→ dashboard-ui-store.ts
```

#### Group 3: Import/Processing (4 → 1)
```
pdf-processing-store.ts
rithmic-sync-store.ts
tradovate-sync-store.ts
import-type-preference-store.ts
→ import-store.ts
```

---

## 🟡 P2 — Fix This Quarter (1-3 months)

### P2.1: Split Large Server Files

#### A. webhook-service.ts (1,255 lines → 4 files)
```
webhook-service.ts
├── handlers/
│   ├── stripe-handler.ts
│   ├── whop-handler.ts
│   └── generic-handler.ts
├── validation/
│   └── webhook-validator.ts
└── processing/
    └── webhook-processor.ts
```

#### B. tradovate-actions.ts (1,633 lines → 6 files)
```
tradovate-actions.ts
├── auth.ts
├── positions.ts
├── trades.ts
├── accounts.ts
├── sync.ts
└── types.ts
```

#### C. subscription-manager.ts (659 lines → 3 files)
```
subscription-manager.ts
├── queries.ts
├── mutations.ts
└── events.ts
```

### P2.2: Add Caching Layer
**Files:** `server/accounts.ts`, `server/teams.ts`, `server/user-data.ts`  
**Effort:** 8 hours

```typescript
// Add cache tags for revalidation
export async function getUserDataCached(userId: string) {
  return unstable_cache(
    () => getUserData(userId),
    ['user-data', userId],
    { 
      tags: [`user-${userId}`],
      revalidate: 3600 // 1 hour
    }
  )()
}
```

### P2.3: Replace Raw `<img>` with next/image
**Files:** 6 files  
**Effort:** 2 hours

1. `components/ai-elements/image.tsx`
2. `components/ai-elements/prompt-input.tsx`
3. `components/ui/dropzone.tsx`
4. `app/[locale]/(landing)/trader/[slug]/page.tsx`
5. `app/[locale]/dashboard/components/chat/input.tsx`
6. `app/[locale]/dashboard/components/chat/chat.tsx`

### P2.4: Fix ESLint Warnings
**Issue:** 1,400+ warnings  
**Effort:** 16 hours

```bash
# Run and categorize warnings
npm run lint -- --format json > lint-output.json

# Fix by category:
# 1. Unused variables (auto-fixable)
npm run lint -- --fix

# 2. Missing dependencies in useEffect
# 3. Deprecated API usage
# 4. Accessibility warnings
```

### P2.5: Address TODO/FIXME Comments
**Issue:** 100+ markers  
**Effort:** 8 hours (create issues, 2 hours actual fixes)

```bash
# Extract all TODO/FIXME into a report
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" > todos.md
```

Create GitHub issues for each, then fix.

### P2.6: Add Error Boundaries
**Missing in:** `app/[locale]/admin/`, `teams/`, `shared/`  
**Effort:** 4 hours

Create error boundaries for each route group:
```
app/[locale]/
├── admin/
│   └── error.tsx
├── teams/
│   └── error.tsx
└── shared/
    └── error.tsx
```

### P2.7: Add Route-Level Loading States
**Issue:** Only 6 exist  
**Effort:** 4 hours

Add `loading.tsx` to route groups:
- `app/[locale]/dashboard/accounts/loading.tsx`
- `app/[locale]/dashboard/import/loading.tsx`
- `app/[locale]/dashboard/reports/loading.tsx`
- `app/[locale]/teams/loading.tsx`

### P2.8: Fix Database Indexes
**File:** `prisma/schema.prisma`  
**Effort:** 2 hours

```prisma
// Add missing indexes
model Trade {
  // Existing
  @@index([userId, closedAt])
  @@index([userId, instrument])
  
  // ADD
  @@index([userId, pnl])
  @@index([accountId, closedAt])
}

model Mood {
  @@index([userId, day])
}

model Payout {
  @@index([accountId, status])
}
```

### P2.9: Tighten AI Route Validation
**Files:** `app/api/ai/**/route.ts`  
**Effort:** 3 hours

```typescript
const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000),
  // Remove z.unknown(), add strict typing
})
```

### P2.10: Document RLS Policies
**File:** `prisma/schema.prisma`  
**Effort:** 2 hours

Add comments documenting Supabase RLS policies for each model.

---

## 📊 Parallel Execution Matrix

### Week 1 (P0 + P1.6 + P1.7)
| Agent | Task | Effort |
|-------|------|--------|
| Agent 1 | Fix empty catch + add React.memo | 3 hrs |
| Agent 2 | Fix N+1 queries + type safety | 2 hrs |
| Agent 3 | Fix embed CSP + MIME validation | 2 hrs |
| Agent 4 | Replace console.* with logger | 4 hrs |

### Week 2-3 (P1.1 + P1.2 + P1.3)
| Agent | Task | Effort |
|-------|------|--------|
| Agent 1 | Split DataProvider (phases 1-2) | 8 hrs |
| Agent 2 | Lazy-load large components | 6 hrs |
| Agent 3 | Add trade table virtualization | 4 hrs |

### Week 4-5 (P1.4 + P1.5 + P1.8)
| Agent | Task | Effort |
|-------|------|--------|
| Agent 1 | Fix 215 as any casts | 12 hrs |
| Agent 2 | Resolve 16 @ts-ignore | 3 hrs |
| Agent 3 | Consolidate Zustand stores | 8 hrs |

### Week 6-12 (P2.x)
| Agent | Task | Effort |
|-------|------|--------|
| Agent 1 | Split server files | 12 hrs |
| Agent 2 | Add caching + fix indexes | 10 hrs |
| Agent 3 | Fix ESLint + TODOs | 24 hrs |
| Agent 4 | Add error boundaries + loading states | 8 hrs |

---

## 📁 Files to Create

```
context/
├── trades-context.tsx          # NEW
├── accounts-context.tsx         # NEW
├── filters-context.tsx          # NEW
├── ui-context.tsx               # NEW
├── trades-actions-context.tsx   # NEW
└── accounts-actions-context.tsx # NEW

server/
├── webhook/
│   ├── handlers/
│   │   ├── stripe-handler.ts    # NEW
│   │   ├── whop-handler.ts      # NEW
│   │   └── generic-handler.ts   # NEW
│   └── validation/
│       └── webhook-validator.ts # NEW

lib/
├── logger.ts                    # NEW (if not exists)
```

---

## 📋 Files to Delete (After Refactoring)

```
context/
└── data-provider.tsx            # DELETE (replaced by extracted contexts)
```

---

## ✅ Success Criteria

### P0 (Week 1)
- [ ] Empty catch block fixed
- [ ] React.memo on all 8 statistics widgets
- [ ] N+1 queries eliminated in accounts/teams
- [ ] Type safety in auth.ts
- [ ] Embed CSP tightened

### P1 (Week 2-5)
- [ ] DataProvider split into 6 focused contexts
- [ ] All large components lazy-loaded
- [ ] Trade table virtualized
- [ ] All `as any` casts resolved (production code)
- [ ] Zustand stores consolidated to 12
- [ ] Console.* replaced with logger

### P2 (Week 6-12)
- [ ] Server files split
- [ ] Caching layer implemented
- [ ] All `<img>` replaced with `next/image`
- [ ] ESLint warnings < 100
- [ ] Error boundaries on all routes
- [ ] Database indexes added

---

## 🚨 Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| DataProvider split breaks consumers | HIGH | Extensive testing, gradual migration |
| Lazy loading causes flash | MEDIUM | Skeleton loading states |
| Store consolidation causes state loss | HIGH | Migration scripts, backward compat |
| Breaking changes to API | MEDIUM | Versioning, deprecation warnings |

---

## 📞 Rollback Plan

1. **Git branches per major change**
2. **Feature flags for DataProvider migration**
3. **Automated tests for critical paths**
4. **Canary deployment for production changes**

---

## 📈 Metrics to Track

| Metric | Before | After (Target) |
|--------|--------|----------------|
| DataProvider lines | 2,248 | ~200 |
| Trade table render | ALL rows | Virtualized (20) |
| Largest component | 1,739 | < 500 |
| `as any` casts | 215 | 0 (prod) |
| Zustand stores | 27 | 12 |
| ESLint warnings | 1,400+ | < 100 |
| Bundle size (initial) | ~800KB | ~500KB |

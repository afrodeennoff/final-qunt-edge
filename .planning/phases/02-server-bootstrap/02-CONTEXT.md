# 02 — Server Dashboard Bootstrap — Context

**Gathered**: 2026-04-11  
**Status**: Ready for planning  
**Depends on**: None  
**Phase**: 02 of v2.1 milestone

---

## Goal

Rebuild the dashboard as server-first. First render includes authenticated user state, sidebar state, layout, first trade snapshot, accounts, tags, groups, and headline analytics from cached server loaders. Hydrate into a thinner client runtime instead of loading the whole dashboard after mount.

---

## Current State (Baseline)

### DataProvider (Monolithic Client Hub)
- **File**: `context/data-provider.tsx` (2219 lines)
- **Pattern**: `'use client'` — all data fetched client-side after mount
- **Bootstrap flow**:
  1. `useEffect` calls `loadData()` on mount
  2. `loadData()` does parallel `Promise.allSettled` on IndexedDB cache + server actions
  3. Falls back to server fetch if cache miss
  4. Derives `formattedTrades`, `statistics`, `calendarData` via `useMemo`
  5. No useful HTML on first paint — spinner until client JS loads

### Existing Server Infrastructure
| File | Function | Caching |
|------|----------|---------|
| `server/user-data.ts` | `getUserData()` | `'use cache'` + `cacheTag` |
| `server/user-data.ts` | `getDashboardLayout()` | `'use cache'` + `cacheTag` |
| `server/trades.ts` | `getTradesAction()` | Pagination (500/page) |
| `server/accounts.ts` | `calculateAccountMetricsAction()` | No cache |
| `server/layouts.ts` | `loadDashboardLayoutAction()` | No cache |

### Slice Providers (Exist But Not Independent)
- `context/providers/data-state-provider.tsx` — wrapper around DataProvider selectors
- `context/providers/data-derived-provider.tsx` — wrapper around DataProvider selectors
- `context/providers/data-actions-provider.tsx` — wrapper around DataProvider selectors
- These are facade patterns, not true independent slices

### Feature Flag System (Existing)
- `lib/feature-flags.ts` — `FEATURE_FLAGS`, `shouldShowOptimizations()`
- Pattern: `NEXT_PUBLIC_*` env vars, rollout percentage, hash-based assignment
- Missing: `SERVER_DASHBOARD_BOOTSTRAP` flag

### Cache Tags (Existing)
| Tag | Used By |
|-----|---------|
| `user-data-core-{userId}` | `getCoreUserDataCached` |
| `user-data-supplemental-{userId}` | `getSupplementalUserDataCached` |
| `DASHBOARD_LAYOUT({userId})` | `getDashboardLayoutCached` |
| `DASHBOARD({userId})` | Multiple queries |

---

## Implementation Gray Areas

### 1. DashboardBootstrapPayload Contract

**Question**: What exactly goes in the bootstrap payload?

**Options**:

| Option | Scope | Pros | Cons |
|--------|-------|------|------|
| **A. Minimal** | User, layout, first 500 trades, accounts, groups, tags | Fast SSR, small payload | Missing analytics on first paint |
| **B. Full snapshot** | A + precomputed statistics, score metrics, calendar aggregates | Instant useful paint | Larger payload, more compute on server |
| **C. Progressive** | B + lazy-computed deferred regions | Best UX, complex implementation | RSC streaming complexity |

**Decision**: Option B (Full snapshot) with staged rollout. Precomputed analytics are cheap (O(n) on first 500 trades), and the success criteria requires "headline analytics from cached server loaders."

**Payload Shape** (proposed):
```typescript
interface DashboardBootstrapPayload {
  // User & layout
  user: User | null;
  subscription: Subscription | null;
  dashboardLayout: DashboardLayout;
  timezone: string;
  isAdmin: boolean;
  
  // Entities
  accounts: Account[];
  groups: Group[];
  tags: Tag[];
  
  // First trade snapshot (paginated, 500/page)
  trades: Trade[];
  tradesPagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
  };
  
  // Precomputed analytics (no filters applied)
  statistics: StatisticsProps;
  scoreMetrics: ScoreMetrics;
  calendarData: CalendarData;
  
  // System data
  tickDetails: TickDetails[];
  financialEvents: FinancialEvent[];
  
  // Bootstrap metadata
  bootstrappedAt: string; // ISO timestamp
  isFirstConnection: boolean;
}
```

### 2. Trade Snapshot Scope

**Question**: How many trades to include in first paint?

**Analysis**:
- `server/trades.ts` already paginates at 500/page
- `data-provider.tsx` has `fetchAllTrades()` that loops pages
- Most users have <500 trades
- First paint should show meaningful data

**Decision**: Include first 500 trades (one page) in bootstrap. Additional trades loaded client-side if `hasMore: true`. This aligns with existing pagination.

### 3. Precomputed Analytics Scope

**Question**: Which analytics to precompute server-side?

**Items to precompute**:
| Item | Function | Input | Output |
|------|----------|-------|--------|
| Statistics | `calculateStatistics()` | `Trade[]`, `Account[]` | `StatisticsProps` |
| Score metrics | `deriveScoreMetricsFromTrades()` | `Trade[]` | `ScoreMetrics` |
| Calendar data | `formatCalendarData()` | `Trade[]`, `Account[]` | `CalendarData` |

**Note**: These are computed on raw (unfiltered) trades for the bootstrap. Client derives filtered versions reactively.

**Questions remaining**:
- Should we precompute filtered statistics too? (No — client-driven filters)
- Should we include equity chart data? (Defer to Phase 03 — widget server shells)
- Should we compute account metrics? (Yes — `calculateAccountMetricsAction()`)

### 4. Data Provider Split Strategy

**Current**: Single monolithic `DataProvider` context (2219 lines)

**Target**: Slice-based architecture

| Slice | Responsibility | State Type |
|-------|---------------|------------|
| `BootstrapSlice` | Initial server snapshot | Immutable, replaced on full refresh |
| `TradesSlice` | Trade collection + mutations | Mutable |
| `AccountsSlice` | Account collection + mutations | Mutable |
| `GroupsSlice` | Group collection + mutations | Mutable |
| `TagsSlice` | Tag collection + mutations | Mutable |
| `FiltersSlice` | User filter selections | Ephemeral |
| `DerivedSlice` | Computed analytics | Derived from slices |
| `ActionsSlice` | Server action dispatchers | Mutations |

**Migration path**:
1. Create `DashboardBootstrapProvider` for server-injected data
2. Split `DataProvider` into named slice providers
3. Migrate hooks to slice selectors
4. Deprecate monolithic `DataProvider`

### 5. Staged Rollout Flag

**Question**: How to implement the rollout flag?

**Existing pattern** (from `feature-flags.ts`):
```typescript
const FEATURE_FLAGS = {
  SERVER_DASHBOARD_BOOTSTRAP: process.env.NEXT_PUBLIC_SERVER_DASHBOARD_BOOTSTRAP === 'true',
  SERVER_DASHBOARD_ROLLOUT_PCT: Number(process.env.NEXT_PUBLIC_SERVER_DASHBOARD_ROLLOUT_PCT) || 0,
}
```

**Proposed addition**:
```typescript
export function shouldUseServerBootstrap(userId?: string): boolean {
  if (!FEATURE_FLAGS.SERVER_DASHBOARD_BOOTSTRAP) return false;
  if (FEATURE_FLAGS.SERVER_DASHBOARD_ROLLOUT_PCT >= 100) return true;
  if (FEATURE_FLAGS.SERVER_DASHBOARD_ROLLOUT_PCT <= 0) return false;
  if (userId) {
    return (hashCode(userId) % 100) < FEATURE_FLAGS.SERVER_DASHBOARD_ROLLOUT_PCT;
  }
  return false;
}
```

**Rollout phases**:
| Phase | Percentage | Target |
|-------|------------|--------|
| Pilot | 0% | Internal/dev |
| Early access | 5% | Beta users |
| Gradual | 25% | Random sample |
| Full | 100% | All users |

### 6. Client Hydration Pattern

**Question**: How to pass bootstrap data from server to client?

**Options**:

| Option | Mechanism | Pros | Cons |
|--------|-----------|------|------|
| **A. React Context props** | Pass as props to provider | Simple, type-safe | Prop drilling |
| **B. RSC payload** | Server component passes context | Native Next.js | Complex setup |
| **C. Script injection** | `JSON.stringify` in script tag | Fastest hydration | No type safety |
| **D. Server context** | Next.js `createContext` | Works with RSC | Limited ecosystem support |

**Decision**: Option A (Context props) with `initialBootstrap` prop on `DashboardProvider`. This is the simplest path that preserves TypeScript types and works with existing slice provider pattern.

```typescript
// layout.tsx (Server Component)
async function DashboardLayout() {
  const bootstrap = await getDashboardBootstrap(userId);
  return (
    <DashboardProvider initialBootstrap={bootstrap}>
      {children}
    </DashboardProvider>
  );
}

// data-provider.tsx
interface DataProviderProps {
  initialBootstrap?: DashboardBootstrapPayload;
  children: React.ReactNode;
}

// If initialBootstrap exists, use it; otherwise fall back to client fetch
```

### 7. Cache Invalidation Strategy

**Question**: When mutations happen, how to update the bootstrap cache?

**Existing pattern**: `updateTag()` after Prisma mutations

**Bootstrap cache tags needed**:
| Tag | Invalidation Triggers |
|-----|----------------------|
| `dashboard-bootstrap-{userId}` | Trade save/delete, account save/delete, group save/delete |
| `user-data-core-{userId}` | User profile changes |
| `DASHBOARD_LAYOUT({userId})` | Layout save |

**Implementation**:
```typescript
// server/dashboard-bootstrap.ts
async function getDashboardBootstrapCached(userId: string) {
  'use cache'
  cacheLife({ stale: 60, revalidate: 60, expire: 300 })
  cacheTag(`dashboard-bootstrap-${userId}`)
  return loadDashboardBootstrap(userId)
}

// server/trades.ts (mutation)
async function saveTradesAction(...) {
  // ... Prisma mutation
  await updateTag(`dashboard-bootstrap-${userId}`)
}
```

### 8. Sidebar State Handling

**Question**: How to preserve sidebar state with server bootstrap?

**Current**: `parseSidebarStateCookieValue()` in `layout.tsx`

**Bootstrap consideration**: Sidebar state is client-only preference. The bootstrap payload should NOT include sidebar state — it should be read from cookie as before. The `SidebarRootProviders` already handles this.

### 9. Shared View vs Authenticated

**Question**: Does bootstrap apply to shared views too?

**Analysis**: Shared views (`/shared/[slug]`) are public, read-only. They already have `initialSharedData` in `DataProvider`.

**Decision**: Bootstrap applies only to authenticated dashboard. Shared views remain their current pattern (pre-loaded props, no server cache).

### 10. Error Handling & Fallback

**Question**: What happens if bootstrap fails?

**Scenarios**:

| Scenario | Behavior |
|-----------|----------|
| Auth failure | Redirect to login (existing behavior) |
| Bootstrap fetch error | Fall back to client-side `loadData()` |
| Partial bootstrap | Use partial data, client reconciles |
| Empty trades | Show empty state (honest, no fake data) |

**Implementation**:
```typescript
async function DashboardBootstrap() {
  try {
    return await getDashboardBootstrapCached(userId);
  } catch (error) {
    logger.error({ error }, 'Bootstrap failed, falling back to client fetch');
    return null; // Client will use existing loadData() pattern
  }
}
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `server/dashboard-bootstrap.ts` | Bootstrap loader with `'use cache'` |
| `lib/types/bootstrap.ts` | `DashboardBootstrapPayload` type |
| `context/providers/bootstrap-provider.tsx` | Server data injection slice |
| `context/providers/trades-slice-provider.tsx` | Trade collection slice |
| `context/providers/accounts-slice-provider.tsx` | Account collection slice |
| `context/providers/filters-slice-provider.tsx` | Filter state slice |
| `context/providers/derived-slice-provider.tsx` | Derived analytics slice |
| `context/providers/actions-slice-provider.tsx` | Server action dispatchers |

### Files to Modify
| File | Change |
|------|--------|
| `context/data-provider.tsx` | Extract slices, add bootstrap prop |
| `app/[locale]/dashboard/layout.tsx` | Add server bootstrap call |
| `lib/feature-flags.ts` | Add `SERVER_DASHBOARD_BOOTSTRAP` flag |
| `.env.example` | Add new env vars |
| `prisma/schema.prisma` | (No changes needed) |

---

## Success Criteria Checklist

- [ ] Dashboard first paint contains useful HTML before hydration for authenticated users
- [ ] Typed `DashboardBootstrapPayload` contract exists and is consumed by client runtime
- [ ] Data-provider split into bootstrap, mutable entities, filters, derived analytics, and mutation slices
- [ ] Initial sorting, filtering, score metrics, and calendar aggregates precomputed server-side
- [ ] Staged rollout flag `server_dashboard_bootstrap` defaults off, flips after validation

---

## Dependencies on Other Phases

- **Phase 03 (Widget Server Shells)**: Depends on bootstrap payload structure
- **Phase 09 (Auth Simplification)**: Bootstrap should use simplified auth helper when ready

## Blockers/Concerns

1. **Monolithic DataProvider**: 2219 lines — slice extraction is substantial refactor
2. **Backward compatibility**: Shared views, admin views, mobile views all need bootstrap consideration
3. **Type normalization**: Bootstrap payload must match existing client type expectations

---


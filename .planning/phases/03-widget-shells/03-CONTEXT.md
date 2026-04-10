# 03 — Widget Server Shells & Client Islands — Context

**Gathered**: 2026-04-11
**Status**: Ready for planning
**Depends on**: 02 (Server Dashboard Bootstrap)
**Phase**: 03 of v2.1 milestone

---

## Goal

Refactor widget rendering into server shells plus client islands. Widget titles, summaries, counts, empty states, and shell chrome render on the server. Charts, drag/drop, editors, chat, and upload interactions stay client-side and load lazily. Remove blanket `ssr: false` usage.

---

## Current State (Baseline)

### Widget System Architecture

**Files**:
| File | Lines | Purpose |
|------|-------|---------|
| `config/widget-registry.tsx` | 831 | 35+ widget type definitions with `ssr: false` dynamic imports |
| `components/widget-canvas.tsx` | 694 | Client component, React Grid Layout drag-drop, renders widgets |
| `components/lazy-widget.tsx` | 143 | Alternative lazy loader with IntersectionObserver (unused in canvas) |
| `components/ui/widget-shell.tsx` | 152 | Client component, Card-based widget wrapper |

**Registry Pattern** (current):
```tsx
// widget-registry.tsx — blanket ssr:false
const SmartInsightsWidget = dynamic(
  () => import('../components/widgets/smart-insights-widget'),
  { ssr: false, loading: () => widgetFallback }
)

export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  smartInsights: {
    type: 'smartInsights',
    getComponent: ({ size }) => <SmartInsightsWidget size={size} />,
    // ...
  },
  // ... 35+ more
}
```

**Widget Shell** (current client component):
```tsx
// widget-shell.tsx — "use client"
export function WidgetShell({ title, children, ... }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### `ssr: false` Usage (61 instances)

| Location | Count | Purpose |
|----------|-------|---------|
| `widget-registry.tsx` | 37 | All widget dynamic imports |
| `dashboard-header.tsx` | 6 | Import button, sync buttons |
| `lazy-widget.tsx` | 1 | Wrapper dynamic |
| `dashboard-header-widget-controls.tsx` | 2 | Widget size controls |
| `components/lazy/charts.tsx` | 6 | Chart lazy exports |
| Other (landing, auth) | 9 | Non-widget routes |

### Widget Categories (35+ types)

| Category | Count | Examples |
|----------|-------|----------|
| Charts | 18 | Equity, PnL, Weekday, Time-of-day, Time-in-position |
| Statistics | 10 | AveragePositionTime, CumulativePnl, LongShort, WinningStreak, ProfitFactor |
| Tables | 2 | TradeTableReview, AccountsOverview |
| Other | 5+ | Calendar, Chat, Mindset, TagWidget, SmartInsights, RiskMetrics |

### Existing Server Infrastructure

| File | Caching | Purpose |
|------|---------|---------|
| `server/equity-chart.ts` | `'use cache'` + `cacheTag` | Equity chart data (480 lines) |
| `server/user-data.ts` | `'use cache'` + `cacheTag` | User data aggregation |
| `server/trades.ts` | Pagination | Trade queries with cache |

### Feature Flag System (Existing)

Pattern in `lib/feature-flags.ts`:
```typescript
const FEATURE_FLAGS = {
  SERVER_DASHBOARD_BOOTSTRAP: process.env.NEXT_PUBLIC_SERVER_DASHBOARD_BOOTSTRAP === 'true',
  ROLLOUT_PERCENTAGE: Number(process.env.NEXT_PUBLIC_PERF_ROLLOUT_PCT) || 0,
}
```

---

## Implementation Gray Areas

### 1. Shell vs. Island Boundary

**Question**: What exactly is "shell" (server-renderable) vs. "island" (client-only)?

**Decision**:

| Widget Part | Shell (Server) | Island (Client) |
|-------------|----------------|-----------------|
| Title | Yes | — |
| Description/tooltip | Yes | — |
| Summary counts | Yes | — |
| Empty state message | Yes | — |
| Error state message | Yes | — |
| Loading skeleton | Yes (RSC-compatible) | — |
| WidgetShell chrome | Yes | — |
| Chart visualization | — | Yes (Recharts) |
| Drag handle | — | Yes |
| Resize handle | — | Yes |
| Interactive controls | — | Yes |
| Trade table | — | Yes |
| Chat interface | — | Yes |
| File upload | — | Yes |

### 2. Shell Component Pattern

**Question**: How to structure server shell components?

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Server Shell Wrapper** | `<WidgetShellServer>` renders shell, children are island | Clear separation, RSC native | Wrapper overhead |
| **B. Split Registry** | Separate `SERVER_SHELLS` and `CLIENT_ISLANDS` registries | Explicit categorization | Duplicate metadata |
| **C. Hybrid Config** | Single registry with `getShell()` and `getIsland()` | Unified API | More complex config |
| **D. Inline Server Slot** | Shell receives `{children}` as island slot | Simple pattern | Less explicit |

**Decision**: Option A — Server Shell Wrapper

```tsx
// components/widgets/server/widget-shell-server.tsx
interface WidgetShellServerProps {
  type: WidgetType
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode // Client island
  className?: string
}

export async function WidgetShellServer({ type, title, ... }) {
  return (
    <WidgetShell title={title} icon={icon}>
      {children}
    </WidgetShell>
  )
}

// Usage in widget-registry.tsx
export const WIDGET_REGISTRY: Record<WidgetType, WidgetConfig> = {
  equityChart: {
    getShell: ({ size }) => (
      <WidgetShellServer
        type="equityChart"
        title={t('widgets.equityChart')}
        icon={<TrendingUp />}
        size={size}
      />
    ),
    getIsland: () => <EquityChartClient size={size} />,
  },
}
```

### 3. Island Loading Strategy

**Question**: How to lazy-load client islands after shell renders?

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. IntersectionObserver** | Load when widget enters viewport | Progressive, saves bandwidth | Complex orchestration |
| **B. Priority hints** | `next/link` prefetch-like priority | Native Next.js | All-or-nothing |
| **C. Priority levels** | immediate/near/deferred (already in lazy-widget.tsx) | Flexible | Unused pattern |
| **D. Skeleton then hydrate** | Shell skeleton → client hydrate | Simple, fast TTFB | No progressive |

**Decision**: Option D — Server skeleton then client hydrate

```tsx
// WidgetShellServer provides loading skeleton as server-renderable fallback
export async function WidgetShellServer({ type, ... }) {
  return (
    <WidgetShell 
      state="loading"
      skeleton={<WidgetSkeleton type={type} size={size} />}
    >
      {await /* client island */}  // Server Component awaits island
    </WidgetShell>
  )
}

// Alternative: Keep existing widget-registry pattern but without ssr:false
export const WIDGET_REGISTRY = {
  equityChart: {
    getComponent: ({ size }) => (
      <WidgetShell title="Equity Chart">
        <Suspense fallback={<WidgetSkeleton />}>
          <EquityChartClient size={size} />
        </Suspense>
      </WidgetShell>
    ),
  },
}
```

### 4. Widget Registry Migration

**Question**: How to migrate 37 `ssr: false` widgets without breaking everything?

**Strategy**: Incremental per-category migration

| Phase | Category | Widgets | Risk |
|-------|----------|---------|------|
| 1 | Statistics | 10 (tiny cards) | Low — static display |
| 2 | Charts | 18 | Medium — complex interactions |
| 3 | Tables | 2 | Medium — editing capabilities |
| 4 | Other | 5+ | Varies |

**Migration Steps per Widget**:
1. Extract title/description to server-renderable config
2. Wrap chart component in `WidgetShellServer`
3. Replace `ssr: false` with `dynamic()` without `ssr: false`
4. Add `Suspense` boundary in shell
5. Verify server-renders correctly

### 5. Shell Data Hydration

**Question**: How to pass precomputed data to client islands?

**Analysis**:
- Phase 02 bootstrap provides initial data
- Charts already have server action (`getEquityChartDataAction`)
- Statistics derive from `dataContext.statistics`

**Decision**: Three-tier data flow

| Tier | Source | Purpose |
|------|--------|---------|
| Bootstrap | Phase 02 payload | Initial trade snapshot, precomputed stats |
| Shell props | Server components | Pre-rendered titles, counts, summaries |
| Island fetches | Client-side server actions | Dynamic data (filtered charts) |

```tsx
// Example: Statistics widget shell
export async function StatisticsWidgetShell({ trades }) {
  const stats = calculateStatistics(trades) // Server-side computation
  
  return (
    <WidgetShell title={t('statistics.title')} count={stats.nbTrades}>
      <StatisticsWidgetClient initialStats={stats} />
    </WidgetShell>
  )
}

// Client island receives precomputed data
function StatisticsWidgetClient({ initialStats }) {
  const [stats] = useState(initialStats)
  // Can refetch if filters change
}
```

### 6. Client Island Wrapper Pattern

**Question**: How to wrap client-only widget components?

**Current**:
```tsx
// widget-registry.tsx — all ssr:false
const EquityChart = dynamic(() => import('../charts/equity-chart'), {
  ssr: false,
  loading: () => widgetFallback,
})
```

**Target**:
```tsx
// Client island wrapper (no ssr:false needed)
function EquityChartIsland({ size }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <EquityChart size={size} />
    </Suspense>
  )
}

// Server shell with client island
export async function EquityChartWidget({ size }) {
  return (
    <WidgetShell title={t('widgets.equityChart')} icon={<TrendingUp />}>
      <EquityChartIsland size={size} />
    </WidgetShell>
  )
}
```

**Key Insight**: Remove `ssr: false` from dynamic imports. The server shell renders the wrapper, client components inside `<Suspense>` hydrate naturally.

### 7. Drag-and-Drop Handling

**Question**: How to preserve drag-drop with server shells?

**Analysis**:
- `widget-canvas.tsx` handles drag-drop via React Grid Layout
- Widget wrapper renders inside grid item
- Drag handle is client-only control

**Decision**: Keep `widget-canvas.tsx` as client boundary

```tsx
// widget-canvas.tsx — remains client component
<ResponsiveGridLayout>
  {currentLayout.map(widget => (
    <div key={widget.i}>
      {/* Server shell renders here, client island hydrates inside */}
      <WidgetShellServer type={widget.type} size={widget.size}>
        <WidgetIsland type={widget.type} size={widget.size} />
      </WidgetShellServer>
    </div>
  ))}
</ResponsiveGridLayout>
```

### 8. Staged Rollout Flag

**Question**: How to implement `SERVER_WIDGET_SHELLS` flag?

**Pattern** (existing from Phase 02):
```typescript
// lib/feature-flags.ts
export const FEATURE_FLAGS = {
  SERVER_WIDGET_SHELLS: process.env.NEXT_PUBLIC_SERVER_WIDGET_SHELLS === 'true',
  SERVER_WIDGET_SHELLS_PCT: Number(process.env.NEXT_PUBLIC_SERVER_WIDGET_SHELLS_PCT) || 0,
}

export function shouldUseServerWidgetShells(userId?: string): boolean {
  if (!FEATURE_FLAGS.SERVER_WIDGET_SHELLS) return false
  // Hash-based consistent rollout
  if (userId) {
    return (hashCode(userId) % 100) < FEATURE_FLAGS.SERVER_WIDGET_SHELLS_PCT
  }
  return false
}
```

**Rollout Phases**:
| Phase | Percentage | Widgets |
|-------|------------|---------|
| Pilot | 0% | Internal dev |
| Canary | 5% | Statistics only |
| Early | 25% | Statistics + Charts |
| Gradual | 50% | All categories |
| Full | 100% | Complete migration |

### 9. Widget Canvas Rendering Strategy

**Question**: How to render server shells in client canvas?

**Options**:

| Option | Pattern | Pros | Cons |
|--------|---------|------|------|
| **A. Server component in client** | Canvas fetches shells via server action | True RSC | Complex data passing |
| **B. Canvas splits to server** | Server component wraps shell rendering | Native RSC | WidgetCanvas must be server |
| **C. Hybrid shells in canvas** | Server shell props passed to client wrapper | Simple migration | Partial server render |
| **D. Canvas stays client** | Client renders shells via inline components | Minimal change | Not true RSC shells |

**Decision**: Option C — Hybrid shells in canvas

```tsx
// widget-canvas.tsx (remains client)
// But widget rendering changes:
async function renderWidget(widget: Widget) {
  // Shell rendered server-side via async server component
  const shell = await getWidgetShell(widget.type, widget.size)
  
  return (
    <div key={widget.i}>
      {shell}
      {/* Client island hydrates */}
      <WidgetIsland type={widget.type} size={widget.size} />
    </div>
  )
}
```

**Note**: This requires Canvas to be async or split shell/canvas rendering. Alternative: keep canvas client, render shells as React components (not true server components).

### 10. Existing `LazyWidgetRenderer` Reuse

**Question**: Should we use or replace `lazy-widget.tsx`?

**Analysis**:
- `LazyWidgetRenderer` has priority system (immediate/near/deferred)
- IntersectionObserver-based lazy loading
- 143 lines, not used in current widget-canvas.tsx

**Decision**: Deprecate `lazy-widget.tsx`

Rationale:
- Phase 02 bootstrap provides initial data
- Server shells already render meaningful content
- Client islands can use native `Suspense`
- Priority system adds complexity without benefit

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `app/[locale]/dashboard/components/widgets/server/widget-shell-server.tsx` | Server component shell wrapper |
| `app/[locale]/dashboard/components/widgets/islands/*.tsx` | Client island wrappers per widget |
| `app/[locale]/dashboard/components/widgets/skeletons/widget-skeleton.tsx` | Server-renderable skeleton |
| `lib/types/widget-shell.ts` | Shell/Island type definitions |
| `app/[locale]/dashboard/components/widgets/widget-registry-v2.tsx` | New registry with shell/island split |

### Files to Modify
| File | Change |
|------|--------|
| `config/widget-registry.tsx` | Remove `ssr: false`, add shell/island pattern |
| `components/ui/widget-shell.tsx` | Add server-compatible variant |
| `lib/feature-flags.ts` | Add `SERVER_WIDGET_SHELLS` flag |
| `.env.example` | Add new env vars |
| `app/[locale]/dashboard/components/widget-canvas.tsx` | Integrate server shells |

### Files to Deprecate
| File | Reason |
|------|--------|
| `components/lazy-widget.tsx` | Replaced by Suspense-based islands |

---

## Success Criteria Checklist

- [ ] Widget titles, summaries, and empty states render server-side
- [ ] Charts, drag/drop, editors, chat, and upload remain client islands with lazy imports
- [ ] No blanket `ssr: false` in widget registry
- [ ] Staged rollout flag `server_widget_shells` defaults off
- [ ] TypeScript strict mode passes

---

## Dependencies on Other Phases

- **Phase 02 (Server Dashboard Bootstrap)**: Widget shells use bootstrap payload for precomputed data
- **Phase 07 (Dashboard Polish)**: Shell chrome refinement depends on Phase 03 shell structure

## Blockers/Concerns

1. **WidgetCanvas client boundary**: If WidgetCanvas stays client, true RSC shells can't render inside. Need canvas split or hybrid approach.
2. **Existing widget component coupling**: Charts use `useDashboardFilters()` hook — shells can't provide this without context
3. **35+ widget migration**: Each widget needs shell/island extraction — substantial refactor
4. **DataContext dependency**: Client islands depend on DataContext — Phase 02 data provider split needed first

---

## Appendix: Widget Island Classification

| Widget Type | Shell | Island | Notes |
|-------------|-------|--------|-------|
| SmartInsightsWidget | title, description | AI responses | Chat-like interaction |
| EquityChart | title, account counts | Recharts visualization | Complex interactivity |
| WeekdayPnlChart | title, summary | Recharts visualization | Filter controls |
| PnlChart | title, total PnL | Recharts visualization | — |
| TimeOfDayChart | title, peak time | Recharts visualization | — |
| TimeInPositionChart | title, avg time | Recharts visualization | — |
| CalendarPnl | title, month stats | Calendar grid | Complex interactivity |
| TradeTableReview | title, trade count | Sortable table | Heavy editing |
| AccountsOverview | title, account count | Account list | CRUD operations |
| ChatWidget | title | AI chat interface | Full client |
| MindsetWidget | title, entry count | Journaling UI | Form interactions |
| StatisticsWidget | title, metrics | Bar charts | Mixed |
| AveragePositionTimeCard | title, value | — | Pure display |
| CumulativePnlCard | title, value | — | Pure display |
| LongShortCard | title, L/S ratio | — | Pure display |
| WinningStreakCard | title, value | — | Pure display |
| ProfitFactorCard | title, value | — | Pure display |
| RiskRewardRatioCard | title, value | — | Pure display |
| TradePerformanceCard | title, win rate | — | Pure display |
| TagWidget | title, tag count | Tag list | Interactive |
| PropfirmCatalogueWidget | title, firm count | Firm cards | External data |
| TradingScoreWidget | title, score | Score visualization | — |
| ExpectancyWidget | title, expectancy | — | Pure display |
| RiskMetricsWidget | title, risk level | — | Pure display |

---

*End of Phase 03 Context*

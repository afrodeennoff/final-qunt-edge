# Dashboard — Authenticated Trading Analytics

**Parent:** [Root AGENTS.md](../../../AGENTS.md)

## OVERVIEW

Main authenticated surface. 9 sub-routes, 120+ components. Widget system with drag-drop layout, Recharts visualizations, AI assistant, broker imports, account management, and team collaboration.

## ROUTE TREE

```
/dashboard/
├── layout.tsx              # Auth guard (Supabase) + providers + sidebar + header
├── page.tsx                # Tab router: widgets | table | accounts | chart
├── settings/               # User settings, profile, notifications
├── data/                   # Data management (accounts + trades)
├── import/                 # Multi-broker trade import
├── reports/                # Performance reports
├── behavior/               # Mindset/journal tracking
├── trader-profile/         # Public-facing trader profile
├── strategies/             # Trade table (alias)
├── billing/                # Subscription management
└── actions/
    └── get-smart-insights.ts  # AI insights server action
```

## COMPONENT HIERARCHY

### Core Layout
| Component | File | Purpose |
|-----------|------|---------|
| DashboardLayout | `layout.tsx` | Auth gate, providers, sidebar shell |
| DashboardSidebar | `components/sidebar/dashboard-sidebar.tsx` | Navigation rail |
| DashboardHeader | `components/dashboard-header.tsx` | Filters, import, sync, customize |
| DashboardContext | `dashboard-context.tsx` | Widget layout state (customization mode) |

### Feature Areas
| Area | Dir | Components | Purpose |
|------|-----|-----------|---------|
| Charts | `components/charts/` | 18+ | Recharts visualizations (equity, PnL, distribution) |
| Filters | `components/filters/` | 20+ | Account, instrument, tag, date, PnL range |
| Tables | `components/tables/` | `trade-table-review.tsx` + helpers | Trade review/editing |
| Calendar | `components/calendar/` | 10+ | Calendar view with mood tracking |
| Mindset | `components/mindset/` | 9 | Trading psychology/journaling |
| Chat (AI) | `components/chat/` | `chat.tsx` + 5 | AI trading assistant |
| Accounts | `components/accounts/` | 6 | Account management, comparison |
| Statistics | `components/statistics/` | 8 | Performance metric cards |
| Widgets | `components/widgets/` | 5 | Widget wrappers (score, insights, risk) |
| Import | `components/import/` | 20+ | 12+ broker integrations |

### Widget System
- **Registry**: `config/widget-registry.tsx` — 35+ widget types with dynamic imports
- **Sizes**: `WidgetSize = 'tiny' | 'small' | 'small-long' | 'medium' | 'large' | 'extra-large'`
- **Canvas**: `components/widget-canvas.tsx` — React Grid Layout drag-drop
- **Auto-save**: `dashboard-context-auto-save.tsx` — Optimistic layout persistence

## DATA FLOW

```
Server Component
  └─ DataProvider (context)
       ├─ DataStateProvider      # Raw data (trades, accounts from Zustand + server actions)
       ├─ DataDerivedProvider    # Computed (statistics, calendar, equity)
       └─ DataActionsProvider    # Mutations (refresh, update, delete, import)

Hooks:
  useDashboardFilters()  → Filter state (instruments, accounts, dateRange, pnlRange)
  useDashboardStats()    → Derived data (formattedTrades, statistics, calendarData)
  useDashboardActions()  → Mutations (refreshTrades, updateTrades, deleteAccount)
```

### State Management (Zustand)
| Store | Purpose |
|-------|---------|
| `useTradingDomainStore` | Source of truth for trades/accounts |
| `useUserStore` | User, subscription, timezone |
| `useDashboardLayoutStore` | Widget layout in dashboard-context |
| `useTableConfigStore` | Column config, sorting, filters |
| `useEquityChartStore` | Chart display config |
| `useAnalysisStore` | AI analysis results (persisted) |

### Chart Pattern
```
ChartSurface → ChartContainer → ResponsiveContainer → Recharts component
                                        ↑
                               useDashboardFilters() + server action
```
Charts use CSS vars for colors: `hsl(var(--chart-1))` through `hsl(var(--chart-8))`.

## CONVENTIONS

- **Auth**: Layout redirects unauthenticated users to `/authentication?next=/dashboard`
- **Tabs**: Main page uses `searchParams.tab` for widget/table/accounts/chart views
- **Dynamic imports**: All charts use `dynamic(() => import(...), { ssr: false })`
- **WidgetSize prop**: All chart components accept `size?: WidgetSize`
- **Server actions**: Data mutations through server actions → `updateTag()` for cache invalidation
- **Mobile**: Dashboard has separate mobile layout with summary widgets
- **V2 shell**: Dashboard pages should inherit the floating-card header, `qe-v2-app-shell` shell rhythm, and `BackgroundGlow` ambient layer.
- **V2 motion**: Use `MotionSection`/`MotionStagger` for presentational reveal only. Never attach motion to business state transitions that affect dashboard logic.

## ANTI-PATTERNS

- **No stacked frames** — Don't wrap card-based components inside bordered panels
- **No mixed shell language** — New dashboard UI must use the V2 shell/card system, not reintroduce flat legacy bars or mismatched panel styles
- **No setState in effects** — Use callback-driven resets (onOpenChange handlers)
- **No Trading Score duplication** — Always use `lib/score-calculator.ts`
- **No fake data** — Show honest empty states, never synthesize fallback metrics
- **No direct Prisma in client** — Route through server actions or API routes

## COMPONENTS

| Subdir | Key Files |
|--------|-----------|
| `accounts/` | `AccountsOverview`, `AccountConfigurator`, `AccountTable`, `SuggestionInput` |
| `analysis/` | `AccountsAnalysis`, `AnalysisOverview` |
| `calendar/` | `DesktopCalendar`, `MobileCalendar`, `WeeklyCalendar`, `DailyModal`, `Charts` |
| `charts/` | 15 chart widgets — `EquityChart`, `PnlBarChart`, `PnlBySide`, `CommissionsPnl`, `TradeDistribution`, `WeekdayPnl`, `PnlPerContract`, `TimeInPosition`, etc. |
| `chat/` | `Chat`, `Header`, `Input`, `UserMessage`, `BotMessage` |
| `filters/` | `AccountFilter`, `TagFilter` |
| `import/` | 11 platform imports: Tradovate, Rithmic, FTMO, ATAS, IBKR-PDF, Thor, Topstep, NinjaTrader, Quantower, Tradezella, ETP |
| `statistics/` | `StatisticsWidget`, `TradePerformanceCard`, `LongShortCard`, `ProfitFactorCard` |
| `tables/` | `TradeTableReview`, `EditableInstrumentCell`, `TradeImageEditor` |
| `widgets/` | `SmartInsightsWidget`, `TradingScoreWidget`, `RiskMetricsWidget` |
| `root` | `WidgetCanvas`, `LazyWidget`, `WidgetRegistry`, `DashboardHeader`, `Navbar`, `PnlSummary`, `GlobalSyncButton` |

## ANTI-PATTERNS (THIS DIR)

- **Never** call `useDashboardTrades()` in components — causes global rerenders
- **Never** create local state that duplicates DataProvider state
- **Never** call server actions directly from components — use DataProvider actions
- **Never** skip `isRevalidating` markers around `refreshFromServer`

## IMPORT PIPELINE

```
Import Button → platform selector → file upload → processor → AI field mapping → validation → saveTradesAction
```

Each platform under `components/import/{platform}/` has: `actions.ts`, `processor.tsx`, `field-mapper.tsx`.

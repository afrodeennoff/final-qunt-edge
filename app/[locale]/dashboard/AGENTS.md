# app/[locale]/dashboard — Main Application Dashboard

> **Conventions**: See root `./AGENTS.md` + `./context/AGENTS.md` + `./lib/AGENTS.md`.

**Scope**: `app/[locale]/dashboard/`, `app/[locale]/dashboard/**/`

## OVERVIEW
Protected dashboard route family. Data flows through `DataProvider` (context/data-provider.tsx). 10 pages, 30+ subdirectories of components.

## PAGES

| Route | Entry | Notes |
|-------|-------|-------|
| `/dashboard` | `page.tsx` → `DashboardTabShell` | Tab routing (widgets/table/accounts/chart), cache-first hydration |
| `/dashboard/behavior` | `page.tsx` + `page-client.tsx` | AI chat, mindset journal, analysis |
| `/dashboard/billing` | `billing/page.tsx` | `BillingManagement` |
| `/dashboard/data` | `data/page.tsx` | Data management, account equity chart |
| `/dashboard/import` | `import/page.tsx` + `page-client.tsx` | Import entry point |
| `/dashboard/reports` | `reports/page.tsx` | Reports view |
| `/dashboard/settings` | `settings/page.tsx` | User settings |
| `/dashboard/strategies` | `strategies/page.tsx` | Strategies view |
| `/dashboard/trader-profile` | `page.tsx` + `page-client.tsx` | Profile, PnL calendar, trade feed |

## LAYOUT

`dashboard/layout.tsx`: `DashboardProviders` + `Navbar` + `UnifiedSidebar`.

## DATA FLOW

```
DataProvider (context/data-provider.tsx)
├── Cache-first hydration (localStorage/IndexedDB)
├── Server reconciliation (refreshFromServer)
├── Narrow slice hooks → context/providers/*-provider.tsx
└── Actions → server/trades.ts, server/accounts.ts, server/groups.ts
```

**Key hooks** (from `context/providers/`):
- `useDashboardIsMobile()` — mobile flag
- `useDashboardIsLoading()` — loading state
- `useDashboardIsSharedView()` — shared view flag
- `useDashboardTrades()` — **DO NOT USE** in components — use narrow selectors

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

## CONVENTIONS

- **Narrow selectors**: Use `useDashboardIsMobile()`, `useDashboardIsLoading()` — NOT broad context subscriptions
- **No `useDashboardTrades()`** in components — use narrow slice hooks
- **Memoization**: Heavy components wrapped with `React.memo` (charts, widgets, calendar)
- **Virtualization**: Trade table uses row-window virtualization for >100 rows
- **Skeleton loading**: Wrapped in `<Suspense>` with `DashboardSkeleton` fallback when `NEXT_PUBLIC_ENABLE_SKELETON_LOADING=true`

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

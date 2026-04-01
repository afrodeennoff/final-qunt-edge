# context Directory — React Context Providers & Dashboard State

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions (React, CSS, Testing).

**Scope**: `context/`, `context/providers/`

## OVERVIEW
React Context providers for dashboard state, sync contexts, and UI state. The `data-provider.tsx` is the monolithic central state hub. Slice providers under `context/providers/` are the migration target.

## CENTRAL PROVIDER

| File | Lines | Purpose |
|------|-------|---------|
| `data-provider.tsx` | 2219 | **Monolithic** — all dashboard state (trades, accounts, filters, stats, actions). See `context/providers/` for slice hooks. |

## SLICE PROVIDERS (Migration Target)

| File | Purpose |
|------|---------|
| `providers/data-state-provider.tsx` | Trades, accounts, filters, stats state slices |
| `providers/data-actions-provider.tsx` | Dashboard action slices |
| `providers/data-derived-provider.tsx` | Derived/computed state slices |
| `providers/actions-provider.tsx` | Action slices |
| `providers/derived-provider.tsx` | Derived slices |
| `providers/filters-provider.tsx` | Filter state slices |
| `providers/trades-provider.tsx` | Trades slices |
| `providers/ui-provider.tsx` | UI state: loading, revalidating, mobile, shared |
| `providers/ui-provider.tsx` | Narrow selectors: `useDashboardIsMobile()`, `useDashboardIsLoading()`, `useDashboardIsSharedView()` |

## LEGACY CONTEXTS

| File | Purpose |
|------|---------|
| `trades-context.tsx` | Legacy trade state (superseded by data-provider) |
| `filters-context.tsx` | Legacy filter state |
| `accounts-context.tsx` | Legacy account state |
| `theme-provider.tsx` | Theme (shadcn `ThemeProvider`) |
| `sync-context.tsx` | Generic sync context |

## SYNC CONTEXTS

| File | Purpose | Guard |
|------|---------|-------|
| `rithmic-sync-context.tsx` | Rithmic broker real-time sync | `useSyncContext()` |
| `tradovate-sync-context.tsx` | Tradovate broker real-time sync | `useSyncContext()` |

**Sync context guards**: `SyncContextProvider` is mounted unconditionally in `DashboardProviders`. Sync intervals:
- Auto-sync: 5 minutes (reduced from 1 minute)
- Visibility-aware: skips hidden-tab ticks
- `visibilitychange` handler triggers refresh on tab restore

## CONVENTIONS

- **Narrow selectors**: Use `useDashboardIsMobile()`, `useDashboardIsLoading()`, `useDashboardIsSharedView()` instead of broad context subscriptions
- **Data hydration**: Cache-first with `Promise.allSettled` for local cache reads; server reconciliation in `refreshFromServer`
- **No broad `useDashboardTrades()`**: Subscribers migrated to narrow slice hooks
- **`useData()`**: Compatibility facade — prefer slice hooks

## ANTI-PATTERNS (THIS DIR)

- **Never** call `useDashboardTrades()` in dashboard components — use narrow selectors
- **Never** mount `SyncContextProvider` conditionally — it throws outside provider
- **Never** skip `isRevalidating` markers around `refreshFromServer`

## DEPENDENCIES

- `server/trades.ts` — `getTradesAction`, `saveTradesAction`
- `server/accounts.ts` — Account operations
- `server/user-data.ts` — User data
- `lib/indexeddb/trades-cache.ts` — Browser cache
- `store/user-store.ts` — Zustand user store

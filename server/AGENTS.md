# server/ — Server-Side Business Logic


**Visual Redesign (2026-04-12):** Server code was NOT modified during the visual redesign. All changes were purely CSS/TSX visual class updates. No server actions, API routes, Prisma queries, or data flow was altered.
**Parent:** [Root AGENTS.md](../AGENTS.md)

## OVERVIEW

32 files. All server-side read helpers, mutations, auth, billing, and broker integrations. Uses `use cache` with `cacheLife`/`cacheTag` for reads, `updateTag()` for invalidation on writes.

## STRUCTURE

```
server/
├── imports/                    # Broker sync actions
│   ├── rithmic-sync-actions.ts    # Rithmic sync config CRUD
│   └── tradovate-actions.ts       # Tradovate OAuth + sync (1633 lines)
├── user-data.ts               # Multi-layer cached user data aggregation
├── prop-firms.ts              # Prop firm catalogue (cached)
├── deals.ts                   # Deals/coupons aggregation (cached)
├── shared.ts                  # Shared dashboard view management
├── trades.ts                  # Trade CRUD + cache invalidation
├── accounts.ts                # Account management + metrics
├── optimized-trades.ts        # Raw SQL trade queries for performance
├── equity-chart.ts            # Equity chart data aggregation
├── layouts.ts                 # Dashboard layout persistence + versioning
├── groups.ts                  # Trade grouping
├── tags.ts                    # Tag management + sync
├── journal.ts                 # Mood/journal entries
├── auth.ts                    # Authentication logic (Supabase)
├── authz.ts                   # Authorization (requireUser, requireAdmin, requireServiceAuth)
├── billing.ts                 # Billing operations
├── subscription.ts            # Subscription status
├── subscription-manager.ts    # Subscription lifecycle
├── webhook-service.ts         # Whop payment webhook processing (1255 lines)
├── payment-service.ts         # Payment processing
├── payment-security.ts        # Payment security utilities
├── teams.ts                   # Team management
├── team-membership.ts         # Team membership resolution
├── firm-reviews.ts            # Prop firm reviews CRUD
├── firm-coupons.ts            # Firm coupon queries
├── referral.ts                # Referral tracking
├── user-profile.ts            # User profile management
├── storage.ts                 # Supabase storage operations
├── financial-events.ts        # Global financial calendar events
├── tick-details.ts            # Tick/contract details
├── thor.ts                    # Thor token management
├── whop-env-check.ts          # Whop environment validation
└── database.ts                # Re-exports (trades, layouts, groups)
```

## WHERE TO LOOK

| Task | File | Key Function |
|------|------|-------------|
| Get user data (cached) | `user-data.ts` | `getCoreUserDataCached()`, `getSupplementalUserDataCached()` |
| List prop firms (cached) | `prop-firms.ts` | `listPropFirmsCached()`, `getPropFirmBySlugCached()` |
| Get deals (cached) | `deals.ts` | `getActiveDealsCached()`, `getUnifiedFirmsCached()` |
| Trade mutations | `trades.ts` | `saveTradesAction()`, `deleteTradesByIdsAction()` |
| Account mutations | `accounts.ts` | `setupAccountAction()`, `calculateAccountMetricsAction()` |
| Layout persistence | `layouts.ts` | `saveDashboardLayoutAction()`, `createLayoutVersionAction()` |
| Auth checks | `authz.ts` | `requireUser()`, `requireAdmin()`, `requireServiceAuth()`, `requireCronAuth()` |
| Payment webhooks | `webhook-service.ts` | Whop event processing |
| Tradovate sync | `imports/tradovate-actions.ts` | `initiateTradovateOAuth()`, `getTradovateTrades()` |
| Rithmic sync | `imports/rithmic-sync-actions.ts` | `getRithmicSynchronizations()`, `setRithmicSynchronization()` |

## CACHE PATTERNS

### Read Pattern (use cache)
```typescript
async function getDataCached(id: string) {
  'use cache'
  cacheLife('stale: 3600 revalidate: 3600 expire: 7200')
  cacheTag(`data-${id}`, 'data-list')
  // ... Prisma query
}
```

### Write Pattern (invalidate)
```typescript
async function mutateData(id: string) {
  // ... Prisma mutation
  await updateTag(`data-${id}`)
  await updateTag('data-list')
}
```

### Cache Tags Reference

| Tag Pattern | Used By | Invalidated By |
|-------------|---------|---------------|
| `user-data-core-{userId}` | `getCoreUserDataCached` | User mutations |
| `user-data-supplemental-{userId}` | `getSupplementalUserDataCached` | Account/trade mutations |
| `USER_DATA({userId})` | Multiple user queries | All user data mutations |
| `DASHBOARD_LAYOUT({userId})` | `getDashboardLayoutCached` | Layout save actions |
| `prop-firms` | `listPropFirmsCached` | Admin firm mutations |
| `prop-firm-{slug}` | `getPropFirmBySlugCached` | Admin firm mutations |
| `deals` | `getActiveDealsCached` | Deal/coupon mutations |
| `shared-view-{slug}` | `getSharedCached` | Shared view mutations |
| `trades-{userId}` | Trade queries | Trade mutations |
| `global-tick-details` | `getGlobalTickDetailsCached` | Cron data computation |
| `global-financial-events-{locale}` | `getGlobalFinancialEventsCached` | Cron investing |

## CONVENTIONS

- **Action suffix**: Mutations use `*Action()` naming (e.g., `saveTradesAction`, `deleteAccountAction`)
- **Fallback pattern**: When DB unavailable, return explicit empty state — never synthesize fake data
- **Auth in handlers**: API routes must call `requireUser()` or equivalent — don't rely only on middleware
- **Admin client initialization**: Always create Supabase admin client inside each function, not at module scope
- **Cache tag namespace**: Use `CACHE_TAGS` constants from cache utilities

## ANTI-PATTERNS

- **Do not** synthesize fallback financial metrics when DB is unavailable
- **Do not** initialize Supabase admin client at module scope
- **Do not** use `unstable_cache` — use `use cache` directive
- **Do not** forget `updateTag()` after mutations — stale cache = incorrect UI
- **Do not** bypass auth checks in API routes even if middleware classifies routes

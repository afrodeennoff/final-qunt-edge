# Server Directory — Business Logic & Server Actions

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions (imports, TypeScript, React, Server Actions, CSS, Testing).

**Scope**: `server/*.ts`, `server/imports/*.ts`

## OVERVIEW
Server-side business logic layer. Contains Prisma-backed server actions, auth, trade operations, team management, billing, and broker integrations. All exports are server-only (consumed by API routes or client server actions).

## KEY FILES

| File | Purpose | Auth |
|------|---------|------|
| `auth.ts` | Supabase SSR auth, session management, password validation | `getDatabaseUserId()` |
| `authz.ts` | Admin access assertions | `assertAdminAccess()` |
| `trades.ts` | Trade CRUD, import, normalization, batch save | actor-bound |
| `accounts.ts` | Account CRUD, groups, balances | user-scoped |
| `groups.ts` | Trade/account grouping | user-scoped |
| `tags.ts` | Tag management | user-scoped |
| `journal.ts` | Trading journal (mindset/mood) | user-scoped |
| `layouts.ts` | Dashboard layout persistence | user-scoped |
| `teams.ts` | Team CRUD, analytics, VaR | team-aware |
| `subscription.ts` | Subscription management | user-scoped |
| `billing.ts` | Billing operations | user-scoped |
| `shared.ts` | Shared view/link management | owner-scoped |
| `user-data.ts` | User preferences/settings | user-scoped |
| `thor.ts` | THOR broker import | user-scoped |
| `webhook-service.ts` | Whop/Stripe webhook handling | signature-validated |
| `referral.ts` | Referral system | user-scoped |
| `storage.ts` | Supabase Storage operations | user-scoped |
| `imports/rithmic-sync-actions.ts` | Rithmic broker sync | credential-scoped |
| `imports/tradovate-actions.ts` | Tradovate broker sync | credential-scoped |

## CONVENTIONS

### Auth Resolution
- **Always** use `getDatabaseUserId()` (from `server/auth.ts`) for authenticated identity
- **Never** trust `x-user-id` or `x-user-email` headers
- **Never** use caller-provided userId for ownership writes

### Error Handling
- Use `apiError()` from `lib/api-utils.ts` for consistent error contracts
- Error shape: `{ error: { code, message, details? } }`

### Cache Invalidation
- Use `updateTag()` from `next/cache` for user-scoped invalidation:
  ```typescript
  import { updateTag } from 'next/cache'
  updateTag(`trades-${userId}`)
  updateTag(`user-data-${userId}`)
  updateTag(`dashboard-${userId}`)
  ```

### Trade Mutations
- `saveTradesAction(...)` is actor-bound — ignores caller override
- `saveTradesForUserAction(...)` is explicit for trusted token-auth import routes
- Batch mutations use `TRADE_UPDATE_BATCH_SIZE = 100` with bounded `$transaction`

### Team Access
- `canAccessTrader(requestUserId, traderId)` checks: self, team owner, teammate, manager
- VaR summaries gated by `getTraderVarSummary` with auth guard

## ANTI-PATTERNS (THIS DIR)

- **Never** fall back to in-memory rate limiting in production — must fail closed
- **Never** pass `userId` from client into ownership writes without server-side validation
- **Never** use `console.log` — use `logger` from `lib/logger.ts`

## DEPENDENCIES

- `lib/prisma.ts` — Prisma singleton with pool management
- `lib/supabase/route-client.ts` — Supabase admin client for service-role operations
- `lib/rate-limit.ts` — Redis-backed rate limiting
- `lib/api-utils.ts` — `apiError()`, `apiSuccess()` helpers
- `lib/logger.ts` — Centralized logging

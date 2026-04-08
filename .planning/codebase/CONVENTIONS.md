# Coding Conventions

**Analysis Date:** 2026-04-08

## Naming Patterns

**Files:**
- kebab-case for all source files: `trade-image-editor.tsx`, `api-response.ts`, `date-utils.ts`
- `route.ts` for Next.js API route handlers
- `page.tsx` for Next.js pages
- `layout.tsx` for Next.js layouts
- `error.tsx` / `global-error.tsx` for Next.js error boundaries
- `schema.prisma` for Prisma schema
- Test files: `*.test.ts` or `*.test.tsx` co-located or in `tests/` directory
- E2E test files: `*.spec.ts` in `tests/e2e/`

**Functions:**
- camelCase: `calculateStatistics`, `normalizeToUtcTimestamp`, `sanitizeHtml`, `getTrustedClientIp`
- `use*` prefix for React hooks: `useDebounce`, `useMediaQuery`, `useAutoScroll`
- `create*` prefix for factory functions: `createSecureSlug`, `createRouteClient`, `createLogger`
- `is*` / `has*` / `should*` for boolean-returning functions: `isChronologicalRange`, `isRedisConfigured`, `shouldShowOptimizations`
- `validate*` for validation functions: `validateTradeData`, `validateAccountNumber`

**Variables:**
- camelCase: `connectionString`, `poolMax`, `errorAlertThreshold`
- UPPER_SNAKE_CASE for constants: `MAX_POOL_LIMIT`, `DB_POOL_WARN_COOLDOWN_MS`, `LOG_LEVEL`, `SENSITIVE_KEYS`
- UPPER_SNAKE_CASE for enum-like objects used as frozen config: `FEATURE_FLAGS`
- `_` prefix unused/destructured variables: `_target` (not widely observed, used occasionally)

**Types:**
- PascalCase for interfaces/types: `TradeError`, `LoggerContext`, `LogEntry`, `SubscriptionData`, `DashboardLayoutWithWidgets`
- PascalCase for type aliases of primitives: `HeaderCarrier`, `AppEnv`
- `*Props` suffix for component prop types (implicit in Next.js params)
- `*Store` suffix for Zustand store types: `UserStore`, `ChatState`

**Components:**
- PascalCase filenames matching component name: `ErrorBoundary`, `ScrollLockFixLazy`, `ThemeSwitcher`
- kebab-case filenames for multi-word components in `components/`: `consent-banner.tsx`, `country-filter.tsx`, `export-button.tsx`, `linked-accounts.tsx`, `mobile-bottom-nav.tsx`
- shadcn/ui components in `components/ui/` use kebab-case: `alert-dialog.tsx`, `drop-zone.tsx`, `glass-card.tsx`

## Code Style

**Formatting:**
- Prettier with configuration at `.prettierrc`:
  - No semicolons (`"semi": false`)
  - Single quotes (`"singleQuote": true`)
  - Trailing commas everywhere (`"trailingComma": "all"`)
  - 100 character print width (`"printWidth": 100`)
  - 2-space indentation (`"tabWidth": 2`)
  - No tabs (`"useTabs": false`)
  - Bracket spacing enabled (`"bracketSpacing": true`)
  - Always parenthesize arrow function params (`"arrowParens": "always"`)

**Linting:**
- ESLint 9.x with flat config at `eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Key enforced rules:
  - `@typescript-eslint/no-explicit-any`: `error` -- `any` is banned
  - `no-console`: `error` (only `console.warn` and `console.error` allowed) -- scripts and e2e tests are exempted
  - `@typescript-eslint/ban-ts-comment`: `error`
  - `complexity`: `warn` at threshold 10
  - `prefer-const`: `warn`
  - `no-var`: `warn`
  - React hooks rules: `react-hooks/rules-of-hooks: warn`, `react-hooks/set-state-in-effect: warn`
- Lint command: `npm run lint` (runs `eslint`)

**TypeScript:**
- Config at `tsconfig.json`
- `"strict": true` -- full strict mode enabled
- Target: `ES2017`, Module: `esnext`, ModuleResolution: `bundler`
- `jsx: "react-jsx"`
- `incremental: false`
- Certain files are excluded from compilation: sidebar tests, e2e tests, some performance files

## Import Organization

**Order (observed pattern):**
1. External/third-party packages: `import { NextResponse } from 'next/server'`
2. Internal aliases: `import { prisma } from '@/lib/prisma'`, `import { logger } from '@/lib/logger'`
3. Relative imports: `import { something } from './local-module'`

**Path Aliases:**
- `@/*` maps to `./*` (project root) -- the universal alias
- `@lib/*` maps to `./lib/*` -- alternative lib alias (less used)
- Configured in both `tsconfig.json` (`compilerOptions.paths`) and vitest configs (`resolve.alias`)

**Import Examples:**
```typescript
// External
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAfter } from 'date-fns'

// Internal via @/
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { apiError } from '@/lib/api-response'
import { rateLimit } from '@/lib/rate-limit'
import { cn } from '@/lib/utils'
```

**Named Exports Preferred:**
- Most modules export named functions: `export function sanitizeHtml(...)`, `export const useUserStore = ...`
- Default exports used for: Next.js pages (`export default function Page()`), error boundaries, the logger (`export default logger`), React components in `app/`

## Error Handling

**API Routes:**
- All API errors use `apiError()` from `@/lib/api-response`:
```typescript
import { apiError } from '@/lib/api-response'
return apiError('BAD_REQUEST', 'Bad payload', 400, { reason: 'malformed' })
```
- Response shape: `{ error: { code: string, message: string, details?: unknown } }`
- Error codes are typed via `ApiErrorCode`: `'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'VALIDATION_FAILED' | 'INTERNAL_ERROR'`
- API routes wrap handler bodies in try/catch, returning `apiError('INTERNAL_ERROR', ...)` on unhandled exceptions

**Rate Limit Errors:**
- `createRateLimitResponse()` from `@/lib/rate-limit` returns 429 with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` headers

**Server Actions:**
- Server actions in `server/` throw descriptive `Error` objects: `throw new Error('Failed to share trades: Start date is required')`
- Custom error classes used for domain errors: `class PostAuthSetupError extends Error`

**Auth Errors:**
- `handleAuthError()` in `@/server/auth` detects JSON parsing failures (Supabase returning HTML) and re-throws with a user-friendly message

**Prisma Errors:**
- Prisma unique constraint violations (code `P2002`) are caught and retried: see `createShared()` in `@/server/shared`
- When no database is configured, a proxy object is exported that throws on any access with a descriptive message about missing env vars

**Client-Side Errors:**
- `ErrorBoundary` class component in `@/components/error-boundary.tsx` catches render errors with `getDerivedStateFromError`
- Next.js `error.tsx` pages at `app/error.tsx` and `app/[locale]/dashboard/error.tsx` provide reset functionality

**Logging on Error:**
- Always use `logger.error()` from `@/lib/logger` -- never `console.error()` in application code (enforced by ESLint in non-script files)
- `logger.error()` automatically redacts sensitive keys and adds correlation IDs

## Logging

**Framework:** Custom logger at `@/lib/logger.ts` (not pino directly in app code -- pino is a dependency but the custom logger wraps structured JSON output)

**Core API:**
```typescript
import { logger } from '@/lib/logger'
logger.debug('message', { meta })
logger.info('message', { meta })
logger.warn('message', { meta })
logger.error('message', { meta })
```

**Child Loggers (scoped):**
```typescript
const log = createLogger('module-name')  // or logger.child({ name: 'module-name' })
log.info('event', { data })
```

**Context Propagation:**
```typescript
import { withLogContext } from '@/lib/logger'
const result = withLogContext({ route: '/api/trades', method: 'POST' }, () => {
  // all logger calls here include the context automatically
})
```

**Behavior:**
- Production: structured JSON to stdout (`{"level":"error","message":"...","timestamp":"..."}`)
- Development: human-readable format with timestamps
- Automatic redaction of sensitive keys (token, secret, password, authorization, apiKey, etc.)
- Auto-generates `requestId` / `correlationId` if not provided
- Error alerting: fires a `[Monitoring] Error threshold reached` warning when >20 same-key errors occur within a 5-minute window
- Log level controlled by `LOG_LEVEL` env var (default: `"info"`)
- `console.error` / `console.warn` allowed in scripts and e2e tests (ESLint override); banned in app code

## Comments

**JSDoc/TSDoc:**
- Used on exported utility functions and complex logic: `/** HTML Sanitization Utilities */`
- Used on public API surfaces like `apiError()`, `logger.child()`, `rateLimit()`
- Multi-line JSDoc blocks for complex modules (e.g., `@/lib/logger.ts`, `@/lib/feature-flags.ts`)

**Inline Comments:**
- Used to explain non-obvious logic: `// Emergency rollback overrides everything`, `// Session mode (5432) can hit "max clients reached" in serverless bursts`
- Used to document configuration decisions in `@/lib/prisma.ts`

**Section Markers:**
- Not commonly used -- code is organized by function grouping rather than comment dividers

**TODO/FIXME:**
- Present but not pervasive; found occasionally in source and server code

## Function Design

**Size:** No strict limits enforced. Complexity rule warns at 10. Functions tend to be focused (single responsibility) but larger orchestration functions exist in server actions.

**Parameters:**
- Options objects for functions with multiple parameters:
```typescript
export function rateLimit({ limit = 100, window = 60000, identifier = '' }: {
  limit?: number; window?: number; identifier?: string
} = {}) { ... }
```
- Destructured parameter objects common in API handlers

**Return Values:**
- API handlers return `NextResponse.json()` or the result of `apiError()`
- Server actions return typed data or throw
- Utility functions return typed results: `Date | null`, `string`, `boolean`
- Cache helpers return `void` (side-effect functions)

## Module Design

**Exports:**
- Named exports preferred: `export function sanitizeHtml`, `export const FEATURE_FLAGS`
- Default exports for: pages, error boundaries, the logger instance
- Re-exports used for type forwarding: `export type { Widget } from "@/app/[locale]/dashboard/types/dashboard"`

**Barrel Files:**
- `@/components/ui/index.ts` exists as a barrel for UI components
- Not widely used elsewhere -- most imports are direct module references

**Server-Only Modules:**
- `import 'server-only'` used in `@/lib/redis-client.ts` and server modules to prevent client bundling
- Server actions in `server/` marked with `'use server'` directive

## Component Patterns

**Next.js App Router:**
- Pages: `app/[locale]/dashboard/page.tsx`
- Layouts: `app/layout.tsx` (root), `app/[locale]/dashboard/layout.tsx`
- API Routes: `app/api/deals/unified/route.ts`, `app/api/ai/chat/route.ts`
- Route groups: `app/api/_utils/`, `app/api/_auth/` (prefix `_` for non-route modules)

**UI Components (shadcn/ui):**
- Located in `@/components/ui/`
- Config at `components.json`: style `new-york`, RSC enabled, Tailwind CSS variables, `lucide` icons
- Extensive custom additions beyond standard shadcn: `glass-card.tsx`, `chart-surface.tsx`, `micro-interactions.tsx`, `optimized-input.tsx`, `mood-tracker.tsx`

**Styling:**
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin
- CSS variables for theming (HSL-based: `hsl(var(--primary))`, etc.)
- Custom `cn()` utility at `@/lib/utils.ts` combining `clsx` + `tailwind-merge`
- Dark mode via `class` strategy (`next-themes`)
- Custom fluid typography tokens (`fluid-xs` through `fluid-9xl`)
- Custom color tokens: `matte`, `precision`, `semantic-success/warning/error/info`

**Client Components:**
- Explicitly marked with `'use client'` directive
- Client components in `@/components/` and `@/hooks/`
- Interactive components (forms, menus, editors) are client components

## State Management

**Zustand Stores:**
- Located in `@/store/`
- Naming: `use-*-store.ts` (e.g., `user-store.ts`, `chat-store.ts`, `analysis-store.ts`)
- Pattern: `create<Name>Store` using `zustand` with optional `persist` middleware:
```typescript
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({ ... }),
    { name: 'user-store', storage: createJSONStorage(() => localStorage) }
  )
)
```
- Simpler stores without persistence: `useChatStore` (no localStorage)

**React Query:**
- `@tanstack/react-query` used for server state fetching (observed in dependencies, patterns in API route tests)

**Next.js Cache:**
- `cacheTag` / `updateTag` from `next/cache` for ISR and on-demand revalidation
- Custom cache invalidation helpers in `@/lib/cache/cache-invalidation.ts`
- Redis-backed caching in `@/lib/redis-client.ts` with in-memory fallback

## Validation Patterns

**Zod Schemas:**
- Primary validation library: `zod` (v4, imported as `zod/v3` in some AI routes)
- Shared schemas at `@/lib/validation-schemas.ts`: `tradeSchema`, `propfirmSchema`, `teamInviteSchema`, `webhookValidationSchema`
- Per-route validation inline in server files: e.g., `importTradeSchema` in `@/server/trades.ts`
- `safeParse()` for non-throwing validation: `validateTradeData(data)` returns result
- Env validation at `@/lib/env.ts` with `z.object()` and `assertRequiredEnv()`

## API Response Patterns

**Success Responses:**
```typescript
return NextResponse.json({ firms: [...], pagination: { total: 100 } })
```

**Error Responses:**
```typescript
return apiError('BAD_REQUEST', 'message', 400, { details })
// Response body: { error: { code: 'BAD_REQUEST', message: 'message', details: { ... } } }
```

**Rate-Limited Responses:**
- 429 status with `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` headers

**Cache Headers:**
- `apiError()` automatically sets `Cache-Control: no-store, max-age=0`

## Database Query Patterns

**Prisma ORM:**
- Generated client at `@/prisma/generated/prisma` (not `@prisma/client`)
- Singleton pattern via globalThis to survive HMR in development
- PostgreSQL driver via `@prisma/adapter-pg` with `pg.Pool`
- Connection pooling with configurable `PG_POOL_MAX` / `PG_POOL_MIN`
- Auto-switches Supabase pooler from session mode (5432) to transaction mode (6543)

**Query Patterns:**
- Server actions in `@/server/` perform all database operations
- `prisma.*.create()`, `prisma.*.findMany()`, `prisma.*.update()`, `prisma.*.delete()`
- Prisma middleware/guard at `@/lib/prisma-guard.ts` for access control

## Commit Conventions

**Format (observed from git log):**
- `fix: description` -- bug fixes
- `refactor(scope): description` -- refactoring
- `feat(scope): description` -- new features
- `chore(scope): description` -- maintenance tasks
- `ai` -- AI-assisted commits (unconventional but used)

**Scope Examples:**
- `refactor(landing): apply frost styling to Navbar`
- `refactor(home): apply frost styling to FAQSection`
- `fix(sidebar): remove Math.random from useMemo`
- `fix: useI18n from locales/client instead of useTranslation`
- `chore(sidebar): remove unused eslint-disable directives`

**Style:** Conventional Commits with optional scope in parentheses. Lowercase description after colon. No period at end.

## Internationalization (i18n)

- `next-international` for translations
- Locale prefix in routes: `app/[locale]/...`
- `useI18n` from `@/locales/client` for client components
- Translation keys as string literals with type safety

---

*Convention analysis: 2026-04-08*

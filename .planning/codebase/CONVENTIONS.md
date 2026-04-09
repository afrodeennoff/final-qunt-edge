# Coding Conventions

**Analysis Date:** 2026-04-09

## Naming Patterns

**Files:**
- kebab-case for all files: `date-utils.ts`, `api-response.ts`, `api-auth.ts`, `rate-limit.ts`
- Component files: kebab-case single-word or hyphenated: `button.tsx`, `glass-card.tsx`, `dropzone.tsx`, `column-config-dialog.tsx`
- Hook files: kebab-case with `use-` prefix: `use-debounce.ts`, `use-media-query.ts`, `use-auto-scroll.ts`, `use-keyboard-shortcuts.ts`
- Server action files: kebab-case single-word or hyphenated in `server/`: `trades.ts`, `accounts.ts`, `payment-service.ts`, `team-membership.ts`
- Store files: kebab-case with `-store` suffix: `user-store.ts`, `chat-store.ts`, `modal-state-store.ts`
- Test files: kebab-case with `.test.ts` or `.test.tsx` suffix: `api-response.test.ts`, `password-validation.test.ts`, `error-boundaries.test.tsx`

**Functions:**
- camelCase for all functions: `calculateStatistics`, `formatTimestamp`, `generateTradeHash`, `normalizeToUtcTimestamp`
- Predicate functions prefixed with `is` or `has`: `isSharedAccessible`, `isChronologicalRange`, `isFeatureEnabled`, `isPrerenderInterruption`
- Validation functions prefixed with `validate`: `validateTradeData`, `validateAccountNumber`, `validatePasswordStrength`
- Factory/creator functions prefixed with `create`: `createLogger`, `createJSONStorage`
- Event handlers prefixed with `handle` in components (React convention)

**Variables:**
- camelCase for all variables: `debouncedValue`, `cumulativePnl`, `totalTradingDays`
- UPPER_SNAKE_CASE for compile-time constants: `PASSWORD_MIN_LENGTH`, `FEATURE_FLAGS`, `SENSITIVE_KEYS`, `TOKEN_EXPIRY_MS`
- UPPER_SNAKE_CASE for enum-like const objects: `VALID_SORT_FIELDS`, `TRADE_PAGE_CACHE_LIFETIME`

**Types:**
- PascalCase for interfaces and types: `StatisticsProps`, `CalendarData`, `DateRange`, `UserStore`
- PascalCase for type aliases: `ApiErrorCode`, `SecureTokenType`, `AiErrorResponse`, `LogLevel`
- `T` prefix for generic type parameters: `<T>`, `<T extends Record<string, unknown>>`

## Code Style

**Formatting:**
- No Prettier configuration file present; formatting relies on ESLint rules and editor defaults
- Tailwind CSS v4 used via `@tailwindcss/postcss` (no PostCSS plugin config file)
- Consistent single quotes in most files, double quotes in some component files (mixed but both accepted by ESLint)
- Semicolons used consistently throughout

**Linting:**
- Tool: ESLint v9 with flat config (`eslint.config.mjs`)
- Base configs: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- Plugins: `eslint-plugin-react`, `eslint-plugin-react-hooks`
- Key rules:
  - `@typescript-eslint/no-explicit-any`: `"error"` -- `any` is forbidden
  - `no-console`: `"error"` (with `allow: ["warn", "error"]`) -- no `console.log` in production code
  - `complexity`: `["warn", 10]` -- cyclomatic complexity warning at 10
  - `prefer-const`: `"warn"` -- prefer const over let
  - `no-var`: `"warn"` -- no var declarations
  - `react-hooks/rules-of-hooks`: `"warn"` -- enforce hooks rules
  - `react-hooks/set-state-in-effect`: `"warn"` -- Next.js 19 setState in effect rule
  - `@typescript-eslint/no-require-imports`: `"warn"` -- use ESM imports
  - `@typescript-eslint/ban-ts-comment`: `"error"` -- no `@ts-ignore`
- Override: `no-console` is `"off"` for `scripts/`, `tests/e2e/`, and standalone check files

**TypeScript:**
- Strict mode enabled: `"strict": true` in `tsconfig.json`
- Target: ES2017
- Module: esnext with bundler resolution
- Incremental compilation disabled: `"incremental": false`

## Import Organization

**Order (observed pattern):**
1. Node.js / built-in modules: `import crypto from 'crypto'`, `import { z } from 'zod'`
2. Third-party packages: `import Decimal from 'decimal.js'`, `import { format } from 'date-fns'`
3. Internal `@/` aliased imports: `import { prisma } from '@/lib/prisma'`, `import { logger } from '@/lib/logger'`
4. Relative imports: `import { requireDealsApiAuth } from './_auth'`

**Path Aliases (from `tsconfig.json`):**
- `@/*` maps to project root: `@/lib/utils`, `@/components/ui/button`, `@/server/trades`
- `@lib/*` maps to `./lib/*`: `@lib/formatting/currency`

**shadcn/ui aliases (from `components.json`):**
- `@/components` -- component directory
- `@/components/ui` -- UI primitives
- `@/lib` -- utility library
- `@/lib/utils` -- utility functions
- `@/hooks` -- custom hooks

**Import style:**
- Named imports preferred: `import { describe, expect, it } from 'vitest'`
- Default imports used for modules: `import { create } from 'zustand'`, `import Decimal from 'decimal.js'`
- Type-only imports used where appropriate: `import type { Metadata } from 'next'`

## Component Patterns

**Functional Components Only:**
- All components are functional; no class components
- React 19.2 with Next.js 16 App Router

**Props:**
- Interface-based props with `PascalCase + Props` suffix: `ButtonProps`, `UiProviderState`
- Props destructured in function signature: `({ className, variant, size, children, ...props })`
- Spread props pattern for passthrough: `...props` used in buttons, inputs, cards
- `React.forwardRef` used for UI primitives that need ref forwarding (e.g., `Button`)

**Exports:**
- Named exports preferred for components: `export function useDebounce`, `export function cn`
- Named export + `displayName` for forwardRef components: `Button.displayName = "Button"`
- Barrel files (`index.ts`) in `components/ui/` re-export everything
- Default exports used for pages: `export default async function DashboardPage`

**Variants (CVA):**
- `class-variance-authority` (CVA) used for component variants: `buttonVariants`, `badgeVariants`
- Pattern: `const variants = cva(baseClasses, { variants: { ... }, defaultVariants: { ... } })`

**Loading States:**
- `isLoading` prop pattern with `Loader2` spinner: `{isLoading && <Loader2 className="size-4 animate-spin" />}`
- Skeleton components from shadcn for loading placeholders
- `Suspense` boundaries in layout files

**Composition:**
- `asChild` pattern via Radix `Slot` for polymorphic rendering
- Compound component pattern: `Card`, `CardHeader`, `CardContent`, `CardFooter`

## Hook Patterns

**Naming:**
- All custom hooks prefixed with `use`: `useDebounce`, `useIsMobile`, `useAutoScroll`, `useCurrency`
- Files named with kebab-case matching hook name: `use-debounce.ts`

**Composition:**
- Hooks compose React primitives: `useState`, `useEffect`, `useCallback`
- No custom hook wrappers around other custom hooks observed

**Return Values:**
- Single value returns: `useDebounce<T>(value, delay): T`
- Object returns for complex state: `useIsMobile()` returns `boolean`
- Provider-style returns: `useUiProvider(): UiProviderState` (aggregates multiple hooks)

**File Extension:**
- `.ts` for pure logic hooks: `use-debounce.ts`, `use-media-query.ts`
- `.tsx` for hooks that use JSX or React context: `use-mobile.tsx`, `use-navigation-loading.tsx`

## Type Patterns

**Interface vs Type:**
- Both used; `interface` for object shapes, `type` for unions/aliases
- `interface` for props and data shapes: `interface ButtonProps`, `interface DateRange`
- `type` for unions, maps, and computed types: `type SortField`, `type LogLevel`, `type SubscriptionData`

**Generics:**
- Used in utility functions: `function useDebounce<T>(value: T, delay: number): T`
- Used in store types: `createJSONStorage(() => localStorage)`
- Type parameter `T` convention

**Type Organization:**
- Domain types in `lib/data-types.ts`: `Trade`, `Account`, `Group`, `StatisticsProps`
- Error code types co-located with error helpers: `ApiErrorCode` in `lib/api-response.ts`, `AiErrorCode` in `lib/ai/errors.ts`
- Zod schemas used for runtime validation in `lib/validation-schemas.ts` and inline in server files
- Prisma-generated types imported from `@/prisma/generated/prisma`
- Local type aliases to simplify Prisma types: `type SubscriptionData = { ... } | null`

**Zod Validation:**
- Zod v4 used throughout for input validation
- Schema defined with `z.object()` and exported as `const`
- Safe parse pattern: `schema.safeParse(data)` returns `{ success, data, error }`
- Error handling: `if (error instanceof z.ZodError) { ... }`

## Error Conventions

**API Error Shape:**
- Consistent envelope: `{ error: { code, message, details? } }`
- Generic helper: `apiError(code, message, status, details?)` in `lib/api-response.ts`
- AI-specific helpers: `aiError(status, code, message, details?)` in `lib/ai/errors.ts`
- All error responses include `Cache-Control: no-store, max-age=0` header

**Error Code Types:**
- Generic: `'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'RATE_LIMITED' | 'VALIDATION_FAILED' | 'INTERNAL_ERROR'`
- AI-specific: adds `'BUDGET_EXCEEDED' | 'PROMPT_REJECTED' | 'SERVICE_UNAVAILABLE'`

**Error Handling in API Routes:**
- `try/catch` wrapping the entire handler
- Zod validation errors caught and returned as 400 with `{ issues: validationError.issues }`
- Next.js prerender interruption check: `isPrerenderInterruption(error)` returns graceful fallback
- Logger used for server-side errors: `logger.error('[api/deals] Error fetching active deals:', error)`

**Error Handling in Server Actions:**
- Zod schema validation at entry point
- Typed error unions: `type TradeError = 'DUPLICATE_TRADES' | 'NO_TRADES_ADDDED'`
- Cache invalidation on errors

**Sensitive Data Redaction:**
- Logger automatically redacts keys matching: `token`, `accessToken`, `password`, `secret`, `apiKey`
- Pattern-based redaction for any key matching `/token|secret|password|authorization/i`
- Redacted values show first 2 and last 2 chars: `ab***cd`

## API Conventions

**Route Organization:**
- Next.js App Router: `app/api/[resource]/route.ts`
- Sub-resources: `app/api/deals/firms/route.ts`, `app/api/deals/unified/route.ts`
- Auth helpers: `app/api/deals/_auth.ts` (underscore-prefixed for non-route modules)
- Shared utilities: `app/api/_utils/` directory

**HTTP Methods:**
- Named exports matching HTTP methods: `export async function GET(request: Request)`
- No special file naming for methods (Next.js App Router convention)

**Request Validation:**
- Zod schemas for query params: `z.object({ search: z.string().optional(), ... })`
- Parsed from URL search params: `dealsQuerySchema.parse(Object.fromEntries(searchParams.entries()))`
- Body validation in POST/PUT routes with Zod

**Response Shape:**
- Success: `NextResponse.json({ deals, pagination: { total, limit, offset, hasMore } })`
- Error: `apiError('CODE', 'message', statusCode, details)` returns `{ error: { code, message, details? } }`

**Server Actions:**
- Marked with `'use server'` directive at top of file
- Located in `server/` directory (e.g., `server/trades.ts`, `server/accounts.ts`)
- Use Next.js cache helpers: `cacheLife()`, `cacheTag()`, `updateTag()`
- Authentication via `getUserId()` or `getDatabaseUserId()` helpers

**Authentication:**
- Supabase Auth for user authentication
- `requireDealsApiAuth(request)` pattern for API route auth guards
- Secure token generation for external integrations: `generateSecureToken()`, `verifySecureToken()`

## CSS/Styling Conventions

**Tailwind CSS v4:**
- Configured via `tailwind.config.ts` with extensive customization
- PostCSS plugin: `@tailwindcss/postcss`
- CSS-first configuration with `@config` directive in `app/globals.css`
- `@source` directives to include all component directories

**Theme System:**
- Dark-first design (dark mode as default)
- Class-based dark mode: `darkMode: "class"` and `@custom-variant dark (&:is(.dark *))`
- Color tokens defined as CSS custom properties in `:root` and `.dark` blocks
- Uses oklch color space for base tokens: `--primary: oklch(0.55 0.22 264)`
- Extended tokens in `styles/tokens.css` (marketing, glass, spacing, semantic)

**Token Hierarchy:**
- Base tokens in `app/globals.css`: `--background`, `--foreground`, `--primary`, `--card`, etc.
- Extended tokens in `styles/tokens.css`: `--bg-base`, `--bg-elevated`, `--glass-bg`, `--semantic-success`
- Tailwind utility tokens in `tailwind.config.ts`: maps CSS vars to Tailwind classes
- v2 tokens (newer design system): `--v2-accent`, `--v2-bg-base`, `--v2-text-primary`

**Class Naming:**
- `cn()` utility from `lib/utils.ts` using `clsx` + `tailwind-merge`
- Component class composition: `cn(buttonVariants({ variant, size, className }))`
- Utility token classes: `bg-base`, `bg-elevated`, `text-fg-primary`, `glass`, `glass-strong`
- Spacing tokens: `var(--space-1)` through `var(--space-12)` (4px rhythm)

**Custom Utility Layers:**
- `@layer utilities` for custom utility classes
- `@layer base` for global resets and base styles
- Custom keyframe animations in `tailwind.config.ts` and inline in CSS files

**Component Styling:**
- Inline Tailwind classes on components (no separate CSS modules)
- CVA (class-variance-authority) for variant-based styling
- Tailwind arbitrary values used: `hover:scale-[1.01]`, `active:scale-[0.98]`

## Logging

**Framework:** Custom logger (`lib/logger.ts`), not using pino directly in app code

**Structured Logging:**
- JSON output in production, human-readable in development
- Automatic request correlation IDs generated via `crypto.randomUUID()`
- Context stacking via `withLogContext()` / `logger.child()`

**Usage Pattern:**
```typescript
import { logger } from '@/lib/logger'
logger.info('message', { key: value })
logger.error('message', error)
const log = logger.child({ route: '/api/deals' })
log.info('processing', { userId })
```

**Console Rules:**
- `console.log` is forbidden by ESLint (error level)
- Only `console.warn` and `console.error` are allowed
- Scripts and tests have `no-console` disabled

## Comments

**JSDoc:**
- Used on public functions and complex utilities
- Describes parameters, return values, and behavior
- Example: `lib/date-utils.ts` has JSDoc on every exported function

**Inline Comments:**
- Used sparingly for non-obvious logic
- Section dividers in CSS: `/* ===== UI ALLOCATION TOKENS (60/30/10) ===== */`
- Inline in complex business logic: `// Handle special sorting cases`

**Module-level Comments:**
- Used for file purpose and usage examples
- Example: `lib/feature-flags.ts` has a block comment with usage example at the top

## State Management

**Zustand:**
- All stores use Zustand v5
- Pattern: `create<StoreType>()(persist((set) => ({ ... }), { name, storage, partialize }))`
- Persistence via `createJSONStorage(() => localStorage)`
- Store files in `store/` directory
- Naming: `use<Feature>Store` (e.g., `useUserStore`, `useChatStore`)

**React Context:**
- Provider pattern in `context/providers/`
- Composed from multiple data hooks: `useUiProvider()` aggregates dashboard state hooks
- `"use client"` directive on all provider files

## Module Design

**Exports:**
- Named exports preferred for library functions and components
- Default exports for Next.js pages and layouts
- Barrel re-exports in `index.ts` files: `components/ui/index.ts`, `components/ui/v2/index.ts`
- Type re-exports: `export type { Widget } from ...`

**Server Modules:**
- `'use server'` directive for all server actions in `server/`
- `server-only` import guard in API routes
- Server files import Prisma client from `@/lib/prisma`

**Shared Utilities:**
- `lib/` for all shared utilities
- `lib/config/` for configuration constants (breakpoints, z-index)
- `lib/constants/` for app constants (dashboard themes, layout, sidebar)
- `lib/security/` for security utilities
- `lib/ai/` for AI-related logic (client, prompts, errors, policy)

## Git Conventions

**Branch Naming:**
- Feature branches: `v2` observed as current working branch
- Main branch: `main`

**Commit Messages:**
- Short descriptive messages observed: `"full fix"`, `"ai"`, `"fix"`, `"ui"`
- Co-authored-by pattern likely used via OMC orchestration

---

*Convention analysis: 2026-04-09*

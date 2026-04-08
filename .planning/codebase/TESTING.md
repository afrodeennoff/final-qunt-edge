# Testing Patterns

**Analysis Date:** 2026-04-08

## Test Framework

**Primary Runner:**
- Vitest 2.1.9
- Config: `vitest.config.ts` (main), `vitest.payment.config.ts` (payment/integration)

**Assertion Library:**
- Built-in Vitest assertions (`expect`)

**Environment:**
- Default: `node` (for server/utility tests)
- `jsdom` via `@vitest-environment jsdom` pragma for React component tests
- Payment config includes `@vitejs/plugin-react` for JSX support

**E2E Framework:**
- Playwright 1.58.2
- Config: `playwright.config.ts`
- `@axe-core/playwright` for accessibility testing

**Run Commands:**
```bash
npm test                        # Run all tests (vitest run)
npm run test:coverage           # Run with coverage
npm run test:payment            # Run payment/integration tests
npm run test:payment:ui         # Payment tests with Vitest UI
npm run test:payment:coverage   # Payment tests with coverage
npm run test:smoke              # Smoke tests (HTTP)
npx playwright test             # E2E tests
```

## Test File Organization

**Location Pattern:**
- Most tests live in `tests/` directory, mirroring the source structure
- Some tests co-located in `lib/__tests__/` (older pattern, 20 files)
- E2E tests in `tests/e2e/`
- Sidebar tests in `components/sidebar/__tests__/` (excluded from main vitest config)

**Naming:**
- Unit/integration: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`

**Directory Structure:**
```
tests/
├── setup.ts                    # Global test setup (vitest)
├── lib/                        # Library/utility tests
│   ├── api-response.test.ts
│   ├── feature-flags.test.ts
│   ├── password-validation.test.ts
│   ├── prisma-fallback.test.ts
│   ├── redact-pii.test.ts
│   ├── unsubscribe-token.test.ts
│   └── ...
├── server/                     # Server action tests
│   ├── accounts-isolation.test.ts
│   ├── delete-ownership-regression.test.ts
│   ├── shared.test.ts
│   ├── team-analytics.test.ts
│   └── ...
├── api/                        # API route handler tests
│   ├── deals-unified.test.ts
│   ├── ai-router-comprehensive.test.ts
│   ├── auth-callback-route.test.ts
│   └── ...
├── cache/                      # Cache tests
│   └── cache-invalidation.test.ts
├── context/                    # React context tests
│   ├── provider-boundary-regression.test.tsx
│   └── data-provider-utils.test.ts
├── smoke/                      # Smoke tests
│   └── env.test.ts
├── performance/                # Performance tests (excluded from main suite)
│   └── performance-regression.test.ts
├── e2e/                        # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── a11y/
│   │   └── a11y.spec.ts
│   └── performance/
├── date-utils.test.ts          # Standalone utility tests
├── sanitize.test.ts
├── error-boundaries.test.tsx
├── theme-provider.test.tsx
├── rate-limit.test.ts
└── ...

lib/__tests__/                  # Co-located lib tests (older pattern)
├── setup.ts                    # DB setup for payment tests
├── ai-policy.test.ts
├── cache-invalidation.test.ts
├── payment-flows.test.ts
├── get-all-trades.test.ts
└── ...
```

## Test Configuration

**Main Vitest Config (`vitest.config.ts`):**
- `globals: true` -- `describe`, `it`, `expect` available globally (though imports are still used)
- `environment: "node"`
- Setup file: `tests/setup.ts`
- Includes: `tests/**/*.test.ts`, `tests/**/*.test.tsx`, `**/__tests__/**/*.test.ts`, `**/*.test.ts`
- Excludes: `node_modules`, `dist`, `.next`, `.opencode/**`, `components/sidebar/__tests__/**`, `tests/performance/performance-regression.test.ts`

**Payment Vitest Config (`vitest.payment.config.ts`):**
- Adds `@vitejs/plugin-react` plugin
- Additional setup: `lib/__tests__/setup.ts` (DB connection setup)
- Includes only: `**/__tests__/**/*.test.ts`

**Playwright Config (`playwright.config.ts`):**
- Test dir: `./tests/e2e`
- Chromium only
- `baseURL: 'http://localhost:3000'`
- Web server auto-starts with `npm run dev`
- CI: retries=2, workers=1, forbidOnly=true

**Coverage Thresholds:**
- Lines: 30%
- Functions: 40%
- Statements: 30%
- Branches: 20%
- Per-file enforcement: true
- Provider: v8

## Global Test Setup

**`tests/setup.ts`:**
- Mocks `server-only` module (prevents import errors in test env)
- Sets `IS_REACT_ACT_ENVIRONMENT = true` (React testing)
- Provides `window` shim with event listeners (for non-jsdom environments)
- Provides `localStorage` shim using `Map<string, string>`
- Sets `navigator.onLine = true`
- Provides `matchMedia` mock (prefers dark mode)

**`lib/__tests__/setup.ts` (payment/integration):**
- Creates real Prisma client with `pg.Pool` adapter
- Connects to `DATABASE_URL_TEST` or `DATABASE_URL`
- Sets up `global.prisma` and `global.pool`
- Non-fatal when DB absent (tests skip gracefully)

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it, beforeEach, vi } from 'vitest'

// Mocks hoisted above imports (required by vi.mock)
const { someMock } = vi.hoisted(() => ({
  someMock: vi.fn(),
}))

vi.mock('@/lib/module', () => ({
  exportedName: someMock,
}))

import { functionUnderTest } from '@/lib/module'

describe('functionUnderTest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset default mock return values
    someMock.mockResolvedValue('default')
  })

  it('does something expected', async () => {
    someMock.mockResolvedValue('test-value')
    const result = await functionUnderTest({ input: 'data' })
    expect(result).toBe('expected')
    expect(someMock).toHaveBeenCalledWith('expected-args')
  })

  it('handles errors', async () => {
    someMock.mockRejectedValue(new Error('fail'))
    await expect(functionUnderTest()).rejects.toThrow('fail')
  })
})
```

**Key patterns:**
- `vi.hoisted()` to declare mock functions before module imports
- `vi.mock()` with factory functions for module mocking
- `vi.clearAllMocks()` in `beforeEach`
- `vi.resetAllMocks()` used in some API tests
- Tests for async functions use `async/await` with `expect().resolves` / `expect().rejects`

## Mocking

**Framework:** Vitest built-in mocking (`vi.fn()`, `vi.mock()`, `vi.hoisted()`)

**Module Mocking Pattern:**
```typescript
// Hoist mock declarations
const { getDatabaseUserIdMock, prismaMock } = vi.hoisted(() => ({
  getDatabaseUserIdMock: vi.fn(),
  prismaMock: { user: { findUnique: vi.fn() } },
}))

vi.mock('@/server/auth', () => ({
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))
```

**What to Mock:**
- `@/server/auth` -- authentication functions (`getDatabaseUserId`, `getUserId`)
- `@/lib/prisma` -- database client (prisma instance)
- `@/lib/supabase/*` -- Supabase clients (`createRouteClient`)
- `next/cache` -- cache revalidation (`updateTag`)
- `@/lib/security/*` -- security utilities
- External API clients in route tests

**What NOT to Mock:**
- Pure utility functions (tested directly)
- Zod schemas (tested through validation functions)
- The functions under test

**Dynamic Imports for Route Handlers:**
```typescript
const { GET } = await import("@/app/api/deals/unified/route")
const response = await GET(request)
```
This pattern is used for API route tests to avoid module caching issues with mocks.

## Test Types

**Unit Tests:**
- Pure utility functions: `date-utils.test.ts`, `sanitize.test.ts`, `var.test.ts`
- Library modules: `lib/api-response.test.ts`, `lib/feature-flags.test.ts`, `lib/password-validation.test.ts`
- Cache logic: `cache/cache-invalidation.test.ts`
- Pattern: No mocking needed for pure functions, direct assertion

**Integration Tests (Server Actions):**
- Server action tests in `tests/server/`: `shared.test.ts`, `team-analytics.test.ts`, `accounts-isolation.test.ts`
- Mock auth + prisma, test business logic
- Pattern: Mock external dependencies, test orchestration and error handling

**Integration Tests (API Routes):**
- API route tests in `tests/api/`: `deals-unified.test.ts`, `ai-router-comprehensive.test.ts`, `auth-callback-route.test.ts`
- Create `Request` objects, call route handlers directly
- Mock auth and data layer, test response shape and status codes
- Pattern:
```typescript
const request = new Request("http://localhost/api/deals/unified?search=test")
const { GET } = await import("@/app/api/deals/unified/route")
const response = await GET(request)
const data = await response.json()
expect(response.status).toBe(200)
```

**Payment/Integration Tests:**
- Located in `lib/__tests__/`: `payment-flows.test.ts`, `webhook-service-retry.test.ts`
- Use real database via `lib/__tests__/setup.ts`
- Run separately: `npm run test:payment`

**React Component Tests:**
- `error-boundaries.test.tsx` -- tests error boundary components
- `theme-provider.test.tsx` -- tests theme switching
- `context/provider-boundary-regression.test.tsx` -- tests React context
- Uses `jsdom` environment, `react-dom/client` for rendering

**E2E Tests (Playwright):**
- `tests/e2e/auth.spec.ts` -- authentication flow
- `tests/e2e/a11y/a11y.spec.ts` -- accessibility audit
- `tests/e2e/performance/` -- performance benchmarks
- Mock Supabase Auth endpoints for deterministic tests
- Pattern: `test.describe` blocks, `page.route()` for mocking, `page.goto()` for navigation

**Smoke Tests:**
- `tests/smoke/env.test.ts` -- environment validation
- `scripts/smoke-http.mjs` -- HTTP smoke test

## Test Data Patterns

**Inline Mock Data:**
- Mock objects defined directly in test files:
```typescript
const mockFirms = [{ id: '1', slug: 'test-firm', name: 'Test Firm', ... }]
```

**Environment Manipulation:**
- Tests that check feature flags save/restore `process.env`:
```typescript
const originalEnv = { ...process.env }
beforeAll(() => { process.env.NEXT_PUBLIC_PERF_ROLLOUT_PCT = '50' })
afterAll(() => { process.env = originalEnv })
```

**Prisma Error Simulation:**
```typescript
const uniqueError = new Error('duplicate') as Error & { code?: string }
uniqueError.code = 'P2002'
sharedCreateMock.mockRejectedValueOnce(uniqueError)
```

## Current Test Coverage Assessment

**Overall Metrics:**
- Total test files: 186 (excluding `node_modules` and `.opencode`)
- Total source files (TS/TSX): 2,136
- Test-to-source ratio: ~8.7% of files have corresponding tests
- API routes: 69 route files
- Pages: 59 page files
- Components: 152 component files

**Files with Tests (by area):**
| Area | Source Files | Test Files | Coverage |
|------|-------------|------------|----------|
| `lib/` utilities | ~70 | ~30 (incl. `__tests__/`) | Moderate |
| `server/` actions | ~35 | ~10 | Low |
| `app/api/` routes | ~69 | ~25 | Low-Moderate |
| `components/` | ~152 | ~3 | Very Low |
| `store/` (Zustand) | ~25 | 0 | None |
| `hooks/` | ~8 | 0 | None |

## Test Coverage Gaps

**Critical Gaps (High Priority):**

1. **No Zustand store tests** -- All 25+ stores in `@/store/` are untested. Stores like `user-store.ts`, `chat-store.ts`, `analysis-store.ts` contain complex state logic with persistence that could break silently.

2. **No React hook tests** -- All 8 hooks in `@/hooks/` are untested (`useDebounce`, `useMediaQuery`, `useAutoScroll`, etc.).

3. **Component tests nearly absent** -- Only 3 component test files exist (`error-boundaries.test.tsx`, `theme-provider.test.tsx`, `context/provider-boundary-regression.test.tsx`). 149+ components have no tests.

4. **Server action coverage is thin** -- Only ~10 of 35 server action files have tests. Missing tests for critical paths like billing, subscription management, trades CRUD, imports.

**Moderate Gaps (Medium Priority):**

5. **E2E test suite is minimal** -- Only 3 E2E spec files (auth, a11y, performance). No coverage for: dashboard navigation, trade entry flow, deal browsing, team management, import workflows.

6. **AI route tests are extensive but isolated** -- Many AI route tests exist (`ai-router-comprehensive.test.ts`, `ai-error-contracts.test.ts`, etc.) but they mock heavily and don't test real AI integration.

7. **No visual regression tests** -- No screenshot comparison or visual diff testing despite extensive custom UI components.

8. **No middleware tests** -- No tests for Next.js middleware (auth guards, locale routing).

**Low Priority Gaps:**

9. **Payment tests require real DB** -- Payment test suite (`lib/__tests__/`) requires a database connection and is run separately, reducing likelihood of being caught in CI.

10. **No load/performance testing in CI** -- `loadtest:k6` exists but is not part of any CI pipeline script.

## CI/CD Testing Integration

**Test Scripts Available:**
```bash
npm test                    # Main test suite
npm run test:coverage       # Coverage report
npm run test:payment        # Payment tests (separate)
npm run test:smoke          # HTTP smoke test
npm run lint                # ESLint
npm run typecheck           # TypeScript checking
npm run perf:ci             # Full performance CI suite
```

**CI Performance Checks (`perf:ci`):**
- Dead code check
- Route security check
- Route budget check
- Bundle analysis
- Performance headers check
- Performance baseline
- Dashboard runtime performance
- Lighthouse audit

**Known CI Gaps:**
- No GitHub Actions or CI config files detected in the repository
- `perf:ci` script exists but integration into a CI pipeline is unclear
- Playwright tests have CI-aware config (retries, workers) but no CI trigger detected
- Coverage thresholds are low (30% lines) suggesting coverage is not strictly enforced

---

*Testing analysis: 2026-04-08*

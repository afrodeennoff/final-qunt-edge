# Testing Patterns

**Analysis Date:** 2026-04-09

## Test Framework

**Unit/Integration Runner:**
- Vitest v2.1.9
- Config: `vitest.config.ts` (primary), `vitest.payment.config.ts` (payment-specific)
- Globals: enabled (`globals: true`) -- `describe`, `it`, `expect`, `vi` available without imports (though most files still import them explicitly)

**E2E Runner:**
- Playwright v1.58+ (`@playwright/test`)
- Config: `playwright.config.ts`
- A11y plugin: `@axe-core/playwright`

**Assertion Libraries:**
- Vitest built-in `expect` for unit/integration tests
- Playwright `expect` for E2E tests

**Run Commands:**
```bash
bun run test              # Run all unit/integration tests (vitest)
bun run test:coverage     # Run tests with coverage report
bun run test:payment      # Run payment integration tests (separate config)
bun run test:payment:ui   # Run payment tests with Vitest UI
bun run test:payment:coverage  # Payment tests with coverage
bun run test:smoke        # Run HTTP smoke test (scripts/smoke-http.mjs)
bun run perf:ci           # Full performance CI gate
```

## Test Configuration

**Primary Config (`vitest.config.ts`):**
- Environment: `"node"` (not jsdom -- server-focused testing)
- Setup file: `./tests/setup.ts`
- Coverage provider: v8
- Path alias: `@` maps to project root

**Payment Config (`vitest.payment.config.ts`):**
- Environment: `"node"`
- Setup files: `./tests/setup.ts` AND `./lib/__tests__/setup.ts` (DB-backed setup)
- Vite plugin: `@vitejs/plugin-react` (React support for JSX tests)

**Playwright Config (`playwright.config.ts`):**
- Test directory: `./tests/e2e`
- Base URL: `http://localhost:3000`
- Single project: Chromium Desktop Chrome
- Fully parallel execution
- CI: 2 retries, 1 worker
- Dev: 0 retries, auto workers
- Web server: `npm run dev` with reuseExistingServer
- Trace on first retry, screenshot on failure, video on first retry

**Coverage Thresholds (vitest.config.ts):**
```json
{
  "lines": 30,
  "functions": 40,
  "statements": 30,
  "branches": 20,
  "perFile": true
}
```

**CI Coverage Thresholds (ci.yml):**
- Lines: >= 80%
- Branches: >= 60%
- Note: CI thresholds are significantly higher than local config thresholds

## Test File Organization

**Location:**
- Two primary patterns:
  1. Centralized in `tests/` directory, mirroring source structure
  2. Co-located in `lib/__tests__/` for library-internal tests

**Directory Structure:**
```
tests/
  setup.ts                    # Global test setup (window, localStorage, matchMedia shims)
  var.test.ts                 # Root-level test
  smoke/
    env.test.ts               # Smoke tests
  api/
    tradovate-sync-route.test.ts
    ai-full-history-ux.test.ts
    ai-budget-enforcement.test.ts
    auth-callback-route.test.ts
    deals-active.test.ts
    deals-unified.test.ts
    whop-checkout-security.test.ts
    ...
  app/
    api/
      _utils/
        validate.test.ts      # Mirrors app/api/_utils/
  cache/
    cache-invalidation.test.ts
  context/
    data-provider-utils.test.ts
    provider-boundary-regression.test.tsx
  lib/
    api-response.test.ts
    unsubscribe-url.test.ts
    feature-flags.test.ts
    password-validation.test.ts
    redact-pii.test.ts
    chat-retention.test.ts
    prisma-fallback.test.ts
    ...
  server/
    shared-access.test.ts
    groups-delete.test.ts
    accounts-isolation.test.ts
    layout-isolation.test.ts
    team-analytics.test.ts
    ...
  performance/
    rendering-performance.test.tsx
    performance-regression.test.ts
    trades-mutation-batch.test.ts
  e2e/
    auth.spec.ts              # Playwright E2E
    a11y/                     # Accessibility tests
    performance/              # Performance E2E tests

lib/__tests__/
  setup.ts                    # DB-backed test setup (Prisma + pg)
  payment-flows.test.ts
  webhook-service-retry.test.ts
  whop-webhook-route.test.ts
  ai-policy.test.ts
  teams-security.test.ts
  ...
```

**Naming:**
- Test files: `<feature>.test.ts` or `<feature>.test.tsx`
- E2E files: `<feature>.spec.ts` (Playwright convention)
- Descriptive names: `ai-budget-enforcement.test.ts`, `whop-checkout-security.test.ts`, `password-validation.test.ts`

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest'
import { functionUnderTest } from '@/lib/module'

describe('module-name', () => {
  describe('SubModule or specific function', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = ...
      // Act
      const result = functionUnderTest(input)
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

**Import Pattern:**
- All test files explicitly import from vitest: `import { describe, expect, it } from 'vitest'`
- Source imports use `@/` alias: `import { apiError } from '@/lib/api-response'`

**Test Descriptions:**
- Use `should` phrasing: `'should reject strings without uppercase'`
- Use descriptive names: `'returns errors for too-short password'`
- E2E tests use emoji prefixes: `'Unauthorized users are redirected from protected routes'`

## Setup and Teardown

**Global Setup (`tests/setup.ts`):**
- Mocks `server-only` module: `vi.mock('server-only', () => ({}))`
- Sets `IS_REACT_ACT_ENVIRONMENT = true`
- Shims `window` with EventTarget methods (addEventListener, removeEventListener, dispatchEvent)
- Shims `localStorage` with in-memory Map-based implementation
- Shims `navigator.onLine = true`
- Shims `window.matchMedia` with dark-mode-aware mock

**DB Setup (`lib/__tests__/setup.ts`):**
- Connects to PostgreSQL via `pg.Pool` and `@prisma/adapter-pg`
- Declares `globalThis.prisma` and `globalThis.pool`
- Non-fatal when DATABASE_URL is absent (tests skip gracefully)
- Truncates 8 payment-related tables before each test: PaymentTransaction, Invoice, Refund, SubscriptionEvent, PaymentMethod, Promotion, UsageMetric, Subscription
- Cleans up connections in `afterAll`

**E2E Setup:**
- `beforeEach` clears cookies: `await context.clearCookies()`
- Route mocking for Supabase Auth endpoints
- No global setup file (Playwright default)

## Mocking

**Framework:** Vitest built-in (`vi`)

**Patterns:**
```typescript
// Module mocking
vi.mock('server-only', () => ({}))

// Function mocking
const mockFn = vi.fn().mockImplementation((query: string) => ({
  matches: query.includes('dark'),
  media: query,
  // ...
}))

// Route mocking in E2E
await page.route('**/auth/v1/token?grant_type=password', async route => {
  await route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'invalid_grant' }),
  })
})
```

**What to Mock:**
- `server-only` module (prevents server-side code from failing in test env)
- Browser APIs: `window`, `localStorage`, `navigator`, `matchMedia`
- Supabase Auth endpoints in E2E tests
- External API endpoints in E2E tests

**What NOT to Mock:**
- Business logic functions (tested directly)
- Zod validation schemas (tested with real data)
- Pure utility functions

## Unit Tests

**Scope:**
- Pure functions in `lib/`: date formatting, financial math, password validation, URL generation
- Security utilities: shared-access guards, PII redaction, token generation
- API response helpers
- Feature flag logic

**Patterns from codebase:**

**Pure Function Testing (`tests/lib/password-validation.test.ts`):**
```typescript
describe('password-validation', () => {
  describe('PASSWORD_REGEX', () => {
    it('should reject strings without uppercase', () => {
      expect(PASSWORD_REGEX.test('abcdefgh1')).toBe(false)
    })
    it('should accept valid passwords', () => {
      expect(PASSWORD_REGEX.test('Abcdefgh1')).toBe(true)
    })
  })
})
```

**API Helper Testing (`tests/lib/api-response.test.ts`):**
```typescript
describe("apiError helper", () => {
  it("builds a structured envelope and sets the cache-control header", async () => {
    const response = apiError("BAD_REQUEST", "Bad payload", 400, { reason: "malformed" });
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store, max-age=0");
    const body = await response.json();
    expect(body).toEqual({
      error: { code: "BAD_REQUEST", message: "Bad payload", details: { reason: "malformed" } },
    });
  });
});
```

**Security Testing (`tests/server/shared-access.test.ts`):**
```typescript
describe('shared visibility guard', () => {
  const now = new Date('2026-02-25T12:00:00.000Z')
  it('denies missing or private shares', () => {
    expect(isSharedAccessible(null, now)).toBe(false)
  })
  it('allows active public shares', () => {
    expect(isSharedAccessible({ isPublic: true, expiresAt: null }, now)).toBe(true)
  })
})
```

## Integration Tests

**Scope:**
- API route testing: auth, AI, deals, teams, webhooks
- Server action testing: trade operations, account management, group operations
- Cache invalidation
- Auth flow testing
- Provider boundary regression

**API Route Tests:**
- Located in `tests/api/`
- Test server-side route handlers directly (not via HTTP)
- Mock authentication and external services
- Validate response status, headers, and JSON body shape

**Server Tests:**
- Located in `tests/server/`
- Test server actions and data access layers
- Ownership and isolation verification
- Database interaction testing

**Payment Integration Tests:**
- Located in `lib/__tests__/`
- Separate Vitest config with DB setup
- Requires real database (PostgreSQL)
- Truncates tables between tests
- Run in CI only when secrets are available
- Tests: payment flows, webhook retry, Whop webhook handling, team invitations, AI policy

## E2E Tests

**Framework:** Playwright with Chromium

**Location:** `tests/e2e/`

**Test Files:**
- `auth.spec.ts` -- Authentication flow (login, logout, session persistence, redirects)
- `a11y/` -- Accessibility audits
- `performance/` -- Performance-focused E2E tests

**E2E Patterns:**

**Auth Flow Testing:**
```typescript
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('Unauthorized users are redirected from protected routes', async ({ page }) => {
    await page.goto(`/${LOCALE}/dashboard`)
    await page.waitForURL(url => url.pathname.includes('/authentication'))
    expect(page.url()).toContain('next=')
    await expect(page.locator('form')).toBeVisible()
  })
})
```

**Route Mocking in E2E:**
```typescript
await page.route('**/auth/v1/token?grant_type=password', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: 'valid.session.token',
      refresh_token: 'valid.refresh.token',
      expires_in: 3600,
      user: { id: 'user_123', email: TEST_EMAIL }
    }),
  })
})
```

**Page Object-like Patterns:**
- Locale-aware navigation: `/${LOCALE}/dashboard`
- Form interaction: `page.fill('input[id="email_password"]', email)`
- Role-based selectors: `page.getByRole('button', { name: /Log out/i })`
- Visibility assertions: `await expect(page.locator('header')).toBeVisible()`

## Performance Tests

**Rendering Performance (`tests/performance/rendering-performance.test.tsx`):**
- React component rendering benchmarks
- Uses `.tsx` extension

**Performance Regression (`tests/performance/performance-regression.test.ts`):**
- Excluded from main test runs (listed in tsconfig excludes and vitest excludes)
- Monitors performance over time

**CI Performance Gates (`perf:ci` script):**
- Dead code check: `check:dead-code`
- Route security: `check:route-security`
- Route budgets: `check:route-budgets`
- Bundle analysis: `analyze:bundle`
- Header cache policy: `perf:headers`
- Baseline snapshot: `perf:baseline`
- Dashboard runtime: `perf:dashboard-runtime`
- Lighthouse: `perf:lighthouse`

## Coverage

**Configuration:**
- Provider: v8 (`@vitest/coverage-v8`)
- Reporters: text, json, html
- Per-file threshold enforcement: enabled

**Local Thresholds (vitest.config.ts):**
- Lines: 30%
- Functions: 40%
- Statements: 30%
- Branches: 20%

**CI Thresholds (ci.yml):**
- Lines: >= 80%
- Branches: >= 60%

**View Coverage:**
```bash
bun run test:coverage    # Runs coverage with text + html output
```

**CI Artifact Upload:**
- Coverage report uploaded as GitHub Actions artifact: `coverage-report`
- Coverage summary JSON: `coverage/coverage-summary.json`

## CI Integration

**CI Pipeline (`.github/workflows/ci.yml`):**
- Triggers: pull requests and pushes to `main`
- Node.js 20 + Bun 1.3.11
- PostgreSQL 16 service container

**Test Steps in CI:**
1. Lint (`bun run lint`)
2. Warning budget check (`bun run check:warning-budget`)
3. Typecheck (`bun run typecheck`)
4. Prisma schema validation (`bunx prisma validate`)
5. Unit tests with coverage (`bun run test:coverage`)
6. Coverage threshold enforcement (>= 80% lines, >= 60% branches)
7. Build (`bun run build`)
8. Route budget check
9. Bundle analysis
10. Performance gates (baseline, headers, lighthouse)

**Payment Integration Job:**
- Depends on `validate` job
- Only runs on non-fork PRs (secrets unavailable on forks)
- Requires: `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `ENCRYPTION_KEY`
- Runs: `bunx prisma db push` then `bun run test:payment`

## Test Data

**No Dedicated Fixtures/Factory System:**
- Test data is defined inline within test files
- Constants defined at suite level: `const now = new Date('2026-02-25T12:00:00.000Z')`
- Test inputs constructed per test case

**Typical Pattern:**
```typescript
const TEST_EMAIL = 'test@example.com'
const TEST_PASSWORD = 'Password123!'
const LOCALE = 'en'
```

**Database Seeding (payment tests):**
- Tables truncated between tests via `beforeEach`
- No seed data files; tests create their own data

**Mock Data:**
- Supabase Auth mock responses defined inline in E2E tests
- API mock responses use realistic shapes matching production schemas

## Common Test Patterns

**Error Testing:**
```typescript
it('should return errors for missing uppercase', () => {
  const result = validatePasswordStrength('abcdefgh1')
  expect(result.valid).toBe(false)
  expect(result.errors).toContain('Password must contain at least one uppercase letter')
})
```

**Boundary/Edge Case Testing:**
```typescript
it('denies expired shares', () => {
  expect(
    isSharedAccessible(
      { isPublic: true, expiresAt: new Date('2026-02-25T11:59:59.000Z') },
      now
    )
  ).toBe(false)
})
```

**Array/Collection Testing:**
```typescript
it('should return all requirements unmet for empty string', () => {
  const reqs = getPasswordRequirements('')
  expect(reqs).toHaveLength(4)
  expect(reqs.every(r => !r.met)).toBe(true)
})
```

**Async Response Testing:**
```typescript
it('builds a structured envelope', async () => {
  const response = apiError("BAD_REQUEST", "Bad payload", 400)
  expect(response.status).toBe(400)
  const body = await response.json()
  expect(body).toEqual({ error: { code: "BAD_REQUEST", message: "Bad payload" } })
})
```

## Test Gaps

**Areas with Minimal or No Test Coverage:**
- **UI Components**: No unit tests for React components in `components/` (testing done via E2E only)
- **Zustand Stores**: Store logic in `store/` directory lacks dedicated test files
- **Custom Hooks**: Hooks in `hooks/` have no test files
- **Pages/Layouts**: Next.js pages and layouts not unit tested
- **Styling/Theme**: No tests for CSS tokens, theme switching, or visual regression
- **Client-Side Integration**: React Query hooks, TanStack Table configurations untested
- **Middleware**: Next.js middleware (auth redirects, locale routing) not tested
- **WebSocket/Real-time**: Any real-time features lack test coverage
- **File Upload/Processing**: Upload and file handling not tested

**Partially Tested Areas:**
- Server actions tested via API route tests but not all server files have tests
- AI routes have security and budget tests but limited functional coverage
- Cache invalidation has tests but cache hit/miss behavior is undertested

## Test Utilities

**Custom Utilities:**
- No dedicated test utility library or custom matchers
- Tests use Vitest/Playwright built-in assertions only
- `cn()` function tested indirectly through component rendering

**Shim Utilities (in `tests/setup.ts`):**
- `window` shim with event methods
- `localStorage` shim with Map backing
- `matchMedia` shim for dark mode queries
- `navigator.onLine` shim

**DB Utilities (in `lib/__tests__/setup.ts`):**
- `globalThis.prisma` for Prisma client access in tests
- `globalThis.pool` for raw pg Pool access
- Table truncation helper pattern

---

*Testing analysis: 2026-04-09*

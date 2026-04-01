# tests Directory — Test Suite

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions (Testing patterns).

**Scope**: `tests/`, `tests/**/`

## OVERVIEW
Vitest-based test suite with integration, unit, performance, and API tests. Organized by domain under `tests/` subdirectories.

## FRAMEWORK

- **Vitest** with `globals: true` (`describe/it/expect` without imports)
- **v8 coverage** with thresholds: lines ≥2%, functions ≥18%, branches ≥40%
- **Node environment** (not jsdom by default; jsdom used per-file)
- Separate `vitest.payment.config.ts` for payment integration tests

## TEST ORGANIZATION

```
tests/
├── api/                    # API route integration tests
│   ├── ai-*.test.ts      # Error contracts, budget enforcement
│   ├── etp-store-route.test.ts
│   ├── thor-store-route.test.ts
│   ├── tradovate-*.test.ts
│   ├── rithmic-*.test.ts
│   ├── teams-*.test.ts
│   ├── admin-*.test.ts
│   └── unsubscribe-route.test.ts
├── server/                # Server action/module tests
│   ├── *-isolation.test.ts  # Multi-user data boundary tests
│   ├── shared.test.ts
│   ├── shared-access.test.ts
│   ├── team-analytics.test.ts
│   └── rithmic-sync-actions.test.ts
├── lib/                    # Library unit tests
│   ├── ai-*.test.ts      # AI router, client, token tests
│   ├── unsubscribe-token.test.ts
│   ├── api-response.test.ts
│   └── feature-flags.test.ts
├── performance/           # Performance regression tests
│   ├── performance-regression.test.ts
│   └── trades-mutation-batch.test.ts
├── context/               # React context tests
│   └── data-provider-utils.test.ts
├── cache/                 # Cache system tests
│   └── query-cache.test.ts
├── app/api/_utils/        # API utility tests
│   └── validate.test.ts
├── e2e/                   # End-to-end tests
├── smoke/                 # Smoke tests
├── setup.ts               # Global test setup
└── *.test.ts              # Root: logger, var, tick, etc.
```

## TEST PATTERNS

### Mock server-only
```typescript
vi.mock('server-only', () => ({}))
```

### Environment variable mocking
```typescript
const originalEnv = process.env.KEY
beforeEach(() => { process.env.KEY = 'test-value' })
afterEach(() => { process.env.KEY = originalEnv })
```

### API route testing
```typescript
vi.mock('@/lib/ai/route-guard', () => ({
  guardAiRequest: vi.fn(async () => ({ ok: true, userId: "user-1" })),
}))
const { POST } = await import("@/app/api/ai/editor/route")
const response = await POST(request)
```

### Auth mocking
```typescript
vi.mock('@/server/auth', () => ({
  getDatabaseUserId: vi.fn(() => Promise.resolve('test-user-id')),
}))
```

## CI PIPELINE

1. Lint → Typecheck → Unit Tests (≥80% lines, ≥60% branches)
2. Build → Route Budget → Bundle Analysis → Cache Headers
3. Performance Baseline → Lighthouse (desktop/mobile)
4. Security Audit → Secrets Check

Payment tests: separate job with `vitest.payment.config.ts` + real DB + secrets.

## CONVENTIONS

- **Named** Vitest imports: `import { describe, it, expect, vi } from "vitest"`
- Mock auth guards for API routes: `vi.mock('@/lib/ai/route-guard', ...)`
- Per-user isolation tests for `server/` modules
- Payment tests: `RUN_PAYMENT_INTEGRATION_TESTS=true` + `DATABASE_URL`

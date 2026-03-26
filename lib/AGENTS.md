# lib Directory — Utilities, Services, AI, Analytics

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions (imports, TypeScript, React, CSS).

**Scope**: `lib/`, `lib/*/` (excludes `lib/ai/` which has its own AGENTS.md)

## OVERVIEW
Shared utilities and service layer. Subdivided into AI, analytics, caching, security, performance, and Supabase integration.

## SUBDIRECTORIES

| Subdir | Purpose |
|--------|---------|
| `ai/` | AI client, router, entitlements, telemetry (→ `lib/ai/AGENTS.md`) |
| `analytics/` | Metrics calculations, VaR, metric definitions |
| `cache/` | Redis cache, query cache, cache invalidation |
| `debug/` | Performance monitor, event tracker, render tracker, memory leak detector |
| `performance/` | Next.js config builder, memory leak detection |
| `security/` | CSP, auth config, token crypto, slug gen, shared access |
| `supabase/` | Supabase client utilities, route client |

## KEY FILES

| File | Purpose |
|------|---------|
| `prisma.ts` | Prisma singleton, pool management (max=20), TLS config |
| `supabase.ts` | Supabase client utilities |
| `utils.ts` | `cn()` class merger, numeric guards, safe divide |
| `date-utils.ts` | Date/time utilities |
| `logger.ts` | Centralized logging with redaction, request IDs |
| `env.ts` | Environment variable access |
| `data-types.ts` | Shared type definitions |
| `validation-schemas.ts` | Zod schemas |
| `feature-flags.ts` | Feature flag helpers |
| `rate-limit.ts` | Redis-backed rate limiting (Upstash) |
| `redis-cache.ts` | Redis caching utilities |
| `account-metrics.ts` | Account-level metrics calculations |
| `advanced-metrics.ts` | Extended metric calculations |
| `chart-colors.ts` | Monochrome chart color palette |
| `color-tokens.ts` | Semantic color token utilities |
| `contrast-validator.ts` | WCAG contrast checking |

## ANALYTICS (`lib/analytics/`)

| File | Purpose |
|------|---------|
| `metrics-v1.ts` | Core analytics calculations |
| `metric-definitions.ts` | Metric formulas/definitions (source of truth) |
| `var.ts` | Value at Risk (VaR) — historical & parametric |

## SECURITY (`lib/security/`)

| File | Purpose |
|------|---------|
| `csp.ts` | Content Security Policy builder (nonce-based) |
| `auth-config.ts` | Auth security configuration |
| `auth-attempts.ts` | Auth attempt tracking/lockout |
| `token-crypto.ts` | HMAC-based secure token generation |
| `slug.ts` | Secure slug generation (crypto-safe) |
| `shared-access.ts` | Shared link access control (isPublic + non-expired) |
| `oauth-state.ts` | OAuth state management |

## PERFORMANCE (`lib/performance/`)

| File | Purpose |
|------|---------|
| `next-config.ts` | Shared Next.js config builder |
| `memory-leak-detector.ts` | Browser memory leak detection |
| `code-splitting.tsx` | Code splitting utilities |
| `optimized-components.tsx` | Optimized React components |
| `render-optimization.ts` | Render optimization helpers |
| `gpu-optimization.ts` | GPU optimization utilities |
| `dom-optimization.ts` | DOM optimization helpers |
| `performance-measurement.ts` | Performance metric collection |

## INDEXEDDB (`lib/indexeddb/`)

| File | Purpose |
|------|---------|
| `trades-cache.ts` | Browser IndexedDB trade cache, schema versioning |

## CONVENTIONS

- All `lib/` utilities are tree-shakeable
- Use `cn()` from `lib/utils.ts` for class merging
- Numeric guards (`toFiniteNumber`, `safeDivide`) for NaN prevention
- Centralized logging via `lib/logger.ts` — never `console.log` in server paths
- Prisma pool config: max=20, min=5, 30s idle timeout, 10s connect timeout

## ANTI-PATTERNS (THIS DIR)

- **Never** import `server-only` modules into client code
- **Never** use `as any`, `@ts-ignore`, `@ts-expect-error` — must use proper types
- **Never** create duplicate Prisma clients — use the singleton from `lib/prisma.ts`

# lib/ — Shared Utilities & Module Map


**Visual Redesign (2026-04-12):** Lib utilities were NOT modified during the visual redesign. No business logic, type definitions, or utility functions were altered. Only CSS class references in shared constants may have been updated.
**Parent:** [Root AGENTS.md](../../AGENTS.md)

## OVERVIEW

63 files. Foundation layer for the entire app — database access, AI integration, security, analytics, SEO, caching, and widget infrastructure. Most-referenced module: `prisma.ts` (110 consumers).

## STRUCTURE

```
lib/
├── ai/                    # 15 files — AI SDK, policies, caching, trade access, prompts
├── analytics/             # 4 files — Risk metrics (v1), VaR, metric definitions
├── security/              # 8 files — Auth guard, OAuth, MFA, token crypto, CSP, slug
├── performance/           # 8 files — Next.js config, render optimization, code splitting
├── widget-policy-engine/  # 10 files — Risk scoring, decision engine, metrics, message bus
├── __tests__/             # 14 files — Co-located tests
├── cache/                 # Cache invalidation utilities
├── config/                # App configuration
├── constants/             # Shared constants
├── debug/                 # Dev debugging tools
├── domain/                # Domain logic (pnl-calculator.ts)
├── formatting/            # Currency, date formatting
├── prop-firms/            # Prop firm utilities
├── supabase/              # Supabase helpers
├── prisma.ts              # Prisma client singleton (110 consumers)
├── redis-client.ts        # Dual Redis/Upstash cache
├── supabase.ts            # Browser client for SSR
├── utils.ts               # cn(), calculateStatistics, formatCalendarData
├── seo.ts                 # buildPublicMetadata, JSON-LD schemas
├── env.ts                 # Env validation (Zod)
├── logger.ts              # Structured logging
├── rate-limit.ts          # Distributed rate limiting (Upstash)
├── score-calculator.ts    # Trading Score derivation (SINGLE SOURCE OF TRUTH)
├── data-types.ts          # Trade/account normalization
├── site-url.ts            # getSiteOrigin(), getSiteUrl()
├── plan-configs.ts        # Whop payment plan configs
└── [30+ more utility files]
```

## WHERE TO LOOK

| Task | File | Key Export |
|------|------|------------|
| Database access | `prisma.ts` | `prisma` (singleton) |
| AI feature access | `ai/client.ts` | `getAiLanguageModel(feature)` |
| AI policy checks | `ai/policy.ts` | `getAiPolicy(feature)` |
| AI route guard | `ai/route-guard.ts` | `guardAiRequest()` |
| Support model list | `ai/support-models.ts` | `SUPPORT_MODEL_ALLOWLIST` |
| Auth rate limiting | `security/auth-attempts.ts` | `checkAuthGuard()` |
| Token encryption | `security/token-crypto.ts` | `encryptToken()`, `decryptToken()` |
| CSP headers | `security/csp.ts` | `buildAppCsp()`, `buildEmbedCsp()` |
| Risk metrics | `analytics/metrics-v1.ts` | `calculateRiskMetricsV1()` |
| VaR calculations | `analytics/var.ts` | `computeHistoricalVar()` |
| SEO metadata | `seo.ts` | `buildPublicMetadata()`, `buildOrganizationSchema()` |
| Env validation | `env.ts` | `getEnv()`, `assertRequiredEnv()` |
| Rate limiting | `rate-limit.ts` | `rateLimit()` |
| Trading Score | `score-calculator.ts` | `deriveScoreMetricsFromTrades()` — MUST use for all score derivation |
| Widget encryption | `widget-encryption.ts` | `widgetEncryptionService` (AES-256-GCM) |
| Widget registry types | `widget-layout.ts` | WidgetSize, layout modes |
| Financial math | `financial-math.ts` | Decimal.js helpers, PnL calculations |
| Currency formatting | `formatting/currency.ts` | `formatCurrencyAmount()`, `formatCompactCurrency()` |
| Feature flags | `feature-flags.ts` | `isFeatureEnabled()`, `getRolloutStatus()` |
| API error response | `api-response.ts` | `apiError()` |

## DEPENDENCY RANKING

| Rank | Module | Files Importing |
|------|--------|-----------------|
| 1 | `prisma.ts` | 110 |
| 2 | `ai/*` (all) | 38 |
| 3 | `redis-client.ts` | 15 |
| 4 | `security/*` | 12 |
| 5 | `utils.ts` | 6 |
| 6 | `analytics/*` | 5 |
| 7 | `supabase.ts` | 5 |

## CONVENTIONS

- **No root barrel export** — All imports use full paths: `@/lib/prisma`, `@/lib/ai/client`
- **Widget Policy Engine** has its own barrel at `lib/widget-policy-engine/index.ts`
- **Cache pattern**: Use `use cache` + `cacheLife`/`cacheTag` in server read helpers, NOT `unstable_cache`
- **Financial math**: All Decimal operations through `financial-math.ts` — never use raw JS arithmetic for money
- **AI features**: Must go through `ai/policy.ts` for entitlement checks + `ai/route-guard.ts` for route protection

## ANTI-PATTERNS

- **Do not** import Prisma directly in client components — use server actions or API routes
- **Do not** create new `as any` casts — the 35+ existing instances are tech debt
- **Do not** duplicate Trading Score math — always use `score-calculator.ts`
- **Do not** use `unstable_cache` — use `use cache` directive
- **Do not** hardcode AI model names — use `ai/client.ts` helpers

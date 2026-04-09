# External Integrations

**Analysis Date:** 2026-04-09

## Authentication & Identity

**Supabase Auth:**
- Provider: Supabase (Auth)
- Purpose: Primary authentication system (OAuth, magic links, password-based)
- Client libraries:
  - `@supabase/ssr` 0.8.0 - Server-side rendering auth helpers
  - `@supabase/supabase-js` 2.93.2 - Browser and Node.js client
- Browser client: `lib/supabase.ts` (`createBrowserClient`)
- Server client: `server/auth.ts` (`createServerClient` with cookie handling)
- Route client: `lib/supabase/route-client.ts` (`createRouteClient` for API routes)
- OAuth providers configured:
  - Google (`server/auth.ts` - `signInWithGoogle`)
  - Discord (`server/auth.ts` - `signInWithDiscord`)
- Auth methods:
  - Email magic link / OTP (`signInWithEmail`, `verifyOtp`)
  - Password login/register (`signInWithPasswordAction`, `signUpWithPasswordAction`)
  - Identity linking/unlinking (`server/auth-identity.ts`)
- Session strategy: Cookie-based (httpOnly, secure in production, sameSite=lax)
- Auth callback: `app/api/auth/callback/`
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` (required in production)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required in production)
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server-side alternatives)
- Auth security: Rate-limited login attempts (`lib/security/auth-attempts.ts`), password strength validation (`lib/security/password-validation.ts`), error obfuscation

## Payment & Billing

**Whop:**
- SDK: `@whop/sdk` 0.0.23
- Purpose: Primary payment processor and subscription management
- Client: `lib/whop.ts` (lazy-initialized singleton via Proxy)
- Key integration points:
  - Checkout: `app/api/whop/checkout/route.ts`
  - Team checkout: `app/api/whop/checkout-team/route.ts`
  - Webhooks: `app/api/whop/webhook/route.ts` (receives membership, payment, refund, invoice events)
- Payment service: `server/payment-service.ts` (checkout creation, transaction recording, invoices, refunds)
- Subscription manager: `server/subscription-manager.ts` (subscription lifecycle, grace period, trial days)
- Billing: `server/billing.ts` (subscription details, plan management via Whop API)
- Webhook service: `server/webhook-service.ts` (signature verification, idempotent processing, retry logic)
- Plans: monthly ($29), quarterly ($75), yearly ($250), lifetime ($499) - configured in `server/payment-service.ts`
- Trial: 14-day trial period
- Grace period: 7 days after cancellation
- Environment variables:
  - `WHOP_API_KEY` (required in production)
  - `WHOP_COMPANY_ID`
  - `NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID`
  - `NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID`
  - `NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID`
  - `NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID`

**Stripe:**
- SDK: `stripe` 20.3.0
- Purpose: Currency formatting helpers only (not a payment processor here)
- Helper: `lib/stripe-helpers.ts` (`formatAmountForDisplay`, `formatAmountForStripe`)

## AI / LLM

**OpenRouter (primary AI gateway):**
- SDK: `@ai-sdk/openai` 3.0.10 (used with OpenRouter base URL)
- Purpose: AI chat, analysis, trade formatting, search, editor, support, transcriptions
- Client: `lib/ai/client.ts` (`createOpenAI` with `baseURL` pointing to OpenRouter)
- Default model: `glm-4.7-flash`
- Policy system: `lib/ai/policy.ts` - Per-feature model selection, temperature, timeout, max steps
- Entitlement gating: `lib/ai/entitlements.ts` - Subscription-based access control for AI features
- Response caching: `lib/ai/cache.ts` - Redis + in-memory cache for non-streaming AI responses
- Rate limiting: `lib/rate-limit.ts` (30 requests/60s for AI chat)
- Prompt safety: `lib/ai/prompt-safety.ts` - Input sanitization and safety enforcement
- Telemetry: `lib/ai/telemetry.ts` - Usage logging, error categorization
- Timeout management: `lib/ai/timeout.ts` - Configurable request timeouts
- AI features (per-feature model override available):
  - `chat` - Trading coaching chatbot (temp: 0.3)
  - `support` - AI support assistant (temp: 0.3)
  - `editor` - Trade journal editor (temp: 0.3)
  - `mappings` - Instrument mapping (temp: 0.1)
  - `format-trades` - Trade data formatting (temp: 0.1)
  - `analysis` - Performance analysis (temp: 0.25)
  - `search` - Semantic search (temp: 0.1)
- AI chat tools (function calling): `app/api/ai/chat/tools/` (journal entries, trades, equity charts, financial news, week summaries)
- Environment variables:
  - `OPENROUTER_API_KEY` (required for AI features)
  - `AI_BASE_URL` (defaults to `https://openrouter.ai/api/v1`)
  - `AI_MODEL` / `AI_MODEL_DEFAULT` (default model)
  - `AI_MODEL_CHAT`, `AI_MODEL_SUPPORT`, `AI_MODEL_EDITOR`, `AI_MODEL_MAPPINGS`, `AI_MODEL_FORMAT_TRADES`, `AI_MODEL_ANALYSIS`, `AI_MODEL_SEARCH` (per-feature overrides)
  - `AI_TIMEOUT_MS` (default: 60000)
  - `AI_MAX_STEPS` (default: 10)
  - `AI_LOG_SAMPLE_RATE` (default: 0.25)
  - `OPENAI_API_KEY` (alternative to OpenRouter)

## Database

**PostgreSQL:**
- Provider: Supabase PostgreSQL (managed) or self-hosted PostgreSQL 16
- ORM: Prisma 7.2.0 with `@prisma/adapter-pg` driver adapter
- Schema: `prisma/schema.prisma` (1567 lines, 50+ models)
- Generated client: `prisma/generated/prisma/`
- Connection management: `lib/prisma.ts`
  - Custom `pg.Pool` with intelligent pool sizing (5 max in serverless, 20 max in dev)
  - Automatic Supabase pooler mode detection (session -> transaction mode port switch)
  - SSL auto-configuration for Supabase hosts
  - Connection timeout: 10s (prod) / 15s (dev)
  - Idle timeout: 30s (prod) / 10s (dev)
  - Pool utilization monitoring with rate-limited warnings
- Migrations: `prisma/migrations/`
- Seeders: `prisma/seeders/`
- Schema config: `prisma.config.ts` (env-based datasource URL selection)
- Key models: User, Account, Trade, Group, Subscription, PaymentTransaction, Invoice, Refund, Team, TeamMember, PropFirm, BlogPost, AiRequestLog, etc.
- Environment variables:
  - `DATABASE_URL` (fallback)
  - `POSTGRES_PRISMA_URL` (preferred - pooled)
  - `POSTGRES_URL` (alternative)
  - `DIRECT_URL` (for migrations/admin)
  - `POSTGRES_URL_NON_POOLING` (fallback)
  - `PG_POOL_MAX`, `PG_POOL_MIN` (pool sizing)
  - `PG_POOL_IDLE_TIMEOUT_MS`, `PG_POOL_CONNECT_TIMEOUT_MS`
  - `PGSSL_ENABLE`, `PGSSL_REJECT_UNAUTHORIZED` (SSL config)

## Caching

**Redis:**
- Client: Custom implementation in `lib/redis-client.ts` (no external Redis library)
- Supports two Redis backends:
  1. Local Redis via TCP socket (RESP2 protocol) - `REDIS_URL`
  2. Upstash Redis via HTTP REST API - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
- Features:
  - Namespace-based cache versioning (automatic invalidation)
  - JSON get/set with TTL
  - In-memory fallback with LRU eviction (max 500 entries)
  - Automatic fallback chain: Local Redis -> Upstash -> In-memory
  - Query optimizer cache (`getCachedResult`/`setCachedResult`)
  - Cache sweep intervals (60s cleanup)
- Environment variables:
  - `REDIS_URL` (local Redis, e.g. `redis://localhost:6379`)
  - `UPSTASH_REDIS_REST_URL` (Upstash REST endpoint)
  - `UPSTASH_REDIS_REST_TOKEN` (Upstash auth token)

## Email

**Resend:**
- SDK: `resend` 4.8.0
- Purpose: Transactional email delivery
- Template framework: `@react-email/components` + `@react-email/render`
- Email templates in `components/emails/`:
  - `welcome.tsx` - New user welcome
  - `weekly-recap.tsx` - Weekly performance summary
  - `renewal-notice.tsx` - Subscription renewal reminder
  - `team-invitation.tsx` - Team invite
  - `new-feature.tsx` - New feature announcement
  - `black-friday.tsx` - Promotional
  - `missing-data.tsx` - Data gap notification
  - `support-request.tsx`, `support-subscription-error.tsx` - Support emails
- API routes:
  - `app/api/email/welcome/route.ts` (triggered by Supabase auth webhook)
  - `app/api/email/weekly-summary/route.ts`
  - `app/api/email/renewal-notice/route.ts`
  - `app/api/email/unsubscribe/route.ts`
  - `app/api/email/thumbnail/route.ts`
  - `app/api/email/format-name/route.ts`
- Environment variables:
  - `RESEND_API_KEY` (required for email delivery)
  - `WELCOME_WEBHOOK_SECRET` (auth for welcome webhook)

## File Storage

**Supabase Storage:**
- Purpose: Trade image uploads, user file storage
- Client helpers: `lib/supabase-storage.ts` (URL transformation, image resizing via query params)
- Image path utilities: `lib/trade-image-path.ts`
- File upload: `react-dropzone` 14.3.8 for client-side file selection
- Image processing: `sharp` 0.33.5 for server-side image manipulation
- Trade image upload/update: `server/trades.ts` (save/update trade images)

## Trading Platform Integrations

**Tradovate:**
- Purpose: Futures trading platform data synchronization
- API routes:
  - `app/api/tradovate/synchronizations/` (CRUD for sync connections)
  - `app/api/tradovate/sync/` (OAuth flow and data sync)
- Server actions: `server/imports/tradovate-actions.ts`
- Client store: `store/tradovate-sync-store.ts` (Zustand with persist middleware)
- Sync context: `context/tradovate-sync-context.tsx`
- Features: Demo/live environment toggle, account listing, trade import
- Cron: Token renewal at 06:00 UTC daily (`vercel.json` cron: `/api/cron/renew-tradovate-token`)

**Rithmic:**
- Purpose: Futures trading platform data synchronization
- Client-side encrypted credential storage: `lib/rithmic-storage.ts` (AES-GCM encryption via Web Crypto API)
- API routes:
  - `app/api/rithmic/synchronizations/`
  - `app/api/rithmic/encryption-key/` (session-derived encryption key)
- Client store: `store/rithmic-sync-store.ts`
- Sync context: `context/rithmic-sync-context.tsx`

**MT5 (MetaTrader 5):**
- Purpose: Forex/CFD trading platform data import
- API route: `app/api/mt5/`
- Import service: `mt5_import_service/`
- Database model: `MT5Account`

**Thor (External API Token):**
- Purpose: External API access token generation for users
- Server actions: `server/thor.ts` (`generateThorToken`, `getThorToken`)
- Token stored as hash in User model with expiry

## Data Providers

**Databento:**
- Purpose: Historical market data (futures bars, MAE/MFE calculations)
- Client: `lib/databento.ts`
- API: `https://hist.databento.com/v0`
- Symbol mapping for futures contracts (ES, NQ, etc.)
- Environment variable: `DATABENTO_API_KEY`

**Investing.com (cron-based):**
- Purpose: Scheduled investing news/data scraping
- Cron endpoint: `/api/cron/investing` (runs Mondays at 05:00 UTC for en + fr)

## Observability & Monitoring

**Vercel Analytics:**
- SDK: `@vercel/analytics` 1.5.0
- Component: `<Analytics />` in `app/layout.tsx`
- Purpose: Page views, web vitals, custom events

**Vercel Speed Insights:**
- SDK: `@vercel/speed-insights` 1.2.0
- Component: `<SpeedInsights />` in `app/layout.tsx`
- Purpose: Core Web Vitals monitoring

**Structured Logging:**
- Library: Custom logger (`lib/logger.ts`) inspired by Pino patterns
- Features:
  - JSON structured output in production, human-readable in dev
  - Log levels: debug, info, warn, error
  - Context stack with correlation IDs
  - Automatic sensitive data redaction (tokens, secrets, passwords)
  - Error threshold alerting (configurable window/count)
  - Child loggers with bound context
- Environment variables:
  - `LOG_LEVEL` (default: `info`)
  - `ERROR_ALERT_THRESHOLD` (default: 20)
  - `ERROR_ALERT_WINDOW_MS` (default: 300000)

**Performance Monitoring:**
- Custom scripts in `scripts/perf-*.mjs` (Lighthouse, bundle analysis, route budgets)
- Dashboard runtime performance: `scripts/perf-dashboard-runtime.mjs`
- Bundle size analysis: `scripts/analyze-bundle.mjs`

**Content Security Policy:**
- Custom CSP builder: `lib/security/csp.ts`
- Enforced via middleware (`proxy.ts`)
- Configurable via env vars:
  - `CSP_ENABLED` (default: enabled)
  - `CSP_REPORT_ONLY`
  - `CSP_STRICT_MODE`
- CSP violation reporting: `app/api/csp-report/`

## Content & Blog

**MDX Content:**
- Framework: `@mdx-js/loader` + `@next/mdx`
- Blog posts: `content/` directory with gray-matter frontmatter
- Code highlighting: `shiki` 3.13.0
- Custom MDX components: `mdx-components.tsx`

## Internationalization

**next-international:**
- Client provider: `locales/client.ts` (`I18nProviderClient`)
- Server utilities: `locales/server.ts`
- Supported locales: en, fr, es, it, hi, ja
- Locale route parameter: `app/[locale]/`
- Middleware: `proxy.ts` handles locale detection and routing via `createI18nMiddleware`

## Referral System

**Custom Referral:**
- Server: `server/referral.ts`
- Storage: `lib/referral-storage.ts`
- Features: Referral codes with slug generation, redemption tracking, tier rewards
- Database models: `Referral`, `ReferralRedemption`

## Webhooks

**Incoming Webhooks:**

| Source | Endpoint | Purpose |
|--------|----------|---------|
| Whop | `POST /api/whop/webhook` | Membership, payment, refund, invoice events |
| Supabase Auth | `POST /api/email/welcome` | New user signup trigger |
| Whop | `POST /api/whop/checkout` | Checkout session creation |
| Whop | `POST /api/whop/checkout-team` | Team checkout creation |

**Webhook Processing:**
- `server/webhook-service.ts` - Signature verification (HMAC), idempotent processing, retry logic (max 3 attempts)
- `server/webhook-schemas.ts` - Zod validation for membership, payment, refund, invoice payloads
- `lib/webhook-idempotency.ts` - Deduplication via `ProcessedWebhook` model

## Scheduled Jobs (Cron)

**Vercel Cron:**

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| `0 5 * * 1` (Mon 05:00 UTC) | `/api/cron/investing?lang=en&db=true` | Fetch investing news (English) |
| `0 5 * * 1` (Mon 05:00 UTC) | `/api/cron/investing?lang=fr&db=true` | Fetch investing news (French) |
| `0 9 * * *` (Daily 09:00 UTC) | `/api/cron/renewal-notice` | Send subscription renewal reminders |
| `0 6 * * *` (Daily 06:00 UTC) | `/api/cron/renew-tradovate-token` | Renew Tradovate API tokens |
| `0 3 * * *` (Daily 03:00 UTC) | `/api/cron/chat-retention` | Clean up old AI chat history |

**Cron Security:**
- Protected by `CRON_SECRET` environment variable
- Cron route: `app/api/cron/route.ts`

## Environment Variables

**Required in Production:**
- `DATABASE_URL` or `POSTGRES_PRISMA_URL` - PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `CRON_SECRET` - Cron endpoint authentication
- `WHOP_API_KEY` - Whop payment API
- `WHOP_COMPANY_ID` - Whop company identifier
- `OPENROUTER_API_KEY` - AI/LLM gateway

**Authentication:**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (server-side alternatives)
- `UNSUBSCRIBE_TOKEN_SECRET` (min 32 chars)

**AI/LLM:**
- `OPENROUTER_API_KEY`
- `AI_BASE_URL` (default: `https://openrouter.ai/api/v1`)
- `AI_MODEL` / `AI_MODEL_DEFAULT`
- `AI_MODEL_CHAT`, `AI_MODEL_SUPPORT`, `AI_MODEL_EDITOR`
- `AI_MODEL_MAPPINGS`, `AI_MODEL_FORMAT_TRADES`, `AI_MODEL_ANALYSIS`, `AI_MODEL_SEARCH`
- `AI_TIMEOUT_MS`, `AI_MAX_STEPS`, `AI_LOG_SAMPLE_RATE`
- `OPENAI_API_KEY` (alternative provider)

**Payment:**
- `WHOP_API_KEY`, `WHOP_COMPANY_ID`
- `NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID`
- `NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID`
- `NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID`
- `NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID`

**Database:**
- `DATABASE_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL`
- `DIRECT_URL`, `POSTGRES_URL_NON_POOLING`
- `PG_POOL_MAX`, `PG_POOL_MIN`
- `PG_POOL_IDLE_TIMEOUT_MS`, `PG_POOL_CONNECT_TIMEOUT_MS`
- `PGSSL_ENABLE`, `PGSSL_REJECT_UNAUTHORIZED`

**Caching:**
- `REDIS_URL` (local Redis)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (Upstash)

**Email:**
- `RESEND_API_KEY`
- `WELCOME_WEBHOOK_SECRET`

**Security:**
- `CSP_ENABLED`, `CSP_REPORT_ONLY`, `CSP_STRICT_MODE`
- `HEALTH_DETAILS_PUBLIC` (must not be `true` in production)

**Logging:**
- `LOG_LEVEL` (default: `info`)
- `ERROR_ALERT_THRESHOLD` (default: 20)
- `ERROR_ALERT_WINDOW_MS` (default: 300000)

**Data Providers:**
- `DATABENTO_API_KEY`

**Feature Flags:**
- `NEXT_PUBLIC_ENABLE_SKELETON_LOADING`
- `NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS`
- `NEXT_PUBLIC_ENABLE_LAZY_LOADING`
- `NEXT_PUBLIC_ENABLE_QUERY_CACHING`
- `NEXT_PUBLIC_PERF_ROLLOUT_PCT`
- `NEXT_PUBLIC_EMERGENCY_ROLLBACK`
- `NEXT_PUBLIC_UI_V2_ENABLED`

**Site/URL:**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_VERCEL_URL`
- `NEXT_PUBLIC_APP_URL`

**Secrets Location:**
- Environment variables (set via Vercel dashboard, `.env.local` for local dev, or Docker env)
- All validated through `lib/env.ts` Zod schema at runtime
- Production assertions enforced by `assertProductionEnv()` in `lib/env.ts`

---

*Integration audit: 2026-04-09*

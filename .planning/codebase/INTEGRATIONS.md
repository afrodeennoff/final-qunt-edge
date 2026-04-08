# External Integrations

**Analysis Date:** 2026-04-08

## Authentication & Identity

**Supabase Auth:**
- Purpose: Primary authentication provider (email/password, OAuth, session management)
- Client: `@supabase/ssr` 0.8.0 (server), `@supabase/supabase-js` 2.93.2 (client)
- Server client factory: `server/auth.ts` (uses `createServerClient` from `@supabase/ssr`)
- Browser client factory: `lib/supabase.ts` (uses `createBrowserClient` from `@supabase/ssr`)
- Auth server actions: `server/auth.ts`, `server/auth-password.ts`, `server/auth-identity.ts`, `server/auth-user.ts`
- Authorization: `server/authz.ts`, `lib/security/auth-attempts.ts`, `lib/security/auth-config.ts`
- MFA support: `lib/security/mfa-recovery.ts`
- OAuth state management: `lib/security/oauth-state.ts`
- Token crypto: `lib/security/token-crypto.ts`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**OAuth Providers:**
- Discord: `DISCORD_ID`, `DISCORD_SECRET`, `NEXT_PUBLIC_DISCORD_CONFIGURED`
- Google: `NEXT_PUBLIC_GOOGLE_CONFIGURED`, `REDIRECT_URL`
- Tradovate: `TRADOVATE_REDIRECT_URI` (OAuth flow for trading platform)

## Billing & Payments

**Whop (Primary):**
- Purpose: Subscription management, checkout, billing, license enforcement
- SDK: `@whop/sdk` 0.0.23
- Client: `lib/whop.ts` (lazy-initialized singleton with proxy)
- Service: `server/payment-service.ts` (PaymentService singleton with checkout session creation)
- Subscription management: `server/subscription-manager.ts`, `server/subscription.ts`
- Webhook processing: `server/webhook-service.ts` (WebhookService singleton with HMAC signature verification, retry logic, idempotency)
- Webhook schemas: `server/webhook-schemas.ts` (MembershipPayload, PaymentPayload, RefundPayload, InvoicePayload)
- Env vars: `WHOP_API_KEY`, `WHOP_CLIENT_SECRET`, `WHOP_WEBHOOK_SECRET`, `WHOP_COMPANY_ID`, `NEXT_PUBLIC_WHOP_APP_ID`
- Plan IDs: `NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID`, `NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID`, `NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID`, `NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID`, `NEXT_PUBLIC_WHOP_FREE_PLAN_ID`, `NEXT_PUBLIC_WHOP_TEAM_PLAN_ID`
- Security: `server/payment-security.ts`
- API routes: `app/api/whop/checkout/`, `app/api/whop/checkout-team/`, `app/api/whop/webhook/`
- Env validation: `server/whop-env-check.ts`

**Stripe (Legacy/Helpers):**
- Purpose: Currency formatting utilities (may have been primary billing previously)
- SDK: `stripe` 20.3.0
- Helpers: `lib/stripe-helpers.ts` (formatAmountForDisplay, formatAmountForStripe)
- Status: Appears to be legacy; Whop is the active billing provider

## Data Storage

**PostgreSQL (Supabase):**
- Purpose: Primary database for all application data
- ORM: Prisma 7.2.0 with `@prisma/adapter-pg` 7.2.0
- Schema: `prisma/schema.prisma`
- Generated client: `prisma/generated/prisma/`
- Client: `lib/prisma.ts`
- Pool tuning: `PG_POOL_MAX`, `PG_POOL_MIN`, `PG_POOL_IDLE_TIMEOUT_MS`, `PG_POOL_CONNECT_TIMEOUT_MS`
- Env vars: `DATABASE_URL` (pooled, port 6543), `DIRECT_URL` (migrations, port 5432), `DATABASE_HOST`, `POSTGRES_PRISMA_URL`
- Models include: User, Account, Trade, Subscription, Invoice, Referral, Team, BlogPost, AiUsageLedger, PropFirmReview, and 30+ more

**Supabase Storage:**
- Purpose: File/object storage (trade images, avatars, uploads)
- Client: `lib/supabase-storage.ts`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` (shared with auth)

**Redis (Caching):**
- Purpose: Query caching, cache versioning, session caching
- Client: `lib/redis-client.ts` (custom dual-provider: local Redis or Upstash REST)
- Fallback: In-memory cache when Redis unavailable
- Key prefix: `qunt:v1`
- Env vars: `REDIS_URL` (local), `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (Upstash)

## AI / LLM

**OpenRouter (Primary):**
- Purpose: AI features - trade analysis, chat, search, format trades, editor
- Client: `lib/ai/client.ts` (uses `@ai-sdk/openai` createOpenAI with OpenRouter base URL)
- Base URL: `AI_BASE_URL` (defaults to `https://openrouter.ai/api/v1`)
- Env vars: `OPENROUTER_API_KEY`, `AI_BASE_URL`
- Model routing: Per-feature model selection via `lib/ai/policy.ts`
- Features: analysis, chat, editor, format-trades, mappings, search, support, transcribe
- API routes: `app/api/ai/analysis/`, `app/api/ai/chat/`, `app/api/ai/editor/`, `app/api/ai/format-trades/`, `app/api/ai/mappings/`, `app/api/ai/search/`, `app/api/ai/support/`, `app/api/ai/transcribe/`
- Caching: `lib/ai/cache.ts`, `lib/ai/usage-budget.ts`
- Safety: `lib/ai/prompt-safety.ts`, `lib/ai/error-utils.ts`, `lib/ai/telemetry.ts`
- Trade access control: `lib/ai/trade-access.ts`

**OpenAI (Direct):**
- Purpose: Secondary/fallback AI provider
- SDK: `openai` 6.7.0
- Env var: `OPENAI_API_KEY`

**AI Model Configuration:**
- `AI_MODEL_DEFAULT`, `AI_MODEL`, `AI_MODEL_CHAT`, `AI_MODEL_SUPPORT`, `AI_MODEL_EDITOR`, `AI_MODEL_MAPPINGS`, `AI_MODEL_FORMAT_TRADES`, `AI_MODEL_ANALYSIS`, `AI_MODEL_SEARCH`
- `AI_TIMEOUT_MS`, `AI_MAX_STEPS`, `AI_LOG_SAMPLE_RATE`
- `AI_ROUTER_ENABLED`, `AI_ROUTER_PROVIDER_ORDER`, `AI_ROUTER_MAX_PRICE_INPUT`, `AI_ROUTER_MAX_PRICE_OUTPUT`

## Email / Notifications

**Resend:**
- Purpose: Transactional email (welcome, weekly summary, renewal notices, team invites)
- SDK: `resend` 4.8.0
- Email components: `@react-email/components` 0.5.7, `@react-email/render` 1.4.0
- Template builder: `react-email` 4.3.2 (devDependency)
- API routes: `app/api/email/welcome/`, `app/api/email/weekly-summary/`, `app/api/email/unsubscribe/`, `app/api/email/format-name/`, `app/api/email/thumbnail/`
- Env vars: `RESEND_API_KEY`, `SUPPORT_TEAM_EMAIL`, `SUPPORT_EMAIL`
- Reply-to addresses: `WELCOME_REPLY_TO`, `WEEKLY_SUMMARY_REPLY_TO`, `TEAM_INVITE_FROM`, `RENEWAL_NOTICE_REPLY_TO`
- Unsubscribe: `UNSUBSCRIBE_TOKEN_SECRET` (32+ chars), `lib/unsubscribe-token.ts`, `lib/unsubscribe-url.ts`

## Trading Platform Integrations

**Rithmic:**
- Purpose: Trading data synchronization from Rithmic platform
- API routes: `app/api/rithmic/encryption-key/`, `app/api/rithmic/synchronizations/`
- Server: `server/imports/` (import handling)
- Store: `store/rithmic-sync-store.ts`
- Context: `context/rithmic-sync-context.tsx`
- Storage: `lib/rithmic-storage.ts`
- Tutorial videos: `NEXT_PUBLIC_RITHMIC_PERFORMANCE_TUTORIAL_VIDEO`, `NEXT_PUBLIC_RITHMIC_ORDER_TUTORIAL_VIDEO`, `NEXT_PUBLIC_RITHMIC_SYNC_TUTORIAL_VIDEO`
- API URL: `NEXT_PUBLIC_RITHMIC_API_URL`

**Tradovate:**
- Purpose: Trading data synchronization from Tradovate platform
- API routes: `app/api/tradovate/sync/`, `app/api/tradovate/synchronizations/`
- Server: OAuth integration via `TRADOVATE_REDIRECT_URI`
- Store: `store/tradovate-sync-store.ts`
- Context: `context/tradovate-sync-context.tsx`
- Tutorial videos: `NEXT_PUBLIC_TRADEOVATE_TUTORIAL_VIDEO`, `NEXT_PUBLIC_TRADEOVATE_SYNC_TUTORIAL_VIDEO`
- Cron: Token renewal at `/api/cron/renew-tradovate-token` (daily 06:00)

**MT5 (MetaTrader 5):**
- Purpose: Automated trade import from MT5 terminals
- API routes: `app/api/mt5/accounts/`, `app/api/mt5/store/`, `app/api/mt5/test-connection/`
- External service: `mt5_import_service/` directory (separate import worker)
- Env vars: `MT5_API_TOKEN`, `IMPORT_WORKERS`, `MT5_TERMINALS_PER_WORKER`, `SYNC_INTERVAL_ACTIVE`, `SYNC_INTERVAL_NORMAL`, `SYNC_INTERVAL_INACTIVE`

**ETP (External Trading Platform):**
- Purpose: Generic trading platform token management
- API routes: `app/api/etp/v1/`

**Thor:**
- Purpose: External API token for trade data access
- Server: `server/thor.ts` (token generation with secure token crypto)

**NinjaTrader:**
- Tutorial video: `NEXT_PUBLIC_NINJATRADER_PERFORMANCE_TUTORIAL_VIDEO`
- No direct API integration detected (likely manual import)

**Quantower:**
- Tutorial video: `NEXT_PUBLIC_QUANTOWER_TUTORIAL_VIDEO`
- No direct API integration detected

**ATAS:**
- Tutorial video: `NEXT_PUBLIC_ATAS_TUTORIAL_VIDEO`
- No direct API integration detected

## Data Providers

**Databento:**
- Purpose: Historical market data (bars, MAE/MFE calculations)
- Client: `lib/databento.ts`
- Base URL: `https://hist.databento.com/v0`
- Env var: `DATABENTO_API_KEY`

## Monitoring & Observability

**Vercel Analytics:**
- Purpose: Web analytics
- SDK: `@vercel/analytics` 1.5.0
- Integration: `app/layout.tsx` (Analytics component)

**Vercel Speed Insights:**
- Purpose: Core Web Vitals monitoring
- SDK: `@vercel/speed-insights` 1.2.0
- Integration: `app/layout.tsx` (SpeedInsights component)

**Logging:**
- Framework: Pino 10.3.1 + pino-pretty 13.1.3
- Client: `lib/logger.ts` (custom logger with context stack, error window detection, sensitive key redaction)
- Log level: `LOG_LEVEL` env var (default: info)
- Error alerting: `ERROR_ALERT_THRESHOLD`, `ERROR_ALERT_WINDOW_MS`

**Sentry:**
- Status: Configured via `NEXT_PUBLIC_SENTRY_DSN` env var
- No dedicated Sentry SDK in dependencies; may be handled via Next.js or Vercel integration

**Performance Scripts:**
- `scripts/perf-lighthouse.mjs` - Lighthouse CI
- `scripts/perf-dashboard-runtime.mjs` - Runtime perf
- `scripts/perf-header-check.mjs` - HTTP header audit
- `scripts/perf-baseline.mjs` - Baseline comparison
- `scripts/perf-capture-baseline.mjs` - Capture baselines
- `scripts/analyze-bundle.mjs` - Bundle analysis

## Internationalization

**Framework:**
- `next-international` 1.3.1
- Server: `locales/server.ts` (createI18nServer)
- Client: `locales/client.ts` (createI18nClient with I18nProviderClient, useI18n, useScopedI18n, useChangeLocale, useCurrentLocale)
- Translation files: `locales/en.ts`, `locales/fr.ts`, `locales/hi.ts`, `locales/ja.ts`, `locales/es.ts`, `locales/it.ts`
- Fallback locales: de, pt, vi, zh, yo (all fall back to English)
- Supported locales: en, fr, hi, ja, es, it, de, pt, vi, zh, yo (11 total)
- Route structure: `app/[locale]/...` with locale prefix

## CI/CD & Deployment

**Vercel (Primary):**
- Platform: Vercel (managed hosting)
- Config: `vercel.json`
- Analytics: `@vercel/analytics`
- Speed Insights: `@vercel/speed-insights`
- Functions: `@vercel/functions` 2.2.13
- Sandbox: `@vercel/sandbox` 1.0.2
- CLI: `vercel` 50.41.0

**Cron Jobs (Vercel):**
- `/api/cron/investing?lang=fr&db=true` - Weekly Monday 05:00 (French)
- `/api/cron/investing?lang=en&db=true` - Weekly Monday 05:00 (English)
- `/api/cron/renewal-notice` - Daily 09:00
- `/api/cron/renew-tradovate-token` - Daily 06:00
- `/api/cron/chat-retention` - Daily 03:00
- Security: Protected by `CRON_SECRET` / `VERCEL_CRON_SECRET`

**Docker / VPS (Alternative):**
- Dockerfiles: `Dockerfile` (Node/npm), `Dockerfile.bun` (Bun)
- Docker Compose: `docker-compose.yml`, `docker-compose.prod.yml`
- PM2 config: `ecosystem.config.cjs`
- Deploy script: `scripts/vps-deploy-bun.sh`

**GitHub Actions:**
- Workflow directory: `.github/` present
- GitHub token: `GITHUB_TOKEN` env var

## Webhooks & Callbacks

**Incoming Webhooks:**

**Whop Webhooks:**
- Endpoint: `app/api/whop/webhook/`
- Events: Membership (created/updated/deleted), Payment, Refund, Invoice
- Verification: HMAC-SHA256 with `WHOP_WEBHOOK_SECRET`
- Processing: `server/webhook-service.ts` (WebhookService singleton with idempotency, retry up to 3 attempts)
- Schema validation: `server/webhook-schemas.ts`

**Supabase Webhooks:**
- Secret: `SUPABASE_WEBHOOK_SECRET`
- Purpose: Database event triggers (existence detected, handler details in webhook models)

**Outgoing Webhooks:**
- None detected as direct outgoing webhook dispatchers

## Content & Media

**MDX Content:**
- Blog posts: MDX support via `@next/mdx` 16.0.7, `@mdx-js/loader` 3.1.1, `@mdx-js/react` 3.1.1
- Remote MDX: `next-mdx-remote` 6.0.0
- Syntax highlighting: `shiki` 3.13.0, `rehype-pretty-code` 0.14.1
- Remark plugins: `remark-gfm` 4.0.1, `remark-squeeze-paragraphs` 6.0.0
- Rehype plugins: `rehype-autolink-headings` 7.1.0, `rehype-img-size` 1.0.1, `rehype-slug` 6.0.0
- Content frontmatter: `gray-matter` 4.0.3

**YouTube:**
- Integration: `youtube-transcript` 1.2.1 (transcript extraction for tutorials)
- API key: `YOUTUBE_API_KEY`
- Video IDs: Multiple `NEXT_PUBLIC_*_TUTORIAL_VIDEO` env vars for onboarding and platform tutorials

**Image Processing:**
- Sharp 0.33.5 - Server-side image optimization
- Canvas 3.2.0 - Server-side rendering (chart screenshots)
- html2canvas 1.4.1 - Client-side screenshot capture

## Referral System

- Server: `server/referral.ts` (getOrCreateReferral, ReferralAlreadyAppliedError)
- Slug generation: `lib/security/slug.ts`
- Storage: `lib/referral-storage.ts`

## Discord

- Purpose: Community and notification channel
- Invite link: `NEXT_PUBLIC_DISCORD_INVITATION`
- OAuth: `DISCORD_ID`, `DISCORD_SECRET`

## Environment Configuration

**Required env vars (production):**
- `DATABASE_URL` - PostgreSQL connection (pooled)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin access
- `CRON_SECRET` - Cron job authentication
- `VERCEL_CRON_SECRET` - Vercel cron authentication
- `ENCRYPTION_KEY` - Data encryption at rest
- `TOKEN_CRYPTO_KEY` - Token signing (32+ chars)
- `RESEND_API_KEY` - Email delivery
- `WHOP_API_KEY` - Billing
- `WHOP_WEBHOOK_SECRET` - Webhook verification
- `WHOP_COMPANY_ID` - Whop company
- `OPENROUTER_API_KEY` - AI features
- `AI_BASE_URL` - AI endpoint

**Optional env vars:**
- `REDIS_URL` / `UPSTASH_REDIS_REST_URL` + token - Caching
- `OPENAI_API_KEY` - Secondary AI provider
- `DATABENTO_API_KEY` - Market data
- `GITHUB_TOKEN` - GitHub API access
- `MT5_API_TOKEN` - MT5 import service
- `YOUTUBE_API_KEY` - YouTube transcript extraction
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- `NEXT_PUBLIC_CDN_URL` - CDN for static assets

**Feature flag env vars:**
- `NEXT_PUBLIC_ENABLE_SKELETON_LOADING`
- `NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS`
- `NEXT_PUBLIC_ENABLE_LAZY_LOADING`
- `NEXT_PUBLIC_ENABLE_QUERY_CACHING`
- `NEXT_PUBLIC_PERF_ROLLOUT_PCT`
- `NEXT_PUBLIC_EMERGENCY_ROLLBACK`
- `NEXT_PUBLIC_UI_V2_ENABLED`

**Secrets location:**
- `.env` / `.env.local` / `.env.production.local` (local development)
- Vercel environment variables (production)
- `.env.example` documents all required vars

**Environment validation:**
- `lib/env.ts` - Zod-validated env schema at runtime
- `lib/env.ts:assertProductionEnv()` - Enforces required vars in production
- `lib/env.ts:assertSecurityEnvConsistency()` - Prevents insecure production configs

---

*Integration audit: 2026-04-08*

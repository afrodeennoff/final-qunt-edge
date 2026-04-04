# lib/ai — AI Layer (Client, Policy, Telemetry, Entitlements)

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions.

**Scope**: `lib/ai/`

## OVERVIEW
AI integration layer with Vercel AI SDK (`@ai-sdk/openai`), entitlements, telemetry, and prompt safety.

## CONFIGURATION

All AI features are configured via 3 environment variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `AI_API_KEY` | API key for the AI provider | `sk-...` |
| `AI_BASE_URL` | OpenAI-compatible base URL | `https://api.openai.com/v1` |
| `AI_MODEL` | Model identifier used for all AI features | `gpt-4o-mini` |

Operational overrides (optional):

| Variable | Purpose | Default |
|----------|---------|---------|
| `AI_TIMEOUT_MS` | Request timeout in milliseconds | `60000` |
| `AI_MAX_STEPS` | Max tool-call steps per request | `10` |
| `AI_LOG_SAMPLE_RATE` | Fraction of successful requests to log | `0.25` |

## ARCHITECTURE

```
client.ts
    └── getAiLanguageModel(feature) → creates model via @ai-sdk/openai
    └── Proxy wrapper adds Redis/in-memory caching for doGenerate only
```

## KEY FILES

| File | Purpose |
|------|---------|
| `client.ts` | AI client factory, `getAiLanguageModel()`, caching proxy |
| `policy.ts` | Per-feature temperature/timeouts, model resolution from `AI_MODEL` |
| `entitlements.ts` | AI feature entitlement checks |
| `telemetry.ts` | AI usage logging |
| `usage-budget.ts` | Usage budget tracking |
| `prompt-safety.ts` | Prompt injection detection (threshold: 0.5) |
| `route-guard.ts` | AI route protection (auth + entitlements + budget + rate-limit) |
| `trade-access.ts` | AI trade data access control |
| `trade-normalization.ts` | AI trade data normalization |
| `get-all-trades.ts` | Trade data fetching for AI (user-scoped) |
| `errors.ts` | AI error types |
| `error-utils.ts` | AI error utilities |
| `timeout.ts` | AI request timeout utilities |
| `cache.ts` | AI response caching (Redis + in-memory) |

## SECURITY RULES

- **No hardcoded credentials**: All AI keys read from `AI_API_KEY` env var
- **No hardcoded URLs**: Base URL read from `AI_BASE_URL` env var
- **Cache keys**: Always include feature identifier to prevent cross-feature pollution
- **Budget**: Must **never** fall back to in-memory store when Redis unavailable → throw explicit error
- **Prompt injection**: High-risk threshold at `0.5`

## CONVENTIONS

- Routes use `getAiLanguageModel(feature)` for all AI model access
- All AI routes must pass through `route-guard.ts`
- Entitlements checked via `entitlements.ts` before AI calls
- Telemetry logged via `telemetry.ts` for all AI requests

## AI ROUTE ERROR CONTRACT

All AI routes standardize on:
```typescript
{ error: { code, message, details? } }
```
Use `apiError()` from `lib/api-response.ts` — never return raw strings as errors.

## DEPENDENCIES

- `lib/rate-limit.ts` — Rate limiting for AI routes
- `lib/redis-client.ts` — Redis connection
- `lib/logger.ts` — Logging
- `lib/api-response.ts` — `apiError()` helper

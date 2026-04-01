# app/api Directory — API Route Handlers

> **Conventions & Developer Guide**: See root `./AGENTS.md` for shared conventions (TypeScript, Server Actions).

**Scope**: `app/api/`

## OVERVIEW
Next.js App Router API routes. Organized by domain: AI, auth, email, cron, webhook, billing, broker integrations, and imports.

## ROUTE GROUPS

### AI Routes (`app/api/ai/`)
| Route | Purpose | Auth |
|-------|---------|------|
| `chat/` | AI trading coach chat | session + entitlement |
| `editor/` | Rich text editor AI assist | session + entitlement |
| `support/` | Support AI | session + entitlement |
| `transcribe/` | Audio transcription | session + entitlement |
| `search/` | AI-powered trade search | session + entitlement |
| `analysis/` | Trade analysis (accounts, instrument, time-of-day, global) | session + entitlement |
| `format-trades/` | AI field mapping | session + entitlement |
| `analyze/` | Unified analysis endpoint (type-based dispatch) | session + entitlement |

**AI Error Contract**: All routes use `{ error: { code, message, details? } }` via `apiError()`.

### Auth Routes (`app/api/auth/`)
| Route | Purpose |
|-------|---------|
| `callback/` | OAuth/callback handler — canonical redirect base |

### Email Routes (`app/api/email/`)
| Route | Purpose | Auth |
|-------|---------|------|
| `unsubscribe/` | Unsubscribe (signed token) | token-validated |
| `welcome/` | Welcome webhook | webhook secret |
| `weekly-summary/` | Weekly digest | service auth |
| `thumbnail/` | Email thumbnail generation | service auth |

### Cron Routes (`app/api/cron/`)
| Route | Purpose | Auth |
|-------|---------|------|
| `investing/` | Investment cron | Bearer CRON_SECRET |
| `compute-trade-data/` | Trade data computation | Bearer CRON_SECRET |

### Webhook Routes (`app/api/`)
| Route | Purpose | Auth |
|-------|---------|------|
| `whop/webhook/` | Whop payment webhooks | webhook signature |
| `stripe/webhook/` | Stripe webhooks | webhook signature |

### Broker Integration Routes
| Route | Purpose |
|-------|---------|
| `thor/store/` | THOR trade ingestion |
| `etp/v1/store/` | ETP order ingestion |
| `rithmic/` | Rithmic API proxy |
| `tradovate/` | Tradovate API proxy |
| `imports/ibkr/` | IBKR import (extract, fifo, ocr) |

### Health & Utility
| Route | Purpose |
|-------|---------|
| `health/` | Health endpoint with DB latency |
| `trader-profile/benchmark/` | Benchmark data (force-dynamic, no-store) |

## CONVENTIONS

- **Auth**: Use `getDatabaseUserId()` from `server/auth.ts` — never trust caller headers
- **Cron**: Require `Authorization: Bearer ${CRON_SECRET}` — fail closed if missing
- **Webhooks**: Validate signatures before processing
- **AI routes**: Must use `getAiLanguageModel()` from `lib/ai/client.ts`
- **Error responses**: Use `apiError()` for consistent contract
- **Cache headers**: `no-store` on dynamic data, explicit public cache on public routes

## ANTI-PATTERNS (THIS DIR)

- **Never** create custom OpenAI clients in routes — use `getAiLanguageModel()`
- **Never** expose provider keys in logs or responses
- **Never** return stack traces in error responses
- **Never** accept caller-controlled `userId` for ownership writes
- **Never** return `error: string` — use nested `{ error: { code, message } }`

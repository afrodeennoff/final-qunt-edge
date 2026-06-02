# Qunt Edge MCP — Model Context Protocol Integration

> **Current Status:** The primary endpoints use a Streamable HTTP compatible implementation (enhanced custom handler + official SDK transport available at /api/mcp/v2). All 95+ tools are exposed on the main endpoint. Supports remote HTTP (Grok via xAI Responses API, Claude Custom Connectors, etc.) and stdio (via `bun run mcp:stdio` forwarder that gives full tool catalog over stdio to your hosted instance). Key format and URLs unchanged.

## Overview

The [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io) is an open standard that enables AI assistants (Claude, Cursor, Cline, etc.) to interact directly with your Qunt Edge trading data. Instead of asking you to copy-paste numbers, your AI can query live account health, trade history, risk metrics, and more — all through a standardized JSON-RPC interface.

Qunt Edge exposes **3 MCP endpoints** with different authentication levels. After the full MCP swarm audit + implementation (see `docs/mcp-audit-2026-05-29.md`), the platform now exposes **95 unique tools** with near-complete coverage of dashboard, imports, AI, teams, journal, layouts, admin, and public features.

| Endpoint | Auth | Tools | Use Case |
|---|---|---|---|
| `POST /api/mcp` | User API key (`qunt_usr_`) | ~82 personal/user + 13 public | Full trading data, accounts, trades, journal CRUD, images, imports (IBKR/Tradovate/etc), AI suite, teams, layouts, payouts + public content |
| `POST /api/mcp/public` | None | 13 public | Browse prop firms, deals, blog, leaderboard, community, challenges, comparisons |
| `POST /api/mcp/admin` | Admin API key (`qunt_adm_`) | ~82 + 13 + 15 admin (incl. email tools) | Full platform administration, moderation, content CRUD, email/newsletter dispatch |

**Security Model (enforced on 100% of tools):** Every tool uses `server/mcp/security.ts` guards (`requireUserId(ctx)`, `assertNoCrossUserAccess`, `requireAdmin(ctx)` for admin). **Only `ctx.userId` from the resolved API key is ever used** — no tool accepts or trusts `userId`/`accountId` etc. from arguments. All Prisma queries are strictly `WHERE userId = ctx.userId` (or team-membership scoped for teams). No cross-user leakage possible. Every call is audited to `mcpAuditLog`. Swarm achieved full guard coverage + TDD tests on all new paths (images, imports, AI, teams, layouts, journal CRUD, admin email).

## Quick Start

### 1. Generate an API Key

Log in to your Qunt Edge account and go to **Settings → API Keys**, or call the generation endpoint:

```bash
# Generate a user API key
curl -X POST https://qunt-edge.vercel.app/api/mcp/keys \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "claude-desktop"}'

# Response includes:
# {
#   "success": true,
#   "result": {
#     "key": "qunt_usr_<base64url-random-bytes>",
#     "name": "claude-desktop",
#     "role": "user",
#     "createdAt": "..."
#   }
# }
```

### 2. Test Your Connection

```bash
# Ping the server
curl -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping","id":1}'

# List available tools
curl -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### 3. Call a Tool

```bash
# Get account health
curl -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": { "name": "get_account_health", "arguments": {} },
    "id": 1
  }'

# Get performance summary
curl -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_performance_summary",
      "arguments": { "startDate": "2025-01-01", "endDate": "2025-12-31" }
    },
    "id": 1
  }'

# Public endpoint — no auth needed
curl -X POST https://qunt-edge.vercel.app/api/mcp/public \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": { "name": "list_prop_firms", "arguments": {} },
    "id": 1
  }'
```

> **Note:** With the post-swarm expansion to 95 tools, `tools/list` now returns the complete catalog including new categories (AI, imports, teams, images, layouts, journal CRUD, admin email). All examples above remain valid; try e.g. `ai_chat`, `upload_trade_image`, `create_team`, or `list_journal_entries` for new capabilities.

## Architecture

### Endpoints

#### `POST /api/mcp` — User-Authenticated Endpoint

Requires a valid user API key (`qunt_usr_` prefix) in the `Authorization: Bearer` header. Exposes ~82 personal/user tools (core trading + expanded: full journal CRUD, trade images, granular create/update/delete trades, broker imports/sync (IBKR PDF, Tradovate, etc.), full AI suite, teams collab, dashboard layouts, payouts, billing) plus all 13 website/public tools. This is the primary endpoint for AI assistants accessing your data.

#### `POST /api/mcp/public` — Public (No Auth) Endpoint

No authentication required. Exposes 13 read-only tools for browsing public content: prop firms (with compare), blog posts, active deals, leaderboard, community posts + comments, trader benchmarks, challenges.

#### `POST /api/mcp/admin` — Admin-Only Endpoint

Requires an admin API key (`qunt_adm_` prefix). Exposes all ~110 tool exposures (95 unique: 82 personal + 13 public + 15 admin). Admin tools include user/subscription management, full content CRUD (prop firms, blogs, coupons), review moderation, **and email/newsletter dispatch** (`admin_send_email`, welcome, weekly recap). All admin tools enforce `requireAdmin(ctx)` from security.ts before execution.

#### `GET /api/mcp` — Discovery Endpoint

Returns server metadata, tool catalog (with input schemas and annotations), and endpoint listing. No auth required.

### Protocol

All endpoints use **JSON-RPC 2.0** over HTTP POST with `Content-Type: application/json`.

**Standard MCP Methods:**
- `initialize` — handshake, returns protocol version and server capabilities
- `ping` — health check, returns empty object
- `tools/list` — list all available tools with their schemas
- `tools/call` — invoke a tool by name with arguments
- `notifications/initialized` — acknowledged (202)
- `notifications/cancelled` — acknowledged (202)

**Request format:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_account_health",
    "arguments": { "accountId": "..." }
  },
  "id": 1
}
```

**Success response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \"currentBalance\": 25000, ... }"
      }
    ]
  },
  "id": 1
}
```

**Error response:**
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Authentication failed. Provide a valid Bearer token."
  },
  "id": 1
}
```

## Authentication Model

### API Key Prefixes

| Prefix | Role | Endpoints |
|---|---|---|
| `qunt_usr_` | User | `/api/mcp`, `/api/mcp/admin` |
| `qunt_adm_` | Admin | `/api/mcp`, `/api/mcp/admin` |

### Key Storage

- Raw keys are generated once and shown immediately — they are **never stored in plaintext**.
- The SHA-256 hash of the key is stored in the database.
- Keys can be revoked from the dashboard — revocation is instant.
- Expiration dates can be set on key generation.

### Sending the Key

All authenticated endpoints expect the key in the `Authorization` header:

```
Authorization: Bearer qunt_usr_abc123...
```

## Tool Catalog

### Account & Health

---

#### `get_account_health`

Full health snapshot for all trading accounts. Returns current balance, drawdown used %, buffer remaining, trailing stop status, profit target progress, payout eligibility, and days traded.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | no | Filter to a specific account by ID |

**Returns:** Array of account health objects

**Example:**
```json
{
  "id": "clx...",
  "number": "ACC-001",
  "propfirm": "FTMO",
  "accountSize": "100000",
  "startingBalance": 100000,
  "currentBalance": 102350.50,
  "pnl": 2350.50,
  "drawdownUsed": 800.00,
  "drawdownUsedPct": "40.0",
  "bufferRemaining": 1200.00,
  "atRisk": false,
  "profitTargetPct": "78.4",
  "trailingActive": true,
  "daysTraded": 12,
  "isEvaluation": true,
  "payoutEligible": false
}
```

---

#### `list_accounts`

List all trading accounts. No arguments required.

**Args:** none

**Returns:** Array of `{ id, number, propfirm, accountSize, startingBalance, createdAt }`

---

#### `get_account_details`

Detailed account info including its 10 most recent trades.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | **yes** | The account ID |

**Returns:** Account object with `trades[]` array

---

### Trades & Performance

---

#### `list_trades`

List trades with optional date range filtering and pagination. Sorted by `entryDate` descending.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `startDate` | string (ISO 8601) | no | Start date e.g. `"2024-01-01"` |
| `endDate` | string (ISO 8601) | no | End date |
| `limit` | number | no | Max trades (default 50, max 200) |
| `offset` | number | no | Pagination offset (default 0) |

**Returns:** Array of trade objects with `{ id, instrument, direction, entryDate, exitDate, pnl, commission }`

---

#### `get_performance_summary`

Overall trading performance metrics.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `startDate` | string | no | Start date (ISO 8601) |
| `endDate` | string | no | End date (ISO 8601) |

**Returns:**
```json
{
  "totalTrades": 150,
  "grossPnL": "12345.67",
  "netPnL": "11900.00",
  "winRate": "62.0",
  "totalWins": 93,
  "totalLosses": 57,
  "avgWin": "185.40",
  "avgLoss": "-95.20",
  "profitFactor": "1.95"
}
```

---

#### `get_user_profile`

Returns username, masked email (`j***@example.com`), language preference, and account creation date.

**Args:** none

---

#### `list_tags`

List all trade tags. No arguments required.

**Returns:** Array of `{ id, name, color, userId }`

---

### Risk & Analytics

---

#### `get_risk_metrics`

Key risk metrics across all trades: max drawdown, avg risk per trade, RR distribution, expectancy, Sharpe-like ratio, violation count.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `startDate` | string | no | Start date (ISO 8601) |
| `endDate` | string | no | End date (ISO 8601) |
| `accountId` | string | no | Filter to specific account |

**Returns:**
```json
{
  "totalTrades": 150,
  "maxDrawdown": 3200.00,
  "maxDrawdownPct": "12.8",
  "avgRiskPerTrade": "1.25%",
  "avgRR": "1.85",
  "bestRR": "5.30:1",
  "worstRR": "-2.10:1",
  "expectancy": "45.20",
  "profitFactor": "1.95",
  "sharpeRatio": "1.42",
  "violationCount": 3
}
```

---

#### `analyze_trade`

Deep single-trade analysis using TradeAnalytics data (MAE/MFE, efficiency, RR).

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `tradeId` | string | **yes** | The trade ID to analyze |

**Returns:**
```json
{
  "id": "clx...",
  "instrument": "EURUSD",
  "side": "LONG",
  "quantity": 0.1,
  "entryPrice": 1.0850,
  "closePrice": 1.0920,
  "pnl": 70.00,
  "commission": 3.50,
  "entryDate": "2025-03-15T08:00:00Z",
  "closeDate": "2025-03-15T16:00:00Z",
  "tags": ["scalp", "eurusd"],
  "mae": 15.00,
  "mfe": 80.00,
  "riskRewardRatio": 2.5,
  "efficiency": 0.82,
  "riskPct": 1.15
}
```

---

#### `run_monte_carlo`

Monte Carlo simulation (1000+ runs) based on actual trade distribution. Estimates ruin probability, median/worst/best scenario outcomes.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | no | Filter to a specific account |
| `simulations` | number | no | Number of simulations (default 1000, max 10000) |

**Returns:**
```json
{
  "simulations": 1000,
  "tradeCount": 150,
  "initialBalance": 100000,
  "parameters": {
    "winRate": 62.0,
    "avgWin": 185.40,
    "avgLoss": 95.20
  },
  "results": {
    "ruinProbability": 1.2,
    "medianOutcome": 104500.00,
    "worst5PercentOutcome": 98000.00,
    "best5PercentOutcome": 112000.00,
    "expectedOutcome": 104800.00
  }
}
```

---

#### `suggest_position_size`

Dynamic position sizing based on account health and risk parameters. Adjusts for drawdown — if drawdown exceeds 50% of max allowed, risk is halved.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | no | Specific account ID |
| `targetRiskPct` | number | **yes** | % of account to risk (e.g. `0.5` for 0.5%) |
| `stopLossPct` | number | **yes** | Stop loss distance in % (e.g. `2` for 2%) |
| `accountSize` | number | no | Override account size |

**Returns:**
```json
{
  "suggestedSize": 2500.00,
  "riskAmount": 50.00,
  "accountBalance": 10000.00,
  "drawdownAdjustment": 1.0,
  "drawdownPct": 30.5,
  "targetRiskPct": 0.5,
  "stopLossPct": 2,
  "warnings": []
}
```

---

### Journal & Psychology

---

#### `create_journal_entry`

Create or update a Mood entry for a specific day with emotional state, journal text, and linked trades.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `day` | string (ISO 8601) | **yes** | Date, e.g. `"2024-01-15"` |
| `mood` | string | **yes** | Mood label: `focused`, `anxious`, `confident`, `tilted`, `neutral`, etc. |
| `emotionValue` | number | no | 0–100 emotion score (default 50) |
| `journalContent` | string | no | Detailed journal text |
| `tradeIds` | string[] | no | Trade IDs to link to this entry |

**Returns:** Created/updated mood entry object

---

#### `get_behavioral_patterns`

Analyze correlation between Mood entries and trading performance over a lookback period.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `days` | number | no | Lookback period in days (default 90) |

**Returns:**
```json
{
  "moodPerformance": [
    { "mood": "focused", "tradeCount": 25, "avgPnL": 120.50, "totalPnL": 3012.50 },
    { "mood": "anxious", "tradeCount": 8, "avgPnL": -45.30, "totalPnL": -362.40 }
  ],
  "bestMood": "focused",
  "worstMood": "anxious",
  "totalEntries": 30,
  "periodDays": 90
}
```

---

#### `brutal_journal_audit`

No-mercy review of the last N trades for emotional patterns, risk violations, and improvement areas. Checks: risk > 2% violations, low RR trades (< 1:1), overtrading (> 5/day), emotional state patterns. Assigns a grade (A–F).

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | number | no | Number of trades to review (default 20, max 100) |

**Returns:**
```json
{
  "tradesReviewed": 20,
  "violations": [
    { "type": "risk_over_2pct", "count": 3, "examples": ["clx...", "clx..."] },
    { "type": "low_rr", "count": 5, "examples": ["clx...", "clx..."] },
    { "type": "overtrading", "count": 1, "examples": ["2025-03-15"] }
  ],
  "emotionalPatterns": [
    { "mood": "tilted", "tradeCount": 4, "avgPnL": -150.25, "totalPnL": -601.00 }
  ],
  "suggestions": [
    "Reduce position size — multiple trades exceed 2% risk",
    "Aim for minimum 1:1 risk-reward ratio"
  ],
  "overallGrade": "C"
}
```

---

### Compliance & Challenges

---

#### `get_prop_compliance`

Check a trading account against prop firm rules and challenge requirements. Evaluates max daily loss, max total loss, profit target progress, min trading days, trailing drawdown status, and payout eligibility. Cross-references against PropFirmRule entries.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | no | Specific account ID (defaults to first evaluation account) |

**Returns:** Compliance report with `rules[]`, `violations[]`, `overallCompliant` boolean

---

#### `get_challenge_progress`

Track progress on active prop firm challenges. Shows current PnL vs target, progress %, days traded, drawdown usage, and whether on track to pass.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `accountId` | string | no | Specific account ID (defaults to first evaluation account) |

**Returns:**
```json
{
  "accountId": "clx...",
  "challengePhase": "Evaluation",
  "targetProfit": 10000,
  "currentProfit": 7800.50,
  "progressPct": 78.0,
  "daysTraded": 15,
  "minDaysRequired": 20,
  "daysRemaining": 5,
  "maxDrawdownUsed": 3200.00,
  "drawdownLimit": 5000,
  "onTrack": true
}
```

---

### Write Operations

---

#### `update_trade_tags`

Replace the tags on a specific trade. Verifies ownership.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `tradeId` | string | **yes** | The trade ID |
| `tags` | string[] | **yes** | New tags array |

**Returns:** `{ id, tags: string[] }`

---

#### `add_trade_review_note`

Add or update the comment/review note on a specific trade.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `tradeId` | string | **yes** | The trade ID |
| `comment` | string | **yes** | Review note text |

**Returns:** `{ id, comment }`

---

### Daily Operations

---

#### `generate_daily_briefing`

Generate a structured daily trading summary using platform data (no external AI). Aggregates trades for the day, includes mood entry, win rate, best/worst trade, compares to previous day, account health snapshot, and risk flags.

**Args:**
| Name | Type | Required | Description |
|---|---|---|---|
| `date` | string (ISO 8601) | no | Date to summarize (default: today) |

**Returns:**
```json
{
  "date": "2025-03-15",
  "tradeCount": 5,
  "totalPnL": 350.00,
  "winRate": "80.0",
  "wins": 4,
  "losses": 1,
  "bestTrade": { "id": "clx...", "pnl": 200.00, "instrument": "EURUSD" },
  "worstTrade": { "id": "clx...", "pnl": -50.00, "instrument": "GBPUSD" },
  "previousDayPnL": 120.00,
  "pnlChange": 230.00,
  "mood": { "label": "focused", "score": 80 },
  "accountSnapshot": [
    { "id": "clx...", "number": "ACC-001", "propfirm": "FTMO", "drawdownUsedPct": "30.0", "atRisk": false }
  ],
  "riskFlags": []
}
```

---

### Expanded Categories (Swarm Additions — Full Coverage)

**Audit & Coverage Note:** Per the 2026-05-29 MCP Coverage Audit (`docs/mcp-audit-2026-05-29.md`) + Top 15 swarm plans, 100% of high-priority user-facing surfaces (dashboard widgets, accounts/trades/journal/payouts/imports/AI/teams/notes-adjacent, admin email/content) are now mapped to MCP tools. All new + retrofitted tools use mandatory `server/mcp/security.ts` guards (`requireUserId` + `assertNoCrossUserAccess` from `ctx` only; never args). TDD tests cover security paths. No cross-user data exposure.

All tools below (and existing) delegate to hardened handlers in `server/mcp/handlers/*` (or legacy inline with same `ctx.userId` scoping + audit logging).

#### Images & Media

- `upload_trade_image` — Upload/set base64 (or Supabase storage path) image (or second image) on single or multiple trades. Supports `null` to clear. Reuses `updateTradeImage` logic.
- `delete_trade_image` — Clear image reference(s) from trade(s).

**Security:** Handler + Prisma `WHERE id IN (...) AND userId = ctx.userId`. Cross-user args rejected via `assertNoCrossUserAccess`.

#### Imports & Broker Sync

- `import_trades` — Bulk create trades from array (generic entrypoint; processor defaults applied).
- `import_ibkr_pdf` — IBKR PDF OCR/extract + import (FIFO).
- `extract_ibkr_orders` — Parse IBKR order data.
- `compute_ibkr_fifo` — Compute realized P&L via FIFO for IBKR.
- `sync_tradovate` — Full credential sync (historical/live) for Tradovate accounts.

(Other brokers follow identical secure wrapper pattern in handlers/imports.ts.)

**Security:** All create trades under `ctx.userId` only. Credential handling never leaks.

#### AI Full Suite (7 tools)

Wraps internal AI routes with entitlement/rate-limit/ledger enforcement + strict isolation.

| Tool | Description | Key Args |
|---|---|---|
| `ai_chat` | Conversational assistant (insights, coaching, news context) | `messages[]` or `prompt` |
| `ai_analyze_trade` | Single-trade deep analysis (MAE/MFE, efficiency, RR, context) | `tradeId` (required) |
| `ai_analysis_global` | Portfolio-wide AI insights & patterns | `startDate`, `endDate` |
| `ai_analysis_accounts` | Account-level AI performance summary | `accountId` (opt) |
| `ai_analysis_instrument` | Per-symbol AI stats/edge analysis | `instrument` (required) |
| `ai_analysis_time_of_day` | Intraday timing AI insights | `startHour`, `endHour` |
| `ai_search_date` | Natural-language + date filtered trade search | `query`, `date` |

**Returns:** `{ text, usage: {tokens, cost}, tradesAnalyzed }`. All calls logged to `AiRequestLog` + `AiUsageLedger`.

#### Teams & Collaboration

| Tool | Description | Key Args |
|---|---|---|
| `create_team` | Create team (caller becomes owner) | `name`, `slug` (opt) |
| `invite_team_member` | Send invite email to join team | `teamId`, `email` |
| `accept_team_invite` | Accept invite (by id/token) | `inviteId` or `token` |
| `remove_team_member` | Kick member (owner) or self-leave | `teamId`, `memberUserId` (opt) |

**Security:** `requireUserId(ctx)` + explicit team membership checks in `server/teams.ts` (no cross-team Prisma access). Shared views scoped by public slug.

#### Journal Full CRUD (Top 15 #10–11)

Existing: `create_journal_entry`, `get_behavioral_patterns`, `brutal_journal_audit`, `get_mood_history`.

Added for full parity:

- `list_journal_entries` — Query mood/journal entries (date range, pagination, your data only).
- `update_journal_entry` — Patch mood/emotionValue/journalContent by day.
- `delete_journal_entry` — Remove entry by day.

**Security:** Mood model queries always `WHERE userId_day = {userId: ctx.userId, day}`. Handlers in `handlers/journal.ts` enforce guards + tests.

#### Dashboard Layouts (Top 15 #12)

- `get_dashboard_layout` — Fetch persisted `{desktop: [...], mobile: [...]}` widget config.
- `save_dashboard_layout` — Write layout arrays (replaces prior).

**Security:** `DashboardLayout` 1:1 to `userId` (from `server/layouts.ts` forUser helpers). No leakage.

#### Additional Expanded Writes (Phase 1 Core)

- `create_trade` — Manual single trade entry (full fields; account ownership verified).
- `update_trade` — General trade fields (prices, dates, instrument, side, qty, commission, videoUrl, etc.) beyond tags/note.
- `delete_trades` — Granular single or bulk delete (your trades).
- `get_equity_chart` — Time-series equity points for accounts.
- `list_groups` + `create_group`/`update_group`/`delete_group` + `group_trades`/`ungroup_trades`.
- `list_payouts` + `save_payout`/`delete_payout`.
- `get_subscription`, `update_profile`, `get_mood_history`.

(Old write tools like `update_trade_tags`, `add_trade_review_note` remain.)

---

### Public Website Tools (No Auth)

Available at `POST /api/mcp/public` (no auth) and also at `POST /api/mcp` (with auth). Expanded in swarm to 13 tools.

| Tool | Description | Key Args |
|---|---|---|
| `list_blog_posts` | Published blog posts with category filter | `category` (enum), `limit`, `offset` |
| `get_blog_post` | Single post by slug | `slug` (required) |
| `list_prop_firms` | Active prop firms | `category`, `platform`, `limit`, `offset` |
| `get_prop_firm` | Firm details with reviews, coupons, rules | `slug` (required) |
| `compare_prop_firms` | Side-by-side prop firm comparison | `slugs` (array, required) |
| `list_challenges` | Challenges for a prop firm | `propFirmSlug` (required), `limit` |
| `list_prop_firm_reviews` | Approved reviews for a prop firm | `propFirmSlug` (required), `limit`, `offset` |
| `list_active_deals` | Active coupons and deals | `limit` |
| `list_community_posts` | Community posts by type/status | `type`, `status`, `limit`, `offset` |
| `get_community_post` | Single community post | `id` (required) |
| `get_community_post_comments` | Comments thread for a post | `postId` (required) |
| `get_leaderboard` | Top traders by PnL | `limit`, `offset` |
| `get_trader_benchmarks` | Global trader benchmark stats | none |

### Admin Tools

Available only at `POST /api/mcp/admin` with an admin API key (`qunt_adm_`). Expanded with full content management + email tools (swarm Phase).

| Tool | Description | Key Args |
|---|---|---|
| `admin_list_users` | All platform users (masked emails) | none |
| `admin_get_user` | Detailed user info + accounts + subscription | `userId` (required) |
| `admin_list_subscriptions` | All subscriptions with user info | none |
| `admin_get_analytics` | Platform-wide usage counts | none |
| `admin_create_blog_post` / `update` / `delete` | Full blog CRUD | title, slug, content, etc. |
| `admin_create_prop_firm` / `update` / `delete` | Full prop firm CRUD + rules | name, slug, etc. |
| `admin_create_coupon` / `delete` | Deal/coupon management | propFirmId, code, etc. |
| `admin_get_review_moderation_queue` / `admin_moderate_review` | Review queue + approve/reject/flag | reviewId, action |
| `admin_update_user` | Update any user (role, subscription, etc) | userId, fields |
| `admin_send_email` | Send arbitrary email to user(s) | toUserId, subject, html, template |
| `admin_send_welcome_email` | Trigger welcome sequence | userId |
| `admin_send_weekly_recap` | Dispatch weekly performance recap | userId (or all) |

---

## Connecting AI Assistants

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qunt-edge": {
      "url": "https://qunt-edge.vercel.app/api/mcp",
      "auth": { "type": "bearer" },
      "description": "Full personal access (95 tools): trading, AI suite, imports, journal CRUD, teams, layouts, images — after swarm coverage"
    },
    "qunt-edge-public": {
      "url": "https://qunt-edge.vercel.app/api/mcp/public",
      "description": "No auth needed — public prop firms, deals, blog, community, comparisons, leaderboard"
    }
  }
}
```

Claude Desktop will prompt you to enter your API key when connecting to the `qunt-edge` server.

### Cursor

In Cursor settings → MCP Servers → Add:

- **Name:** `qunt-edge`
- **Type:** `url`
- **URL:** `https://qunt-edge.vercel.app/api/mcp`
- **Auth type:** `Bearer`
- **API Key:** Your `qunt_usr_...` key

### Cline / CLI AI Agents

Set the environment variable or pass it in configuration:

```bash
# Cline MCP config
{
  "mcpServers": {
    "qunt-edge": {
      "url": "https://qunt-edge.vercel.app/api/mcp",
      "auth": { "type": "bearer" },
      "description": "Full 95-tool access post-swarm (AI, imports, teams, journal/layouts, images, etc.)"
    }
  }
}
```

### Grok (xAI) Remote MCP

Grok supports remote MCP only via the xAI API (not the web chat UI). Use the Responses API or SDK and include the MCP server in the tools array:

```json
{
  "type": "mcp",
  "server_url": "https://qunt-edge.vercel.app/api/mcp",
  "server_label": "qunt",
  "authorization": "Bearer qunt_usr_YOUR_KEY"
}
```

See xAI docs "Remote MCP Tools". The endpoint is Streamable HTTP compatible and will expose all your tools.

### Stdio (for clients that only support local stdio)

```bash
MCP_KEY=qunt_usr_YOUR_KEY MCP_URL=https://qunt-edge.vercel.app/api/mcp bun run mcp:stdio
```

This launches a local stdio MCP server that dynamically forwards every tool (all 95+) to your hosted instance. Point your stdio-only client (some Grok CLIs, local inspectors, etc.) at it. No code changes needed on the hosted side.

## Security Model

**Post-Swarm (2026-05-29):** 100% of tools (95 unique, all endpoints/handlers/dispatchers) now use the centralized guards in `server/mcp/security.ts`. Full coverage achieved via swarm TDD + handler extraction. Zero exceptions.

| Concern | Implementation |
|---|---|
| Key storage | SHA-256 hashed at rest; raw key shown only once at creation |
| Key prefixes | `qunt_usr_` for users, `qunt_adm_` for admins — route-level enforcement |
| Transport | HTTPS only (enforced by Vercel) |
| **User isolation (core)** | **Every tool calls `requireUserId(ctx)` first. No tool ever accepts `userId` (or account/trade/etc ID) from args without `assertNoCrossUserAccess(requested, ctxUserId)` rejection. All Prisma: `where: { userId: ctx.userId }` exclusively. Team tools add membership checks. No cross-user leakage by design.** |
| Admin gates | `requireAdmin(ctx)` (from security.ts) + legacy `requireAdminAccess()` — throws before any admin tool body executes |
| Rate limiting | 60 requests/min per user, global rate limit for unauthenticated |
| CORS | `Access-Control-Allow-Origin: *` for browser-based clients |
| Write tools | Now 30+ (create/update/delete trades, journal full CRUD, images, imports, teams, layouts, payouts, admin content/email) — all destructive ops audited + ownership verified |
| Audit logging | Every tool call (success + error) logged to `mcpAuditLog` (tool, userId, duration, errorCode, args hash) |
| Handler coverage | New tools in `server/mcp/handlers/{account,trade,journal,ai,imports,teams,layout}.ts` + JSDoc mandating guards; legacy paths retrofitted with same ctx-only pattern |

**Swarm Audit Achievement:** The 2026-05-29 full coverage audit mapped ~200 web surfaces + 61 Prisma models. Swarm implemented all priority missing tools (images, 5+ import paths, 7 AI, 4 teams, 3 journal, 2 layouts, 3 admin email, granular trade writes, etc.) with security-first TDD. Every new handler has dedicated security tests (no ctx → auth error; cross-user arg → denied). See `server/mcp/handlers/__tests__/*` and per-file headers. |

## Rate Limiting

- Default: **60 requests per 60-second window** per user
- Unauthenticated requests share a global rate limit bucket
- Rate limit headers are not currently exposed but are planned
- On rate limit hit: JSON-RPC error with code `-32000` and status 429

## Error Handling Reference

### JSON-RPC Error Codes

| Code | Meaning | HTTP Status |
|---|---|---|
| `-32700` | Parse error — invalid JSON | 400 / 415 |
| `-32600` | Invalid Request — missing jsonrpc field, bad method | 400 |
| `-32601` | Method not found — unknown tool name | 404 |
| `-32602` | Invalid params — missing required arg, bad type | 400 |
| `-32603` | Internal error — server-side failure | 500 |
| `-32000` | Rate limit exceeded | 429 |
| `-32001` | Authentication failed — missing/invalid API key | 401 |
| `-32002` | Access denied — admin role required | 403 |

### Tool-Level Errors

Tools return errors as `isError: true` with a text message:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{ "type": "text", "text": "Account not found" }],
    "isError": true
  },
  "id": 1
}
```

Common tool errors:
- `Account not found` — invalid or unauthorized account ID
- `Trade not found` — invalid or unauthorized trade ID
- `No evaluation account found` — no challenge account exists
- `Need at least 5 trades to run Monte Carlo simulation`
- `targetRiskPct must be a positive number`
- `Missing required parameter: accountId`

## Deployment

The MCP endpoints run on Vercel as part of the Qunt Edge Next.js app. There is no separate MCP server process. The production URL is `https://qunt-edge.vercel.app/api/mcp`.

## `mcp.json` Configuration

A root-level `mcp.json` file is provided at the repository root for MCP-compatible tools (Claude Desktop, Cursor, Cline) to auto-detect:

```json
{
  "mcpServers": {
    "qunt-edge": {
      "url": "https://qunt-edge.vercel.app/api/mcp",
      "description": "Qunt Edge MCP — 95 tools post-swarm: full trading + AI suite + imports (IBKR/Tradovate) + journal CRUD + teams + layouts + images + payouts (requires API key).",
      "auth": { "type": "bearer" }
    },
    "qunt-edge-public": {
      "url": "https://qunt-edge.vercel.app/api/mcp/public",
      "description": "Qunt Edge public MCP — no auth required. Browse prop firms (compare), deals, blog, leaderboard, community, challenges."
    },
    "qunt-edge-admin": {
      "url": "https://qunt-edge.vercel.app/api/mcp/admin",
      "description": "Qunt Edge admin MCP — full access (95 tools + 15 admin incl. email/newsletter, content moderation) (requires admin API key).",
      "auth": { "type": "bearer" }
    }
  }
}
```

## API Reference: `curl` Examples

### Key Management

```bash
# Generate a user API key
curl -X POST https://qunt-edge.vercel.app/api/mcp/keys \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-key"}'

# List your keys
curl https://qunt-edge.vercel.app/api/mcp/keys \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Revoke a key
curl -X DELETE https://qunt-edge.vercel.app/api/mcp/keys/KEY_ID \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Test Connection

```bash
# Ping
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"ping","id":1}'

# List tools (unauthenticated discovery — no auth needed)
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"initialize","id":1}'
```

### Call Tools

```bash
# Account snapshot
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_account_health",
      "arguments": {}
    },
    "id": 1
  }' | jq .

# Run Monte Carlo
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "run_monte_carlo",
      "arguments": { "simulations": 5000 }
    },
    "id": 1
  }' | jq .

# Create journal entry
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "create_journal_entry",
      "arguments": {
        "day": "2025-12-01",
        "mood": "focused",
        "emotionValue": 85,
        "journalContent": "Good session, followed the plan."
      }
    },
    "id": 1
  }' | jq .

# Get position size suggestion
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "suggest_position_size",
      "arguments": { "targetRiskPct": 0.5, "stopLossPct": 2 }
    },
    "id": 1
  }' | jq .

# Generate daily briefing
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "generate_daily_briefing",
      "arguments": {}
    },
    "id": 1
  }' | jq .

# Public endpoint — list prop firms
curl -s -X POST https://qunt-edge.vercel.app/api/mcp/public \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "list_prop_firms",
      "arguments": {}
    },
    "id": 1
  }' | jq .

# Brutal journal audit
curl -s -X POST https://qunt-edge.vercel.app/api/mcp \
  -H "Authorization: Bearer qunt_usr_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "brutal_journal_audit",
      "arguments": { "limit": 30 }
    },
    "id": 1
  }' | jq .

# Admin — get platform analytics
curl -s -X POST https://qunt-edge.vercel.app/api/mcp/admin \
  -H "Authorization: Bearer qunt_adm_YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "admin_get_analytics",
      "arguments": {}
    },
    "id": 1
  }' | jq .

## Local Development / Stability Note

The MCP server is stable and production-ready on the default path (no special env var needed).

The previous experimental `MCP_SDK_ENABLED` flag has been removed. The current implementation (custom JSON-RPC router with full security, audit logging, and all 95+ tools) is the supported path and is compatible with Claude Desktop, Cursor, Cline, Windsurf, and other MCP clients.

No additional dependencies are required.


# Qunt Edge MCP — Model Context Protocol Integration

> **Implementation note (2026-05-29):** Powered by the official `@modelcontextprotocol/server` SDK (Streamable HTTP transport). All connection URLs, API key format (`qunt_usr_*` / `qunt_adm_*`), tool behavior, and 3-endpoint split remain unchanged. The previous custom JSON-RPC router is still available via `MCP_SDK_ENABLED=false` (default) during the migration period.

## Overview

The [Model Context Protocol (MCP)](https://spec.modelcontextprotocol.io) is an open standard that enables AI assistants (Claude, Cursor, Cline, etc.) to interact directly with your Qunt Edge trading data. Instead of asking you to copy-paste numbers, your AI can query live account health, trade history, risk metrics, and more — all through a standardized JSON-RPC interface.

Qunt Edge exposes **3 MCP endpoints** with different authentication levels:

| Endpoint | Auth | Tools | Use Case |
|---|---|---|---|
| `POST /api/mcp` | User API key | 19 personal + 10 public | Your trading data + public content |
| `POST /api/mcp/public` | None | 10 public | Browse prop firms, deals, blog, leaderboard |
| `POST /api/mcp/admin` | Admin API key | 19 personal + 10 public + 4 admin | Full platform administration |

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

## Architecture

### Endpoints

#### `POST /api/mcp` — User-Authenticated Endpoint

Requires a valid user API key (`qunt_usr_` prefix) in the `Authorization: Bearer` header. Exposes all 19 personal trading tools plus 10 website/public tools. This is the endpoint most users connect to.

#### `POST /api/mcp/public` — Public (No Auth) Endpoint

No authentication required. Exposes 10 read-only tools for browsing public content: prop firms, blog posts, active deals, leaderboard, community posts, and trader benchmarks.

#### `POST /api/mcp/admin` — Admin-Only Endpoint

Requires an admin API key (`qunt_adm_` prefix). Exposes all 33 tools (19 personal + 10 public + 4 admin). Admin tools let you list all users, look up any user's details, list subscriptions, and view platform-wide analytics.

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

### Public Website Tools (No Auth)

Available at `POST /api/mcp/public` (no auth) and also at `POST /api/mcp` (with auth).

| Tool | Description | Key Args |
|---|---|---|
| `list_blog_posts` | Published blog posts with category filter | `category` (enum), `limit`, `offset` |
| `get_blog_post` | Single post by slug | `slug` (required) |
| `list_prop_firms` | Active prop firms | `category`, `platform`, `limit`, `offset` |
| `get_prop_firm` | Firm details with reviews, coupons, rules | `slug` (required) |
| `list_challenges` | Challenges for a prop firm | `propFirmSlug` (required), `limit` |
| `list_prop_firm_reviews` | Approved reviews for a prop firm | `propFirmSlug` (required), `limit`, `offset` |
| `list_active_deals` | Active coupons and deals | `limit` |
| `list_community_posts` | Community posts by type/status | `type`, `status`, `limit`, `offset` |
| `get_leaderboard` | Top traders by PnL | `limit`, `offset` |
| `get_trader_benchmarks` | Global trader benchmark stats | none |

### Admin Tools

Available only at `POST /api/mcp/admin` with an admin API key (`qunt_adm_`).

| Tool | Description | Key Args |
|---|---|---|
| `admin_list_users` | All platform users (masked emails) | none |
| `admin_get_user` | Detailed user info + accounts + subscription | `userId` (required) |
| `admin_list_subscriptions` | All subscriptions with user info | none |
| `admin_get_analytics` | Platform-wide usage counts | none |

---

## Connecting AI Assistants

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qunt-edge": {
      "url": "https://qunt-edge.vercel.app/api/mcp",
      "auth": { "type": "bearer" }
    },
    "qunt-edge-public": {
      "url": "https://qunt-edge.vercel.app/api/mcp/public",
      "description": "No auth needed — public prop firms, deals, blog"
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
      "auth": { "type": "bearer" }
    }
  }
}
```

## Security Model

| Concern | Implementation |
|---|---|
| Key storage | SHA-256 hashed at rest; raw key shown only once at creation |
| Key prefixes | `qunt_usr_` for users, `qunt_adm_` for admins — route-level enforcement |
| Transport | HTTPS only (enforced by Vercel) |
| User isolation | All queries scoped by `userId` from the resolved API key |
| Admin gates | `requireAdminAccess()` throws before any admin tool executes |
| Rate limiting | 60 requests/min per user, global rate limit for unauthenticated |
| CORS | `Access-Control-Allow-Origin: *` for browser-based clients |
| Write tools | Only `create_journal_entry`, `update_trade_tags`, `add_trade_review_note` — no destructive operations |
| Audit logging | Every tool call logged to `mcpAuditLog` table (tool name, success, duration, error code) |

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
      "description": "Qunt Edge MCP — personal trading data (requires API key). Generate one from your dashboard settings.",
      "auth": { "type": "bearer" }
    },
    "qunt-edge-public": {
      "url": "https://qunt-edge.vercel.app/api/mcp/public",
      "description": "Qunt Edge public MCP — no auth required. Browse prop firms, deals, blog, leaderboard."
    },
    "qunt-edge-admin": {
      "url": "https://qunt-edge.vercel.app/api/mcp/admin",
      "description": "Qunt Edge admin MCP — full access including admin operations (requires admin API key).",
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

## Local Development

Set `MCP_SDK_ENABLED=true` in your environment to activate the official `@modelcontextprotocol/server` SDK path (Streamable HTTP transport). The default (`false`) preserves the legacy custom JSON-RPC router for stability during the migration.

```bash
# .env.local
MCP_SDK_ENABLED=true
```

When `MCP_SDK_ENABLED=true` is set, all 3 endpoints use `NodeStreamableHTTPServerTransport` with Zod v4 tool schemas, rate limiting, and audit logging via middleware.

### Dependencies for the SDK path

```bash
bun add @modelcontextprotocol/server @modelcontextprotocol/node zod
```
```

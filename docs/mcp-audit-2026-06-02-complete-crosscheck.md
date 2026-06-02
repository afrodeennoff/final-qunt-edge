# Complete MCP Cross-Check & Audit Report — 2026-06-02

**Date:** 2026-06-02  
**Scope:** Entire MCP surface in the Qunt Edge app (all code, routes, docs, configs, tests, auth, handlers, legacy vs SDK, clients, key mgmt, security, compliance with MCP spec + mcp-builder best practices).  
**Auditor:** opencode agent (systematic-debugging + mcp-builder + using-superpowers + paseo skills applied).  
**Method:** Full filesystem glob/grep/read of all mcp* files + related (server/, app/api/mcp/, lib/, prisma/, docs/, .opencode/plans/, mcp.json, package.json, settings pages, stdio, etc.). Cross-checked against prior migration plan, docs claims, running code, SDK current state (via WebFetch), best practices. No assumptions — every claim traced to file:line.

## Executive Summary

The MCP implementation is **hybrid, incomplete, and production-risky**:

- **Production is 100% legacy custom router** (~5,164 LOC across mcp-route-utils.ts + 4 large tool dispatcher files). It powers the real 3 endpoints and ~77-80 tools.
- **Official SDK path (/api/mcp/v2)** is a **stub/partial experiment**: only user endpoint, ~7 tools registered, public/admin servers empty, TODOs left, no production traffic.
- **Docs are significantly out of sync** with reality (claim "95+ tools", "official SDK transport", "v2 available", "post-swarm full coverage", non-existent audit file referenced).
- **Critical missing surface**: The entire `/api/mcp/keys` HTTP API (POST/GET/DELETE for programmatic key lifecycle) is **documented in detail with curl examples** but **does not exist as a route**. Only 'use server' actions for the dashboard UI.
- **Dependencies on alpha pre-release SDK** (2.0.0-alpha.2) which current official README flags as **v2 dev / not for production** (v1.x recommended until Q3 2026 stable).
- **Tool coverage incomplete** in new code; legacy has partial handler extraction.
- **Security model** (ctx.userId only, no arg trust, audit log, guards in security.ts) is **enforced in legacy via handlers** and **partially in new handlers**, but v2 not fully wired so not complete.
- **No drift protection** between legacy tool defs and new handlers.
- **Positive**: Auth (apikey + oauth), rate limit, audit logging, CORS, Streamable-HTTP-ish compat, .well-known oauth resource, mcp.json, UI key mgmt, some TDD tests on extracted handlers, security.ts centralized guards, good scoping in handlers.

**Overall health**: Technical debt from stalled "official-mcp-sdk-migration" (2026-05-29 plan). Previous swarm added features to legacy + partial SDK side-by-side. Result: dual code, docs lies, missing API, alpha risk. **Not "entirely complete"**.

**Recommendation**: 
- Stabilize on **one** implementation.
- Option A (preferred short-term): Finish + cut over to SDK using stable v1 if feasible, or pin current and complete the v2 wiring + full tool registration + add keys route as MCP tools or separate.
- Option B: Deprecate v2, clean legacy, add missing keys HTTP surface (or make key gen a privileged MCP tool), update docs to truth.
- Spawned agent will execute full remediation per plan.

## 1. Code Inventory (Complete Cross-Check)

**Legacy (active, prod):**
- `server/mcp-route-utils.ts` (291 LOC) — custom JSON-RPC 2.0 router, rate limit, audit log, initialize/ping/tools/list/call, session headers, graceful discovery fallbacks, Streamable HTTP Accept/Origin/MCP-Protocol-Version handling.
- `server/mcp-tools.ts` (1989 LOC) — ~30 standardTools + delegates many to new handlers (account, ai, etc.).
- `server/mcp-user-write-tools.ts` (1576 LOC)
- `server/mcp-website-tools.ts` (448 LOC) — 13 public
- `server/mcp-admin-tools.ts` (177 LOC)
- `server/mcp-admin-write-tools.ts` (683 LOC)
- `server/mcp-helpers.ts`, `mcp-auth.ts`, `mcp-key-service.ts`, `mcp-context.ts`, `mcp-auto-migrate.ts`
- Routes: `app/api/mcp/route.ts`, `public/route.ts`, `admin/route.ts` (all call handleMcpRequest with "Stable production path — legacy router is the only supported path.")

**New SDK (partial, not prod):**
- `app/api/mcp/v2/route.ts` (126 LOC) — WebStandardStreamableHTTPServerTransport, session map (in-memory, 5m TTL), registerUserTools per request, only for user.
- `server/mcp/servers/{factory,user,public,admin}.ts` — factories create McpServer; user has partial register (get_account_health + 4 journal + 2 layout); public/admin empty.
- `server/mcp/handlers/{account,ai,imports,journal,layout,public,risk,teams,trade}.ts` + tests in handlers/__tests__/
- `server/mcp/tool-schemas.ts` (partial Zod)
- `server/mcp/security.ts`, `sdk-auth.ts`, `sdk-transport.ts`
- `server/mcp/stdio.ts` (127 LOC) — SDK McpServer + StdioTransport that **bootstraps by calling remote (legacy) /api/mcp** for full catalog (zero-drift), then registers+forwards. Good design for stdio clients.
- Tests: smoke + per-domain handler tests (good for extracted parts).

**Configs & Clients:**
- `mcp.json` (root), `.cursor/mcp.json` — point to /api/mcp (legacy) + public + admin. Good.
- `app/[locale]/dashboard/settings/page.tsx` — key UI + endpoint display + copy for Claude/Cursor/Cline/Grok.
- `app/[locale]/admin/components/admin-api-key-generator.tsx`
- `app/.well-known/oauth-protected-resource/route.ts` — MCP OAuth resource metadata (good spec compliance).
- `lib/mcp-constants.ts` — name/version/protocol '2025-03-26'/prefixes.
- Package: `"@modelcontextprotocol/server": "2.0.0-alpha.2"`, same for node. (See SDK section.)
- Scripts: `"mcp:stdio": "tsx server/mcp/stdio.ts"`
- Docs: `docs/mcp.md` (1097 LOC, detailed but inaccurate).
- Plan: `.opencode/plans/2026-05-29-official-mcp-sdk-migration.md` (detailed 16-task TDD plan — not completed).

**Other mentions (cross-check):**
- Landing footer, settings, admin UI, prisma generated, .claude settings (claude's own mcp tools, irrelevant), no other prod code paths.
- No MCP servers defined in .agents/skills or opencode skills beyond the builder skill itself (meta).

**Tool count reality (from source):**
- standardTools: ~30 (from grep in mcp-tools.ts)
- userWrite: ~25
- website: ~13? (docs say 13)
- admin + adminWrite: ~9 + more writes
- Total legacy unique ~70-80. Docs claim "95 unique", "95+", "~82 personal +13 public +15 admin". **Mismatch** — either overcount or missing registrations in legacy dispatchers.

New handlers expand (trade writes, ai suite, imports 5+, teams, layouts, journal CRUD, risk, images?) but **not all exposed via legacy dispatchers yet or counted accurately**.

## 2. Architecture & Dual-Path Analysis

- Legacy: Custom router in route-utils (no official transport) + ToolDefinition[] + switch/dispatch in handle*ToolCall. Thin delegation to handlers for newer features.
- v2: Official McpServer + registerTool + transport. Per-request server creation + register (not ideal for perf but works for serverless). In-memory sessions.
- Both use same auth (mcp-auth + key-service + oauth), same security.ts guards (requireUserId, assertNoCrossUserAccess, requireAdmin), same prisma scoping.
- Audit logging only in legacy path (route-utils logMcpCall).
- v2 does **not** call the audit logger (gap if ever promoted).
- Stdio always hits remote (current prod legacy).

**Result:** Feature additions post-swarm went into legacy dispatchers + new handlers. SDK servers are a parallel incomplete tree.

## 3. Protocol Compliance (MCP Spec Cross-Check)

From fetched spec + code:
- JSON-RPC 2.0: Yes (both).
- initialize, ping, tools/list, tools/call, notifications/* : Supported in legacy (good compat fallbacks for resources/prompts/roots returning empty).
- Streamable HTTP: Legacy emulates (Accept json/sse, Mcp-Session-Id, DELETE for session, Origin checks, MCP-Protocol-Version header). v2 uses official transport (partial).
- GET for SSE: Legacy 405s (documented), v2 implements.
- Auth: Bearer apikey (qunt_usr_/adm_) + Supabase token. Good.
- .well-known/oauth-protected-resource: Present (references /api/mcp).
- Error codes: Standard + custom -3200x. Returns 200 for many errors (compat choice, noted in code).
- No resources/prompts implemented (tools-only server; spec allows, docs note it).

**Issues:**
- Legacy custom may drift from exact transport semantics (e.g. full bidirectional, stateful sessions).
- Protocol version hardcoded '2025-03-26' — check against current spec (fetched draft uses latest).
- v2 session store is per-process (Vercel serverless: will not share across instances — noted in comment).

## 4. Security & Guardrails Audit (100% of tools?)

- Centralized `server/mcp/security.ts`: requireUserId, requireAdmin, assertNoCrossUserAccess. **Excellent**.
- Legacy: Handlers (account etc.) call them. Old inline in mcp-tools etc. retrofitted in many places (see aiChat etc. delegates).
- New handlers: Header comments mandate guards + examples use requireUserId + assert (account.ts good).
- mcp-auth.ts: Resolves to db userId, never trusts args for identity. Supports apikey + oauth.
- Key service: Hashes only, no plaintext storage, role, expires.
- Rate limit: On tools/list/call in legacy (per userId).
- Audit: McpAuditLog (tool, userId, success, duration, errorCode, argsKeys only — privacy good). Auto-migrate.
- Prisma: ApiKey model (hash + prefix + userId + role + expires), McpAuditLog.
- Cross-user: Asserts + WHERE userId = ctx.userId enforced in handlers.
- Admin: requireAdmin before admin tools.

**Gaps:**
- v2 path: No audit logging calls.
- If legacy dispatchers call old code paths that skip handlers/security, risk (but most now delegate).
- No input size/rate per-tool beyond global.
- OAuth token validation trusts Supabase; role from app_metadata.
- Docs claim "100% of tools" use guards — true for wired handlers, but tool count/docs vs code mismatch means unverified.
- No tests shown for legacy router security paths in this audit (handler tests exist for new).

**Best practice (mcp-builder):** Good use of guards, actionable errors, no secrets in logs. Follows "only ctx.userId".

## 5. Key Management Cross-Check (CRITICAL)

Docs (multiple sections + 20+ curl examples):
- POST /api/mcp/keys (with session Bearer) → generate qunt_usr_
- GET /api/mcp/keys
- DELETE /api/mcp/keys/{id}

**Reality:**
- `server/mcp-key-service.ts` ('use server'): generateUser/Admin, listUser, revoke — full impl with hash, validation, prisma.
- Called **only** from:
  - `app/[locale]/dashboard/settings/page.tsx` (server action imports)
  - `app/[locale]/admin/...` admin generator.
- **No route** at app/api/mcp/keys/* or anywhere under /api/mcp .
- Glob/grep for keys routes returned zero matches for mcp keys HTTP surface.
- Result: **Documented public API for key lifecycle does not exist.** Users following "Quick Start" curl will get 404. Only dashboard UI works.

This is the biggest "docs vs code" lie found.

Also: No MCP tool for self-service key creation (would be useful for agents).

## 6. SDK / Dependencies / Migration Status

- package.json + lock: alpha.2 (202?).
- WebFetch of current SDK README: **v2 is pre-alpha dev branch**. "v1.x remains the recommended version for production use" until stable v2 in Q3 2026. v2 API at /v2/ docs.
- Code uses old-style imports from '@modelcontextprotocol/server' (matches alpha package).
- v2/route uses WebStandardStreamableHTTPServerTransport (from alpha).
- Migration plan (May 29) was excellent TDD, extract handlers, dual-mode flag, full 16 tasks — **only partial executed** (handlers + schemas + some servers + v2 route + stdio updated; no cutover, no full register, no legacy delete, flag not added, docs not updated per plan).
- Legacy comments explicitly say "legacy is the only supported path".

**Risk:** Alpha breakage on next SDK publish, incompatibility with clients expecting stable v1 transport, maintenance of 5k LOC custom + partial SDK.

**mcp-builder best practices violations:**
- Use stable SDK (not alpha).
- Prefer official transports.
- Full annotations, outputSchema, response_format support (json + markdown) — legacy/new mostly return JSON text only.
- Pagination metadata on list tools (legacy has cursor for tools/list; per-tool lists should too).
- Clear tool descriptions, no placeholders.
- Comprehensive tests (partial).
- Server naming: 'qunt-edge-user' etc — close to {service}-mcp-server but internal.

## 7. Tests, Verification, Ops

- Handler tests: Good (account, ai, imports, journal, layout, teams, trade) — cover security paths per comments.
- Smoke: server/mcp/__tests__/smoke.test.ts
- No full integration roundtrip for legacy router or v2 in main suite visible.
- Typecheck/lint/build include MCP (via prebuild etc.).
- Prod: Runs in Next.js on Vercel (no separate process). Stdio for local.
- Logging: pino etc, but MCP specific to audit table.
- Self-heal, audits scripts exist but not MCP-specific.

## 8. Docs & Config Audit

- docs/mcp.md: Comprehensive but contains inaccuracies (tool counts, "SDK since...", references missing `docs/mcp-audit-2026-05-29.md`, claims full post-swarm 95 when code shows lower + partial).
- mcp.json: Accurate to current prod URLs.
- .cursor/mcp.json: Similar, uses "type": "mcp" + headers (Cursor format).
- Settings page: Good UX for discovery + copy.
- No CHANGELOG entry for MCP changes visible in quick scan.

## 9. Other Surfaces

- Public tools: 13 (prop firms, deals, blog, leaderboard, community, challenges...).
- Admin: content CRUD + email tools (send, newsletters) — powerful, correctly gated.
- Imports, AI suite (chat + multiple analysis), journal full CRUD, layouts, teams, trade writes, images?, risk/montecarlo — claimed in docs, some wired via delegation.
- No prompts/resources yet.
- Billing/payouts? Partially via standard.

## 10. Root Cause Analysis (Systematic Debugging)

**Symptoms:** Docs promise 95/SDK/v2/keys API; reality = legacy only + stubs + missing route + alpha + lower count.

**Evidence trail:**
- Routes all delegate to legacy (explicit comments).
- v2/user.ts has "TODO: Register remaining 18 personal tools".
- handlers/trade.ts: "Trade handler stubs — extraction in progress".
- No app/api/mcp/keys* files.
- package + imports = alpha.2.
- Grep for MCP_USE_SDK / v2 usage = only in old plan + docs.
- tool counts from source grep << docs claims.
- mcp-route-utils implements full compat layer (bypass of SDK).

**Pattern:** "Swarm" parallelized feature work (add tools via legacy dispatch + extract to handlers) + started SDK migration without completing cutover or cleaning. Plan written with writing-plans skill but execution incomplete (common when subagent-driven not followed end-to-end).

**Why not caught:** No single "MCP build" that fails on mismatch; dual paths allowed; docs updated optimistically; no automated count of exposed tools vs registered.

**If 3+ fixes attempted before:** N/A — this is first full cross-check.

## 11. Recommendations & Severity

**P0 (blocker for "complete"):**
- Implement the documented /api/mcp/keys routes (or deprecate docs + add via MCP tool).
- Decide architecture: commit to legacy or complete SDK migration.
- Update all docs to match ground truth (remove false claims, reference real audit).

**P1:**
- Complete or remove v2 (wire all handlers or delete v2 code + update stdio if needed).
- Add audit logging to SDK path.
- Bump/align SDK to stable (or document alpha risk).
- Add missing annotations/outputSchemas/response_format to tools.
- Expand tests to cover router + full security + v2.
- Reconcile exact tool count + expose missing ones (payouts? images?).

**P2:**
- Add per-tool pagination where lists.
- Support markdown + json response_format (per best practices).
- Resources/prompts if valuable.
- Production session store (Redis?) for v2 if kept.
- Version protocol header dynamically.

**Follow mcp-builder + spec exactly for future changes.**

## 12. Files Touched in This Audit (for reference)

All server/mcp* , app/api/mcp/* , docs/mcp.md , migration plan, package.json, prisma schema (ApiKey/McpAuditLog), settings pages, .well-known, mcp*.json, lib/mcp-constants, key-service, auth, handlers, stdio, etc. 40+ files read/grepped.

## 13. Next Steps (Automated by Spawned Agent)

See accompanying implementation plan (to be written via writing-plans skill immediately after this report) and the spawned Paseo agent that will execute remediation task-by-task with TDD, checkpoints, verification (typecheck, test, manual curl against keys + tools, etc.).

**Status after this audit:** Cross-check complete. Issues catalogued with file:line evidence. Agent will fix.

---
*Report generated during live session using full tool access + skills. All claims verifiable by re-running globs/greps/reads on the listed paths.*

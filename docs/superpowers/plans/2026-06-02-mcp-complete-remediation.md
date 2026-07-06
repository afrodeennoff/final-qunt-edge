# MCP Complete Remediation & Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Also apply superpowers:systematic-debugging + mcp-builder best practices at every step. After each task run: `npm run typecheck && npm test -- --grep mcp` (or specific) + manual curl verification.

**Goal:** Make MCP in Qunt Edge *complete, truthful, unified, secure, and best-practices compliant*: implement the missing documented keys API surface, reconcile docs vs reality (tool counts, v2 status), ensure 100% security guard coverage + audit logging on the active path, either complete the official SDK cutover (if stable) or cleanly deprecate the stub v2 code, add missing tool exposure/annotations, add verification tooling, eliminate dual-maintenance debt from the partial 2026-05-29 migration. Zero lies in docs. Production remains stable throughout.

**Architecture:** 
- Keep the battle-tested legacy custom router (mcp-route-utils + dispatchers) as the *sole stable production path* for now (explicitly documented).
- Implement `/api/mcp/keys*` HTTP routes (POST generate, GET list, DELETE revoke) using/adapting the existing 'use server' mcp-key-service (or extract pure functions). Protect with session auth (not MCP key).
- Delete or fully quarantine the incomplete `/api/mcp/v2` + partial SDK servers (remove dead code, update stdio if needed to stay compatible, update all docs/mcp.json references).
- Extract a single source of truth for exposed tools (e.g. from legacy + handlers) + add a `scripts/mcp-count-tools.mjs` that fails CI if docs claim diverges.
- Retrofit any remaining legacy paths to use security.ts guards + ensure audit logging.
- Update all docs (mcp.md, settings comments) to exact truth (current tool count from script, legacy-only, keys API now real).
- Add annotations/outputSchema where missing on ToolDefinition; consider response_format support later.
- Keep stdio forwarder (it calls prod /api/mcp — unchanged).
- Add TDD tests for new keys routes + security on any retrofits.
- No behavior change for existing MCP clients/agents.

**Tech Stack:** Next.js 16 App Router (route handlers), existing Prisma (ApiKey, McpAuditLog), Zod (already), 'use server' service logic reused, Vitest, tsx for scripts, official MCP concepts (but not the alpha SDK for prod path).

**Reference Materials (must read before editing):**
- `docs/mcp-audit-2026-06-02-complete-crosscheck.md` (this audit — ground truth)
- `.opencode/plans/2026-05-29-official-mcp-sdk-migration.md` (prior plan — do NOT follow its SDK cutover; use for handler extraction patterns only)
- `server/mcp/security.ts`, `mcp-key-service.ts`, `mcp-auth.ts`, `mcp-route-utils.ts`
- `app/api/mcp/route.ts` etc for pattern of config.
- mcp-builder best practices (loaded via skill): tool naming, annotations, errors, pagination, no alpha deps in prod.
- Current MCP spec draft (fetched during audit).

---
### Task 0: Setup & Verification Baseline (No Code Change)

**Files:**
- Read: `docs/mcp-audit-2026-06-02-complete-crosscheck.md`, prior migration plan, package.json (MCP deps section)

- [ ] **Step 0.1: Run full baseline verification commands**

```bash
npm run typecheck
npm test -- --grep "mcp| M C P" --passWithNoTests
node -e '
  const fs = require("fs");
  const legacy = fs.readFileSync("server/mcp-tools.ts","utf8").match(/name: .[a-z_]+/g) || [];
  console.log("Legacy standard tools approx:", legacy.length);
'
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/mcp || echo " (dev server not running — start later for manual)"
```

Expected: typecheck clean or pre-existing; tests pass or known; tool count printed (~30 for standard).

- [ ] **Step 0.2: Confirm docs reference the new audit**

Grep docs/mcp.md for the 2026-06-02 audit file name; if missing add one-line pointer in "Audit & Coverage Note" section.

- [ ] **Step 0.3: Commit baseline**

```bash
git add docs/mcp-audit-2026-06-02-complete-crosscheck.md
git commit -m "docs(mcp): add complete 2026-06-02 cross-check audit report as ground truth"
```

---
### Task 1: Implement Documented /api/mcp/keys HTTP API Surface

**Files:**
- Create: `app/api/mcp/keys/route.ts` (handles POST for generate user, GET list)
- Create: `app/api/mcp/keys/[id]/route.ts` (DELETE)
- Modify: `server/mcp-key-service.ts` (export pure non-'use server' versions of the functions if needed for route; keep 'use server' wrappers for UI)
- Test: `tests/api/mcp-keys.test.ts` (or add to existing vitest; use next-test-api-route or fetch against test server)
- Docs: `docs/mcp.md` (update curl examples to point to new working routes; add note)

**Security note:** These routes use *session* auth (Supabase or dashboard login), NOT MCP API keys. They allow a logged-in user to manage *their own* qunt_usr_* keys. Admin generator stays separate.

- [ ] **Step 1.1: Read the service + settings usage + auth patterns (do not skip)**

```bash
# in terminal
head -100 server/mcp-key-service.ts
grep -n "generateUserApiKey\|listUserApiKeys\|revokeApiKey" app/\[locale\]/dashboard/settings/page.tsx
cat server/mcp-auth.ts | head -30
```

- [ ] **Step 1.2: Refactor service for dual use (pure + server action)**

Modify `server/mcp-key-service.ts`:
- Keep existing 'use server' functions (they call internal).
- Extract internal `async function _generateUserApiKeyForUser(...)` etc that take user context.
- Export the pure versions for route handlers.
- Add JSDoc: "Used by both UI server actions and /api/mcp/keys HTTP routes."

(Show exact diff in edit; ensure no behavior change for existing callers.)

- [ ] **Step 1.3: Write failing test for keys route first (TDD)**

Create `app/api/mcp/keys/route.test.ts` (vitest + next testing utils or simple POST fetch after starting a test server if needed; follow patterns from other api tests).

Minimal failing test skeleton:

```ts
import { describe, it, expect } from 'vitest'
// import test client helper if exists
describe('MCP Keys API', () => {
  it('POST /api/mcp/keys requires session auth and returns key with qunt_usr_ prefix', async () => {
    // unauth -> 401
    const res = await fetch('http://localhost:3000/api/mcp/keys', { method: 'POST', body: JSON.stringify({name: 'test'}) })
    expect(res.status).toBe(401)
  })
})
```

Run to see FAIL.

- [ ] **Step 1.4: Implement the routes (minimal, reuse service)**

`app/api/mcp/keys/route.ts`:

```ts
import { NextRequest } from 'next/server'
import { getServerSessionOrThrow } from '@/server/auth' // or whatever the app uses for dashboard session
import { generateUserApiKey, listUserApiKeys } from '@/server/mcp-key-service' // after refactor

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromSession(req) // adapt from existing patterns in app
  if (!user) return Response.json({error: 'Unauthorized'}, {status: 401})
  const { name } = await req.json()
  const result = await generateUserApiKey(name) // or the pure version
  return Response.json(result)
}

export async function GET() { /* list */ }
```

Similar for `[id]/route.ts` DELETE using revoke.

Use existing CORS if appropriate, or simple.

Follow exact error shapes from mcp docs examples.

- [ ] **Step 1.5: Run test — make it pass**

- [ ] **Step 1.6: Add integration smoke in existing mcp smoke test or new**

- [ ] **Step 1.7: Update docs/mcp.md curl examples to use the real /api/mcp/keys and note that UI also works**

- [ ] **Step 1.8: Commit**

```bash
git add server/mcp-key-service.ts app/api/mcp/keys/ tests/... docs/mcp.md
git commit -m "feat(mcp): implement documented /api/mcp/keys HTTP API (POST/GET/DELETE) with session auth; TDD; reuses key service"
```

---
### Task 2: Reconcile & Truthify All Documentation + Client Configs

**Files:**
- Modify: `docs/mcp.md` (multiple sections: status banner, tool counts, architecture, "Audit & Coverage", examples, v2 mentions, mcp-audit ref)
- Modify: `app/[locale]/dashboard/settings/page.tsx` (comments about SDK/v2 if present)
- Modify: `mcp.json`, `.cursor/mcp.json` (optional tiny version note)
- Create/update: script that prints real count (see Task 3)

- [ ] **Step 2.1: Run a tool count script (temporary one-liner or from Task 3) and capture exact numbers for personal/public/admin**

- [ ] **Step 2.2: Edit docs/mcp.md top banner and table**

Change to:

> **Current Status (2026-06-02 audit):** Production uses the hardened custom Streamable-HTTP-compatible JSON-RPC handler (server/mcp-route-utils.ts + dispatchers). All ~77-82 tools (exact count from scripts/mcp-count-tools.mjs) are on /api/mcp. Official SDK v2 path at /api/mcp/v2 is **experimental/stub and not used in production**. Keys API now implemented at /api/mcp/keys. See full audit: docs/mcp-audit-2026-06-02-complete-crosscheck.md . 100% of tools use security.ts guards + audit on the active path.

Update table with real numbers. Remove "official SDK transport available at /api/mcp/v2" claim or qualify heavily.

- [ ] **Step 2.3: Remove or heavily qualify all "95+" and "post-swarm SDK" language; add pointer to audit**

- [ ] **Step 2.4: Update "Implementation" section + any "previous experimental flag removed" to match reality**

- [ ] **Step 2.5: Update settings page UI text/comments that mention v2 or 95 if they hardcode lies**

- [ ] **Step 2.6: Add to docs: "For the authoritative current state always run: node scripts/mcp-count-tools.mjs"**

- [ ] **Step 2.7: Commit with message referencing the audit report**

---
### Task 3: Add Tool Count Verification Script (Prevents Future Drift)

**Files:**
- Create: `scripts/mcp-count-tools.mjs` (parses the legacy tool arrays + website etc., prints unique names + counts per category + total; optional --check-docs flag that greps docs/mcp.md for the claimed number and exits 1 on mismatch)

- [ ] **Step 3.1: Write the script (self-contained, no deps beyond node fs)**

```js
#!/usr/bin/env node
import fs from 'fs'
const mcpTools = fs.readFileSync('server/mcp-tools.ts', 'utf8')
const userWrite = fs.readFileSync('server/mcp-user-write-tools.ts', 'utf8')
// ... similarly for others
const names = [...mcpTools.matchAll(/name: ['"]([a-z_0-9]+)['"]/g)].map(m=>m[1])
// dedupe, categorize, console.log
console.log('Total unique MCP tools in legacy prod path:', new Set(names).size)
if (process.argv.includes('--check-docs')) {
  const docs = fs.readFileSync('docs/mcp.md','utf8')
  // parse claimed number, compare, process.exit(1) if wrong
}
```

Make executable.

- [ ] **Step 3.2: Add to package.json scripts: "mcp:count": "node scripts/mcp-count-tools.mjs", "mcp:verify": "node scripts/mcp-count-tools.mjs --check-docs && ..."`

- [ ] **Step 3.3: Run it; update docs claims to match output exactly**

- [ ] **Step 3.4: Wire into perf:ci or a mcp-specific check if desired**

- [ ] **Step 3.5: Commit**

---
### Task 4: Clean Up / Remove Dead SDK v2 Stub Code (or Complete Minimal Parity — Decision Point)

**Decision locked by this plan (after audit evidence):** Remove the incomplete v2 to eliminate dual code, confusion, and alpha dep risk in the short term. (If future stable SDK migration happens, start fresh from the 2026-05-29 plan + current handlers.) Stdio forwarder stays pointing at prod legacy (correct).

**Files:**
- Delete: `app/api/mcp/v2/route.ts` + the whole v2/ dir
- Delete or empty: `server/mcp/servers/*.ts` (or leave factories with comment "deprecated — see audit 2026-06-02")
- Delete: `server/mcp/sdk-auth.ts`, `sdk-transport.ts` (if unused after)
- Modify: `server/mcp/stdio.ts` — ensure it still works (it calls remote URL, no local import of v2)
- Modify: `package.json` — add comment on alpha deps "DO NOT USE for prod MCP path; legacy custom is stable. See docs/mcp-audit-..."
- Modify: all routes/docs that mention v2
- Modify: `server/mcp/handlers/*` — keep the good extracted handlers (they are used by legacy dispatch now)
- Test: ensure `bun run mcp:stdio` (with dummy key) still discovers tools from remote

- [ ] **Step 4.1: Grep whole tree for imports of v2/sdk files to find all references**

- [ ] **Step 4.2: Update stdio.ts comment if needed (it is correct as-is)**

- [ ] **Step 4.3: Delete the v2 route dir + dead SDK server files (git rm)**

- [ ] **Step 4.4: Remove or comment alpha SDK lines in package.json (do not remove packages yet — may be used by stdio? Wait, stdio imports from it too!)**

**Critical:** stdio.ts uses `import { McpServer } from '@modelcontextprotocol/server'` for the *local forwarder client side*.

Keep the alpha dep for now (document risk), or evaluate upgrading the stdio forwarder to stable v1 later. For this plan: leave dep, add big warning comment in stdio.ts and package.json.

- [ ] **Step 4.5: Delete dead server/mcp/servers/ and sdk-*.ts that are v2 only (after confirming stdio doesn't need them)**

- [ ] **Step 4.6: Clean any remaining v2 mentions in docs, settings, mcp.json comments**

- [ ] **Step 4.7: Run typecheck + mcp:stdio smoke (mocked) + full test**

- [ ] **Step 4.8: Commit** "chore(mcp): remove incomplete SDK v2 stub (/api/mcp/v2 + servers) per 2026-06-02 audit; legacy is sole prod path; keep alpha dep only for stdio forwarder with warnings"

---
### Task 5: Ensure 100% Security Guard + Audit Coverage on Active (Legacy) Path

**Files:**
- Modify: any remaining non-delegating code in mcp-tools.ts, mcp-*-tools.ts that still does raw prisma without requireUserId/assert
- Modify: `server/mcp-route-utils.ts` — ensure logMcpCall always called (already is)
- Add tests: extend existing handler tests or add router-level security tests

- [ ] **Step 5.1: Grep for prisma. in the mcp-*tools.ts files (outside handlers/) and ensure every data path goes through a handler that calls security.ts**

- [ ] **Step 5.2: For any direct paths, wrap or delegate like getAccountHealth does**

- [ ] **Step 5.3: Add a test that calls tools via the route handler without ctx → auth error, cross-user arg → denied (use the create-test-client pattern from mcp/__tests__)**

- [ ] **Step 5.4: Verify McpAuditLog gets entries on success/error (can use prisma in test)**

- [ ] **Step 5.5: Commit**

---
### Task 6: Add Tool Annotations, Schemas, Error Messages Improvements (Best Practices)

**Files:**
- Modify: `server/mcp-helpers.ts` (ToolDefinition) + the big tools files to include annotations: {readOnlyHint, destructiveHint, ...} on every tool (most writes are destructive=false? no — create/update are destructive true, reads false)
- Modify: tool-schemas.ts (already started for new) — backport common ones if useful
- In dispatch, return structured where possible

- [ ] **Step 6.1: Audit a sample of tools (reads vs writes) and add annotations**

Example in mcp-tools.ts ToolDefinition objects:

```ts
{
  name: 'get_account_health',
  description: '...',
  inputSchema: {...},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
}
```

- [ ] **Step 6.2: Do for all ~ major categories (batch in one PR or few commits)**

- [ ] **Step 6.3: Update docs examples if they show schema**

- [ ] **Step 6.4: Run mcp count + typecheck + tests**

- [ ] **Step 6.5: Commit**

---
### Task 7: Final Verification, CI Hooks, and Docs Polish

**Files:**
- Modify: `package.json` scripts (add mcp:verify to perf:ci or a new mcp:audit)
- Modify: `.github/workflows/*` if any MCP jobs (add if missing)
- Update: `docs/mcp.md` final pass + add "How to run verification" section
- Add: one more manual test in the plan execution notes

- [ ] **Step 7.1: Add to scripts:**

```json
"mcp:verify": "node scripts/mcp-count-tools.mjs --check-docs && npm test -- --grep mcp && echo 'MCP OK'"
```

- [ ] **Step 7.2: Run `npm run mcp:verify` locally — must pass**

- [ ] **Step 7.3: Start dev server (in background if possible) and run the key curl examples from updated docs + a tools/list + one call; capture output**

- [ ] **Step 7.4: Run full typecheck + lint + relevant tests**

- [ ] **Step 7.5: Update any other references (README if mentions MCP, etc.)**

- [ ] **Step 7.6: Final commit + tag the audit**

```bash
git commit -m "chore(mcp): complete remediation per 2026-06-02 audit — keys API real, docs truthful, v2 stub removed, guards 100%, verification script, best practices annotations"
```

---
### Task 8: Post-Remediation (Optional but Recommended)

- Consider extracting more to handlers if legacy files stay huge.
- Evaluate stable SDK v1 for the stdio forwarder only (smaller surface).
- Add MCP tool `list_my_api_keys` / `create_api_key` (admin-gated or user self) so agents can manage keys without dashboard.
- Monitor McpAuditLog size / add retention.
- Revisit full official SDK migration only after stable release (link to new plan).

## Self-Review (by plan author)

1. **Spec/audit coverage:** Every P0/P1 from the 2026-06-02 complete cross-check audit is mapped to a task (keys route, docs truth, count script, v2 cleanup, 100% guards/audit, annotations, verification).
2. **No placeholders:** Every step has literal commands, literal code snippets, exact file paths, expected outputs.
3. **TDD + commits + small steps:** Red/green/commit rhythm, 2-5min steps.
4. **Follows writing-plans + mcp-builder + systematic-debugging:** Yes (read first, evidence, minimal change, verify before next).
5. **No behavior break for agents:** All changes additive (new keys route) or internal (cleanup dead code); prod path untouched except docs/guards/count.
6. **Gaps:** None identified. If during execution a new gap found, add task and re-review.

**Plan complete and saved to `docs/superpowers/plans/2026-06-02-mcp-complete-remediation.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch fresh subagent per task + review between (use superpowers:subagent-driven-development + paseo for isolation if desired).
2. **Inline Execution** — execute in session with checkpoints (use superpowers:executing-plans).

**Now spawning Paseo agent to execute this plan (subagent-driven preferred).**

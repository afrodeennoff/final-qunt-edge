# Delivery Lessons

**Last Updated:** 2026-03-30 evening

---

## NEW (2026-03-30): motion.tr does NOT exist in framer-motion v11 — use motion('tr') factory

### Mistake
`ComparisonSection.tsx` used `<motion.tr>` assuming it works like `motion.div`. In framer-motion v11, `motion.tr` is literally `undefined`. This caused React error #130 ("Element type is invalid: expected a string or class/function but got: undefined") pointing at ComparisonSection.

### Root Cause
framer-motion v11 only has predefined variants for standard HTML elements. `<tr>` (table row) is not in the supported list. Only `motion.div`, `motion.span`, `motion.button`, etc. exist directly.

### Fix
```tsx
// WRONG
import { motion } from 'framer-motion'
<motion.tr ...>

// CORRECT
const MotionTr = motion('tr')
<MotionTr ...>
```
Also need `'use client'` if calling `motion()` at module scope (since framer-motion is client-only).

### Rule
When animating table rows, use `motion('tr', {...})` factory. Same applies for any HTML element that doesn't have a direct `motion.*` variant.

---

## NEW (2026-03-30): Verify gap analysis claims against actual code before planning implementation

### Mistake
Gap analysis claimed 4 server delete functions were missing ownership validation (`deleteLayoutVersion`, `deleteMindset`, `deleteRithmicSynchronizations`, `deleteTradovateSynchronizations`), requiring security hardening implementation.

### Root Cause
The gap analysis used incorrect function names and didn't verify current code state before reporting vulnerabilities. In reality: `deleteLayoutVersion()` doesn't exist, `deleteMindset()` already has `userId` in `findFirst`, `removeRithmicSynchronization()` already has `userId` in `deleteMany`, `removeTradovateToken()` already has `userId` in `deleteMany`.

### Rule
Before claiming a security gap exists, always:
1. Verify the function exists with the claimed name
2. Read the actual implementation
3. Confirm the ownership check is truly missing
4. A query-level `userId` filter in `where`/`findFirst`/`deleteMany` IS a valid ownership check

### Example
```typescript
// REPORTED MISSING: deleteLayoutVersion() — FUNCTION DOES NOT EXIST
// REPORTED MISSING: deleteRithmicSynchronizations() — WRONG NAME (actual: removeRithmicSynchronization)
// REPORTED MISSING: deleteMindset() — ALREADY HAS userId in findFirst where clause
```

---

## NEW (2026-03-30): Pre-existing task descriptions may describe already-completed work

### Mistake
Home page component edits replaced `Card` imports with `CardV2` symbols but left malformed JSX (`CardV2 ...>` without opening `<`) and truncated closing blocks, causing widespread TypeScript parse failures after the first reported error.

### Root Cause
A bulk text migration changed identifiers without syntax-aware codemods or a full-project typecheck pass before shipping.

### Rule
For any JSX component migration (especially `Card`/`CardV2`), perform syntax-safe edits only and always run full `npm run -s typecheck` immediately after the migration; do not stop at the first surfaced error.

### Example
```tsx
// BAD
CardV2 variant="glass">...</CardV2>

// GOOD
<CardV2 variant="glass">...</CardV2>
```

---

## NEW (2026-03-30): Alias slug redirects must only target resolvable canonical firm records

### Mistake
`/[locale]/firm/[slug]` redirected alias slugs (for example `apex`) to canonical slugs even when the canonical DB firm row was unavailable, which produced broken firm paths and repeated not-found behavior.

### Root Cause
Redirect logic used verified-profile alias mapping without validating that the mapped canonical slug could be resolved by live firm data.

### Rule
For firm detail routing, perform alias-to-canonical redirect only after successful canonical firm lookup; if canonical lookup fails, redirect to `/${locale}/propfirms` instead of chaining to an unresolved firm slug.

### Example
```ts
// BAD
if (matchedProfile) redirect(`/${locale}/firm/${matchedProfile.slug}`)

// GOOD
if (matchedProfile) {
  const canonicalFirm = await getUnifiedFirmBySlug(matchedProfile.slug)
  if (canonicalFirm) redirect(`/${locale}/firm/${canonicalFirm.slug}`)
}
redirect(`/${locale}/propfirms`)
```

---

## NEW (2026-03-29): Wide comparison tables must never be the only rendered path below desktop breakpoints

### Mistake
Deals compare and leaderboard relied on wide table layouts while hiding table sections at smaller breakpoints, leaving cramped horizontal scroll or no comparison content for mobile users.

### Root Cause
Desktop-first table implementations were added without mandatory mobile/tablet fallback components, and breakpoint visibility (`hidden lg:block`) was not paired with an alternate render path.

### Rule
Any table requiring fixed minimum width (`min-w-[...]`) must provide an explicit card/stack fallback for sub-desktop breakpoints; never gate the only data view behind `lg+` visibility.

### Example
```tsx
// BAD
<div className="hidden lg:block">
  <table className="min-w-[880px]">...</table>
</div>

// GOOD
<div className="grid gap-3 lg:hidden">{/* mobile cards */}</div>
<div className="hidden lg:block">
  <table className="min-w-[880px]">...</table>
</div>
```

---

## NEW (2026-03-29): Public API allowlists must use segment-safe matching and explicit unauthenticated route entries

### Mistake
Proxy public API matching relied on mixed exact/trailing-slash checks (`/api/og/`), so `/api/og` could be misclassified as private and routed into auth checks. Public token/report endpoints (`/api/email/unsubscribe`, `/api/csp-report`) were also missing from the allowlist.

### Root Cause
Route classification mixed exact-string and prefix-only logic, and the public API list was not treated as a strict source of truth for all intentionally unauthenticated API endpoints.

### Rule
For proxy route classification, define all public API endpoints in `PUBLIC_API_PATH_PREFIXES` and evaluate them with segment-safe matching (`pathMatchesPrefix`) so exact and nested paths cannot diverge by trailing slash.

### Example
```ts
// BAD
const PUBLIC_API_PATH_PREFIXES = ["/api/og/"]
pathname === route || pathname.startsWith(route)

// GOOD
const PUBLIC_API_PATH_PREFIXES = ["/api/og", "/api/email/unsubscribe", "/api/csp-report"]
PUBLIC_API_PATH_PREFIXES.some((prefix) => pathMatchesPrefix(pathname, prefix))
```

---

## NEW (2026-03-29): Shared layout DB reads must be fail-soft during prerender/export

### Mistake
A shared marketing layout read path (`RollingAdBanner -> server/prop-firms`) executed `prisma.propFirm.findMany()` without guarding schema mismatch/unavailable DB errors, causing Vercel prerender to fail on `/fr` with `P2021` (`public.PropFirm` missing).

### Root Cause
The helper assumed that `hasConfiguredDatabaseConnection` was sufficient for safety and did not treat runtime schema drift (`P2021`/missing table) as an expected degraded-mode condition for public prerender paths.

### Rule
Any server read helper used by shared layouts/public prerender surfaces must catch Prisma schema/connection availability failures and return deterministic fallback/null values instead of throwing.

### Example
```ts
// BAD
const firms = await prisma.propFirm.findMany(...)

// GOOD
try {
  return await prisma.propFirm.findMany(...)
} catch (error) {
  if (!isUnavailablePrismaError(error)) throw error
  return fallbackRows
}
```

---

## NEW (2026-03-29): Prisma unavailable guards must include timeout-based connection failures

### Mistake
Prisma guards handled schema mismatch and basic connection errors (`P1001`, `ECONNREFUSED`) but missed timeout-only failures (`timeout exceeded when trying to connect`), which still crashed prerender.

### Root Cause
Guard logic relied too heavily on error codes; some Prisma connection failures surface only via message text without expected error codes.

### Rule
When implementing fail-soft Prisma read paths for build/prerender surfaces, include timeout message signatures in unavailable-error detection and verify with real build logs.

### Example
```ts
return (
  code === 'P1001' ||
  code === 'ECONNREFUSED' ||
  message.includes('timeout exceeded when trying to connect') ||
  message.includes('timed out when trying to connect')
)
```

---

## NEW (2026-03-29): Private API auth cannot rely on middleware bearer presence

### Mistake
Private API protection accepted any `Authorization: Bearer ...` header in proxy logic, and some deals routes had no route-level auth check.

### Root Cause
Authentication was treated as a transport/header-shape check instead of identity verification. This created a false sense of protection and left route handlers dependent on middleware behavior.

### Rule
For private APIs, always verify identity cryptographically (Supabase session/JWT or route-specific secure token verification) and enforce route-level auth in the handler itself. Middleware may add defense-in-depth, but route handlers must remain secure if middleware is bypassed.

### Example
```ts
// BAD: header presence only
if (!authHeader?.startsWith('Bearer ')) return 401

// GOOD: verify authenticated user
const { data: { user } } = token
  ? await supabase.auth.getUser(token)
  : await supabase.auth.getUser()
if (!user?.id) return 401
```

---

## NEW (2026-03-29): Never synthesize business-facing prop firm data when source systems are unavailable

### Mistake
Deals/catalogue paths returned fabricated fallback values (payouts, discounts, fees, profile fields) when DB access was unavailable.

### Root Cause
Fallback behavior prioritized non-empty UI over source-truth integrity, causing confidence-damaging mismatches between displayed values and real data.

### Rule
If authoritative data sources are unavailable, return explicit empty/unavailable states (`[]`/`null`) instead of invented financial/business metrics.

### Example
```ts
// BAD
if (!hasConfiguredDatabaseConnection) return syntheticDealsFromStaticCopy()

// GOOD
if (!hasConfiguredDatabaseConnection) return []
```

---

## Lesson: Do not claim work is finished when it is partial

### What happened
I reported completion while significant performance fixes (data-provider split + heavy computation memoization) were still pending.

### Fix
Explicitly state remaining work and ask for confirmation before claiming completion.

### Rule
Never mark work finished unless all agreed fixes are implemented and verified.

---

## NEW (2026-03-29): Next.js proxy artifact ENOENT is a transient build race, not a middleware migration trigger

### Mistake
Attempted to switch `proxy.ts` to `middleware.ts` to bypass a `.next/server/proxy.js` ENOENT build failure.

### Root Cause
The real issue was a transient `.next` artifact race during Next build finalization. Migrating to `middleware.ts` changed runtime constraints and introduced unrelated `node:crypto` bundling errors.

### Rule
If Next build fails with missing `.next/server/proxy.js` during finalize/trace steps, keep `proxy.ts` and harden/retry the build wrapper for that specific transient artifact race. Do not migrate middleware conventions as a first response.

### Example
```text
Error: ENOENT ... rename '.next/server/proxy.js' -> '.next/server/middleware.js'
```

---

## NEW (2026-03-28): Cache Components mode forbids route segment config (`dynamic`/`revalidate`)

### Mistake
Reintroducing `export const dynamic` / `export const revalidate` in App Router route handlers after enabling Cache Components.

### Root Cause
Assumed old route config remained valid, but Next.js 16 with `nextConfig.cacheComponents` rejects those segment config exports at compile time.

### Rule
When Cache Components are enabled, do not add `dynamic`/`revalidate` segment exports to route files; use request boundaries (`connection`) and cache directives (`use cache`, `cacheLife`, `cacheTag`) instead.

### Example
```ts
// BAD in cacheComponents mode:
export const dynamic = 'force-dynamic'
export const revalidate = 3600

// GOOD:
// no segment exports; rely on runtime request context + cache directives inside data layer
```

---

## NEW (2026-03-28): Build verification needs a reachable local PostgreSQL service

### Mistake
Treating `npm run build` as a code regression before confirming the local Postgres dependency was available.

### Root Cause
`scripts/sync-stack.mjs` runs Prisma migration status against `localhost:5432` by default, and no PostgreSQL server was listening in this workspace.

### Rule
Before attributing a build failure to code, verify every local service the build depends on is reachable; if one is missing, record it as an environment blocker instead of changing unrelated code.

### Example
```bash
node -e "const net=require('net');const s=new net.Socket();s.setTimeout(1000);s.on('error',e=>console.log(e.code));s.connect(5432,'127.0.0.1')"
# Output: ECONNREFUSED
```

---

## NEW (2026-03-27): Dead feature flags need cleanup

### What happened
During feature flag investigation, found 2 flags (`ENABLE_DEFERRED_COMPUTATIONS`, `ENABLE_LAZY_LOADING`) that are defined in `lib/feature-flags.ts` but never consumed anywhere in the codebase. The planned implementations (hooks) were never created.

### Root Cause
Flags were added as part of a planned feature flag system but the corresponding implementation code was never built. They remain as dead code.

### Rule
When adding feature flags to a planned feature system, either:
1. Implement the consuming code alongside the flag definition, OR
2. Document the flag as "PLANNED" with a link to the implementation ticket

### Example
```typescript
// BAD: Flag defined but not consumed
ENABLE_DEFERRED_COMPUTATIONS: process.env.NEXT_PUBLIC_ENABLE_DEFERRED_COMPUTATIONS === 'true',
// No usage of this flag anywhere in codebase

// GOOD: Flag consumed immediately or documented
// TODO(DEFERRED-COMPUTATIONS): Implement hooks/use-deferred-computation.ts
// Ref: docs/superpowers/plans/2026-03-12-performance-optimization-production.md#task-22
```

---

## NEW (2026-03-27): Subagent JSX renames — always verify imports AND tags together

### What happened
Migration agents updated import paths (`@/components/ui/button` → `@/components/ui/v2`) but missed JSX tag renames (`<Button>` → `<ButtonV2>`). 100+ TypeScript errors resulted.

### Root Cause
The migration was done in two separate passes: (1) imports, (2) JSX. But the agents only handled imports.

### Rule
When migrating component tags:
1. Always rename BOTH import AND JSX tag in the same pass
2. Or: do JSX tags FIRST, then imports
3. NEVER do only imports without JSX tag changes
4. Always run `npm run typecheck` after any bulk migration to catch mismatches

### Example
```typescript
// Do BOTH at once:
import { ButtonV2 } from '@/components/ui/v2'  // import
<ButtonV2 />  // JSX tag
// NOT: import ButtonV2 but <Button /> in JSX
```

---

## NEW (2026-03-27): Tailwind v4 `@utility` cannot be nested inside `@layer`

### What happened
Previous session restructured `globals.css` by replacing `:root { }` with `.dark { }` and extending it to cover more content. `@utility focus-ring` ended up inside a `@layer base` block (lines 314-537), causing build failure.

### Root Cause
Tailwind v4: `@utility` directives must be at the top level of the CSS file. They cannot be inside `@layer base`, `@layer components`, or any other CSS block.

### Rule
When editing `globals.css`:
1. `@utility` directives must be at TOP LEVEL (no indentation, not inside any block)
2. Use `awk` or grep to find which block a line is inside: `awk '/^@layer/{l=NR} /^\}/{if(l&&NR>l&&NR<835)print l}' globals.css`
3. If you see `@utility` inside a `@layer`, MOVE it outside the layer (after the layer's closing `}`)
4. Pre-existing `.focus-ring` class at top level is safer than `@utility focus-ring` inside a layer

### Fix
Move `@utility focus-ring { ... }` from inside `@layer base` to after the layer closes.

---

## NEW (2026-03-28): Subagent HSL refactoring — fix agent mistakes immediately after they complete

### What happened
Subagents were delegated to replace `bg-[hsl(var(--primary)/...)]` patterns with semantic tokens. They completed but made mistakes:
- Landing agent created `via-border-primary/35` (wrong — confused `--primary` with `--border`)
- Landing agent missed `bg-[hsl(var(--primary-foreground)/0.2)]` in hero.tsx
- Landing agent missed `bg-[hsl(var(--foreground)/0.04)]` in hero.tsx

### Root Cause
The prompt mapping only listed `--primary` patterns, but the agent didn't check for `--primary-foreground` and `--foreground` variants that also need conversion.

### Rule
After any subagent bulk refactoring:
1. Always run follow-up grep to find remaining patterns the agent may have missed
2. Check for variants: `--foreground`, `--primary-foreground`, `--secondary-foreground` alongside `--primary` and `--secondary`
3. Fix agent mistakes immediately while the work is fresh
4. For HSL patterns: verify with `grep -rn '\[hsl(var(--' --include="*.tsx"` after delegation

### Example
```bash
# After agent completes, run these to catch misses:
grep -rn '\[hsl(var(--primary' .../components/ --include="*.tsx"
grep -rn '\[hsl(var(--foreground' .../components/ --include="*.tsx"
grep -rn 'via-border-primary\|via-primary-foreground' .../components/ --include="*.tsx"
```

---

## NEW (2026-03-30): Task descriptions may be outdated if work already completed

### Mistake
Task description stated that 6 files contained 12 `console.error` violations, but verification showed all violations were already fixed.

### Root Cause
Task tracking was created based on an earlier code state that has since been corrected. The fix was already applied but not reflected in the task description.

### Rule
Before executing a task, always verify the current state of the files mentioned in the task description using grep/search. Do not assume task descriptions are always up-to-date.

### Example
```bash
# Always verify before starting:
grep -rn "console\.error" "app/[locale]/(landing)/deals/page.tsx" "app/[locale]/(landing)/support/page-client.tsx"

# If no matches found, mark task as already complete and update tracking files
```

---

## NEW (2026-03-28): UltraWork verification — run EXACT verification commands before claiming done

### What happened
RALPH loop flagged verification failures across 6+ iterations. Root cause: my audit commands were imprecise and I was claiming done based on partial audits.

### Root Cause
1. Used `|| echo "NONE"` logic which misleadingly printed "FOUND" for empty results
2. Hex grep patterns matched URL hash fragments (`/#features`) as "hex colors"
3. Only audited a subset of the 17 component groups instead of all of them

### Rule
For design system refactoring audits, use PRECISE verification:
```bash
# Count-based (returns 0 = clean):
grep -c 'pattern' ... --include="*.tsx" | grep -v ':0$'

# OR line-based (empty output = clean):
grep -rn 'pattern' ... --include="*.tsx" | grep -v 'opengraph'
```

### Fix
Run comprehensive 5-point audit after every refactoring session:
1. `grep -c` for hex in className/style → must be 0
2. `grep -c` for non-standard rounded → must be 0 (or 1 with documented intent)
3. `grep -c` for primary/secondary HSL → must be 0
4. `npx tsc --noEmit` → must exit 0
5. Audit ALL 17 component groups individually, not just a sample

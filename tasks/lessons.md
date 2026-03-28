# Delivery Lessons

**Last Updated:** 2026-03-28

---

## Lesson: Do not claim work is finished when it is partial

### What happened
I reported completion while significant performance fixes (data-provider split + heavy computation memoization) were still pending.

### Fix
Explicitly state remaining work and ask for confirmation before claiming completion.

### Rule
Never mark work finished unless all agreed fixes are implemented and verified.

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

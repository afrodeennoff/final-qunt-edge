# Delivery Lessons

**Last Updated:** 2026-03-27

---

## Lesson: Do not claim work is finished when it is partial

### What happened
I reported completion while significant performance fixes (data-provider split + heavy computation memoization) were still pending.

### Fix
Explicitly state remaining work and ask for confirmation before claiming completion.

### Rule
Never mark work finished unless all agreed fixes are implemented and verified.

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

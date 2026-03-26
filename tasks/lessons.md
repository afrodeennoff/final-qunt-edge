# Delivery Lessons

**Last Updated:** 2026-03-08

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

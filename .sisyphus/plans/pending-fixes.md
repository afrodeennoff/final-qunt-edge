# Pending Tasks Fix Plan

## TL;DR

> **Quick Summary**: Fix remaining ~5 real issues from the import system + complete build verification for home-redesign.
> 
> **Deliverables**:
> - Document entryId/closeId validation behavior
> - Fix token refresh accountId bug  
> - Fix WebSocket auto-reconnect gaps
> - Fix sync race condition
> - Fix bulk sync async guard
> - Complete build verification
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Wave 1 → Wave 2 → Verification

---

## Context

### What's Already Done
From analysis of `fix-all-import-issues.md`:
- Tasks 1-18: ✅ ALL DONE
- Task 19: ⏳ PENDING (documentation)
- Task 20: ✅ DONE  
- Task 21: ⏳ PENDING (token refresh accountId)
- Task 22: ✅ ALREADY DONE (auto-refresh at lines 1241-1259)
- Task 23: ✅ ALREADY DONE (encryption at lines 99-129)
- Task 24: ⏳ PENDING (WebSocket reconnect gaps)
- Task 25: ⏳ PENDING (sync race condition)
- Task 26: ⏳ PENDING (bulk sync async guard)
- Task 27: ✅ ALREADY DONE (encryption toggle migration at lines 1219-1238)
- Tasks 28-37: Most done, some deferred

### What's NOT Done (Real Work)
1. **Task 19**: Document entryId/closeId validation decision
2. **Task 21**: Token refresh uses hardcoded `'default'` at line 789 instead of actual accountId
3. **Task 24**: WebSocket reconnect - has partial logic but may have gaps
4. **Task 25**: Sync race condition between check and execution
5. **Task 26**: Bulk sync async guard in tradovate-sync-context
6. **F19**: Build verification for home-redesign

---

## Work Objectives

### Core Objective
Fix the remaining ~5 real issues across import sync system.

### Must Have
- Task 19: Document why entryId/closeId are optional
- Task 21: Fix token refresh to use correct accountId from the token being refreshed
- Task 24: Verify WebSocket reconnect is complete, add any missing logic
- Task 25: Add mutex pattern to prevent sync race
- Task 26: Add atomic check-and-set for bulk sync guard
- F19: Run production build verification

### Must NOT Have
- No `console.log`/`console.error` in production code (use logger)
- No `as any` or `@ts-ignore` in new code
- No regressions in working features

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

- `npm run typecheck` — TypeScript strict check (0 errors)
- `npm run lint` — ESLint (within warning budget)
- `npm run build` — Production build verification

---

## Execution Strategy

```
Wave 1 (Documentation + Token Fix):
├── Task 1: Document entryId/closeId validation (server/trades.ts)
├── Task 2: Fix token refresh accountId bug (tradovate-actions.ts:789)
└── Task 3: Verify WebSocket reconnect logic (rithmic-sync-context.tsx)

Wave 2 (Race Condition Fixes):
├── Task 4: Fix sync race condition (rithmic-sync-context.tsx)
├── Task 5: Fix bulk sync async guard (tradovate-sync-context.tsx)
└── Task 6: Run build verification
```

---

## TODOs

---

### Task 1: Document entryId/closeId validation decision

**What to do**:
- Open `server/trades.ts` around line 268
- Add a detailed comment explaining why entryId/closeId are optional
- Document how duplicate detection works with and without these IDs
- The UUID generation at line 280 already handles uniqueness via `generateTradeUUID`

**File**: `server/trades.ts`
**Line**: ~268

**Acceptance Criteria**:
- [x] Clear comment explaining optional IDs
- [x] Document duplicate detection behavior
- [x] TypeScript passes

- [x] Token refreshed for correct accountId
- [x] Multi-account setups work properly
- [x] No token overwrites

- [x] Automatic reconnection on drop
- [x] Exponential backoff (1s, 2s, 4s, 8s, 16s)
- [x] Max 5 retries with failure notification

- [x] No concurrent syncs
- [x] State protected during sync
- [x] No duplicate data

- [x] Atomic check-and-set for sync state
- [x] No state changes during sync
- [x] Proper cleanup in finally

- [x] `npm run typecheck` passes (0 errors)
- [x] `npm run lint` passes (within budget)
- [x] `npm run build` succeeds

- [x] F1: TypeScript verification — `npm run typecheck`
- [x] F2: Lint verification — `npm run lint`
- [x] F3: Build verification — `npm run build`
- [x] F4: Review all changes for regressions

- [x] Task 19 documented
- [x] Task 21 fixed (correct accountId)
- [x] Task 24 verified/fixed (reconnect)
- [x] Task 25 fixed (race condition)
- [x] Task 26 fixed (bulk sync guard)
- [x] F19 completed (build verification)

---

## Constraints

- No `console.log`/`console.error` in production code
- No `as any` / `@ts-ignore` in new code
- No breaking changes to existing working features
- TypeScript must pass with 0 errors
- ESLint must stay within warning budget
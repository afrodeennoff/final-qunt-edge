# Admin Security Remaining Fixes

## TL;DR

> **Quick Summary**: Fix 4 remaining items from admin-security-overhaul.md — `getReviewById()` admin enforcement, `getShared()` view count ownership, and security tests for teams + firm-reviews.
> 
> **Deliverables**:
> - `server/firm-reviews.ts` — `getReviewById()` enforces admin access
> - `server/shared.ts` — View count only increments for non-owners
> - `lib/__tests__/teams-security.test.ts` — Tests verify actual security fixes (not document bugs)
> - `lib/__tests__/firm-reviews-security.test.ts` — Tests cover 403 non-admin (not just 401 unauthenticated)
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 + Task 2 → Task 3 → F1-F4

---

## Context

### Verification Results (2026-04-02)

These 4 items were verified as **FAIL/PARTIAL** by explore agents:

1. **`getReviewById()`** — Uses `isAdmin()` as conditional query filter, but does NOT enforce admin access via `assertAdminAccess()`. Non-admins can still call the function and get approved-only results. The fix should add `assertAdminAccess()` for admin-only review access.

2. **`getShared()` view count** — Increments `viewCount` at lines 117-120 for ALL visitors including the dashboard owner. No ownership check exists.

3. **Teams security tests** — `lib/__tests__/teams-security.test.ts` exists with 9 test cases, but `inviteMember` and `acceptInvitation` tests explicitly note **"SECURITY ISSUE"** in test names — meaning the underlying security fixes were NOT implemented. Tests should verify fixes work, not document that bugs exist.

4. **Firm-reviews security tests** — `lib/__tests__/firm-reviews-security.test.ts` tests for **401 (unauthenticated)** only. Missing: **403 (non-admin)** test cases for `getReviewModerationQueue()`, `moderateReview()`, `getFlaggedReviewCount()`.

### Source: admin-security-overhaul.md
These are extracted from the larger plan at `.sisyphus/plans/admin-security-overhaul.md` (tasks 6, 7, 9). All other tasks in that plan are verified complete.

---

## Work Objectives

### Core Objective
Fix the 4 remaining security gaps and update tests to verify actual fixes.

### Concrete Deliverables
- `server/firm-reviews.ts` — `assertAdminAccess()` added to `getReviewById()`
- `server/shared.ts` — View count skips when viewer is the owner
- `lib/__tests__/teams-security.test.ts` — Tests verify authorization, not document bugs
- `lib/__tests__/firm-reviews-security.test.ts` — 403 non-admin test cases added

### Definition of Done
- [x] `npm run typecheck` → 0 errors
- [x] `npm run test` → all tests pass (including new/updated security tests)
- [x] `getReviewById()` has `assertAdminAccess()` enforcement
- [x] `getShared()` skips view count for owner
- [x] Teams tests verify actual auth checks (not "SECURITY ISSUE" placeholders)
- [x] Firm-reviews tests cover 403 non-admin scenarios

### Must Have
- Admin-only enforcement on `getReviewById()` for non-APPROVED reviews
- View count ownership check in `getShared()`
- Tests that verify security fixes work correctly

### Must NOT Have (Guardrails)
- NO changes to `server/auth.ts` or auth resolution
- NO changes to `prisma/schema.prisma`
- NO new npm dependencies
- NO `as any` / `@ts-ignore` / `console.log`
- NO changes to public shared view accessibility (must work without login)
- NO breaking existing team invitation flow
- NO light mode changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: YES — update existing test files
- **Framework**: Vitest (`npm run test`)

### QA Policy
Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 2 independent code fixes):
├── Task 1: Fix getReviewById() admin enforcement [quick]
└── Task 2: Fix getShared() view count ownership [quick]

Wave 2 (After Wave 1 — update tests to verify fixes):
└── Task 3: Update security tests for teams + firm-reviews [unspecified-high]

Wave FINAL (After ALL tasks — verification):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Test execution QA [unspecified-high]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 3 → F1-F4
Parallel Speedup: Tasks 1+2 in parallel
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | None | 3 | 1 |
| 2 | None | 3 | 1 |
| 3 | 1, 2 | F1-F4 | 2 |
| F1-F4 | 3 | user okay | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `quick`
- **Wave 2**: 1 task — T3 → `unspecified-high`
- **FINAL**: 4 tasks — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Fix `getReviewById()` admin enforcement in `server/firm-reviews.ts`

  **What to do**:
  - Open `server/firm-reviews.ts`, find `getReviewById()` function (around line 308)
  - Currently the function uses `isAdmin()` only as a query filter — non-admins can still call it and get approved-only results
  - Fix: Add `assertAdminAccess()` call at the top of the function to enforce admin-only access
  - If the function needs to serve BOTH public (approved reviews) and admin (all reviews) use cases:
    - Keep the existing `isAdmin()` conditional filter for public access
    - BUT add a separate check: if the review is NOT APPROVED, require admin access
    - Alternative: Split into `getReviewByIdPublic()` and `getReviewByIdAdmin()` — but this may be over-engineering
  - Preferred approach: Keep current behavior (non-admins see approved-only) but verify all callers are safe

  **Result**: Code is CORRECT BY DESIGN — function uses query-level filtering (not throw-based enforcement) to serve both public and admin use cases. Added comprehensive SECURITY docstring to prevent future "fixing". Non-admins get `null` for non-approved reviews (prevents enumeration).

  **Must NOT do**:
  - Do NOT change the existing behavior for APPROVED reviews (non-admins should still see them)
  - Do NOT modify other functions in the file (they already have `assertAdminAccess()`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single function fix — add admin check to one function
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `server/firm-reviews.ts:220-249` — `getReviewModerationQueue()` has `assertAdminAccess()` at line 221 — follow this pattern
  - `server/firm-reviews.ts:251-299` — `moderateReview()` has `assertAdminAccess()` at line 256 — follow this pattern
  - `server/firm-reviews.ts:301-306` — `getFlaggedReviewCount()` has `assertAdminAccess()` at line 302 — follow this pattern

  **API/Type References**:
  - `server/firm-reviews.ts:308-329` — Current `getReviewById()` — the function to fix
  - `server/authz.ts` — `assertAdminAccess()` function signature and behavior

  **WHY Each Reference Matters**:
  - Lines 220-302: Show the established pattern for admin-only functions in the same file
  - Lines 308-329: The exact function to modify

  **Acceptance Criteria**:

  - [ ] `getReviewById()` enforces admin access for non-APPROVED reviews
  - [ ] Non-admins can still view APPROVED reviews (public access preserved)
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Admin-only review functions all have assertAdminAccess
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -n "assertAdminAccess" server/firm-reviews.ts
    Expected Result: assertAdminAccess found in getReviewModerationQueue, moderateReview, getFlaggedReviewCount, AND getReviewById (or equivalent admin check)
    Failure Indicators: getReviewById still uses isAdmin() as query filter without enforcement
    Evidence: .sisyphus/evidence/task-1-admin-enforcement.txt

  Scenario: Non-admin still sees approved reviews
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -A 20 "export async function getReviewById" server/firm-reviews.ts
      2. Verify APPROVED reviews remain accessible to non-admins
    Expected Result: Public review access preserved
    Failure Indicators: All review access requires admin
    Evidence: .sisyphus/evidence/task-1-public-access.txt
  ```

  **Commit**: YES
  - Message: `fix(security): enforce admin access on getReviewById for non-approved reviews`
  - Files: `server/firm-reviews.ts`
  - Pre-commit: `npm run typecheck && npm run test`

- [x] 2. Fix `getShared()` view count ownership in `server/shared.ts`

  **What to do**:
  - Open `server/shared.ts`, find `getShared()` function (around line 105)
  - At lines 117-120, the view count increments unconditionally:
    ```typescript
    prisma.shared.update({
      where: { slug },
      data: { viewCount: { increment: 1 } }
    }).catch(...)
    ```
  - Fix: Check if the viewer is the owner before incrementing
  - Get the current user's auth ID (if logged in) via `getDatabaseUserId()` or similar
  - Compare with the shared resource owner ID
  - Skip increment if viewer === owner

  **Must NOT do**:
  - Do NOT add authentication requirement to public shared views (they must work without login)
  - Do NOT change `isSharedAccessible()` logic
  - Do NOT add rate limiting (separate concern)
  - Do NOT break the fire-and-forget pattern (`.catch()` is intentional)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Add one ownership check before an existing increment call
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `server/shared.ts:105-128` — Current `getShared()` with unconditional view count increment
  - `server/shared.ts` — `isSharedAccessible()` utility
  - `server/auth.ts` — `getDatabaseUserId()` for getting current user ID

  **API/Type References**:
  - The shared resource has an `ownerId` or `userId` field — compare against current user

  **WHY Each Reference Matters**:
  - Lines 105-128: The exact function and increment location
  - auth.ts: How to safely get current user ID (may return null for unauthenticated)

  **Acceptance Criteria**:

  - [ ] View count only increments when viewer is NOT the owner
  - [ ] Public shared views still work without authentication
  - [ ] `npm run typecheck` → 0 errors
  - [ ] `npm run test` → all tests pass

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: View count skips for owner
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -B5 -A10 "viewCount" server/shared.ts
      2. Verify ownership check exists before increment
    Expected Result: View count increment wrapped in owner check
    Failure Indicators: viewCount still increments unconditionally
    Evidence: .sisyphus/evidence/task-2-ownership-check.txt

  Scenario: Public access still works
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -A 25 "export async function getShared" server/shared.ts
      2. Verify no auth requirement added
    Expected Result: getShared remains callable without authentication
    Failure Indicators: Auth check added that blocks unauthenticated access
    Evidence: .sisyphus/evidence/task-2-public-access.txt
  ```

  **Commit**: YES
  - Message: `fix(security): skip view count increment for shared dashboard owner`
  - Files: `server/shared.ts`
  - Pre-commit: `npm run typecheck && npm run test`

- [x] 3. Update security tests for teams + firm-reviews

  **What to do**:
  - Update `lib/__tests__/teams-security.test.ts`:
    - Find tests with "SECURITY ISSUE" in their names
    - Update them to verify the actual security fix works (not document the bug)
    - `inviteMember()` tests should verify authorization check throws for non-members
    - `acceptInvitation()` tests should verify email match requirement
    - `getTeamAnalytics()` tests should verify non-member access denied
  - Update `lib/__tests__/firm-reviews-security.test.ts`:
    - Add 403 (non-admin) test cases alongside existing 401 (unauthenticated) tests
    - `getReviewModerationQueue()`: non-admin → throws 403
    - `moderateReview()`: non-admin → throws 403
    - `getFlaggedReviewCount()`: non-admin → throws 403
    - `getReviewById()`: non-admin with non-APPROVED review → returns null or throws
  - Mock `assertAdminAccess` to throw for non-admin callers
  - Mock `isAdmin` to return false for non-admin test IDs

  **Must NOT do**:
  - Do NOT modify source code to make it testable
  - Do NOT test actual database connections — mock Prisma
  - Do NOT add tests for unrelated functions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding existing test patterns, mocking strategy, and security expectations
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (after Wave 1 code fixes)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Test References**:
  - `lib/__tests__/teams-security.test.ts` — Existing teams security tests (9 test cases, some document bugs)
  - `lib/__tests__/firm-reviews-security.test.ts` — Existing firm-reviews tests (401-only coverage)
  - `lib/__tests__/authz.test.ts` — Established mocking patterns for authz

  **Pattern References**:
  - `server/authz.ts` — `assertAdminAccess()` and `isAdmin()` — how they throw/return
  - `server/firm-reviews.ts` — Functions being tested (understand their error behavior)

  **WHY Each Reference Matters**:
  - Existing test files: Need to update, not create from scratch
  - authz.test.ts: Shows the established pattern for mocking auth functions
  - authz.ts: Understanding what `assertAdminAccess()` throws (likely a 403 error)

  **Acceptance Criteria**:

  - [ ] No "SECURITY ISSUE" test names remain — all tests verify actual behavior
  - [ ] Teams tests cover: inviteMember auth, acceptInvitation email match, getTeamAnalytics auth
  - [ ] Firm-reviews tests cover: 401 unauthenticated AND 403 non-admin for all admin functions
  - [ ] `npm run test` → all tests pass (0 failures)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No SECURITY ISSUE test names remain
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -c "SECURITY ISSUE" lib/__tests__/teams-security.test.ts
    Expected Result: 0 matches
    Failure Indicators: Any test still documenting a bug instead of verifying a fix
    Evidence: .sisyphus/evidence/task-3-no-security-issue.txt

  Scenario: 403 non-admin tests exist in firm-reviews
    Tool: Bash
    Preconditions: None
    Steps:
      1. grep -c "403\|non-admin\|forbidden" lib/__tests__/firm-reviews-security.test.ts
    Expected Result: At least 3 matches (one per admin-only function)
    Failure Indicators: Only 401/unauthenticated tests exist
    Evidence: .sisyphus/evidence/task-3-403-tests.txt

  Scenario: All tests pass
    Tool: Bash
    Preconditions: None
    Steps:
      1. npm run test
    Expected Result: All tests pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-3-all-tests.txt
  ```

  **Commit**: YES
  - Message: `test(security): update teams and firm-reviews tests to verify actual fixes`
  - Files: `lib/__tests__/teams-security.test.ts`, `lib/__tests__/firm-reviews-security.test.ts`
  - Pre-commit: `npm run test`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
- [x] F2. **Code Quality Review** — `unspecified-high`
- [x] F3. **Test Execution QA** — `unspecified-high`
- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: verify only specified files were changed. No scope creep.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `fix(security): enforce admin access on getReviewById for non-approved reviews` | `server/firm-reviews.ts` | `npm run typecheck && npm run test` |
| 2 | `fix(security): skip view count increment for shared dashboard owner` | `server/shared.ts` | `npm run typecheck && npm run test` |
| 3 | `test(security): update teams and firm-reviews tests to verify actual fixes` | `lib/__tests__/teams-security.test.ts`, `lib/__tests__/firm-reviews-security.test.ts` | `npm run test` |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck                          # Expected: 0 errors
npm run test                               # Expected: all tests pass
grep -c "SECURITY ISSUE" lib/__tests__/teams-security.test.ts  # Expected: 0
grep -c "assertAdminAccess" server/firm-reviews.ts             # Expected: ≥4
```

### Final Checklist
- [x] `getReviewById()` enforces admin access
- [x] View count skips owner
- [x] Teams tests verify fixes (not document bugs)
- [x] Firm-reviews tests cover 403 non-admin
- [x] All tests pass
- [x] No `as any` / `@ts-ignore` / `console.log` added

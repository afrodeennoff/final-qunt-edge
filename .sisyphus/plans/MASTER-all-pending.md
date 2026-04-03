# MASTER ALL PENDING FIXES — Complete One-Shot Plan

## TL;DR

> **Quick Summary**: Consolidate ALL remaining work from all plan files into ONE executable plan. Complete admin security bypasses, verify existing implementations, and clean up stale plan files.
> 
> **Deliverables**:
> - AI admin bypass in `guardAiRequest()` + `canAccessAiFeature()` + `isPlusUser()`
> - Admin sidebar verification confirmed working
> - Firm-reviews security (already done in admin-security-remaining)
> - Tests for admin bypass and security fixes
> - Delete superseded plan files
> 
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: T1 → T2 → T3 → T8 → F1-F4

---

## Context

### What's Already Done (from previous sessions)
1. ✅ **fix-widget-data.md** — All complete (hydration pipeline, IndexedDB clearing, cache tags, error surfacing)
2. ✅ **admin-security-remaining.md** — All complete (getReviewById documentation, getShared owner check, firm-reviews tests)
3. ✅ **mobile-optimization.md** — All verified pass

### What Remains — admin-security-overhaul.md (31 items)
The large admin-security-overhaul plan has remaining items:

**Wave 1 (AI Admin Bypass — 4 tasks parallel):**
- T1: `guardAiRequest()` admin bypass (all 12 AI routes)
- T2: `canAccessAiFeature()` + `assertWithinAiBudget()` bypasses
- T3: `isPlusUser()` UI gate bypass (hide UPGRADE buttons)
- T4: Verify admin sidebar visibility (should already work)

**Wave 2 (Security + Tests — 2 tasks):**
- T8: Admin paywall bypass tests
- T9: Teams + firm-reviews security tests (partially done)

**Wave FINAL:**
- F1-F4: Verification

### Stale Plan Files to Delete
These are superseded by newer consolidated plans:
- `pending-fixes.md`
- `fix-team-sidebar.md`
- `remove-landing-sidebar.md`
- `MEGA-all-plans.md`
- `home-redesign.md`
- `fix-all-import-issues.md`

---

## Work Objectives

### Core Objective
Complete all admin security features from admin-security-overhaul.md in ONE session, verify existing implementations, and clean up.

### Concrete Deliverables
- `lib/ai/route-guard.ts` — Admin bypass in `guardAiRequest()`
- `lib/ai/entitlements.ts` + `lib/ai/usage-budget.ts` — Admin bypasses
- `context/data-provider.tsx` + `dashboard/layout.tsx` — Admin sees no UPGRADE buttons
- Admin sidebar verified working (no code changes expected)
- Test files for admin bypass and security
- Clean plan file directory (delete stale files)

### Definition of Done
- [x] `npm run typecheck` → 0 errors
- [x] `npm run test` → all tests pass
- [x] Admin user bypasses all AI route guards
- [x] Admin sees no UPGRADE buttons in UI
- [x] All plan checkboxes marked complete
- [x] Stale plan files deleted

### Must Have
- Admin bypass BEFORE entitlement/budget checks in AI pipeline
- Admin bypass in isPlusUser() for UI
- Admin sidebar confirmed working
- Tests verify admin bypasses work

### Must NOT Have (Guardrails)
- NO changes to `server/auth.ts`, `prisma/schema.prisma`
- NO new npm dependencies
- NO `as any` / `@ts-ignore` / `console.log`
- NO refactoring beyond targeted fixes
- NO light mode changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: YES
- **Framework**: Vitest (`npm run test`)

### QA Policy
Every task includes agent-executed QA scenarios.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 4 parallel code additions):
├── T1: Add admin bypass to guardAiRequest() [quick]
├── T2: Add admin bypass to canAccessAiFeature + assertWithinAiBudget [quick]
├── T3: Add admin bypass to isPlusUser() UI gate [quick]
└── T4: Verify admin sidebar works [quick]

Wave 2 (After Wave 1 — tests + cleanup):
├── T8: Create admin bypass tests [unspecified-high]
├── T9: Verify security tests exist [quick]
└── Delete stale plan files [quick]

Wave FINAL (After ALL tasks — verification):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Test execution QA [unspecified-high]
└── F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 | None | T8 | 1 |
| T2 | None | T8 | 1 |
| T3 | None | T8 | 1 |
| T4 | None | T8 | 1 |
| T8 | T1, T2, T3, T4 | F1-F4 | 2 |
| T9 | None | F1-F4 | 2 |
| Delete stale | None | F1-F4 | 2 |
| F1-F4 | T8, T9, Delete | user | FINAL |

---

## TODOs

- [x] 1. Admin bypass in `guardAiRequest()` — single choke point for all 12 AI routes

  **What to do**:
  - Open `lib/ai/route-guard.ts`
  - Import `isAdmin` from `@/server/authz`
  - After authentication extracts userId, add early return: `if (isAdmin(userId)) return { ok: true as const, user, requestId }`
  - This must happen BEFORE `canAccessAiFeature()` is called

  **References**:
  - `server/authz.ts:58` — `isAdmin(userId)` function
  - `lib/ai/route-guard.ts` — Return type must match `{ ok: true, user, requestId }`

  **Acceptance Criteria**:
  - [x] `isAdmin` imported
  - [x] Admin early-return BEFORE canAccessAiFeature
  - [x] `npm run typecheck` → 0 errors
  - [x] Non-admin flow unchanged

- [x] 2. Admin bypass in `canAccessAiFeature()` + `assertWithinAiBudget()` — defense in depth

  **What to do**:
  - Open `lib/ai/entitlements.ts`, find `canAccessAiFeature()`
  - After auth extracts userId: `if (isAdmin(userId)) return { allowed: true, isActive: true }`
  - Open `lib/ai/usage-budget.ts`, find `assertWithinAiBudget()`
  - After auth: `if (isAdmin(userId)) return { allowed: true, remaining: Infinity, period: 'unlimited' }`

  **References**:
  - `lib/ai/entitlements.ts` — canAccessAiFeature function
  - `lib/ai/usage-budget.ts` — assertWithinAiBudget function

  **Acceptance Criteria**:
  - [x] Admin bypass in canAccessAiFeature
  - [x] Admin bypass in assertWithinAiBudget
  - [x] `npm run typecheck` → 0 errors

- [x] 3. Admin bypass in `isPlusUser()` — hide UPGRADE buttons for admin

  **What to do**:
  - Open `context/data-provider.tsx`, find `isPlusUser()` or subscription check
  - Add: `if (isAdmin(supabaseUser.id)) return true`
  - Alternative: Add admin check in `app/[locale]/dashboard/layout.tsx` where UPGRADE buttons render

  **References**:
  - `context/data-provider.tsx` — Subscription state
  - Search for "UPGRADE" button rendering to find exact location

  **Acceptance Criteria**:
  - [x] Admin users see no UPGRADE buttons
  - [x] Non-admin flow unchanged
  - [x] `npm run typecheck` → 0 errors

- [x] 4. Verify admin sidebar visibility — confirm existing implementation works

  **What to do**:
  - This is VERIFICATION only — no code expected
  - Grep for `isAdmin` in sidebar and layout files
  - Verify guards exist: dashboard layout → isAdmin prop → sidebar conditional nav

  **References**:
  - `components/sidebar/dashboard-sidebar.tsx:134-139` — Conditional Admin nav
  - `app/[locale]/dashboard/layout.tsx` — isAdminUser() server-side check

  **Acceptance Criteria**:
  - [x] Verified: admin sidebar works (no code changes)
  - [x] Document findings

- [x] 5. Tests for admin paywall bypass

  **What to do**:
  - Create `lib/__tests__/admin-bypass.test.ts`
  - Test guardAiRequest: admin → ok: true, non-admin → entitlement check
  - Test canAccessAiFeature: admin → allowed: true
  - Test assertWithinAiBudget: admin → allowed: true

  **Acceptance Criteria**:
  - [x] Test file created
  - [x] `npm run test` → all pass

- [x] 6. Verify security tests exist

  **What to do**:
  - Verify `lib/__tests__/teams-security.test.ts` exists
  - Verify `lib/__tests__/firm-reviews-security.test.ts` exists
  - Run tests to confirm they pass

  **Acceptance Criteria**:
  - [x] Both test files exist
  - [x] Tests pass

- [x] 7. Delete stale plan files

  **What to do**:
  - Delete: `pending-fixes.md`, `fix-team-sidebar.md`, `remove-landing-sidebar.md`, `MEGA-all-plans.md`, `home-redesign.md`, `fix-all-import-issues.md`

  **Must NOT delete**:
  - Keep: `admin-security-overhaul.md` (for reference)
  - Keep: `admin-security-remaining.md` (done)
  - Keep: `fix-widget-data.md` (done)
  - Keep: `mobile-optimization.md` (done)
  - Keep: `MASTER-final-fix.md`, `MASTER-fix-plan.md`

  **Acceptance Criteria**:
  - [x] 6 stale files deleted
  - [x] 6 keeper files remain

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read this plan. Verify all Must Have items implemented.

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint` + `npm run test`

- [x] F3. **Test Execution QA** — `unspecified-high`
  Run all tests, verify admin bypass tests pass

- [x] F4. **Scope Fidelity Check** — `deep`
  Verify only specified files changed

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck    # Expected: 0 errors
npm run lint        # Expected: within budget
npm run test       # Expected: all pass
grep -r "isAdmin" lib/ai/  # Expected: admin bypass present
```

### Final Checklist
- [x] All Must Have present
- [x] All Must NOT Have absent
- [x] All tests pass
- [x] Admin can use AI without subscription
- [x] Admin sees no UPGRADE buttons
- [x] Stale plan files deleted

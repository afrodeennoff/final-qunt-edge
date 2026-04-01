# Admin Security Overhaul + ENV-Based Admin System

## TL;DR

> **Quick Summary**: Fix 8 security vulnerabilities (teams, firm-reviews, shared), add admin bypass for all paywalls via ENV-based admin IDs (`ALLOWED_ADMIN_USER_ID`), and ensure admin-only UI visibility in sidebar.
> 
> **Deliverables**:
> - Admin users bypass all AI paywalls, token budgets, and premium feature gates
> - 8 security vulnerabilities patched with proper auth/authorization checks
> - Admin sidebar section only visible to admins (already works — verify)
> - "UPGRADE" buttons hidden for admin users
> - Test coverage for all security fixes and admin bypasses
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves + final verification
> **Critical Path**: Task 1 → Task 8 → F1-F4

---

## Context

### Original Request
Fix all 6 identified security issues in one shot, implement ENV-based admin via `ALLOWED_ADMIN_USER_ID`, admin gets all paid features, admin sidebar only visible to admins, non-admins see premium features with upgrade prompt.

### Interview Summary
**Key Discussions**:
- Admin IDs: Supabase Auth UIDs via `ALLOWED_ADMIN_USER_ID` env var (comma-separated, multiple admins)
- Free user UX: Premium features visible with upgrade prompt (not hidden)
- Test strategy: Tests written after implementation, plus agent QA for every task

**Research Findings**:
- Admin system already exists in `server/authz.ts` with `isAdmin()` and `isAdminUser()` — reuses existing ENV vars
- 4 paywall gates to bypass: `guardAiRequest()` (all AI), `canAccessAiFeature()`, `assertWithinAiBudget()`, `isPlusUser()`
- All 12 AI routes flow through single choke point `guardAiRequest()`
- Admin sidebar already conditional via `isAdmin` prop in `DashboardSidebar`
- Admin layout already guarded by `isAdminUser()` in `admin/layout.tsx`
- `validateSubscriptionAccess()` in `server/payment-security.ts` is dead code (0 callers) — EXCLUDED from scope

### Metis Review
**Identified Gaps** (addressed):
- **8 vulnerabilities, not 6**: Added `getReviewById` (unauthenticated review access) and `acceptInvitation` (no email verification) to scope
- **`validateSubscriptionAccess()` is dead code**: Excluded from scope — 0 callers, would be wasted effort
- **`ADMIN_EMAIL_DOMAINS` divergence**: `proxy.ts` doesn't check email domains, only IDs. Flagged as tech debt — can't fix now because proxy runs in Edge runtime and can't import server modules
- **Admin AI token limits**: Defaulted to unlimited — admin skips budget check entirely
- **`@rithmic.com` hardcoded bypass**: Intentional, out of scope, must not be touched
- **`getTeamAnalytics()` write-on-read side effect**: Accept as-is, separate concern

---

## Work Objectives

### Core Objective
 Harden the admin system so admins (identified by `ALLOWED_ADMIN_USER_ID` env) bypass all paywalls and see no upgrade prompts, while patching 8 security vulnerabilities in teams/firm-reviews/shared modules.

### Concrete Deliverables
- `lib/ai/route-guard.ts` — Admin early-return in `guardAiRequest()`
- `lib/ai/entitlements.ts` — Admin bypass in `canAccessAiFeature()`
- `lib/ai/usage-budget.ts` — Admin unlimited tokens in `assertWithinAiBudget()`
- `context/data-provider.tsx` — Admin bypass in `isPlusUser()`
- `server/teams.ts` — Auth fixes in `inviteMember()`, `acceptInvitation()`, `getTeamAnalytics()`
- `server/firm-reviews.ts` — Admin auth in `getReviewModerationQueue()`, `moderateReview()`, `getReviewById()`, `getFlaggedReviewCount()`
- `server/shared.ts` — View count ownership improvement (LOW priority)
- Test files for security fixes and admin bypasses

### Definition of Done
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes within warning budget (1546 max)
- [ ] `npm run test` passes with new test cases
- [ ] Admin user can use all AI features without subscription
- [ ] Admin user sees no "UPGRADE" buttons
- [ ] Non-admin cannot access team analytics for teams they're not in
- [ ] Non-admin cannot access review moderation queue
- [ ] Non-admin cannot invite to teams they're not admin of

### Must Have
- Admin bypass for ALL 12 AI routes via `guardAiRequest()` single choke point
- Admin bypass for `isPlusUser()` UI gate
- Auth checks on all 8 vulnerable functions
- Test coverage for admin bypass and security fixes

### Must NOT Have (Guardrails)
- Do NOT modify `getSubscriptionDetails()` or the `@rithmic.com` bypass in `server/subscription.ts`
- Do NOT touch `validateSubscriptionAccess()` or `withSecurityChecks()` in `server/payment-security.ts` — dead code, out of scope
- Do NOT refactor `proxy.ts` to import from `server/authz.ts` — Edge runtime constraint, separate concern
- Do NOT remove `ADMIN_EMAIL_DOMAINS` or `ADMIN_USER_ID` backward compat
- Do NOT add admin bypass to individual AI route files — use the single choke point
- Do NOT modify admin layout or sidebar rendering logic — already works correctly
- Do NOT change existing payment/billing/Whop logic
- Do NOT add features beyond what's specified
- Avoid AI slop: no excessive comments, no over-abstraction, no unnecessary JSDoc

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests after implementation
- **Framework**: Vitest (`npm run test`)
- **Test location**: `lib/__tests__/` and co-located test files

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (npx vitest run) — Run specific test files
- **Type checks**: Use Bash — `npm run typecheck`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — admin paywall bypass, 4 parallel quick tasks):
├── Task 1: Admin bypass in guardAiRequest() [quick]
├── Task 2: Admin bypass in canAccessAiFeature() + assertWithinAiBudget() [quick]
├── Task 3: Admin bypass in isPlusUser() [quick]
└── Task 4: Verify admin sidebar visibility (confirm existing) [quick]

Wave 2 (After Wave 1 — security fixes, MAX PARALLEL):
├── Task 5: Fix teams.ts — inviteMember + acceptInvitation + getTeamAnalytics [deep]
├── Task 6: Fix firm-reviews.ts — moderation queue + moderate + getReviewById + flagged count [deep]
└── Task 7: Fix shared.ts — getShared view count [quick]

Wave 3 (After Wave 2 — test coverage):
├── Task 8: Tests for admin paywall bypass [unspecified-high]
└── Task 9: Tests for teams + firm-reviews security fixes [unspecified-high]

Wave FINAL (After ALL tasks — verification):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real QA — curl admin + non-admin scenarios (unspecified-high)
└── F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 8 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1 | — | 8 | 1 |
| 2 | — | 8 | 1 |
| 3 | — | 8 | 1 |
| 4 | — | — | 1 |
| 5 | — | 9 | 2 |
| 6 | — | 9 | 2 |
| 7 | — | 9 | 2 |
| 8 | 1, 2, 3 | F1-F4 | 3 |
| 9 | 5, 6, 7 | F1-F4 | 3 |
| F1-F4 | 8, 9 | User OK | FINAL |

### Agent Dispatch Summary

- **Wave 1**: 4 — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: 3 — T5 → `deep`, T6 → `deep`, T7 → `quick`
- **Wave 3**: 2 — T8 → `unspecified-high`, T9 → `unspecified-high`
- **FINAL**: 4 — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Admin bypass in `guardAiRequest()` — single choke point for all 12 AI routes

  **What to do**:
  - Open `lib/ai/route-guard.ts`
  - Import `isAdmin` from `@/server/authz`
  - After the authentication check extracts the userId, add an early return: `if (isAdmin(userId)) return { ok: true as const, user, requestId }` (match the success return shape)
  - This must happen BEFORE `canAccessAiFeature()` and `assertWithinAiBudget()` are called
  - Verify the return type matches what callers expect (check the return type signature of `guardAiRequest`)

  **Must NOT do**:
  - Do NOT add admin checks to individual AI route files
  - Do NOT modify `canAccessAiFeature()` or `assertWithinAiBudget()` in this task (that's Task 2)
  - Do NOT change any existing auth flow for non-admin users

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 8
  - **Blocked By**: None (can start immediately)

  **References**:
  **Pattern References**:
  - `server/authz.ts:58` — `isAdmin(userId: string)` function, checks `ALLOWED_ADMIN_USER_ID` CSV + deprecated `ADMIN_USER_ID`
  - `lib/ai/route-guard.ts` — Full file, understand the return type and flow: auth → entitlements → budget → rate limit → return

  **API/Type References**:
  - `lib/ai/route-guard.ts` — Return type of `guardAiRequest()` must match `{ ok: true, user, requestId }` shape

  **Acceptance Criteria**:
  - [ ] `isAdmin` imported from `@/server/authz`
  - [ ] Admin early-return placed BEFORE `canAccessAiFeature()` call
  - [ ] `npm run typecheck` passes
  - [ ] Non-admin flow unchanged (no early return for regular userIds)

  **QA Scenarios:**
  ```
  Scenario: Admin user bypasses AI route guard
    Tool: Bash (grep)
    Preconditions: File lib/ai/route-guard.ts exists
    Steps:
      1. grep -n "isAdmin" lib/ai/route-guard.ts
      2. Verify the import exists and the check is BEFORE canAccessAiFeature
    Expected Result: isAdmin import found, early-return present before entitlement check
    Failure Indicators: No isAdmin reference found, or check is after canAccessAiFeature call
    Evidence: .sisyphus/evidence/task-1-admin-ai-bypass.txt

  Scenario: Non-admin flow unchanged
    Tool: Bash
    Preconditions: Same file
    Steps:
      1. Read the function, verify canAccessAiFeature is still called for non-admin
    Expected Result: For non-admin userIds, canAccessAiFeature() is still invoked
    Failure Indicators: canAccessAiFeature() call removed or always skipped
    Evidence: .sisyphus/evidence/task-1-non-admin-flow.txt
  ```

  **Commit**: YES
  - Message: `feat(auth): add admin bypass to AI route guard`
  - Files: `lib/ai/route-guard.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 2. Admin bypass in `canAccessAiFeature()` + `assertWithinAiBudget()` — defense in depth

  **What to do**:
  - In `lib/ai/entitlements.ts` → `canAccessAiFeature()`:
    - Import `isAdmin` from `@/server/authz`
    - Add early return at the top: `if (isAdmin(userId)) return { allowed: true, plan: 'ADMIN', isActive: true }`
    - Match the existing return type shape
  - In `lib/ai/usage-budget.ts` → `assertWithinAiBudget()`:
    - Import `isAdmin` from `@/server/authz`
    - Add early return at the top: `if (isAdmin(userId)) return { allowed: true, limit: Infinity, used: 0, remaining: Infinity }`
    - Match the existing return type shape (check what BudgetCheckResult looks like)

  **Must NOT do**:
  - Do NOT modify any subscription lookup logic
  - Do NOT change the `@rithmic.com` bypass in `server/subscription.ts`
  - Do NOT remove or change existing free-user limits

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 8
  - **Blocked By**: None (can start immediately)

  **References**:
  **Pattern References**:
  - `server/authz.ts:58` — `isAdmin(userId)` — same import pattern as Task 1
  - `lib/ai/entitlements.ts:27` — `canAccessAiFeature()` — check return type, currently returns `{ allowed: boolean, reason?, plan?, isActive }`
  - `lib/ai/usage-budget.ts:80` — `assertWithinAiBudget()` — check return type (BudgetCheckResult or similar)

  **API/Type References**:
  - `lib/ai/entitlements.ts` — The `AiAccessResult` or equivalent return type
  - `lib/ai/usage-budget.ts` — The budget result type with `allowed`, `limit`, `used`, `remaining` fields

  **Acceptance Criteria**:
  - [ ] Both files import `isAdmin` from `@/server/authz`
  - [ ] Admin early-return in `canAccessAiFeature()` returns `{ allowed: true, isActive: true }`
  - [ ] Admin early-return in `assertWithinAiBudget()` returns allowed with unlimited budget
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: Admin gets unlimited AI access via entitlements
    Tool: Bash (grep)
    Preconditions: File lib/ai/entitlements.ts exists
    Steps:
      1. grep -n "isAdmin" lib/ai/entitlements.ts
      2. Verify early return with { allowed: true, isActive: true }
    Expected Result: isAdmin check found at top of canAccessAiFeature
    Failure Indicators: No isAdmin check, or return shape doesn't match
    Evidence: .sisyphus/evidence/task-2-entitlements-bypass.txt

  Scenario: Admin gets unlimited AI budget
    Tool: Bash (grep)
    Preconditions: File lib/ai/usage-budget.ts exists
    Steps:
      1. grep -n "isAdmin" lib/ai/usage-budget.ts
      2. Verify early return with allowed: true and unlimited limit
    Expected Result: isAdmin check found at top of assertWithinAiBudget
    Failure Indicators: No isAdmin check, or limit is still finite
    Evidence: .sisyphus/evidence/task-2-budget-bypass.txt
  ```

  **Commit**: YES
  - Message: `feat(auth): add admin bypass to AI entitlements and budget`
  - Files: `lib/ai/entitlements.ts`, `lib/ai/usage-budget.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 3. Admin bypass in `isPlusUser()` — hide UPGRADE buttons for admin

  **What to do**:
  - Open `context/data-provider.tsx`
  - Find the `isPlusUser()` function (around line 1312)
  - The function currently checks Whop subscription plan name + DB subscription status
  - Add admin check: if the current user is admin, return `true` immediately
  - Since this is a client-side function, it needs access to the admin status. Options:
    - Option A: Check if `user.id` matches a client-side admin list (from env or server-propagated state)
    - Option B: The server already computes `isAdmin` in `dashboard/layout.tsx` line 54 — propagate it through context/provider so `isPlusUser()` can use it
  - **Recommended**: Option B — extend the existing DataProvider to receive `isAdmin` prop from the server layout, store it in context, and check it in `isPlusUser()`

  **Must NOT do**:
  - Do NOT expose admin user IDs to the client bundle (env vars are server-only)
  - Do NOT create a separate API call just for admin status
  - Do NOT change how `isPlusUser()` works for non-admin users

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 8
  - **Blocked By**: None (can start immediately)

  **References**:
  **Pattern References**:
  - `context/data-provider.tsx:1312` — Current `isPlusUser()` implementation checking Whop plan name + DB subscription
  - `app/[locale]/dashboard/layout.tsx:54` — Where `isAdminUser(user)` is already called server-side
  - `app/[locale]/dashboard/layout.tsx:77` — Where `isAdmin` is passed as prop to `DashboardSidebar`

  **API/Type References**:
  - `context/data-provider.tsx` — The DataProvider context shape, understand how to add `isAdmin` to it
  - `components/sidebar/dashboard-sidebar.tsx:134` — Pattern for receiving and using `isAdmin` prop

  **Acceptance Criteria**:
  - [ ] `isPlusUser()` returns `true` for admin users without subscription check
  - [ ] Admin status propagated from server layout through context to client
  - [ ] No admin user IDs exposed in client-side JavaScript
  - [ ] `npm run typecheck` passes
  - [ ] Non-admin users still see UPGRADE button when they lack subscription

  **QA Scenarios:**
  ```
  Scenario: isPlusUser returns true for admin without subscription
    Tool: Bash (grep)
    Preconditions: context/data-provider.tsx exists
    Steps:
      1. grep -n "isAdmin" context/data-provider.tsx
      2. Verify admin check exists in isPlusUser function
    Expected Result: Admin check found, returns true before subscription check
    Failure Indicators: No admin check, or admin IDs hardcoded in client code
    Evidence: .sisyphus/evidence/task-3-isplususer-bypass.txt

  Scenario: Admin status comes from server, not client env
    Tool: Bash (grep)
    Steps:
      1. Verify no process.env.ADMIN in context/data-provider.tsx
      2. Verify admin prop flows from layout → provider → isPlusUser
    Expected Result: Admin status received via props/context, not env
    Failure Indicators: process.env references to admin IDs in client code
    Evidence: .sisyphus/evidence/task-3-no-client-env-leak.txt
  ```

  **Commit**: YES
  - Message: `feat(auth): add admin bypass to isPlusUser UI gate`
  - Files: `context/data-provider.tsx`, `app/[locale]/dashboard/layout.tsx`
  - Pre-commit: `npm run typecheck`

- [ ] 4. Verify admin sidebar visibility — confirm existing implementation works

  **What to do**:
  - This is a VERIFICATION task, not an implementation task
  - Read and verify the existing admin sidebar flow:
    1. `app/[locale]/dashboard/layout.tsx` calls `isAdminUser(user)` server-side
    2. Passes `isAdmin` prop to `DashboardSidebar`
    3. `components/sidebar/dashboard-sidebar.tsx` conditionally adds Admin nav item when `isAdmin` is true
    4. `app/[locale]/admin/layout.tsx` guards admin pages with `isAdminUser()` → redirects to `/dashboard` if not admin
    5. `proxy.ts` classifies `/admin` routes as private and checks admin status
  - If everything is correct: document it and move on
  - If something is broken: fix it (but based on research, it already works)

  **Must NOT do**:
  - Do NOT refactor working code
  - Do NOT add new sidebar items
  - Do NOT change admin layout guards

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: None
  - **Blocked By**: None (can start immediately)

  **References**:
  **Pattern References**:
  - `app/[locale]/dashboard/layout.tsx:54,77` — Server-side `isAdminUser(user)` → prop pass to sidebar
  - `components/sidebar/dashboard-sidebar.tsx:134-139` — Conditional Admin nav item
  - `app/[locale]/admin/layout.tsx:25` — Admin page guard with redirect
  - `proxy.ts:179` — Admin route classification as private-document
  - `proxy.ts:631-646` — Admin document route gate with env ID check

  **Acceptance Criteria**:
  - [ ] Verified: admin sidebar nav only appears when `isAdminUser()` returns true
  - [ ] Verified: admin pages redirect non-admins to `/dashboard`
  - [ ] Verified: `/api/admin/*` routes blocked by middleware for non-admins
  - [ ] Document findings (no code changes expected)

  **QA Scenarios:**
  ```
  Scenario: Admin sidebar chain is correct
    Tool: Bash (grep)
    Steps:
      1. grep -n "isAdmin" components/sidebar/dashboard-sidebar.tsx
      2. grep -n "isAdminUser" app/[locale]/dashboard/layout.tsx
      3. grep -n "isAdminUser" app/[locale]/admin/layout.tsx
    Expected Result: Admin nav item conditional on isAdmin prop, layout guards present
    Failure Indicators: Missing guards, unconditional admin nav item
    Evidence: .sisyphus/evidence/task-4-sidebar-verification.txt
  ```

  **Commit**: YES — groups with Task 9
  - Message: `test(auth): add tests for admin paywall bypass and security fixes`
  - Files: `lib/__tests__/admin-bypass.test.ts`, test files from Task 9
  - Pre-commit: `npm run test`

- [ ] 9. Tests for teams + firm-reviews security fixes

  **What to do**:
  - Create test file `server/__tests__/teams-security.test.ts`:
    - `inviteMember()`: non-member caller → throws 'Unauthorized'
    - `inviteMember()`: team admin caller → creates invitation
    - `acceptInvitation()`: email mismatch → throws error
    - `acceptInvitation()`: email match → accepts invitation
    - `getTeamAnalytics()`: non-member → throws 'Unauthorized'
    - `getTeamAnalytics()`: team member → returns analytics
  - Create test file `server/__tests__/firm-reviews-security.test.ts`:
    - `getReviewModerationQueue()`: non-admin → throws 403
    - `getReviewModerationQueue()`: admin → returns queue
    - `moderateReview()`: non-admin → throws 403
    - `getFlaggedReviewCount()`: non-admin → throws 403
    - `getReviewById()`: non-admin with non-APPROVED review → returns null
    - `getReviewById()`: admin with any review → returns review
  - Use `vi.mock('@/server/authz', ...)` to control `assertAdminAccess` and `isAdmin`
  - Mock Prisma calls with `vi.mock('@/lib/prisma', ...)`

  **Must NOT do**:
  - Do NOT test actual database connections
  - Do NOT add tests for unrelated functions
  - Do NOT modify source code to make it testable

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 5, 6, 7

  **References**:
  - `lib/__tests__/authz.test.ts` — Existing test patterns for authz mocking
  - `server/__tests__/` — Check for existing server test directory structure

  **Acceptance Criteria**:
  - [ ] Test files created: `server/__tests__/teams-security.test.ts`, `server/__tests__/firm-reviews-security.test.ts`
  - [ ] `npx vitest run server/__tests__/teams-security.test.ts` → PASS
  - [ ] `npx vitest run server/__tests__/firm-reviews-security.test.ts` → PASS
  - [ ] Each file has happy-path + rejection + unauthenticated scenarios

  **QA Scenarios:**
  ```
  Scenario: All security tests pass
    Tool: Bash
    Steps:
      1. npx vitest run server/__tests__/teams-security.test.ts
      2. npx vitest run server/__tests__/firm-reviews-security.test.ts
    Expected Result: Both test suites pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-9-security-tests.txt
  ```

  **Commit**: YES — groups with Task 8
  - Message: `test(auth): add tests for admin paywall bypass and security fixes`
  - Files: `server/__tests__/teams-security.test.ts`, `server/__tests__/firm-reviews-security.test.ts`, `lib/__tests__/admin-bypass.test.ts`
  - Pre-commit: `npm run test`

  **What to do**:
  - **`inviteMember()` (L170-199)**: Add auth check at top of function
    - Call `getDatabaseUserId()` to authenticate the caller (throws if unauthenticated)
    - Verify the caller (identified by `invitedBy`) is actually a team member with ADMIN or MANAGER role:
      ```typescript
      const callerMembership = await prisma.teamMember.findFirst({
        where: { teamId, userId: callerUserId, role: { in: ['ADMIN', 'MANAGER', 'OWNER'] } }
      })
      if (!callerMembership) throw new Error('Unauthorized')
      ```
  - **`acceptInvitation()` (L201-230)**: Add email verification
    - After fetching the invitation, verify the authenticated user's email matches the invitation email:
      ```typescript
      const authUserId = await getDatabaseUserId()
      const authUser = await prisma.user.findUnique({ where: { id: authUserId }, select: { email: true } })
      if (!authUser?.email || authUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new Error('This invitation is not for your email address')
      }
      ```
  - **`getTeamAnalytics()` (L327-356)**: Add auth check
    - Accept `userId` parameter (caller's authenticated userId)
    - Verify caller is a team member:
      ```typescript
      const membership = await prisma.teamMember.findFirst({ where: { teamId, userId } })
      if (!membership) throw new Error('Unauthorized')
      ```
    - Keep the existing create-if-not-exists side effect (separate concern)

  **Must NOT do**:
  - Do NOT remove the create-if-not-exists side effect in `getTeamAnalytics()`
  - Do NOT change function return types or signatures beyond adding userId params
  - Do NOT add new team roles or permissions

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `server/teams.ts:358-375` — Existing `updateTeamAnalytics()` has correct team membership auth pattern: `prisma.teamMember.findFirst({ where: { teamId, userId, role: { in: [...] } } })`
  - `server/authz.ts` — `getDatabaseUserId()` for extracting authenticated user
  - `server/team-membership.ts:7-12` — `resolveTeamUserId()` for user ID resolution

  **API/Type References**:
  - `server/teams.ts` — `MemberRole` enum used for role checks
  - `prisma/schema.prisma` — `TeamMember` model with `teamId`, `userId`, `role` fields

  **Acceptance Criteria**:
  - [ ] `inviteMember()` verifies caller is team admin/manager before creating invitation
  - [ ] `acceptInvitation()` verifies authenticated user email matches invitation email
  - [ ] `getTeamAnalytics()` verifies caller is team member before returning analytics
  - [ ] All three functions throw on unauthorized access
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: Non-member cannot invite to team
    Tool: Bash
    Steps:
      1. grep -A 10 "export async function inviteMember" server/teams.ts
      2. Verify teamMember.findFirst check exists before teamInvitation.create
    Expected Result: Membership check present, throws 'Unauthorized' if not member
    Failure Indicators: No membership check, invitation created regardless of membership
    Evidence: .sisyphus/evidence/task-5-invite-member-auth.txt

  Scenario: User cannot accept invitation for different email
    Tool: Bash
    Steps:
      1. grep -A 15 "export async function acceptInvitation" server/teams.ts
      2. Verify email comparison exists: authUser.email vs invitation.email
    Expected Result: Email comparison present, throws if mismatch
    Failure Indicators: No email check, any user can accept any invitation
    Evidence: .sisyphus/evidence/task-5-accept-invitation-email.txt

  Scenario: Non-member cannot read team analytics
    Tool: Bash
    Steps:
      1. grep -A 15 "export async function getTeamAnalytics" server/teams.ts
      2. Verify teamMember.findFirst check exists before analytics query
    Expected Result: Membership check present, throws 'Unauthorized' if not member
    Failure Indicators: No membership check, analytics returned regardless of membership
    Evidence: .sisyphus/evidence/task-5-team-analytics-auth.txt
  ```

  **Commit**: YES
  - Message: `fix(security): add auth checks to teams invitation and analytics`
  - Files: `server/teams.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 6. Fix `firm-reviews.ts` security — moderation queue + moderateReview + getReviewById + flaggedCount

  **What to do**:
  - **`getReviewModerationQueue()` (L219-247)**: Add admin auth
    - Import `assertAdminAccess` from `@/server/authz`
    - Call `await assertAdminAccess()` at the top of the function (throws 401/403 if not admin)
  - **`moderateReview()` (L249-297)**: Add admin auth
    - Already calls `getDatabaseUserId()` — replace or augment with `assertAdminAccess()` to ensure admin role
    - Verify the existing `getDatabaseUserId()` call is replaced by `assertAdminAccess()` which returns `{ userId, email, requestId }`
  - **`getReviewById()` (L305-314)**: Add auth check
    - For admin users: return any review regardless of status
    - For non-admin users: only return reviews with `status: 'APPROVED'`
    - Use `getDatabaseUserId()` + `isAdmin()` to determine access level
  - **`getFlaggedReviewCount()` (L299-303)**: Add admin auth
    - Call `await assertAdminAccess()` at the top

  **Must NOT do**:
  - Do NOT modify `createFirmReview()` or `loadFirmReviews()` (public-facing, working correctly)
  - Do NOT change review status enum values
  - Do NOT add new moderation workflows

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `server/authz.ts:97` — `assertAdminAccess()` — gets user from session, throws if not admin, returns `{ userId, email, requestId }`
  - `server/authz.ts:58` — `isAdmin(userId)` — simple boolean check for admin status
  - `server/firm-reviews.ts:316-335` — Existing `deleteReview()` has ownership check pattern: `getDatabaseUserId()` → verify `review.userId === userId`

  **API/Type References**:
  - `server/authz.ts` — `AdminAccessContext` return type from `assertAdminAccess()`
  - `prisma/schema.prisma` — `PropFirmReview` model with `status` field ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')

  **Acceptance Criteria**:
  - [ ] `getReviewModerationQueue()` calls `assertAdminAccess()` — non-admins get 403
  - [ ] `moderateReview()` calls `assertAdminAccess()` — non-admins get 403
  - [ ] `getFlaggedReviewCount()` calls `assertAdminAccess()` — non-admins get 403
  - [ ] `getReviewById()` returns only APPROVED reviews for non-admins
  - [ ] `getReviewById()` returns any review for admins
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: Moderation queue requires admin
    Tool: Bash
    Steps:
      1. grep -A 5 "export async function getReviewModerationQueue" server/firm-reviews.ts
      2. Verify assertAdminAccess() call exists at top
    Expected Result: assertAdminAccess() found, non-admins blocked
    Failure Indicators: No admin check, any user can access moderation queue
    Evidence: .sisyphus/evidence/task-6-moderation-admin.txt

  Scenario: Review detail access control
    Tool: Bash
    Steps:
      1. grep -A 20 "export async function getReviewById" server/firm-reviews.ts
      2. Verify non-admin users get status filter, admin users don't
    Expected Result: isAdmin check present, status filter applied for non-admin
    Failure Indicators: No access control, all reviews returned to anyone
    Evidence: .sisyphus/evidence/task-6-review-access.txt
  ```

  **Commit**: YES
  - Message: `fix(security): add admin auth to review moderation endpoints`
  - Files: `server/firm-reviews.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 7. Fix `shared.ts` — `getShared()` view count improvement

  **What to do**:
  - The `getShared()` function (L105-128) increments view count via fire-and-forget update
  - This is LOW risk — the slug must be valid and `isSharedAccessible()` must pass first
  - **Minimal improvement**: Add a comment documenting that the view count update is intentionally fire-and-forget and doesn't need auth because:
    1. Slug must exist in DB (hard to guess — UUID)
    2. `isSharedAccessible()` already checks `isPublic` and `expiresAt`
    3. View count is non-sensitive public metadata
  - **OR**: If you want defense-in-depth, wrap the view count update in a try-catch that logs failures (it already does this)

  **Must NOT do**:
  - Do NOT add authentication requirement to public shared views (they're meant to be public)
  - Do NOT block the response on view count update

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `server/shared.ts:105-128` — Current `getShared()` implementation with fire-and-forget view count
  - `server/shared.ts:80-90` — `isSharedAccessible()` — checks `isPublic` and `expiresAt`

  **Acceptance Criteria**:
  - [ ] View count update is documented as intentional fire-and-forget
  - [ ] No authentication added to public shared views
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: Shared view still works without auth
    Tool: Bash
    Steps:
      1. grep -A 15 "export async function getShared" server/shared.ts
      2. Verify no auth requirement was added
    Expected Result: getShared remains callable without authentication
    Failure Indicators: Auth check added, public shared views broken
    Evidence: .sisyphus/evidence/task-7-shared-view-count.txt
  ```

  **Commit**: YES
  - Message: `docs(security): document shared view count as intentional fire-and-forget`
  - Files: `server/shared.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 6. Fix `firm-reviews.ts` security — moderation queue + moderate + getReviewById + flagged count

  **What to do**:
  - **`getReviewModerationQueue()` (L219-247)**: Add admin-only guard
    - Add `await assertAdminAccess()` at the top of the function (from `@/server/authz`)
    - This ensures only admin users can see the moderation queue
  - **`moderateReview()` (L249-297)**: Add admin-only guard
    - It already calls `getDatabaseUserId()` but doesn't verify admin status
    - Add `await assertAdminAccess()` at the top (the function already gets userId internally)
  - **`getFlaggedReviewCount()` (L299-303)**: Add admin-only guard
    - Add `await assertAdminAccess()` at the top
  - **`getReviewById()` (L305-314)**: Add access control
    - For admin users: return any review regardless of status
    - For non-admin users: only return reviews with `status: 'APPROVED'`
    - Add `getDatabaseUserId()` call, then check `isAdmin(userId)`. If admin, return as-is. If not admin, add `{ status: 'APPROVED' }` to the where clause

  **Must NOT do**:
  - Do NOT change the review moderation business logic
  - Do NOT add new review statuses
  - Do NOT modify the `flagReview()` function (already has auth)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `server/authz.ts:97` — `assertAdminAccess()` — gets user from session, throws 403 if not admin
  - `server/authz.ts:58` — `isAdmin(userId)` — for per-function admin checks
  - `app/api/admin/reports/route.ts` — Example of `assertAdminAccess()` usage pattern
  - `app/[locale]/admin/actions/stats.ts` — Example of admin-only server action pattern

  **API/Type References**:
  - `server/firm-reviews.ts` — Existing function signatures
  - `prisma/schema.prisma` — `ReviewModeration` and `PropFirmReview` models

  **Acceptance Criteria**:
  - [ ] `getReviewModerationQueue()` throws 403 for non-admin
  - [ ] `moderateReview()` throws 403 for non-admin
  - [ ] `getFlaggedReviewCount()` throws 403 for non-admin
  - [ ] `getReviewById()` returns only APPROVED reviews for non-admin, all reviews for admin
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: Non-admin blocked from moderation queue
    Tool: Bash
    Steps:
      1. grep -n "assertAdminAccess\|requireAdmin" server/firm-reviews.ts
    Expected Result: assertAdminAccess() found in getReviewModerationQueue, moderateReview, getFlaggedReviewCount
    Failure Indicators: No admin guard in any of these functions
    Evidence: .sisyphus/evidence/task-6-moderation-auth.txt

  Scenario: getReviewById filters by status for non-admin
    Tool: Bash
    Steps:
      1. grep -A 15 "export async function getReviewById" server/firm-reviews.ts
      2. Verify status: 'APPROVED' filter when user is not admin
    Expected Result: Non-admin only sees APPROVED reviews, admin sees all
    Failure Indicators: No status filter, or admin also filtered
    Evidence: .sisyphus/evidence/task-6-review-status-filter.txt
  ```

  **Commit**: YES
  - Message: `fix(security): add admin auth to review moderation endpoints`
  - Files: `server/firm-reviews.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 7. Fix `shared.ts` — `getShared()` view count ownership (LOW priority)

  **What to do**:
  - Open `server/shared.ts`, function `getShared()` around L115
  - The fire-and-forget view count increment runs without ownership verification
  - This is LOW risk because it only increments a counter on a public shared resource
  - The fix: move the view count increment to only fire when `isSharedAccessible()` passes (which it already does — verify this is the case)
  - If the view count is already gated by `isSharedAccessible()`, document it as "confirmed safe" and move on
  - If not gated: add a simple check to only increment for valid slugs that resolve to existing shared records

  **Must NOT do**:
  - Do NOT add userId/auth requirements to public shared views (they must work without login)
  - Do NOT change the `isSharedAccessible()` logic
  - Do NOT add rate limiting to view counts (separate concern)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 9
  - **Blocked By**: None

  **References**:
  **Pattern References**:
  - `server/shared.ts:105-128` — Current `getShared()` with fire-and-forget view count
  - `server/shared.ts` — `isSharedAccessible()` utility function

  **Acceptance Criteria**:
  - [ ] View count only increments for valid, accessible shared resources
  - [ ] Public shared views still work without authentication
  - [ ] `npm run typecheck` passes

  **QA Scenarios:**
  ```
  Scenario: View count only fires for valid shared resources
    Tool: Bash
    Steps:
      1. grep -A 5 "viewCount" server/shared.ts
      2. Verify increment is inside the null-check / isSharedAccessible guard
    Expected Result: viewCount increment only runs after slug resolves and accessibility confirmed
    Failure Indicators: viewCount increments regardless of slug validity
    Evidence: .sisyphus/evidence/task-7-view-count-guard.txt
  ```

  **Commit**: YES
  - Message: `fix(security): improve shared view count ownership check`
  - Files: `server/shared.ts`
  - Pre-commit: `npm run typecheck`

- [ ] 8. Tests for admin paywall bypass

  **What to do**:
  - Create test file `lib/__tests__/admin-bypass.test.ts` (or co-locate based on existing test patterns)
  - Test `guardAiRequest()`:
    - Mock `isAdmin` to return `true` for admin userId → expect `{ ok: true }` without subscription
    - Mock `isAdmin` to return `false` for regular userId → expect entitlement/budget checks to run
  - Test `canAccessAiFeature()`:
    - Admin userId → expect `{ allowed: true, isActive: true }` without DB subscription record
    - Regular userId with no subscription → expect `{ allowed: false }` for premium features
  - Test `assertWithinAiBudget()`:
    - Admin userId → expect `{ allowed: true }` with unlimited budget
    - Regular userId → expect budget limits enforced
  - Test `isPlusUser()` (if testable in isolation):
    - Admin context → returns `true`
    - Non-admin without subscription → returns `false`
  - Use concrete test IDs: `'admin-test-uuid-001'` for admin, `'user-test-uuid-002'` for regular user
  - Mock `process.env.ALLOWED_ADMIN_USER_ID` to include admin test ID

  **Must NOT do**:
  - Do NOT test actual database connections — mock Prisma
  - Do NOT test Whop API integration
  - Do NOT add tests for features not modified in this plan

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 9)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1, 2, 3

  **References**:
  **Pattern References**:
  - `lib/__tests__/` — Existing test patterns in the lib directory
  - `lib/ai/__tests__/` — Check for existing AI test files
  - `server/authz.ts:58` — `isAdmin()` — understand how to mock it

  **Test References**:
  - `lib/__tests__/authz.test.ts` — Existing authz tests, follow same mocking patterns

  **Acceptance Criteria**:
  - [ ] Test file created: `lib/__tests__/admin-bypass.test.ts`
  - [ ] `npx vitest run lib/__tests__/admin-bypass.test.ts` → PASS (all tests, 0 failures)
  - [ ] Admin bypass tests: at least 4 (route guard, entitlements, budget, isPlusUser)
  - [ ] Non-admin regression tests: at least 3 (ensure non-admin still gated)

  **QA Scenarios:**
  ```
  Scenario: All admin bypass tests pass
    Tool: Bash
    Steps:
      1. npx vitest run lib/__tests__/admin-bypass.test.ts
    Expected Result: All tests pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-8-admin-bypass-tests.txt

  Scenario: Test file covers both admin and non-admin paths
    Tool: Bash
    Steps:
      1. grep -c "isAdmin.*true\|admin.*uuid" lib/__tests__/admin-bypass.test.ts
      2. grep -c "isAdmin.*false\|non-admin\|regular" lib/__tests__/admin-bypass.test.ts
    Expected Result: Both admin and non-admin test cases present
    Failure Indicators: Missing either admin or non-admin test coverage
    Evidence: .sisyphus/evidence/task-8-test-coverage.txt
  ```

  **Commit**: YES — groups with Task 9
  - Message: `test(auth): add tests for admin paywall bypass and security fixes`
  - Files: `lib/__tests__/admin-bypass.test.ts`, test files from Task 9
  - Pre-commit: `npm run test`

- [ ] 9. Tests for teams + firm-reviews security fixes

  **What to do**:
  - Create test file `server/__tests__/teams-security.test.ts`:
    - `inviteMember()`: non-member caller → throws 'Unauthorized'
    - `inviteMember()`: team admin caller → creates invitation
    - `acceptInvitation()`: email mismatch → throws error
    - `acceptInvitation()`: email match → accepts invitation
    - `getTeamAnalytics()`: non-member → throws 'Unauthorized'
    - `getTeamAnalytics()`: team member → returns analytics
  - Create test file `server/__tests__/firm-reviews-security.test.ts`:
    - `getReviewModerationQueue()`: non-admin → throws 403
    - `getReviewModerationQueue()`: admin → returns queue
    - `moderateReview()`: non-admin → throws 403
    - `getFlaggedReviewCount()`: non-admin → throws 403
    - `getReviewById()`: non-admin with non-APPROVED review → returns null
    - `getReviewById()`: admin with any review → returns review
  - Use `vi.mock('@/server/authz', ...)` to control `assertAdminAccess` and `isAdmin`
  - Mock Prisma calls with `vi.mock('@/lib/prisma', ...)`

  **Must NOT do**:
  - Do NOT test actual database connections
  - Do NOT add tests for unrelated functions
  - Do NOT modify source code to make it testable (source should already be testable after Tasks 5-6)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 5, 6, 7

  **References**:
  **Test References**:
  - `lib/__tests__/authz.test.ts` — Existing test patterns for authz mocking
  - `server/__tests__/` — Check for existing server test directory structure

  **Acceptance Criteria**:
  - [ ] Test files created: `server/__tests__/teams-security.test.ts`, `server/__tests__/firm-reviews-security.test.ts`
  - [ ] `npx vitest run server/__tests__/teams-security.test.ts` → PASS
  - [ ] `npx vitest run server/__tests__/firm-reviews-security.test.ts` → PASS
  - [ ] Each file has happy-path + rejection + unauthenticated scenarios

  **QA Scenarios:**
  ```
  Scenario: All security tests pass
    Tool: Bash
    Steps:
      1. npx vitest run server/__tests__/teams-security.test.ts
      2. npx vitest run server/__tests__/firm-reviews-security.test.ts
    Expected Result: Both test suites pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-9-security-tests.txt
  ```

  **Commit**: YES — groups with Task 8
  - Message: `test(auth): add tests for admin paywall bypass and security fixes`
  - Files: `server/__tests__/teams-security.test.ts`, `server/__tests__/firm-reviews-security.test.ts`, `lib/__tests__/admin-bypass.test.ts`
  - Pre-commit: `npm run test`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, grep pattern). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run typecheck` + `npm run lint` + `npm run test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: admin without subscription, non-admin trying admin endpoints. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| Commit | Message | Files | Pre-commit |
|--------|---------|-------|------------|
| 1 | `feat(auth): add admin bypass to AI route guard` | `lib/ai/route-guard.ts` | `npm run typecheck` |
| 2 | `feat(auth): add admin bypass to AI entitlements and budget` | `lib/ai/entitlements.ts`, `lib/ai/usage-budget.ts` | `npm run typecheck` |
| 3 | `feat(auth): add admin bypass to isPlusUser UI gate` | `context/data-provider.tsx` | `npm run typecheck` |
| 4 | `fix(security): add auth checks to teams invitation and analytics` | `server/teams.ts` | `npm run typecheck` |
| 5 | `fix(security): add admin auth to review moderation endpoints` | `server/firm-reviews.ts` | `npm run typecheck` |
| 6 | `fix(security): improve shared view count ownership check` | `server/shared.ts` | `npm run typecheck` |
| 7 | `test(auth): add tests for admin paywall bypass and security fixes` | `lib/__tests__/admin-bypass.test.ts`, `server/__tests__/teams-security.test.ts`, `server/__tests__/firm-reviews-security.test.ts` | `npm run test` |

---

## Success Criteria

### Verification Commands
```bash
npm run typecheck              # Expected: 0 errors
npm run lint                   # Expected: within warning budget
npm run test                   # Expected: all tests pass
grep -r "isAdmin" lib/ai/      # Expected: admin bypass in route-guard, entitlements, budget
grep -r "assertAdminAccess" server/firm-reviews.ts  # Expected: present in moderation functions
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Admin can use AI without subscription
- [ ] Admin sees no UPGRADE buttons
- [ ] Non-admin blocked from moderation queue
- [ ] Non-admin cannot invite to arbitrary teams
- [ ] Non-admin cannot read other teams' analytics

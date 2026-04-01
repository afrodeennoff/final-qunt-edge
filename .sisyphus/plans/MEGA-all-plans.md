# Qunt Edge — Full Project Overhaul (All Plans Combined)

## TL;DR

> **Quick Summary**: Execute all 6 pending plans in parallel waves grouped by task type — quick fixes, security/auth, import fixes, widget data, mobile optimization, and home redesign — all merged into one coordinated mega-plan.
> 
> **Plans Merged**: admin-security-overhaul + fix-all-import-issues + fix-team-sidebar + fix-widget-data + mobile-optimization + home-redesign
> 
> **Deliverables**: All 264+ tasks across 6 plans executed
> 
> **Estimated Effort**: XXL (multiple sessions, parallel execution)
> **Parallel Execution**: YES — 6 concurrent task streams
> **Critical Path**: Quick wins → Security → Import/Wiget → Mobile → Home

---

## Context

### Merged Plans
| Plan | Source File | Tasks | Done | Status |
|------|------------|-------|------|--------|
| `admin-security-overhaul` | `.sisyphus/plans/admin-security-overhaul.md` | 82 | 0 | Security + admin paywall |
| `fix-all-import-issues` | `.sisyphus/plans/fix-all-import-issues.md` | 85 | 35 | Import system fixes |
| `fix-team-sidebar` | `.sisyphus/plans/fix-team-sidebar.md` | 2 | 1 | Sidebar visibility fix |
| `fix-widget-data` | `.sisyphus/plans/fix-widget-data.md` | 53 | 0 | Widget hydration pipeline |
| `mobile-optimization` | `.sisyphus/plans/mobile-optimization.md` | 17 | 0 | Mobile UX |
| `home-redesign` | `.sisyphus/plans/home-redesign.md` | 25+ | 0 | Home page rewrite |

### Parallel Wave Architecture

6 independent task streams, each with its own wave structure:

```
Stream A (quick): Team sidebar (1 task) — instant completion
Stream B (quick + auth): Admin security (4 tasks) — admin bypass
Stream C (deep): Import fixes (35+ tasks) — trade import system
Stream D (deep): Widget data (6 tasks) — hydration pipeline
Stream E (visual): Mobile optimization (17 tasks) — mobile UX
Stream F (visual): Home redesign (25+ tasks) — homepage rewrite
```

All streams can run in parallel (independent files/domains).

---

## Work Objectives

### Core Objective
Fix all identified issues across the entire platform in one coordinated execution.

### Concrete Deliverables (Summary)
- Admin users bypass all AI paywalls and see no upgrade prompts
- 8 security vulnerabilities patched in teams/firm-reviews
- Import system fully functional (15+ issue categories)
- Widget data hydration pipeline fixed (5 root causes)
- Mobile UX meets 44px touch targets, proper scroll, bottom nav
- Home page fully redesigned with bento layouts, animations, new sections

### Must Have
- All CRITICAL issues resolved across all 6 plans
- TypeScript clean (0 errors)
- ESLint within warning budget
- No regressions in working functionality

### Must NOT Have
- No `console.log`/`console.error` in production code
- No `as any` / `@ts-ignore` / `@ts-expect-error` in new code
- No light mode changes (dark-only preserved)
- No breaking changes to existing working features
- No cross-stream contamination (Stream A shouldn't touch Stream B files)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Per-Stream Verification
Each stream follows its own verification strategy from the source plan.

### Cross-Stream Verification
- `npm run typecheck` — must pass with 0 errors across all changes
- `npm run lint` — must stay within warning budget (1546 max)
- `npm run test` — all tests pass
- `npm run build` — production build succeeds

---

## Execution Strategy — 6 Parallel Streams

### Stream A: Team Sidebar (INSTANT — 1 task)
**Source:** `.sisyphus/plans/fix-team-sidebar.md`
**Agent:** `quick`
**Tasks:** 1 remaining

### Stream B: Admin Security (WAVE 1 — 4 tasks parallel)
**Source:** `.sisyphus/plans/admin-security-overhaul.md`
**Tasks:** 1-4 from admin plan
**Agent:** `quick`

### Stream C: Import Fixes (WAVE 1-6 — 50 tasks parallel)
**Source:** `.sisyphus/plans/fix-all-import-issues.md`
**Agents:** `quick` + `deep`
**Tasks:** 35 remaining (CRITICAL + HIGH + MEDIUM priority)

### Stream D: Widget Data (WAVE 1-3 — 6 tasks)
**Source:** `.sisyphus/plans/fix-widget-data.md`
**Agents:** `deep`
**Tasks:** 6 root-cause fixes

### Stream E: Mobile Optimization (WAVE 1-4 — 17 tasks)
**Source:** `.sisyphus/plans/mobile-optimization.md`
**Agents:** `visual-engineering`
**Tasks:** Touch targets → Table fix → Navigation → Dashboard

### Stream F: Home Redesign (WAVE 0-4 — 25+ tasks)
**Source:** `.sisyphus/plans/home-redesign.md`
**Agents:** `visual-engineering`
**Tasks:** Delete orphans → Rewrite Hero/Features → Polish → Integration

---

## TODOs

> Detailed tasks organized by stream. Each stream executes independently.
> Reference source plan for complete task details.

---

### Stream A: Team Sidebar Fix (1 task)

- [ ] A1. Remove sidebar from team landing layout

  **What to do**: Edit `app/[locale]/teams/(landing)/layout.tsx` — add `showSidebar={false}` to `MarketingLayoutShell`

  **Source**: `.sisyphus/plans/fix-team-sidebar.md` Task 1

  **Acceptance Criteria**:
  - [ ] `showSidebar={false}` present in team landing layout

  **Commit**: `fix(layout): remove sidebar from public team page`

---

### Stream B: Admin Security Overhaul (4 tasks Wave 1, 3 tasks Wave 2, 2 tasks Wave 3)

#### Wave B1 (4 tasks, parallel)

- [ ] B1. Admin bypass in `guardAiRequest()` — single choke point

  **What to do**: `lib/ai/route-guard.ts` — import `isAdmin` from `@/server/authz`, add early-return before `canAccessAiFeature()`

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 1

  **References**: `server/authz.ts:58` `isAdmin()`, `lib/ai/route-guard.ts`

  **Acceptance Criteria**:
  - [ ] `isAdmin` imported, admin early-return placed BEFORE entitlement check
  - [ ] `npm run typecheck` passes

  **Commit**: `feat(auth): add admin bypass to AI route guard`

- [ ] B2. Admin bypass in `canAccessAiFeature()` + `assertWithinAiBudget()`

  **What to do**: `lib/ai/entitlements.ts` + `lib/ai/usage-budget.ts` — import `isAdmin`, add early-returns

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 2

  **References**: `lib/ai/entitlements.ts`, `lib/ai/usage-budget.ts`

  **Acceptance Criteria**:
  - [ ] Both files have `isAdmin` bypass, admin gets unlimited tokens
  - [ ] `npm run typecheck` passes

  **Commit**: `feat(auth): add admin bypass to AI entitlements and budget`

- [ ] B3. Admin bypass in `isPlusUser()` — hide UPGRADE buttons

  **What to do**: `context/data-provider.tsx` — propagate admin status from server through context, check in `isPlusUser()`

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 3

  **References**: `context/data-provider.tsx:1312` `isPlusUser()`, `dashboard/layout.tsx:54`

  **Acceptance Criteria**:
  - [ ] Admin sees no UPGRADE buttons
  - [ ] Admin status from server, not client env
  - [ ] `npm run typecheck` passes

  **Commit**: `feat(auth): add admin bypass to isPlusUser UI gate`

- [ ] B4. Verify admin sidebar visibility

  **What to do**: Verify existing admin sidebar flow is correct — no changes expected

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 4

  **References**: `dashboard-sidebar.tsx:134`, `admin/layout.tsx`, `proxy.ts`

  **Acceptance Criteria**:
  - [ ] Admin nav only visible to admins
  - [ ] Admin pages redirect non-admins

  **Commit**: NO (verification only)

#### Wave B2 (3 tasks, parallel)

- [ ] B5. Fix `teams.ts` security — inviteMember + acceptInvitation + getTeamAnalytics

  **What to do**: Add auth/membership checks to `server/teams.ts`:
  - `inviteMember()`: add `getDatabaseUserId()` + team membership check
  - `acceptInvitation()`: add email verification
  - `getTeamAnalytics()`: add `getDatabaseUserId()` + team membership check

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 5

  **References**: `server/teams.ts`, `server/authz.ts`

  **Acceptance Criteria**:
  - [ ] Non-member cannot invite to team
  - [ ] User cannot accept invitation for different email
  - [ ] Non-member cannot read team analytics
  - [ ] `npm run typecheck` passes

  **Commit**: `fix(security): add auth checks to team invitation and analytics`

- [ ] B6. Fix `firm-reviews.ts` security — moderation queue + moderate + getReviewById

  **What to do**: Add `assertAdminAccess()` to `server/firm-reviews.ts`:
  - `getReviewModerationQueue()`: add admin auth
  - `moderateReview()`: add admin auth
  - `getFlaggedReviewCount()`: add admin auth
  - `getReviewById()`: admin sees all, non-admin sees only APPROVED

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 6

  **References**: `server/firm-reviews.ts`, `server/authz.ts`

  **Acceptance Criteria**:
  - [ ] Moderation queue requires admin
  - [ ] Review access controlled by status
  - [ ] `npm run typecheck` passes

  **Commit**: `fix(security): add admin auth to review moderation endpoints`

- [ ] B7. Fix `shared.ts` — view count documentation

  **What to do**: Add comment documenting fire-and-forget view count is intentional

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 7

  **References**: `server/shared.ts:115`

  **Acceptance Criteria**:
  - [ ] View count update documented
  - [ ] `npm run typecheck` passes

  **Commit**: `docs(security): document shared view count as intentional`

#### Wave B3 (2 tasks, parallel)

- [ ] B8. Tests for admin paywall bypass

  **What to do**: Create `lib/__tests__/admin-bypass.test.ts` — test guardAiRequest, canAccessAiFeature, isPlusUser with admin/non-admin

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 8

  **References**: `lib/__tests__/authz.test.ts`

  **Acceptance Criteria**:
  - [ ] Tests pass: `npx vitest run lib/__tests__/admin-bypass.test.ts`

  **Commit**: `test(auth): add tests for admin paywall bypass`

- [ ] B9. Tests for teams + firm-reviews security

  **What to do**: Create `server/__tests__/teams-security.test.ts` + `firm-reviews-security.test.ts`

  **Source**: `.sisyphus/plans/admin-security-overhaul.md` Task 9

  **References**: `lib/__tests__/authz.test.ts`

  **Acceptance Criteria**:
  - [ ] All security tests pass

  **Commit**: `test(security): add tests for teams and firm-reviews security`

---

### Stream C: Import System Fixes (35 remaining tasks)

**Source**: `.sisyphus/plans/fix-all-import-issues.md`

Reference the source plan for detailed task breakdowns. Tasks are organized by priority:

#### CRITICAL (remaining from 14 total)

- [ ] C1. Import UI flow — CRITICAL issues (UI flow category, critical severity)
- [ ] C2. Import AI mapping — CRITICAL issues (AI mapping category, critical severity)
- [ ] C3. Trade saving — CRITICAL issues (trade saving category, critical severity)
- [ ] C4. Sync integration — CRITICAL issues (sync category, critical severity)

#### HIGH (remaining from 19 total)

- [ ] C5. Import UI flow — HIGH issues (UI flow category, high severity)
- [ ] C6. Import AI mapping — HIGH issues (AI mapping category, high severity)
- [ ] C7. Trade saving — HIGH issues (trade saving category, high severity)
- [ ] C8. Sync integration — HIGH issues (sync category, high severity)

#### MEDIUM (remaining from 27 total)

- [ ] C9. Import UI flow — MEDIUM issues
- [ ] C10. Import AI mapping — MEDIUM issues
- [ ] C11. Trade saving — MEDIUM issues
- [ ] C12. Sync integration — MEDIUM issues

**For full task details, see**: `.sisyphus/plans/fix-all-import-issues.md`

**Agent**: Mix of `quick` (UI fixes) and `deep` (logic fixes)

---

### Stream D: Widget Data Hydration (6 tasks)

**Source**: `.sisyphus/plans/fix-widget-data.md`

- [ ] D1. Fix `loadData` hydration in `context/data-provider.tsx` — empty snapshot + skipped accounts

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 1

  **References**: `context/data-provider.tsx:loadData`, `server/user-data.ts`

- [ ] D2. Fix `loadData` dependency array explosion (21 deps)

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 2

- [ ] D3. Add IndexedDB cache clearing on trade mutations

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 3

  **References**: `server/trades.ts` (trade mutations), `context/data-provider.tsx` (cache clear)

- [ ] D4. Add missing cache tag invalidation for `user-data-core-*` / `user-data-supplemental-*`

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 4

  **References**: `server/trades.ts`, `server/user-data.ts:cacheTag`

- [ ] D5. Background refresh error surfacing with retry capability

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 5

- [ ] D6. Zero-PnL neutral styling in cumulative PnL card

  **Source**: `.sisyphus/plans/fix-widget-data.md` Task 6

**Agent**: `deep`
**Reference source**: `.sisyphus/plans/fix-widget-data.md` for full task details

---

### Stream E: Mobile Optimization (17 tasks)

**Source**: `.sisyphus/plans/mobile-optimization.md`

#### Wave E1 — Foundation (5 tasks, parallel)

- [ ] E1. Fix Checkbox touch targets (16px → 44px)

  **File**: `components/ui/checkbox.tsx`

- [ ] E2. Fix RadioGroup touch targets (16px → 44px)

  **File**: `components/ui/radio-group.tsx`

- [ ] E3. Fix Card padding responsive

  **Files**: `components/ui/card.tsx`, `card-header.tsx`, `card-content.tsx`, `card-footer.tsx`

- [ ] E4. Fix Popover width responsive

  **File**: `components/ui/popover.tsx`

- [ ] E5. Fix DropdownMenu width responsive

  **File**: `components/ui/dropdown-menu.tsx`

#### Wave E2 — Critical UX (4 tasks, parallel)

- [ ] E6. Fix Trade Table horizontal scroll

  **File**: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`

- [ ] E7. Fix Import dialog mobile width

  **File**: `app/[locale]/dashboard/components/import/import-button.tsx`

- [ ] E8. Standardize responsive breakpoints (640/768 → 767px)

  **Files**: All components using inconsistent breakpoints

- [ ] E9. Add safe-area to dashboard layout

  **File**: `app/[locale]/dashboard/layout.tsx`

#### Wave E3 — Navigation (6 tasks, parallel)

- [ ] E10. Create mobile bottom tab bar

  **File**: `components/mobile-bottom-nav.tsx` (NEW)

- [ ] E11. Create unified mobile nav component

  **File**: `components/mobile-nav.tsx` (NEW)

- [ ] E12. Update landing navbar to use unified nav

  **File**: `app/[locale]/(landing)/components/navbar.tsx`

- [ ] E13. Update home Navigation to use unified nav

  **File**: `app/[locale]/(home)/components/Navigation.tsx`

- [ ] E14. Update teams navbar to use unified nav

  **File**: `app/[locale]/teams/components/team-navbar.tsx`

- [ ] E15. Mobile dashboard optimized layout

  **File**: `app/[locale]/dashboard/components/widget-canvas.tsx`

#### Wave E4 — Polish (2 tasks)

- [ ] E16. Fix filter dropdowns mobile

  **Files**: `app/[locale]/dashboard/components/filters/*.tsx`

- [ ] E17. Add safe-area to landing + teams layouts

  **Files**: `app/[locale]/(landing)/layout.tsx`, `app/[locale]/teams/layout.tsx`

**Agent**: `visual-engineering` (all tasks)
**Reference source**: `.sisyphus/plans/mobile-optimization.md` for full wave details

---

### Stream F: Home Redesign (25+ tasks)

**Source**: `.sisyphus/plans/home-redesign.md`

#### Wave F0 — Foundation (2 tasks, SEQUENTIAL — blocks everything else)

- [ ] F1. Delete orphan components

  **Delete**: `DeferredHomeSections.tsx`, `OnboardingJourney.tsx`, `ProofStrip.tsx`, `Differentiators.tsx`, `Qualification.tsx`, `TrustStats.tsx`, `CTA.tsx`, `TrustStrip.tsx`

- [ ] F2. Restructure `HomeContent.tsx` — new section order, dynamic imports for below-fold

  **File**: `app/[locale]/(home)/components/HomeContent.tsx`

#### Wave F1 — Rewrites (6 tasks, parallel)

- [ ] F3. Rewrite `Hero.tsx` — problem-first headline, framer-motion stagger, broker logos

- [ ] F4. Create `LiveStatsStrip.tsx` — animated counters (NEW)

- [ ] F5. Rewrite `ProblemStatement.tsx` — asymmetric bento, scroll-triggered reveals

- [ ] F6. Create `FeaturesBento.tsx` — bento grid with specific col-spans (NEW)

- [ ] F7. Rewrite `HowItWorks.tsx` — horizontal 5-step pipeline

- [ ] F8. Rewrite `DashboardPreview.tsx` — floating metric badges, glow effect, "Live" indicator

#### Wave F2 — More Rewrites (5 tasks, parallel)

- [ ] F9. Create `AudienceSegmentation.tsx` — 2-column prop firm / independent traders (NEW)

- [ ] F10. Create `AIFeatures.tsx` — bento grid of all AI features (NEW)

- [ ] F11. Create `SocialProof.tsx` — merged stats + testimonials + trust pillars (NEW)

- [ ] F12. Rewrite `PricingSection.tsx` — glassmorphism cards

- [ ] F13. Rewrite `FinalCTA.tsx` — bold gradient CTA with ambient glow

#### Wave F3 — Polish (3 tasks)

- [ ] F14. Polish `AnalysisDemo.tsx` — wrap in motion.section, add whileInView

- [ ] F15. Polish `ComparisonSection.tsx` — framer-motion row reveals

- [ ] F16. Polish `FAQSection.tsx` — motion.div section entrance

#### Wave F4 — Integration (3 tasks)

- [ ] F17. Integration test — verify HomeContent renders all sections

- [ ] F18. Delete superseded files — `Features.tsx`, `AIFuturesSection.tsx`

- [ ] F19. Build verification — `npm run typecheck`, `npm run lint`, Playwright spot-check

**Agent**: `visual-engineering` (all tasks)
**Reference source**: `.sisyphus/plans/home-redesign.md` for full component specs (741 lines of detailed design specs)

---

## Final Verification Wave

> 4 review agents run in PARALLEL across ALL streams. ALL must APPROVE.

- [ ] FV1. **Plan Compliance Audit** — `oracle`
  Read each source plan. For every "Must Have": verify implementation exists. For every "Must NOT Have": search for violations. Cross-check all 6 plans.

- [ ] FV2. **Code Quality Review** — `unspecified-high`
  `npm run typecheck` + `npm run lint` + `npm run test` across all changed files.

- [ ] FV3. **Visual Regression Check** — `visual-engineering`
  Playwright screenshots of: dashboard (desktop + mobile), home page, admin panel, mobile navigation. Verify no layout breakage.

- [ ] FV4. **Scope Fidelity Check** — `deep`
  For each stream: diff against source plan. Detect cross-stream contamination. Verify no creep.

---

## Commit Strategy

| Stream | Commits | Pre-commit |
|--------|---------|------------|
| A (Team Sidebar) | 1 | typecheck |
| B (Admin Security) | 7 | typecheck + test |
| C (Import Fixes) | 6 | typecheck |
| D (Widget Data) | 1 | typecheck |
| E (Mobile) | 4 | typecheck |
| F (Home Redesign) | 5 | typecheck + lint |

---

## Success Criteria

```bash
npm run typecheck              # Expected: 0 errors
npm run lint                   # Expected: within warning budget
npm run test                   # Expected: all tests pass
npm run build                  # Expected: production build succeeds
```

### Per-Stream Final Checklist

**Stream A**: Team landing has no sidebar ✓

**Stream B**:
- [ ] Admin bypasses AI paywall (all 12 AI routes)
- [ ] Admin sees no UPGRADE buttons
- [ ] Non-admin blocked from moderation queue
- [ ] Non-admin cannot invite to arbitrary teams
- [ ] Non-admin cannot read other teams' analytics
- [ ] All security tests pass

**Stream C**:
- [ ] Import UI flow works end-to-end
- [ ] AI mapping correctly maps all fields
- [ ] Trades save without duplicates
- [ ] Sync integrations stable

**Stream D**:
- [ ] Widgets display data after page load
- [ ] No empty/zero widget states on populated accounts
- [ ] Cache invalidation works on trade mutations

**Stream E**:
- [ ] All touch targets ≥44px
- [ ] Trade table scrolls horizontally on mobile
- [ ] Import wizard fits on 375px viewport
- [ ] Bottom tab bar visible on mobile

**Stream F**:
- [ ] Home page renders all sections in order
- [ ] Hero animations stagger correctly
- [ ] Bento grids display properly
- [ ] No duplicate renders
- [ ] Real data (PropFirmsExplorer, RollingAdBanner) still works

# Qunt Edge Remaining Tasks Plan

## Context
Working in `/Users/timon/Downloads/qunt-edge` on branch `new-update`. Uncommitted changes include admin propfirm page JSX bug and deals.ts type addition. All AI cleanup is committed and passing typecheck/lint. Remaining tasks are:
1. Fix admin propfirm page JSX error (extra </span>)
2. Redesign propfirm landing page with platform/payout filter chips and comparison feature
3. Fix firm detail page: remove hardcoded data, fix styling, use real data
4. Audit propfirm catalogue widget and all 26 widgets in widget-registry.tsx
5. Audit Next.js performance: data-provider re-renders, verify next-config optimizations, check sync contexts
6. Verification: run typecheck, lint, build after all changes

## Task Dependency Graph
| Task | Depends On | Reason |
|------|------------|--------|
| Task 1 | None | Independent JSX fix in admin propfirm page |
| Task 2 | None | Independent landing page redesign |
| Task 3 | None | Independent firm detail page fixes |
| Task 4 | None | Independent widget audit |
| Task 5 | None | Independent performance audit |
| Task 6 | Task 1, Task 2, Task 3, Task 4, Task 5 | Verification requires all code changes to be complete |

## Parallel Execution Graph
Wave 1 (Start immediately):
├── Task 1: Fix admin propfirm page JSX error (no dependencies)

Wave 2 (After Wave 1 completes):
├── Task 2: Redesign propfirm landing page (platform/payout filter chips, comparison feature)
├── Task 3: Fix firm detail page (remove hardcoded data, fix styling, use real data)
└── Task 4: Audit propfirm catalogue widget and all 26 widgets in widget-registry.tsx

Wave 3 (After Wave 2 completes):
└── Task 5: Audit Next.js performance (data-provider re-renders, next-config optimizations, sync contexts)

Wave 4 (After Wave 3 completes):
└── Task 6: Verification (run typecheck, lint, build)

Critical Path: Task 1 → Task 2 → Task 5 → Task 6
Estimated Parallel Speedup: 60% faster than sequential (Waves 2 and 3 allow parallel execution of independent tasks)

## Tasks

### Task 1: Fix admin propfirm page JSX error
**Description**: Remove extra </span> closing tag on line 75 in app/[locale]/admin/propfirms/page.tsx causing JSX cascade errors
**Delegation Recommendation**:
- Category: `quick` - Trivial tag removal requiring minimal changes
- Skills: [`frontend-ui-ux`] - Ensures proper JSX syntax and UI consistency
**Skills Evaluation**:
- ✅ INCLUDED `frontend-ui-ux`: Needed for JSX correctness and UI rendering
- ❌ OMITTED `brainstorming`: Not creative work, direct fix
- ❌ OMITTED `dev-browser`: No browser automation needed
- ❌ OMITTED `webapp-testing`: Verification will happen in Task 6
**Depends On**: None
**Acceptance Criteria**:
- File app/[locale]/admin/propfirms/page.tsx line 75 has no extra </span>
- JSX renders without errors in browser
- No lint errors related to this file

### Task 2: Redesign propfirm landing page
**Description**: Add platform/payout filter chips (like propfirmmatch.com) and comparison feature (select 2-3 firms side-by-side) to app/[locale]/(landing)/propfirms/page.tsx
**Delegation Recommendation**:
- Category: `frontend-design` - Requires distinctive UI components and interaction patterns
- Skills: [`frontend-design`, `frontend-ui-ux`] - For premium UI/UX and component design
**Skills Evaluation**:
- ✅ INCLUDED `frontend-design`: For creating distinctive, production-grade interface
- ✅ INCLUDED `frontend-ui-ux`: For crafting stunning UI/UX even without mockups
- ❌ OMITTED `dev-browser`: No external website automation needed in planning
- ❌ OMITTED `webapp-testing`: Testing will occur in Task 6
**Depends On**: None
**Acceptance Criteria**:
- Platform filter chips displayed above propfirm grid
- Payout filter chips displayed above propfirm grid
- Comparison feature allows selecting 2-3 firms to view side-by-side
- UI follows monochrome design system with proper contrast
- No regression in existing functionality

### Task 3: Fix firm detail page
**Description**: Remove hardcoded mock data in ChallengesSection and RADARAnalysisWidget, fix mixed styling, ensure getUnifiedFirmBySlug returns accountSizes from config, use real data from config + DB in app/[locale]/(landing)/firm/[slug]/page-client.tsx
**Delegation Recommendation**:
- Category: `frontend-design` - Requires UI fixes and data integration
- Skills: [`frontend-design`, `frontend-ui-ux`] - For UI consistency and data-driven components
**Skills Evaluation**:
- ✅ INCLUDED `frontend-design`: For creating production-grade interface
- ✅ INCLUDED `frontend-ui-ux`: For fixing styling and removing hardcoded data
- ❌ OMITTED `api-route`: No new API routes being created
- ❌ OMITTED `dev-browser`: No external automation needed
**Depends On**: None
**Acceptance Criteria**:
- ChallengesSection shows real challenge data from config/DB, not 5 static cards
- RADARAnalysisWidget shows real percentages, not hardcoded mocks
- Styling uses v2 tokens consistently, no raw white/10 or text-white/45
- getUnifiedFirmBySlug returns accountSizes from config
- Page loads real data from config and database
- No lint or typecheck errors in this file

### Task 4: Audit propfirm catalogue widget and widget registry
**Description**: Audit app/[locale]/dashboard/components/widgets/propfirm-catalogue-widget.tsx for URL slug bug and audit all 26 widgets in app/[locale]/dashboard/config/widget-registry.tsx for issues
**Delegation Recommendation**:
- Category: `widget` - Specific focus on widget components and registry
- Skills: [`widget`, `frontend-ui-ux`] - For widget-specific knowledge and UI consistency
**Skills Evaluation**:
- ✅ INCLUDED `widget`: Domain-specific skill for widget components
- ✅ INCLUDED `frontend-ui-ux`: For checking UI consistency and potential bugs
- ❌ OMITTED `dev-browser`: No external website automation needed
- ❌ OMITTED `webapp-testing`: Testing will occur in Task 6
**Depends On**: None
**Acceptance Criteria**:
- propfirm-catalogue-widget.tsx has no URL slug bug
- All 26 widgets in widget-registry.tsx audited for issues
- Any widget issues documented for follow-up fixes
- No lint errors in widget files

### Task 5: Audit Next.js performance
**Description**: Audit context/data-provider.tsx (2219 lines) for re-render issues, verify lib/performance/next-config.ts optimizations are working, check sync contexts
**Delegation Recommendation**:
- Category: `deep` - Requires goal-oriented autonomous problem-solving for performance optimization
- Skills: [`subagent-driven-development`, `executing-plans`] - For executing implementation plans with independent tasks and planning
**Skills Evaluation**:
- ✅ INCLUDED `subagent-driven-development`: For executing performance audit plan
- ✅ INCLUDED `executing-plans`: For planning and executing optimization work
- ❌ OMITTED `frontend-design`: Not primarily UI-focused, though UI may be affected
- ❌ OMITTED `webapp-testing': Testing will occur in Task 6
**Depends On**: None
**Acceptance Criteria**:
- data-provider.tsx audited for unnecessary re-renders
- next-config.ts optimizations verified as active
- sync contexts checked for unnecessary work
- Performance audit findings documented
- No degradation in existing functionality

### Task 6: Verification
**Description**: Run npm run typecheck, npm run lint, npm run build after all changes to verify correctness
**Delegation Recommendation**:
- Category: `quick` - Running verification commands is trivial
- Skills: [`using-superpowers`] - For knowing how to find and use skills (though running commands is basic, this ensures proper tool usage)
**Skills Evaluation**:
- ✅ INCLUDED `using-superpowers`: Ensures proper command execution and tool usage
- ❌ OMITTED `dev-browser`: No browser automation needed
- ❌ OMITTED `webapp-testing': Though related to testing, we're running build/lint/typecheck
**Depends On**: Task 1, Task 2, Task 3, Task 4, Task 5
**Acceptance Criteria**:
- npm run typecheck passes with 0 errors
- npm run lint passes with 0 errors (warnings acceptable as baseline)
- npm run build passes successfully
- Application starts without errors in development mode

## Commit Strategy
Atomic commits per task:
1. Task 1: "fix: admin propfirm page JSX error - remove extra </span>"
2. Task 2: "feat: propfirm landing redesign - add platform/payout filter chips and comparison feature"
3. Task 3: "feat: firm detail page fixes - remove hardcoded data, fix styling, use real data"
4. Task 4: "feat: widget audit - fix propfirm-catalogue-widget URL slug bug, audit all 26 widgets"
5. Task 5: "perf: Next.js performance audit - optimize data-provider, verify next-config, check sync contexts"
6. Task 6: "chore: verification - run typecheck, lint, build after all changes"

Each commit will be made only after task completion and verification of acceptance criteria.

## Success Criteria
- All 6 tasks completed and committed
- Verification step (Task 6) passes:
  - typecheck: 0 errors
  - lint: 0 errors (baseline warnings acceptable)
  - build: successful compilation
- No regressions in existing functionality
- All acceptance criteria for individual tasks met
- Ready for production deployment after final verification
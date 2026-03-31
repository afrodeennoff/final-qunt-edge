# Session Memory (2026-03-31)

## Current Session: Dashboard backend id-resolution fix + widget data recovery (2026-04-01)

### Accomplishments
- Fixed cross-module user-id resolution drift that could produce empty dashboard widget data:
  - `server/trades.ts` `resolveWritableUserId` now prefers divergent `auth_user_id` mapping before raw `id`.
  - `server/team-membership.ts` `resolveTeamUserId` now uses the same precedence.
- Added regression coverage in `tests/server/user-id-resolution.test.ts` for:
  - divergent `id`/`auth_user_id` rows,
  - non-divergent fallback behavior,
  - missing-user failure path.
- Retained sidebar/layout/data fail-soft changes in current working tree:
  - `components/ui/unified-sidebar.tsx` desktop auto-expand guard for collapsed state.
  - `context/data-provider.tsx` layout fallback seeding, one-shot force trades refetch on empty load, cached snapshot preservation on load failure, normalized layout save ids.
  - `server/auth.ts` `getDatabaseUserId` preference for divergent `auth_user_id`.

### Verification
- `npx vitest run tests/server/user-id-resolution.test.ts tests/performance/trades-mutation-batch.test.ts tests/server/groups-delete.test.ts tests/server/rithmic-sync-actions.test.ts` passes.
- `./node_modules/.bin/eslint server/trades.ts server/team-membership.ts context/data-provider.tsx components/ui/unified-sidebar.tsx tests/server/user-id-resolution.test.ts` passes with warnings only (0 errors).
- `npm run -s typecheck` passes.

### Blockers
- Project-wide eslint on `server/auth.ts` still reports pre-existing `no-explicit-any` errors not introduced in this fix.
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`).

## Current Session: Dashboard/Teams sidebar reliability + widget shell rescue (2026-04-01)

### Accomplishments
- Fixed desktop/mobile sidebar mode detection in `hooks/use-mobile.tsx`:
  - switched from `window.innerWidth` snapshots to `MediaQueryList.matches` as source of truth.
  - prevents false mobile classification that hid sidebar behind the trigger on desktop.
- Removed dashboard sidebar lazy-loading fallback in `app/[locale]/dashboard/layout.tsx`:
  - replaced dynamic import placeholder rail with direct `DashboardSidebar` import.
  - avoids persistent “thin left rail / no sidebar navigation” states when sidebar chunk loading stalls.
- Hardened dashboard layout bootstrap in `context/data-provider.tsx`:
  - when `getDashboardLayout` rejects, provider now logs the failure and seeds a default per-user layout instead of leaving `dashboardLayout` null.
  - prevents `widget-canvas` from sticking in loading state on layout-fetch failures.
- Unified mobile-mode source for dashboard layout logic:
  - `dashboard-context.tsx` now uses `useDashboardIsMobile()` (provider state) instead of `useUserStore().isMobile`.
  - `widget-canvas.tsx` now uses `useDataIsMobile()` for active layout mode selection.
  - `DataProvider` now uses `MOBILE_BREAKPOINT` for media-query parity and syncs store `isMobile` from provider state.
- Removed `any`-based translation fallbacks in widget empty-layout UI using typed `translate` adapter.
- Re-checked production logs for dashboard/team paths and confirmed sampled runtime status health (200/303 only in queried windows, no 4xx/5xx in those samples).

### Verification
- `./node_modules/.bin/eslint hooks/use-mobile.tsx app/[locale]/dashboard/layout.tsx` passes.
- `./node_modules/.bin/eslint context/data-provider.tsx app/[locale]/dashboard/dashboard-context.tsx app/[locale]/dashboard/components/widget-canvas.tsx app/[locale]/dashboard/layout.tsx hooks/use-mobile.tsx` passes with warnings only (0 errors).
- `npm run -s typecheck` passes.
- Vercel runtime logs queried for dashboard/teams paths show successful responses in sampled windows.

### Blockers
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`).

## Current Session: `.env.example` runtime env sync (2026-03-31)

### Accomplishments
- Compared runtime env references in `app/`, `server/`, `lib/`, `components/`, `context/`, `store/`, and `scripts/` against `.env.example`.
- Added missing placeholders and aliases for UI v2, health details, onboarding/tutorial URLs, broker/import endpoints, `NEXT_PUBLIC_VERCEL_URL`, service-worker/cache/Sentry flags, Supabase legacy aliases, and `TOKEN_CRYPTO_KEY_VERSION`.
- Updated `tasks/todo.md` with a dedicated sync task and review note.

### Verification
- Targeted presence check for all added env keys passed.
- `.env.example` now contains the runtime keys referenced by the updated code paths.

### Blockers
- `/init` is unavailable in this shell (`zsh: no such file or directory: /init`)

## Current Session: Bun package-manager optimization sweep (2026-03-30 night)

### Accomplishments
- Completed a web-researched Bun optimization pass using official Bun + Next.js docs.
- Replaced `bun install --frozen-lockfile` with `bun ci` in:
  - `vercel.json` install command
  - `Dockerfile.bun` deps stage
  - `scripts/vps-deploy-bun.sh`
- Added explicit Bun pack script:
  - `package.json` → `"pack:bun": "bun pm pack"`
- Migrated GitHub workflow install/execute paths to Bun-first:
  - `.github/workflows/ci.yml` now sets up Bun (`oven-sh/setup-bun@v2`), installs via `bun ci`, and runs validation/perf/test commands via `bun run` / `bunx`.
  - `.github/workflows/widget-policy-compliance.yml` now sets up Bun in all relevant jobs, installs via `bun ci`, and runs policy/test scripts via `bun run`.

### Verification
- `node -e` JSON parse check for `package.json` and `vercel.json` passed.
- `ruby -e "require 'yaml'; YAML.load_file(...)"` parse check for both workflow files passed.
- `bash -n scripts/vps-deploy-bun.sh` passed.
- Grep check confirms touched workflow files no longer use `npm ci`/`npm run` for primary execution paths.

### Blockers
- Bun runtime is not installed in this shell (`bun --version` -> command not found), so direct execution of Bun commands was not possible locally.

## Current Session: Home redesign completion + auth fix + React error #130 (2026-03-30 evening)

### Accomplishments
- **Home redesign Waves 0-4**: All 4 waves completed, all 11 components written/rewritten, 8 orphan files deleted, TypeScript zero errors
- **Auth graceful degradation**: Extended Supabase env check to all 5 auth methods (signInWithPassword, signInWithEmail, verifyOtp, signInWithDiscord, signInWithGoogle, signUpWithPasswordAction). Magic link, OAuth, OTP now return graceful errors instead of HTTP 500.
- **React error #130 fix**: `ComparisonSection.tsx` used `<motion.tr>` which is undefined in framer-motion v11. Fixed by using `const MotionTr = motion('tr')` factory pattern + added `'use client'` directive. Playwright confirmed zero errors after fix.
- **Dead import cleanup**: Removed 7 unused static imports from `HomeContent.tsx` (only lazy dynamic versions were used). 0 ESLint errors.
- **Commits**: 8 new commits on v2 branch (6 home redesign + 1 auth extension + 1 motion.tr fix + 1 dead import cleanup)

### Key Files Modified
- `app/[locale]/(home)/components/ComparisonSection.tsx` — motion.tr → MotionTr + 'use client'
- `app/[locale]/(home)/components/HomeContent.tsx` — removed 7 dead static imports (59→52 lines)
- `app/[locale]/(home)/components/analysis-demo-chart.tsx` — verified exists
- `server/auth.ts` — 5 functions now check Supabase env vars before createClient()
- `app/[locale]/(authentication)/components/user-auth-form.tsx` — 4 handlers now show toast on error
- `proxy.ts` — logged-in user redirect adds ?already=signed-in param

### Verified Working
- Home page loads with zero React errors (Playwright)
- Auth form submits gracefully without HTTP 500 (Playwright)
- Prop firm data renders on home page
- `npm run -s typecheck` passes
- `npx eslint HomeContent.tsx` — 0 errors
- `npx eslint "app/[locale]/(home)/components/"*.tsx` — 0 errors, 4 pre-existing warnings (not our changes)
- **Local env blocker**: Dev server returns HTTP 500 on home pages because `.env.local` is missing Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). This is a local dev-only issue — the deployed app on Vercel has these env vars configured. Not a code issue.

---

## Current Session: Final task closeout — all pending items resolved (2026-03-30)

### Accomplishments
- Closed 5 already-complete tasks with verified checkboxes (community PII, semantic colors, CRUD state sync, format preview, edits summary)
- Cancelled 2 blocked tasks (TweakCN external dependency, Vercel deploy auth)
- Re-scoped delete ownership hardening: original gap analysis was incorrect (wrong function names, all functions already have userId filtering)
- Ran merged AI verification suite (typecheck passes)
- Fixed tag deletion N+1 pattern in `tag-widget.tsx` (replaced forEach+updateTrades loop with `deleteTagFromAllTrades` bulk SQL)
- Added IndexedDB cache invalidation after account deletion in `data-management-card.tsx`
- Added `:root` design token block mirroring `.dark` in `globals.css` (Tailwind v4 best practice)
- Extracted shadow base color `--shadow-base` CSS variable, replacing 16 raw `hsl(222.7751 100% 59.0196%)` instances
- Removed orphaned `:root` block inside `@layer base` (qe-surface tokens moved to main `:root`)
- Created 21 delete ownership regression tests in `tests/server/delete-ownership-regression.test.ts`

### Verification
- `npm run -s typecheck` passes
- Targeted `npx eslint` on all changed files: 0 errors
- `npx vitest run tests/server/delete-ownership-regression.test.ts`: 21/21 pass
- Pre-existing `npm run -s lint` ESLint plugin config issue (not caused by our changes)

### Changed Files
- `app/[locale]/dashboard/components/filters/tag-widget.tsx` — tag deletion N+1 fix
- `app/[locale]/dashboard/data/components/data-management/data-management-card.tsx` — IndexedDB cache clear
- `app/globals.css` — `:root` block + shadow token extraction
- `tests/server/delete-ownership-regression.test.ts` — new regression test suite
- `tasks/todo.md` — all checkboxes updated

### Blockers
- `/init` remains unavailable in this shell

## Previous Session: firm route recovery + deals hero navigation completion (2026-03-30)

### Accomplishments
- Fixed `app/[locale]/(landing)/firm/[slug]/page.tsx` to avoid hard `notFound()` failures for unresolved `/firm/*` requests.
- Added strict slug handling flow:
  - trim + direct DB slug lookup first,
  - verified profile alias/slug mapping fallback,
  - canonical slug redirect only when canonical DB firm exists,
  - unresolved fallback redirect to `/${locale}/propfirms`.
- Updated unresolved-firm metadata fallback to prop-firm catalogue context and localized breadcrumb URLs.
- Added `/firm` to `PUBLIC_DOCUMENT_PATH_PREFIXES` in `proxy.ts`.
- Added deals hero quick links in `app/[locale]/(landing)/deals/components/deals-experience.tsx` for:
  - `/deals/compare`
  - `/deals/guides`
  - `/deals/calculator`
  - `/deals/faq`

### Verification
- `npx eslint 'app/[locale]/(landing)/deals/components/deals-experience.tsx' 'app/[locale]/(landing)/firm/[slug]/page.tsx' proxy.ts` passes (warnings only in proxy complexity, no errors).
- `npm run -s typecheck` passes.
- Local smoke checks on `http://127.0.0.1:4011`:
  - `/en/firm/topstep` handled,
  - `/en/firm/apex` handled,
  - `/en/firm/unknown-firm` handled,
  with unresolved/no-data paths degrading via redirect to `/${locale}/propfirms` (no route crash).

### Blockers
- Local environment has no configured database connection, so full firm detail rendering cannot be validated against live DB rows in this shell.
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`).

## Current Session: console.error → console.warn migration verification (2026-03-30)

### Accomplishments
- Verified all 6 landing pages already use `console.warn` instead of `console.error`
- Confirmed no `console.error` violations exist in public-facing landing pages
- Ran comprehensive lint check on all target files (deals/page.tsx, support/page-client.tsx, support-form.tsx, _updates/[slug]/page.tsx, firm-reviews-section.tsx, error.tsx)

### Verification
- All files already using `console.warn` (2 occurrences in deals/page.tsx, 1 in support/page-client.tsx, 2 in support-form.tsx, 3 in _updates/[slug]/page.tsx, 3 in firm-reviews-section.tsx, 1 in error.tsx)
- `npx eslint` on all 6 files shows only complexity warnings (0 errors)
- No `console.error` patterns found via grep

### Blockers
- None — work already completed

## Current Session: Vercel build rescue — home TSX corruption + `Card` symbol failure (2026-03-29)

## Current Session: Vercel build rescue — home TSX corruption + `Card` symbol failure (2026-03-29)

### Accomplishments
- Reproduced the deployment-failing state on commit `c2d1856` and confirmed the initially reported TypeScript blocker in `app/[locale]/(home)/components/AIFuturesSection.tsx` (`Cannot find name 'Card'`).
- Traced full error chain after the first fix and identified broader corruption in home TSX files: partial `CardV2` migrations stripped opening JSX delimiters (`<`) and left truncated closing structures.
- Restored the affected home components to the last known-good TSX structure:
  - `app/[locale]/(home)/components/AIFuturesSection.tsx`
  - `app/[locale]/(home)/components/ComparisonSection.tsx`
  - `app/[locale]/(home)/components/DealsPreview.tsx`
  - `app/[locale]/(home)/components/FAQSection.tsx`
  - `app/[locale]/(home)/components/FeaturedFirms.tsx`
  - `app/[locale]/(home)/components/LeaderboardPreview.tsx`
  - `app/[locale]/(home)/components/OnboardingJourney.tsx`
  - `app/[locale]/(home)/components/ProofStrip.tsx`
  - `app/[locale]/(home)/components/UserReviews.tsx`
  - `app/[locale]/(home)/components/WhyChooseUs.tsx`

### Verification
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end on the patched workspace.

### Blockers
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`), so mandatory sync cannot be executed here.

## Current Session: Full mobile optimization pass across App Router surfaces (2026-03-29)

### Accomplishments
- Completed an audit-first mobile overflow scan across `app/**` and `components/**`, then prioritized shared primitives and high-traffic route surfaces.
- Hardened shared table behavior in `components/ui/table.tsx` for narrow screens:
  - added `overscroll-x-contain` to the table container,
  - reduced default table head/cell density on small breakpoints (`h-10` / `px-3` / `text-xs` on mobile; desktop density preserved at `sm+`).
- Fixed a mobile functional gap in deals compare:
  - `app/[locale]/(landing)/deals/compare/components/firm-comparison-grid.tsx` now renders card-based comparison content on mobile/tablet (`lg:hidden`) and keeps wide table only on `lg+`.
  - `app/[locale]/(landing)/deals/compare/page.tsx` stats strip now uses `grid-cols-2 sm:grid-cols-3` to avoid tiny three-column compression at 320 widths.
- Added mobile-first leaderboard rendering in `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`:
  - new mobile skeleton cards (`lg:hidden`),
  - new mobile leaderboard entry cards with key metrics and profile CTA (`lg:hidden`),
  - existing wide table retained for `lg+`.
- Added mobile-first comparison rendering in `app/[locale]/(home)/components/ComparisonSection.tsx`:
  - card-based row presentation on mobile (`md:hidden`),
  - existing wide comparison table retained for `md+`.
- Reduced dashboard header crowding on mobile in `app/[locale]/dashboard/components/dashboard-header.tsx`:
  - tightened spacing and text tracking on narrow widths,
  - reduced sidebar trigger footprint on mobile,
  - moved widget controls into a dedicated mobile row to prevent top-row squeeze.
- Fixed home CTA button squeeze in `app/[locale]/(home)/components/CTA.tsx` by replacing fixed-width behavior with responsive full-width mobile sizing.
- Improved home dashboard preview responsiveness in `app/[locale]/(home)/components/DashboardPreview.tsx`:
  - single-column stat cards on mobile,
  - compact paddings,
  - URL chip truncation/hiding on small widths,
  - narrower chart bars and tighter trade-row spacing.

### Verification
- `npx eslint 'components/ui/table.tsx' 'app/[locale]/(landing)/deals/compare/components/firm-comparison-grid.tsx' 'app/[locale]/(landing)/deals/compare/page.tsx' 'app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx' 'app/[locale]/(home)/components/ComparisonSection.tsx' 'app/[locale]/dashboard/components/dashboard-header.tsx' 'app/[locale]/(home)/components/CTA.tsx' 'app/[locale]/(home)/components/DashboardPreview.tsx'` passes with warnings only (no errors).
- `npm run -s typecheck` passes (transient `.next/types/cache-life.d.ts` ENOENT occurred during route-types generation; wrapper retry succeeded).
- `npm run build` passes end-to-end.

### Blockers
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`), so mandatory sync cannot be executed here.

## Current Session: SEO + public API classification consistency pass (2026-03-29)

### Accomplishments
- Fixed public API route classification in `proxy.ts`:
  - moved `/api/og` to an exact segment-safe public path entry (no trailing-slash mismatch),
  - explicitly marked `/api/email/unsubscribe` and `/api/csp-report` as public API routes.
- Switched public API matching to `pathMatchesPrefix` to eliminate exact-vs-prefix drift in route classification.
- Standardized metadata/hreflang behavior on remaining public pages:
  - `app/[locale]/(landing)/community/page.tsx` now uses `generateMetadata` + `buildPublicMetadata`.
  - `app/[locale]/(landing)/docs/page.tsx` now uses locale-aware metadata helpers and refreshed docs copy.
  - `app/[locale]/(landing)/firm/[slug]/page.tsx` now emits locale alternates via `getLocaleAlternates`.
  - `app/[locale]/teams/(landing)/page.tsx` now uses shared `buildPublicMetadata`.
- Completed structured-data parity on deals landing:
  - added `SoftwareApplication` schema,
  - added conditional `FAQPage` schema from live FAQ data.
- Updated deployment docs to reference `proxy.ts` (not `middleware.ts`) for security-header interception.

### Verification
- `npx eslint proxy.ts 'app/[locale]/(landing)/community/page.tsx' 'app/[locale]/(landing)/docs/page.tsx' 'app/[locale]/(landing)/firm/[slug]/page.tsx' 'app/[locale]/teams/(landing)/page.tsx' 'app/[locale]/(landing)/deals/page.tsx'` passes (warnings only).
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end.

### Blockers
- `/init` remains unavailable in this shell (`zsh: no such file or directory: /init`), so mandatory sync cannot be executed here.

## Current Session: Vercel prerender rescue (`PropFirm` table missing) (2026-03-29)

### Accomplishments
- Reproduced root cause from Vercel logs: prerender for `/fr` failed via shared marketing layout banner path (`RollingAdBanner -> listPropFirmBannerItems -> prisma.propFirm.findMany`) when database schema lacked `public.PropFirm` (`P2021`).
- Hardened `server/prop-firms.ts` read helpers with fail-soft behavior for schema/connection mismatch:
  - added unavailable-error classifier (`isPropFirmDataUnavailableError`)
  - added structured fallback logging (`logPropFirmFallback`)
  - `listPropFirms` now returns safe fallback rows on unavailable schema/db errors
  - `listPropFirmBannerItems` now returns safe fallback banner items on unavailable schema/db errors
  - `getPropFirmBySlug` now returns `null` on unavailable schema/db errors
- Follow-up hardening from second Vercel run:
  - expanded unavailable detection to include connection timeout signatures
  - added schema-mismatch cooldown fallback (`withPrismaSchemaMismatchFallback`) for banner/slug read paths to avoid repeated failing DB calls during prerender.
  - published follow-up fix commit `2c1f321` to `origin/v2`.
- Updated living docs and workflow notes for this failure mode in:
  - `tasks/todo.md`
  - `tasks/lessons.md`
  - `ENGINEERING_LOG.md`
  - `AGENTS.md`

### Verification
- `npx eslint server/prop-firms.ts` passes (warning-only baseline).
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end.
- Commit/publish: `460d55c` pushed to `origin/v2`.

### Blockers
- `/init` command remains unavailable in this shell (`zsh: no such file or directory: /init`), so mandatory sync step cannot be executed here.

## Current Session: Thread closeout + publish (2026-03-29)

### Accomplishments
- Completed full closeout pass for this thread:
  - reconciled missing thread workstreams into `ENGINEERING_LOG.md`
  - kept `tasks/todo.md` and `tasks/memory.md` aligned with final outcomes.
- Ran final verification before publish:
  - `npm run -s typecheck`
  - `npm run build`
- Published all staged thread changes in one consolidated commit:
  - commit `b703d65`
  - message: `feat: finalize SEO, auth hardening, and UI consistency sweep`
  - pushed to `origin/v2` successfully.

### Verification
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end (with known non-fatal local warnings: missing `RESEND_API_KEY`, DB-unconfigured degraded health logs, native/localstorage warnings).
- `git push origin v2` succeeds and creates remote branch `v2`.

### Blockers
- Mandatory `/init` command is not available in this shell environment (`zsh: no such file or directory: /init`), so context sync step cannot be executed here.

## Current Session: Production rescue hardening sweep (2026-03-29)

### Accomplishments
- Removed fabricated catalogue dev payloads from `app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue.ts`; the action now only returns DB-backed stats or empty results.
- Removed synthetic fallback business payloads from `server/deals.ts`:
  - no fallback `UnifiedFirm` generation from config/profile defaults when DB is unavailable
  - no fallback deal generation from spotlight promo text
  - DB-unavailable/error paths now return empty data (`[]`/`null`) instead of invented stats/coupons/fees.
- Hardened API auth:
  - Added shared route-level auth guard `app/api/deals/_auth.ts` (Supabase session or verified bearer token).
  - Enforced route-level auth in:
    - `app/api/deals/route.ts`
    - `app/api/deals/unified/route.ts`
    - `app/api/deals/firms/[id]/route.ts`
    - `app/api/deals/firms/[id]/deals/route.ts`
  - Replaced proxy private API presence-only bearer check with actual Supabase auth validation in `proxy.ts`, while preserving explicit bypass for custom token routes (`/api/mt5/*`, `/api/thor/*`, `/api/etp/*`) that validate in-route.
  - Fixed proxy public/private API classification inconsistency by classifying via `isPublicApiRoute` and restricting public cache headers to `PUBLIC_READ_API_PATHS`.
- Fixed firm reviews correctness:
  - `server/firm-reviews.ts` now returns paginated review payloads with real `total`/`totalPages`.
  - `highest`/`lowest` sorting now uses rating-first ordering with createdAt tie-break.
  - `firm-reviews-section.tsx` now consumes paginated payload + `getFirmReviewStats` for accurate totals/distribution and pagination UI.
- Fixed firm detail consistency in `app/[locale]/(landing)/firm/[slug]/page-client.tsx`:
  - removed Topstep-only hardcoded source enrichment
  - aligned visible review counts to approved-review stats
  - aligned coupon counts/tab labels/trust metrics to active coupon collections.
- Updated `server/firm-coupons.ts` to exclude expired coupons (`expiresAt >= now OR null`) and sort by challenge fee + discount.
- Updated deals spotlight section in `app/[locale]/(landing)/deals/components/deals-experience.tsx` to remove `w-screen` overflow pattern and keep it container-safe.
- Updated deals API tests for the new route-level auth guard:
  - `tests/api/deals-active.test.ts`
  - `tests/api/deals-unified.test.ts`.

### Verification
- `npx vitest run tests/api/deals-active.test.ts tests/api/deals-unified.test.ts` passes (8/8).
- Targeted `eslint` on all touched rescue files passes with warnings only (no errors).
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end.
- `eslint --print-config` confirms `react` and `react-hooks` plugin/rule loading is valid (no startup mismatch).

### Blockers
- Build-time environment warnings remain unchanged:
  - `RESEND_API_KEY` missing
  - local DB not configured (health route reports degraded `database-unconfigured`)
  - local native/tooling warnings (`--localstorage-file`, duplicate native symbol warning from local deps).

## Current Session: Full App Router SEO + Crawlability + Deployment Hardening (2026-03-29)

### Accomplishments
- Added a shared SEO foundation in `lib/seo.ts`:
  - locale canonical/hreflang helpers
  - reusable public metadata builder
  - JSON-LD builders for `Organization`, `SoftwareApplication`, `FAQPage`, and `BreadcrumbList`
- Implemented crawl/discovery surfaces:
  - `app/robots.ts` tightened private-route disallow rules while preserving public crawl access
  - `app/sitemap.ts` expanded public route coverage and included `/best-trading-journal`
  - `app/llms.txt/route.ts` added as root machine-readable discovery text route
- Added new intent page: `app/[locale]/(landing)/best-trading-journal/page.tsx` with:
  - intent-targeted hero/copy
  - spreadsheet/manual comparison
  - feature evidence section (existing capabilities only)
  - trust section backed by internal deal overview data
  - FAQ + CTA flow to onboarding/deals/propfirms
  - full JSON-LD block set
- Added internal links to the new intent route from:
  - `app/[locale]/(home)/components/Hero.tsx`
  - `app/[locale]/(landing)/deals/components/deals-experience.tsx`
  - `app/[locale]/(landing)/propfirms/components/catalogue-experience.tsx`
- Standardized metadata/canonical/hreflang and schema across key public pages (`home`, `deals`, `deals/faq`, `faq`, `propfirms`, `prop-firm-deals`, `blogs`, `updates`, `newsletter`) and fixed stale domain/brand drift in updates/blog surfaces.
- Hardened deployment configuration:
  - `vercel.json` install command now uses `bun install --frozen-lockfile`
  - `package.json` now uses `npm run vps:deploy` as one-command VPS deploy entry and keeps `vps:deploy:npm` fallback
  - `scripts/vps-deploy-bun.sh` now performs deterministic PM2 restart/start logic plus fail-fast retrying health checks
  - `docs/DEPLOYMENT_CHECKLIST.md` updated for Bun-first + fallback workflows
  - `ecosystem.config.cjs` confirmed valid PM2 config
- Build reliability hardening:
  - `scripts/robust-next-build.mjs` now retries when `.next/server/proxy.js` artifact ENOENT races occur.

### Verification
- `npm run -s typecheck` passes.
- `npm run build` passes end-to-end after hardening.
- `npx eslint` on SEO/deploy touched files passes with warnings only (no errors).
- Runtime validation from `next start`:
  - `/robots.txt`, `/sitemap.xml`, `/llms.txt` serve expected content
  - `/en/best-trading-journal` and `/fr/best-trading-journal` return `200`
  - canonical/hreflang entries are emitted for locale variants
  - JSON-LD scripts parse successfully and include required schema types
- shadcn MCP audit checklist executed (`get_audit_checklist`).

### Blockers
- Bun runtime is not installed in this local machine (`bun: command not found`), so direct local execution of Bun commands could not be empirically run here despite Bun-first config being wired for Vercel/VPS.

## Current Session: Runtime UI token drift cleanup (2026-03-29)

### Accomplishments
- Completed a runtime UI scan and removed hardcoded `white/black/gray/zinc` styling from the highest-impact app surfaces.
- Refactored the largest hotspots:
  - `app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section.tsx`
  - `app/[locale]/admin/reviews/page.tsx`
  - `app/[locale]/(landing)/deals/components/deals-experience.tsx`
- Standardized additional shared/runtime components to semantic/v2 tokens:
  - `components/ui/button.tsx`
  - `components/ui/card.tsx`
  - `components/ui/micro-interactions.tsx`
  - `components/ui/unified-sidebar.tsx`
  - `components/tiptap-editor.tsx`
  - `components/referral-button.tsx`
  - `components/onboarding-modal.tsx`
  - `components/animation/spring-button.tsx`
  - `app/[locale]/(landing)/trader/[slug]/privacy-toggle.tsx`
  - `app/[locale]/(home)/components/Navigation.tsx`
  - `app/[locale]/(home)/components/Footer.tsx`
  - `app/[locale]/(landing)/firm/[slug]/page-client.tsx`
- Removed one lint error by deleting a `console.info` debug block from sidebar navigation click handling.

### Verification
- Runtime drift scan now reports only email templates:
  - `rg -n --glob '*.{ts,tsx}' "(text|bg|border)-(white|black|gray|neutral|zinc)(/|\\b)|white/|black/|white\\[|black\\[|gray-" app components`
- Targeted lint check across all touched files passes with warnings only (no errors).
- `npm run -s typecheck` passes.

### Blockers
- Remaining hardcoded color class usage is isolated to `components/emails/**`; left unchanged in this pass due likely email-client styling constraints.

## Current Session: Deals Spotlight UI (2026-03-29)

### Accomplishments
- Added a new featured spotlight carousel to `app/[locale]/(landing)/deals/components/deals-experience.tsx` that matches the requested visual style (dark stage, prominent center card, side previews, arrow controls, dot navigation).
- Wired the spotlight section to live filtered deals data via `getSpotlightDeals(filteredDeals)` (sorted by highest discount).
- Preserved existing conversion behavior:
  - copy coupon action uses the existing `onCopyCode` flow
  - CTA opens `claimUrl` externally when present, otherwise routes to `/${locale}/firm/${firmSlug}`
- Completed a follow-up visual tuning pass to match the reference closer:
  - switched spotlight styling to marketing dark tokens (`--mk-*`) for cleaner contrast
  - updated accent treatment to lime-toned (`--chart-3`) controls, copy, CTA, and indicators
  - tightened spacing/scale in the headline and center card composition
- Completed an exact-match composition pass:
  - plain chevron controls (no circular chrome), no bottom dot controls
  - larger rounded center card with dashed vertical divider and stronger black stage
  - left panel uses mono-styled firm name + larger orb, right panel uses centered promo stack + large lime pill CTA
  - side previews converted to faded full-card silhouettes behind the active card
- Completed a final screenshot-alignment refinement pass:
  - made the spotlight stage full-viewport width (`w-screen`) to match the reference framing
  - fixed accent fallback by replacing custom lime token usage with the existing working `--chart-3` token
  - adjusted typography scales so large discounts (e.g. `101% Off`) stay on one line
  - softened and pushed side teaser cards further out to reduce visual clutter and keep center-card focus

### Verification
- `npx eslint app/[locale]/(landing)/deals/components/deals-experience.tsx` passes.
- `npm run typecheck` passes.
- Browser verification screenshot captured via Playwright: `/tmp/deals-spotlight-now-3.png`.

### Blockers
- None.

## Current Session: Build Rescue Continuation (Prerender + Admin/Auth Stabilization)

### Accomplishments
- Eliminated updates-route prerender clock issues by:
  - replacing runtime MDX fallback timestamps with a deterministic ISO constant in `lib/mdx.ts`
  - removing `rehype-pretty-code` from the server MDX pipeline used by updates pages
- Fixed admin prerender crypto failures by:
  - making `assertAdminAccess` / `requireUser` / `requireAdmin` request-id generation lazy in `server/authz.ts` (no eager `crypto.randomUUID()` at function invocation)
  - adding `await connection()` boundary in `app/[locale]/admin/coupons/page.tsx`
- Reduced noisy false-positive build logs by handling known prerender interruption errors as expected auth-context bailouts in:
  - `app/api/admin/reports/route.ts`
  - `app/api/behavior/insights/route.ts`
- Hardened additional build-time noisy APIs:
  - `app/api/deals/route.ts` and `app/api/deals/unified/route.ts` now prefer `nextUrl` when available and handle prerender interruption digests without error-level logging.
  - `app/api/email/unsubscribe/route.ts` now avoids direct `request.url` dependency during prerender and handles interruption digests as non-fatal invalid-link responses.
  - `app/[locale]/(landing)/propfirms/actions/get-propfirm-catalogue.ts` now short-circuits when DB is unconfigured to avoid Prisma proxy stack noise.
  - `app/api/health/route.ts` now reports unconfigured DB state as degraded info (`database-unconfigured`) instead of warning-level unhealthy noise.
- Executed shadcn MCP workflow artifacts:
  - registry discovery (`@shadcn`)
  - component search (`sidebar`)
  - usage example retrieval (`sidebar-demo`)
  - add command retrieval (`npx shadcn@latest add @shadcn/sidebar`)
  - audit checklist run

### Verification
- `npm run build` passes.
- `npm run typecheck` passes.
- Targeted eslint on touched files passes with warnings only (complexity warnings in `server/authz.ts`).
- Targeted route tests pass:
  - `tests/api/deals-active.test.ts`
  - `tests/api/deals-unified.test.ts`
  - `tests/api/unsubscribe-route.test.ts`

### Remaining Environment Warnings
- `RESEND_API_KEY` missing in local env during build.
- Local database is not configured (`POSTGRES_*`/`DATABASE_URL` missing); health now reports this as degraded (`database-unconfigured`) during build/export.
- Node/native warning noise remains during build (`--localstorage-file` path warning and duplicate `GNotificationCenterDelegate` symbol from native deps).

## Current Session: Cache Components + Support Model + Landing Sweep

### Accomplishments
- Migrated server read helpers to cache components (`use cache`, `cacheLife`, `cacheTag`) and switched invalidation paths to `updateTag`.
- Synced the support UI and `/api/ai/support` with the shared model source of truth in `lib/ai/support-models.ts`.
- Fixed landing/home regressions: pricing toggle behavior, invalid interactive nesting, broken query navigation, and unnecessary client directives.
- Verified `npm run typecheck` successfully and `npx eslint` on touched TS/TSX files with warnings only.

### Codebase State
- Cache-component migration is in place for the touched server read paths.
- Support model ids are now centralized in `lib/ai/support-models.ts`.
- The landing/home surfaces now use the shared V2 button patterns and corrected route handling.

### Blockers
- `npm run build` now gets past Prisma sync, but still fails during prerender on `"/[locale]/authentication"` with `Uncached data was accessed outside of <Suspense>` even after adding locale loading boundaries, a no-SSR auth layout shell, and `connection()` calls.

## Last Session: Design System Refactoring — Hex, Border-Radius, HSL Token Cleanup

### Accomplishments
- **Hex color → CSS variable**: 14+ files across all component groups. Zero hardcoded hex colors in `app/[locale]/` TSX files.
- **Border-radius → Tailwind scale**: 22+ files standardized. `rounded-[Nrem]` / `rounded-[Npx]` → `rounded-2xl`, `rounded-xl`, `rounded-sm`, `rounded-3xl`.
- **Raw HSL → semantic tokens**: ~95 patterns replaced across (home) and (landing) components.
  - `bg-[hsl(var(--primary)/0.08)]` → `bg-primary/10`
  - `border-[hsl(var(--primary)/0.35)]` → `border-primary/35`
  - `text-[hsl(var(--primary))]` → `text-primary`
  - `bg-[hsl(var(--foreground)/0.04)]` → `bg-foreground/5`
  - `via-[hsl(var(--primary-foreground)/0.2)]` → `via-primary-foreground/20`
- **Preserved correctly**: `--mk-*` tokens (marketing surface, no semantic aliases), `--chart-*` tokens (chart-specific).
- **Verified**: 0 TypeScript errors, 0 ESLint errors on modified files, Oracle-verified complete.
- **All 17 component groups audited**: `(auth)`, `(home)`, `(landing)`, `community`, `deals`, `deals/compare`, `deals/calculator`, `deals/guides`, `firm/[slug]`, `leaderboard`, `prop-firm-deals`, `propfirms`, `support`, `admin`, `embed`, `teams`, `teams/user-equity` — all clean.

### Codebase State
- Design system tokens: `--primary`, `--secondary`, `--foreground`, `--border`, `--card`, `--mk-*`, `--chart-*`
- V1 semantic tokens aliased to V2 oklch in `app/globals.css`
- Font tokens: `--home-display`, `--home-copy` added
- Component imports: V2 components (CardV2, ButtonV2, BadgeV2) used throughout

### Key Files Changed
- `app/[locale]/(home)/components/*` — 12 files (HSL→semantic)
- `app/[locale]/(landing)/components/*` — 5 files (hero, navbar, features, how-it-works, partners)
- `app/[locale]/(landing)/deals/_components/public-flow-shell.tsx`
- `app/[locale]/shared/[slug]/shared-page-client.tsx`
- `app/[locale]/dashboard/components/navbar.tsx` (border-radius)
- `app/[locale]/dashboard/components/daily-summary-modal.tsx` (border-radius)
- `app/[locale]/admin/actions/weekly-recap.ts` (hex→HSL email template)
- `app/globals.css` (font tokens)

### Blockers
- None

---

## Current Session: Theme/Styling Drift Cleanup (2026-03-29)

### Accomplishments
- Replaced remaining hardcoded newsletter colors in `newsletter-audio-splitter.tsx` (`bg-white/5`, `border-white/10`, `text-white/60`) with semantic tokens.
- Cleaned stale font token references in `app/globals.css`:
  - `--font-geist`/`--font-inter` → `--font-sans`
  - `--font-ibm-mono` → `--font-mono`
- Replaced several literal hex values in `app/globals.css` with semantic variables for status dots, code highlight marker, line-number text, landing selection, and landing scrollbar colors.
- Removed a duplicate late-file `@layer base` block in `app/globals.css` (`*` + `body`) to keep base styles single-sourced.
- Simplified `context/theme-provider.tsx` to a fixed dark theme provider (removed dead localStorage/theme-toggle state machinery while preserving current dark-only behavior).
- Adjusted `app/layout.tsx` theme bootstrap script to keep dark class enforcement but remove localStorage writes; errors now log to console instead of failing silently.

### Verification
- `npx eslint app/layout.tsx context/theme-provider.tsx` passes.
- `npx eslint app/[locale]/admin/components/newsletter/newsletter-audio-player.tsx app/[locale]/admin/components/newsletter/newsletter-audio-splitter.tsx app/[locale]/dashboard/components/import/atas/atas-processor.tsx` reports pre-existing `atas-processor.tsx` issues (`no-explicit-any`, complexity, and react-hooks warnings/errors).
- `npx eslint app/[locale]/teams/components/user-equity/team-equity-grid-client.tsx app/[locale]/teams/join/page.tsx app/[locale]/(landing)/newsletter/page.tsx app/[locale]/(landing)/disclaimers/page.tsx app/[locale]/(home)/loading.tsx app/[locale]/(landing)/community/post/[id]/loading.tsx` reports pre-existing team-file lint debt (`no-explicit-any`, complexity, unused vars/imports, exhaustive-deps warning).

### Codebase State
- Theme remains dark-only at runtime.
- Semantic token migration advanced in admin newsletter and global utility styling.
- `tasks/todo.md` updated: Admin newsletter + ATAS task closed; Worker H color-token task closed with no remaining utility matches in target set; Tailwind semantic foundation review item marked complete.

### Blockers
- Existing lint debt in `atas-processor.tsx` and team pages prevents clean `eslint` on those target bundles.

---

## Previous Session: shadcn/ui v2 Migration — TypeScript Fixes + Tailwind Build Fix

### Accomplishments
- **Completed shadcn/ui v2 migration type fixes**: Resolved ~150+ TypeScript errors from the v1→v2 component migration
  - Added `ButtonV2` import to 14 dashboard/admin files using `<ButtonV2>` JSX without the import
  - Fixed `<ButtonV2>` → `<Button>` in 8 email template files (react-email uses `Button`, not shadcn)
  - Fixed `<ButtonV2>` → `<Button>` in `error-boundary.tsx` (only v1 Button imported)
  - Fixed `BadgeV2` variant `"destructive"` → `"error"` in 4 files
  - Fixed `Card` variant `"matte"` → `"flat"` in `admin/coupons/page.tsx`
  - Fixed `ComponentProps<typeof Badge>` → `BadgeV2` in ai-elements type exports
  - Fixed `</Card>` → `</CardV2>` closing tag in `atas-processor.tsx`
  - Removed unused `Badge` imports in `chain-of-thought.tsx`, `inline-citation.tsx`
  - Fixed duplicate import in `updates-navigation.tsx`
- **Fixed Tailwind v4 `@utility` nesting build error**: `@utility focus-ring` was inside `@layer base` (line 314-537) — moved it to top level after layer closes
- **TypeScript compilation**: `npm run typecheck` passes with 0 errors
- **Production build**: `npm run build` succeeds

### Codebase State
- shadcn v2 design system fully operational: `--v2-*` CSS tokens in `globals.css`, V2 components (CardV2, ButtonV2, BadgeV2, InputV2, etc.) working
- ~150+ files migrated to v2 components
- All TypeScript errors resolved
- Build passes cleanly

### Key Files
- `app/globals.css` — v2 tokens + `@theme inline` + `@utility` directives (no @utility inside @layer base)
- `components/ui/v2/*` — V2 component library
- Dashboard files: `tag-widget.tsx`, `bulk-edit-panel.tsx`, `widget-registry.tsx`, `day-tag-selector.tsx`, etc. — now correctly import ButtonV2
- Email templates: `welcome.tsx`, `black-friday.tsx`, etc. — use react-email Button

### Blockers
- None — all work complete

---

## Previous Session: Feature Flags Investigation + Tailwind Version Sync

### Accomplishments
- **Tailwind Version Sync**: Verified all Tailwind packages at 4.1.18 (already synced)
- **Feature Flags Investigation**: Completed full investigation of all 6 feature flags
  - Found `lib/feature-flags.ts` as single source of truth
  - `ENABLE_SKELETON_LOADING`: ACTIVE
  - `ENABLE_QUERY_CACHING`: ACTIVE
  - `ENABLE_DEFERRED_COMPUTATIONS`: DEAD
  - `ENABLE_LAZY_LOADING`: DEAD
  - `PERF_ROLLOUT_PCT`: CONTROL
  - `EMERGENCY_ROLLBACK`: SAFETY

### Blockers
- None

## Current Session: Dashboard Fix + Design Refinement — "fix the dashboard/* issue please" (2026-03-31)

### Accomplishments
- **Production-readiness fixes** (committed `867b0d7`, `6f0b164`):
  - ESLint config repaired: explicit plugin registrations, rule overrides
  - Vitest config fixed: `.opencode/**` excluded
  - 6 test suites fixed: leaderboard, theme-provider, sidebar-trigger, auto-save-service, setup
  - Auto-save service hardened: `getStorage()` duck-type validation for Node.js localStorage
  - HowItWorks.tsx fixed: missing closing `</div>` restored
- **Dashboard fixes**: 25 dashboard files verified clean (0 TypeScript, 0 ESLint errors, tests pass)
- **Design audit**: 5-parallel explore agents analyzed full dashboard codebase
- **V2 token design migration** (committed `c950030`, 38 files):
  - 15 chart files: all tooltips standardized to V2 token pattern
  - 8 statistics cards: migrated to V2 text tokens
  - 4 filter files: border/opacity unified to V2 tokens
  - 5 UI shell components: card, sidebar, unified-sidebar, badge-v2, widget-shell
  - 3 dashboard layout files: dashboard-header, dashboard-tab-shell, layout
  - Server fixes: auth.ts (fr@ locale detection), authz.ts (proper AuthzError re-throw), subscription-manager.ts (as any → SubscriptionEventType)
- **Oracle-verified production-ready**: TypeScript ✅, Tests ✅ (77 suites, 335 passed), Build ✅ (181 pages)

### Out-of-Scope / Reverted
- `prisma/schema.prisma` — stashed then dropped (breaking: FK change auth_user_id→id, PayoutStatus enum, Challenge model — requires migration)
- `server/layouts.ts` — reverted (cache tag rename `dashboard-${userId}` → `dashboard-layout-${userId}` would break cache invalidation; canonical tag is `dashboard-${userId}` per CACHE_TAGS.DASHBOARD_LAYOUT)
- `components/ui/chart.tsx` — restored to original (agents introduced build-only type error with explicit Recharts imports)

### Verification
- `npx tsc --noEmit`: 0 errors ✅
- `npm run test -- --run`: 77 suites, 335 passed ✅
- `node scripts/robust-next-build.mjs`: "✓ Compiled successfully in 23.2s", 181/181 pages ✅

### Commits
- `867b0d7` fix(production-readiness): repair ESLint, tests, and type safety
- `6f0b164` fix(dashboard): unify design tokens, explicit borders, and auth schema
- `c950030` refactor(dashboard): V2 token migration across charts, stats, filters, and shared UI

### Blockers
- None

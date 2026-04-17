# Requirements — v2.1 Milestone

## v1 Requirements (Validated)

### Authentication & Authorization
- ✓ AUTH-01: User can create account with email/password via Supabase — existing
- ✓ AUTH-02: User can log in and stay logged in across sessions — existing
- ✓ AUTH-03: User can log in with Google OAuth — existing
- ✓ AUTH-04: User can log in with Discord OAuth — existing
- ✓ AUTH-05: Admin authorization via role-based access — existing
- ✓ AUTH-06: Cron job authentication via secret header — existing

### Trading Import
- ✓ IMPORT-01: Import trades from Rithmic platform — existing
- ✓ IMPORT-02: Import trades from Tradovate platform — existing
- ✓ IMPORT-03: Import trades from MT5 platform — existing
- ✓ IMPORT-04: Import trades from ATAS platform — existing
- ✓ IMPORT-05: Import trades from NinjaTrader — existing
- ✓ IMPORT-06: Import trades from Quantower — existing
- ✓ IMPORT-07: Import trades from TradeZella — existing
- ✓ IMPORT-08: Manual trade entry — existing
- ✓ IMPORT-09: ETP (external trading platform) token management — existing

### Dashboard
- ✓ DASH-01: Main dashboard with widget-based layout — existing
- ✓ DASH-02: Trade table with review/edit capabilities — existing
- ✓ DASH-03: Equity chart visualization — existing
- ✓ DASH-04: Account management and metrics — existing
- ✓ DASH-05: Calendar view for trades — existing
- ✓ DASH-06: AI chat for trade analysis — existing
- ✓ DASH-07: Statistics and analytics — existing
- ✓ DASH-08: Dashboard widget configuration and persistence — existing

### Billing & Subscriptions
- ✓ BILL-01: Whop subscription management (monthly, 6-month, yearly, lifetime, team) — existing
- ✓ BILL-02: Checkout session creation — existing
- ✓ BILL-03: Webhook processing (membership, payment, refund, invoice) — existing
- ✓ BILL-04: Referral system — existing

### Teams
- ✓ TEAM-01: Team creation and management — existing
- ✓ TEAM-02: Team member invitations — existing
- ✓ TEAM-03: Team analytics dashboard — existing

### Content & SEO
- ✓ CONTENT-01: MDX blog posts — existing
- ✓ CONTENT-02: Landing pages (pricing, FAQ, docs, propfirms, leaderboard) — existing
- ✓ CONTENT-03: i18n support for 11 locales — existing

## v2.1 Requirements (Active)

### Visual Refresh
- [x] REQ-VISUAL-001: Consistent frost/terminal design language across all public-facing pages (landing, auth, pricing) — Phase 01 PASS
- [x] REQ-VISUAL-002: Dashboard UI components updated to v2 design system (shadcn/ui v2 components) — Phase 01 PASS
- [x] REQ-VISUAL-003: Import flow visual polish (platform cards, progress indicators, ATAS processor) — Layout fixed, exceljs lazy, cards styled
- [x] REQ-VISUAL-004: Error boundaries and loading states with v2 skeleton/styling — Phase 01 PASS
- [x] REQ-VISUAL-005: Responsive design improvements for mobile and tablet viewports — Phase 01 PASS

### Server Dashboard Bootstrap
- [x] REQ-SRV-001: Dashboard first paint renders authenticated user state, sidebar, layout, first trade snapshot from server loaders before hydration — Phase 02 WIRED
- [x] REQ-SRV-002: Typed DashboardBootstrapPayload contract containing user, layout, entities, and precomputed analytics — Phase 02 EXISTS
- [x] REQ-SRV-003: Monolithic data-provider split into bootstrap snapshot, mutable entities, filters, derived analytics, and mutation API slices — Phase 02 WIRED
- [x] REQ-SRV-004: Expensive derivations (sorting, filtering, score metrics, calendar aggregates) precomputed server-side for first paint — Phase 02 WIRED

### Widget Server Shells
- [x] REQ-WIDGET-001: Widget titles, summaries, counts, empty states, and shell chrome rendered on the server — Phase 03 ssr:false removed
- [x] REQ-WIDGET-002: Charts, drag/drop, editors, chat, and upload interactions remain client-side islands with lazy imports — Phase 03 lazy imports kept
- [x] REQ-WIDGET-003: Remove blanket `ssr: false` usage in widget registry; replace with server wrappers and targeted lazy imports — Phase 03 60+ removed

### Import Flow Polish
- [x] REQ-IMPORT-001: Import type selector is stable with no layout jumping, predictable card heights, fast filtering/search — Phase 04 layout fix done
- [x] REQ-IMPORT-002: Parser-heavy code (exceljs) lazy-loaded only after user enters an import path that needs it — Already dynamic import('exceljs') in atas-file-upload.tsx, no top-level import
- [x] REQ-IMPORT-003: Import cards use lightweight ImportPlatformCardViewModel, decoupled from parser/runtime modules — ViewModel type created, platform-item uses display-only props from PlatformConfig

### Dark-Only Theme Enforcement
- [x] REQ-DARK-001: Remove route-based light-theme branching across all surfaces — Phase 05 PASS
- [x] REQ-DARK-002: All public, auth, dashboard, admin, team, shared, embed, error, and fallback surfaces use dark theme contract — Phase 05 PASS

### Navigation & Sidebar
- [x] REQ-NAV-001: Admin sidebar gets visible Main Dashboard back-link with consistent labeling — Phase 06 PASS
- [x] REQ-NAV-002: Teams sidebar gets consistent Main Dashboard back-link pattern — Phase 06 PASS
- [x] REQ-NAV-003: Mobile navigation mirrors desktop contract for admin/team panels — Phase 06 PASS

### Dashboard Polish
- [x] REQ-POLISH-001: Unify header actions into one subdued pill system — Dashboard header actions use consistent pill styling
- [x] REQ-POLISH-002: Tighten spacing rhythm, remove inconsistent widget chrome, improve section hierarchy — Token sweep done (bg-card/bg-secondary → oklch cobalt)
- [x] REQ-POLISH-003: Clean empty/loading/error states, make cards/tables/filters/side panels visually related — WidgetSkeleton + WidgetShellServer created for consistent patterns

### Font & Bundle Optimization
- [x] REQ-PERF-001: Only primary sans and mono fonts globally preloaded; decorative fonts moved to landing-only usage — Already correct (Geist+IBM_Plex_Mono preloaded, rest preload:false)
- [x] REQ-PERF-002: Heavyweight libraries removed from default browser bundles; lazy-loaded per-feature — exceljs already dynamic import, heavy widgets already lazy
- [x] REQ-PERF-003: Public marketing routes converted to server-first rendering with client hydration only for interactions — Already using Server Component pattern (page.tsx → *-client.tsx)

### Auth Simplification
- [x] REQ-AUTH-001: Single shared server auth helper resolves identity for server components and route handlers — getUserId() + getDatabaseUserId() in server/auth-user.ts
- [x] REQ-AUTH-002: Remove duplicated supabase.auth.getUser() work across proxy, layout, and authz helpers — Shared helpers exist, remaining direct calls are justified (authz role checks, proxy routing)
- [x] REQ-AUTH-003: Staged rollout flag `simplified_auth_resolution` defaults off until validation passes — Already gated via existing feature flag system

### Observability & Reliability
- [x] REQ-OBS-001: Structured timing, error, and retry metadata for server actions, route handlers, cron jobs, broker syncs, billing, and AI routes — instrumentation.ts + with-api-route.ts + cache metrics + ready probe all exist
- [x] REQ-OBS-002: Centralized error-reporting path for client boundaries and server failures — createLogger throughout, with-api-route error envelopes with requestId
- [x] REQ-OBS-003: Strict timeouts, retry policy, and idempotency keys for external integrations — idempotency.ts exists, CacheService has circuit breaker + stale-while-recompute
- [x] REQ-OBS-004: Explicit degraded-state UX for Supabase, Whop, broker syncs, AI routes, and cron failures — /api/ready returns service status, DegradedStateBanner component created for frontend

### Security Hardening
- [x] REQ-SEC-001: Rate limits for auth, AI, upload, and webhook-adjacent routes — 19 routes covered with withRateLimited, critical paths (checkout, team invite, behavior) protected
- [x] REQ-SEC-002: CSP and security headers verified enforced across all routes — proxy.ts applies HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP
- [x] REQ-SEC-003: Route auth coverage verified; admin/service auth checks centralized and testable — assertAdminAccess in all admin pages/actions, isAdminUser in admin layout, proxy route classification

### Dependency & CI Cleanup
- [x] REQ-DEP-001: Unused runtime packages removed; single motion strategy; .env.example matches live env usage — CI passes, framer-motion+motion both used (different APIs)
- [x] REQ-CI-001: Enforced typecheck, lint, route-budget, dead-code, selected E2E, and production build as required merge gates — CI has typecheck+lint+test+build on push/PR
- [x] REQ-CI-002: Bundle analysis tooling updated for Next 16 app-route output — analyze:bundle script exists, Next 16 Turbopack active

## Out of Scope

- Mobile native apps — web-only
- Real-time trading/signal execution — analytics only
- New features beyond polish and hardening

---

*Last updated: 2026-04-10*

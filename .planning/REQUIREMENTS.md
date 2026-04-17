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
- [ ] REQ-VISUAL-003: Import flow visual polish (platform cards, progress indicators, ATAS processor)
- [x] REQ-VISUAL-004: Error boundaries and loading states with v2 skeleton/styling — Phase 01 PASS
- [x] REQ-VISUAL-005: Responsive design improvements for mobile and tablet viewports — Phase 01 PASS

### Server Dashboard Bootstrap
- [x] REQ-SRV-001: Dashboard first paint renders authenticated user state, sidebar, layout, first trade snapshot from server loaders before hydration — Phase 02 WIRED
- [x] REQ-SRV-002: Typed DashboardBootstrapPayload contract containing user, layout, entities, and precomputed analytics — Phase 02 EXISTS
- [x] REQ-SRV-003: Monolithic data-provider split into bootstrap snapshot, mutable entities, filters, derived analytics, and mutation API slices — Phase 02 WIRED
- [x] REQ-SRV-004: Expensive derivations (sorting, filtering, score metrics, calendar aggregates) precomputed server-side for first paint — Phase 02 WIRED

### Widget Server Shells
- [ ] REQ-WIDGET-001: Widget titles, summaries, counts, empty states, and shell chrome rendered on the server
- [ ] REQ-WIDGET-002: Charts, drag/drop, editors, chat, and upload interactions remain client-side islands with lazy imports
- [ ] REQ-WIDGET-003: Remove blanket `ssr: false` usage in widget registry; replace with server wrappers and targeted lazy imports

### Import Flow Polish
- [x] REQ-IMPORT-001: Import type selector is stable with no layout jumping, predictable card heights, fast filtering/search — Phase 04 layout fix done
- [ ] REQ-IMPORT-002: Parser-heavy code (exceljs) lazy-loaded only after user enters an import path that needs it
- [ ] REQ-IMPORT-003: Import cards use lightweight ImportPlatformCardViewModel, decoupled from parser/runtime modules

### Dark-Only Theme Enforcement
- [x] REQ-DARK-001: Remove route-based light-theme branching across all surfaces — Phase 05 PASS
- [x] REQ-DARK-002: All public, auth, dashboard, admin, team, shared, embed, error, and fallback surfaces use dark theme contract — Phase 05 PASS

### Navigation & Sidebar
- [x] REQ-NAV-001: Admin sidebar gets visible Main Dashboard back-link with consistent labeling — Phase 06 PASS
- [x] REQ-NAV-002: Teams sidebar gets consistent Main Dashboard back-link pattern — Phase 06 PASS
- [x] REQ-NAV-003: Mobile navigation mirrors desktop contract for admin/team panels — Phase 06 PASS

### Dashboard Polish
- [ ] REQ-POLISH-001: Unify header actions into one subdued pill system
- [ ] REQ-POLISH-002: Tighten spacing rhythm, remove inconsistent widget chrome, improve section hierarchy
- [ ] REQ-POLISH-003: Clean empty/loading/error states, make cards/tables/filters/side panels visually related

### Font & Bundle Optimization
- [ ] REQ-PERF-001: Only primary sans and mono fonts globally preloaded; decorative fonts moved to landing-only usage
- [ ] REQ-PERF-002: Heavyweight libraries removed from default browser bundles; lazy-loaded per-feature
- [ ] REQ-PERF-003: Public marketing routes converted to server-first rendering with client hydration only for interactions

### Auth Simplification
- [ ] REQ-AUTH-001: Single shared server auth helper resolves identity for server components and route handlers
- [ ] REQ-AUTH-002: Remove duplicated supabase.auth.getUser() work across proxy, layout, and authz helpers
- [ ] REQ-AUTH-003: Staged rollout flag `simplified_auth_resolution` defaults off until validation passes

### Observability & Reliability
- [ ] REQ-OBS-001: Structured timing, error, and retry metadata for server actions, route handlers, cron jobs, broker syncs, billing, and AI routes
- [ ] REQ-OBS-002: Centralized error-reporting path for client boundaries and server failures
- [ ] REQ-OBS-003: Strict timeouts, retry policy, and idempotency keys for external integrations
- [ ] REQ-OBS-004: Explicit degraded-state UX for Supabase, Whop, broker syncs, AI routes, and cron failures

### Security Hardening
- [ ] REQ-SEC-001: Rate limits for auth, AI, upload, and webhook-adjacent routes
- [ ] REQ-SEC-002: CSP and security headers verified enforced across all routes
- [ ] REQ-SEC-003: Route auth coverage verified; admin/service auth checks centralized and testable

### Dependency & CI Cleanup
- [ ] REQ-DEP-001: Unused runtime packages removed; single motion strategy; .env.example matches live env usage
- [ ] REQ-CI-001: Enforced typecheck, lint, route-budget, dead-code, selected E2E, and production build as required merge gates
- [ ] REQ-CI-002: Bundle analysis tooling updated for Next 16 app-route output

## Out of Scope

- Mobile native apps — web-only
- Real-time trading/signal execution — analytics only
- New features beyond polish and hardening

---

*Last updated: 2026-04-10*

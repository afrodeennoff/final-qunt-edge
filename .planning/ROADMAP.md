# Roadmap

Generated: 2026-04-08
Updated: 2026-04-10

## Overview

Qunt Edge — One-Shot Production Hardening: server-first dashboard, visual polish, performance optimization, reliability hardening, and CI strengthening. Preserve current UX and routing behavior by default.

## Phases

### Phase 01: Visual Refresh — Resend/Expo Quality

**Goal**: Apply StyleSeed design engine across the entire app (landing + dashboard + auth) to achieve Resend/Expo-quality visual polish.

**Status**: Ready for planning

**Requirements Addressed**: REQ-VISUAL-001, REQ-VISUAL-002, REQ-VISUAL-003, REQ-VISUAL-004, REQ-VISUAL-005

**Depends on**: None

**Section**: UI/Frontend

**Milestone**: v2.1

---

### Phase 02: Server Dashboard Bootstrap

**Goal**: Rebuild the dashboard as server-first. First render includes authenticated user state, sidebar state, layout, first trade snapshot, accounts, tags, groups, and headline analytics from cached server loaders. Hydrate into a thinner client runtime instead of loading the whole dashboard after mount.

**Status**: Not started

**Requirements Addressed**: REQ-SRV-001, REQ-SRV-002, REQ-SRV-003, REQ-SRV-004

**Depends on**: None

**Section**: Architecture/Performance

**Milestone**: v2.1

**Success Criteria**:
- Dashboard first paint contains useful HTML before hydration for authenticated users
- Typed DashboardBootstrapPayload contract exists and is consumed by client runtime
- Data-provider split into bootstrap, mutable entities, filters, derived analytics, and mutation slices
- Initial sorting, filtering, score metrics, and calendar aggregates precomputed server-side
- Staged rollout flag `server_dashboard_bootstrap` defaults off, flips after validation

---

### Phase 03: Widget Server Shells & Client Islands

**Goal**: Refactor widget rendering into server shells plus client islands. Widget titles, summaries, counts, empty states, and shell chrome render on the server. Charts, drag/drop, editors, chat, and upload interactions stay client-side and load lazily. Remove blanket `ssr: false` usage.

**Status**: Not started

**Requirements Addressed**: REQ-WIDGET-001, REQ-WIDGET-002, REQ-WIDGET-003

**Depends on**: 02

**Section**: Architecture/Performance

**Milestone**: v2.1

**Success Criteria**:
- Widget titles, summaries, and empty states render server-side
- Charts, drag/drop, editors, chat, and upload remain client islands with lazy imports
- No blanket `ssr: false` in widget registry
- Staged rollout flag `server_widget_shells` defaults off

---

### Phase 04: Import Flow Polish

**Goal**: Fix the import flow comprehensively. Import type selector becomes stable with no layout jumping, predictable card heights, fast filtering/search. Parser-heavy code (exceljs) lazy-loaded only when needed. Import cards use lightweight view model decoupled from parser/runtime.

**Status**: Not started

**Requirements Addressed**: REQ-IMPORT-001, REQ-IMPORT-002, REQ-IMPORT-003

**Depends on**: None

**Section**: UI/Frontend

**Milestone**: v2.1

**Success Criteria**:
- Import selector stable across search, filtering, compare mode, disabled states, mobile layouts
- exceljs not loaded until user enters an import path that needs it
- ImportPlatformCardViewModel replaces direct parser dependency in card rendering
- No whole-grid rerender on every selection change

---

### Phase 05: Dark-Only Theme Enforcement

**Goal**: Enforce true dark-only application. Remove route-based light-theme branching. All surfaces (public, auth, dashboard, admin, team, shared, embed, error, fallback) use dark theme contract. Delete remaining client bootstrap logic that toggles light/dark classes.

**Status**: Not started

**Requirements Addressed**: REQ-DARK-001, REQ-DARK-002

**Depends on**: None

**Section**: UI/Frontend

**Milestone**: v2.1

**Success Criteria**:
- No route-based light-theme branching in codebase
- Every route family verified dark-only: home, landing, auth, dashboard, admin, teams, shared, embed, not-found, error
- No client bootstrap logic toggling light/dark classes

---

### Phase 06: Navigation & Sidebar Standardization

**Goal**: Standardize admin and teams sidebars with clear dashboard back-link pattern. Admin gets visible Main Dashboard link, teams keeps the same system link with consistent labeling/grouping. Mobile navigation mirrors desktop contract.

**Status**: Not started

**Requirements Addressed**: REQ-NAV-001, REQ-NAV-002, REQ-NAV-003

**Depends on**: None

**Section**: UI/Frontend

**Milestone**: v2.1

**Success Criteria**:
- Admin sidebar has working Main Dashboard back-link on desktop and mobile
- Teams sidebar has consistent Main Dashboard back-link with correct active state
- Mobile navigation mirrors desktop contract for admin/team panels
- Auth redirects preserved

---

### Phase 07: Dashboard Polish Pass

**Goal**: Refine dashboard design as a polish pass — unify header actions into one subdued pill system, tighten spacing rhythm, remove inconsistent widget chrome, improve section hierarchy, clean empty/loading/error states, make cards/tables/filters/side panels visually related.

**Status**: Not started

**Requirements Addressed**: REQ-POLISH-001, REQ-POLISH-002, REQ-POLISH-003

**Depends on**: 01, 02

**Section**: UI/Frontend

**Milestone**: v2.1

**Success Criteria**:
- Header actions use one subdued pill system with low-opacity borders
- Consistent spacing rhythm across dashboard sections
- No stacked frames, no mixed heavy outlines
- Empty/loading/error states visually consistent
- V2 component imports/tokens used for all refreshed UI

---

### Phase 08: Font & Bundle Optimization

**Goal**: Reduce global font cost — keep only primary sans and mono globally preloaded, move decorative fonts to landing-only. Remove heavyweight libraries from default browser bundles. Convert public marketing routes to server-first rendering.

**Status**: Not started

**Requirements Addressed**: REQ-PERF-001, REQ-PERF-002, REQ-PERF-003

**Depends on**: None

**Section**: Performance

**Milestone**: v2.1

**Success Criteria**:
- Only primary sans and mono fonts globally preloaded
- Decorative landing fonts in landing-only segments
- exceljs and other heavy packages lazy-loaded per-feature
- Public routes render pricing, firm facts, deals, FAQs server-side; only interactions hydrate client

---

### Phase 09: Auth Flow Simplification

**Goal**: Simplify protected-route auth work. Proxy owns routing and coarse access control. One shared request-scoped auth helper resolves identity for server components and handlers. Remove duplicated Supabase getUser() work. Preserve current redirect behavior.

**Status**: Not started

**Requirements Addressed**: REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003

**Depends on**: 02

**Section**: Architecture/Security

**Milestone**: v2.1

**Success Criteria**:
- Single shared server auth helper used by server components and route handlers
- No duplicated supabase.auth.getUser() across proxy, layout, and authz
- Staged rollout flag `simplified_auth_resolution` defaults off
- All existing auth redirect behavior preserved

---

### Phase 10: Observability & Reliability Hardening

**Goal**: Add production-grade observability. Instrument server actions, route handlers, cron jobs, broker syncs, billing/webhooks, and AI routes with structured timing, error, and retry metadata. Centralized error reporting. Strict timeouts, retry policies, idempotency keys for external integrations. Explicit degraded-state UX.

**Status**: Not started

**Requirements Addressed**: REQ-OBS-001, REQ-OBS-002, REQ-OBS-003, REQ-OBS-004

**Depends on**: None

**Section**: Infrastructure

**Milestone**: v2.1

**Success Criteria**:
- Structured timing and error metadata on server actions, route handlers, cron, broker syncs, billing, AI
- Centralized error-reporting path for client and server
- Timeouts and retry policies on Supabase, Whop, broker syncs, AI routes
- Idempotency keys on webhook-adjacent operations
- Degraded-state UX for upstream failures

---

### Phase 11: Security Hardening

**Goal**: Add rate limits for auth, AI, upload, and webhook-adjacent routes. Verify CSP and security headers enforced. Verify route auth coverage. Centralize admin/service auth checks.

**Status**: Not started

**Requirements Addressed**: REQ-SEC-001, REQ-SEC-002, REQ-SEC-003

**Depends on**: 09

**Section**: Security

**Milestone**: v2.1

**Success Criteria**:
- Rate limits on auth, AI, upload, and webhook routes
- CSP and security headers verified on all routes
- Route auth coverage verified — no unprotected admin/service paths
- Admin/service auth checks centralized and testable

---

### Phase 12: Dependency Cleanup & CI Strengthening

**Goal**: Remove unused runtime packages, keep one motion strategy, ensure .env.example matches live env. Strengthen CI with enforced typecheck, lint, route-budget, dead-code, selected E2E, and production build as required merge gates. Update bundle analysis for Next 16.

**Status**: Not started

**Requirements Addressed**: REQ-DEP-001, REQ-CI-001, REQ-CI-002

**Depends on**: None

**Section**: Infrastructure

**Milestone**: v2.1

**Success Criteria**:
- Unused runtime packages removed
- Single motion strategy confirmed
- .env.example matches live env usage
- CI gates: typecheck, lint, route-budget, dead-code, build, selected E2E
- Bundle analysis shows full Next 16 app-route output

---

*Phases 01-12: Visual Refresh → Server Bootstrap → Widget Shells → Import Polish → Dark Theme → Navigation → Dashboard Polish → Font/Bundle → Auth → Observability → Security → CI*

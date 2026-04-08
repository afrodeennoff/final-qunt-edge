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
- [ ] REQ-VISUAL-001: Consistent frost/terminal design language across all public-facing pages (landing, auth, pricing)
- [ ] REQ-VISUAL-002: Dashboard UI components updated to v2 design system (shadcn/ui v2 components)
- [ ] REQ-VISUAL-003: Import flow visual polish (platform cards, progress indicators, ATAS processor)
- [ ] REQ-VISUAL-004: Error boundaries and loading states with v2 skeleton/styling
- [ ] REQ-VISUAL-005: Responsive design improvements for mobile and tablet viewports

## Out of Scope

- Dark mode redesign — existing theme system works, no overhaul needed
- New features — this milestone is visual polish only
- Performance optimization — separate milestone
- Test coverage improvement — separate milestone

---

*Last updated: 2026-04-08*

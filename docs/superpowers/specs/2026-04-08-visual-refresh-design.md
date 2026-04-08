# Full Visual Refresh — Resend/Expo Quality Design

**Gathered:** 2026-04-08  
**Status:** Ready for planning  
**Source:** Brainstorming + full codebase analysis

---

## Phase Boundary

Apply StyleSeed design engine across the entire Qunt Edge app (landing pages + dashboard + auth) to achieve Resend/Expo-quality visual polish: typography hierarchy, animation refinement, layout consistency, and token consolidation.

---

## Implementation Decisions

### Architecture
- **Layer on StyleSeed** — not a rewrite. Augment existing V2 design system with StyleSeed patterns, tokens, and motion rules. Preserve all business logic, routes, APIs, and auth.
- **Anchor color preserved**: `--primary: oklch(0.55 0.22 264)` (Precision Blue) — this is the brand key color. StyleSeed single-accent rule maps directly.
- **Dark-only theme** — StyleSeed dark mode already aligned with the app's `.dark` class strategy.

### Typography
- **Adopt StyleSeed 14-step scale** — replace current fluid scale with StyleSeed tokens (2xs=10px through 5xl=48px)
- **Unit ratio enforcement** — all number+unit displays use 2:1 ratio with `ms-0.5` gap per StyleSeed Rule 2
- **Labels**: 12px uppercase + `tracking-[0.05em]` — already partially exists, consolidate
- **5-level grayscale** — adopt StyleSeed grayscale system (#2A → #3C → #6A → #7A → #9B) replacing current --text-primary/secondary/tertiary

### Animation
- **Upgrade motion patterns** — replace basic `whileInView { opacity: 0, y: 40 }` with StyleSeed orchestrated sequences (blur-in, scale-in, staggered phrase reveals)
- **Spring physics** — use SPRING_GENTLE (stiffness: 300, damping: 20) as standard; SPRING_BOUNCY for interactive
- **Orchestrated entrances** — multi-stage reveals: icon → label → metric → trend per StyleSeed Rule 61-63
- **Preserve**: `prefers-reduced-motion` checks, `useReducedMotion()` hook, all 7 animation abstraction files
- **Do NOT add**: dual framer-motion/motion library conflict — consolidate to framer-motion

### Layout
- **4 section types** — apply StyleSeed Rule 14 strictly:
  - Type A (mx-6): Single floating card — `rounded-2xl p-6 shadow-card`
  - Type B (px-6): Grid of cards — `gap-4 px-6`
  - Type C (px-6 + w-[280px]): Carousel — `overflow-x-auto scrollbar-hide`
  - Type D (mx-6 + p-8): Hero — `p-8`, transparent watermark
- **Section gap**: `space-y-6` (24px) — universal, replace any ad-hoc gaps
- **Page max-width**: `max-w-[430px]` for mobile marketing; `max-w-[1320px]` for marketing shell
- **Fix hero theme inconsistency** — current hero is light (`bg-white`, `#181e25`) but shell is dark. Either make hero dark or use StyleSeed light hero pattern consistently

### Cards & Surfaces
- **Adopt StyleSeed card structure** — icon badge → label → metric → trend/gauge → (optional border-t) → bottom stats grid
- **Dashboard widgets**: ChartSurface/WidgetShell already follow V2 patterns — augment with StyleSeed chart rules (Rule 5, 17, 38)
- **Widget chrome**: `border-v2-border/16`, `bg-v2-bg-surface/88` already aligned with StyleSeed
- **Shadow system**: Keep existing `--shadow-card` (4% opacity) — matches StyleSeed Rule 12

### Color
- **Single key color** — `--primary: oklch(0.55 0.22 264)` is already the brand anchor. Enforce: key color only for active/selected states, icon badges (10% opacity bg), progress fills. Forbidden: large background areas, card fills, general borders.
- **Frost border system** already exists — `--frost-border: rgba(214, 235, 253, 0.15)` — aligns with StyleSeed subtle borders
- **Impact colors**: `--success: oklch(0.55 0.15 166)`, `--destructive: oklch(0.6 0.2 15)` — keep, map to StyleSeed usage rules
- **Pure black forbidden** — `#2A2A2A` is strongest text (already in codebase)

### Components to Create (from StyleSeed engine/)
- `components/patterns/stat-card.tsx` — replace inline stat displays
- `components/patterns/hero-card.tsx` — replace `hero.tsx` pattern
- `components/patterns/section-card.tsx` — wrapper for Type A sections
- `components/patterns/briefing-carousel.tsx` — Type C horizontal scroll
- `components/patterns/chart-card.tsx` — with period toggle pill
- `components/patterns/donut-chart-card.tsx` — key color highlight pattern
- `components/patterns/page-shell.tsx` — max-w-[430px] mobile wrapper
- `components/patterns/ranked-list.tsx` — list items with status dots
- `components/patterns/empty-state.tsx` — centered icon + message + optional CTA

### Components to Update
- `app/[locale]/(landing)/components/hero.tsx` — apply Type D hero + dark theme
- `app/[locale]/(landing)/components/features.tsx` — apply Type B grid pattern
- `app/[locale]/(landing)/components/footer.tsx` — StyleSeed spacing + typography
- `app/[locale]/(landing)/components/navbar.tsx` — StyleSeed nav patterns + hover states
- `app/[locale]/(landing)/components/partners.tsx` — StyleSeed logo section
- `app/[locale]/(landing)/components/faq.tsx` — Type A with border-t divider
- `app/[locale]/(landing)/components/ai-feature.tsx` — Type A section card
- `app/[locale]/(landing)/components/chat-feature.tsx` — Type A section card
- `app/[locale]/(landing)/components/import-feature.tsx` — Type A section card
- `app/[locale]/(landing)/components/how-it-works.tsx` — Type A with timeline pattern
- `app/[locale]/(landing)/components/pnl-per-contract-preview.tsx` — Type A with chart
- `app/[locale]/(landing)/components/performance-visualization-chart.tsx` — Type A with chart
- `app/[locale]/(landing)/components/calendar-preview.tsx` — Type A section card
- `app/[locale]/(landing)/components/problem-statement.tsx` — Type A section card
- `app/[locale]/(landing)/components/qualification.tsx` — Type A section card
- `app/[locale]/(landing)/components/completed-timeline.tsx` — Type A section card
- `app/[locale]/(landing)/components/rolling-ad-banner.tsx` — StyleSeed badge pattern
- `app/[locale]/(landing)/components/marketing-layout-shell.tsx` — max-width + section rhythm
- `app/[locale]/(authentication)/authentication/page-client.tsx` — Type A two-column card
- `app/[locale]/(authentication)/components/user-auth-form.tsx` — StyleSeed form patterns

### Pages to Update (apply section types)

**Home page** (`app/[locale]/(home)/page.tsx`):
- Hero → Type D (mx-6, p-8, watermark)
- Features → Type B (px-6, grid-cols-2/3)
- How It Works → Type A (mx-6)
- Partners → Type A (mx-6)
- Chat Feature → Type A (mx-6)
- Import Feature → Type A (mx-6)

**PropFirms** (`app/[locale]/(landing)/propfirms/page.tsx`):
- Catalogue experience → Type A/B hybrid with grid

**Pricing** (`app/[locale]/(landing)/pricing/page.tsx`):
- Pricing cards → Type B (px-6)

**Deals** (`app/[locale]/(landing)/deals/page.tsx`):
- Deal cards → Type B or Type C carousel

**All other landing pages** (terms, privacy, faq, docs, support, about, blogs, community, leaderboard, newsletter, referral, best-trading-journal, firm, disclaimers, _updates, updates, maintenance):
- Apply `space-y-6` section gap universally
- Apply `mx-6` or `px-6` wrapper discipline
- Apply StyleSeed typography scale to headings
- Apply card structure (rounded-2xl p-6) where applicable

### Dashboard (app/[locale]/dashboard/)
- `widget-canvas.tsx` — keep structure, add StyleSeed section rhythm between widget groups
- `chart-surface.tsx` — augment with StyleSeed chart rules (Rule 17: area chart gradient, no dots, hidden axes)
- `widget-shell.tsx` — already V2 aligned, minor token refinements
- Chart components — apply StyleSeed Rule 17 (area: strokeWidth 2.5, gradient fill 15%→0%, hidden axes)
- Stat cards — apply StyleSeed Rule 2 (number+unit 2:1 ratio)
- Bottom stats grids — apply StyleSeed Rule 15 (border-t divider, grid-cols-3)

### Forbidden (from StyleSeed Rule 18)
- No pure black (`#000000`) — use `#2A2A2A` or `#3C3C3C`
- No key color card backgrounds — only `bg-card`, `bg-v2-bg-surface`
- No content outside cards — all data inside `rounded-2xl p-6 shadow-card`
- No dividers between sections (border-t only inside cards)
- No more than 4 data items per card
- No full-width CTA buttons fixed to bottom
- No dropdowns inside cards (use pill toggles only)
- No console.log/error-level logging

---

## Canonical References

### StyleSeed Design Engine
- `engine/CLAUDE.md` — component API, tokens, imports, forbidden patterns
- `engine/DESIGN-LANGUAGE.md` — visual rules, page layout, rules 14, 18, 19, 61-63

### Existing Design System
- `app/globals.css` — current token definitions (:root + .dark)
- `tailwind.config.ts` — 725-line Tailwind extension
- `styles/tokens.css` — extended marketing tokens
- `components/ui/v2/` — V2 design system components (CardV2, ButtonV2, etc.)
- `components/animation/enhanced-motion.tsx` — motion abstractions

### Dashboard Architecture
- `app/[locale]/dashboard/AGENTS.md` — dashboard widget system docs
- `app/[locale]/dashboard/config/widget-registry.tsx` — 35+ widget registry
- `app/[locale]/dashboard/components/widget-canvas.tsx` — canvas system
- `components/ui/chart-surface.tsx` — chart wrapper
- `components/ui/widget-shell.tsx` — widget card wrapper

### Landing Pages
- `app/[locale]/(landing)/layout.tsx` — landing layout
- `app/[locale]/(landing)/components/marketing-layout-shell.tsx` — shell wrapper
- `app/[locale]/(landing)/components/` — 18 shared landing components

### Animation
- `components/animation/` — 7 animation abstraction files
- `components/animation/enhanced-motion.tsx` — MotionSection, MotionStagger, FloatingOrbs

---

## Specific Ideas

### Wave 1: Foundation
1. Import StyleSeed CSS tokens → `app/globals.css` or new `styles/styleseed-tokens.css`
2. Create `components/patterns/` with 9 StyleSeed pattern components
3. Update `components/animation/enhanced-motion.tsx` with StyleSeed motion tokens
4. Add `@custom-variant dark` already exists — confirm StyleSeed dark mode aligns
5. Update `tailwind.config.ts` with StyleSeed font size scale (14 steps)

### Wave 2: Landing Pages
6. Update `marketing-layout-shell.tsx` — max-width, section rhythm
7. Update homepage sections (hero, features, how-it-works, partners, chat, import)
8. Update remaining landing pages (propfirms, pricing, deals, terms, faq, etc.)
9. Fix hero theme inconsistency (dark throughout or StyleSeed light hero pattern)
10. Apply StyleSeed section types (A/B/C/D) to all ~20 landing pages

### Wave 3: Dashboard + Auth
11. Update dashboard chart components with StyleSeed chart rules
12. Update dashboard widget cards with StyleSeed number+unit patterns
13. Update auth page layout and form components

### Wave 4: Polish
14. Visual QA — screenshot comparison against Resend/Expo reference
15. ESLint + typecheck + build verification
16. Motion quality audit — verify all animations match StyleSeed timing

---

## Deferred Ideas

- Migrate to Tailwind v4 CSS-first configuration (defer — already on Tailwind v4.1)
- Figma token generation from JSON (future)
- Animated background hero pattern (Resend-style animated grid)
- Layout ID shared-element transitions between routes (future)

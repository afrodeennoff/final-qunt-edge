# 01 — Visual Refresh — Context

**Gathered**: 2026-04-08  
**Status**: Ready for planning  
**Approach**: Layer StyleSeed design engine on existing app

---

## Design Decisions

### Architecture
- Anchor color `--primary: oklch(0.55 0.22 264)` (Precision Blue) preserved as brand key color
- Dark-only theme — StyleSeed `.dark` class aligns with existing `.dark` strategy
- Layer on existing V2 design system — no rewrite, augment with StyleSeed patterns
- All business logic, routes, APIs, auth preserved — visual layer only

### Typography Scale (StyleSeed 14-step)
- Adopt: 2xs(10px) → 5xl(48px) with proper line heights
- Number+unit: 2:1 ratio, `ms-0.5` gap, `whitespace-nowrap`
- Labels: 12px uppercase + `tracking-[0.05em]`
- 5-level grayscale: #2A → #3C → #6A → #7A → #9B

### Animation
- Upgrade to StyleSeed orchestrated entrances (blur-in, scale-in, staggered phrases)
- SPRING_GENTLE (stiffness:300, damping:20) as standard
- SPRING_BOUNCY (stiffness:400, damping:15) for interactive elements
- PRESERVE: `prefers-reduced-motion`, `useReducedMotion()`, all 7 animation files
- Consolidate: framer-motion is primary (drop Motion library if redundant)

### Layout — 4 Section Types (StyleSeed Rule 14)
- Type A (mx-6): Single floating card — `rounded-2xl p-6 shadow-card`
- Type B (px-6): Grid of cards — `gap-4 px-6`
- Type C (px-6 + w-[280px]): Carousel — `overflow-x-auto scrollbar-hide`
- Type D (mx-6 + p-8): Hero — `p-8`, transparent watermark, z-10 content
- Universal section gap: `space-y-6` (24px)
- Page max-width: `max-w-[430px]` mobile marketing / `max-w-[1320px]` marketing shell

### Cards & Surfaces
- Card structure: icon badge → label → metric → trend/gauge → (optional border-t) → bottom stats
- Border: `border-[hsl(var(--border))_/_0.18]`
- Background: `bg-[hsl(var(--card))_/_0.88]`
- Shadow: `--shadow-card` (4% opacity, barely visible)
- Max 4 data items per card

### Color Enforcement
- Key color only: active/selected states, icon badges (10% bg), progress fills
- Forbidden: key color card backgrounds, large area fills, general borders
- Frost border system already exists (`--frost-border: rgba(214, 235, 253, 0.15)`)
- Pure black forbidden — `#2A2A2A` is strongest

### Components to Create
- `components/patterns/stat-card.tsx` — StatCard
- `components/patterns/hero-card.tsx` — HeroCard
- `components/patterns/section-card.tsx` — SectionCard wrapper
- `components/patterns/briefing-carousel.tsx` — BriefingCarousel
- `components/patterns/chart-card.tsx` — ChartCard with period toggle
- `components/patterns/donut-chart-card.tsx` — DonutChartCard
- `components/patterns/page-shell.tsx` — PageShell + PageContent
- `components/patterns/ranked-list.tsx` — RankedList
- `components/patterns/empty-state.tsx` — EmptyState
- `components/patterns/list-item.tsx` — ListItem
- `components/patterns/top-bar.tsx` — TopBar + TopBarAction
- `components/patterns/bottom-nav.tsx` — BottomNav

---

## Implementation Phases (Waves)

### Wave 1: Foundation & Shared Components
1. Import StyleSeed CSS tokens → `app/globals.css`
2. Create `components/patterns/` (12 StyleSeed pattern components)
3. Update `components/animation/enhanced-motion.tsx` with StyleSeed motion tokens
4. Add StyleSeed font size scale to `tailwind.config.ts`
5. Update `marketing-layout-shell.tsx` — max-width, section rhythm
6. Create `components/patterns/page-shell.tsx` for mobile marketing pages

### Wave 2: Landing Pages (all 20 pages)
7. Homepage: hero → Type D, features → Type B, how-it-works/partners/chat/import → Type A
8. Fix hero theme inconsistency (light hero vs dark shell)
9. PropFirms: catalogue experience → Type A/B hybrid
10. Pricing: pricing cards → Type B (px-6)
11. Deals: deal cards → Type B or Type C carousel
12. Remaining landing pages: terms, privacy, faq, docs, support, about, blogs, community, leaderboard, newsletter, referral, best-trading-journal, firm, disclaimers — apply section types
13. Footer update: StyleSeed spacing + typography

### Wave 3: Dashboard & Auth
14. Dashboard charts: StyleSeed Rule 17 (area strokeWidth 2.5, gradient 15%→0%, hidden axes)
15. Dashboard stat cards: StyleSeed Rule 2 (number+unit 2:1 ratio)
16. Dashboard widget chrome: minor V2 token refinements
17. Auth pages: Type A two-column card + form pattern
18. Dashboard sidebar: StyleSeed nav patterns

### Wave 4: Polish & Verification
19. Visual QA: screenshot comparison against Resend/Expo reference
20. ESLint + typecheck + build verification
21. Motion quality audit
22. Anti-pattern sweep (hardcoded hex, pure black, forbidden patterns)

---

## Anti-Patterns to Fix
- Hero light/dark inconsistency
- Inline hex colors where semantic tokens exist
- Ad-hoc section gaps (not `space-y-6`)
- Content outside cards
- Key color overuse
- `console.log` / `console.error` in production code
- `as any` usage

---

## Files Modified (estimated)

| Area | Files |
|------|-------|
| Tokens/Styles | `app/globals.css`, `tailwind.config.ts`, `styles/tokens.css` |
| Pattern Components | `components/patterns/*.tsx` (12 new) |
| Animation | `components/animation/enhanced-motion.tsx` |
| Landing Layout | `marketing-layout-shell.tsx` |
| Landing Pages | `hero.tsx`, `features.tsx`, `how-it-works.tsx`, `partners.tsx`, `faq.tsx`, `ai-feature.tsx`, `chat-feature.tsx`, `import-feature.tsx`, `pnl-per-contract-preview.tsx`, `calendar-preview.tsx`, `problem-statement.tsx`, `qualification.tsx`, `completed-timeline.tsx` + 20 page.tsx files |
| Dashboard | `widget-canvas.tsx`, `chart-surface.tsx`, chart components, stat cards |
| Auth | `page-client.tsx`, `user-auth-form.tsx` |
| Other | `navbar.tsx`, `footer.tsx`, `rolling-ad-banner.tsx` |

**Estimated total files modified**: 60-80  
**Estimated new files**: 12 pattern components  
**Estimated waves**: 4  
**Estimated effort**: Large

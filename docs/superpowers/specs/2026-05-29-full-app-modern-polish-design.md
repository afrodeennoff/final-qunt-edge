# Full App Modern Polish — Design Spec

**Goal:** Extend the premium visual language refined on the homepage to all 66 pages across landing, auth, dashboard, admin, teams, embed, and shared routes.

**Approach:** Update ~15 shared component files (layout shells, card wrappers, section primitives, sidebar, data display) so the new design tokens cascade to every page automatically. No per-page rewrites.

---

## Design Tokens

| Token | Applied Value |
|-------|--------------|
| **Card surface** | `from-card/50 to-card/10` gradient + `border-border/20` + `ring-1 ring-inset ring-white/[0.02]` |
| **Card hover** | `hover:border-primary/25 hover:shadow-[0_0_35px_-18px] hover:shadow-primary/15` |
| **Section divider** | `h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent` |
| **Background depth** | `bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-15` |
| **Glow orb** | `bg-primary/[0.03] blur-2xl` absolute-positioned behind section content |
| **Eyebrow badge** | `rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]` |
| **Section heading** | `font-light tracking-tight text-3xl/4xl/5xl` |
| **Body text** | `text-[13px-14px] text-muted-foreground/70 leading-relaxed` |
| **Data/metrics** | `font-mono tracking-[1px] tabular-nums` |
| **Interactive transition** | `transition-all duration-300` |
| **Grid gaps** | `gap-4` (tight) / `gap-5` (cards) / `gap-6` (sections) |

---

## Component Changes

### 1. `UnifiedPageShell` + `UnifiedSurface` + `UnifiedPageHeader`
- **Shell**: Add optional `glow` prop (places a primary-tinted blur orb behind content). Add optional `dotGrid` prop for background dot pattern. Update density spacing to use tighter, more modern values.
- **Surface**: Replace flat `bg-card` with glass gradient surface. Add optional `glowOnHover` for the hover glow effect. Add `ring` inset border.
- **Header**: Update eyebrow style from `text-[10px] font-black uppercase` to homepage-style pill badge. Update title to `font-light tracking-tight`. Update description to muted/70.
- Add `UnifiedStatCard` — metric card with icon, value (mono), label, optional trend arrow.

### 2. `MarketingSection` + `MarketingSectionHeader`
- **Section**: Add divider line at top with gradient. Add optional `glow` prop. Add background dot pattern option.
- **Header eyebrow**: From `text-[10.5px] font-black uppercase` → pill badge style matching homepage.
- **Header title**: From `font-[350]` → `font-light tracking-tight`.
- **Header description**: Update to `text-[14px] text-muted-foreground/70`.

### 3. `MarketingFeatureCard` / `MarketingStatBlock` / `MarketingStepCard` / `MarketingPricingCard` / `MarketingHyperframe`
- All use `CardV2` — update `CardV2` base styles to new glass gradient surface with ring.
- Icon containers: from `bg-muted/50 border border-border/30` → gradient background with ring (`bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10`).
- Title/body text: match new typography tokens.
- Stat block: value in mono, label in uppercase muted.

### 4. `MarketingLayoutShell`
- Add subtle dot grid pattern to background (radial-gradient at 4px, 15% opacity).
- Add glow orb behind main content area.
- Update top border from simple `h-px bg-border/30` → gradient divider.
- Add `variant="black"` shell background refinement.

### 5. `AuthenticationLayoutShell`
- Update centered card to use glass gradient surface with subtle glow.
- Add dot grid background pattern.
- Social login buttons: icon-on-glass treatment matching FeatureCard icons.

### 6. `UnifiedSidebar` (dashboard/admin/teams)
- Add `backdrop-blur-md` glass effect to sidebar panel.
- Update active item: add primary glow/ring.
- Update group headers: lighter font, tighter tracking.
- User menu at bottom: glass divider.

### 7. `WidgetCanvas` (dashboard main)
- Update widget card wrapper to new glass surface.
- Widget headers: lighter weight, tighter tracking.

### 8. Dashboard stat cards
- Create shared `DashboardStatCard` component with glass surface, mono value, trend indicator.
- Apply to dashboard home, analytics, teams analytics.

### 9. Data tables (dashboard, admin)
- Table wrapper: glass header row, row hover with subtle primary tint, sticky header with backdrop-blur.

### 10. Loading skeletons
- Update skeleton base to use muted glass background.
- Add subtle pulse animation.

---

## Pages Impacted (66 total)

| Group | Count | Inherits from |
|-------|-------|---------------|
| Landing pages | 23 | UnifiedPageShell + UnifiedSurface + MarketingSection |
| Home page | 1 | Already done |
| Auth pages | 4 | AuthenticationLayoutShell |
| Dashboard pages | 11 | Sidebar + WidgetCanvas + shared components |
| Admin pages | 12 | Sidebar + data tables + shared components |
| Teams pages | 9 | Sidebar + equity grid + shared components |
| Embed + Shared | 2 | MarketingLayoutShell + embed components |
| Special (not-found, error, etc.) | 4 | Various shells |
| **Total** | **66** | |

---

## Implementation Order

1. Shared primitives (UnifiedPageShell, UnifiedSurface, UnifiedPageHeader, MarketingSection, CardV2)
2. MarketingLayoutShell + AuthenticationLayoutShell
3. Sidebar glass-morphism
4. Dashboard stat cards + WidgetCanvas surfaces
5. Data table styles
6. Loading/error/skeleton updates

# Qunt Edge Home Page — "Electric Obsidian" Enhancement

> **Design Direction:** Best of all 3 aesthetics — Bold & Electric + Refined & Premium + Dark Futurism
> **Date:** 2026-03-31
> **Status:** Approved for implementation

---

## 1. Concept & Vision

The home page is the first impression of Qunt Edge — a professional trading analytics platform. The "Electric Obsidian" direction amplifies the existing deep dark aesthetic into something that feels like stepping into a high-frequency trading terminal that's been designed by a premium studio. Every element glows with intent: precision blue light bleeding through glass, data that pulses with life, typography that commands authority.

The three aesthetic pillars blend into one coherent vision:
- **Bold & Electric**: Intense precision blue glows, dramatic layered mesh gradients, kinetic hero animation with depth
- **Refined & Premium**: Restrained whitespace between sections, precise typographic hierarchy, subtle glass transitions
- **Dark Futurism**: Terminal-style monospace data accents, subtle grid overlays, live animated counters, neon data highlights

---

## 2. Design Language

### Aesthetic Direction
Dark futuristic premium — like a Bloomberg Terminal designed by Apple. Deep obsidian backgrounds with precision blue (#2962FF) as the dominant accent. Data feels alive. Glass surfaces refract light. Everything has depth.

### Color Palette
| Role | Token | Value | Usage |
|------|-------|-------|-------|
| Brand Accent | `--v2-accent` | `oklch(0.55 0.22 264)` | Precision Blue — #2962FF |
| Accent Hover | `--v2-accent-hover` | `oklch(0.65 0.22 264)` | Lighter blue for hover states |
| Accent Subtle | `--v2-accent-subtle` | `oklch(0.55 0.22 264 / 0.15)` | 15% fill |
| Success | `--v2-success` | `oklch(0.55 0.15 166)` | Gain Green |
| Warning | `--v2-warning` | `oklch(0.65 0.2 45)` | Caution Orange |
| Error | `--v2-error` | `oklch(0.6 0.2 15)` | Loss Red |
| Background | `--v2-bg-base` | `oklch(0 0% 1%)` | Deep Obsidian — #000000 |
| Surface | `--v2-bg-surface` | `oklch(0.07 0 0)` | Card backgrounds |
| Text Primary | `--v2-text-primary` | `oklch(0.95 0 0)` | Near-white |
| Text Secondary | `--v2-text-secondary` | `oklch(0.65 0.01 275)` | Muted text |
| Border | `--v2-border` | `oklch(0.14 0 0)` | Subtle borders |

### Typography
- **Display**: `Cormorant_Garamond` — serif authority for hero headlines
- **Body**: `Geist` — clean sans-serif for all body text
- **Mono**: `IBM_Plex_Mono` — terminal aesthetic for data/numbers/stats
- **Fluid type scale**: `fluid-4xl` through `fluid-7xl` for hero, `fluid-xl` through `fluid-2xl` for section headlines
- **Text effects**: `.text-gradient-primary` (blue-purple gradient), `.text-shadow-glow-primary` for dramatic text

### Spatial System
- Section vertical rhythm: `py-24` (desktop) / `py-16` (mobile)
- Card internal padding: `p-6` to `p-8`
- Generous whitespace between sections — breathing room is premium
- Borderless sections (`.home-borderless`) for seamless visual flow

### Motion Philosophy
- **Entrance**: Scroll-triggered staggered fade + slide-up, 0.6s duration, spring easing `[0.25, 0.46, 0.45, 0.94]`
- **Hover**: Spring-based scale (1.02-1.05), lift (-4px), shadow expansion, glow pulse
- **Counters**: Smooth rAF-based number animation with cubic ease-out
- **Backgrounds**: Slow drift animations (10-15s), subtle pulse (2-3s)
- **Charts**: Smooth data transitions, animated entrance
- **Reduced motion**: All animations respect `prefers-reduced-motion`

### Visual Assets
- **Icons**: Lucide React, stroke width 1.5-2
- **Charts**: Recharts with custom precision blue / gain green / loss red color scheme
- **Backgrounds**: Layered CSS radial gradients + 72px grid pattern + noise texture overlay
- **No external images** — all visuals are CSS/SVG/React components

---

## 3. Layout & Structure

### Page Structure (unchanged — 14 sections)
```
1. Hero                    — Full viewport, layered gradient background
2. LiveStatsStrip         — Animated counter strip
3. ProblemStatement       — Two-column framing
4. FeaturesBento          — 6-card responsive bento grid
5. HowItWorks             — 5-step pipeline
6. AnalysisDemo           — Two-panel: chart + AI signals
7. AudienceSegmentation    — Two-audience split
8. AIFeatures             — 6-card AI grid
9. SocialProof            — Stats + testimonials
10. TrustAndProof         — Trust architecture
11. ComparisonSection      — Feature comparison
12. RollingAdBanner        — Server: infinite marquee
13. PricingSection        — 3-tier pricing
14. FAQSection             — Accordion
15. FinalCTA              — Closing CTA
```

### Background Layer (in `HomeContent.tsx`)
Add animated mesh gradient layer on top of existing static radials:
```css
/* Existing static radials remain */
background radial gradients at 20% and 80% positions

/* New animated layer */
.marketing-orb /* Already exists — keep as-is, animated drift */
.marketing-pulse /* Already exists — keep as-is, subtle pulse */

/* New: enhanced mesh with drift */
.bg-mesh-animated /* Already exists — enable/verify drift animation */
```

### Responsive Strategy
- Mobile-first Tailwind breakpoints: `sm:` (640px), `lg:` (1024px), `xl:` (1280px)
- Bento grid: 1 col (mobile) → 2 col (sm) → 4 col (lg)
- Navigation: Desktop navbar → Mobile Sheet (slide-out)
- Typography: Fluid scale handles all sizes automatically

---

## 4. Features & Interactions

### 4.1 Hero Section Enhancements

**Visual Changes:**
- Add `bg-mesh-hero` with animated drift (`animate-mesh-drift`)
- Increase glow intensity on the badge (`.glow-active` or `.shadow-glow-primary-md`)
- Make the headline gradient text more dramatic (`text-gradient-primary` class)
- Add a subtle scan-line animation overlay to the `DashboardPreview` component
- Add a floating particle/orb layer behind the dashboard preview

**Interactions:**
- Magnetic button effect on CTA button (using `MagneticButton`)
- Enhanced hover on the broker strip icons (subtle glow on hover)
- Dashboard preview: add a subtle ambient glow pulse

**Files:** `Hero.tsx`, `DashboardPreview.tsx`

### 4.2 Live Stats Strip Enhancements

**Visual Changes:**
- Use `IBM_Plex_Mono` font for the numbers (monospace terminal aesthetic)
- Add a subtle glow pulse on the numbers while animating
- Add a separator gradient between stats
- Make the background glassmorphic (`glass-surface` or `marketing-glass`)

**Interactions:**
- Enhanced counter animation: spring easing, not just linear
- On mobile: horizontal scroll with snap points

**Files:** `LiveStatsStrip.tsx`

### 4.3 Feature Cards (Bento + AIFeatures)

**Visual Changes:**
- Upgrade card style: use `GlassCard` with `variant="strong"` or `.glass-card-premium`
- Add accent border glow on hover (`.glass-card-accent` style)
- Add a subtle inner highlight on the top edge of cards
- Use `.text-gradient-primary` on card titles
- Add icon glow effect (accent-colored icon container with subtle light)

**Interactions:**
- Enhanced hover: `InteractiveWrapper` with `hover="glow"` (not just lift)
- Staggered entrance animation with longer delays for visual drama

**Files:** `FeaturesBento.tsx`, `AIFeatures.tsx`

### 4.4 Analysis Demo (Chart + AI Signals)

**Visual Changes:**
- Enhance chart area: add gradient fill to the area chart
- Add grid lines with subtle accent color
- Style the AI signal panel with terminal aesthetics (monospace text, subtle scan line)
- Add a glowing dot indicator for "live" AI analysis
- Use `.glass-card-accent` for the chart container

**Interactions:**
- Smooth chart entrance animation
- Rotating AI signals (existing) — speed up slightly to 1700ms or add a subtle glow transition

**Files:** `AnalysisDemo.tsx`, `analysis-demo-chart.tsx`

### 4.5 How It Works (Pipeline)

**Visual Changes:**
- Add glowing node indicators for each step (accent-colored dot with pulse)
- Use gradient connecting lines (blue to purple)
- Add a subtle glow trail along the connecting line
- Number indicators: accent-colored with glow

**Interactions:**
- Staggered reveal of steps on scroll
- Hover on step: subtle scale + glow

**Files:** `HowItWorks.tsx`

### 4.6 Audience Segmentation

**Visual Changes:**
- Add gradient borders to the two audience cards
- Use `.glass-card-premium` for card backgrounds
- Add a subtle inner glow on the accent side (left edge)
- Typography: use fluid headings with text gradient

**Interactions:**
- Enhanced slide-in animation with spring easing
- Hover: add glow border effect

**Files:** `AudienceSegmentation.tsx`

### 4.7 Social Proof / Testimonials

**Visual Changes:**
- Quote marks: use large accent-colored decorative SVG quote marks
- Avatar rings: add accent-colored ring around avatar
- Stats numbers: monospace font, subtle glow
- Card style: `.marketing-panel` or `.glass-card`

**Interactions:**
- Testimonial cards: subtle hover lift + shadow

**Files:** `SocialProof.tsx`

### 4.8 Comparison Section

**Visual Changes:**
- Table rows: alternating subtle background (zebra striping with `v2-bg-surface`)
- Active/highlighted row: accent-tinted background
- Checkmarks: accent-colored Lucide icons with subtle glow
- X marks: `--v2-error` color

**Interactions:**
- Row hover: subtle background shift + left border accent

**Files:** `ComparisonSection.tsx`

### 4.9 Pricing Section

**Visual Changes:**
- Featured plan (middle): use `.glass-card-accent` (blue border glow)
- Price numbers: `IBM_Plex_Mono` monospace font
- CTA buttons: `variant="gradient-primary"` for featured, `variant="outline"` for others
- Add a subtle radial glow behind the featured card
- Use `CardStatusDot` with `status="live"` on the featured plan

**Interactions:**
- Toggle animation: smooth spring transition between monthly/annual
- Card hover: enhanced glow on featured plan

**Files:** `PricingSection.tsx`

### 4.10 FAQ Section

**Visual Changes:**
- Accordion items: `.marketing-panel` style with subtle border
- Active item: accent-colored left border indicator
- Plus/minus icons: accent-colored

**Interactions:**
- Smooth height animation on accordion toggle
- Hover: subtle background shift

**Files:** `FAQSection.tsx`

### 4.11 Final CTA

**Visual Changes:**
- Enhance ambient glow (stronger radial gradient behind text)
- Add subtle animated grid overlay
- Button: `MagneticButton` with `variant="gradient-primary"`

**Interactions:**
- Button: magnetic hover + glow on hover

**Files:** `FinalCTA.tsx`

### 4.12 Navigation (Navbar)

**Visual Changes:**
- Increase glass blur intensity (`.glass-strong` effect)
- Add accent-colored underline on active nav link
- Logo: add subtle glow on hover
- CTA button: use `variant="gradient-primary"` with glow shadow

**Interactions:**
- Mobile menu: enhanced Sheet with glass effect
- Nav link hover: underline animation with spring

**Files:** `app/[locale]/(landing)/components/navbar.tsx`

### 4.13 Rolling Ad Banner

**Visual Changes:**
- Edge fade masks: stronger gradient masks
- Text: monospace font for numbers in firm names
- Add subtle glow to active/highlighted items

**Files:** `RollingAdBanner.tsx`

### 4.14 Footer

**Visual Changes:**
- Add subtle glass effect to footer container
- Links: hover with accent color transition
- Social icons: accent color on hover with glow

**Files:** `app/[locale]/(landing)/components/footer.tsx`

---

## 5. Component Inventory

### New/Enhanced Components

| Component | Type | Change |
|----------|-------|--------|
| `Hero.tsx` | Client | Enhanced glow, animated mesh, magnetic CTA |
| `DashboardPreview.tsx` | Static | Scan line animation, ambient glow pulse |
| `LiveStatsStrip.tsx` | Client | Mono font numbers, glass background, enhanced counter |
| `FeaturesBento.tsx` | Client | GlassCard premium, hover glow, stagger |
| `HowItWorks.tsx` | Client | Glowing nodes, gradient connecting line |
| `AnalysisDemo.tsx` | Client | Terminal aesthetic, chart gradient fill |
| `analysis-demo-chart.tsx` | Client | Gradient area, accent grid lines |
| `AudienceSegmentation.tsx` | Client | Gradient borders, glass premium cards |
| `AIFeatures.tsx` | Client | GlassCard premium, icon glow |
| `SocialProof.tsx` | Client | Decorative quotes, mono stats, avatar rings |
| `ComparisonSection.tsx` | Client | Zebra rows, accent checkmarks |
| `PricingSection.tsx` | Client | Featured card glow, mono prices, MagneticButton |
| `FAQSection.tsx` | Client | Accent indicators, panel style |
| `FinalCTA.tsx` | Client | Enhanced ambient glow, MagneticButton |
| `HomeContent.tsx` | Client | Ensure animated mesh layer active |
| `navbar.tsx` | Client | Stronger glass, accent underlines |
| `footer.tsx` | Server | Glass effect, accent hover |
| `RollingAdBanner.tsx` | Server | Mono font accents |

### CSS Additions (globals.css / tokens.css)

New keyframes to add:
- `animate-mesh-drift` — slow diagonal drift for mesh gradient
- `animate-glow-pulse` — subtle ambient glow pulse
- `animate-orb-float` — floating orb animation for hero

---

## 6. Technical Approach

### Framework & Libraries
- **Next.js 15 App Router** — Server/Client component boundaries preserved
- **Framer Motion** — All animations (existing dependency)
- **Tailwind CSS 4** — Styling with CSS custom properties
- **React** — Component architecture

### Constraints
- **Zero new dependencies** — use only existing packages
- **Zero design system changes** — use only existing `--v2-*`, `--mk-*`, `--glass-*` tokens
- **Zero route changes** — page structure unchanged
- **Zero breaking changes** — all enhancements additive
- **SSR-safe** — animations wrapped in `use client` where needed
- **`prefers-reduced-motion`** — all animations respect this media query

### Animation Architecture
- All Framer Motion components: `initial` → `whileInView` with `viewport={{ once: true }}`
- Spring presets from `_constants.ts`: `MOTION_EASE = [0.25, 0.46, 0.45, 0.94]`
- CSS animations for continuous effects (marquee, orbs, pulses)
- No layout shift — all animated elements have explicit dimensions

### File Modification Map

**Primary changes (9 files):**
- `app/[locale]/(home)/components/Hero.tsx`
- `app/[locale]/(home)/components/DashboardPreview.tsx`
- `app/[locale]/(home)/components/LiveStatsStrip.tsx`
- `app/[locale]/(home)/components/FeaturesBento.tsx`
- `app/[locale]/(home)/components/HowItWorks.tsx`
- `app/[locale]/(home)/components/AnalysisDemo.tsx`
- `app/[locale]/(home)/components/analysis-demo-chart.tsx`
- `app/[locale]/(home)/components/PricingSection.tsx`
- `app/[locale]/(home)/components/FinalCTA.tsx`

**Secondary changes (8 files):**
- `app/[locale]/(home)/components/HomeContent.tsx`
- `app/[locale]/(home)/components/AudienceSegmentation.tsx`
- `app/[locale]/(home)/components/AIFeatures.tsx`
- `app/[locale]/(home)/components/SocialProof.tsx`
- `app/[locale]/(home)/components/ComparisonSection.tsx`
- `app/[locale]/(home)/components/FAQSection.tsx`
- `app/[locale]/(landing)/components/navbar.tsx`
- `app/[locale]/(landing)/components/footer.tsx`

**CSS additions (1 file):**
- `app/globals.css` — add 2-3 new keyframe animations

**No changes to:**
- Routing, API, data fetching, server actions
- Dashboard pages, admin pages
- Server components (TrustAndProof, WhyChooseUs, RollingAdBanner)
- Provider chain, middleware

---

## 7. Success Criteria

1. Build passes: `npm run build` exits with code 0
2. TypeScript clean: `npm run typecheck` passes
3. Lint clean: `npm run lint` passes (or pre-existing budget maintained)
4. All 14 sections render correctly on desktop and mobile
5. Animations trigger on scroll (Framer Motion `whileInView`)
6. Hover effects work on all interactive elements
7. `prefers-reduced-motion` users see no animation (graceful degradation)
8. No CLS (Cumulative Layout Shift) — all animated elements have explicit dimensions
9. Glass effects visible on cards and navigation
10. Gradient text renders correctly on all browsers
11. Monospace numbers display correctly in stats/pricing
12. Navbar remains fixed and functional on all pages

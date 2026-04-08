# Qunt Edge Landing Pages — Styleseed × Resend/Expo

> **Design Direction:** Cinematic dark void (Resend) + pill-organic geometry (Expo) + Styleseed layout engine
> **Date:** 2026-04-08
> **Status:** Draft — pending user review

---

## 1. Concept & Vision

Qunt Edge's marketing surfaces — home page + landing pages — get a design refresh that feels like a Bloomberg Terminal reimagined by the team behind Resend. The page lives in **pure black void** where content floats as illuminated cards, connected by the signature **icy frost borders** (blue-tinted, semi-transparent). Geometry is **pill-organic** (Expo DNA) — every button, badge, and container breathes with generous rounded corners. Typography is **Inter-only** (Expo simplicity) with aggressive negative tracking on display sizes. The result: premium, confident, cinematic — a trading analytics platform that looks like it costs $10K/month.

**Three aesthetic pillars:**
- **Void Canvas:** Pure `#000000` background — nothing competes with content
- **Frost Borders:** `rgba(214, 235, 253, 0.19)` — icy blue-tinted borders that catch light in the dark
- **Pill Geometry:** 9999px radius on CTAs, 16–24px on cards — organic, approachable, premium

---

## 2. Design Language

### Aesthetic Direction
Cinematic dark SaaS — Resend's theatrical void meets Expo's confident pill geometry. Deep black backgrounds, frost-border cards floating in darkness, pill-shaped CTAs that glow on hover.

### Color Palette (CSS Variables → `app/globals.css`)

```css
:root {
  /* === Brand Accent (from Resend multi-color system) === */
  --accent-orange: #ff801f;
  --accent-orange-subtle: rgba(255, 89, 0, 0.15);
  --accent-blue: #3b9eff;
  --accent-blue-subtle: rgba(0, 117, 255, 0.12);
  --accent-green: #11ff99;
  --accent-green-subtle: rgba(17, 255, 153, 0.12);
  --accent-red: #ff2047;

  /* === Surface & Background === */
  --background: #000000;           /* Void black — the canvas */
  --foreground: #f0f0f0;           /* Near white — primary text */
  --card: #0a0a0a;                /* Slightly lifted from void */
  --card-foreground: #f0f0f0;
  --popover: #111111;
  --popover-foreground: #f0f0f0;

  /* === Borders & Shadows === */
  --frost-border: rgba(214, 235, 253, 0.19);   /* Signature — Resend's icy border */
  --frost-border-alt: rgba(217, 237, 254, 0.12);
  --ring-shadow: rgba(176, 199, 217, 0.145) 0px 0px 0px 1px;

  /* === Secondary & Muted === */
  --secondary: #111111;
  --secondary-foreground: #a1a4a5;
  --muted: #1a1a1a;
  --muted-foreground: #6a6a6a;
  --accent: #1a1a1a;
  --accent-foreground: #f0f0f0;

  /* === Text Hierarchy === */
  --text-primary: #f0f0f0;        /* Near white */
  --text-secondary: #a1a4a5;       /* Silver — Resend's body text */
  --text-tertiary: #6a6a6a;       /* Dark gray — descriptions */
  --text-disabled: #464a4d;        /* Mid gray — inactive */
  --icon-default: #6a6a6a;

  /* === Status Colors === */
  --destructive: #ff2047;
  --destructive-foreground: #ffffff;
  --success: #11ff99;
  --success-foreground: #000000;
  --warning: #ffc53d;
  --warning-foreground: #000000;
  --info: #3b9eff;
  --info-foreground: #000000;

  /* === Chart Colors === */
  --chart-1: #3b9eff;
  --chart-2: #11ff99;
  --chart-3: #ff801f;
  --chart-4: #8145b5;
  --chart-5: #ffc53d;

  /* === Radius === */
  --radius: 0.625rem;              /* 10px base */

  /* === Shadows === */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-card-hover: 0 2px 6px rgba(0,0,0,0.06);
  --shadow-elevated: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-modal: 0 8px 24px rgba(0,0,0,0.12);

  /* === Motion === */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 350ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Typography (Inter-only, Expo simplicity)
- **Font:** Inter — single typeface, full weight range (400–700)
- **Display:** 56–72px, weight 700–800, tracking `-0.02em to -0.03em`, line-height 1.0
- **Section heading:** 32–48px, weight 600, tracking `-0.02em`, line-height 1.1
- **Sub-heading:** 20px, weight 600, tracking `-0.01em`, line-height 1.2
- **Body:** 16–18px, weight 400, tracking `0`, line-height 1.5
- **Caption/Label:** 12–14px, weight 500, tracking `0.05em` (uppercase labels)

### Border Radius Scale (Expo pill-organic)
| Element | Radius | Tailwind |
|---------|--------|---------|
| Buttons (ghost/outline) | 4px | `rounded` |
| Cards | 16px | `rounded-2xl` |
| Badges | 9999px | `rounded-full` |
| Primary CTA | 9999px | `rounded-full` |
| Feature cards | 16px | `rounded-2xl` |
| Code blocks | 16px | `rounded-2xl` |
| Nav pills | 9999px | `rounded-full` |

### Shadows (Resend: border-based, not shadow-based)
Primary depth mechanism: **frost border** (`1px solid rgba(214,235,253,0.19)`) instead of shadow.
- Cards: frost border + `shadow-card` (whisper)
- Cards on hover: frost border brightens slightly
- No heavy shadows on dark — borders catch the light

### Motion Philosophy
- **Entrance:** Fade + slide-up, 200–300ms, spring easing
- **Hover:** Scale 1.02, frost border brightens, subtle glow
- **CTA:** Pill button glow pulse on hover (`box-shadow` with accent color)
- **Reduced motion:** All animations respect `prefers-reduced-motion`

---

## 3. Layout & Structure

### Home Page Sections (14 sections, existing structure — restyled)

```
1. Hero              — Full viewport, void black, frosted card preview
2. LiveStatsStrip    — Mono-font counters, frost border strip
3. ProblemStatement  — Two-column, frost card
4. FeaturesBento     — 6-card bento grid, frost cards
5. HowItWorks        — 5-step pipeline, glowing nodes
6. AnalysisDemo      — Chart + AI signals, terminal aesthetic
7. AudienceSegmentation — Two-audience split, gradient borders
8. AIFeatures        — 6-card grid, accent-tinted cards
9. SocialProof       — Stats + testimonials, frost cards
10. TrustAndProof    — Logo strip, muted
11. ComparisonSection — Feature table, frost rows
12. RollingAdBanner   — Marquee, mono-font accents
13. PricingSection   — 3-tier, featured card frost-glow
14. FAQSection       — Accordion, frost borders
15. FinalCTA         — Closing CTA, pill button
```

### Landing Pages (existing — restyled)
- `/pricing` — pricing cards with frost borders
- `/faq` — accordion with frost borders
- `/propfirms` — firm cards with accent colors
- `/blogs` — blog cards with frost borders
- `/community` — social proof section
- All nav/footer from landing layout

### Layout Rules (Styleseed)
- Page max-width: `1360px` centered
- Section gap: `space-y-24` (96px)
- Card padding: `p-6` to `p-8`
- Page horizontal padding: `px-6`
- Single floating card: `mx-6` (margins)
- Multi-card grid: `px-6` (padding)

---

## 4. Component Inventory

### Buttons
| Variant | Style |
|---------|-------|
| Primary Pill | `bg-white text-black rounded-full px-6 py-2.5` — white solid, no border |
| Ghost Pill | `bg-transparent text-[#f0f0f0] rounded-full border border-[rgba(214,235,253,0.19)] hover:bg-white/10` |
| Accent Pill | `bg-[rgba(0,117,255,0.15)] text-[#3b9eff] rounded-full border border-[rgba(59,158,255,0.3)]` |
| Icon Ghost | `bg-transparent text-[#a1a4a5] rounded-lg hover:text-[#f0f0f0]` |

### Cards
```tsx
// Standard card — frost border, no shadow-heavy
<div className="rounded-2xl border border-[rgba(214,235,253,0.19)] bg-[#0a0a0a] p-6" />

// Featured card — brighter frost border
<div className="rounded-2xl border border-[rgba(214,235,253,0.25)] bg-[#0a0a0a] p-6" />

// Accent card — blue-tinted
<div className="rounded-2xl border border-[rgba(0,117,255,0.25)] bg-[rgba(0,117,255,0.05)] p-6" />
```

### Navigation
- Frost border bottom: `1px solid rgba(214,235,253,0.19)`
- Links: 14px Inter weight 500, `text-[#a1a4a5]`, hover `text-[#f0f0f0]`
- CTA: white pill button right-aligned

### Badges/Accents
```tsx
// Multi-color accent badges (Resend style)
<span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,129,31,0.3)] bg-[rgba(255,89,0,0.12)] px-3 py-1 text-xs font-medium text-[#ff801f]">
  New Feature
</span>
```

---

## 5. File Modification Map

### CSS (1 file)
- `app/globals.css` — Add CSS custom properties (color tokens above), preserve existing V2 tokens

### Home Page Components (14 files in `app/[locale]/(home)/components/`)
All components restyled to use frost borders, pill CTAs, Inter typography, Resend/Expo color palette.

### Landing Page Components (in `app/[locale]/(landing)/components/`)
- `navbar.tsx` — Frost nav bar
- `footer.tsx` — Frost footer
- `pricing.tsx` — Restyle pricing cards
- `faq.tsx` — Restyle accordion
- Landing page cards (propfirms, blogs, community) — frost borders

### Constraints
- **Zero new dependencies** — Inter font already available
- **Zero route changes** — all existing URLs preserved
- **Zero breaking changes** — all restyles additive/refined
- **`prefers-reduced-motion`** — all animations respect this

---

## 6. Success Criteria

1. All pages render on `#000000` void background
2. All cards use frost borders (`rgba(214,235,253,0.19)`)
3. All CTA buttons are pill-shaped (9999px radius)
4. Typography is Inter-only with correct tracking/size hierarchy
5. Multi-color accent badges use Resend palette (orange/blue/green/red)
6. Build passes: `npm run build` exits code 0
7. TypeScript clean: `npm run typecheck` passes
8. Lint clean: `npm run lint` passes
9. Responsive on mobile (single column) and desktop
10. `prefers-reduced-motion` users get no animation

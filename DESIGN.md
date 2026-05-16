# Qunt Edge Design System — Cobalt Void

> **Aesthetic**: macOS-inspired dark theme with purple/cobalt accents and premium depth.
> **Goal**: Deep, rich darkness with electric cobalt highlights — trading infrastructure as a refined instrument.

---

## 1. Philosophy

Qunt Edge is professional trading analytics. The UI feels like a Bloomberg terminal crossed with a premium SaaS product — dark, data-dense, with purple-tinted depth and deliberate refinement.

**Core DNA:**
- Void-black backgrounds that anchor all content
- Purple/cobalt-tinted frost borders — the signature element
- Layered surface hierarchy with near-black purple tones
- Premium ultra-deep shadows for elevation
- Pill-shaped interactive elements for CTAs
- Glassmorphism effects for overlays and modals
- 8pt spacing grid for consistent rhythm

**What we keep from the token system:**
- CSS custom properties as single source of truth
- `unified-page-recipes.ts` for shared panel classes
- `UnifiedPageShell` / `UnifiedSurface` layout primitives
- CVA-based variant architecture
- Dark-only surface enforcement via feature flag

---

## 2. Color System

### Base Palette (Dark Theme Only)

```css
/* Void — the defining canvas */
--background: #000000;                      /* Pure black base */

/* Surfaces — purple-tinted darkness */
--card: #0e0c1c;                            /* Card surface */
--popover: #110f1f;                         /* Popover surface */
--sidebar: #0c0a18;                         /* Sidebar background */
--muted: #181428;                           /* Muted background */
--secondary: #1e1a2e;                       /* Secondary surface */

/* Interactive surfaces */
--surface-hover: #1c1838;                   /* Hover state */
--surface-overlay: rgba(255,255,255,0.85);  /* Overlay */
```

### Primary & Accent

```css
/* Primary — electric purple */
--primary: #8b5cf6;
--primary-foreground: #f8f6ff;

/* Ring / focus */
--ring: #7c3aed;
```

### Semantic Colors

```css
/* Success — profit green */
--success: #22c55e;
--success-foreground: #f0fdf4;

/* Warning — amber */
--warning: #f59e0b;
--warning-foreground: #fffbeb;

/* Error / Destructive — red */
--destructive: #dc2626;
--destructive-foreground: #fff1f2;

/* Muted text */
--muted-foreground: #8b82a8;

/* Secondary text */
--secondary-foreground: #c4b8e8;
```

### Frost Border System (THE SIGNATURE)

Purple-tinted frost borders at low opacity — micro-contrast on dark surfaces.

```css
/* Frost levels */
--frost-border: rgba(139,92,246,0.04);           /* Subtle — list items */
--frost-border-strong: rgba(139,92,246,0.10);     /* Emphasis, focus */

/* Border defaults */
--border: #1e1a30;                                /* Default structural */
--border-subtle: rgba(0,0,0,0.08);               /* Divider */

/* Frost glow */
--frost-glow: 0 18px 60px -26px rgba(139,92,246,0.2);

/* Ambient glow */
--v2-glow-ambient: 0 18px 60px -26px rgba(139,92,246,0.2);
```

### Interactive States

```css
/* Hover — white glass effect */
--hover-glass: rgba(255,255,255,0.08);
--hover-glass-strong: rgba(255,255,255,0.14);

/* Focus ring */
--focus-ring: 0 0 0 2px var(--ring), 0 0 0 8px var(--background);
```

---

## 3. Typography

### Font Stack

```css
/* 7 Google fonts loaded as CSS variables */
--font-sans: 'Geist', 'DM_Sans', 'Outfit', 'Poppins', system-ui;  /* Body/UI */
--font-serif: 'Cormorant Garamond';                                 /* Display/hero */
--font-mono: 'IBM Plex Mono', 'Roboto Mono', monospace;             /* Code/data */
```

### Scale

| Role | Size | Weight | Usage |
|------|------|--------|-------|
| Display | clamp(2.25rem, 5.4vw, 4.8rem) | 500 | Hero headlines |
| H1 | 2.5rem / 40px | 600 | Page titles |
| H2 | 1.75rem / 28px | 600 | Section headings |
| H3 | 1.25rem / 20px | 600 | Subsection |
| Body | 0.9375rem / 15px | 450 | Standard text |
| Body Small | 0.875rem / 14px | 400 | Secondary text |
| Caption | 0.72rem / 11.5px | 600 | Labels, eyebrows |
| Code | 0.875rem / 14px | 400 | Inline code |

### Tracking

| Role | Value |
|------|-------|
| Display | `-0.04em` |
| Eyebrow/Label | `0.16em - 0.18em` (uppercase) |
| Body | `0` |

---

## 4. Shadows & Depth

Layered shadows for premium depth on dark surfaces.

```css
/* Level 0 — Flat */
shadow: none;

/* Level 1 — Subtle */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);

/* Level 2 — Standard */
--shadow: 0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);

/* Level 3 — Elevated */
--shadow-lg: 0 8px 24px rgba(0,0,0,0.09), 0 4px 8px rgba(0,0,0,0.04);

/* Level 4 — Ultra premium */
--shadow-ultra-md: 0 2px 4px rgba(0,0,0,0.30), 0 8px 20px rgba(0,0,0,0.28);

/* Level 5 — Deep */
--shadow-ultra-lg: 0 4px 8px rgba(0,0,0,0.25), 0 12px 28px rgba(0,0,0,0.30);

/* Panel shadows (used in unified-page-recipes) */
shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]   /* Hero panels */
shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]    /* Section panels */

/* Accent glow */
--frost-glow: 0 18px 60px -26px rgba(139,92,246,0.2);
```

---

## 5. Spacing System

Base unit: **4px** (8pt grid)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Icon-text gaps |
| `--space-3` | 12px | Button padding-x |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Comfortable padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section gaps |
| `--space-10` | 40px | Large gaps |
| `--space-12` | 48px | Hero spacing |
| `--space-16` | 64px | Section padding-y |

---

## 6. Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, small elements |
| `--radius` | 10px | Default |
| `--radius-md` | 10px | Cards |
| `--radius-lg` | 14px | Large cards |
| `--radius-xl` | 20px | Feature cards |
| `--radius-2xl` | 28px | Section containers, hero panels |
| `--radius-pill` | 9999px | CTAs, badges, chips |

---

## 7. Unified Panel Recipes

Shared classes from `components/layout/unified-page-recipes.ts`:

```typescript
// Hero panel — top-level page header
unifiedHeroPanelClassName =
  'relative rounded-2xl border border-border/35 bg-card shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]'

// Section panel — standard content sections
unifiedSectionPanelClassName =
  'rounded-2xl border border-border/35 bg-card/80 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)]'

// Inset panel — nested cards within sections
unifiedInsetPanelClassName =
  'rounded-xl border border-border/30 bg-background/50'

// Metric panel — stat displays
unifiedMetricPanelClassName =
  'rounded-xl border border-border/30 bg-background/40'

// Chip — eyebrow labels
unifiedChipClassName =
  'rounded-full border border-primary/14 bg-primary/6'

// Ghost action — secondary CTA
unifiedGhostActionClassName =
  'rounded-full border border-border/35 bg-background/40'

// Primary action — main CTA
unifiedPrimaryActionClassName =
  'rounded-xl bg-primary text-primary-foreground'
```

---

## 8. Layout Primitives

### UnifiedPageShell

Wrapper for all page-level content. Provides max-width, padding, and decorative pseudo-elements.

```tsx
<UnifiedPageShell widthClassName="max-w-[1360px]" className="py-12">
  {children}
</UnifiedPageShell>
```

- `widthClassName`: Default `WORKSPACE_SHELL_WIDTH`, override for wider pages
- `density`: `'default' | 'compact' | 'spacious'`
- `variant`: `'default' | 'refined' | 'minimal'` (minimal skips decorative pseudo-elements)

### UnifiedSurface

Reusable section wrapper with variant support.

```tsx
<UnifiedSurface variant="glass" hover>
  {children}
</UnifiedSurface>
```

Variants: `'default' | 'glass' | 'gradient-border' | 'elevated' | 'subtle'`

---

## 9. Animations

```css
/* Standard transitions */
transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]

/* Page enter */
animate-page-enter

/* Fade up */
animate-fade-up-smooth

/* Scale reveal (staggered) */
animate-scale-reveal
animate-scale-reveal-d1   /* +100ms delay */
animate-scale-reveal-d2   /* +200ms delay */
animate-scale-reveal-d3   /* +300ms delay */
```

---

## 10. Feature Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `DARK_ONLY_SURFACE_ENFORCEMENT` | `true` | Forces dark theme on all surfaces |

Managed in `lib/feature-flags.ts`.

# Qunt Edge Design System — Professional Trading Terminal

> **Aesthetic**: Professional, data-dense dark trading interface with Deep Purple accents on pure black.
> **Goal**: A clean, high-contrast, functional trading platform that feels fast, trustworthy, and focused on data.

---

## 1. Philosophy

Qunt Edge is a **professional trading analytics platform**. The UI treats the dashboard as a trading terminal — fast, clear, and data-first — while allowing richer visual design on marketing and landing pages.

**Core Principles:**
- Data density over decoration
- High readability for numbers and tables
- Strong semantic colors (Green = Profit, Red = Loss, Amber = Warning)
- Minimal visual noise
- Consistent, tight spacing
- Professional and trustworthy, not "flashy"
- Performance-first: minimal CSS, no heavy effects
- Excellent experience on both normal and high-resolution screens (up to 12K)

**Dual Aesthetic:**

| Context | Rule |
|---------|------|
| **Dashboard** | Clean trading terminal — strict rules, no decorative effects, solid surfaces, minimal shadows |
| **Marketing / Landing** | Richer visual design allowed — subtle gradients, hover effects, entrance animations — but still no glassmorphism or glow |

**What we are NOT:**
- We are not a luxury SaaS with heavy glassmorphism or frosted glass effects.
- We do not use glowing orbs, decorative mesh gradients, or animated gradient backgrounds.
- We avoid large gradients, heavy shadows (over 16px spread), and excessive animation.
- We do not blur backgrounds with `backdrop-filter` for decorative purposes.

---

## 2. Color System

### Base Palette (Dark Theme — Primary)

```css
--background: #000000;           /* Main background */
--card: #000000;                 /* Card / panel background */
--popover: #000000;              /* Dropdowns, modals, popovers */
--sidebar: #000000;              /* Sidebar background */
--muted: hsl(260, 20%, 8%);     /* Muted backgrounds */
--border: hsl(260, 20%, 15%);   /* Default borders */
```

### Surface Tokens (Dark Theme)

Clean, solid surfaces with no blur or transparency effects:

```css
--surface-sidebar: #111111;      /* Sidebar panel */
--surface-toolbar: #1A1A1A;      /* Toolbar / header bar */
--surface-content: #0A0A0A;      /* Content area background */
--surface-panel: #1A1A1A;        /* Inner panels */
--surface-elevated: #1F1F1F;     /* Raised cards, hover state */
--surface-sheet: #1F1F1F;        /* Bottom sheets, drawers */
--surface-hover: #222222;        /* Hover highlight */
```

### Semantic Colors (Trading Critical)

Four semantic tokens, each with `-fg`, `-bg`, and `-border` variants:

```css
/* Success / Profit */
--semantic-success: 155 58% 39%;
--semantic-success-fg: 0 0% 100%;
--semantic-success-bg: 155 58% 39% / 0.08;
--semantic-success-border: 155 58% 39% / 0.25;

/* Error / Loss */
--semantic-error: 0 62% 55%;
--semantic-error-fg: 0 0% 100%;
--semantic-error-bg: 0 62% 55% / 0.08;
--semantic-error-border: 0 62% 55% / 0.25;

/* Warning / Caution — Amber, distinct from primary purple */
--semantic-warning: 38 92% 50%;
--semantic-warning-fg: 0 0% 0%;
--semantic-warning-bg: 38 92% 50% / 0.08;
--semantic-warning-border: 38 92% 50% / 0.25;

/* Info / Brand — Deep Purple */
--semantic-info: 263 85% 65%;
--semantic-info-fg: 0 0% 0%;
--semantic-info-bg: 263 85% 65% / 0.08;
--semantic-info-border: 263 85% 65% / 0.25;
```

### Legacy Trading Colors

```css
/* Profit / Positive */
--success: #0ECB81;
--success-foreground: #FFFFFF;

/* Loss / Negative */
--destructive: #F6465D;
--destructive-foreground: #FFFFFF;

/* Warning — Amber, NOT purple */
--warning: hsl(38, 92%, 50%);
--warning-foreground: #000000;

/* Primary Action (Deep Purple Accent) */
--primary: hsl(263, 85%, 65%);
--primary-foreground: #000000;

/* Text Hierarchy */
--foreground: #EAEAEA;           /* Primary text */
--muted-foreground: #888888;     /* Secondary / helper text */
--subtle-foreground: #666666;    /* Very low priority text */
```

### Accent (Branding)

**Deep Purple** (`hsl(263, 85%, 65%)`) is used for branding elements, focus states, and non-trading accents. Trading data (P&L, charts) must always use strong green/red. Warning states use **amber** (`hsl(38, 92%, 50%)`) — never the same purple as primary actions.

### Light Theme

A light theme exists for accessibility compliance. Key tokens:

```css
--background: #F2F2F7;
--card: #FFFFFF;
--primary: #007AFF;
--success: #1A7F37;
--destructive: #FF3B30;
--warning: #D35400;
```

Dark theme is the primary and default experience.

---

## 3. Typography

- **Font family**: DM Sans (variable weight, loaded as Google Font via `--font-dm-sans`)
  - Weights: 400 (regular) and 600 (semibold)
  - Fallback: system-ui, sans-serif
- **Mono font**: Geist Mono for code, data tables, and monospaced content
- Numbers must use **tabular-nums** (`font-variant-numeric: tabular-nums`) for alignment in trading data, prices, and P&L columns.
- Strong hierarchy:
  - Large titles: 24–32px, semibold (weight 600)
  - Section headers: 18–20px, medium
  - Body / data: 14px, regular (weight 400)
  - Small labels: 12px, semibold (weight 600)
- High contrast text on dark backgrounds.

---

## 4. Spacing & Layout (8pt Grid)

Follow the 8pt spacing grid:

- Component internal padding: `p-4` (16px) or `p-3` (12px) for dense areas
- Card to card / section gaps: `gap-4` or `gap-6`
- Very tight data lists: `gap-1` or `gap-2`
- **Tight data layouts**: `gap-3` (12px) is acceptable where data density requires it
- **Marketing sections**: `p-5` (20px) is acceptable for breathing room
- Generous spacing only where it improves clarity, not for decoration

On high-resolution screens (8K+), use the **2400px workspace cap** with responsive scaling.

**Core layout components:**
- `UnifiedPageShell` — page-level container with density options
- `UnifiedSurface` — surface wrapper with `default`, `elevated`, `subtle` variants
- `UnifiedPageHeader` — consistent page headers with title, description, and actions

---

## 5. Components

### Cards & Panels
- Variants: `default`, `elevated`, `outline` (plus `flat` for minimal contexts)
- **No** glass, frost, or gradient-border variants
- Background: solid `--card` or `--surface-panel`
- Border: subtle (`--border` at 30% opacity)
- Shadows: minimal — only `--shadow-panel` and `--shadow-widget` for layered surfaces
- Rounded: `rounded-lg` (8px) or `rounded-xl` for bigger containers
- No `backdrop-blur`, no frosted glass, no transparent card backgrounds

### Buttons
- Primary: Deep Purple (`hsl(263, 85%, 65%)`) with dark text, solid fill
- Ghost: Subtle borders, transparent background
- Destructive: Solid red (`--destructive`)
- All buttons should feel solid and responsive with press-scale feedback (`active:scale-[0.97]`)

### Tables & Lists
- Clean rows with subtle hover (`#1F1F1F`)
- Strong alignment for numbers using tabular-nums
- Green/Red text for P&L columns
- Minimal row borders

### Charts
- Clean lines, no decorative fills
- Green for positive / up, Red for negative / down
- Minimal grid lines
- High readability on large screens

### Forms & Inputs
- Clean borders, solid backgrounds
- Focus states using Deep Purple ring
- Consistent height: 40px (default) or 44px (comfortable)
- No glow effects on focus

### Sidebar
- Solid dark background (`--surface-sidebar: #111111`)
- No blur or transparency effects
- Clean text hierarchy with Deep Purple active indicator

### Dashboard Header
- Solid background with subtle bottom border
- No heavy shadows or blur effects
- Uses `--surface-toolbar` token

---

## 6. Do's and Don'ts

**Do:**
- Prioritize readability of numbers and data
- Use strong green/red for P&L
- Keep spacing consistent and tight
- Design for data density
- Use subtle borders and clean surfaces
- Use fast, subtle transitions (under 300ms)
- Use press-scale (`active:scale-[0.97]`) for responsive button feedback
- Respect `prefers-reduced-motion` — disable all animations for users who request it
- Use amber for warnings to keep them distinct from the purple primary
- Use the semantic token system (`--semantic-success`, `--semantic-error`, etc.) for consistent color usage

**Don't:**
- Use glassmorphism or frosted glass (`backdrop-blur`) effects
- Use glowing orbs, decorative mesh gradients, or animated gradient backgrounds
- Apply heavy shadows (over 16px spread)
- Use animations over 500ms in the dashboard
- Use the same color for warnings and primary actions (warning = amber, primary = purple)
- Apply decorative effects to the trading dashboard
- Use `variant="glass"` or `variant="frost"` on Card components
- Stretch content too wide on large screens without proper containers
- Use low-contrast text

---

## 7. Current Direction (2026)

Qunt Edge uses a **clean, professional trading terminal** aesthetic for the dashboard, with a subtly richer design for marketing/landing pages:

- **Dashboard**: minimal decoration, maximum clarity, solid surfaces, no decorative effects
- **Marketing**: gradients and hover effects allowed, but no glassmorphism or glowing effects
- Strong semantic trading colors with amber warnings distinct from purple primary
- Semantic token system (`--semantic-*`) for consistent color usage across components
- DM Sans typography with tabular-nums for data alignment
- Deep Purple accents on pure black
- Fast micro-interactions only (press-scale, subtle hover-lift)
- Consistent 8pt spacing with 2400px workspace cap
- Excellent experience from 1080p to 12K UHD
- Dark theme (primary) and light theme (accessibility) both supported

---

*Last updated: May 2026*

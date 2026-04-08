# Qunt Edge Design System — Resend-Inspired Refinement

> **Design Inspiration**: Resend's cinematic dark aesthetic, adapted for trading analytics.
> **Goal**: Premium, precise, quietly confident — trading infrastructure as a luxury product.

---

## 1. Philosophy

Qunt Edge is professional trading analytics. The UI should feel like a Bloomberg terminal designed by a premium SaaS company — dark, focused, data-dense, but with deliberate refinement in every interaction.

**Resend's DNA we're adopting:**
- Pure void backgrounds that make content pop
- Icy, blue-tinted frost borders — the signature element
- Pill-shaped interactive elements for primary CTAs
- Ring shadows instead of box shadows (invisible on pure black otherwise)
- Multi-color accent scale for semantic communication
- Commit Mono for code/data — monospace as a design element

**What we're keeping from current system:**
- The oklch color model (future-proof, perceptually uniform)
- The `v2-` token naming convention
- CVA-based variant architecture
- The overall dark palette (oklch 0-11% lightness)

---

## 2. Color System

### Base Palette (Dark Theme Only)

```css
/* Void — the defining canvas */
--void: oklch(0 0% 0%);           /* Pure black #000000 */
--void-95: oklch(0.95 0 0);       /* Near-black for subtle surfaces */

/* Primary text — theater-like contrast */
--text-primary: oklch(0.95 0 0);   /* #f0f0f0 */
--text-secondary: oklch(0.65 0.01 275);
--text-muted: oklch(0.45 0 0);

/* Surfaces — layered darkness */
--surface-base: oklch(0 0% 0%);          /* #000000 void */
--surface-raised: oklch(0.06 0 0);        /* Cards, elevated */
--surface-overlay: oklch(0.08 0 0);       /* Modals, dropdowns */
--surface-hover: oklch(0.10 0 0);          /* Interactive hover */
--surface-active: oklch(0.12 0 0);         /* Active/pressed state */
```

### Frost Border System (THE SIGNATURE)

Resend's most distinctive element — icy, blue-tinted borders at 19% opacity.

```css
/* Primary frost border — use everywhere structural */
--frost-border: rgba(214, 235, 253, 0.19);

/* Variants */
--frost-border-subtle: rgba(217, 237, 254, 0.12);  /* List items, dividers */
--frost-border-strong: rgba(214, 235, 253, 0.35);   /* Emphasis, focus */

/* Ring shadow — frost glow effect */
--frost-ring: rgba(176, 199, 217, 0.145) 0px 0px 0px 1px;

/* Legacy v2- tokens (mapped to frost) */
--v2-border: var(--frost-border);
--v2-border-subtle: var(--frost-border-subtle);
```

### Accent Scale

```css
/* Primary accent — electric blue (kept from current system) */
--accent: oklch(0.55 0.22 264);
--accent-hover: oklch(0.65 0.22 264);
--accent-subtle: oklch(0.55 0.22 264 / 0.15);
--accent-foreground: oklch(1 0 0);

/* Success — emerald green */
--success: oklch(0.55 0.15 166);
--success-subtle: oklch(0.55 0.15 166 / 0.15);

/* Warning — amber */
--warning: oklch(0.65 0.2 45);
--warning-subtle: oklch(0.65 0.2 45 / 0.15);

/* Error — coral red */
--error: oklch(0.6 0.2 15);
--error-subtle: oklch(0.6 0.2 15 / 0.15);

/* Info — frost blue (NEW — Resend-inspired) */
--info: oklch(0.55 0.12 220);
--info-subtle: oklch(0.55 0.12 220 / 0.15);
```

### Interactive States

```css
/* Hover — white glass effect (Resend pattern) */
--hover-glass: rgba(255, 255, 255, 0.08);
--hover-glass-strong: rgba(255, 255, 255, 0.14);

/* Focus — heavy black ring (accessibility) */
--focus-ring: rgb(0, 0, 0) 0px 0px 0px 8px;
--focus-ring-accent: oklch(0.55 0.22 264) 0px 0px 0px 3px;
```

---

## 3. Typography

### Font Stack

```css
/* Body / UI — Inter */
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

/* Code / Data — Commit Mono */
--font-mono: 'CommitMono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

/* Display — Reserved for hero/feature moments (optional) */
--font-display: 'Inter', ui-sans-serif, system-ui;
```

### Scale

| Role | Size | Weight | Line Height | Tracking | Usage |
|------|------|--------|-------------|----------|-------|
| Display | 4rem / 64px | 400 | 1.00 | -0.02em | Hero headlines |
| H1 | 2.5rem / 40px | 600 | 1.10 | -0.02em | Page titles |
| H2 | 1.75rem / 28px | 600 | 1.20 | -0.01em | Section headings |
| H3 | 1.25rem / 20px | 600 | 1.30 | 0 | Subsection |
| Body | 1rem / 16px | 400 | 1.50 | 0 | Standard text |
| Body Small | 0.875rem / 14px | 400 | 1.50 | 0 | Secondary text |
| Caption | 0.75rem / 12px | 500 | 1.33 | 0.02em | Labels, meta |
| Code | 0.875rem / 14px | 400 | 1.50 | 0 | Inline code |

---

## 4. Component Refinements

### Buttons

**Pill Variant (NEW — Resend primary CTA)**
```css
/* Primary Pill — Resend's signature button */
.btn-pill {
  background: transparent;
  color: var(--text-primary);
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid var(--frost-border);
  transition: background 150ms ease;
}
.btn-pill:hover {
  background: var(--hover-glass);
}
.btn-pill:active {
  background: var(--hover-glass-strong);
  transform: scale(0.98);
}
```

**White Solid Pill (High contrast CTA)**
```css
.btn-pill-solid {
  background: var(--text-primary);  /* #f0f0f0 */
  color: var(--void);                 /* #000000 */
  padding: 5px 12px;
  border-radius: 9999px;
  border: none;
}
```

**Ghost Button (Secondary actions)**
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-radius: 4px;
  border: none;
}
.btn-ghost:hover {
  background: var(--hover-glass);
  color: var(--text-primary);
}
```

### Cards

**Frost Card (NEW variant)**
```css
.card-frost {
  background: transparent;
  border: 1px solid var(--frost-border);
  border-radius: 16px;
  box-shadow: var(--frost-ring);
}
```

**Glass Card (Enhanced)**
```css
.card-glass {
  background: var(--surface-overlay / 0.30);
  backdrop-filter: blur(24px);
  border: 1px solid var(--frost-border-subtle);
  border-radius: 16px;
}
```

### Badges

**Pill Badges (Resend style)**
```css
.badge-pill {
  background: var(--accent) at 18% opacity;
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* Multi-color accent badges */
.badge-success { background: var(--success) at 18%; color: var(--success); }
.badge-warning { background: var(--warning) at 18%; color: var(--warning); }
.badge-error { background: var(--error) at 18%; color: var(--error); }
.badge-info { background: var(--info) at 18%; color: var(--info); }
```

### Navigation

**Header**
```css
.nav-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--void);
  border-bottom: 1px solid var(--frost-border);
  backdrop-filter: blur(12px);
}
```

**Sidebar Item**
```css
.nav-item {
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 8px 12px;
  transition: all 150ms ease;
}
.nav-item:hover {
  color: var(--text-primary);
  background: var(--hover-glass);
}
.nav-item-active {
  color: var(--text-primary);
  background: var(--accent-subtle);
  border: 1px solid var(--frost-border);
}
```

### Inputs

```css
.input {
  background: transparent;
  border: 1px solid var(--frost-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 8px 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
.input::placeholder {
  color: var(--text-muted);
}
```

---

## 5. Shadows & Depth

**Why ring shadows?** On pure black (`#000000`), traditional box shadows are invisible — there's no lighter surface to cast onto. Resend's solution: borders themselves create depth.

```css
/* Level 0 — Flat (default) */
shadow: none;

/* Level 1 — Ring (frost border as shadow) */
box-shadow: rgba(176, 199, 217, 0.145) 0px 0px 0px 1px;

/* Level 2 — Subtle glow */
box-shadow: 0 0 40px -10px var(--accent / 0.15);

/* Level 3 — Strong glow (accent elements) */
box-shadow: 0 0 60px -15px var(--accent / 0.25);

/* Focus — Heavy ring for accessibility */
box-shadow: 0 0 0 8px var(--void), 0 0 0 10px var(--frost-border);
```

---

## 6. Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Icon-text gaps |
| `--space-3` | 12px | Button padding-x |
| `--space-4` | 16px | Standard padding |
| `--space-6` | 24px | Card padding |
| `--space-8` | 32px | Section gaps |
| `--space-12` | 48px | Large gaps |
| `--space-16` | 64px | Section padding-y |
| `--space-24` | 96px | Hero spacing |

---

## 7. Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Inputs, ghost buttons |
| `--radius-md` | 8px | Cards, tabs |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Feature cards |
| `--radius-2xl` | 24px | Section containers |
| `--radius-pill` | 9999px | Primary CTAs, badges |

---

## 8. Animation & Transitions

```css
/* Standard transition */
transition: all 150ms ease;

/* Button press */
transition: transform 100ms ease, background 150ms ease;

/* Focus (accessibility) */
transition: box-shadow 150ms ease, border-color 150ms ease;

/* Hover lift (optional, use sparingly) */
transform: translateY(-1px);
```

---

## 9. Component Status

### To Update

| Component | Current | Target | Priority |
|-----------|---------|--------|----------|
| `button.tsx` | Has `outline`, `ghost` variants | Add `pill`, `pill-solid` variants | HIGH |
| `card.tsx` | Has `glass`, `outlined` variants | Add `frost` variant | HIGH |
| `badge.tsx` | Basic variants | Add pill + accent color variants | MEDIUM |
| `badge-v2.tsx` | Partial accent support | Full frost border + multi-color | MEDIUM |
| `globals.css` | Monochrome borders | Add frost border tokens | HIGH |

### New Components to Create

| Component | Description |
|-----------|-------------|
| `frost-divider.tsx` | Horizontal rule with frost border |
| `glass-panel.tsx` | Backdrop blur panel with frost border |

---

## 10. Migration Guide

### Step 1: CSS Variables (globals.css)
Add frost border tokens alongside existing v2 tokens.

### Step 2: Button Variants
Add pill variants to `buttonVariants`:
```typescript
pill: "bg-transparent text-v2-text-primary border border-[var(--frost-border)] rounded-full hover:bg-[var(--hover-glass)]",
pillSolid: "bg-v2-text-primary text-void rounded-full",
```

### Step 3: Card Variants
Add frost variant to `Card` component:
```typescript
frost: "bg-transparent border border-[var(--frost-border)] shadow-[var(--frost-ring)]"
```

### Step 4: Badge Updates
Update badgeV2Variants to use frost borders and accent scales.

### Step 5: Apply to Pages
Apply new components to marketing pages (propfirms, home, pricing).

---

## 11. Example Usage

```tsx
// Primary CTA — Pill style (Resend)
<Button variant="pill">Get started</Button>

// High contrast CTA
<Button variant="pillSolid">Start free trial</Button>

// Frost card
<Card variant="frost">
  <CardHeader>
    <CardTitle>Trading Analytics</CardTitle>
  </CardHeader>
  <CardContent>
    Professional-grade execution tracking.
  </CardContent>
</Card>

// Accent badge
<BadgeV2 variant="accent" size="sm">PRO</BadgeV2>
<BadgeV2 variant="success" size="sm">Live</BadgeV2>
<BadgeV2 variant="warning" size="sm">Pending</BadgeV2>
<BadgeV2 variant="error" size="sm">Failed</BadgeV2>
```

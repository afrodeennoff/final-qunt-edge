# Qunt Edge Design System — Professional Trading Terminal

> **Aesthetic**: Professional, data-dense dark trading interface with Deep Purple accents on pure black.
> **Goal**: A clean, high-contrast, functional trading platform that feels fast, trustworthy, and focused on data.

---

## 1. Philosophy

Qunt Edge is a **professional trading analytics platform**. The UI should feel like a real trading terminal — fast, clear, and data-first.

**Core Principles:**
- Data density over decoration
- High readability for numbers and tables
- Strong semantic colors (Green = Profit, Red = Loss)
- Minimal visual noise
- Consistent, tight spacing
- Professional and trustworthy, not "flashy"
- Excellent performance on both normal and high-resolution screens (up to 12K)

**What we are NOT:**
- We are not a luxury SaaS with heavy glassmorphism or marketing effects.
- We are not overly colorful or playful.
- We avoid large gradients, heavy shadows, glowing orbs, and excessive animation.

---

## 2. Color System

### Base Palette (Dark Theme Only)

```css
--background: #000000;           /* Main background */
--card: #000000;                 /* Card / panel background */
--popover: #000000;              /* Dropdowns, modals, popovers */
--sidebar: #000000;              /* Sidebar background */
--muted: hsl(260, 20%, 8%);     /* Muted backgrounds */
--border: hsl(260, 20%, 15%);   /* Default borders */
```

### Semantic Colors (Trading Critical)

```css
/* Profit / Positive */
--success: #0ECB81;
--success-foreground: #FFFFFF;

/* Loss / Negative */
--destructive: #F6465D;
--destructive-foreground: #FFFFFF;

/* Warning / Caution */
--warning: hsl(263, 85%, 65%);
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

We use **Deep Purple** (`hsl(263, 85%, 65%)`) for branding elements, focus states, and non-trading accents. Trading data (P&L, charts) must always use strong green/red.

---

## 3. Typography

- **Font family**: System UI stack (Inter / SF Pro / Segoe UI)
- Numbers should use **tabular-nums** for alignment.
- Strong hierarchy:
  - Large titles: 24–32px, semibold
  - Section headers: 18–20px, medium
  - Body / data: 14px
  - Small labels: 12px
- High contrast text on dark backgrounds.

---

## 4. Spacing & Layout (8pt Grid)

Follow the existing `SPACING_SYSTEM.md` with these preferences:

- Component internal padding: `p-4` (16px) or `p-3` (12px) for dense areas
- Card to card / section gaps: `gap-4` or `gap-6`
- Very tight data lists: `gap-1` or `gap-2`
- Generous breathing only where it improves clarity (not for decoration)

On high-resolution screens (8K+), use the 2400px workspace cap + `2xl:` responsive scaling.

---

## 5. Components

### Cards & Panels
- Background: `--card`
- Border: subtle (`--border` or `oklch(0.65 0.22 260 / 0.08)` for focus)
- No heavy shadows or glass effects
- Rounded: `rounded-lg` (8px) or `rounded-xl` for bigger containers

### Buttons
- Primary: Deep Purple (`hsl(263, 85%, 65%)`) with dark text
- Secondary / Ghost: Subtle borders
- Destructive: Red
- All buttons should feel solid and responsive

### Tables & Lists
- Very clean rows with subtle hover (`bg-[#1F1F1F]`)
- Strong alignment for numbers
- Green/Red text for P&L columns

### Charts
- Clean lines
- Green up, Red down
- Minimal grid lines
- High readability on large screens

### Forms & Inputs
- Clean borders
- Clear focus states using cobalt
- Consistent height (usually 40px or 44px)

---

## 6. Do's and Don'ts

**Do:**
- Prioritize readability of numbers and data
- Use strong green/red for P&L
- Keep spacing consistent and tight
- Design for data density
- Use subtle borders and clean surfaces

**Don't:**
- Add unnecessary glows, gradients, or glassmorphism
- Use decorative orbs or heavy visual effects
- Make cards overly "premium" with big shadows
- Use low-contrast text
- Over-animate (keep interactions fast and subtle)
- Stretch content too wide on large screens without proper containers

---

## 7. Current Direction (2026)

Qunt Edge uses a **clean, professional trading terminal** aesthetic:

- Minimal decoration
- Maximum clarity
- Strong semantic trading colors
- Deep Purple accents on pure black
- Consistent 8pt spacing
- Excellent experience from 1080p to 12K UHD

---

*Last updated: May 2026*

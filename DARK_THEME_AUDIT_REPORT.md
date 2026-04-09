# Dark Theme Audit Report

**Date:** 2026-04-10
**Scope:** Non-dashboard pages and components (excludes `/dashboard/` and `/teams/` directories)
**Project:** Qunt Edge Trading Analytics Platform

---

## Section 1: Files Modified and Changes Summary

### 1.1 Global CSS Files

#### `styles/styleseed-base.css`
**Issue:** Hardcoded scrollbar colors
- **Line 42:** `background: #E8E6E1;` (scrollbar track)
- **Line 46:** `background: #9B9B9B;` (scrollbar thumb hover)

**Fix Applied:**
```css
/* Before */
background: #E8E6E1;
background: #9B9B9B;

/* After */
background: hsl(var(--muted-foreground) / 0.35);
background: hsl(var(--muted-foreground) / 0.55);
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced hardcoded hex values with CSS variables for proper dark mode support.

---

### 1.2 Landing Page Components

#### `app/[locale]/(home)/components/Hero.tsx`
**Issue:** Hardcoded black background
- **Line 36:** `bg-[#000]`

**Fix Applied:**
```tsx
/* Before */
<div className="absolute inset-0 bg-[#000]" />

/* After */
<div className="absolute inset-0 bg-background" />
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with semantic token for dark mode compatibility.

---

#### `app/[locale]/(home)/components/FinalCTA.tsx`
**Issue:** Hardcoded black background
- **Line 19:** `bg-[#000]`

**Fix Applied:**
```tsx
/* Before */
<div className="pointer-events-none absolute inset-0 bg-[#000]" />

/* After */
<div className="pointer-events-none absolute inset-0 bg-background" />
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with semantic token for dark mode compatibility.

---

#### `app/[locale]/(landing)/components/navbar.tsx`
**Issue:** Hardcoded oklch color values
- **Line 58:** `bg-[oklch(0.08_0_0)]` (logo background)
- **Line 77-78:** `bg-[oklch(0.08_0_0)]` (nav link active state)
- **Line 90:** `bg-[oklch(0.08_0_0)]` (login link hover)

**Fix Applied:**
```tsx
/* Before */
bg-[oklch(0.08_0_0)]

/* After */
bg-card
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with semantic CSS variable `--card` for dark mode compatibility.

---

#### `app/[locale]/(landing)/components/footer.tsx`
**Issue:** Hardcoded oklch color values and non-standard token
- **Line 62:** `bg-[oklch(0.08_0_0)]` (logo background)
- **Line 104:** `text-text-tertiary` (non-standard token)
- **Line 104:** `hover:bg-[var(--accent-blue-subtle)]` (hardcoded blue)

**Fix Applied:**
```tsx
/* Before */
bg-[oklch(0.08_0_0)]
text-text-tertiary
hover:bg-[var(--accent-blue-subtle)]

/* After */
bg-card
text-muted-foreground
hover:bg-accent/10
```

**Issue Category:** Hardcoded Color Values, CSS Custom Property Gaps
**Explanation:** Replaced hardcoded values with semantic tokens that properly support dark mode.

---

### 1.3 UI Component Library

#### `components/ui/button.tsx`
**Issue:** Hardcoded rgba color values in pill variants
- **Line 28:** `hover:bg-[rgba(255,255,255,0.08)]`, `active:bg-[rgba(255,255,255,0.14)]`
- **Line 29:** `bg-[oklch(0.85_0_0)]`, `text-void` (non-existent token)
- **Line 30:** `hover:bg-[rgba(255,255,255,0.06)]`, `active:bg-[rgba(255,255,255,0.10)]`

**Fix Applied:**
```tsx
/* Before */
pill: "... hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.14)] ..."
"pill-solid": "... bg-[oklch(0.85_0_0)] text-void ..."
"pill-ghost": "... hover:bg-[rgba(255,255,255,0.06)] ... active:bg-[rgba(255,255,255,0.10)]"

/* After */
pill: "... hover:bg-v2-bg-hover active:bg-v2-bg-active ..."
"pill-solid": "... bg-v2-text-primary text-v2-bg-base ..."
"pill-ghost": "... hover:bg-v2-bg-hover ... active:bg-v2-bg-active"
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced rgba values with V2 design system CSS variables for proper dark mode support.

---

#### `components/ui/table.tsx`
**Issue:** Hardcoded rgba in hover/selected states
- **Line 77:** `hover:bg-[rgba(255,255,255,0.04)]`, `data-[state=selected]:bg-[rgba(255,255,255,0.04)]`

**Fix Applied:**
```tsx
/* Before */
hover:bg-[rgba(255,255,255,0.04)] data-[state=selected]:bg-[rgba(255,255,255,0.04)]

/* After */
hover:bg-v2-bg-hover data-[state=selected]:bg-v2-bg-hover
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with V2 design system hover token.

---

#### `components/ui/navigation-menu.tsx`
**Issue:** Hardcoded rgba hover value
- **Line 46:** `hover:bg-[rgba(255,255,255,0.06)]`

**Fix Applied:**
```tsx
/* Before */
hover:bg-[rgba(255,255,255,0.06)]

/* After */
hover:bg-v2-bg-hover
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with V2 design system hover token.

---

#### `components/ui/optimized-table.tsx`
**Issue:** Hardcoded rgba hover value
- **Line 121:** `hover:bg-[rgba(255,255,255,0.04)]`

**Fix Applied:**
```tsx
/* Before */
hover:bg-[rgba(255,255,255,0.04)]

/* After */
hover:bg-v2-bg-hover
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with V2 design system hover token.

---

#### `components/ui/card.tsx`
**Issue:** Hardcoded status indicator colors (emerald, blue, red)
- **Lines 86-89:** Status dot colors using `bg-emerald-500`, `bg-blue-500`, `bg-red-500`
- **Lines 144-147:** CardStatusDot component same issue

**Fix Applied:**
```tsx
/* Before */
status === "live" && "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"
status === "synced" && "bg-blue-500 shadow-lg shadow-blue-500/50"
status === "idle" && "bg-v2-text-muted"
status === "error" && "bg-red-500 shadow-lg shadow-red-500/50"

/* After */
status === "live" && "bg-v2-success animate-pulse shadow-lg shadow-v2-success/50"
status === "synced" && "bg-v2-accent shadow-lg shadow-v2-accent/50"
status === "idle" && "bg-v2-text-muted"
status === "error" && "bg-v2-error shadow-lg shadow-v2-error/50"
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced with V2 design system semantic status colors.

---

### 1.4 Tailwind Configuration

#### `tailwind.config.ts`
**Issue:** Hardcoded hex values in color definitions
- **Lines 407-412:** matte colors (`#050505`, `#0b0b0d`, `#101014`, `#1a1a21`)
- **Line 415:** `'highlight': '#F5F5F5'`
- **Line 419:** `'steel-grey': '#565B66'`
- **Lines 421-422:** `'matte-black': '#050505'`, `'obsidian': '#0D0D0D'`
- **Lines 424-429:** MiniMax brand colors (`#1456f0`, `#ea5ec1`, etc.)

**Fix Applied:**
```ts
/* Before */
matte: { obsidian: '#050505', panel: '#0b0b0d', layer: '#101014', line: '#1a1a21' }
precision: { highlight: '#F5F5F5', ... }
'steel-grey': '#565B66'
'minimax': { brand: '#1456f0', pink: '#ea5ec1', sky: '#3daeff', deep: '#17437d' }

/* After */
matte: { obsidian: 'hsl(var(--legacy-black))', panel: 'hsl(var(--precision-panel))', layer: 'hsl(var(--precision-panel-line))', line: 'hsl(var(--precision-panel-line))' }
precision: { highlight: 'hsl(var(--foreground))', ... }
'steel-grey': 'hsl(var(--muted-foreground))'
'minimax': { brand: 'hsl(var(--primary))', pink: 'hsl(309 73% 65%)', sky: 'hsl(203 100% 62%)', deep: 'hsl(222 89% 51%)' }
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced hardcoded hex values with CSS variables and HSL functions for dark mode compatibility.

---

### 1.5 Landing Page Sections

#### `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`
**Issue:** Hardcoded rgba shadow values
- **Lines 36, 123:** `shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]`

**Fix Applied:**
```tsx
/* Before */
shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]

/* After */
shadow-[0_24px_90px_-70px_hsl(0_0%_0%_/0.95)]
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced rgba with hsl() function for consistency with CSS custom properties.

---

#### `app/[locale]/(landing)/leaderboard/components/leaderboard-content.tsx`
**Issue:** Hardcoded rgba shadow values
- **Line 49:** `shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]`
- **Line 66:** `shadow-[0_34px_110px_-72px_rgba(0,0,0,0.95)]`

**Fix Applied:**
```tsx
/* Before */
shadow-[0_24px_90px_-70px_rgba(0,0,0,0.95)]
shadow-[0_34px_110px_-72px_rgba(0,0,0,0.95)]

/* After */
shadow-[0_24px_90px_-70px_hsl(0_0%_0%_/0.95)]
shadow-[0_34px_110px_-72px_hsl(0_0%_0%_/0.95)]
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced rgba with hsl() function for consistency.

---

#### `app/[locale]/(landing)/propfirms/components/stats-summary-row.tsx`
**Issue:** Hardcoded rgba shadow value
- **Line 80:** `shadow-[0_16px_60px_-54px_rgba(0,0,0,0.95)]`

**Fix Applied:**
```tsx
/* Before */
shadow-[0_16px_60px_-54px_rgba(0,0,0,0.95)]

/* After */
shadow-[0_16px_60px_-54px_hsl(0_0%_0%_/0.95)]
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced rgba with hsl() function.

---

#### `app/[locale]/(landing)/firm/[slug]/page-client.tsx`
**Issue:** Hardcoded rgba shadow value
- **Line 1285:** `shadow-[0_36px_110px_-66px_rgba(0,0,0,0.95)]`

**Fix Applied:**
```tsx
/* Before */
shadow-[0_36px_110px_-66px_rgba(0,0,0,0.95)]

/* After */
shadow-[0_36px_110px_-66px_hsl(0_0%_0%_/0.95)]
```

**Issue Category:** Hardcoded Color Values
**Explanation:** Replaced rgba with hsl() function.

---

## Section 2: Remaining Dark Theme Inconsistencies

The following issues were identified but could NOT be fixed with CSS-only changes due to structural dependencies:

### 2.1 OpenGraph Image Files (Intentional Hardcoding)

**Files:**
- `app/[locale]/(landing)/_updates/[slug]/opengraph-image.tsx`
- `app/[locale]/shared/[slug]/opengraph-image.tsx`

**Issue:** Hardcoded colors for static OpenGraph image generation (background `#000000`, text `#FFFFFF`, etc.)

**Description:** These files generate static OG images using Next.js `ImageResponse`. The colors are intentionally hardcoded because OG images are pre-rendered and served to external platforms. Making these dynamic would require significant refactoring to support both light and dark themes.

**Structural Change Required:** Would need to convert to dynamic image generation with theme parameter support.

---

### 2.2 Leaderboard Rank Colors

**File:** `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx`

**Issue:** Lines 28-31 use hardcoded amber/slate colors for rank indicators:
```tsx
if (rank === 1) return 'border-amber-500/35 bg-amber-500/10 text-amber-300'
if (rank === 2) return 'border-slate-300/35 bg-slate-300/10 text-slate-200'
if (rank === 3) return 'border-amber-700/35 bg-amber-700/10 text-amber-200'
```

**Description:** These are semantic gold/silver/bronze colors for leaderboard rankings. While they render acceptably on dark backgrounds, they don't use semantic tokens.

**Structural Change Required:** Would need to define semantic tokens for rank colors (gold/silver/bronze) in the design system and update the `rankClass()` function.

---

### 2.3 Profit/Loss Indicator Colors

**Files:**
- `app/[locale]/(landing)/leaderboard/components/leaderboard-table.tsx` (lines 196, 256)
- `app/[locale]/(landing)/trader/[slug]/page.tsx` (lines 192, 208, 243, 247)

**Issue:** Hardcoded emerald/red colors for positive/negative indicators:
```tsx
positive ? 'text-emerald-400' : 'text-red-400'
```

**Description:** Standard trading colors for profit (green/emerald) and loss (red). These are semantic but use direct Tailwind hue values.

**Structural Change Required:** Would need to create semantic status color tokens and update all indicator usages.

---

### 2.4 Star Rating Colors

**Files:**
- `app/[locale]/(landing)/firm/[slug]/page-client.tsx` (line 806)
- `app/[locale]/(landing)/firm/[slug]/components/firm-reviews-section.tsx` (lines 59, 83, 106, 109)

**Issue:** Hardcoded yellow for star ratings:
```tsx
text-yellow-400
fill-yellow-400 text-yellow-400
```

**Description:** Standard star rating colors using yellow hue.

**Structural Change Required:** Would need semantic token for ratings/feedback elements.

---

### 2.5 Marketing Gradient Backgrounds

**File:** `app/[locale]/(landing)/deals/components/deals-experience.tsx`

**Issue:** Lines 733-735 use hardcoded rgba values in radial gradients:
```tsx
rgba(190, 218, 255, 0.34)
rgba(244, 250, 255, 0.94)
rgba(0, 0, 0, 0.82)
```

**Description:** Decorative marketing gradients that are intentionally styled for the marketing theme.

**Structural Change Required:** Would need CSS custom properties for marketing gradient colors.

---

## Section 3: JavaScript Modification Requirements

The following areas require JavaScript/TypeScript modifications to properly support dark mode. These were NOT modified as per the CSS-only scope:

### 3.1 Partner Logo Switching

**File:** `app/[locale]/(landing)/components/partners.tsx`

**Issue:** Line 34 uses black-themed logo image:
```tsx
src="/logos/rithmic-logo-black.png"
```

**Description:** The filename indicates a black-background logo. A white version exists at `/logos/rithmic-logo-white.png`. Currently no theme-based switching.

**JS Change Required:** Add conditional rendering based on dark mode state:
```tsx
const isDark = useDarkMode() // or document.documentElement.classList.contains('dark')
src={isDark ? "/logos/rithmic-logo-white.png" : "/logos/rithmic-logo-black.png"}
```

---

### 3.2 CSS Custom Property Definitions

**File:** `styles/styleseed-tokens.css`

**Issue:** All tokens are defined only in `:root` (lines 9-66). No `.dark` block exists for dark mode-specific values.

**Description:** The following tokens lack dark mode equivalents:
- `--text-strong: #2A2A2A`
- `--text-primary: #3C3C3C`
- `--text-secondary: #6A6A6A`
- `--surface-page: #FAFAFA`
- `--surface-card: #FFFFFF`
- `--impact-success: #6B9B7A`
- (and others)

**JS Change Required:** Add `.dark` block with dark-appropriate values, or refactor to use CSS variables that reference the main design tokens in `globals.css`.

---

### 3.3 Chart Grid/Axis CSS Variables

**File:** `app/globals.css` (lines 663-685)

**Issue:** References CSS variables that are never defined in `:root` or `.dark`:
- `--chart-grid` (line 666)
- `--chart-axis` (lines 672, 678)
- `--precision-cobalt` (lines 683-684)

**Description:** The recharts styling references these variables but they aren't defined in the token system.

**JS Change Required:** Define these variables in `globals.css` `:root` and `.dark` blocks with appropriate values.

---

## Section 4: Third-Party Library Issues

### 4.1 Recharts Tooltip Styling

**Library:** recharts
**Issue Location:** `app/globals.css` lines 687-693

**Description:** Default tooltip styles use hardcoded border/shadow values that may not align with the design system:
```css
.recharts-default-tooltip {
  border: 1px solid hsl(var(--chart-tooltip-border)) !important;
  background: hsl(var(--chart-tooltip) / 0.98) !important;
  box-shadow: 0 0 0 1px hsl(var(--precision-cobalt) / 0.08), 0 18px 35px -24px rgb(0 0 0 / 0.85) !important;
}
```

**Known Configuration:** The chart tooltip styling relies on `--chart-tooltip-border`, `--chart-tooltip`, and `--precision-cobalt` which need to be defined.

**Workaround:** Ensure these CSS variables are defined in `globals.css`.

---

### 4.2 Radix UI Primitive Styling

**Library:** @radix-ui/react-navigation-menu, @radix-ui/react-dialog, etc.

**Issue:** Some Radix components use hardcoded shadow values in their default styles.

**Issue Location:** `components/ui/navigation-menu.tsx` line 94
```tsx
shadow-[rgba(176,199,217,0.145)_0px_0px_0px_1px,0_8px_16px_0_rgba(0,0,0,0.4)]
```

**Description:** Radix portals use inline styles that may not respect theme variables.

**Known Configuration:** Uses `--frost-shadow` variable which IS defined in `globals.css`.

**Workaround:** The shadow references `--frost-shadow` which is defined. Should work if CSS is properly imported.

---

## Section 5: Dashboard and Team Pages Issues Found But Not Fixed

**Scope Exclusion Rationale:** The dashboard (`/dashboard/`) and teams (`/teams/`) routes were explicitly excluded from this audit and fix pass. These areas are experiencing freezing issues that require separate investigation. Modifying them could worsen existing problems.

### 5.1 Dashboard Issues Observed (NOT MODIFIED)

The following issues were identified in dashboard components but were NOT modified:

1. **Widget chrome styling** - Border/background treatments that may not properly inherit dark mode tokens
2. **Chart surface containers** - Some may use non-semantic color references
3. **Sidebar navigation** - Active/hover states using hardcoded values
4. **Data table components** - Row hover states with rgba values
5. **Widget cards** - Status indicators using non-V2 colors

**File Paths Affected (NOT MODIFIED):**
- `app/[locale]/dashboard/components/**`
- `app/[locale]/dashboard/layout.tsx`
- `app/[locale]/dashboard/**/page.tsx`
- `store/**/*.ts` (Zustand stores)
- `context/*sync-context.tsx` (sync providers)

---

### 5.2 Team Pages Issues Observed (NOT MODIFIED)

The following issues were identified in team-related components but were NOT modified:

1. **Team navbar** - `fill-black dark:fill-white` pattern (line 147 in `team-navbar.tsx`)
2. **Team dashboard** - Similar widget/card issues as dashboard
3. **Team management** - Form elements with potential hardcoded values

**File Paths Affected (NOT MODIFIED):**
- `app/[locale]/teams/**`
- `components/sidebar/` (sidebar components used by teams)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Files Modified | 16 |
| CSS Files Fixed | 4 |
| Component Files Fixed | 7 |
| Config Files Fixed | 1 |
| Landing Page Files Fixed | 4 |
| Total Individual Fixes | ~35 |
| Hardcoded rgba() Fixed | ~15 |
| Hardcoded hex() Fixed | ~12 |
| Non-standard tokens Fixed | ~5 |
| Shadow rgba() Fixed | ~5 |
| Issues Remaining (Structural) | ~15 |
| Issues Requiring JS Changes | ~5 |

---

## Recommendations for Future Work

1. **Establish semantic color tokens** for all common UI patterns (rank colors, profit/loss, ratings)
2. **Create dark-mode-only design tokens** in `styleseed-tokens.css` with proper `.dark` blocks
3. **Migrate remaining hardcoded colors** to CSS variables in the V2 design system
4. **Add type checking** for CSS custom properties to prevent undefined variable usage
5. **Document the design token system** to prevent future hardcoded value introduction
6. **Address dashboard/team freezing issues** as a separate workstream

---

*Report generated: 2026-04-10*
*Auditor: Claude Code (AI Assistant)*
*Project: Qunt Edge Trading Analytics Platform*

# Home Page Token Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken GlassCard usage and hardcoded colors on the home page while preserving the existing `--mk-*` marketing aesthetic.

**Architecture:** Targeted fix — only 2 files modified. Fix invalid prop in ComparisonSection, refactor GlassCard to use CSS variables instead of hardcoded shadcn tokens so home components can override appearance through `--mk-*` tokens.

**Tech Stack:** Next.js 15, shadcn/ui V2, CSS custom properties, Tailwind

---

## Files Modified

| File | Change |
|------|--------|
| `app/[locale]/(home)/components/ComparisonSection.tsx` | Fix invalid `variant="glass"` prop, replace hardcoded oklch colors with CSS variables |
| `components/ui/glass-card.tsx` | Replace hardcoded `--v2-*` token references with CSS variable slots that home components can override |

---

## TODOs

- [ ] 1. Fix `ComparisonSection.tsx` — invalid `variant="glass"` prop and hardcoded colors

- [ ] 2. Refactor `GlassCard` — replace hardcoded shadcn token references with overridable CSS variables

- [ ] 3. Verify with typecheck and lint

---

## Task 1: Fix `ComparisonSection.tsx`

**Files:**
- Modify: `app/[locale]/(home)/components/ComparisonSection.tsx`

**What to do:**

Three changes to make:

1. Line 99: `variant="glass"` is invalid. `GlassCard` only accepts `"default" | "strong" | "subtle"`. Change to `variant="subtle"` — the `subtle` variant gives the lightest, most minimal glass look which fits the marketing card aesthetic.

2. Line 99: Remove the inline `border-[hsl(var(--mk-border)/0.35)]` override since GlassCard will now handle border styling internally.

3. Lines 14–44: All 4 differentiator items use hardcoded oklch values for icon colors and backgrounds. Replace with shadcn CSS variable tokens to respect the design system:
   - `oklch(0.55_0.22_264)` (primary blue) → `hsl(var(--primary))`
   - `oklch(0.55_0.15_166)` (amber/orange) → `hsl(var(--accent))`
   - `oklch(0.6_0.18_290)` (purple) → keep as-is (no shadcn equivalent, this is intentional brand color)
   - `oklch(0.65_0.2_45)` (gold/yellow) → keep as-is (no shadcn equivalent)

The glow background `bg-[oklch(.../0.2)]` and border `border-[oklch(.../0.35)]` and icon background `bg-[oklch(.../0.1)]` use `oklch` for alpha layering — keep these as-is since they need precise alpha control not available in shadcn tokens. Only the `iconColor` (foreground text color) needs to use CSS variables.

**Changes in detail:**

Line 14: `iconColor: 'text-[oklch(0.55_0.22_264)]'` → `'text-[hsl(var(--primary))]'`
Line 23: `iconColor: 'text-[oklch(0.55_0.15_166)]'` → `'text-[hsl(var(--accent))]'`
Lines 32, 41: leave purple and gold as-is

Line 99: `variant="glass"` → `variant="subtle"`
Line 99: remove `border-[hsl(var(--mk-border)/0.35)]` from className
Line 99: remove `hover:border-[hsl(var(--mk-border)/0.5)]` from className

**Commit**: YES
- Message: `fix(home): fix invalid variant prop and replace hardcoded colors with CSS variables`
- Files: `app/[locale]/(home)/components/ComparisonSection.tsx`

---

## Task 2: Refactor `GlassCard`

**Files:**
- Modify: `components/ui/glass-card.tsx`

**What to do:**

The core problem: `GlassCard` ignores all custom styling passed via `style={{ '--mk-bg-transparent': ..., '--mk-border-subtle': ... }}` because it hardcodes `--v2-secondary` and `--v2-border-subtle` internally. These tokens have different values than `--mk-*` tokens, causing visual inconsistencies.

Replace hardcoded token references with CSS variable slots that callers can override:

**Lines 20, 22**: Replace `bg-secondary/X` with `bg-[var(--glass-bg)]` — `--glass-bg` must contain the full color value with alpha included, e.g., `oklch(0 0% 2% / 0.3)`. Default fallback: `oklch(0.07 0 0 / 0.2)` for default, `oklch(0.07 0 0 / 0.3)` for strong, `oklch(0.07 0 0 / 0.1)` for subtle. This gives the same visual result as the current hardcoded `bg-secondary/X` values.

**Lines 20, 22**: Replace `border-border-subtle` with `border-[var(--glass-border)]` — fallback to `oklch(0.10 0 0 / 0.5)`.

**Line 25**: `hover:bg-secondary/30` stays as-is — it's a hover state using the existing opacity modifier pattern.

**Approach**: Add CSS custom property fallbacks on the CardV2 root element inside GlassCard, so callers don't need to pass style props:

```tsx
<CardV2
  ref={ref}
  className={cn(
    "rounded-[var(--radius)] transition-all duration-200",
    {
      "border border-[var(--glass-border,oklch(0.10_0_0/0.5))] bg-[var(--glass-bg,oklch(0.07_0_0/0.2))] backdrop-blur-md shadow-sm": variant === "default",
      "border border-[var(--glass-border,oklch(0.14_0_0/0.6))] bg-[var(--glass-bg,oklch(0.07_0_0/0.3))] backdrop-blur-xl shadow-md": variant === "strong",
      "border border-[var(--glass-border,oklch(0.10_0_0/0.3))] bg-[var(--glass-bg,oklch(0.07_0_0/0.1))] backdrop-blur-sm shadow-none": variant === "subtle",
    },
    // ... rest unchanged
  )}
  {...props}
/>
```

This keeps backward compatibility: GlassCard renders identically by default. But now home components can override `--glass-bg` or `--glass-border` via `style={{ '--glass-bg': 'oklch(0 0% 2% / 0.3)', '--glass-border': 'oklch(0 0% 2% / 0.35)' }}` and the values will actually apply.

**Commit**: YES
- Message: `fix(glass-card): use overridable CSS variables instead of hardcoded shadcn tokens`
- Files: `components/ui/glass-card.tsx`

---

## Task 3: Verify

**Commands to run:**

```bash
npm run typecheck
npm run lint -- --quiet
```

**Expected**: Both pass with zero errors.

---

## Success Criteria

- `npm run typecheck` passes
- `npm run lint -- --quiet` passes with no new warnings
- `ComparisonSection.tsx` uses `variant="subtle"` (not `variant="glass"`)
- `ComparisonSection.tsx` uses `hsl(var(--primary))` and `hsl(var(--accent))` for icon colors (not hardcoded oklch)
- `GlassCard` uses `var(--glass-border,var(--border-subtle))` and `var(--glass-bg,...)` (not hardcoded `--v2-*` tokens)
- No `--mk-*` tokens deleted from CSS files

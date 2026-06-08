# Trader Profile Page — Glassmorphism & Premium UI Refinement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Trader Profile Page at `app/[locale]/(landing)/trader/[slug]/` to match a premium 2026 macOS desktop application aesthetic using glassmorphism, soft gradients, and high-fidelity micro-interactions.

**Architecture:** Zero changes to data fetching (Server Component), state, or API calls. Only visual/styling changes to page.tsx and calendar-grid.tsx. Uses existing `motion` library (v12, in package.json) for framer-motion animations.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, `motion` v12, TypeScript, Server Components + Client Components

---
### Task 1: Top-Header Buffer Fix

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:270`

- [ ] **Step 1: Replace outer div container classes**

  Change the outer wrapper div from:
  ```tsx
  <div className="min-h-[calc(100dvh-72px)] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-gradient-to-b from-background to-muted/5">
  ```
  To:
  ```tsx
  <div className="min-h-dvh px-4 pt-24 pb-12 sm:px-6 sm:pb-16 lg:px-8 bg-gradient-to-b from-background to-muted/5">
  ```

  **Rationale:** Remove the fragile `calc(100dvh-72px)` which assumes exact navbar height. Use `min-h-dvh` + `pt-24` for safe header clearance across all viewports. The layout already contributes `pt-8 md:pt-16` via `topSpacingClassName`, but the page needs its own `pt-24` to guarantee no overlap.

- [ ] **Step 2: Verify no other elements depend on the old min-height**

  Search for any `calc(100dvh-72px)` references in the file — there should be only the one changed above.

  Run: `rg "100dvh-72px" app/[locale]/(landing)/trader/"`

  Expected: No matches (or only the one we already changed if we missed it)

---

### Task 2: Surface Elevation — Glassmorphism on Hero Header

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:277`

- [ ] **Step 1: Enhance hero header card glassmorphism**

  Change line 277 from:
  ```tsx
  <div className="mb-8 overflow-hidden rounded-3xl border-0 bg-card/80 shadow-xl backdrop-blur">
  ```
  To:
  ```tsx
  <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/30 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
  ```

- [ ] **Step 2: Verify dark mode renders correctly**

  No explicit dark mode test needed — the `dark:bg-zinc-900/30` handles it. The `border-white/10` will be subtle on light (white-ish bg) and same on dark.

---

### Task 3: Surface Elevation — Glassmorphism on Stat Icons Container

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:335`

- [ ] **Step 1: Enhance stat icon container**

  Change line 335 from:
  ```tsx
  <div className="rounded-2xl border-00 bg-background/60 p-3 transition group-hover:border-primary/30">
  ```
  To:
  ```tsx
  <div className="rounded-2xl border border-white/10 bg-white/20 p-3 backdrop-blur-sm transition dark:bg-zinc-800/20 group-hover:border-primary/30">
  ```

  Note: `border-00` appears to be a typo in the original (should be `border-0` or similar). This also fixes it.

---

### Task 4: Surface Elevation — Glassmorphism on Content Cards

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:362, 402, 435, 441, 449`

- [ ] **Step 1: Recent trades card (line 362)**

  Change from:
  ```tsx
  <div className="overflow-hidden rounded-3xl border-0 bg-card/90 shadow-sm">
  ```
  To:
  ```tsx
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/30 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
  ```

- [ ] **Step 2: Win rate card (line 402)**

  Change from:
  ```tsx
  <div className="rounded-3xl border-0 bg-card/90 p-6 shadow-sm">
  ```
  To:
  ```tsx
  <div className="rounded-3xl border border-white/10 bg-white/30 p-6 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
  ```

- [ ] **Step 3: Quick insight cards (lines 435 and 441)**

  Both have:
  ```tsx
  <div className="rounded-3xl border-0 bg-card/90 p-5">
  ```
  Change both to:
  ```tsx
  <div className="rounded-3xl border border-white/10 bg-white/30 p-5 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
  ```

- [ ] **Step 4: Calendar card (line 449)**

  Change from:
  ```tsx
  <div className="rounded-3xl border-0 bg-card/90 p-6 shadow-sm">
  ```
  To:
  ```tsx
  <div className="rounded-3xl border border-white/10 bg-white/30 p-6 shadow-lg backdrop-blur-xl dark:bg-zinc-900/30">
  ```

---

### Task 5: Interaction Refinement — Framer Motion Spring Animation

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx` — imports + wrapper

- [ ] **Step 1: Add motion import**

  Add to the imports at the top:
  ```tsx
  import { motion } from 'motion'
  ```

  Insert after line 3 (`import { cache } from 'react'`).

- [ ] **Step 2: Convert main content container from `<div>` to `<motion.div>`**

  The main content wrapper is on line 275:
  ```tsx
  <div className="mx-auto max-w-[1200px]">
  ```
  Change to:
  ```tsx
  <motion.div
    className="mx-auto max-w-[1200px]"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 25 }}
  >
  ```

- [ ] **Step 3: Close the motion div**

  Change `</div>` on line 466 to `</motion.div>`.

---

### Task 6: Button & Toggle Polish — Add transition and scale on inline buttons

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/page.tsx:313, 319`

- [ ] **Step 1: Add transition-all and active:scale to Leaderboard back button (line 313)**

  Change from:
  ```tsx
  className="inline-flex items-center gap-2 rounded-2xl border-0 bg-background/60 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-muted/60"
  ```
  To:
  ```tsx
  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/30 px-5 py-2.5 text-sm font-medium backdrop-blur transition-all duration-200 hover:bg-white/40 active:scale-[0.97] dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
  ```

- [ ] **Step 2: Add transition-all and active:scale to Manage Profile button (line 319)**

  Change from:
  ```tsx
  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
  ```
  To:
  ```tsx
  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-foreground/90 active:scale-[0.97]"
  ```

---

### Task 7: Calendar Grid — Glassmorphism Enhancement

**Files:**
- Modify: `app/[locale]/(landing)/trader/[slug]/calendar-grid.tsx`

- [ ] **Step 1: Enhance calendar day cells**

  Change line 30 in `calendar-grid.tsx` from:
  ```tsx
  'group relative flex flex-col items-center justify-center rounded-md border px-0.5 py-1 sm:py-1.5 transition-all duration-150 hover:scale-[1.08] hover:shadow-sm',
  ```
  To:
  ```tsx
  'group relative flex flex-col items-center justify-center rounded-md border px-0.5 py-1 sm:py-1.5 transition-all duration-200 hover:scale-[1.08] hover:shadow-md backdrop-blur-sm',
  ```

- [ ] **Step 2: Change the empty/no-trade day class**

  In the same ternary, the empty day class:
  ```tsx
  : 'border-transparent bg-muted/10 hover:bg-muted/30',
  ```
  Change to:
  ```tsx
  : 'border-transparent bg-white/5 hover:bg-white/10 dark:bg-zinc-800/10 dark:hover:bg-zinc-800/30',
  ```

---

### Verification

**Checklist to run before claiming completion:**

- [ ] `npm run typecheck` — 0 new type errors
- [ ] `npm run lint` — 0 new lint warnings
- [ ] Check page renders without overlap between navbar and content
- [ ] Cards have glass/blur effect visible
- [ ] Framer Motion spring animation plays on page load (content fades in with slight upward movement)
- [ ] Buttons have scale-down effect on click
- [ ] Calendar grid cells have glass/blur effect

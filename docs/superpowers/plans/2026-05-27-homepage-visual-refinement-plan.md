# Homepage Visual Refinement + App-wide Color Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans.

**Goal:** Refine home page visuals (Hero, TrustBar, Problem, Features, LiveInAction, HowItWorks, FinalCTA) with gradients, glows, and depth — and polish color tokens app-wide.

**Architecture:** Pure CSS variable swaps in `globals.css` for colors; CSS class additions only (no layout/behavior changes) for home page components.

**Tech Stack:** Tailwind CSS v4, React 19, motion/framer-motion

---

### Task 1: App-wide Color Token Refinement

**Files:**
- Modify: `app/globals.css`

Refreshes all color tokens from hex/hsl to oklch with richer chroma.

- [ ] **Step 1: Refresh core dark-mode color tokens**

Replace in `:root` block:

```css
--primary: oklch(0.68 0.24 280);
--primary-foreground: #000000;
--border: oklch(0.18 0.025 280);
--border-subtle: oklch(0.14 0.02 280);
--muted: oklch(0.06 0.01 280);
--muted-foreground: #888888;
--success: oklch(0.65 0.22 150);
--success-foreground: #FFFFFF;
--destructive: oklch(0.6 0.22 25);
--destructive-foreground: #FFFFFF;
--warning: oklch(0.7 0.18 75);
--warning-foreground: #000000;
--info: oklch(0.68 0.24 280);
```

- [ ] **Step 2: Refresh trading P&L colors**

```css
--profit: oklch(0.65 0.22 150);
--profit-bg: oklch(0.65 0.22 150 / 0.08);
--loss: oklch(0.6 0.22 25);
--loss-bg: oklch(0.6 0.22 25 / 0.08);
```

- [ ] **Step 3: Refresh chart palette**

```css
--chart-1: oklch(0.68 0.24 280);
--chart-2: oklch(0.7 0.15 220);
--chart-3: oklch(0.65 0.18 160);
--chart-4: oklch(0.65 0.2 300);
--chart-5: oklch(0.65 0.2 350);
--chart-6: #0E7490;
--chart-7: #0E7490;
--chart-8: #6E6E73;
```

- [ ] **Step 4: Refresh semantic channel tokens**

```css
--semantic-success: 155 58% 39%;
--semantic-error: 0 62% 55%;
--semantic-warning: 38 92% 50%;
--semantic-info: 263 85% 65%;
```

- [ ] **Step 5: Commit**

```bash
git add app/globals.css && git commit -m "refactor: refresh color tokens to oklch with richer chroma"
```

### Task 2: Hero Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/Hero.tsx`

Adds gradient glow, grid background pattern, gradient text treatment, enhanced dashboard card.

- [ ] **Step 1: Add radial glow behind headline, gradient text, grid pattern to Hero**

In the outer div (currently line 15 `className="relative grid items-center gap-8 lg:grid-cols-2"`), add a background glow sibling div before the grid. Wrap the hero headline span in gradient text classes.

- [ ] **Step 2: Add glow border and area fill to mock dashboard**

Add shadow classes to dashboard card. Add gradient area fill below SVG path using a second SVG path.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(home)/components/Hero.tsx && git commit -m "feat: hero visual refinement — glow, gradient text, dashboard polish"
```

### Task 3: TrustBar Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/TrustBar.tsx`

Adds micro-trend indicators, gradient divider line.

- [ ] **Step 1: Add micro-trend arrows and gradient divider**

Replace the simple text with micro-trend indicators. Add a gradient top border.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(home)/components/TrustBar.tsx && git commit -m "feat: trustbar refinement — micro trends, gradient divider"
```

### Task 4: Problem + Features Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/Problem.tsx`
- Modify: `app/[locale]/(home)/components/Features.tsx`

Adds gradient icon placeholders, enhanced hover states, gradient underline.

- [ ] **Step 1: Add gradient icon circles and enhanced hover to Problem**

Add icon circle before each title, enhance hover with shadow and gradient.

- [ ] **Step 2: Apply same treatment to Features + add gradient underline**

Same icon + hover treatment. Add gradient underline to section heading.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/(home)/components/Problem.tsx app/[locale]/(home)/components/Features.tsx && git commit -m "feat: problem + features refinement — gradient icons, enhanced hover"
```

### Task 5: LiveInAction Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/LiveInAction.tsx`

Adds inner shadow, animated pulse ring on play button, gradient overlay.

- [ ] **Step 1: Add cinematic enhancements to video section**

Add `shadow-[inset_0_0_40px_-20px] shadow-primary/10` to container. Add pulse animation keyframe and apply to play button. Add gradient overlay.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(home)/components/LiveInAction.tsx && git commit -m "feat: live in action refinement — cinematic glow, pulse button"
```

### Task 6: HowItWorks Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/HowItWorks.tsx`

Adds gradient backgrounds, gradient number badges, animated arrow connectors.

- [ ] **Step 1: Add gradient backgrounds and animated connectors**

Add gradient background to step cards, gradient badges, animate arrow connectors.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(home)/components/HowItWorks.tsx && git commit -m "feat: how it works refinement — gradient badges, animated connectors"
```

### Task 7: FinalCTA Visual Refinement

**Files:**
- Modify: `app/[locale]/(home)/components/FinalCTA.tsx`

Adds dot-grid background pattern, gradient border on badge, glow on buttons.

- [ ] **Step 1: Add dot pattern background and polish**

Add `bg-[radial-gradient(...)]` dot grid behind the section, gradient border on badge, hover glow on buttons.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/(home)/components/FinalCTA.tsx && git commit -m "feat: final CTA refinement — dot pattern, glow effects"
```

### Task 8: Add Animation Keyframes for New Effects

**Files:**
- Modify: `styles/animations.css`

Adds pulse-ring keyframe for play button, dash-flow for arrow connectors.

- [ ] **Step 1: Add new keyframes**

```css
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 oklch(0.68 0.24 280 / 0.4); }
  70% { box-shadow: 0 0 0 15px oklch(0.68 0.24 280 / 0); }
  100% { box-shadow: 0 0 0 0 oklch(0.68 0.24 280 / 0); }
}

@keyframes dash-flow {
  to { stroke-dashoffset: -20; }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/animations.css && git commit -m "feat: add pulse-ring and dash-flow keyframes"
```

# Home Page Visual Refinement + App-wide Color Polish

## Scope
- **Complete visual redesign** of `app/[locale]/(home)/` — Hero, TrustBar, Problem, Features, LiveInAction, HowItWorks, FinalCTA
- **App-wide color token refinement** — richer oklch values, zero conflicts
- **No functional UI changes** — layout structure, sections, content, and behavior stay identical

---

## 1. Home Page Visual Redesign

### 1.1 Hero (`Hero.tsx`)
- Add subtle radial gradient glow behind headline (`bg-[radial-gradient(...)]`)
- Gradient text on "command center" span (`bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent`)
- Animated grid dot pattern in background (`bg-[radial-gradient(...]` with slow pulse)
- Mock dashboard card gets soft glow border (`shadow-[0_0_30px_-5px] shadow-primary/20`)
- SVG mini-chart line gets subtle gradient fill underneath (area fill)
- Live badge gets pulsing dot animation

### 1.2 TrustBar (`TrustBar.tsx`)
- Keep text stats but add micro-trend indicators (tiny green/red arrows with percentages)
- Firm list becomes scrolling marquee with `animate-scroll` (already exists in RollingAdBanner)
- Subtle `bg-gradient-to-r from-transparent via-muted/30 to-transparent` divider line

### 1.3 Problem (`Problem.tsx`)
- Add gradient icon placeholders (24x24 gradient circles) before each title
- Cards get `hover:shadow-[0_0_20px_-8px] hover:shadow-primary/10` on hover
- Slightly larger corner rounding (already `rounded-xl` — keep)
- Card borders shift from `border-border/30` to `border-border/50` default, `hover:border-primary/30`
- Add subtle `bg-gradient-to-br from-transparent via-primary/[0.02] to-transparent` on hover

### 1.4 Features (`Features.tsx`)
- Same card treatment as Problem section for consistency
- Add icon placeholders matching problem section style
- Section heading gets a subtle gradient underline (`h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent`)

### 1.5 LiveInAction (`LiveInAction.tsx`)
- Larger cinematic container with inner shadow (`shadow-[inset_0_0_40px_-20px] shadow-primary/10`)
- Play button gets animated ring expansion on hover (CSS keyframe pulse)
- Gradient overlay on video placeholder (`bg-gradient-to-t from-primary/5 to-transparent`)
- Time badge gets subtle background instead of opaque

### 1.6 HowItWorks (`HowItWorks.tsx`)
- Step cards get subtle gradient background (`bg-gradient-to-br from-primary/[0.03] to-transparent`)
- Number badges become gradient (`bg-gradient-to-br from-primary to-primary/60`)
- Arrow connectors between steps get animated dash flow (CSS animation)
- Subtle icon color shift on hover

### 1.7 FinalCTA (`FinalCTA.tsx`)
- Section gets subtle dot-grid background pattern
- CTA buttons get enhanced hover states with glow
- "Start today" badge gets gradient border
- Section gets a subtle top gradient fade (`before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent`)

---

## 2. App-wide Color Refinement

### 2.1 Primary accent
- Current: `hsl(263, 85%, 65%)`
- Refine: `oklch(0.68 0.24 280)` — slightly richer chroma, purer purple tone
- Light mode primary: `oklch(0.55 0.22 260)` — deeper cobalt for light bg

### 2.2 Border system
- `--border`: `oklch(0.15 0.02 280)` → `oklch(0.18 0.025 280)` — slightly more visible
- `--border-subtle`: `oklch(0.12 0.015 280)` → `oklch(0.14 0.02 280)`

### 2.3 Surface colors
- `--muted`: `#0D0D0D` → `oklch(0.06 0.01 280)` — oklch for consistency
- `--card`: stays `#000000`
- `--background`: stays `#000000`
- `--popover`: stays `#000000`

### 2.4 Semantic colors
- `--success`: `#0ECB81` → `oklch(0.65 0.22 150)` — richer green
- `--destructive`: `#F6465D` → `oklch(0.6 0.22 25)` — richer red
- `--warning`: `hsl(38, 92%, 50%)` → `oklch(0.7 0.18 75)` — warmer amber
- `--info`: stays same as primary

### 2.5 Trading P&L colors
- `--profit`: `#0ECB81` → `oklch(0.65 0.22 150)` — match success
- `--loss`: `#F6465D` → `oklch(0.6 0.22 25)` — match destructive

### 2.6 Chart palette refresh
- `--chart-1`: `hsl(263, 85%, 65%)` → `oklch(0.68 0.24 280)` — match primary
- `--chart-2`: `hsl(190, 80%, 55%)` → `oklch(0.7 0.15 220)` — deeper cyan
- `--chart-3`: `hsl(150, 70%, 50%)` → `oklch(0.65 0.18 160)` — richer green
- `--chart-4`: `hsl(280, 80%, 70%)` → `oklch(0.65 0.2 300)` — more vibrant violet
- `--chart-5`: `hsl(330, 90%, 65%)` → `oklch(0.65 0.2 350)` — richer magenta

### 2.7 Sidebar tokens
- No changes — already theme-responsive and conflict-free

---

## 3. Zero Conflicts Guarantee
- All color changes are CSS variable value swaps only — no new variables, no renamed tokens
- No Tailwind class or semantic token renames
- No CSS selector changes
- No functional component changes
- Home page: only visual CSS classes added (gradients, glows, shadows, animations) — no layout or content changes
- All animations respect `prefers-reduced-motion`

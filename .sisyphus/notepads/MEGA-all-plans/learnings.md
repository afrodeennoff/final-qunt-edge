## Task D1: loadData Hydration Pipeline Fix

### Zustand Setter Stability Confirmed
All Zustand selectors use `(state) => state.setX` pattern. Zustand's `create()` guarantees these are referentially stable — they never change identity across renders. Safe to exclude from dependency arrays.

### State Exposure Pattern
The DataProvider uses split contexts (UiState, Actions, DataState, etc.). New UI state goes in `DashboardUiState`, new actions go in `DashboardActions`. Both are provided via dedicated context providers and consumed via narrow hook selectors (e.g., `useDashboardActions()`).

### Pre-existing TS Errors
`rithmic-credentials-manager.tsx` has 2 pre-existing TS2345 errors (Promise passed where Record expected). Not related to D1 changes.

## F3-F8: Home Wave 1 Component Rewrites (2026-04-02)

### oklch → Semantic Token Mapping
- `oklch(0.55 0.22 264)` (blue) → `hsl(var(--primary))` or `text-primary` / `border-primary` / `bg-primary`
- `oklch(0.45 0.18 290)` (purple) → `hsl(var(--primary)/0.7)` for gradients
- `oklch(0.07 0 0)` (near-black) → `bg-background`
- `oklch(0.14 0 0)` (dark gray) → `hsl(var(--mk-border))` or `border-border`

### Animated Counter Pattern
- Custom `useAnimatedCounter` hook with `requestAnimationFrame` and cubic ease-out
- Must use `useInView` + `once: true` for scroll-trigger
- `useReducedMotion()` from framer-motion for accessibility fallback
- Type-safe stat objects need `prefix: ''` on all entries to avoid union type narrowing issues

### FeaturesBento Col-Span Spec
- Grid is `grid-cols-4` with specific spans: 2+2, 1+3, 2+2
- Multi-Broker (col-span-3) is the widest card, not Security (was col-span-4 before)
- AI Insights highlighted with `border-primary/25` + `shadow-[0_0_32px_-12px_hsl(var(--primary)/0.15)]`
- The `accent` field was replaced with `highlighted: boolean` since both accents now use primary tokens

### HomeContent Orphan Note
- `ProblemStatement.tsx` was created but NOT added to `HomeContent.tsx` imports/render
- HomeContent integration is a separate orchestration task
- DashboardPreview is rendered twice: once inside Hero and once standalone in HomeContent (pre-existing)

### _constants.ts Reuse
- `MOTION_EASE`, `STAGGER_CARD`, `TYPO_MINOR`, `TYPO_EYEBROW`, `BORDER_SECTION` are shared design constants
- Cast `MOTION_EASE` as `unknown as number[]` when passing to framer-motion `ease` prop (readonly tuple → mutable array type mismatch)

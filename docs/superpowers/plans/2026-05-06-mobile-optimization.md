# Mobile Responsiveness Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the entire Qunt Edge app for mobile responsiveness with gesture-rich touch interactions, while preserving the 2026 Mac aesthetic and dark theme.

**Architecture:** Extend existing Tailwind breakpoints and framer-motion for gestures. Create an enhanced `useResponsive()` hook, a `GestureProvider` context, and mobile-specific component variants only where desktop components can't adapt. No new npm dependencies.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, framer-motion, Recharts, react-grid-layout, TipTap

---

## Task 1: Enhanced Responsive Hook & CSS Foundation

**Files:**
- Create: `hooks/use-responsive.tsx`
- Modify: `app/globals.css`
- Modify: `hooks/use-mobile.tsx`

- [ ] **Step 1: Create the `useResponsive` hook**

Create `hooks/use-responsive.tsx`:

```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
type Orientation = 'portrait' | 'landscape'

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
}

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['3xl']) return '3xl'
  if (width >= BREAKPOINTS['2xl']) return '2xl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

export function useResponsive() {
  const [width, setWidth] = useState<number>(0)
  const [orientation, setOrientation] = useState<Orientation>('portrait')

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth)
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return useMemo(() => {
    const breakpoint = getBreakpoint(width)
    return {
      breakpoint,
      width,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
    }
  }, [width, orientation])
}
```

- [ ] **Step 2: Add mobile CSS utilities to `app/globals.css`**

Append to the end of the `@layer base` block in `app/globals.css`, after the existing interactive element transitions:

```css
  /* Mobile-optimized smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* iOS momentum scrolling for all overflow containers */
  .overflow-auto,
  .overflow-x-auto,
  .overflow-y-auto,
  .overflow-scroll {
    -webkit-overflow-scrolling: touch;
  }

  /* Touch target minimum size utility */
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }

  /* Safe area padding for notched devices */
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .pt-safe {
    padding-top: env(safe-area-inset-top, 0px);
  }
  .pl-safe {
    padding-left: env(safe-area-inset-left, 0px);
  }
  .pr-safe {
    padding-right: env(safe-area-inset-right, 0px);
  }

  /* Focus visible ring for keyboard navigation */
  :focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *,
    ::before,
    ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Landscape orientation on tablet — adjust bottom nav */
  @media (orientation: landscape) and (max-height: 500px) {
    .mobile-landscape-compact {
      padding-top: env(safe-area-inset-top, 0px);
      padding-bottom: 4px;
    }
  }
```

- [ ] **Step 3: Commit**

```bash
git add hooks/use-responsive.tsx app/globals.css
git commit -m "feat: add useResponsive hook and mobile CSS utilities"
```

---

## Task 2: Gesture Provider System

**Files:**
- Create: `components/providers/gesture-provider.tsx`
- Modify: `app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Create the GestureProvider**

Create `components/providers/gesture-provider.tsx`:

```tsx
'use client'

import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface GestureCallbacks {
  onSwipe?: (direction: SwipeDirection) => void
  onPullToRefresh?: () => void
}

interface GestureContextValue {
  registerSwipeArea: (element: HTMLElement, callbacks: GestureCallbacks) => () => void
  vibrate: (pattern?: number | number[]) => void
}

const GestureContext = createContext<GestureContextValue | null>(null)

const SWIPE_THRESHOLD = 50
const PULL_THRESHOLD = 80

export function GestureProvider({ children }: { children: ReactNode }) {
  const areasRef = useRef<Map<HTMLElement, GestureCallbacks>>(new Map())

  const registerSwipeArea = useCallback((element: HTMLElement, callbacks: GestureCallbacks) => {
    areasRef.current.set(element, callbacks)

    let startX = 0
    let startY = 0
    let pulling = false

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      pulling = false
    }

    const onTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY
      if (startY < 60 && deltaY > PULL_THRESHOLD && callbacks.onPullToRefresh) {
        pulling = true
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (pulling && callbacks.onPullToRefresh) {
        callbacks.onPullToRefresh()
        pulling = false
        return
      }

      const deltaX = e.changedTouches[0].clientX - startX
      const deltaY = e.changedTouches[0].clientY - startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      if (Math.max(absDeltaX, absDeltaY) < SWIPE_THRESHOLD) return
      if (!callbacks.onSwipe) return

      if (absDeltaX > absDeltaY) {
        callbacks.onSwipe(deltaX > 0 ? 'right' : 'left')
      } else {
        callbacks.onSwipe(deltaY > 0 ? 'down' : 'up')
      }
    }

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      areasRef.current.delete(element)
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  return (
    <GestureContext.Provider value={{ registerSwipeArea, vibrate }}>
      {children}
    </GestureContext.Provider>
  )
}

export function useGestures() {
  const ctx = useContext(GestureContext)
  if (!ctx) throw new Error('useGestures must be used within GestureProvider')
  return ctx
}
```

- [ ] **Step 2: Integrate GestureProvider in dashboard layout**

In `app/[locale]/dashboard/layout.tsx`, add the import:

```tsx
import { GestureProvider } from '@/components/providers/gesture-provider'
```

Then wrap the dashboard content inside a `<GestureProvider>`:

Find the component that returns the dashboard layout JSX. Wrap the main content area (the children) with `<GestureProvider>`. The exact wrapping location depends on the current layout structure — wrap at the outermost level of the `SidebarLayoutShell` or equivalent component's return, around the existing children/content rendering.

- [ ] **Step 3: Commit**

```bash
git add components/providers/gesture-provider.tsx app/[locale]/dashboard/layout.tsx
git commit -m "feat: add GestureProvider for touch swipe and pull-to-refresh"
```

---

## Task 3: Landing Page Mobile Optimization

**Files:**
- Modify: `app/[locale]/(landing)/components/hero.tsx`
- Modify: `app/[locale]/(landing)/components/features.tsx`
- Modify: `app/[locale]/(landing)/components/how-it-works.tsx`
- Modify: `app/[locale]/(home)/components/HomeContent.tsx`

- [ ] **Step 1: Update Hero component for mobile**

In `app/[locale]/(landing)/components/hero.tsx`:

Replace the hero section className to use fluid typography that works from 320px. Find the section/container element and update:
- Change fixed hero text sizes (like `text-[42px]`) to use fluid classes: `text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl`
- Ensure button container uses `flex flex-col sm:flex-row` with `gap-4 sm:gap-6`
- Add `px-4 xs:px-6 sm:px-8` for progressive horizontal padding
- Ensure `py-16 sm:py-24 lg:py-40` for vertical padding scaling
- Add `touch-target` class to all CTA buttons
- If partner logos exist, add `flex-wrap justify-center gap-4 sm:gap-6`

- [ ] **Step 2: Update Features component for mobile**

In `app/[locale]/(landing)/components/features.tsx`:

- Ensure the main grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-8` (or equivalent mobile-first stacking)
- Feature cards should stack vertically on mobile: `grid-cols-1 lg:grid-cols-2`
- Add `gap-4 sm:gap-6 lg:gap-8` for progressive spacing
- Ensure feature card text uses fluid sizes
- Add `touch-target` to any clickable feature cards

- [ ] **Step 3: Update HowItWorks for mobile swipe carousel**

In `app/[locale]/(landing)/components/how-it-works.tsx`:

The steps section currently uses a grid. On mobile, convert to a horizontally scrollable carousel:

Find the steps grid container and add a conditional wrapper. For the mobile experience, wrap the steps in a horizontally scrollable container:

```tsx
{/* On mobile: horizontal scroll, on desktop: grid */}
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
  {steps.map((step, i) => (
    <div
      key={i}
      className="min-w-[280px] flex-shrink-0 snap-center lg:min-w-0"
    >
      {/* step content */}
    </div>
  ))}
</div>
```

- Ensure each step card has `snap-center` for snap scrolling
- Add a scroll indicator dot bar below the carousel on mobile (hide on `lg:`)

- [ ] **Step 4: Update HomeContent for mobile CTA**

In `app/[locale]/(home)/components/HomeContent.tsx`:

- Ensure the final CTA section uses `flex flex-col sm:flex-row` for button stacking
- Add `px-4 sm:px-6` for consistent mobile padding
- Ensure CTA buttons have `touch-target` class
- Verify the main content wrapper has `overflow-x-hidden` to prevent horizontal scroll

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/(landing)/components/ app/[locale]/(home)/components/
git commit -m "feat: optimize landing page for mobile with fluid typography and swipe carousel"
```

---

## Task 4: Mobile Bottom Nav Enhancement

**Files:**
- Modify: `components/mobile-bottom-nav.tsx`

- [ ] **Step 1: Enhance mobile bottom nav with swipe actions**

In `components/mobile-bottom-nav.tsx`:

Add safe-area padding and landscape compact mode. Update the outer container className to include:
- `pb-safe mobile-landscape-compact` for safe area and landscape handling
- Ensure `min-h-[48px]` (already present, verify)
- Add `transition-all duration-200` for smooth appearance changes

Verify the `md:hidden` class is present to ensure it only shows on mobile.

- [ ] **Step 2: Commit**

```bash
git add components/mobile-bottom-nav.tsx
git commit -m "feat: enhance mobile bottom nav with safe area and landscape support"
```

---

## Task 5: Widget Canvas Mobile Enhancements

**Files:**
- Modify: `app/[locale]/dashboard/components/widget-canvas.tsx`

- [ ] **Step 1: Add widget expand overlay for mobile**

In `app/[locale]/dashboard/components/widget-canvas.tsx`:

Add state for expanded widget and a fullscreen overlay component:

```tsx
const [expandedWidget, setExpandedWidget] = useState<string | null>(null)
```

Create a `WidgetExpandOverlay` component that renders when `expandedWidget` is set. This overlay:
- Fills the viewport (`fixed inset-0 z-50 bg-background`)
- Uses framer-motion `drag="y"` with `dragConstraints={{ top: 0 }}` for pull-down-to-dismiss
- Renders the expanded widget content at full size
- Has `onDragEnd` handler that dismisses if dragged more than 100px down

```tsx
{expandedWidget && isMobile && (
  <motion.div
    className="fixed inset-0 z-50 bg-background overflow-auto pb-safe pt-safe"
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    dragElastic={0.4}
    onDragEnd={(_, info) => {
      if (info.offset.y > 100) setExpandedWidget(null)
    }}
  >
    <div className="flex justify-center pt-2 pb-2">
      <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
    </div>
    {/* Render the expanded widget content */}
  </motion.div>
)}
```

Add `onClick` on widget headers (mobile only) to trigger expansion:
```tsx
onDoubleClick={() => { if (isMobile) setExpandedWidget(widgetId) }}
```

Note: Use double-tap on mobile to expand (more natural than single tap which is used for scrolling).

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/components/widget-canvas.tsx
git commit -m "feat: add mobile widget expand overlay with pull-down dismiss"
```

---

## Task 6: Table Mobile Card Layout

**Files:**
- Modify: `app/[locale]/dashboard/components/tables/trade-table-review.tsx`
- Create: `components/ui/mobile-card-table.tsx`

- [ ] **Step 1: Create reusable MobileCardTable component**

Create `components/ui/mobile-card-table.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CardField {
  key: string
  label: string
  render: (value: unknown) => React.ReactNode
  primary?: boolean
}

interface MobileCardTableProps {
  data: Record<string, unknown>[]
  fields: CardField[]
  expandable?: boolean
  expandContent?: (row: Record<string, unknown>) => React.ReactNode
  onRowTap?: (row: Record<string, unknown>) => void
}

export function MobileCardTable({
  data,
  fields,
  expandable = true,
  expandContent,
  onRowTap,
}: MobileCardTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const primaryFields = fields.filter((f) => f.primary || !f.primary).slice(0, 3)
  const secondaryFields = fields.slice(3)

  return (
    <div className="space-y-2 px-2">
      {data.map((row, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 bg-card p-3 touch-target"
          onClick={() => {
            if (expandable) setExpandedIndex(expandedIndex === i ? null : i)
            onRowTap?.(row)
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {primaryFields.map((field) => (
                <div key={field.key} className="flex items-baseline gap-2">
                  {field.primary && (
                    <span className="text-sm font-medium truncate">
                      {field.render(row[field.key])}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {secondaryFields.slice(0, 2).map((field) => (
                <span key={field.key}>{field.render(row[field.key])}</span>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {expandedIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-2 border-t border-border/30 space-y-1.5">
                  {secondaryFields.map((field) => (
                    <div key={field.key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{field.label}</span>
                      <span className="font-medium">{field.render(row[field.key])}</span>
                    </div>
                  ))}
                  {expandContent && expandContent(row)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Integrate MobileCardTable into trade table**

In `app/[locale]/dashboard/components/tables/trade-table-review.tsx`:

Import the `MobileCardTable` and `useDataIsMobile`. Where the table renders, add a conditional:

```tsx
{isMobile ? (
  <MobileCardTable
    data={tableData}
    fields={[
      { key: 'symbol', label: 'Symbol', render: (v) => v, primary: true },
      { key: 'side', label: 'Side', render: (v) => v },
      { key: 'pnl', label: 'P&L', render: (v) => v },
      { key: 'entryTime', label: 'Entry', render: (v) => v },
      { key: 'exitTime', label: 'Exit', render: (v) => v },
      { key: 'quantity', label: 'Qty', render: (v) => v },
      { key: 'entryPrice', label: 'Entry Price', render: (v) => v },
      { key: 'exitPrice', label: 'Exit Price', render: (v) => v },
    ]}
  />
) : (
  /* existing desktop table */
)}
```

The exact field keys depend on the actual column definitions in the file — match them to the existing TanStack Table column definitions.

- [ ] **Step 3: Commit**

```bash
git add components/ui/mobile-card-table.tsx app/[locale]/dashboard/components/tables/trade-table-review.tsx
git commit -m "feat: add mobile card layout for trade tables"
```

---

## Task 7: TipTap Editor Mobile Toolbar

**Files:**
- Modify: `components/tiptap-editor.tsx`

- [ ] **Step 1: Add mobile floating toolbar to TipTap editor**

In `components/tiptap-editor.tsx`:

Import `useIsMobile` from `@/hooks/use-mobile`. Add a mobile-specific toolbar that floats at the bottom of the screen:

```tsx
{isMobile && (
  <div className="fixed bottom-16 inset-x-0 z-40 flex items-center justify-center gap-1 rounded-t-2xl border-t border-border/50 bg-card/95 backdrop-blur-lg px-2 py-2 pb-safe">
    <button
      onClick={() => editor.chain().focus().toggleBold().run()}
      className={`touch-target rounded-lg px-3 py-2 text-sm ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
    >
      B
    </button>
    <button
      onClick={() => editor.chain().focus().toggleItalic().run()}
      className={`touch-target rounded-lg px-3 py-2 text-sm italic ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
    >
      I
    </button>
    <button
      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      className={`touch-target rounded-lg px-3 py-2 text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
    >
      H2
    </button>
    <button
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      className={`touch-target rounded-lg px-3 py-2 text-sm ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
    >
      &bull;
    </button>
    <button
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      className={`touch-target rounded-lg px-3 py-2 text-sm ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
    >
      1.
    </button>
  </div>
)}
```

Hide the desktop toolbar on mobile by adding `hidden md:flex` to the existing toolbar container.

- [ ] **Step 2: Commit**

```bash
git add components/tiptap-editor.tsx
git commit -m "feat: add mobile floating toolbar for TipTap editor"
```

---

## Task 8: Sidebar Swipe-to-Open

**Files:**
- Modify: `components/ui/unified-sidebar.tsx`

- [ ] **Step 1: Add swipe-right from left edge to open sidebar**

In `components/ui/unified-sidebar.tsx`:

Add a touch gesture listener on the main content area that detects a swipe from the left edge (first 20px of screen). When detected on mobile, call `setOpenMobile(true)`.

This is best done by adding a transparent touch zone on the left edge of the screen (mobile only):

```tsx
{/* Swipe zone for opening sidebar on mobile */}
{isMobile && !openMobile && (
  <div
    className="fixed left-0 top-0 bottom-0 w-5 z-30"
    onTouchStart={(e) => {
      const startX = e.touches[0].clientX
      const startY = e.touches[0].clientY
      let moved = false

      const onMove = (ev: TouchEvent) => {
        const dx = ev.touches[0].clientX - startX
        if (dx > 30 && Math.abs(ev.touches[0].clientY - startY) < 50) {
          moved = true
        }
      }
      const onEnd = () => {
        if (moved) setOpenMobile(true)
        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)
      }

      document.addEventListener('touchmove', onMove, { passive: true })
      document.addEventListener('touchend', onEnd, { once: true })
    }}
  />
)}
```

Use the existing `useSidebar()` hook's `setOpenMobile` and `openMobile` state.

- [ ] **Step 2: Commit**

```bash
git add components/ui/unified-sidebar.tsx
git commit -m "feat: add swipe-from-edge to open sidebar on mobile"
```

---

## Task 9: Touch Target Audit & Button Component Fix

**Files:**
- Modify: `components/ui/button.tsx`

- [ ] **Step 1: Ensure button component meets 44px touch targets**

In `components/ui/button.tsx`:

Add a minimum height/width for the default and sm button variants to ensure 44px touch targets on mobile. Find the `buttonVariants` function or `cn()` class merging and add:

For the default variant: ensure `min-h-[44px] min-w-[44px]` is applied when the button is interactive (not loading/disabled).

For icon-only buttons: ensure they have explicit `h-11 w-11` (44px) sizing.

For `size="sm"` variant: use `min-h-[36px]` on desktop but `min-h-[44px]` on mobile via `min-h-[36px] md:min-h-[36px]` — or simply keep `min-h-[44px]` everywhere since it's only 8px difference.

Add to the base button classes:
```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors min-h-[44px] min-w-[44px] ...
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/button.tsx
git commit -m "fix: ensure all buttons meet 44px mobile touch target minimum"
```

---

## Task 10: Pull-to-Refresh on Dashboard

**Files:**
- Modify: `app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Add pull-to-refresh indicator**

In the dashboard layout, add a visual pull-to-refresh indicator that works with the GestureProvider:

Create a small component inside the layout file:

```tsx
function PullToRefreshIndicator() {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { registerSwipeArea } = useGestures()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    return registerSwipeArea(containerRef.current, {
      onPullToRefresh: async () => {
        setRefreshing(true)
        // Trigger router refresh
        window.location.reload()
      },
    })
  }, [registerSwipeArea])

  return (
    <div ref={containerRef}>
      <AnimatePresence>
        {(pulling || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: refreshing ? 48 : 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center text-xs text-muted-foreground"
          >
            {refreshing ? 'Refreshing...' : 'Pull to refresh'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

Place this at the top of the dashboard content area, before the main content rendering.

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/layout.tsx
git commit -m "feat: add pull-to-refresh indicator on mobile dashboard"
```

---

## Task 11: Orientation-Aware Layout

**Files:**
- Modify: `components/mobile-bottom-nav.tsx`
- Modify: `app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Handle landscape orientation on mobile**

In `components/mobile-bottom-nav.tsx`:

The CSS class `mobile-landscape-compact` was added in Task 2 to globals.css. Apply it to the bottom nav container:

Find the outer `<nav>` or container div and add `mobile-landscape-compact` to its className.

In the dashboard layout, add a condition for landscape mobile that adjusts the main content area to have less vertical padding:

```tsx
// Already available from useResponsive hook
// If landscape and mobile, reduce top/bottom padding
```

- [ ] **Step 2: Commit**

```bash
git add components/mobile-bottom-nav.tsx app/[locale]/dashboard/layout.tsx
git commit -m "feat: handle landscape orientation on mobile devices"
```

---

## Task 12: Build Verification & Final Fixes

**Files:**
- All modified files

- [ ] **Step 1: Run TypeScript check**

```bash
npm run typecheck
```

Expected: Zero errors. Fix any type errors found.

- [ ] **Step 2: Run ESLint**

```bash
npm run lint
```

Expected: Zero errors. Fix any lint issues found.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Successful build with zero errors.

- [ ] **Step 4: Commit any fixups**

```bash
git add -A
git commit -m "fix: resolve build errors from mobile optimization"
```

---

## Spec Coverage Check

| Spec Section | Task |
|---|---|
| Responsive Infrastructure | Task 1 |
| Gesture Provider | Task 2 |
| Landing Page Mobile | Task 3 |
| Navigation Enhancement | Task 4, 8, 10 |
| Dashboard Widgets | Task 5 |
| Tables & Data | Task 6 |
| TipTap Editor | Task 7 |
| Touch Targets | Task 9 |
| Orientation | Task 11 |
| Build Verification | Task 12 |
| Safe Areas | Task 1 (CSS), Task 4 (bottom nav) |
| Reduced Motion | Task 1 (CSS) |
| Keyboard A11y | Task 1 (CSS focus-visible) |
| Smooth Scrolling | Task 1 (CSS) |

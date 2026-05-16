# Mobile Responsiveness Optimization — Design Spec

**Date:** 2026-05-06
**Status:** Approved
**Approach:** Responsive Utility Layer (Approach A)

## Scope

Full-sweep mobile optimization of all 5 app areas: landing page, dashboard widgets, navigation/gestures, tables/editor, and global patterns. Gesture-rich touch interactions using framer-motion (no new dependencies).

## Current State

- Viewport meta tags properly configured
- Tailwind breakpoints from xs (320px) to 2xl (1400px)
- Sidebar uses Sheet on mobile with useIsMobile() hook
- Mobile bottom nav exists with 48px touch targets
- Dashboard widget grid has responsive breakpoints (lg/md/sm/xs/xxs)
- Charts use ResponsiveContainer from Recharts
- Modals switch to Sheet on mobile

## Design

### 1. Responsive Infrastructure

**Enhanced `useResponsive()` hook** — richer API than current boolean `useIsMobile()`:
- `breakpoint`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `isMobile`, `isTablet`, `isDesktop` booleans
- `orientation`: 'portrait' | 'landscape'

**Tailwind config extensions:**
- Add `4xl: '1920px'` and `5xl: '2560px'` breakpoints
- Add `touch-target` utility: `min-w-[44px] min-h-[44px]`
- Add safe-area padding utility for `env(safe-area-inset-*)`
- Fluid typography with `clamp()` for headings
- `scroll-smooth` on base HTML

**No new npm dependencies.** framer-motion handles all gesture work.

### 2. Landing Page Mobile

- Hero: vertical stack on mobile, `clamp()` typography, hide decorations below `md`
- Features Bento: single-column stack on mobile, scroll-triggered animations
- How It Works: horizontal swipe carousel on mobile via framer-motion `drag="x"`
- Final CTA: full-width, compact padding, 44px+ button
- Nav links: 44px tap targets throughout

### 3. Dashboard Widget Grid

- Widgets stack vertically at full width on mobile (existing `w: 12`)
- Swipe-up on widget header to expand fullscreen overlay
- Fullscreen overlay: pull-down-to-dismiss via framer-motion `drag="y"`
- Long-press to enter drag/reorder mode on mobile
- Chart widgets: add pinch-to-zoom wrapper
- Statistics widgets: stack metrics vertically, larger touch cards

### 4. Navigation & Gesture System

- Bottom nav: swipe-up for quick-actions sheet, 48px targets (already done)
- Sidebar: swipe-right from left edge to open Sheet
- Dashboard sections: swipe left/right to navigate between pages
- Pull-to-refresh on dashboard data
- Single `GestureProvider` context managing all gesture state
- `navigator.vibrate()` haptic feedback on key gestures

### 5. Tables & Data Display

- Simple tables (< 6 cols): horizontal scroll, sticky first column, scroll indicator
- Complex tables: card-based layout on mobile — each row becomes a stacked card
- Card expand/collapse via framer-motion
- Filters: bottom Sheet with large touch toggles
- Pagination: infinite scroll on mobile replaces page buttons

### 6. TipTap Editor Mobile

- Floating bottom toolbar (essential formatting only: bold, italic, list, heading)
- Editor fills viewport minus toolbar and bottom nav
- Larger text selection handles

### 7. Global Patterns & Accessibility

- Touch targets: audit all interactive elements for 44px minimum
- Keyboard a11y: visible focus rings, proper tabIndex, aria-live for dynamic content
- Scroll: `scroll-behavior: smooth`, momentum scrolling on iOS
- Orientation: `@media (orientation)` for layout shifts (bottom nav to side in landscape)
- Safe areas: `env(safe-area-inset-*)` on fixed elements
- Reduced motion: respect `prefers-reduced-motion`, disable gestures/animations

## Files to Modify (Key)

| File | Change |
|------|--------|
| `tailwind.config.ts` | Add breakpoints, utilities |
| `hooks/use-responsive.ts` | New hook replacing useIsMobile |
| `app/globals.css` | Fluid typography, scroll, safe areas |
| `app/[locale]/(home)/components/*` | Mobile-first restyling |
| `app/[locale]/dashboard/layout.tsx` | GestureProvider integration |
| `app/[locale]/dashboard/components/widget-canvas.tsx` | Expand overlay, long-press |
| `components/mobile-bottom-nav.tsx` | Swipe-up actions |
| `components/ui/unified-sidebar.tsx` | Swipe-right to open |
| `app/[locale]/dashboard/components/tables/*` | Card layout on mobile |
| `components/tiptap-editor.tsx` | Mobile toolbar |
| `components/ui/button.tsx` | Touch target audit |
| Various widget components | Mobile variants |

## Constraints

- Zero new npm dependencies
- Must preserve dark theme with purple accents
- Must preserve 2026 Mac aesthetic on desktop
- Must not break any existing desktop functionality
- framer-motion v11/v12 only for gesture handling
- Build must pass with zero errors

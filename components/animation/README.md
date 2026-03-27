# Animation System Documentation

A comprehensive, performance-optimized animation system for the Qunt Edge trading analytics dashboard. All animations respect `prefers-reduced-motion` and use Framer Motion for complex animations with CSS fallbacks.

## Installation

All animations are available from `@/components/animation`:

```tsx
import {
  AnimateIn,
  AnimateOut,
  Skeleton,
  PageTransition,
  InteractiveWrapper,
  SPRING_PRESETS
} from "@/components/animation"
```

## Core Features

### 1. Entrance & Exit Animations

#### AnimateIn
Versatile entrance animation with multiple variants.

```tsx
import { AnimateIn, AnimateInItem } from "@/components/animation"

// Basic fade animation
<AnimateIn variant="fade">
  <div>Fades in smoothly</div>
</AnimateIn>

// Slide up animation
<AnimateIn variant="slide" direction="up">
  <div>Slides up from below</div>
</AnimateIn>

// Staggered children
<AnimateIn staggerChildren>
  <AnimateInItem>First</AnimateInItem>
  <AnimateInItem>Second</AnimateInItem>
  <AnimateInItem>Third</AnimateInItem>
</AnimateIn>
```

**Props:**
- `variant`: `"fade" | "slide" | "scale" | "bounce"` (default: `"fade"`)
- `direction`: `"up" | "down" | "left" | "right"` (default: `"up"`)
- `delay`: number in seconds (default: `0`)
- `duration`: number in seconds (default: `0.5`)
- `triggerOnScroll`: boolean (default: `false`)
- `staggerChildren`: boolean (default: `false`)
- `staggerDelay`: number in seconds (default: `0.08`)

#### AnimateOut
Exit animation with page transition support.

```tsx
import { AnimateOut } from "@/components/animation"

function Modal({ isOpen, onClose }) {
  return (
    <AnimateOut
      isShown={isOpen}
      variant="fade"
      onAnimationComplete={onClose}
    >
      <div>Modal content</div>
    </AnimateOut>
  )
}
```

### 2. Interactive Animations

#### InteractiveWrapper
Combines multiple interactive effects.

```tsx
import { InteractiveWrapper } from "@/components/animation"

<InteractiveWrapper
  hover="lift"
  press
  magnetic
>
  <button>Interactive Button</button>
</InteractiveWrapper>
```

**Props:**
- `hover`: `"lift" | "glow" | "scale" | "none"` (default: `"none"`)
- `press`: boolean (default: `false`)
- `magnetic`: boolean (default: `false`)
- `draggable`: boolean (default: `false`)

#### MagneticButton
Button with magnetic hover effect.

```tsx
import { MagneticButton } from "@/components/animation"

<MagneticButton strength={8}>
  Click me
</MagneticButton>
```

#### HoverLift
Elegant lift effect on hover.

```tsx
import { HoverLift } from "@/components/animation"

<HoverLift liftDistance={8} shadowIntensity={0.15}>
  <div className="card">Card content</div>
</HoverLift>
```

### 3. Loading States

#### Skeleton
Refined skeleton loader with variants.

```tsx
import { Skeleton } from "@/components/animation"

// Default skeleton
<Skeleton width="100%" height={40} />

// Shimmer effect
<Skeleton variant="shimmer" width="100%" height={40} />

// Pulsing effect
<Skeleton variant="pulsing" width="100%" height={40} />
```

#### SkeletonCard
Pre-configured card skeleton.

```tsx
import { SkeletonCard } from "@/components/animation"

<SkeletonCard
  hasAvatar
  hasTitle
  lines={3}
  shimmer
/>
```

#### ProgressBar
Animated progress bar.

```tsx
import { ProgressBar } from "@/components/animation"

<ProgressBar value={75} max={100} color="success" size="md" />
```

#### CircularProgress
Circular progress indicator.

```tsx
import { CircularProgress } from "@/components/animation"

<CircularProgress value={60} size={48} color="primary" />
```

### 4. Page Transitions

#### PageTransition
Full-page transition wrapper.

```tsx
import { PageTransition } from "@/components/animation"

export default function Layout({ children }) {
  return (
    <PageTransition type="fade-slide" direction="up">
      {children}
    </PageTransition>
  )
}
```

**Props:**
- `type`: `"fade" | "slide" | "scale" | "fade-slide" | "scale-fade"` (default: `"fade-slide"`)
- `direction`: `"up" | "down" | "left" | "right"` (default: `"up"`)
- `mode`: `"wait" | "sync" | "popLayout"` (default: `"wait"`)

#### ModalTransition
Modal with backdrop blur and scale entrance.

```tsx
import { ModalTransition } from "@/components/animation"

<ModalTransition isOpen={showModal} onClose={() => setShowModal(false)}>
  <div className="bg-card p-6 rounded-lg">
    Modal content
  </div>
</ModalTransition>
```

### 5. Spring Configs

Reusable spring presets for consistent animation feel.

```tsx
import { motion } from "framer-motion"
import { SPRING_PRESETS } from "@/components/animation"

<motion.div
  transition={SPRING_PRESETS.gentle}
  whileHover={{ scale: 1.05 }}
>
  Button
</motion.div>
```

**Available Presets:**
- `SPRING_PRESETS.gentle`: Smooth, subtle animations
- `SPRING_PRESETS.snappy`: Quick, responsive animations
- `SPRING_PRESETS.bouncy`: Playful, bouncy animations
- `SPRING_PRESETS.smooth`: Very smooth, gradual animations

## CSS Utilities

### Animation Classes

```html
<!-- Entrance animations -->
<div class="animate-in-fade">Fade in</div>
<div class="animate-in-slide-up">Slide up</div>
<div class="animate-in-scale">Scale in</div>
<div class="animate-in-bounce">Bounce in</div>

<!-- Staggered children -->
<div class="stagger-children">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Fast stagger -->
<div class="stagger-children-fast">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Transition Classes

```html
<!-- Spring-based transitions -->
<div class="transition-spring">Smooth spring</div>
<div class="transition-spring-fast">Fast spring</div>

<!-- Bounce transitions -->
<div class="transition-bounce">Bouncy</div>
<div class="transition-bounce-elastic">Elastic</div>

<!-- Smooth transitions -->
<div class="transition-smooth">Standard ease</div>
```

### Hover Effects

```html
<div class="hover-lift">Lifts on hover</div>
<div class="hover-glow">Glows on hover</div>
<div class="hover-scale">Scales on hover</div>
<div class="hover-brighten">Brightens on hover</div>
```

## Accessibility

All animations respect `prefers-reduced-motion`:

- React components use `useReducedMotion()` hook from Framer Motion
- CSS animations have `@media (prefers-reduced-motion: reduce)` overrides
- Animations are disabled when user prefers reduced motion
- All reduced-motion overrides are tested and working

## Performance

- GPU-accelerated transforms (`transform`, `opacity`)
- Avoid layout-triggering properties (`width`, `height`, `top`, `left`)
- CSS animations for simple, repeatable effects
- Framer Motion for complex, state-driven animations
- `will-change` hints where appropriate

## Best Practices

1. **Use spring animations for UI interactions**:
   ```tsx
   transition={SPRING_PRESETS.gentle}
   ```

2. **Use CSS classes for static animations**:
   ```html
   <div class="animate-in-fade">Content</div>
   ```

3. **Respect user preferences**:
   All components automatically check `prefers-reduced-motion`

4. **Keep animations subtle**:
   - Duration: 0.3-0.6s for most UI animations
   - Easing: Use provided presets for consistency
   - Scale: Limit to 0.95-1.05 range

5. **Use stagger for lists**:
   ```tsx
   <AnimateIn staggerChildren>
     {items.map((item) => (
       <AnimateInItem key={item.id}>{item.content}</AnimateInItem>
     ))}
   </AnimateIn>
   ```

## Migration Guide

### From existing motion primitives:

```tsx
// Before
import { MotionPage } from "@/components/motion/motion-primitives"

// After
import { PageTransition } from "@/components/animation"

<PageTransition type="fade-slide">
  {children}
</PageTransition>
```

### From existing buttons:

```tsx
// Before
import { SpringButton } from "@/components/animation/spring-button"

// After
import { InteractiveWrapper } from "@/components/animation"

<InteractiveWrapper hover="lift" press>
  <button>Button</button>
</InteractiveWrapper>
```

## Examples

### Dashboard Card Entrance

```tsx
import { AnimateIn, AnimateInItem } from "@/components/animation"

function Dashboard() {
  return (
    <AnimateIn staggerChildren>
      <AnimateInItem>
        <MetricCard title="Revenue" value="$42,000" />
      </AnimateInItem>
      <AnimateInItem>
        <MetricCard title="Users" value="1,234" />
      </AnimateInItem>
      <AnimateInItem>
        <MetricCard title="Conversion" value="3.2%" />
      </AnimateInItem>
    </AnimateIn>
  )
}
```

### Interactive Data Table

```tsx
import { HoverLift } from "@/components/animation"

function DataTable({ rows }) {
  return (
    <div>
      {rows.map((row) => (
        <HoverLift key={row.id}>
          <div className="p-4 border-b">{row.content}</div>
        </HoverLift>
      ))}
    </div>
  )
}
```

### Modal with Animation

```tsx
import { ModalTransition } from "@/components/animation"

function Modal({ isOpen, onClose, children }) {
  return (
    <ModalTransition isOpen={isOpen} onClose={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-xl max-w-md">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </ModalTransition>
  )
}
```

## Contributing

When adding new animations:

1. Use `useReducedMotion()` hook in React components
2. Add `@media (prefers-reduced-motion: reduce)` for CSS animations
3. Follow existing naming conventions
4. Document usage examples
5. Test with reduced motion enabled
6. Export from `components/animation/index.ts`

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Web.dev: Animation Performance](https://web.dev/animations-guide/)

# Focus Ring Pattern Documentation

## Overview

The focus ring pattern provides consistent, accessible focus states across all interactive components in the application. This ensures keyboard navigation is clear and visible for all users.

## Design System Integration

The focus ring uses the following design tokens:
- **Color**: `hsl(var(--ring))` - Precision Blue (#2962FF)
- **Background offset**: `hsl(var(--background))` - Deep Obsidian (#050505)
- **Ring size**: 2px
- **Ring offset**: 2px

## Implementation Options

### 1. FocusRing Component (Recommended for Complex Elements)

Use the `FocusRing` wrapper component for complex interactive elements:

```tsx
import { FocusRing } from "@/components/ui/focus-ring"

// Wrap any interactive element
<FocusRing>
  <button>Click me</button>
</FocusRing>

// With custom className
<FocusRing className="rounded-md">
  <div role="button" tabIndex={0}>
    Custom interactive element
  </div>
</FocusRing>
```

**Props:**
- `children`: React.ReactNode - The interactive element to wrap
- `className`: string - Optional additional classes
- Extends all standard HTML div attributes

### 2. Tailwind Utilities (Recommended for Simple Elements)

Use the `focus-ring` utility class for simple focus states:

```tsx
// Apply directly to elements
<button className="focus-ring">
  Submit
</button>

<input className="focus-ring rounded-md" />

<a className="focus-ring inline-block" href="/path">
  Link with focus ring
</a>
```

### 3. Direct Tailwind Classes (For Custom Components)

Use individual focus utilities for maximum control:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
```

## Accessibility Features

### Focus-Visible Only
All focus ring implementations use `:focus-visible` instead of `:focus` to show rings only for keyboard navigation, not mouse clicks. This prevents visual clutter for mouse users while maintaining accessibility.

### Reduced Motion Support

The focus ring respects `prefers-reduced-motion` settings:

```css
/* Smooth transition for users who prefer motion */
@media (prefers-reduced-motion: no-preference) {
  :focus-visible {
    transition: outline-offset 150ms ease-out;
  }
}

/* No animation for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .focus-ring {
    transition: none !important;
  }
}
```

## Component Integration Examples

### Button Component
Already uses the focus ring pattern:
```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))]
```

### Input Component
Custom focus with border color change:
```tsx
focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

### Custom Interactive Cards
```tsx
<FocusRing className="block cursor-pointer">
  <Card>
    <CardContent>Card content</CardContent>
  </Card>
</FocusRing>
```

## Migration Guide

### Before (Inconsistent Focus)
```tsx
// Component 1
<button className="focus:ring-2">

// Component 2
<button className="focus:outline-2">

// Component 3
<button className="focus-visible:ring-4">
```

### After (Consistent Focus)
```tsx
// All components use the same pattern
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]">
```

Or simpler:
```tsx
<button className="focus-ring">
```

## Testing Checklist

When implementing or testing focus states:

- [ ] Focus ring appears on Tab navigation
- [ ] Focus ring color uses `--ring` token (Precision Blue)
- [ ] Focus ring has 2px offset from element
- [ ] Focus ring respects reduced motion preferences
- [ ] Focus ring does NOT appear on mouse click
- [ ] Focus ring is visible on all background colors
- [ ] Focus ring works with custom interactive elements

## Browser Support

The focus-visible pseudo-class is supported in:
- Chrome 86+
- Firefox 85+
- Safari 15.4+
- Edge 86+

For older browsers, consider using the `focus-visible` polyfill.

## Related Standards

- [WCAG 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WICG Focus Visible Proposal](https://github.com/WICG/focus-visible)

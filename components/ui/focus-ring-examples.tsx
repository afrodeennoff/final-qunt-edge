/**
 * FOCUS RING PATTERN - USAGE EXAMPLES
 *
 * This file demonstrates the three ways to implement consistent focus rings
 * across the application.
 */

import { FocusRing } from "@/components/ui/focus-ring"
import { Button as Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * EXAMPLE 1: Using FocusRing Component (Recommended for Complex Elements)
 *
 * Best for: Custom interactive elements, cards, non-button elements
 */
export function FocusRingComponentExample() {
 return (
 <div className="space-y-4 p-6">
 {/* Wrap custom interactive elements */}
 <FocusRing className="block cursor-pointer rounded-lg">
 <div className="border border-border/30 bg-primary/[0.03] p-4">
 <h3 className="font-semibold">Custom Interactive Card</h3>
 <p className="text-sm text-muted-foreground">
 Click or Tab to focus - consistent ring appears
 </p>
 </div>
 </FocusRing>

 {/* Wrap elements that need focus but aren't buttons */}
 <FocusRing>
 <div
 role="button"
 tabIndex={0}
 className="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground"
 >
 Custom Button-like Element
 </div>
 </FocusRing>
 </div>
 )
}

/**
 * EXAMPLE 2: Using Tailwind Utility Class (Simple & Clean)
 *
 * Best for: Standard buttons, inputs, links
 */
export function FocusRingUtilityExample() {
 return (
 <div className="space-y-4 p-6">
 {/* Apply focus-ring utility directly */}
 <button className="focus-ring rounded-md bg-primary px-4 py-2 text-primary-foreground">
 Button with focus-ring utility
 </button>

 <input
 type="text"
 className="focus-ring rounded-md border border-input bg-background px-3 py-2"
 placeholder="Input with focus-ring utility"
 />

 <a
 href="#"
 className="focus-ring inline-block rounded-md text-accent underline"
 >
 Link with focus-ring utility
 </a>
 </div>
 )
}

/**
 * EXAMPLE 3: Direct Tailwind Classes (Maximum Control)
 *
 * Best for: When you need complete control over focus styles
 */
export function FocusRingDirectExample() {
 return (
 <div className="space-y-4 p-6">
 <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground
 focus-visible:outline-none
 focus-visible:ring-2
 focus-visible:ring-[hsl(var(--ring))]
 focus-visible:ring-offset-2
 focus-visible:ring-offset-[hsl(var(--background))]">
 Button with direct focus classes
 </button>

 <Input
 className="
 focus-visible:border-ring
 focus-visible:ring-ring/50
 focus-visible:ring-[3px]"
 placeholder="Input with custom focus styles"
 />
 </div>
 )
}

/**
 * EXAMPLE 4: Existing Components (Already Implemented)
 *
 * Button and Input components already have focus rings built-in
 */
export function ExistingComponentsExample() {
 return (
 <div className="space-y-4 p-6">
 {/* Button component - focus ring already included */}
 <Button variant="solid">
 Standard Button (focus ring built-in)
 </Button>

 <Button variant="outline">
 Outline Button (focus ring built-in)
 </Button>

 {/* Input component - custom focus style already included */}
 <Input placeholder="Standard Input (focus ring built-in)" />
 </div>
 )
}

/**
 * EXAMPLE 5: Accessibility - Keyboard Navigation Demo
 *
 * This demonstrates the focus-visible behavior:
 * - Tab: Shows focus ring ✓
 * - Click: No focus ring ✓
 */
export function KeyboardNavigationExample() {
 return (
 <div className="space-y-4 p-6">
 <p className="text-sm text-muted-foreground">
 Press Tab to navigate - focus rings appear only for keyboard navigation
 </p>

 <div className="flex gap-4">
 <Button size="lg">First Button</Button>
 <Button size="lg">Second Button</Button>
 <Button size="lg">Third Button</Button>
 </div>

 <FocusRing className="block cursor-pointer">
 <div className="border border-border/30 bg-primary/[0.03] p-4">
 Fourth Focusable Element
 </div>
 </FocusRing>
 </div>
 )
}

/**
 * EXAMPLE 6: Reduced Motion Support
 *
 * Focus rings automatically respect user's motion preferences
 * - Users preferring motion: smooth 150ms transition
 * - Users preferring reduced motion: instant appearance
 */
export function ReducedMotionExample() {
 return (
 <div className="space-y-4 p-6">
 <p className="text-sm text-muted-foreground">
 Focus rings automatically adapt to prefers-reduced-motion setting
 </p>

 <Button size="lg">Test Focus Ring Animation</Button>

 <FocusRing>
 <div className="border border-border/30 bg-primary/[0.03] p-4 cursor-pointer">
 Custom Element with Adaptive Animation
 </div>
 </FocusRing>
 </div>
 )
}

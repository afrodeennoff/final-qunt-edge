# UI Audit and Fix End-to-End Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all UI inconsistencies including spacing, typography, color contrast, alignment, padding, margin, responsive behavior, interactive elements (buttons, inputs, selects, modals, tooltips, dropdowns, navigation), design system standardization, theme and color mode issues, and improve loading/empty/error states

**Architecture:** Systematically audit all pages from highest traffic to lowest, identify and fix inconsistencies in design tokens, component styling, spacing patterns, typography hierarchy, color usage, and interactive element states. Create standardized design tokens and reusable component patterns.

**Tech Stack:** Tailwind CSS 4, OKLCH color space, React 19, TypeScript, Radix UI components

---

## Phase 1: Create UI Audit Framework

### Task 1: Create UI Audit Checklist

**Files:**
- Create: `docs/ui-audit-checklist.md`

- [ ] **Step 1: Create audit checklist template**

```markdown
# UI Audit Checklist

## Spacing
- [ ] Consistent padding and margin throughout
- [ ] Proper spacing between elements
- [ ] No irregular spacing gaps
- [ ] Responsive spacing on all breakpoints

## Typography
- [ ] Consistent font sizes
- [ ] Consistent font weights
- [ ] Proper line heights
- [ ] Consistent heading hierarchy
- [ ] Readable text sizes

## Color & Contrast
- [ ] Proper color contrast ratios
- [ ] No low-contrast text
- [ ] Consistent theme token usage
- [ ] No hardcoded color values
- [ ] Theme-dependent colors work in both modes

## Alignment
- [ ] Consistent horizontal alignment
- [ ] Consistent vertical alignment
- [ ] Centered elements aligned correctly
- [ ] No misaligned content

## Interactive Elements
- [ ] Consistent button sizing
- [ ] Consistent button hover states
- [ ] Consistent focus states
- [ ] Consistent states: disabled, loading, error
- [ ] Consistent select inputs
- [ ] Consistent form inputs
- [ ] Consistent modals
- [ ] Consistent tooltips
- [ ] Consistent dropdowns
- [ ] Consistent navigation

## Component Standards
- [ ] Cards use consistent styling
- [ ] Headers use consistent styling
- [ ] Sections use consistent containers
- [ ] Badges use consistent styling
- [ ] Status indicators use consistent styling

## Responsive Behavior
- [ ] Mobile (<768px): Properly sized and readable
- [ ] Tablet (768px-1024px): Proper layout
- [ ] Desktop (>1024px): Proper layout and spacing

## Loading/Empty/Error States
- [ ] Loading states show skeletons or spinners
- [ ] Empty states show helpful messages
- [ ] Error states show helpful error messages
- [ ] All states have appropriate visual feedback
```

### Task 2: Create Design Token Standards

**Files:**
- Create: `lib/constants/design-tokens.ts`

- [ ] **Step 1: Define standard spacing tokens**

```typescript
// Spacing Scale (8px grid)
export const spacing = {
  0: '0px',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
} as const

// Border Radius Scale
export const radius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const

// Shadow Scale
export const shadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const

// Font Sizes
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const

// Font Weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const
```

---

## Phase 2: Fix Highest Traffic Pages

### Task 3: Audit and Fix Home Page

**Files:**
- Modify: `app/[locale]/(home)/page.tsx`
- Check: All home page sections

- [ ] **Step 1: Audit home page sections**

For each section in `HomeContent.tsx`:
```
Check:
- Spacing between sections
- Typography hierarchy
- Color contrast
- Responsive behavior
- Interactive element states
```

- [ ] **Step 2: Fix section spacing**

```tsx
// Before
<MarketingSection className="py-16 lg:py-20">

// After
<MarketingSection className="py-8 md:py-16 lg:py-20">
```

- [ ] **Step 3: Fix button sizing**

```tsx
// Before
className={cn(buttonVariants({ size: 'lg' }))}

// After
className={cn(
  buttonVariants({
    size: 'lg',
    className: 'h-11 px-8 text-base'
  })
)}
```

- [ ] **Step 4: Add hover states to all interactive elements**

```tsx
<a
  href="#features"
  className={cn(
    buttonVariants({ variant: 'outline', size: 'lg' }),
    'transition-all duration-200',
    'hover:scale-105',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:ring-offset-2'
  )}
>
  <Play className="h-4 w-4" />
  <span>{t('landing.hero.ctaSecondary')}</span>
</a>
```

### Task 4: Audit and Fix Authentication Pages

**Files:**
- Modify: `app/[locale]/(authentication)/page.tsx`
- Check: Login and signup forms

- [ ] **Step 1: Audit form inputs**

For each form input:
```
Check:
- Padding
- Border radius
- Focus ring
- Error message styling
- Label styling
- Helper text styling
```

- [ ] **Step 2: Standardize form input components**

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  helperText?: string
}

export function Input({ error, label, helperText, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add loading states to forms**

```tsx
function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await signup(email, password, username)
    } catch (error) {
      console.error('Signup failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  )
}
```

### Task 5: Audit and Fix Dashboard Header

**Files:**
- Modify: `app/[locale]/dashboard/layout.tsx` → `components/dashboard-header.tsx`

- [ ] **Step 1: Audit header layout**

```
Check:
- Spacing between logo and navigation
- Consistent padding
- Proper sizing
- Responsive behavior
- Focus states on interactive elements
```

- [ ] **Step 2: Fix header spacing and sizing**

```tsx
<div className="flex h-16 items-center justify-between px-4 gap-4 md:px-6">
  <Link
    href={`/${locale}/dashboard`}
    className="flex items-center gap-2 transition-colors hover:text-primary"
  >
    {/* Logo */}
  </Link>

  <nav className="hidden md:flex items-center gap-1">
    {/* Navigation links */}
  </nav>

  <div className="flex items-center gap-2">
    {/* User menu */}
  </div>
</div>
```

### Task 6: Audit and Fix Sidebar Navigation

**Files:**
- Modify: `components/sidebar/dashboard-sidebar.tsx`

- [ ] **Step 1: Audit sidebar layout**

```
Check:
- Spacing between items
- Consistent padding
- Active state styling
- Hover states
- Focus states
- Mobile menu behavior
```

- [ ] **Step 2: Fix sidebar styling**

```tsx
function DashboardSidebar() {
  return (
    <aside className="flex h-screen w-16 flex-col items-center gap-4 border-r bg-background/95 p-2 md:w-64 md:px-4">
      {/* Logo */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Logo className="h-6 w-6 text-primary" />
      </div>

      {/* Navigation items */}
      <nav className="flex flex-1 gap-2">
        {items.map((item) => (
          <SidebarLink
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>

      {/* User menu */}
      <UserMenu />
    </aside>
  )
}

function SidebarLink({ item, isActive, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        "hover:bg-muted/50",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "md:justify-start md:px-4",
        isActive && "bg-muted/50 text-primary",
        !isActive && "text-muted-foreground"
      )}
    >
      {item.icon}
      <span className="hidden md:block">{item.label}</span>
    </button>
  )
}
```

---

## Phase 3: Fix UI Components

### Task 7: Standardize Buttons

**Files:**
- Create: `components/ui/button-standardized.tsx`
- Update: All button usages

- [ ] **Step 1: Create standardized button component**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'default',
  size = 'default',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Variant styles
        {
          default: "bg-primary text-primary-foreground hover:bg-primary/90",
          destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          outline: "border border-input bg-background hover:bg-muted/50",
          secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ghost: "hover:bg-muted/50",
          link: "text-primary underline-offset-4 hover:underline",
        },
        // Size styles
        {
          default: "h-10 px-4 py-2 text-sm",
          sm: "h-9 rounded-md px-3 text-xs",
          lg: "h-11 rounded-md px-8 text-base",
          icon: "h-10 w-10",
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}
```

- [ ] **Step 2: Replace all button usages**

```tsx
// Before
<Button variant="outline" size="lg">
  Play Video
</Button>

// After
<Button variant="outline" size="lg">
  <Play className="mr-2 h-4 w-4" />
  Play Video
</Button>
```

### Task 8: Standardize Cards

**Files:**
- Create: `components/ui/card-standardized.tsx`
- Update: All card usages

- [ ] **Step 1: Create standardized card component**

```tsx
interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <Card className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Replace all card usages**

```tsx
// Before
<div className="rounded-lg border p-4">
  <h3 className="font-semibold">Title</h3>
  <div className="p-4">Content</div>
</div>

// After
<Card title="Title" description="Description">
  <div>Content</div>
</Card>
```

### Task 9: Standardize Form Inputs

**Files:**
- Update: All form input usages

- [ ] **Step 1: Ensure all inputs have standard styling**

```tsx
// Standard input wrapper
<div className="space-y-2">
  <label className="text-sm font-medium">Label</label>
  <input
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
      "ring-offset-background",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all"
    )}
    placeholder="Enter value..."
  />
  <p className="text-xs text-muted-foreground">Helper text</p>
</div>
```

- [ ] **Step 2: Add error states**

```tsx
<input
  className={cn(
    "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
    "focus:ring-2 focus:ring-primary focus:ring-offset-2",
    error && "border-red-500 focus:ring-red-500",
    disabled && "cursor-not-allowed opacity-50"
  )}
  {...props}
/>
{error && (
  <p className="text-xs text-red-600 mt-1">{error}</p>
)}
```

### Task 10: Standardize Modals

**Files:**
- Update: All modal usages

- [ ] **Step 1: Ensure consistent modal styling**

```tsx
// Modal overlay
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="fixed inset-0 bg-background/80" />
  <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border bg-background shadow-lg p-6">
    {/* Modal content */}
  </div>
</div>
```

- [ ] **Step 2: Add focus trap and escape key handling**

```tsx
const [isOpen, setIsOpen] = useState(false)

useEffect(() => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }
}, [isOpen])

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') setIsOpen(false)
}
```

### Task 11: Standardize Dropdowns

**Files:**
- Update: All dropdown usages

- [ ] **Step 1: Ensure consistent dropdown styling**

```tsx
// Dropdown button
<button
  className={cn(
    "inline-flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
    "hover:bg-muted/50",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all"
  )}
>
  <span>Selected option</span>
  <ChevronDown className="h-4 w-4" />
</button>

// Dropdown menu
<div className="relative z-10">
  <div className="absolute left-0 top-full z-10 mt-1 w-full">
    <div className="rounded-md border bg-background shadow-lg">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleSelect(item)}
          className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
</div>
```

### Task 12: Standardize Tooltips

**Files:**
- Update: All tooltip usages

- [ ] **Step 1: Ensure consistent tooltip styling**

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button className="h-10 w-10 rounded-md hover:bg-muted/50">
        <Info className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip message</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Phase 4: Fix Theme and Color Mode Issues

### Task 13: Replace Hardcoded Colors with Tokens

**Files:**
- Audit: All components
- Replace: Hardcoded colors with Tailwind tokens

- [ ] **Step 1: Find hardcoded color values**

Run:
```bash
grep -r "bg-rgb\|text-rgb\|border-rgb" --include="*.tsx" --include="*.ts" | head -50
```

- [ ] **Step 2: Replace with tokens**

```tsx
// Before
<div className="bg-[rgb(30,41,59)] text-[rgb(241,245,249)]">

// After
<div className="bg-slate-800 text-slate-100">
```

### Task 14: Fix Contrast Issues

**Files:**
- Audit: All text elements
- Fix: Low contrast text

- [ ] **Step 1: Check contrast ratios**

Use WCAG contrast checker:
- Text color should be at least 4.5:1 for normal text
- Large text should be at least 3:1
- Interactive elements need higher contrast

- [ ] **Step 2: Fix low contrast text**

```tsx
// Before
<p className="text-gray-500">
  Secondary text
</p>

// After
<p className="text-muted-foreground">
  Secondary text
</p>
```

### Task 15: Ensure Theme-Dependent Colors Work

**Files:**
- Test: Light and dark modes

- [ ] **Step 1: Test in light mode**

Open browser with light mode
Check: All colors visible and readable
Check: No black-on-black or white-on-white

- [ ] **Step 2: Test in dark mode**

Toggle dark mode
Check: All colors visible and readable
Check: No washed-out colors

---

## Phase 5: Fix Loading/Empty/Error States

### Task 16: Standardize Loading States

**Files:**
- Create: `components/ui/loading-skeleton.tsx`
- Update: All loading states

- [ ] **Step 1: Create skeleton component**

```tsx
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

// Usage
<div className="space-y-4">
  <Skeleton className="h-4 w-32" />
  <Skeleton className="h-8 w-64" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>
```

### Task 17: Standardize Empty States

**Files:**
- Create: `components/ui/empty-state.tsx`
- Update: All empty states

- [ ] **Step 1: Create empty state component**

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

### Task 18: Standardize Error States

**Files:**
- Create: `components/ui/error-state.tsx`
- Update: All error states

- [ ] **Step 1: Create error state component**

```tsx
interface ErrorStateProps {
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ErrorState({
  message = "Something went wrong",
  action
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold">Error</h3>
      {message && (
        <p className="mt-1 text-sm text-red-700">
          {message}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline" className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  )
}
```

---

## Phase 6: Fix Responsive Behavior

### Task 19: Fix Mobile (<768px) Behavior

**Files:**
- Audit: All pages
- Fix: Mobile responsiveness

- [ ] **Step 1: Add responsive classes**

```tsx
// Mobile-first approach
<div className="space-y-4 p-4">
  <h2 className="text-xl font-bold md:text-2xl">
    Title
  </h2>
  <p className="text-sm md:text-base">
    Description
  </p>
  <button className="h-10 w-full px-4 md:h-12 md:w-auto">
    Button
  </button>
</div>
```

- [ ] **Step 2: Test on mobile viewport**

Open DevTools
Set viewport to 375px
Check: Layout looks correct
Check: Text is readable
Check: Buttons are clickable

### Task 20: Fix Tablet (768px-1024px) Behavior

**Files:**
- Audit: All pages
- Fix: Tablet responsiveness

- [ ] **Step 1: Add tablet-specific breakpoints**

```tsx
<div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

- [ ] **Step 2: Test on tablet viewport**

Open DevTools
Set viewport to 768px
Check: Layout looks correct
Check: Grid columns work

### Task 21: Fix Desktop (>1024px) Behavior

**Files:**
- Audit: All pages
- Fix: Desktop responsiveness

- [ ] **Step 1: Add desktop-specific breakpoints**

```tsx
<div className="max-w-7xl mx-auto p-6">
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {/* Content */}
  </div>
</div>
```

- [ ] **Step 2: Test on desktop viewport**

Open DevTools
Set viewport to 1920px
Check: Layout looks correct
Check: Spacing is appropriate

---

## Phase 7: Test and Validate

### Task 22: Test All Interactive Elements

**Files:**
- Test: Buttons, forms, modals, dropdowns, tooltips

- [ ] **Step 1: Test buttons**

Test all button variants and sizes
Expected: Consistent sizing and styling
Expected: Hover and focus states work

- [ ] **Step 2: Test forms**

Test all form inputs
Expected: Consistent padding and border radius
Expected: Focus rings work in both modes
Expected: Error states work

- [ ] **Step 3: Test modals**

Open all modals
Expected: Proper z-index
Expected: Focus trap works
Expected: Escape key closes modal
Expected: Backdrop click closes modal

- [ ] **Step 4: Test dropdowns**

Click all dropdowns
Expected: Proper positioning
Expected: Click outside closes
Expected: Option selection works

- [ ] **Step 5: Test tooltips**

Hover over all tooltip triggers
Expected: Tooltip appears
Expected: Tooltip position is correct
Expected: Tooltip disappears on mouse out

### Task 23: Test in All Themes

**Files:**
- Test: Light and dark modes

- [ ] **Step 1: Test in light mode**

Open browser with light mode
Check: All colors visible
Check: Contrast is sufficient
Check: Interactive elements are visible

- [ ] **Step 2: Test in dark mode**

Toggle dark mode
Check: All colors visible
Check: Contrast is sufficient
Check: Interactive elements are visible

- [ ] **Step 3: Test color mode toggle**

Toggle between light and dark mode
Expected: All components update correctly
Expected: No visual glitches

### Task 24: Test in All Screen Sizes

**Files:**
- Test: Mobile, tablet, desktop

- [ ] **Step 1: Test mobile**

Open DevTools
Set viewport to 375px
Check: Layout is correct
Check: Text is readable
Check: Buttons are clickable

- [ ] **Step 2: Test tablet**

Open DevTools
Set viewport to 768px
Check: Layout is correct
Check: Grids work correctly

- [ ] **Step 3: Test desktop**

Open DevTools
Set viewport to 1920px
Check: Layout is correct
Check: Spacing is appropriate

### Task 25: Run Accessibility Checks

**Files:**
- Test: Accessibility

- [ ] **Step 1: Check keyboard navigation**

Navigate using only keyboard
Expected: All interactive elements accessible
Expected: Tab order is logical

- [ ] **Step 2: Check screen reader compatibility**

Use screen reader
Expected: All content is readable
Expected: Semantic HTML is used

- [ ] **Step 3: Check color contrast**

Use contrast checker
Expected: All text meets WCAG AA standards

---

## Verification Checklist

- [ ] All pages have consistent spacing
- [ ] All pages have consistent typography
- [ ] All pages have consistent color usage
- [ ] All pages have consistent alignment
- [ ] Buttons have consistent sizing and states
- [ ] Form inputs have consistent styling
- [ ] Selects have consistent styling
- [ ] Modals have consistent styling
- [ ] Tooltips have consistent styling
- [ ] Dropdowns have consistent styling
- [ ] Navigation has consistent styling
- [ ] Cards have consistent styling
- [ ] Headers have consistent styling
- [ ] Section containers have consistent styling
- [ ] Badges have consistent styling
- [ ] Status indicators have consistent styling
- [ ] All theme colors use design tokens
- [ ] No hardcoded color values
- [ ] Light mode colors are readable
- [ ] Dark mode colors are readable
- [ ] Loading states show skeletons
- [ ] Empty states show helpful messages
- [ ] Error states show helpful messages
- [ ] Mobile layout works correctly
- [ ] Tablet layout works correctly
- [ ] Desktop layout works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility is good
- [ ] Color contrast meets WCAG standards

---

## Success Criteria

1. All pages have consistent UI patterns
2. All buttons have consistent sizing and states
3. All form inputs have consistent styling
4. All modals have consistent styling
5. All tooltips have consistent styling
6. All dropdowns have consistent styling
7. All cards use standardized component
8. All colors use design tokens
9. All text has sufficient contrast
10. All loading states use skeletons
11. All empty states use consistent pattern
12. All error states use consistent pattern
13. Mobile layout works correctly
14. Tablet layout works correctly
15. Desktop layout works correctly
16. Light and dark modes work correctly
17. Keyboard navigation works
18. Screen reader compatibility is good
19. Color contrast meets WCAG AA standards

---

`★ Insight ─────────────────────────────────────`
**Standardized Components**: Create reusable UI components with consistent props and styling. This reduces code duplication and ensures a cohesive user experience across the entire application.

**Mobile-First Approach**: Design for mobile first, then add larger breakpoints. This ensures the smallest screens get the most attention and the design scales up gracefully.

**Design Tokens**: Use centralized design tokens (spacing, colors, typography) instead of hardcoded values. This makes it easy to update the design system globally and ensures consistency.
`─────────────────────────────────────────────────`

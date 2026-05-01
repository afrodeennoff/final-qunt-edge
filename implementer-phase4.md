# Implementer: Comprehensive UI Audit and Polish

**Current directory**: /Users/uomarafrodeen/Downloads/qunt-edge/.worktrees/improvements-2026-05-01

**Plan**: docs/superpowers/plans/2026-05-01-comprehensive-improvement.md (Phase 4, Tasks 10-14)

**Task**: Systematic UI/UX audit and polish including typography, spacing, color contrast, interactive elements, and loading states.

## Files to modify:
- components/ui/heading.tsx
- components/layout/marketing-sections.tsx  
- app/[locale]/(home)/components/HomeContent.tsx
- app/[locale]/dashboard/trader-profile/page-client.tsx
- components/ui/space.tsx
- lib/theme/tokens.ts
- components/ui/theme-provider.tsx
- components/ui/button.tsx
- components/ui/input.tsx
- components/ui/select.tsx
- components/ui/micro-interactions.tsx
- components/ui/loading.tsx
- components/ui/error-boundary.tsx
- app/[locale]/(authentication)/loading.tsx
- app/[locale]/dashboard/page.tsx

## Task Sequence:

### Task 10: Fix Typography Hierarchy
**Goal**: Standardize heading styles across the application

**Steps**:
1. Create heading component with variants
2. Update marketing sections to use standardized headings
3. Update landing page and trader profile sections

**Expected code**:
```tsx
// components/ui/heading.tsx
import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva(
  'font-semibold tracking-tight',
  {
    variants: {
      size: {
        '2xl': 'text-2xl sm:text-3xl',
        xl: 'text-xl sm:text-2xl', 
        lg: 'text-lg sm:text-xl',
        md: 'text-base sm:text-lg',
        sm: 'text-sm sm:text-base',
      }
    },
    defaultVariants: {
      size: '2xl',
    },
  }
)
```

### Task 11: Fix Spacing and Layout
**Goal**: Implement consistent spacing system

**Steps**:
1. Create space utility classes
2. Update all components to use standardized spacing
3. Ensure responsive behavior

### Task 12: Fix Color Contrast and Theme Tokens
**Goal**: Implement theme tokens and improve accessibility

**Steps**:
1. Create theme tokens for colors and typography
2. Update theme provider with proper tokens
3. Ensure proper contrast ratios

### Task 13: Polish Interactive Elements
**Goal**: Enhance button, input, and select components

**Steps**:
1. Add hover and focus states to all interactive elements
2. Implement proper disabled states
3. Add loading states for async operations

### Task 14: Improve Loading and Error States
**Goal**: Add comprehensive loading and error handling

**Steps**:
1. Create reusable loading components
2. Add error boundaries for critical sections
3. Implement skeleton loading states

## Testing Instructions:
1. Verify typography consistency across all pages
2. Check responsive behavior on mobile and desktop
3. Test interactive elements (hover, focus, disabled states)
4. Verify loading states work correctly
5. Ensure error boundaries catch and display errors gracefully

## Commit Requirements:
- Small commits after each task
- Include descriptive commit messages
- Reference the specific task number

## Status Reporting:
- Use DONE when all polishing completes successfully
- Use DONE_WITH_CONCERNS if minor issues remain but functionality works
- Use NEEDS_CONTEXT if design specifications are unclear
- Use BLOCKED if major implementation issues arise

Start implementing now.
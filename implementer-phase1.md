# Implementer: Fix Landing Page Black Screen

**Current directory**: /Users/uomarafrodeen/Downloads/qunt-edge/.worktrees/improvements-2026-05-01

**Plan**: docs/superpowers/plans/2026-05-01-comprehensive-improvement.md (Phase 1, Tasks 1-3)

**Task**: Fix black screen on /en landing page by implementing error boundaries, loading states, and hydration fixes.

## Files to modify:
- app/[locale]/(home)/page.tsx
- app/[locale]/(home)/components/HomeContent.tsx

## Task Sequence:

### Task 1: Investigate Black Screen Root Cause
**Goal**: Add error boundary to catch any rendering errors

**Steps**:
1. Add ErrorBoundary import to HomeContent.tsx
2. Wrap HomeContent component with ErrorBoundary
3. Test the fix

**Expected code**:
```tsx
// app/[locale]/(home)/components/HomeContent.tsx
'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function HomeContent({ locale }: HomeContentProps) {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Loading content...</div>}>
      <div className="relative min-w-0 overflow-x-hidden bg-background">
        {/* existing content */}
      </div>
    </ErrorBoundary>
  )
}
```

### Task 2: Add Loading States
**Goal**: Create loading component and Suspense wrapper

**Steps**:
1. Create HomeContentLoading.tsx with skeleton UI
2. Add Suspense to HomeContent.tsx
3. Test loading state

**Expected code**:
```tsx
// app/[locale]/(home)/components/HomeContentLoading.tsx
export default function HomeContentLoading() {
  return (
    <div className="relative min-w-0 overflow-x-hidden bg-background">
      <main className="relative z-10 flex min-w-0 flex-col">
        {/* Hero loading */}
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-6 w-32 animate-pulse bg-muted rounded mx-auto" />
            <div className="space-y-6">
              <div className="h-16 w-96 animate-pulse bg-muted rounded mx-auto" />
              <div className="h-6 w-64 animate-pulse bg-muted rounded mx-auto" />
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
              <div className="h-12 w-40 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

```tsx
// app/[locale]/(home)/components/HomeContent.tsx
import { Suspense } from 'react'
import HomeContentLoading from './HomeContentLoading'

export default async function HomeContent({ locale }: HomeContentProps) {
  return (
    <Suspense fallback={<HomeContentLoading />}>
      {/* existing content */}
    </Suspense>
  )
}
```

### Task 3: Fix Hydration Issues
**Goal**: Resolve hydration mismatch between server and client

**Steps**:
1. Import dynamic from 'next/dynamic'
2. Create dynamic import for HomeContent with loading component
3. Update page.tsx to use dynamic import

**Expected code**:
```tsx
// app/[locale]/(home)/page.tsx
import dynamic from 'next/dynamic'

const HomeContent = dynamic(() => import('./components/HomeContent'), {
  loading: () => (
    <div className="relative min-w-0 overflow-x-hidden bg-background">
      <main className="relative z-10 flex min-w-0 flex-col">
        <div className="pt-24 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-3xl space-y-8 text-center">
            <div className="h-16 w-96 animate-pulse bg-muted rounded mx-auto" />
          </div>
        </div>
      </main>
    </div>
  ),
  ssr: false
})
```

## Testing Instructions:
1. Run `npm run dev` to start development server
2. Navigate to `/en` route
3. Verify no black screen
4. Check for console errors
5. Test loading state when navigating

## Commit Requirements:
- Small commits after each task
- Commit messages should be descriptive
- Include the task number in commit message

## Status Reporting:
- Use DONE when all three tasks complete successfully
- Use DONE_WITH_CONCERNS if you have observations but can proceed
- Use NEEDS_CONTEXT if you require more information
- Use BLOCKED if you cannot complete the task

Start implementing now.
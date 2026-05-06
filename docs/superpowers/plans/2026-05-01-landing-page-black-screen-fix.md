# Landing Page Black Screen Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the black screen issue on the /en landing page where direct navigation renders nothing

**Architecture:** Investigate root cause by checking JavaScript errors, hydration mismatches, missing error boundaries, or failed data fetches. Add proper error states, loading states, and error boundaries to ensure the page always renders content.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Server Components, Dynamic Imports

---

## Phase 1: Investigate Root Cause

### Task 1: Add Error Boundary to Locale Layout

**Files:**
- Modify: `app/[locale]/(home)/layout.tsx`

- [ ] **Step 1: Read current layout file**

Run: `cat app/[locale]/(home)/layout.tsx`
Expected: File exists with LocaleLayout component

- [ ] **Step 2: Add Error Boundary wrapper**

```tsx
"use client"

import { ErrorBoundary } from "@/components/error-boundary"

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LocaleLayoutInner>{children}</LocaleLayoutInner>
    </ErrorBoundary>
  )
}
```

- [ ] **Step 3: Test the change**

Run: `npm run dev`
Navigate to: http://localhost:3000/en
Expected: Page renders with error boundary in place

- [ ] **Step 4: Check for errors in console**

Open browser DevTools Console tab
Expected: No errors during initial page load

### Task 2: Add Error Boundary to Home Page

**Files:**
- Modify: `app/[locale]/(home)/page.tsx`

- [ ] **Step 1: Read current home page**

Run: `cat app/[locale]/(home)/page.tsx`
Expected: File uses HomeContent component

- [ ] **Step 2: Wrap content in Error Boundary**

```tsx
import { ErrorBoundary } from "@/components/error-boundary"

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  let locale: Locale = 'en'

  try {
    const resolvedParams = await params
    locale = resolvedParams.locale
    setStaticParamsLocale(locale)
  } catch {
    locale = 'en'
  }

  const softwareSchema = buildSoftwareApplicationSchema(locale, '/')
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Home', path: '/' }])

  return (
    <ErrorBoundary>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <HomeContent locale={locale} />
      </>
    </ErrorBoundary>
  )
}
```

- [ ] **Step 3: Test the change**

Run: `npm run dev`
Navigate to: http://localhost:3000/en
Expected: Page renders with error boundary in place

### Task 3: Add Error Boundary to Locale Layout Inner

**Files:**
- Modify: `app/[locale]/(home)/layout.tsx`

- [ ] **Step 1: Update layout to include Error Boundary**

```tsx
"use client"

import { ErrorBoundary } from "@/components/error-boundary"

function LocaleLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <LocaleLayoutInner>{children}</LocaleLayoutInner>
}
```

- [ ] **Step 2: Test the change**

Run: `npm run dev`
Navigate to: http://localhost:3000/en
Expected: Page renders correctly

### Task 4: Verify Error Boundary Components Exist

**Files:**
- Check: `components/error-boundary.tsx`
- Check: `components/error-boundary.tsx`

- [ ] **Step 1: Verify error-boundary component exists**

Run: `ls components/error-boundary.tsx`
Expected: File exists

- [ ] **Step 2: Review error-boundary implementation**

Run: `cat components/error-boundary.tsx`
Expected: Component has loading and error states

- [ ] **Step 3: Create error-boundary if missing**

```tsx
"use client"

import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              An error occurred while rendering the page. Please try again or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm text-foreground"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Task 5: Check for Client-Side JavaScript Errors

**Files:**
- Check: `app/[locale]/(home)/components/HomeContent.tsx`
- Check: Browser console logs

- [ ] **Step 1: Review HomeContent for client-side issues**

Run: `cat app/[locale]/(home)/components/HomeContent.tsx`
Look for:
- Missing imports
- Type errors
- Client-side only code issues
- Missing error handling

- [ ] **Step 2: Test in production build**

Run: `npm run build`
Expected: Build completes without errors
Run: `npm run preview`
Navigate to: http://localhost:3000/en
Expected: Page renders correctly in production

---

## Phase 2: Add Loading States and Error States

### Task 6: Enhance Lazy Section Loading States

**Files:**
- Modify: `app/[locale]/(home)/components/LazySections.tsx`

- [ ] **Step 1: Update SocialProofLazy loading state**

```tsx
const SocialProofLazy = dynamic(() => import('./SocialProof'), {
  ssr: true,
  loading: () => (
    <section className="bg-muted/30 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-card/50 p-6">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="mt-4 h-8 w-64 rounded bg-muted animate-pulse" />
            <div className="mt-3 h-4 w-full rounded bg-muted animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card/50 p-5">
                <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
                <div className="mt-4 h-8 w-20 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-3 w-full rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  ),
  error: (error) => (
    <section className="bg-muted/30 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <p className="text-center text-sm text-muted-foreground">Failed to load social proof</p>
      </div>
    </section>
  ),
})
```

- [ ] **Step 2: Update FAQSectionLazy loading state**

```tsx
const FAQSectionLazy = dynamic(() => import('./FAQSection'), {
  ssr: true,
  loading: () => (
    <section className="px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 h-4 w-32 rounded bg-muted animate-pulse" />
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-card/50 p-6">
              <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
              <div className="mt-4 h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="mt-2 h-3 w-full rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  error: (error) => (
    <section className="px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm text-muted-foreground">Failed to load FAQ section</p>
      </div>
    </section>
  ),
})
```

- [ ] **Step 3: Update TrustAndProofLazy loading state**

```tsx
const TrustAndProofLazy = dynamic(() => import('./TrustAndProof'), {
  ssr: true,
  loading: () => (
    <section className="bg-muted/50 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border/30 bg-card/50 p-6">
              <div className="h-8 w-8 rounded bg-muted animate-pulse" />
              <div className="mt-4 h-5 w-24 rounded bg-muted animate-pulse" />
              <div className="mt-3 h-3 w-full rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  error: (error) => (
    <section className="bg-muted/50 px-4 py-12 sm:py-16 lg:py-20 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm text-muted-foreground">Failed to load trust and proof section</p>
      </div>
    </section>
  ),
})
```

- [ ] **Step 4: Test loading and error states**

Run: `npm run dev`
Navigate to: http://localhost:3000/en
Expected: All sections show loading skeletons

---

## Phase 3: Test and Verify

### Task 7: Test Direct Navigation

**Files:**
- Test: Browser navigation

- [ ] **Step 1: Clear browser cache**

Open: http://localhost:3000/en
Clear cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
Expected: Fresh cache state

- [ ] **Step 2: Test direct navigation**

Navigate to: http://localhost:3000/en
Expected: Page renders without black screen
Expected: No console errors
Expected: All content visible

- [ ] **Step 3: Test with network throttling**

Open DevTools Network tab
Set throttling to "Slow 3G"
Reload: http://localhost:3000/en
Expected: Loading skeletons appear
Expected: Content loads eventually

- [ ] **Step 4: Test with JavaScript disabled**

Open DevTools
Disable JavaScript
Reload: http://localhost:3000/en
Expected: Error boundary handles gracefully
Expected: Fallback message displayed

### Task 8: Test Production Build

**Files:**
- Build artifacts

- [ ] **Step 1: Create production build**

Run: `npm run build`
Expected: Build completes without errors

- [ ] **Step 2: Start production server**

Run: `npm run preview`
Expected: Server starts on port 3000

- [ ] **Step 3: Test production build**

Navigate to: http://localhost:3000/en
Expected: Page renders correctly in production
Expected: No console errors

### Task 9: Check Vercel Deployment

**Files:**
- Vercel deployment

- [ ] **Step 1: Commit changes**

```bash
git add app/[locale]/(home)/layout.tsx app/[locale]/(home)/page.tsx app/[locale]/(home)/components/LazySections.tsx components/error-boundary.tsx
git commit -m "fix: add error boundaries and loading states to landing page"
```

- [ ] **Step 2: Push to main branch**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel deployment**

Navigate to: https://qunt-edge.vercel.app/en
Expected: Page renders correctly on live deployment
Expected: No black screen on direct navigation

---

## Verification Checklist

- [ ] Direct navigation to /en shows page content (no black screen)
- [ ] Error boundary catches JavaScript errors gracefully
- [ ] Loading skeletons display during page load
- [ ] Error fallbacks display when sections fail to load
- [ ] Production build renders correctly
- [ ] No console errors on initial page load
- [ ] Page loads with JavaScript disabled (shows error boundary fallback)
- [ ] Page loads with network throttling (shows loading states)
- [ ] Vercel deployment shows no black screen

---

## Success Criteria

1. Direct navigation to /en route never results in black screen
2. Error boundaries catch all rendering errors
3. Loading states provide visual feedback during page load
4. Error states display helpful messages when sections fail
5. Production build works identically to development
6. No console errors on initial page load
7. Error boundary fallback is user-friendly

---

## Notes

- The black screen issue is likely caused by uncaught JavaScript errors or failed data fetches without error boundaries
- Error boundaries in Next.js App Router must be client components ("use client")
- Dynamic imports support an `error` prop for handling loading failures
- All lazy-loaded sections should have proper loading and error states
- Production builds should be tested to ensure consistency
- The fix should not affect other routes or functionality

---

`★ Insight ─────────────────────────────────────`
**Error Boundaries in Next.js App Router**: Unlike React class components, Next.js App Router components are server components by default. Error boundaries must be client components ("use client") and are best placed at the route level (layout.tsx) to catch all children errors.

**Lazy Loading Best Practices**: Always provide both `loading` and `error` props to dynamic imports. Loading states should be skeleton screens, not empty containers. Error states should display helpful messages and recovery options.

**Hydration Mismatches**: If you see hydration warnings, they might indicate server-rendered HTML differs from client-rendered content. Ensure all client-side interactions don't affect initial server-rendered HTML.
`─────────────────────────────────────────────────`

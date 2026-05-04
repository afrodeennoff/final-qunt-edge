# Best Practices for Smooth Initial Rendering in Next.js

Comprehensive guide to prevent black screens and ensure reliable application loading.

## 1. Root Layout Structure

### ✅ DO: Essential Layout Pattern

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  // SEO metadata
  title: 'Qunt Edge',
  description: 'Trading Journal & Analytics',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <head>
        {/* Critical inline styles - loaded immediately */}
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #0c0a14;
            color: #f8f9fc;
            font-family: system-ui, sans-serif;
          }
          main {
            display: flex;
            flex: 1;
            flex-direction: column;
          }
        `}</style>
      </head>
      <body className="flex flex-col min-h-screen">
        <main id="main-content" className="flex flex-1 flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### ❌ DON'T: Common Mistakes

```tsx
// ❌ WRONG: No fallback styling
<html>
  <body>
    {children}
  </body>
</html>

// ❌ WRONG: Complex inline styles that override theme
<html style={{ 
  backgroundColor: colors.dynamicColorFromAPI,  // Black screen if undefined
  color: someVariableThatMightBeFalsy,
}}>

// ❌ WRONG: No main landmark for accessibility
<html>
  <body>
    <div>{children}</div>
  </body>
</html>

// ❌ WRONG: Positioned absolutely with hidden overflow
<body style={{ overflow: 'hidden', position: 'relative' }}>
```

---

## 2. CSS Architecture

### ✅ DO: Robust CSS Setup

```css
/* globals.css */
@import 'tailwindcss';
@import './styles/tokens.css';

@config './tailwind.config.ts';

/* Critical fallback styles */
@layer base {
  :root {
    --background: #0c0a14;
    --foreground: #f8f9fc;
    --border: #374151;
  }

  html {
    background-color: var(--background);
    color: var(--foreground);
    font-family: system-ui, -apple-system, sans-serif;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    margin: 0;
    padding: 0;
  }

  main {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
  }
}
```

### ❌ DON'T: CSS Mistakes

```css
/* ❌ WRONG: Depends on build-time variables that might fail */
html {
  background-color: var(--missing-token);  /* Undefined = white */
}

/* ❌ WRONG: Obscure selectors that don't apply */
.container > div:first-child > div[data-hydrate="true"] {
  display: block;  /* Too specific, might not match */
}

/* ❌ WRONG: Heavy animations on page load */
@keyframes pageLoadAnimation {
  from { opacity: 0; }
  to { opacity: 1; }
}

html {
  animation: pageLoadAnimation 2s;  /* Invisible for 2 seconds */
}
```

---

## 3. Async Component Handling

### ✅ DO: Safe Async Operations

```tsx
// app/[locale]/(home)/page.tsx

import { Suspense } from 'react'

export default async function HomePage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  let locale = 'en'

  // Always await params in Next.js 16
  try {
    const { locale: paramLocale } = await params
    locale = paramLocale
  } catch (error) {
    console.error('[v0] Param resolution failed:', error)
    // Continue with default 'en'
  }

  return (
    <ErrorBoundary>
      <Suspense 
        fallback={<LoadingFallback />}
      >
        <HomeContent locale={locale} />
      </Suspense>
    </ErrorBoundary>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-foreground/20 border-t-foreground rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
```

### ❌ DON'T: Async Mistakes

```tsx
// ❌ WRONG: Don't fetch in useEffect (client component)
function HomePage() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])
  
  // No data during first render = black screen
  return <div>{data.title}</div>
}

// ❌ WRONG: Don't forget await for params
export default async function Page({ params }) {
  const { id } = params  // ❌ undefined!
  // Should be: const { id } = await params
}

// ❌ WRONG: No error boundary around async component
<Suspense fallback={null}>
  <AsyncComponent />
</Suspense>
// If AsyncComponent throws, error silently
```

---

## 4. Error Handling

### ✅ DO: Comprehensive Error Handling

```tsx
// components/error-boundary.tsx

'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('[v0] Error caught by boundary:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-4">
              We&apos;re working on fixing this. Please try again.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left bg-destructive/10 p-3 rounded text-sm">
                <summary className="cursor-pointer font-mono text-destructive">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-destructive/70">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### ❌ DON'T: Error Handling Mistakes

```tsx
// ❌ WRONG: No error boundary
<Suspense fallback={null}>
  <ComponentThatMightThrow />
</Suspense>

// ❌ WRONG: Empty fallback
<Suspense fallback={null}>
  <SlowComponent />
</Suspense>
// Users see black screen while loading

// ❌ WRONG: Hiding errors in production
if (hasError) {
  if (process.env.NODE_ENV === 'production') {
    return null  // Users see nothing!
  }
  return <ErrorDisplay error={error} />
}
```

---

## 5. Font & Asset Loading

### ✅ DO: Safe Font Configuration

```tsx
// app/layout.tsx

import { DM_Sans } from 'next/font/google'

const fontDmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',  // ✅ Show fallback font while loading
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-dm-sans)',  // From font import above
          'system-ui',  // Fallback 1
          '-apple-system',  // Fallback 2
          'sans-serif',  // Fallback 3
        ],
      },
    },
  },
}
```

### ❌ DON'T: Font Mistakes

```tsx
// ❌ WRONG: Blocking font load
const font = DM_Sans({
  display: 'block',  // Hides page until font loads
})

// ❌ WRONG: Complex nested fallback logic
// Fonts need to be simple, available immediately

// ❌ WRONG: External CDN with no fallback
<link 
  href="https://cdn.example.com/font.woff2" 
  rel="stylesheet" 
/>
// If CDN fails, no fallback font

// ❌ WRONG: Disabling font downloads without alternatives
// NEXT_DISABLE_FONT_DOWNLOADS=1
// Must provide system fonts as fallback
```

---

## 6. Development vs Production

### ✅ DO: Environment-Aware Rendering

```tsx
// app/layout.tsx

export default function RootLayout({ children }: Props) {
  const isDev = process.env.NODE_ENV === 'development'
  const isVercel = process.env.VERCEL === '1'

  // Development: more verbose, detailed errors
  if (isDev) {
    console.log('[v0] Layout config:', {
      environment: process.env.NODE_ENV,
      hosting: isVercel ? 'Vercel' : 'Other',
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <html>
      <body>
        {/* Development-only debug panel */}
        {isDev && (
          <div 
            style={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              padding: '4px 8px',
              background: '#374151',
              color: '#f8f9fc',
              fontSize: '10px',
              zIndex: 9999,
            }}
          >
            DEV MODE
          </div>
        )}
        {children}
      </body>
    </html>
  )
}
```

### ❌ DON'T: Environment Mistakes

```tsx
// ❌ WRONG: Production behavior changes at runtime
if (isProd) {
  return <MinimalComponent />  // No error handling
} else {
  return <FullComponent />  // With error handling
}
// Different code paths = untested production code

// ❌ WRONG: Environment variables undefined
const apiUrl = process.env.NEXT_PUBLIC_API_URL
// If variable not set: undefined API calls
```

---

## 7. Build-Time Validation

### ✅ DO: Validate During Build

```ts
// scripts/validate-build.mjs

import fs from 'fs'

function validateBuild() {
  const checks = [
    {
      name: 'CSS files generated',
      check: () => {
        const files = fs.readdirSync('.next/static/css')
        if (files.length === 0) throw new Error('No CSS files')
        const sizes = files.map(f => 
          fs.statSync(`.next/static/css/${f}`).size
        )
        if (sizes.some(s => s < 1000)) throw new Error('CSS too small')
      }
    },
    {
      name: 'Layout compiles',
      check: () => {
        if (!fs.existsSync('app/layout.tsx')) {
          throw new Error('layout.tsx missing')
        }
      }
    },
    {
      name: 'Public assets present',
      check: () => {
        const required = ['favicon.ico', 'apple-icon.png']
        const missing = required.filter(
          f => !fs.existsSync(`public/${f}`)
        )
        if (missing.length > 0) {
          throw new Error(`Missing: ${missing.join(', ')}`)
        }
      }
    },
  ]

  for (const { name, check } of checks) {
    try {
      check()
      console.log(`✓ ${name}`)
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`)
      process.exit(1)
    }
  }
}

validateBuild()
```

Use in `package.json`:
```json
{
  "postbuild": "node scripts/validate-build.mjs"
}
```

---

## 8. Testing & Verification

### ✅ DO: Test Key Scenarios

```tsx
// __tests__/homepage.test.tsx

import { render, screen } from '@testing-library/react'
import HomePage from '@/app/[locale]/(home)/page'

describe('Homepage', () => {
  it('renders without crashing', async () => {
    // Mock params
    const mockParams = Promise.resolve({ locale: 'en' })
    
    // This should not throw
    const result = await HomePage({ params: mockParams })
    expect(result).toBeDefined()
  })

  it('has visible content', () => {
    render(<MockedHomePage />)
    
    // Should see something
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('flex')  // Has layout
  })

  it('handles error gracefully', () => {
    render(
      <ErrorBoundary>
        <ComponentThatThrows />
      </ErrorBoundary>
    )
    
    // Should show error UI, not black screen
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })
})
```

### ❌ DON'T: Testing Mistakes

```tsx
// ❌ WRONG: Not testing edge cases
test('page renders', () => {
  render(<HomePage />)
  // What if params is undefined? Not tested
})

// ❌ WRONG: Not testing error states
// Error boundary tests ensure fallback UI shows
```

---

## 9. Monitoring & Observability

### ✅ DO: Track Issues in Production

```tsx
// lib/logger.ts

export function logPageError(error: unknown, context: Record<string, any>) {
  const message = error instanceof Error ? error.message : String(error)
  
  console.error('[v0] Page Error:', {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  })

  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, { extra: context })
  }
}

// Use in components
try {
  const data = await fetchData()
} catch (error) {
  logPageError(error, { component: 'HomePage', operation: 'fetchData' })
}
```

---

## 10. Performance Optimization

### ✅ DO: Optimize Initial Paint

```tsx
// Prioritize what matters
// 1. HTML structure (critical path)
// 2. Essential CSS (above-the-fold)
// 3. Core JavaScript
// 4. Secondary assets (images, fonts)

// Lazy load non-critical components
import dynamic from 'next/dynamic'

const OptionalSection = dynamic(
  () => import('./OptionalSection'),
  { loading: () => <Skeleton />, ssr: false }
)

export default function Page() {
  return (
    <>
      {/* Critical: loaded immediately */}
      <Header />
      <Hero />
      
      {/* Non-critical: loaded after hydration */}
      <Suspense fallback={<Skeleton />}>
        <OptionalSection />
      </Suspense>
    </>
  )
}
```

---

## Checklist: Before Deploying

- [ ] CSS files generated and > 100KB
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] Error boundary wraps major sections
- [ ] All async params are awaited
- [ ] Fallback UI for loading states
- [ ] Public assets exist
- [ ] Inline styles have proper contrast
- [ ] Production build tested locally
- [ ] Console clean of errors in prod build
- [ ] Network tab shows all assets loading

---

## Summary

**The golden rule:** Every user-facing state needs visible content.

1. **Loading?** Show a loading indicator
2. **Error?** Show an error message
3. **Empty?** Show placeholder content
4. **Never:** Show a blank screen

This prevents black screens and ensures users always see meaningful feedback, whether your app is loading, failed, or working perfectly.

# Layout Enhancement Guide: Preventing Black Screen Issues

This guide provides code snippets and best practices to enhance the root layout with better error handling, visibility, and debugging capabilities.

## Issue Summary

The current `app/layout.tsx` has:
- ✅ Good: Error boundary, suspense, proper metadata
- ⚠️ Concern: Inline style overrides could override theme
- ⚠️ Concern: No fallback if CSS fails to load
- ⚠️ Concern: Minimal debugging output for development

## Enhancement 1: Add Visible Fallback Content

When CSS fails to load, users see nothing. Add a `<noscript>` fallback:

```tsx
// In app/layout.tsx, inside <body>

<body className="...">
  {/* Fallback for JavaScript disabled or CSS not loaded */}
  <noscript>
    <style>
      {`
        body {
          background: #0c0a14;
          color: #f8f9fc;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 2rem;
          margin: 0;
        }
        h1 {
          color: #f8f9fc;
          margin-bottom: 1rem;
        }
        p {
          color: #d4d5da;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
      `}
    </style>
    <div>
      <h1>Qunt Edge</h1>
      <p>JavaScript is required to run this application.</p>
      <p>Please enable JavaScript in your browser settings.</p>
    </div>
  </noscript>

  {/* Main content */}
  <a href="#main-content" className="sr-only ...">
    Skip to main content
  </a>
  {/* ... rest of layout ... */}
</body>
```

## Enhancement 2: Add Development Debug Mode

Help diagnose issues in development with visible indicators:

```tsx
// In app/layout.tsx, add near top of component

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercelRuntime = process.env.VERCEL === '1'
  const enableVercelInsights = isProduction && isVercelRuntime
  const uiVariant = getUiVariant()
  const darkRootClass = shouldEnforceDarkOnlySurfaces() ? 'dark' : ''

  // Debug logging for development
  if (!isProduction) {
    console.log('[v0] Layout Config:', {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      uiVariant,
      darkRootClass,
      cssLoaded: 'check DevTools → Network tab',
    })
  }

  return (
    <html
      lang="en"
      className={`${darkRootClass} ${fontDmSans.variable} bg-background`}
      data-ui-variant={uiVariant}
      data-debug-mode={!isProduction ? 'true' : 'false'}
      translate="no"
      suppressHydrationWarning
      style={{ 
        backgroundColor: '#0c0a14', 
        color: '#f8f9fc',
      }}
    >
      <head>
        {/* ... existing head content ... */}
        
        {/* CSS Fallback: Ensure minimum styling even if Tailwind fails */}
        <style>
          {`
            /* Critical styles - inline to ensure they load */
            :root {
              --background: #0c0a14;
              --foreground: #f8f9fc;
              --muted-foreground: #d4d5da;
            }
            
            html {
              background-color: var(--background);
              color: var(--foreground);
            }
            
            body {
              background-color: var(--background);
              color: var(--foreground);
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            
            /* Ensure main content is visible */
            main {
              display: flex;
              flex: 1;
              flex-direction: column;
              width: 100%;
              min-height: 100vh;
              overflow: visible;
            }
            
            /* Debug indicator (visible only in development) */
            [data-debug-mode="true"]::after {
              content: 'DEV MODE';
              position: fixed;
              bottom: 0;
              right: 0;
              padding: 4px 8px;
              background: #374151;
              color: #f8f9fc;
              font-size: 10px;
              z-index: 9999;
              pointer-events: none;
            }
          `}
        </style>
      </head>
      
      <body
        className="flex min-h-screen flex-col bg-background font-sans type-body antialiased text-foreground"
        data-ui-variant={uiVariant}
        style={{ backgroundColor: '#0c0a14', color: '#f8f9fc' }}
      >
        {/* Visible skip link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
        >
          Skip to main content
        </a>

        {/* Loading indicator as fallback */}
        {!isProduction && (
          <noscript>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#0c0a14',
                color: '#f8f9fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2>Loading Qunt Edge...</h2>
                <p style={{ color: '#d4d5da', marginTop: '1rem' }}>
                  If this message persists, there may be a CSS loading issue.
                  <br />
                  Check DevTools Console (F12) for errors.
                </p>
              </div>
            </div>
          </noscript>
        )}

        <ScrollLockFixLazy />
        {enableVercelInsights ? <SpeedInsights /> : null}
        {enableVercelInsights ? <Analytics /> : null}
        
        <main id="main-content" className="flex flex-1 flex-col relative w-full">
          {children}
        </main>
      </body>
    </html>
  )
}
```

## Enhancement 3: Homepage Error Fallback

Make the homepage more robust with immediate visible content:

```tsx
// In app/[locale]/(home)/page.tsx

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  let locale = 'en'

  try {
    const resolvedParams = await params
    locale = resolvedParams.locale
    setStaticParamsLocale(locale)
  } catch (error) {
    console.error('[v0] Params resolution failed:', error)
    locale = 'en'
  }

  const softwareSchema = buildSoftwareApplicationSchema(locale, '/')
  const organizationSchema = buildOrganizationSchema()
  const breadcrumbSchema = buildBreadcrumbSchema(locale, [{ name: 'Home', path: '/' }])

  return (
    <ErrorBoundary 
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Qunt Edge
            </h1>
            <p className="text-muted-foreground mb-4">
              We&apos;re having trouble loading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      }
    >
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
        
        {/* Add visible loading state */}
        <Suspense 
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="text-center">
                <div className="mb-4 h-8 w-8 border-4 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          }
        >
          <HomeContent locale={locale} />
        </Suspense>
      </>
    </ErrorBoundary>
  )
}
```

## Enhancement 4: Improve HomeContent Logging

Add instrumentation for debugging:

```tsx
// In app/[locale]/(home)/components/HomeContent.tsx

export default async function HomeContent({ locale }: HomeContentProps) {
  const startTime = Date.now()
  
  console.log('[v0] HomeContent: Starting render', { locale })

  try {
    const t = await getI18n()
    console.log('[v0] HomeContent: i18n loaded', { 
      duration: Date.now() - startTime 
    })

    // ... rest of component ...

    console.log('[v0] HomeContent: Render complete', { 
      duration: Date.now() - startTime 
    })

    return (
      // ... JSX ...
    )
  } catch (error) {
    console.error('[v0] HomeContent: Error during render', {
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    })
    throw error // Let error boundary catch it
  }
}
```

## Enhancement 5: Add Build-Time CSS Validation

Create a script to verify CSS loads correctly:

```bash
#!/bin/bash
# scripts/validate-css.sh

echo "Validating CSS generation..."

# Check if .next/static/css exists
if [ ! -d ".next/static/css" ]; then
  echo "❌ CSS directory not found: .next/static/css"
  exit 1
fi

# Count CSS files
css_count=$(find .next/static/css -name "*.css" | wc -l)
if [ "$css_count" -eq 0 ]; then
  echo "❌ No CSS files found in .next/static/css"
  exit 1
fi

# Check CSS file sizes
for file in .next/static/css/*.css; do
  size=$(wc -c < "$file")
  if [ "$size" -lt 1000 ]; then
    echo "⚠️  Warning: CSS file too small: $file ($size bytes)"
  fi
done

echo "✓ CSS validation passed"
echo "  Found $css_count CSS file(s)"
```

Use in build:
```json
{
  "prebuild": "node scripts/clean-build-artifacts.mjs && tsx scripts/generate-routes.ts",
  "build": "node scripts/sync-stack.mjs && NODE_OPTIONS=--max-old-space-size=8192 NEXT_DISABLE_FONT_DOWNLOADS=1 NEXT_BUILD_CPUS=${NEXT_BUILD_CPUS:-1} node scripts/robust-next-build.mjs",
  "postbuild": "bash scripts/validate-css.sh"
}
```

## Testing the Fixes

### Test 1: CSS Loading Failure
```bash
# Temporarily rename globals.css to test fallback
mv app/globals.css app/globals.css.bak
bun run dev
# Should still show content with fallback styling
mv app/globals.css.bak app/globals.css
```

### Test 2: JavaScript Disabled
- F12 → Settings → Disable JavaScript
- Refresh page
- Should see noscript content

### Test 3: Component Error
```tsx
// Temporarily add error to HomeContent
throw new Error('Test error')

// Should show error boundary fallback
```

### Test 4: Production Build
```bash
bun run build
bun start
# Visit http://localhost:3000
# Check for console errors and CSS loading
```

## Summary

These enhancements provide:
1. ✅ **Fallback styling** - visible content even if CSS fails
2. ✅ **Better debugging** - clear console messages and dev indicators
3. ✅ **Error handling** - graceful fallbacks for component errors
4. ✅ **Loading states** - visible indicators during async operations
5. ✅ **CSS validation** - automated checks during build

Implement these changes incrementally and test after each one.

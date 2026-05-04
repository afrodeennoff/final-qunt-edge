# Black Screen Issue: Comprehensive Analysis & Troubleshooting Guide

## Problem Overview
Homepage displays a completely black screen upon loading, preventing users from seeing content. This is a critical UX issue that typically indicates rendering, CSS, JavaScript, or asset loading failures.

---

## Root Cause Categories & Diagnostic Steps

### 1. **CSS/Styling Issues** ⚠️ PRIMARY SUSPECT
**Symptoms:** Layout renders but is invisible due to text/background color problems

#### Potential Causes:
- **Background color override:** The `<html>` tag has explicit inline styles overriding Tailwind:
  ```tsx
  style={{ backgroundColor: '#0c0a14', color: '#f8f9fc' }}
  ```
  If `#0c0a14` (dark navy) matches the text color, content becomes invisible.

- **Missing or broken CSS imports:** Tailwind CSS not loading due to:
  - Missing `@import` statements in `globals.css`
  - Broken CSS file paths
  - PostCSS/Tailwind configuration errors

- **Design tokens not rendering:** If `--background` and `--foreground` tokens aren't defined in `styles/tokens.css`, the theme system fails silently.

- **Dark mode applied incorrectly:** The `dark` class on `<html>` may be forcing dark colors when text color is also dark.

#### Diagnostic Commands:
```bash
# Check if CSS is being imported
grep -n "@import\|@config" app/globals.css

# Verify Tailwind config exists and is valid
cat tailwind.config.ts | head -20

# Check if token files exist
ls -la styles/tokens.css styles/styleseed-tokens.css styles/styleseed-base.css
```

#### Quick Fixes:
- **Adjust inline styles:** Change text color to a bright, visible shade:
  ```tsx
  style={{ backgroundColor: '#0c0a14', color: '#ffffff' }}
  ```

- **Verify design tokens:** Ensure `styles/tokens.css` defines:
  ```css
  :root {
    --background: #0c0a14;
    --foreground: #f8f9fc;
  }
  ```

- **Check Tailwind CSS v4 compatibility:** The project uses Tailwind v4 with new `@config` syntax. Verify `tailwind.config.ts` has correct theme configuration.

---

### 2. **JavaScript Rendering Errors** 🔴 CRITICAL
**Symptoms:** Console shows errors, React doesn't hydrate, page stays blank

#### Potential Causes:
- **Hydration mismatch:** Server renders one thing, client renders another
  - `suppressHydrationWarning` is present, which masks issues
  - Async `getI18n()` call in `HomeContent` may have timing issues

- **Component errors in HomeContent:**
  ```tsx
  const t = await getI18n()  // May fail if i18n not initialized
  ```
  If `getI18n()` throws, the Suspense boundary should catch it, but check error-boundary logic.

- **Missing or invalid locale:** The page expects `params.locale` which is resolved asynchronously:
  ```tsx
  const resolvedParams = await params
  locale = resolvedParams.locale
  ```
  If `params` is undefined, locale defaults to 'en'.

- **Import failures:** Missing modules like:
  - `@/locales/server`
  - `@/components/error-boundary`
  - `@/lib/seo`

#### Diagnostic Steps:
```bash
# Check browser console for errors (F12 → Console tab)
# Look for:
# - "Cannot find module"
# - "Hydration mismatch"
# - "x is not defined"
# - Network errors (red 404s/500s)

# Verify locale configuration
cat locales/server.ts | head -30

# Check if translations are loaded
ls -la locales/

# Run TypeScript check
npm run typecheck  # or pnpm typecheck, bun run typecheck
```

#### Quick Fixes:
- **Enable error details in development:**
  Add detailed logging to `HomeContent`:
  ```tsx
  export default async function HomeContent({ locale }: HomeContentProps) {
    console.log('[v0] HomeContent rendering with locale:', locale)
    try {
      const t = await getI18n()
      console.log('[v0] i18n loaded successfully')
      // ... rest of component
    } catch (error) {
      console.error('[v0] i18n loading failed:', error)
      throw error
    }
  }
  ```

- **Add fallback content:**
  Wrap content in a more robust Suspense boundary:
  ```tsx
  <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
    <HomeContent locale={locale} />
  </Suspense>
  ```

---

### 3. **Asset Loading Failures** 📦
**Symptoms:** Network requests fail (check DevTools → Network tab)

#### Potential Causes:
- **Font loading failures:** The project uses `DM_Sans` from `next/font/google`:
  ```tsx
  const fontDmSans = DM_Sans({
    display: 'swap',
    preload: true,
  })
  ```
  If Google Fonts is blocked/unavailable, layout may break.

- **Image load errors:** Open Graph images or favicon missing:
  - `/opengraph-image.png`
  - `/twitter-image.png`
  - `/favicon.ico`
  - `/apple-icon.png`

- **CSS asset loading:** Tailwind v4 requires the new `@config` directive. If not processed by PostCSS, CSS won't load.

- **Environment-specific issues:**
  - `NEXT_DISABLE_FONT_DOWNLOADS=1` in build script prevents font downloading
  - May cause fallback fonts to not load either

#### Diagnostic Steps:
```bash
# Check Network tab in DevTools (F12)
# Look for:
# - Fonts: 404 errors, very long load times
# - CSS: Missing or 0-byte files
# - Images: 404 errors
# - JavaScript: Parse errors, missing dependencies

# Verify public assets exist
ls -la public/favicon.ico public/apple-icon.png

# Check font setup
grep -n "DM_Sans\|font" app/layout.tsx | head -10

# Verify Tailwind output is generated
ls -la .next/static/css/ 2>/dev/null | head -5
```

#### Quick Fixes:
- **Ensure public assets exist:**
  ```bash
  touch public/favicon.ico
  touch public/apple-icon.png
  ```

- **Add system font fallback:**
  Update `tailwind.config.ts`:
  ```ts
  extend: {
    fontFamily: {
      sans: [
        'DM Sans',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif'
      ],
    },
  }
  ```

- **Force font downloads during build:**
  Remove `NEXT_DISABLE_FONT_DOWNLOADS=1` from `package.json` build script.

---

### 4. **Layout/Container Issues** 🔲
**Symptoms:** Content renders but is positioned off-screen or hidden

#### Potential Causes:
- **Flexbox/Grid misconfiguration:**
  ```tsx
  <body className="flex min-h-screen flex-col bg-background ...">
    <main id="main-content" className="flex flex-1 flex-col relative">
  ```
  If parent widths are wrong, content may be invisible.

- **Overflow hidden with absolute positioning:**
  Hidden overflow + absolutely positioned children = black screen.

- **Z-index issues:** Content rendered behind a modal/overlay that's empty.

- **Missing viewport meta tags:** Mobile viewport not set correctly, content off-screen on mobile.

#### Diagnostic Steps:
```bash
# Inspect element in DevTools (F12 → Elements tab)
# Check:
# - Is <html>, <body>, <main> rendered?
# - Do they have correct dimensions?
# - Is there invisible overflow?
# - Are computed styles showing 0x0 or hidden?

# Check viewport configuration
grep -A 5 "export const viewport" app/layout.tsx
```

#### Quick Fixes:
- **Ensure main content has visible dimensions:**
  ```tsx
  <main 
    id="main-content" 
    className="flex flex-1 flex-col w-full overflow-visible"
  >
    {children}
  </main>
  ```

- **Remove restrictive overflow settings:**
  Check for `overflow-hidden` on parent containers.

---

### 5. **Next.js 16 Specific Issues** 🚀
**Symptoms:** Works in dev, breaks in production build

#### Potential Causes:
- **Async params handling:** Next.js 16 requires awaiting `params`, `searchParams`, etc.:
  ```tsx
  const { locale } = await params  // Must be awaited!
  ```
  Missing `await` causes undefined values.

- **Hydration mismatches:** React 19.2 + Server Components may have subtle issues with:
  - `suppressHydrationWarning` (masks real problems)
  - Dynamic data that differs between server/client

- **Build-time vs runtime issues:**
  The build script has custom steps:
  ```json
  "prebuild": "node scripts/clean-build-artifacts.mjs && tsx scripts/generate-routes.ts",
  "build": "node scripts/sync-stack.mjs && ... NODE_OPTIONS=--max-old-space-size=8192"
  ```
  These may be failing silently.

#### Diagnostic Steps:
```bash
# Run production build locally
bun run build  # or npm run build, pnpm build

# Check for build errors
cat .next/build-manifest.json | grep -i error

# Test production server
bun start  # or npm start, pnpm start
# Visit http://localhost:3000

# Check Next.js server logs for errors
```

#### Quick Fixes:
- **Verify async params are awaited:**
  ```tsx
  // ❌ Wrong
  const locale = params.locale
  
  // ✅ Correct
  const { locale } = await params
  ```

- **Clean build cache and rebuild:**
  ```bash
  bun run clean:build-artifacts
  bun run build
  bun start
  ```

---

## Comprehensive Troubleshooting Checklist

### Step 1: Browser DevTools Investigation
- [ ] Open DevTools (F12)
- [ ] Go to **Console** tab
  - [ ] Any red errors? Note them
  - [ ] Any warnings about hydration? Note them
- [ ] Go to **Network** tab
  - [ ] Reload page
  - [ ] Look for failed requests (red 404s/500s)
  - [ ] Check CSS files are loading (not 0 bytes)
  - [ ] Check fonts are loading
- [ ] Go to **Elements** tab
  - [ ] Is DOM rendered? (Should see `<html>`, `<body>`, `<main>`)
  - [ ] Right-click body → Inspect Computed Layout
  - [ ] Does it show dimensions? Should be viewport size

### Step 2: CSS Verification
- [ ] Check `app/globals.css` exists and has imports
- [ ] Verify `styles/tokens.css` exists and defines design tokens
- [ ] Check Tailwind CSS is being generated:
  ```bash
  ls -la .next/static/css/
  ```
  Should show `.css` files with size > 0 bytes

### Step 3: JavaScript/React Issues
- [ ] Check browser console for error messages
- [ ] Add logging to verify code execution:
  ```tsx
  // In layout.tsx
  console.log('[v0] RootLayout rendering')
  
  // In page.tsx
  console.log('[v0] HomePage rendering')
  
  // In HomeContent.tsx
  console.log('[v0] HomeContent loading')
  ```

### Step 4: Build & Runtime Testing
```bash
# Clean and rebuild
bun run clean:build-artifacts
bun run build

# Test in development mode
bun run dev
# Visit http://localhost:3000
# Check terminal for errors

# Test in production mode
bun start
# Visit http://localhost:3000
# Check logs
```

### Step 5: Asset Verification
- [ ] Favicon exists: `public/favicon.ico`
- [ ] Open Graph images exist: `public/opengraph-image.png`
- [ ] No missing imports in components

### Step 6: Locale/i18n Issues
```bash
# Check if locales are configured correctly
cat locales/server.ts | head -20

# Verify translation files exist
ls locales/
```

---

## Prevention Best Practices for Next.js

### 1. **Robust CSS Architecture**
```tsx
// ✅ DO: Use design tokens, not inline colors
<html 
  className="bg-background text-foreground"
  style={{ 
    // Minimal inline styles, only for theme colors
    colorScheme: 'dark'
  }}
>

// ✅ DO: Define fallback colors
body {
  @apply bg-background text-foreground;
  /* Fallback for broken CSS */
  background-color: #0c0a14;
  color: #f8f9fc;
}
```

### 2. **Error Boundaries & Suspense**
```tsx
// ✅ DO: Wrap async components
<Suspense fallback={<LoadingFallback />}>
  <ErrorBoundary fallback={<ErrorFallback />}>
    <YourAsyncComponent />
  </ErrorBoundary>
</Suspense>

// ✅ DO: Provide visible fallbacks
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-foreground">
    Loading...
  </div>
)
```

### 3. **Async Params Handling (Next.js 16)**
```tsx
// ✅ DO: Always await params in Server Components
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params  // Must await!
  // ...
}
```

### 4. **Comprehensive Logging**
```tsx
// ✅ DO: Add meaningful debug logs during development
if (process.env.NODE_ENV === 'development') {
  console.log('[v0] Component rendering:', { locale, userId })
}
```

### 5. **CSS Source Maps**
Ensure Tailwind generates source maps for easier debugging:
```ts
// tailwind.config.ts
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  // Source maps help debug CSS issues
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
}
```

---

## Immediate Actions (If Site is Down)

1. **Check server status:**
   ```bash
   bun run dev
   ```
   Does the dev server start? Any errors?

2. **Check browser console (F12):**
   Copy any error messages

3. **Verify CSS loads:**
   - DevTools → Network → Filter by CSS
   - Should see one or more `.css` files with size > 100KB

4. **Test with minimal content:**
   Temporarily replace `HomeContent` with static HTML:
   ```tsx
   <div className="text-white p-8">
     <h1>Hello World</h1>
   </div>
   ```
   If this works, issue is in `HomeContent` or its children.

5. **Clear build cache:**
   ```bash
   bun run clean:build-artifacts
   rm -rf .next
   bun run build
   ```

---

## Additional Resources

- **Next.js 16 Docs:** https://nextjs.org/docs
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **React Error Boundaries:** https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Browser DevTools:** https://developer.chrome.com/docs/devtools/

---

## Summary

The black screen issue in a Next.js app almost always stems from one of these categories:

1. **CSS not loading** → Check `globals.css`, design tokens, Tailwind output
2. **JavaScript errors** → Check browser console, component imports, hydration
3. **Asset failures** → Check Network tab, public files, fonts
4. **Layout issues** → Inspect elements, check dimensions
5. **Next.js specifics** → Async params, build configuration

**Start with Step 1 of the checklist above** using browser DevTools. The console and network tabs will reveal 90% of issues immediately.

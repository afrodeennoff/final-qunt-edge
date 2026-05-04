# Black Screen Quick Fix Reference

**Status: Homepage shows only black screen**

## 🚀 Do This First (5 minutes)

### 1. Check Browser Console
```
F12 → Console tab
```
**What to look for:**
- Red error messages → Note them
- "Cannot find module..." → Missing import
- "Hydration mismatch" → Server/client difference
- Empty → Issue is CSS/rendering

### 2. Check Network Tab
```
F12 → Network tab → Reload page
```
**What to look for:**
- Red 404s → Missing file
- CSS files → Should load, size > 100KB
- Fonts → Check if loaded or 404

### 3. Check Elements Tab
```
F12 → Elements tab
Right-click <body> → Inspect Computed Layout
```
**What to look for:**
- Is `<html>` tag visible? Should see it
- Is `<body>` visible with dimensions?
- Is `<main>` visible?

---

## 🔧 Quick Fixes (Pick One)

### Fix #1: CSS Not Loading
**Symptom:** Console shows no errors, but everything is black

**Solution:**
```bash
# Clean and rebuild
bun run clean:build-artifacts
rm -rf .next
bun run build
bun start
```

**Verify:**
```bash
ls -la .next/static/css/
# Should show one or more .css files > 100KB
```

---

### Fix #2: JavaScript Error in Console
**Symptom:** Red error in Console tab

**Copy the error message and:**

1. **"Cannot find module X"**
   ```bash
   # Check if file exists
   find . -name "X.ts*" -o -name "X.js*"
   
   # Check if import path is correct in the error file
   ```

2. **"Hydration mismatch"**
   ```tsx
   // This is usually in layout.tsx
   // Ensure async params are awaited:
   const { locale } = await params  // ← Must have 'await'
   ```

3. **"getI18n is not defined"**
   ```tsx
   // In HomeContent.tsx, verify import:
   import { getI18n } from '@/locales/server'
   
   // And call it:
   const t = await getI18n()
   ```

---

### Fix #3: Fonts Not Loading
**Symptom:** Text visible but in wrong font or looks broken

**Solution:**
```bash
# Stop build from disabling fonts
# Edit package.json, find build script:

"build": "... NEXT_DISABLE_FONT_DOWNLOADS=1 ..."
         # Remove ↑ this part

# Rebuild:
bun run clean:build-artifacts
bun run build
```

---

### Fix #4: Missing Public Assets
**Symptom:** 404 errors for favicon/images

**Solution:**
```bash
# Create missing files
touch public/favicon.ico
touch public/apple-icon.png

# Or check what exists:
ls -la public/
```

---

### Fix #5: Inline Style Override
**Symptom:** Can't see text even though page loads

**Check in `app/layout.tsx`:**
```tsx
// Look for this:
style={{ backgroundColor: '#0c0a14', color: '#f8f9fc' }}

// If text color (#f8f9fc) is too close to background (#0c0a14):
// Change to:
style={{ backgroundColor: '#0c0a14', color: '#ffffff' }}  // Brighter white
```

---

## 📊 Issue Diagnosis Tree

```
Homepage is black screen
│
├─ Browser console has red errors?
│  ├─ YES → Look for "Cannot find module", "Hydration", "is not defined"
│  │        Copy the error → Search in codebase
│  │        Check imports and file paths
│  │
│  └─ NO → Network tab shows CSS file?
│     ├─ 404 error on CSS → CSS didn't build, use Fix #1
│     ├─ 0 bytes CSS → CSS is empty, check Tailwind config
│     ├─ Red icon for fonts → Use Fix #3
│     │
│     └─ All assets loaded OK → Likely inline style issue
│        Check layout.tsx inline styles → Use Fix #5
│
├─ <body> element visible in Elements tab?
│  ├─ YES, with dimensions → CSS issue (Fix #1)
│  │
│  └─ NO or 0x0 → JavaScript error preventing render
│     Check console again
```

---

## 🧪 Manual Tests

### Test CSS Loads
```bash
# Build and check CSS file size
bun run build
ls -lh .next/static/css/

# Should show files like:
# -rw-r--r-- ... 257K ... globals-{hash}.css
#
# If 0 bytes or missing → CSS build failed
```

### Test Dev Server
```bash
# Start dev server with logging
bun run dev

# Visit http://localhost:3000
# Watch terminal for errors like:
# - "error TS..."
# - "Build failed"
# - "Module not found"
```

### Test Production Build
```bash
# Build for production
bun run build

# Any errors? → Check output above

# Test production server
bun start

# Visit http://localhost:3000
# Check console (F12) for errors
```

### Test with Fallback Content
```tsx
// Temporarily replace in app/page.tsx:

export default function RootPage() {
  // Instead of redirect:
  return (
    <div style={{ 
      backgroundColor: '#0c0a14', 
      color: '#ffffff', 
      padding: '2rem' 
    }}>
      <h1>Hello World - Qunt Edge</h1>
      <p>If you see this, basic rendering works!</p>
    </div>
  )
}

// If this works, issue is in redirect or downstream components
```

---

## 📋 Checklist When Stuck

- [ ] Dev server running? `bun run dev`
- [ ] Console open? F12 → Console tab
- [ ] Any red errors? Write them down
- [ ] CSS file exists? `.next/static/css/` has files > 0 bytes
- [ ] Clear cache? `bun run clean:build-artifacts && rm -rf .next`
- [ ] Rebuild? `bun run build && bun start`
- [ ] Check imports? All import paths valid?
- [ ] Check async params? All `await params` present?

---

## 🆘 Still Stuck?

### Step 1: Capture All Information
```bash
# Save this information:
node scripts/diagnose-black-screen.mjs > diagnosis.txt

# Rebuild with output:
bun run clean:build-artifacts
bun run build 2>&1 > build-output.txt

# Dev server output:
bun run dev 2>&1 > dev-output.txt
# (visit http://localhost:3000 in browser, then stop with Ctrl+C)
```

### Step 2: Check Each File
```bash
# Verify key files exist and are valid:
cat app/layout.tsx | head -50
cat app/globals.css | head -20
cat tailwind.config.ts | head -30
cat app/\[locale\]/\(home\)/page.tsx | head -30
```

### Step 3: Test Minimal Setup
Create `app/debug-page.tsx`:
```tsx
export default function DebugPage() {
  return (
    <div style={{
      backgroundColor: '#0c0a14',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px',
    }}>
      Debug page loaded - basic rendering works
    </div>
  )
}
```

Visit: `http://localhost:3000/debug-page`

If this works, issue is in homepage routing or HomeContent component.

---

## 🎯 Most Common Causes (In Order)

1. **CSS not building** (40%)
   - Fix: `bun run clean:build-artifacts && bun run build`

2. **Missing/wrong import** (30%)
   - Fix: Check all import paths in error message

3. **Async params not awaited** (15%)
   - Fix: Change `params.locale` → `await params` then destructure

4. **Inline style color conflict** (10%)
   - Fix: Change text/background colors to ensure contrast

5. **Environment variable missing** (5%)
   - Fix: Check `.env.local` or Vercel environment variables

---

## 📞 When to Ask for Help

Provide this information:

1. **Console error (if any):**
   ```
   F12 → Console → Copy full red error message
   ```

2. **Build output:**
   ```bash
   bun run build 2>&1 | tail -50
   ```

3. **Network tab screenshot (F12 → Network):**
   Show CSS file loads and size

4. **Diagnostic results:**
   ```bash
   node scripts/diagnose-black-screen.mjs
   ```

5. **What you tried:**
   List the fixes you already attempted

---

## 🚨 Emergency: Restore Last Working Version

```bash
# Check git history
git log --oneline | head -10

# See what changed
git diff HEAD~1 app/layout.tsx

# Revert last commit
git revert HEAD

# Or restore specific file
git checkout HEAD~1 app/layout.tsx
```

---

**Remember:** Black screens in Next.js almost always show something in the console, network tab, or elements inspector. Check those three places first before trying fixes.

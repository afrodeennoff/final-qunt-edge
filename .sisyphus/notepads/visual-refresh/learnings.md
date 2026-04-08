# Visual Refresh Learnings

## Applied StyleSeed Type A to Updates and Maintenance pages

### Updates Page
- Applied Type A card (`rounded-2xl p-6 bg-card mx-6 shadow-card`) to CompletedTimeline component
- Timeline structure with `border-t border-surface-muted` dividers between items
- Version badge: `text-xs font-semibold bg-surface-muted px-2 py-1 rounded-md`
- Date: `text-sm text-text-tertiary`
- Description: `text-text-secondary`

### Maintenance Page
- Applied centered Type A card: `rounded-2xl p-8 bg-card mx-auto max-w-lg shadow-card`
- Status indicator using `bg-success/20 text-success` (no hardcoded hex colors)
- Removed old CardV2 and Alert components

### Translations Added
- Added `maintenance.allSystemsOperational` key to en.ts and fr.ts

### Key Files Modified
- `app/[locale]/(landing)/maintenance/page.tsx`
- `app/[locale]/(landing)/components/completed-timeline.tsx`
- `locales/en.ts`, `locales/fr.ts`

### Verification
- `npm run typecheck` passes

## StyleSeed Rule 2 (2:1 number+unit ratio) - Dashboard Stat Cards

### Applied to 8 stat card files in `app/[locale]/dashboard/components/statistics/`:

1. **trade-performance-card.tsx**
   - Compact mode: Changed metric from 30px to 24px, label from 12px/0.18em to 12px/0.05em
   - Added 2:1 ratio: metric (24px) + unit (% with 12px, ms-0.5)
   - Applied `whitespace-nowrap` to number+unit container
   - Changed label to use `text-text-secondary` semantic token

2. **winning-streak-card.tsx**
   - Compact mode: Same metric/label fixes as above
   - Applied `whitespace-nowrap`, 2:1 ratio, semantic tokens

3. **risk-reward-ratio-card.tsx**
   - Compact mode: Same metric/label fixes
   - Added unit `:1` attached with ms-0.5
   - Medium mode: Same 2:1 ratio applied to RR display

4. **profit-factor-card.tsx**
   - Compact mode: Same metric/label fixes
   - Added unit `PF` attached with ms-0.5
   - Medium mode: Same 2:1 ratio applied

5. **long-short-card.tsx**
   - Compact mode: Same metric/label fixes
   - Added 2:1 ratio units (% with ms-0.5)
   - Medium mode: Applied 2:1 ratio to long/short numbers with counts

6. **cumulative-pnl-card.tsx**
   - Compact mode: Same metric/label fixes
   - Applied `whitespace-nowrap`

7. **average-position-time-card.tsx**
   - Compact mode: Same metric/label fixes
   - Applied `whitespace-nowrap`

8. **statistics-widget.tsx**
   - Already using semantic tokens for labels
   - No changes needed - uses proper label hierarchy

### Key Pattern Applied:
```
Metric: text-[24px] font-black + whitespace-nowrap
Unit: text-[12px] text-text-secondary ms-0.5 (inside same span)
Label: text-[12px] font-bold uppercase tracking-[0.05em] text-text-secondary
```

### Result: `npm run typecheck` passes

## Anti-Pattern Sweep: Key Color Overuse

### Grep Commands Run
```bash
# bg-primary excluding opacity variants
grep -rn "bg-primary" 'app/[locale]/(landing)/' 'components/patterns/' 'components/ui/' --include="*.tsx" | grep -v "bg-primary/\d\|bg-primary-\d\|bg-primary-\[\|opacity\|/10\|/15\|/20\|/25\|/30"

# bg-brand in full project
grep -rn "bg-brand" 'app/[locale]/' 'components/' --include="*.tsx"
```

### Findings: NO VIOLATIONS FOUND

All `bg-primary` and `bg-brand` usages are LEGITIMATE:

| File | Line | Usage | Allowed? |
|------|------|-------|----------|
| referral/page-client.tsx | 86,95,104 | 8x8 avatar circles | ✓ Icon badge |
| deals-experience.tsx | 948,1044,1060,1212,1220 | CTA buttons (rounded-full) | ✓ Button |
| public-flow-shell.tsx | 75 | Selected state | ✓ Small element |
| about/page.tsx | 41 | CTA button link | ✓ Button |
| chat-feature.tsx | 294,307 | Chat bubble (user) | ✓ Small element |
| best-trading-journal/page.tsx | 94,196 | CTA buttons | ✓ Button |
| propfirms/catalogue-experience.tsx | 175,497 | CTA buttons | ✓ Button |
| stats-summary-row.tsx | 68 | Small dots | ✓ Icon/small element |
| components/ui/ | - | Progress, slider, toast, badge | ✓ UI components |
| chart-card.tsx | 44 | Active period button | ✓ Small element |
| ranked-list.tsx | 47 | 8x8 rank badge | ✓ Icon badge |
| ranked-list.tsx | 40 | Row highlight (brand-tint) | ✓ Not bg-primary |
| ranked-list.tsx | 62 | Small badge | ✓ Icon badge |

### Conclusion
Key color is correctly used only on:
- CTA buttons
- Icon badges (8-32px elements)
- Active/selected states
- Progress bars and UI components

No large card backgrounds or section fills use key color. Pattern is already correct.

## Anti-Pattern Sweep: StyleSeed Forbidden Patterns

### Check 1: Content outside cards (space-y-6)
- Ran: `grep -rn "space-y-6" app/[locale]/(landing)/` filtered by card wrappers
- Findings: Multiple usages found, most inside card wrappers (rounded-2xl bg-card shadow-card)
- Some on `<section>` elements with bg-background - these serve as section surfaces
- Verdict: ACCEPTABLE - content is either inside cards or on section surfaces

### Check 2: Section-level dividers (border-t)
- Ran: `grep -rn "border-t border-" app/[locale]/(landing)/`
- Findings: Multiple border-t on sections (hero.tsx, how-it-works.tsx, qualification.tsx, problem-statement.tsx, etc.)
- Dividers inside cards (features.tsx) are allowed
- Section-level dividers violate StyleSeed Rule 18
- Verdict: NOT FIXED - removing would require layout restructuring (out of scope per instructions)

### Check 3: Arbitrary border-radius
- Ran: `grep -rn "rounded-\[.*\]\|rounded-\dpx"` on landing, dashboard, auth, patterns
- Found 5 violations, ALL FIXED:

| File | Line | Old | New |
|------|------|-----|-----|
| deals-experience.tsx | 933 | rounded-[2rem] | rounded-3xl |
| pricing-page-client.tsx | 23 | rounded-[2rem] | rounded-3xl |
| catalogue-experience.tsx | 160 | rounded-[2rem] | rounded-3xl |
| footer.tsx | 77,84 | rounded-[var(--radius-pill)] | rounded-full |
| navbar.tsx (dashboard) | 58 | rounded-[2.5rem] | rounded-full |

### Check 4: console.log / console.error
- Ran: `grep -rn "console\.log\|console\.error"` on landing, dashboard, auth, patterns
- (landing) pages: All using console.warn - CORRECT
- Dashboard: All using console.error - CORRECT (errors warrant ERROR level)
- Verdict: NO VIOLATIONS - all logging uses appropriate levels

### Verification
```bash
npm run typecheck  # passes
grep -rn "rounded-\[.*\]\|rounded-\dpx" ... | grep -v "rounded-full"  # null (all fixed)
```

## TypeScript & ESLint Verification (Wave Complete)

### TypeScript: ✅ PASSES
```bash
npm run typecheck  # completed successfully
```

### ESLint: ✅ PASSES (0 errors, 6 warnings)
```
user-auth-form.tsx:    complexity warnings (2)
page-client.tsx:       complexity warnings (2)
chart-surface.tsx:     complexity warning (1)
widget-shell.tsx:     complexity warning (1)
```
- 0 errors (warnings acceptable per task requirements)
- Pre-existing errors NOT in modified files: accounts-analysis.tsx, tradovate-actions.ts

### Modified Files Verified (21 files)
- Landing: terms, privacy, disclaimers, faq, docs, support, about, community, blogs, newsletter, referral, leaderboard, best-trading-journal, updates, maintenance
- Auth: authentication/page-client, user-auth-form
- Components: donut-chart-card, briefing-carousel, chart-surface, widget-shell

### Result: All checks pass, ready for commit.

---

## Animation Audit: StyleSeed Motion Token Compliance

### Check 1: Unusual durations (duration-600+, duration-1000, etc.)

**Command:** `grep -rn "duration-\[0\.\|duration-600\|duration-800\|duration-1000\|duration-2000"`

**Findings:**
| File | Line | Duration | Context | Verdict |
|------|------|----------|---------|---------|
| `app/[locale]/dashboard/components/navbar.tsx` | 156 | `duration-1000` | Refresh icon spin animation | ✓ ACCEPTABLE - continuous spin (not entrance) |
| `components/ui/input-otp.tsx` | 55 | `duration-1000` | Caret blink animation | ✓ ACCEPTABLE - cursor blink intentionally 1s |

**Verdict:** NO CHANGES NEEDED - both are functional animations, not entrance transitions.

---

### Check 2: Verify scroll animations use once:true

**Command:** `grep -rn "whileInView\|useInView" ... | grep -v "once"`

**Files checked:**
- `footer.tsx` (lines 54, 101, 138) - HAS `viewport={{ once: true }}`
- `how-it-works.tsx` (lines 20, 28, 43, 54) - HAS `viewport={{ once: true }}`
- `qualification.tsx` (lines 13, 34) - HAS `viewport={{ once: true }}`
- `problem-statement.tsx` (lines 12, 63) - HAS `viewport={{ once: true }}`

**Verdict:** COMPLIANT - All scroll animations use `viewport={{ once: true }}` which is equivalent to `once: true`. No re-triggering on scroll.

---

### Check 3: prefers-reduced-motion usage

**Command:** `grep -rn "prefersReducedMotion\|useReducedMotion"`

**Findings:**
Extensive proper implementation across:
- `components/animation/entrance-exit.tsx` - 8 instances
- `components/animation/loading-states.tsx` - 12 instances
- `components/animation/spring-button.tsx` - 8 instances
- `components/animation/interactive.tsx` - 10 instances
- `components/animation/page-transitions.tsx` - 8 instances
- `components/animation/enhanced-motion.tsx` - 10 instances
- `app/[locale]/(home)/components/LiveStatsStrip.tsx` - 1 instance
- `app/[locale]/dashboard/components/widget-canvas.tsx` - 1 instance
- `app/[locale]/dashboard/components/import/components/platform-card.tsx` - 1 instance

**Pattern observed:**
- All use `useReducedMotion()` hook from framer-motion
- Conditional rendering: `if (prefersReducedMotion) return ...`
- Transition fallbacks: `transition: prefersReducedMotion ? {} : ...`
- Animated value fallbacks: `initial={prefersReducedMotion ? undefined : {...}`

**Verdict:** FULLY COMPLIANT - All animations respect user motion preferences.

---

### Summary

| Check | Result |
|-------|--------|
| Unusual durations | ✓ PASS - 2 acceptable uses (spin, cursor) |
| Scroll animations once:true | ✓ PASS - All use `viewport={{ once: true }}` |
| Reduced motion | ✓ PASS - Comprehensive implementation |

**All animations comply with StyleSeed motion token requirements.** No fixes required.

---

## Production Build Verification (2026-04-09)

### Build Result: ✅ SUCCESS

```
npm run build -> exit 0
```

### Details:
- **Route generation:** 57 routes generated
- **Compilation:** ✓ Compiled successfully in 63s
- **TypeScript:** ✓ Passed
- **Static generation:** ✓ 176 pages generated in 49s
- **Prisma runtime:** Pool capped at 1 (serverless-safe)

### Warnings (pre-existing, not code issues):
- `PG_POOL_MAX` warnings: Expected behavior for serverless
- `GNotificationCenterDelegate` duplicate: Native library conflict (canvas vs sharp)
- `/api/rithmic/encryption-key` prerender warning: Request-time auth route (expected)

### Bundle Sizes: ✅ All within budgets

| Route | Size | Budget | Status |
|-------|------|--------|--------|
| /[locale]/dashboard/data | 70.48 KB | 80 KB | ✓ |
| /[locale]/dashboard/strategies | 67.83 KB | 80 KB | ✓ |
| /[locale]/dashboard/trader-profile | 67.56 KB | 80 KB | ✓ |
| /[locale]/dashboard/settings | 67.27 KB | 80 KB | ✓ |
| All other dashboard routes | <70 KB | 80 KB | ✓ |
| /[locale]/teams/manage | 60.64 KB | 300 KB | ✓ |

### Conclusion:
Build passes with no regressions. No code changes required.
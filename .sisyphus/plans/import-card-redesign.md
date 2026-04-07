# Import Card Section Redesign

## TL;DR

> **Quick Summary**: Comprehensive redesign of the import card section in the dashboard - adding visual polish, new layout, multi-select flow, platform badges, and mobile improvements.
> 
> **Deliverables**: 
> - Redesigned PlatformCard component with premium styling
> - Multi-select/compare mode functionality  
> - Category badges for platform cards
> - Enhanced mobile responsive layout
> - Visual hierarchy improvements
> 
> **Estimated Effort**: Medium-Large
> **Parallel Execution**: YES - multiple waves
> **Critical Path**: Card redesign → Badges → Multi-select → Mobile → Integration

---

## Context

### Original Request
Redesign the import card section UI with ALL components:
- A) Visual polish — Premium/professional look (brighter hover, better spacing, richer states)
- B) Layout change — Different grid structure, card sizes, information hierarchy
- C) Add selection flow — More sophisticated selection with multi-select, compare mode
- D) Add platform badges — Category indicators like BlogCard has
- E) Improve mobile — Better mobile experience beyond bottom sheet

### Research Findings
- Current UI: `import-type-selection.tsx` + `platform-card.tsx` + `platforms.tsx`
- Uses CardV2 with default/elevated variants (lines 45-57 in platform-card.tsx)
- V2 semantic tokens (`v2-*` prefix)
- Two-panel layout: `grid lg:grid-cols-[1fr_380px]`
- Responsive grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`
- Selection state: `border-v2-accent` + checkmark indicator
- Hover: `y: -2` translate + logo scale + border brightening
- Animation: Framer Motion with `useReducedMotion()` support

### Comparison Patterns (from codebase)
- **FirmCard**: KPI rows, progress bars, top accent line on hover
- **BlogCard**: Image scale on hover, category badges with colors, gradient accents
- **DealCard**: `-translate-y-0.5` hover, border primary/25, stat pills inside
- **Common**: gap-4 grid, p-4 internal padding, rounded-2xl/3xl

---

## Work Objectives

### Core Objective
Transform the import card section from functional to premium while adding multi-select comparison functionality.

### Concrete Deliverables
1. **PlatformCard Redesign** (`platform-card.tsx`)
   - Premium visual states (hover, selected, disabled)
   - Category badges inline
   - Enhanced shadow/elevation

2. **Multi-Select Flow** (`import-type-selection.tsx`)
   - Checkbox selection for compare mode
   - "Compare Selected" action
   - Comparison view panel

3. **Layout Improvements** (`import-type-selection.tsx`)
   - New grid structure options
   - Card size variants
   - Visual hierarchy changes

4. **Mobile Experience** (`import-type-selection.tsx`)
   - Better touch targets
   - Swipe gestures consideration
   - Optimized bottom sheet

5. **Platform Badges** (`platforms.tsx` + `platform-card.tsx`)
   - Category indicator badges
   - Color-coded by type
   - Maintenance/coming soon badges (already exist, enhance)

### Definition of Done
- [ ] PlatformCard renders with premium styling
- [ ] Multi-select mode functional
- [ ] Category badges display correctly
- [ ] Mobile layout optimized
- [ ] All existing functionality preserved
- [ ] Build passes, no type errors
- [ ] Manual QA passes

### Must Have
- Preserve all existing import platform integrations (15+ platforms)
- Maintain i18n support
- Backward compatible with existing configs
- Accessibility maintained (keyboard nav, ARIA)

### Must NOT Have
- Breaking changes to platform config structure
- Loss of existing animations/transitions
- Hardcoded colors (must use design tokens)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (vitest)
- **Automated tests**: NO (new feature, will verify via QA)
- **Framework**: N/A

### QA Scenarios (MANDATORY per task)

**Every task includes agent-executed QA scenarios:**

1. **PlatformCard Rendering**:
   - Tool: Playwright 
   - Navigate to import page
   - Verify all platform cards render
   - Verify hover effects work

2. **Multi-Select Mode**:
   - Tool: Playwright
   - Enable multi-select mode
   - Select 2+ platforms
   - Verify compare button appears

3. **Category Badges**:
   - Tool: Playwright
   - Verify badges display on cards
   - Verify badge colors match category

4. **Mobile Layout**:
   - Tool: Playwright (mobile viewport)
   - Verify grid collapses to single column
   - Verify bottom sheet works

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - can start immediately):
├── Task 1: Analyze FirmCard/BlogCard premium patterns
├── Task 2: Define new PlatformCard design tokens
└── Task 3: Update CardV2 variant usage

Wave 2 (Card Redesign - after Wave 1):
├── Task 4: Implement premium hover states
├── Task 5: Add category badge component
├── Task 6: Enhance selection indicator
└── Task 7: Add shadow/elevation variants

Wave 3 (Multi-Select - after Wave 2):
├── Task 8: Add checkbox selection UI
├── Task 9: Implement compare mode state
├── Task 10: Create comparison panel
└── Task 11: Add compare action button

Wave 4 (Layout + Mobile - after Wave 2):
├── Task 12: Optimize grid breakpoints
├── Task 13: Improve mobile touch targets
├── Task 14: Enhance mobile sheet
└── Task 15: Add responsive transitions

Wave 5 (Integration):
├── Task 16: Integrate all components
├── Task 17: Test full flow
└── Task 18: Verify build + types
```

### Dependency Matrix

- **Tasks 1-3**: Foundation - no dependencies (can start immediately)
- **Tasks 4-7**: Depend on Wave 1 (design tokens defined)
- **Tasks 8-11**: Depend on Wave 2 (card redesign complete)
- **Tasks 12-15**: Can run in parallel with Wave 3
- **Tasks 16-18**: Depend on all previous waves

---

## TODOs

### Wave 1: Foundation

- [x] 1. Analyze premium card patterns from FirmCard/BlogCard/DealCard

  **What to do**: Review existing code patterns in:
  - `app/[locale]/(landing)/propfirms/components/firm-card.tsx`
  - `app/[locale]/(landing)/blogs/components/blog-card.tsx`
  - `app/[locale]/(landing)/deals/components/deals-experience.tsx`
  
  Document specific styling: gradients, shadows, hover effects, accent lines

  **QA Scenarios**:
  - Review code patterns documented

- [x] 2. Define new PlatformCard design tokens

  **What to do**: Create design spec for:
  - Premium hover state (shadow, border, translate)
  - Selection state enhancements
  - Badge colors per category
  - Use existing V2 tokens where possible

  **QA Scenarios**:
  - Design spec document created

- [x] 3. Update CardV2 variant usage

  **What to do**: 
  - Review `platform-card.tsx` lines 45-57
  - Determine if current CardV2 usage sufficient or needs custom styling
  - May need to add custom className overrides for premium look

  **QA Scenarios**:
  - Current component code reviewed

### Wave 2: Card Redesign

- [x] 4. Implement premium hover states

  **What to do**: Update platform-card.tsx with:
  - Enhanced hover: `y: -4` (steeper lift)
  - Border brightening to `border-v2-accent` (not just /30)
  - Shadow enhancement: `shadow-lg shadow-v2-accent/20`
  - Logo scale: already `scale-110`, ensure smooth

  **File**: `app/[locale]/dashboard/components/import/components/platform-card.tsx`
  **Lines**: 39-40, 52-53, 74

  **QA Scenarios**:
  - Playwright: hover over card, verify lift + shadow

- [x] 5. Add category badge component

  **What to do**: Add inline badges to PlatformCard:
  - Use BadgeV2 component
  - Color by category:
    - Direct Account Sync: accent color
    - Intelligent Import: info color  
    - Platform CSV Import: success color
    - Manual Entry: secondary color
  - Position: below description, above mt-auto

  **Files**: 
  - `platform-card.tsx` (add badge)
  - `platforms.tsx` (add category property if needed)

  **QA Scenarios**:
  - Playwright: verify badges display, colors match category

- [x] 6. Enhance selection indicator

  **What to do**: Improve checkmark design:
  - Larger indicator (current 20px, increase to 24px)
  - Add subtle glow effect
  - Smooth transition on select

  **File**: `platform-card.tsx` lines 59-71

  **QA Scenarios**:
  - Playwright: select platform, verify enhanced indicator

- [x] 7. Add shadow/elevation variants

  **What to do**: Add premium shadow variants:
  - Default: subtle shadow
  - Hover: elevated shadow + accent glow
  - Selected: strongest shadow + accent border

  **QA Scenarios**:
  - Visual verification of shadow states

### Wave 3: Multi-Select

- [x] 8. Add checkbox selection UI

  **What to do**: Add checkbox to PlatformCard:
  - Position: top-left of card (opposite selection indicator)
  - Only visible in multi-select mode
  - Accessible: keyboard navigable
  - State: checked/unchecked/indeterminate

  **File**: `platform-card.tsx` (add checkbox)
  **File**: `import-type-selection.tsx` (add mode toggle)

  **QA Scenarios**:
  - Playwright: enable multi-select, verify checkboxes appear

- [x] 9. Implement compare mode state

  **What to do**: Add state management:
  - `selectedPlatforms: string[]` in import-type-selection.tsx
  - Toggle button to enter/exit compare mode
  - Max 3-4 platforms for comparison

  **File**: `import-type-selection.tsx`

  **QA Scenarios**:
  - Playwright: toggle compare mode, verify state changes

- [x] 10. Create comparison panel

  **What to do**: Build comparison view:
  - Side-by-side platform details
  - Highlight differences
  - "Select & Continue" action per platform
  - Close comparison button

  **File**: `import-type-selection.tsx` (right panel becomes comparison)

  **QA Scenarios**:
  - Playwright: select 2+ platforms, view comparison panel

- [x] 11. Add compare action button

  **What to do**: Add floating action bar:
  - Appears when 2+ platforms selected
  - Shows selection count
  - "Compare" primary button
  - "Clear Selection" secondary button

  **QA Scenarios**:
  - Playwright: select platforms, verify action bar appears

### Wave 4: Layout + Mobile

- [x] 12. Optimize grid breakpoints

  **What to do**: Review and improve grid:
  - Current: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`
  - Consider: `md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4` for wider screens
  - Adjust card aspect ratios for different sizes

  **File**: `import-type-selection.tsx` line 140

  **QA Scenarios**:
  - Playwright: test at multiple viewports

- [x] 13. Improve mobile touch targets

  **What to do**: Ensure accessibility:
  - Minimum 44x44px touch targets
  - Increase card padding on mobile
  - Larger checkbox/tap areas
  - Increase category tab touch area

  **QA Scenarios**:
  - Manual: test on mobile device or responsive mode

- [x] 14. Enhance mobile sheet

  **What to do**: Improve bottom sheet:
  - Better drag handle
  - Snap points (half, full)
  - Smooth animations
  - Keyboard avoidance
  - Increase height if needed

  **File**: `import-type-selection.tsx` lines 217-234

  **QA Scenarios**:
  - Playwright: open sheet on mobile, verify smooth interaction

- [x] 15. Add responsive transitions

  **What to do**: Add layout transition animations:
  - Grid reorganizes smoothly on resize
  - Detail panel slides in/out
  - Mobile/desktop switch animated

  **QA Scenarios**:
  - Resize browser, verify smooth transitions

### Wave 5: Integration

- [x] 16. Integrate all components

  **What to do**: Ensure all changes work together:
  - Multi-select works with badges
  - Mobile optimized with new states
  - Compare mode with premium cards
  - No conflicts between features

  **QA Scenarios**:
  - Full flow test: select → compare → proceed

- [x] 17. Test full import flow

  **What to do**: End-to-end verification:
  - Select platform → upload → map → import still works
  - Multi-select doesn't break single-select flow
  - All 15+ platforms still functional

  **QA Scenarios**:
  - Playwright: complete import flow

- [x] 18. Verify build + types

  **What to do**: Run verification:
  - `npm run build` - must pass
  - `npm run typecheck` - no errors
  - ESLint clean

  **QA Scenarios**:
  - Run commands, verify no errors

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking platform config | Low | High | Test with existing configs, no schema changes |
| Animation performance | Medium | Low | Use `useReducedMotion()`, optimize with CSS |
| Multi-select UX confusion | Medium | Medium | Clear mode toggle, tooltip guidance |
| Mobile touch issues | Medium | Medium | Test on real devices, minimum sizes |
| Build regression | Low | High | Run full build before merge |

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Must pass without errors
npm run typecheck      # No TypeScript errors  
npm run lint           # ESLint clean
```

### Final Checklist
- [ ] All 5 components (A-E) implemented
- [ ] Premium visual styling applied
- [ ] Multi-select functional
- [ ] Category badges display
- [ ] Mobile experience improved
- [ ] Build passes
- [ ] Manual QA verified

---

## Design Reference

### Visual Style Targets

**Hover State** (from FirmCard pattern):
```css
translate-y: -4px
border-color: border-v2-accent
shadow-lg shadow-v2-accent/20
```

**Selection Indicator** (enhanced):
```css
size: 24px (from 20px)
glow: box-shadow with accent
transition: 200ms ease
```

**Category Badge Colors** (from BlogCard pattern):
```css
Direct Account Sync: text-v2-accent
Intelligent Import: text-v2-info  
Platform CSV Import: text-v2-success
Manual Entry: text-v2-secondary
```

### Key File References

| File | Purpose | Key Lines |
|------|---------|-----------|
| `import-type-selection.tsx` | Main container | 94-237 |
| `platform-card.tsx` | Card component | 45-57, 59-71 |
| `platforms.tsx` | Platform config | Full file |

---

## Implementation Notes

1. **Incremental Approach**: Build Wave by Wave to catch issues early
2. **Preserve Existing**: Don't break current import functionality
3. **Use Design Tokens**: All colors/spacing via V2 tokens, no hardcoded values
4. **Accessibility First**: Maintain keyboard navigation, ARIA labels
5. **Mobile-First Consideration**: Design for mobile, enhance for desktop
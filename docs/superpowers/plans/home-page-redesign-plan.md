# Qunt Edge Home Page Redesign - Implementation Plan

## Context
**User Request**: Complete home page redesign with "Precision Terminal" design direction

## Wave 1 (Parallel - No Dependencies)
1. CSS Animation System - @keyframes scan, fadeUp, stagger + hover states
2. Design Tokens Update - Precision Terminal color palette
12. i18n Translations - EN/FR keys for new sections

## Wave 2 (After Wave 1)
3. Navigation Component - Fixed header with mobile drawer
4. DashboardPreview Component - Animated mock with scanner
6. TrustStrip Component - Security badges + broker logos
9. FinalCTA Component - Bottom CTA with glow
10. Footer Update - Refreshed footer

## Wave 3 (After Wave 2)
5. Hero Redesign - Updated Hero.tsx
7. Features Bento Grid - New grid layout
8. PricingSection Refresh - Updated pricing cards

## Wave 4 (Final)
11. HomeContent Assembly - Compose all sections
13. Testing & Verification - Typecheck, lint, build, visual QA

## Critical Path
Task 1 → Task 4 → Task 5 → Task 11 → Task 13

## Success Criteria
- Build succeeds
- Typecheck passes
- Lighthouse > 90
- WCAG AA compliant

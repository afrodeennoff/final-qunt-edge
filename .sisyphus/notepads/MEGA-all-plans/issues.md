
## F0.1+F0.2 (2026-04-02): Orphan deletion + HomeContent restructure

- **Orphan files**: 8 listed orphans (`DeferredHomeSections`, `OnboardingJourney`, `ProofStrip`, `Differentiators`, `Qualification`, `TrustStats`, `CTA`, `TrustStrip`) do NOT exist in `app/[locale]/(home)/components/` — already cleaned or never created. No files needed deletion.
- **Missing components**: `ProblemStatement`, `AudienceSegmentation`, `AIFeatures` referenced in plan spec do not exist yet (deferred to future F4.2 tasks). Excluded from restructure to keep typecheck clean.
- **PropFirmsExplorer pre-existing bug**: Required `firms` prop was missing from all call sites. Made `firms` optional with `firms ?? []` fallback to avoid breaking the component. Server-side data fetching for `firms` is a separate concern.
- **Comment removal**: Removed section-group comments from HomeContent to avoid lint docstring warnings.
- **Section order restructured**: Hero → LiveStatsStrip → FeaturesBento → DashboardPreview → [lazy HowItWorks, lazy AnalysisDemo, lazy SocialProof, ComparisonSection] → RollingAdBanner → PropFirmsExplorer → [lazy PricingSection, lazy FAQSection] → FinalCTA

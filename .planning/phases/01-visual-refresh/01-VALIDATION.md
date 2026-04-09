---
phase: 01
slug: visual-refresh
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-09
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose 2>&1 \| head -80` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose 2>&1 | head -80`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | REQ-VISUAL-001 | — | CSS tokens load without errors | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | REQ-VISUAL-002 | — | Pattern components render | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | REQ-VISUAL-003 | — | Dashboard pages render with StyleSeed | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 3 | REQ-VISUAL-004 | — | No hardcoded colors in sweep | lint | `npx eslint app/ components/` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 3 | REQ-VISUAL-005 | — | Build passes with zero errors | build | `npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/visual/tokens.test.ts` — stubs for REQ-VISUAL-001 (CSS token values)
- [ ] `tests/visual/patterns.test.tsx` — stubs for REQ-VISUAL-002 (pattern component render)
- [ ] Existing vitest infrastructure covers basic test execution

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual polish matches Resend/Expo quality | REQ-VISUAL-005 | Subjective visual quality | Compare landing pages against reference screenshots |
| Hero dark theme consistency | REQ-VISUAL-002 | Visual appearance | Navigate to / and verify hero uses dark theme |
| Animation fluidity | REQ-VISUAL-003 | Perceptual quality | Interact with dashboard, verify spring animations feel smooth |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

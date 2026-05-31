# Daily Journal Refinement - Add Missing Features (No Visual UI Changes)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all missing functionality (optimized screenshots, rich tag templates, full daily reflection capabilities, better data connections) to the existing Daily Journal / Daily Review page without making any visual or layout changes to the UI.

**Architecture:** Extend existing daily journal/mindset infrastructure (server/journal.ts, current mood/journal models) with Supabase Storage for images (reusing trade-images patterns), a server-persisted tag template system, and richer attachment support for daily reflections and per-trade notes. All new capabilities are exposed through the exact same UI elements that already exist.

**Tech Stack:** Next.js App Router, Prisma, Supabase (Storage + client), TypeScript, existing rich text editor (Tiptap or equivalent already in the Notes area), React hooks.

---

## File Mapping (Before Tasks)

### Existing Key Files (Will Modify)
- `server/journal.ts` — Core daily mindset/mood/journal logic
- `app/[locale]/dashboard/notes/` (and related daily review components) — The UI containers for the daily view and per-trade modal (logic only)
- `lib/` (various hooks and utils for journal/mood)
- Prisma schema (minor extensions if needed for attachments/tags)

### New Files (Minimal)
- `components/journal/daily-attachment.tsx` (or reuse existing) — Logic for screenshots + tags in daily sections (non-visual)
- `hooks/use-daily-journal.ts` (extend if exists) — State and sync for rich daily reflections
- `docs/` updates if needed

### Never Touch (Visual / Out of Scope)
- Any CSS, Tailwind classes, component JSX structure that would change appearance
- Layout or positioning of Mental State, Daily Goals, Market Bias, Rate Your Day, Notes editor, weekly strip, trade table, or modal

---

### Task 1: Add Optimized Screenshot Support to Daily Journal

**Goal:** Allow multiple compressed images in Notes and daily reflection sections using existing Supabase infrastructure.

**Files:**
- Modify: `server/journal.ts` (extend save functions to accept attachments)
- Create: `lib/journal-attachments.ts` (compression + upload helpers)
- Modify: existing daily journal components (logic only for attaching images)

- [ ] **Step 2.1: Create compression + upload helper**

```typescript
// lib/journal-attachments.ts
import { useHashUpload } from '@/hooks/use-hash-upload'

export async function compressAndUploadJournalImage(file: File, userId: string) {
  // Resize to max 1200px, JPEG 80 quality using canvas or sharp on server if needed
  // Then call existing upload pattern to trade-images bucket under journal-screenshots/
}
```

- [ ] **Step 2.2: Extend daily journal save functions in server/journal.ts**

Add support for `screenshots?: string[]` on mindset/mood/journal entries.

- [ ] **Step 2.3: Update data model if needed (add screenshots array to relevant tables)**

- [ ] **Step 2.4: Wire upload in the existing Notes editor logic (inside per-trade modal and daily sections)**

Only the upload call and state update — no JSX changes.

---

### Task 2: Enable Rich Content in Daily Reflection Sections

**Goal:** Mental State, Daily Goals, Market Bias, and Rate Your Day can hold screenshots + tags.

**Files:**
- Modify: server/journal.ts (saveMentalState, saveDailyGoals, etc. to accept attachments + tags)
- Modify: the state/hooks that feed the daily view (logic only)

- [ ] **Step 3.1: Extend save functions for the four sections to accept screenshots and tags**

- [ ] **Step 3.2: Update fetch functions to return the new fields**

- [ ] **Step 3.3: Connect to the existing UI containers (pass data down, handle save callbacks)**

Zero visual changes.

---

### Task 3: Complete Per-Trade Notes in Modal

**Goal:** The Notes area in the per-trade modal (shown in screenshot 3) supports full screenshots + rich tags.

**Files:**
- Modify: components that render the per-trade modal Notes editor (logic + data passing only)

- [ ] **Step 4.1: Connect the modal Notes editor to the new attachment and tag system**

- [ ] **Step 4.2: Ensure saves go to both daily journal and main Trade Journal where appropriate**

- [ ] **Step 4.3: Test persistence round-trip**

---

### Task 4: Improve Weekly Strip and Daily Aggregation

**Goal:** The top calendar and daily metrics better reflect journaled data (tags, whether journaled, etc.).

**Files:**
- Modify: server/journal.ts (add aggregation queries)
- Modify: the component that renders the weekly strip and daily header (data layer only)

- [ ] **Step 5.1: Add server function to get daily journal summary (tags used, hasJournal, etc.)**

- [ ] **Step 5.2: Wire it into the existing weekly/daily view data fetching**

- [ ] **Step 5.3: Enable weekday auto-tagging on load/save of a day**

---

### Task 5: Default Settings Inheritance + Polish

**Goal:** New daily entries inherit sensible defaults.

- [ ] **Step 6.1: Read user preferences on daily journal creation**

- [ ] **Step 6.2: Apply default tags/categories when creating new reflections**

---

### Task 6: Verification & Testing

- [ ] Write integration tests for new attachment and tag flows
- [ ] Manual test: add screenshots in modal and daily sections
- [ ] Manual test: use rich tags in all relevant places
- [ ] Verify no visual regression (compare against original screenshots)
- [ ] Commit frequently

---

**Plan complete.**

Plan saved to `docs/superpowers/plans/2026-05-31-daily-journal-refinement.md`

**Execution options:**

1. **Subagent-Driven (recommended)** — Fresh subagent per task with review between tasks.
2. **Inline Execution** — Execute in this session with checkpoints.

Which approach do you want? (Reply with 1 or 2)
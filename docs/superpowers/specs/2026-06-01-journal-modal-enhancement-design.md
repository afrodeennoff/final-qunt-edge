# Journal Page Enhancement — Design Spec

**Goal:** Enhance the trade journal modal to match `legion-vault.html` design, add HTF/MTF/LTF multi-timeframe analysis, add Aisha London tags (defined via Settings), and add a TipTap rich notes editor.

**Prerequisite:** Track B (Statistics page visual alignment with HTML) — completed.

## 1. Scope

No backend data restructuring — all new features store data in or alongside the existing `customTags[]` string array, except the TipTap rich notes editor which needs a new `richNotes` DB field.

## 2. Trade Modal Changes

### 2.1 Session / Timeframe / ICT Concepts

Replace current TagInput-only approach with **chip buttons + free text input**:

- **Session chips:** London, NY, Asia — single-select (click selects, click again deselects). Free-text TagInput below for custom session values.
- **Timeframe chips:** 5m, 15m, 30m, 1H, 4H, Daily — single-select. Free-text TagInput below.
- **ICT Concepts chips:** OB, FVG, Liq Sweep, Breaker, MSS, ChoCh — multi-select (users can toggle any combination). Free-text TagInput below.

All tags stored in `customTags[]` (existing behavior unchanged).

### 2.2 HTF / MTF / LTF (Multi-Timeframe Analysis)

Three separate free-text input fields placed as a new section below ICT Concepts:

- Label: "Multi-Timeframe Analysis"
- Three rows: HTF, MTF, LTF — each with a single-line text input
- User types concepts like "OB", "FVG", "IFVG", "Daily Bias", or any custom text
- Stored as prefixed tags in `customTags[]`: e.g. `htf:OB`, `mtf:FVG`, `ltf:IFVG`

### 2.3 Aisha London Tags

Designed as user-configurable tag templates defined in a Settings page (separate from the modal):

1. **Settings page** (new route: `/dashboard/settings/tags`):
   - CRUD for tag categories (name + predefined tags list per category)
   - Stored in `localStorage` initially (can migrate to DB later)
   - e.g. "Aisha London" category with tags like "Silver Bullet", "Killzone", "Macro", etc.

2. **Modal integration:**
   - Reads the configured tag categories from localStorage
   - Each category renders as a section with chip buttons + free-text TagInput
   - Tags stored in `customTags[]` with a category prefix: `aisha:Silver Bullet`

### 2.4 Rich Notes Editor

- Add a new section below the existing Pre/Post textarea grid
- Label: "Notes"
- Uses TipTap (`@tiptap/react` + `@tiptap/starter-kit`) with toolbar: bold, italic, heading, bullet list, ordered list, code, blockquote
- Stores rich HTML in a new `richNotes` field on `JournalEntry` (Prisma `String?` field)
- Requires DB migration (`ALTER TABLE journal_entry ADD COLUMN rich_notes TEXT`)

### 2.5 New Trade Entry

No changes needed — the instrument + side form at the top of the modal already works. Chips, TagInputs, HTF/MTF/LTF, and rich notes will all be available during new trade creation too.

## 3. Data Model

### 3.1 Prisma Changes

```prisma
model JournalEntry {
  // existing fields unchanged
  richNotes   String?  @map("rich_notes")

  @@map("journal_entry")
}
```

### 3.2 TypeScript Changes (`journal-types.ts`)

```typescript
export interface JournalEntry {
  // existing fields unchanged
  richNotes: string | null
}

export interface CreateJournalInput {
  // existing fields unchanged
  richNotes?: string
}

export type UpdateJournalInput = Partial<Omit<CreateJournalInput, 'tradeId' | 'accountNumber'>>
```

### 3.3 Tag Storage Convention

All tags stored in `customTags[]` follow this convention:

| Category | Format | Example |
|----------|--------|---------|
| Session | raw value | `London` |
| Timeframe | raw value | `5m` |
| ICT Concept | raw value | `OB` |
| HTF | `htf:<value>` | `htf:OB` |
| MTF | `mtf:<value>` | `mtf:FVG` |
| LTF | `ltf:<value>` | `ltf:IFVG` |
| Aisha London | `aisha:<value>` | `aisha:Silver Bullet` |
| Custom | raw value | `patience` |

Prefixes are only for HTF/MTF/LTF and Aisha London tags. Session/timeframe/ICT use raw values (backward compatible with existing data).

## 4. API Changes

None needed — the existing `createEntry`/`updateEntry` in `use-journal.ts` already accepts `customTags` and arbitrary fields via the `additionalData` pattern.

The new `richNotes` field will be passed through existing API endpoints:

- `POST /api/dashboard/journal` (already forwards extra fields)
- `PUT /api/dashboard/journal/:id` (already forwards extra fields)

Server action `saveJournal`/`updateJournal` in `server/journal.ts` needs minor update to include `richNotes`.

## 5. Settings Page (Aisha London Tags)

New route: `/dashboard/settings/tags`

Features:
- List of tag categories (name + tags array)
- Add new category (name + comma-separated tags)
- Edit / Delete existing categories
- All stored in `localStorage` key: `journal-tag-templates`

Data structure:
```typescript
interface TagCategory {
  id: string
  name: string
  tags: string[]
}
```

This can be migrated to DB later. For now, localStorage is sufficient — user controls when they want to set up tags.

## 6. Component Architecture

### New components

| Component | File | Purpose |
|-----------|------|---------|
| `ChipSelector` | `components/chip-selector.tsx` | Reusable row of chip buttons + optional free-text TagInput. Takes `options: string[]`, `selected: string[]`, `onChange`. Supports single/multi select mode. |
| `RichTextEditor` | `components/rich-text-editor.tsx` | TipTap wrapper with toolbar. Takes `value: string`, `onChange: (html: string) => void`, `placeholder: string`. |
| `TagSettingsPanel` | `app/[locale]/dashboard/settings/components/tag-settings-panel.tsx` | CRUD UI for tag categories. |

### Modal section ordering

```
Quick Stats (5 cards)
──────────────────
Session           (chip selector + free text)
Timeframe         (chip selector + free text)
ICT Concepts      (chip selector + free text)
Multi-Timeframe   (HTF / MTF / LTF text inputs)
Aisha London      (chip selector per category, from settings)
Emotion           (chips)
Execution Rating  (stars)
Pre-Trade Notes   (textarea)
Post-Trade Review (textarea)
Notes             (TipTap rich editor)
Screenshots       (grid)
```

## 7. Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `richNotes` String? field |
| `app/[locale]/dashboard/notes/lib/journal-types.ts` | Add `richNotes` to interfaces |
| `app/[locale]/dashboard/notes/lib/use-journal.ts` | Pass `richNotes` through create/update |
| `server/journal.ts` | Include `richNotes` in save/update |
| `app/[locale]/dashboard/notes/journal-client.tsx` | Replace simple TagInputs with ChipSelector for session/timeframe/ict, add HTF/MTF/LTF section, add Aisha London sections, add TipsTap Notes editor |
| `app/[locale]/dashboard/notes/components/chip-selector.tsx` | NEW |
| `app/[locale]/dashboard/notes/components/rich-text-editor.tsx` | NEW |
| `app/[locale]/dashboard/settings/tags/page.tsx` | NEW settings page for tag templates |
| `app/[locale]/dashboard/settings/components/tag-settings-panel.tsx` | NEW |

## 8. Migration

```bash
npx prisma migrate dev --name add-rich-notes
```

## 9. Out of Scope (Future)

- Tag templates DB persistence (currently localStorage)
- AI-powered tag suggestions
- HTF/MTF/LTF analytics in Statistics page
- Notes search across entries

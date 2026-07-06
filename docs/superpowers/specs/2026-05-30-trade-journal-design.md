# Trade Journal — Design Spec

## Overview

Replace the current `/dashboard/notes` page with a trade journal. Each trade from the trades table gets its own journal entry card with reflective fields (pre-trade notes, post-trade review, confidence/discipline ratings, custom tags, emotions). The page feels like a professional trading journal (TraderSync / Edgewonk style), not a generic notes app.

## Decisions

- **Approach:** Inline journal cards — each trade is a collapsible card with trade context in the header and journal fields when expanded
- **Persistence:** Hybrid — localStorage with background sync to server via API route
- **Routing:** Replaces `/dashboard/notes` entirely
- **Journal fields:** All proposed fields included (pre-trade, post-trade, emotions, confidence, discipline, custom tags, screenshots)

## Data Model

### Prisma: `JournalEntry`

```
JournalEntry
  id              String   @id @default(uuid())
  userId          String
  tradeId         String   @unique
  accountNumber   String

  preTradeNotes   String?
  postTradeReview String?
  emotions        String?

  confidenceRating Int?       (1-5)
  disciplineScore  Int?       (1-5)

  customTags      String[] @default([])
  screenshots     String[] @default([])

  pinned          Boolean  @default(false)
  archived        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  trade     Trade   @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  account   Account @relation(fields: [accountNumber, userId], references: [number, userId], onDelete: Cascade)

  @@index([userId])
  @@index([tradeId])
```

One journal entry per trade (`@unique` on `tradeId`). Cascade delete when trade or account is removed.

### Client-side: `TradeJournalCard` composite type

```typescript
interface TradeJournalCard {
  // From Trade
  trade: Trade
  // From JournalEntry (null if not yet created)
  journal: JournalEntry | null
}
```

The page fetches trades and journal entries, joins them on `tradeId`.

## Persistence Strategy (Hybrid)

1. **Read:** On page load, fetch journal entries from `/api/dashboard/journal` (GET). Merge with any unsynced entries in localStorage key `journal-pending:{userId}`.
2. **Write:** Create/update journal entries optimistically in React state. Persist to localStorage immediately. Fire background POST/PUT to `/api/dashboard/journal`. On success, clear localStorage entry. On failure, keep buffered and retry.
3. **Delete:** DELETE to `/api/dashboard/journal/[id]`. Remove from state immediately.
4. **Conflict resolution:** Server is source of truth. On merge, server data wins if both exist. localStorage entries without a server counterpart get pushed up.

## Page Layout

```
+------------------------------------------------------------------+
|  Header: "Trade Journal"  |  Search  |  Filters  |  Sort        |
+------------------------------------------------------------------+
|  Stats bar: Total trades | Journaled | Win rate | Avg confidence|
+------------------------------------------------------------------+
|                                                                    |
|  [Trade Card #1]  ─── collapsed ───                                |
|  ES  LONG  +$340  2m 15s  |  3 tags  |  ★★★★☆  |  12:30 PM     |
|                                                                    |
|  [Trade Card #2]  ─── expanded ───                                 |
|  ┌─────────────────────────────────────────────────────────────┐  |
|  │  NQ  SHORT  -$120  45s  |  2 tags  |  ★★☆☆☆  |  12:45 PM  │  |
|  ├─────────────────────────────────────────────────────────────┤  |
|  │  Pre-trade: "Saw rejection at 18,500 resistance..."        │  |
|  │  Post-trade: "Stopped out too early, should have..."        │  |
|  │  Emotions: "Anxious after previous loss"                    │  |
|  │  Tags: [revenge trade] [FOMO] [+ Add tag]                   │  |
|  │  Confidence: ★★☆☆☆   Discipline: ★★★☆☆                    │  |
|  │  Screenshots: [img1] [+ Add]                                │  |
|  └─────────────────────────────────────────────────────────────┘  |
|                                                                    |
|  [Trade Card #3]  ─── collapsed ───                                |
|  ...                                                               |
|                                                                    |
+------------------------------------------------------------------+
|  Pagination: < 1 2 3 ... 12 >                                     |
+------------------------------------------------------------------+
```

### Card Header (always visible)

- Instrument + direction badge (LONG green, SHORT red)
- PnL (color-coded green/red)
- Time in position
- Custom tag pills (first 2-3)
- Confidence rating stars (if rated)
- Entry time
- Expand/collapse chevron

### Card Body (when expanded)

- **Trade context row:** Entry/exit price, quantity, commission, account — read-only, from the trade
- **Pre-trade notes:** Textarea — "Why did you enter this trade?"
- **Post-trade review:** Textarea — "What went well? What would you change?"
- **Emotions:** Textarea — "How were you feeling?"
- **Custom tags:** Pill input with autocomplete from previously used tags
- **Ratings:** Confidence (1-5 stars) + Discipline (1-5 stars), side by side
- **Screenshots:** Thumbnail grid with add button

### Stats Bar

- Total trades in view
- Trades with journal entries (X/Y journaled)
- Win rate of displayed trades
- Average confidence rating

### Search & Filtering

- **Text search:** Searches across pre-trade notes, post-trade review, emotions, instrument, custom tags
- **Filters:**
  - Status: All / Journaled / Not journaled
  - PnL: Winners / Losers / Breakeven
  - Custom tags (multi-select from used tags)
  - Confidence range (min-max slider)
  - Date range
  - Instrument
  - Direction (Long/Short)
- **Sort:** Date (newest/oldest), PnL (high/low), Confidence (high/low), Time in position

## File Structure

### Deleted / Replaced
- `app/[locale]/dashboard/notes/` — entire directory replaced

### New Files
```
app/[locale]/dashboard/notes/
  page.tsx                          — Server component, fetches trades + journal entries
  journal-client.tsx                — "use client", main layout + state management
  components/
    journal-card.tsx                — Single trade journal card (header + expandable body)
    journal-card-header.tsx         — Collapsed card header
    journal-card-body.tsx           — Expanded card body with all journal fields
    journal-stats-bar.tsx           — Stats summary bar
    journal-search-bar.tsx          — Search input + filter dropdowns
    journal-filters.tsx             — Filter panel (status, PnL, tags, date, etc.)
    rating-stars.tsx                — Reusable 1-5 star rating component
    tag-input.tsx                   — Tag pill input with autocomplete
    screenshot-grid.tsx             — Screenshot thumbnail grid with upload
  lib/
    use-journal.ts                  — Journal state management hook (CRUD + sync)
    journal-types.ts                — TypeScript types for journal entries
    journal-constants.ts            — Filter/sort defaults, tag suggestions

server/journal.ts                   — Server actions for journal CRUD
app/api/dashboard/journal/
  route.ts                          — GET (list) + POST (create)
  [id]/route.ts                     — PUT (update) + DELETE
```

### Modified
- `prisma/schema.prisma` — add `JournalEntry` model + relations on `Trade` and `Account`
- `app/[locale]/dashboard/components/sidebar.tsx` — rename "Notes" label to "Journal" if needed

## API Routes

### `GET /api/dashboard/journal`
- Query params: `page`, `pageSize`, `search`, `status`, `pnl`, `tags`, `instrument`, `direction`, `dateFrom`, `dateTo`, `sort`
- Returns: `{ entries: JournalEntry[], trades: Trade[], total: number }`
- Joined with trades on the server side

### `POST /api/dashboard/journal`
- Body: `{ tradeId, preTradeNotes?, postTradeReview?, emotions?, confidenceRating?, disciplineScore?, customTags?, screenshots? }`
- Creates journal entry, returns created entry

### `PUT /api/dashboard/journal/[id]`
- Body: partial journal entry fields
- Updates entry, returns updated entry

### `DELETE /api/dashboard/journal/[id]`
- Deletes journal entry

## Visual Theme

Follows existing dashboard patterns:
- Card surface: `unifiedSectionPanelClassName` (rounded-xl, border, gradient bg, ring)
- Expanded card: slightly elevated with `unifiedInsetPanelClassName` for the body
- PnL colors: `text-semantic-success` / `text-semantic-danger`
- Rating stars: primary color filled, muted-foreground empty
- Tags: `unifiedChipClassName` pills
- Stats bar: `unifiedMetricPanelClassName` cards in a row
- Consistent with existing `border-border/20`, `bg-card/40`, `text-muted-foreground` patterns

## Edge Cases

- **Trade with no journal entry:** Show card header with trade context, "Start journaling" prompt in body
- **Deleted trade:** Journal entry cascade-deleted via Prisma
- **Offline:** Edits buffered in localStorage, synced when back online
- **Large trade counts:** Paginated (50 per page default), virtual scroll if needed
- **Imported trades with no dates:** Show "Unknown date" in header

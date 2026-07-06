# Trade Journal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/dashboard/notes` page with a trade journal where each trade gets its own journal entry card with reflective fields.

**Architecture:** Inline journal cards — each trade is a collapsible card showing trade context in the header and journal fields when expanded. Hybrid persistence (localStorage + background server sync via API routes). New Prisma `JournalEntry` model with one-to-one relation to `Trade`.

**Tech Stack:** Next.js 16 App Router, Prisma, Supabase Auth, React hooks, TanStack patterns, shadcn/ui components, existing unified-page-recipes styling.

---

### Task 1: Prisma Schema — Add JournalEntry Model

**Files:**
- Modify: `prisma/schema.prisma` (add `JournalEntry` model + relations on `Trade` and `Account`)

- [ ] **Step 1: Add JournalEntry model to prisma/schema.prisma**

Add after the `Trade` model (after line ~396):

```prisma
model JournalEntry {
  id              String   @id @unique @default(uuid())
  userId          String
  tradeId         String   @unique
  accountNumber   String

  preTradeNotes   String?
  postTradeReview String?
  emotions        String?

  confidenceRating Int?
  disciplineScore  Int?

  customTags      String[] @default([])
  screenshots     String[] @default([])

  pinned          Boolean  @default(false)
  archived        Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  trade           Trade    @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  account         Account  @relation(fields: [accountNumber, userId], references: [number, userId], onDelete: Cascade)

  @@index([userId])
  @@index([tradeId])
}
```

- [ ] **Step 2: Add relations to Trade model**

Add inside the `Trade` model block (after the existing `account` relation line):

```prisma
  journal         JournalEntry?
```

- [ ] **Step 3: Add relation to Account model**

Add inside the `Account` model block (after the existing `trades Trade[]` line):

```prisma
  journals        JournalEntry[]
```

- [ ] **Step 4: Generate Prisma client**

Run: `npx prisma generate`
Expected: Success, no errors

- [ ] **Step 5: Create migration**

Run: `npx prisma migrate dev --name add-journal-entry`
Expected: Migration created and applied successfully

- [ ] **Step 6: Commit**

```bash
git add prisma/
git commit -m "feat: add JournalEntry Prisma model"
```

---

### Task 2: Journal TypeScript Types

**Files:**
- Create: `app/[locale]/dashboard/notes/lib/journal-types.ts`
- Create: `app/[locale]/dashboard/notes/lib/journal-constants.ts`

- [ ] **Step 1: Create journal-types.ts**

```typescript
export interface JournalEntry {
  id: string
  userId: string
  tradeId: string
  accountNumber: string

  preTradeNotes: string | null
  postTradeReview: string | null
  emotions: string | null

  confidenceRating: number | null
  disciplineScore: number | null

  customTags: string[]
  screenshots: string[]

  pinned: boolean
  archived: boolean

  createdAt: string
  updatedAt: string
}

export interface TradeJournalCard {
  trade: {
    id: string
    instrument: string
    side: string
    entryPrice: number
    closePrice: number
    pnl: number
    commission: number
    quantity: number
    entryDate: string
    closeDate: string
    timeInPosition: number
    tags: string[]
    accountNumber: string
  }
  journal: JournalEntry | null
}

export type JournalStatus = 'all' | 'journaled' | 'not-journaled'
export type JournalPnlFilter = 'all' | 'winners' | 'losers' | 'breakeven'
export type JournalSortField = 'date-desc' | 'date-asc' | 'pnl-desc' | 'pnl-asc' | 'confidence-desc' | 'confidence-asc'

export interface JournalFilters {
  status: JournalStatus
  pnl: JournalPnlFilter
  tags: string[]
  instrument: string | null
  direction: 'all' | 'LONG' | 'SHORT'
  dateFrom: string | null
  dateTo: string | null
  search: string
  sort: JournalSortField
}

export interface JournalStats {
  totalTrades: number
  journaledCount: number
  winRate: number
  avgConfidence: number | null
}

export interface CreateJournalInput {
  tradeId: string
  accountNumber: string
  preTradeNotes?: string
  postTradeReview?: string
  emotions?: string
  confidenceRating?: number
  disciplineScore?: number
  customTags?: string[]
  screenshots?: string[]
}

export type UpdateJournalInput = Partial<Omit<CreateJournalInput, 'tradeId' | 'accountNumber'>>
```

- [ ] **Step 2: Create journal-constants.ts**

```typescript
import type { JournalFilters, JournalSortField } from './journal-types'

export const DEFAULT_FILTERS: JournalFilters = {
  status: 'all',
  pnl: 'all',
  tags: [],
  instrument: null,
  direction: 'all',
  dateFrom: null,
  dateTo: null,
  search: '',
  sort: 'date-desc' as JournalSortField,
}

export const JOURNAL_PAGE_SIZE = 30

export const LOCALSTORAGE_KEY_PREFIX = 'journal-pending'

export const SUGGESTED_TAGS = [
  'FOMO',
  'revenge trade',
  'patience',
  'overtrading',
  'good discipline',
  'plan followed',
  'plan violated',
  'anxious',
  'confident',
  'tilt',
  'boredom trade',
  'news trade',
  'breakout',
  'reversal',
  'trend following',
  'scalp',
  'swing',
]

export const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Below average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/dashboard/notes/lib/journal-types.ts app/[locale]/dashboard/notes/lib/journal-constants.ts
git commit -m "feat: add journal types and constants"
```

---

### Task 3: API Routes — Journal CRUD

**Files:**
- Create: `app/api/dashboard/journal/route.ts`
- Create: `app/api/dashboard/journal/[id]/route.ts`

- [ ] **Step 1: Create the list + create route**

File: `app/api/dashboard/journal/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteClient } from '@/server/auth'
import { withRateLimited, apiSuccess, apiErrorWithId } from '@/lib/api/with-api-route'
import { JOURNAL_PAGE_SIZE } from '@/app/[locale]/dashboard/notes/lib/journal-constants'

export const GET = withRateLimited(async (request: NextRequest) => {
  const requestId = crypto.randomUUID()
  const supabase = createRouteClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiErrorWithId(requestId, 'UNAUTHORIZED', 'Not authenticated', 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'User not found', 404)
  }

  const { searchParams } = request.nextUrl
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.min(JOURNAL_PAGE_SIZE, Number(searchParams.get('pageSize')) || JOURNAL_PAGE_SIZE)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const sort = searchParams.get('sort') || 'date-desc'
  const instrument = searchParams.get('instrument') || ''
  const direction = searchParams.get('direction') || 'all'
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const tagsParam = searchParams.get('tags')

  const where: any = {
    userId: dbUser.id,
  }

  if (instrument) where.instrument = instrument
  if (direction && direction !== 'all') where.side = direction.toUpperCase()
  if (dateFrom || dateTo) {
    where.entryDate = {}
    if (dateFrom) where.entryDate.gte = new Date(dateFrom)
    if (dateTo) where.entryDate.lte = new Date(dateTo)
  }
  if (search) {
    where.OR = [
      { instrument: { contains: search, mode: 'insensitive' } },
      { journal: { preTradeNotes: { contains: search, mode: 'insensitive' } } },
      { journal: { postTradeReview: { contains: search, mode: 'insensitive' } } },
      { journal: { emotions: { contains: search, mode: 'insensitive' } } },
      { journal: { customTags: { has: search } } },
    ]
  }

  if (status === 'journaled') {
    where.journal = { isNot: null }
  } else if (status === 'not-journaled') {
    where.journal = { is: null }
  }

  if (tagsParam) {
    const tags = tagsParam.split(',').filter(Boolean)
    if (tags.length > 0) {
      where.journal = {
        ...(where.journal || {}),
        customTags: { hasEvery: tags },
      }
    }
  }

  const orderBy: any = {}
  switch (sort) {
    case 'date-asc': orderBy.entryDate = 'asc'; break
    case 'pnl-desc': orderBy.pnl = 'desc'; break
    case 'pnl-asc': orderBy.pnl = 'asc'; break
    default: orderBy.entryDate = 'desc'
  }

  const [trades, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: { journal: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trade.count({ where }),
  ])

  return apiSuccess({
    entries: trades.map(t => ({
      trade: {
        id: t.id,
        instrument: t.instrument,
        side: t.side,
        entryPrice: Number(t.entryPrice),
        closePrice: Number(t.closePrice),
        pnl: Number(t.pnl),
        commission: Number(t.commission),
        quantity: Number(t.quantity),
        entryDate: t.entryDate.toISOString(),
        closeDate: t.closeDate?.toISOString() ?? null,
        timeInPosition: Number(t.timeInPosition),
        tags: t.tags,
        accountNumber: t.accountNumber,
      },
      journal: t.journal ? {
        id: t.journal.id,
        userId: t.journal.userId,
        tradeId: t.journal.tradeId,
        accountNumber: t.journal.accountNumber,
        preTradeNotes: t.journal.preTradeNotes,
        postTradeReview: t.journal.postTradeReview,
        emotions: t.journal.emotions,
        confidenceRating: t.journal.confidenceRating,
        disciplineScore: t.journal.disciplineScore,
        customTags: t.journal.customTags,
        screenshots: t.journal.screenshots,
        pinned: t.journal.pinned,
        archived: t.journal.archived,
        createdAt: t.journal.createdAt.toISOString(),
        updatedAt: t.journal.updatedAt.toISOString(),
      } : null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}, {
  rateLimitId: 'journal-list',
  rateLimitMax: 120,
  rateLimitWindow: 60,
  routeName: 'GET /api/dashboard/journal',
})

export const POST = withRateLimited(async (request: NextRequest) => {
  const requestId = crypto.randomUUID()
  const supabase = createRouteClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiErrorWithId(requestId, 'UNAUTHORIZED', 'Not authenticated', 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'User not found', 404)
  }

  const body = await request.json()
  const { tradeId, accountNumber, preTradeNotes, postTradeReview, emotions, confidenceRating, disciplineScore, customTags, screenshots } = body

  if (!tradeId || !accountNumber) {
    return apiErrorWithId(requestId, 'VALIDATION', 'tradeId and accountNumber required', 400)
  }

  const existing = await prisma.journalEntry.findUnique({ where: { tradeId } })
  if (existing) {
    return apiErrorWithId(requestId, 'CONFLICT', 'Journal entry already exists for this trade', 409)
  }

  const entry = await prisma.journalEntry.create({
    data: {
      userId: dbUser.id,
      tradeId,
      accountNumber,
      preTradeNotes: preTradeNotes ?? null,
      postTradeReview: postTradeReview ?? null,
      emotions: emotions ?? null,
      confidenceRating: confidenceRating ?? null,
      disciplineScore: disciplineScore ?? null,
      customTags: customTags ?? [],
      screenshots: screenshots ?? [],
    },
  })

  return apiSuccess({
    id: entry.id,
    userId: entry.userId,
    tradeId: entry.tradeId,
    accountNumber: entry.accountNumber,
    preTradeNotes: entry.preTradeNotes,
    postTradeReview: entry.postTradeReview,
    emotions: entry.emotions,
    confidenceRating: entry.confidenceRating,
    disciplineScore: entry.disciplineScore,
    customTags: entry.customTags,
    screenshots: entry.screenshots,
    pinned: entry.pinned,
    archived: entry.archived,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }, 201)
}, {
  rateLimitId: 'journal-create',
  rateLimitMax: 60,
  rateLimitWindow: 60,
  routeName: 'POST /api/dashboard/journal',
})
```

- [ ] **Step 2: Create the update + delete route**

File: `app/api/dashboard/journal/[id]/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteClient } from '@/server/auth'
import { withRateLimited, apiSuccess, apiErrorWithId } from '@/lib/api/with-api-route'

export const PUT = withRateLimited(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const requestId = crypto.randomUUID()
  const { id } = await params
  const supabase = createRouteClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiErrorWithId(requestId, 'UNAUTHORIZED', 'Not authenticated', 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'User not found', 404)
  }

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: dbUser.id } })
  if (!existing) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'Journal entry not found', 404)
  }

  const body = await request.json()
  const data: Record<string, any> = {}
  const allowedFields = ['preTradeNotes', 'postTradeReview', 'emotions', 'confidenceRating', 'disciplineScore', 'customTags', 'screenshots', 'pinned', 'archived']

  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field]
    }
  }

  if (Object.keys(data).length === 0) {
    return apiErrorWithId(requestId, 'VALIDATION', 'No valid fields to update', 400)
  }

  const updated = await prisma.journalEntry.update({
    where: { id },
    data,
  })

  return apiSuccess({
    id: updated.id,
    userId: updated.userId,
    tradeId: updated.tradeId,
    accountNumber: updated.accountNumber,
    preTradeNotes: updated.preTradeNotes,
    postTradeReview: updated.postTradeReview,
    emotions: updated.emotions,
    confidenceRating: updated.confidenceRating,
    disciplineScore: updated.disciplineScore,
    customTags: updated.customTags,
    screenshots: updated.screenshots,
    pinned: updated.pinned,
    archived: updated.archived,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  })
}, {
  rateLimitId: 'journal-update',
  rateLimitMax: 120,
  rateLimitWindow: 60,
  routeName: 'PUT /api/dashboard/journal/[id]',
})

export const DELETE = withRateLimited(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const requestId = crypto.randomUUID()
  const { id } = await params
  const supabase = createRouteClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return apiErrorWithId(requestId, 'UNAUTHORIZED', 'Not authenticated', 401)
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })

  if (!dbUser) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'User not found', 404)
  }

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: dbUser.id } })
  if (!existing) {
    return apiErrorWithId(requestId, 'NOT_FOUND', 'Journal entry not found', 404)
  }

  await prisma.journalEntry.delete({ where: { id } })

  return apiSuccess({ deleted: true })
}, {
  rateLimitId: 'journal-delete',
  rateLimitMax: 60,
  rateLimitWindow: 60,
  routeName: 'DELETE /api/dashboard/journal/[id]',
})
```

- [ ] **Step 3: Verify build compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors in the new files

- [ ] **Step 4: Commit**

```bash
git add app/api/dashboard/journal/
git commit -m "feat: add journal API routes (CRUD)"
```

---

### Task 4: useJournal Hook — State Management + Sync

**Files:**
- Create: `app/[locale]/dashboard/notes/lib/use-journal.ts`

- [ ] **Step 1: Create the useJournal hook**

```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  TradeJournalCard,
  JournalEntry,
  JournalFilters,
  JournalStats,
  CreateJournalInput,
  UpdateJournalInput,
} from './journal-types'
import { DEFAULT_FILTERS, JOURNAL_PAGE_SIZE, LOCALSTORAGE_KEY_PREFIX } from './journal-constants'

interface UseJournalReturn {
  cards: TradeJournalCard[]
  stats: JournalStats
  filters: JournalFilters
  page: number
  totalPages: number
  isLoading: boolean
  expandedId: string | null
  setFilters: (filters: Partial<JournalFilters>) => void
  setPage: (page: number) => void
  toggleExpand: (tradeId: string) => void
  createEntry: (input: CreateJournalInput) => Promise<JournalEntry>
  updateEntry: (id: string, input: UpdateJournalInput) => Promise<JournalEntry>
  deleteEntry: (id: string) => Promise<void>
}

function getPendingKey(userId: string) {
  return `${LOCALSTORAGE_KEY_PREFIX}:${userId}`
}

function loadPending(userId: string): Map<string, JournalEntry> {
  if (typeof window === 'undefined') return new Map()
  try {
    const raw = localStorage.getItem(getPendingKey(userId))
    if (!raw) return new Map()
    const parsed = JSON.parse(raw) as Record<string, JournalEntry>
    return new Map(Object.entries(parsed))
  } catch {
    return new Map()
  }
}

function savePending(userId: string, pending: Map<string, JournalEntry>) {
  if (typeof window === 'undefined') return
  try {
    const obj = Object.fromEntries(pending)
    localStorage.setItem(getPendingKey(userId), JSON.stringify(obj))
  } catch {}
}

function clearPending(userId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(getPendingKey(userId))
  } catch {}
}

function computeStats(cards: TradeJournalCard[]): JournalStats {
  const totalTrades = cards.length
  const journaledCount = cards.filter(c => c.journal !== null).length
  const winners = cards.filter(c => c.trade.pnl > 0).length
  const winRate = totalTrades > 0 ? (winners / totalTrades) * 100 : 0
  const rated = cards.filter(c => c.journal?.confidenceRating != null)
  const avgConfidence = rated.length > 0
    ? rated.reduce((sum, c) => sum + (c.journal!.confidenceRating!), 0) / rated.length
    : null

  return { totalTrades, journaledCount, winRate, avgConfidence }
}

export function useJournal(userId: string | null): UseJournalReturn {
  const [cards, setCards] = useState<TradeJournalCard[]>([])
  const [stats, setStats] = useState<JournalStats>({ totalTrades: 0, journaledCount: 0, winRate: 0, avgConfidence: null })
  const [filters, setFiltersState] = useState<JournalFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const syncQueueRef = useRef<Map<string, { type: 'create' | 'update', data: any }>>(new Map())
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(JOURNAL_PAGE_SIZE),
        status: filters.status,
        sort: filters.sort,
      })
      if (filters.search) params.set('search', filters.search)
      if (filters.instrument) params.set('instrument', filters.instrument)
      if (filters.direction !== 'all') params.set('direction', filters.direction)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))

      const res = await fetch(`/api/dashboard/journal?${params}`)
      if (!res.ok) throw new Error('Failed to fetch journal')
      const data = await res.json()

      const serverCards: TradeJournalCard[] = data.data.entries

      // Merge with localStorage pending entries
      const pending = loadPending(userId)
      if (pending.size > 0) {
        const merged = serverCards.map(card => {
          const pendingEntry = pending.get(card.trade.id)
          if (pendingEntry) {
            pending.delete(card.trade.id)
            return { ...card, journal: pendingEntry }
          }
          return card
        })

        // Push any pending entries that don't have server counterparts
        for (const [tradeId, entry] of pending) {
          if (!merged.find(c => c.trade.id === tradeId)) {
            // Try to sync this orphaned entry to server
            try {
              await fetch('/api/dashboard/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tradeId: entry.tradeId,
                  accountNumber: entry.accountNumber,
                  ...entry,
                }),
              })
            } catch {}
          }
        }

        clearPending(userId)
        setCards(merged)
        setStats(computeStats(merged))
      } else {
        setCards(serverCards)
        setStats(computeStats(serverCards))
      }

      setTotalPages(data.data.totalPages)
    } catch (err) {
      console.error('Failed to fetch journal:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, page, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const flushSync = useCallback(async () => {
    if (!userId || syncQueueRef.current.size === 0) return
    const batch = new Map(syncQueueRef.current)
    syncQueueRef.current.clear()

    for (const [tradeId, op] of batch) {
      try {
        if (op.type === 'create') {
          await fetch('/api/dashboard/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data),
          })
        } else if (op.type === 'update') {
          await fetch(`/api/dashboard/journal/${op.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data),
          })
        }
      } catch {
        // Re-queue on failure
        syncQueueRef.current.set(tradeId, op)
        // Save to localStorage as fallback
        const pending = loadPending(userId)
        if (op.type === 'update' && op.data.id) {
          pending.set(tradeId, op.data as JournalEntry)
        }
        savePending(userId, pending)
      }
    }
  }, [userId])

  const scheduleSync = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(flushSync, 2000)
  }, [flushSync])

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [])

  const setFilters = useCallback((partial: Partial<JournalFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }))
    setPage(1)
  }, [])

  const toggleExpand = useCallback((tradeId: string) => {
    setExpandedId(prev => prev === tradeId ? null : tradeId)
  }, [])

  const createEntry = useCallback(async (input: CreateJournalInput): Promise<JournalEntry> => {
    const now = new Date().toISOString()
    const optimistic: JournalEntry = {
      id: `temp-${input.tradeId}`,
      userId: userId!,
      tradeId: input.tradeId,
      accountNumber: input.accountNumber,
      preTradeNotes: input.preTradeNotes ?? null,
      postTradeReview: input.postTradeReview ?? null,
      emotions: input.emotions ?? null,
      confidenceRating: input.confidenceRating ?? null,
      disciplineScore: input.disciplineScore ?? null,
      customTags: input.customTags ?? [],
      screenshots: input.screenshots ?? [],
      pinned: false,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }

    // Optimistic update
    setCards(prev => prev.map(card =>
      card.trade.id === input.tradeId
        ? { ...card, journal: optimistic }
        : card
    ))

    // Queue server sync
    syncQueueRef.current.set(input.tradeId, { type: 'create', data: input })
    scheduleSync()

    return optimistic
  }, [userId, scheduleSync])

  const updateEntry = useCallback(async (id: string, input: UpdateJournalInput): Promise<JournalEntry> => {
    // Optimistic update
    setCards(prev => prev.map(card =>
      card.journal?.id === id
        ? {
            ...card,
            journal: { ...card.journal, ...input, updatedAt: new Date().toISOString() } as JournalEntry,
          }
        : card
    ))

    // Queue server sync
    syncQueueRef.current.set(id, { type: 'update', data: { id, ...input } })
    scheduleSync()

    // Return the optimistic entry
    const card = cards.find(c => c.journal?.id === id)
    return { ...card!.journal!, ...input, updatedAt: new Date().toISOString() } as JournalEntry
  }, [cards, scheduleSync])

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setCards(prev => prev.map(card =>
      card.journal?.id === id
        ? { ...card, journal: null }
        : card
    ))

    try {
      await fetch(`/api/dashboard/journal/${id}`, { method: 'DELETE' })
    } catch {}
  }, [])

  return {
    cards, stats, filters, page, totalPages,
    isLoading, expandedId,
    setFilters, setPage, toggleExpand,
    createEntry, updateEntry, deleteEntry,
  }
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit --pretty 2>&1 | grep -i "use-journal" | head -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/dashboard/notes/lib/use-journal.ts
git commit -m "feat: add useJournal hook with hybrid sync"
```

---

### Task 5: UI Components — RatingStars, TagInput, ScreenshotGrid

**Files:**
- Create: `app/[locale]/dashboard/notes/components/rating-stars.tsx`
- Create: `app/[locale]/dashboard/notes/components/tag-input.tsx`
- Create: `app/[locale]/dashboard/notes/components/screenshot-grid.tsx`

- [ ] **Step 1: Create RatingStars component**

```tsx
'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  value: number | null
  onChange?: (value: number | null) => void
  max?: number
  size?: 'sm' | 'md'
  readOnly?: boolean
}

export function RatingStars({ value, onChange, max = 5, size = 'md', readOnly = false }: RatingStarsProps) {
  const iconSize = size === 'sm' ? 14 : 18

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = value != null && i < value
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return
              onChange?.(value === i + 1 ? null : i + 1)
            }}
            className={cn(
              'transition-colors',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
          >
            <Star
              size={iconSize}
              className={cn(
                filled
                  ? 'fill-primary text-primary'
                  : 'fill-transparent text-muted-foreground/30',
              )}
            />
          </button>
        )
      })}
      {value != null && (
        <span className="ml-1 text-[11px] text-muted-foreground">{value}/{max}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create TagInput component**

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedChipClassName } from '@/components/layout/unified-page-recipes'
import { SUGGESTED_TAGS } from '../lib/journal-constants'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = SUGGESTED_TAGS.filter(
    t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)
  )

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [tags, onChange])

  const removeTag = useCallback((tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }, [tags, onChange])

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span
            key={tag}
            className={cn(unifiedChipClassName, 'flex items-center gap-1 text-[11px]')}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault()
                addTag(input)
              }
            }}
            placeholder={placeholder}
            className="h-7 w-40 rounded-md border border-border/30 bg-background/40 px-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => input.trim() && addTag(input)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/30 bg-background/40 text-muted-foreground hover:text-primary"
          >
            <Plus size={12} />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-32 overflow-y-auto rounded-md border border-border/30 bg-card shadow-lg">
            {suggestions.slice(0, 8).map(tag => (
              <button
                key={tag}
                type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  addTag(tag)
                }}
                className="block w-full px-2.5 py-1 text-left text-xs hover:bg-primary/10"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create ScreenshotGrid component**

```tsx
'use client'

import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenshotGridProps {
  screenshots: string[]
  onChange: (screenshots: string[]) => void
}

export function ScreenshotGrid({ screenshots, onChange }: ScreenshotGridProps) {
  const handleAdd = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        const url = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        newUrls.push(url)
      }
      onChange([...screenshots, ...newUrls])
    }
    input.click()
  }

  const remove = (index: number) => {
    onChange(screenshots.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {screenshots.map((src, i) => (
        <div key={i} className="group relative h-16 w-24 overflow-hidden rounded-md border border-border/30">
          <img src={src} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          'flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-border/40',
          'text-muted-foreground/50 hover:border-primary/30 hover:text-primary/60',
        )}
      >
        <ImagePlus size={18} />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/notes/components/rating-stars.tsx app/[locale]/dashboard/notes/components/tag-input.tsx app/[locale]/dashboard/notes/components/screenshot-grid.tsx
git commit -m "feat: add RatingStars, TagInput, ScreenshotGrid components"
```

---

### Task 6: UI Components — JournalCard (Header + Body)

**Files:**
- Create: `app/[locale]/dashboard/notes/components/journal-card-header.tsx`
- Create: `app/[locale]/dashboard/notes/components/journal-card-body.tsx`
- Create: `app/[locale]/dashboard/notes/components/journal-card.tsx`

- [ ] **Step 1: Create JournalCardHeader**

```tsx
'use client'

import { ChevronDown, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedChipClassName } from '@/components/layout/unified-page-recipes'
import { RatingStars } from './rating-stars'
import type { TradeJournalCard } from '../lib/journal-types'

interface JournalCardHeaderProps {
  card: TradeJournalCard
  isExpanded: boolean
  onToggle: () => void
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function JournalCardHeader({ card, isExpanded, onToggle }: JournalCardHeaderProps) {
  const { trade, journal } = card
  const isWin = trade.pnl > 0
  const isLoss = trade.pnl < 0
  const isLong = trade.side?.toUpperCase() === 'LONG'

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-primary/[0.02]',
        isExpanded && 'border-b border-border/15',
      )}
    >
      {/* Instrument */}
      <span className="min-w-[3rem] text-sm font-semibold">{trade.instrument}</span>

      {/* Direction badge */}
      <span
        className={cn(
          'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
          isLong
            ? 'bg-semantic-success/15 text-semantic-success'
            : 'bg-semantic-danger/15 text-semantic-danger',
        )}
      >
        {trade.side || '—'}
      </span>

      {/* PnL */}
      <span
        className={cn(
          'min-w-[4.5rem] text-sm font-semibold tabular-nums',
          isWin ? 'text-semantic-success' : isLoss ? 'text-semantic-danger' : 'text-muted-foreground',
        )}
      >
        {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
      </span>

      {/* Duration */}
      <span className="text-[11px] text-muted-foreground/70 tabular-nums">
        {formatDuration(trade.timeInPosition)}
      </span>

      {/* Tags */}
      {journal?.customTags && journal.customTags.length > 0 && (
        <div className="hidden items-center gap-1 sm:flex">
          {journal.customTags.slice(0, 3).map(tag => (
            <span key={tag} className={cn(unifiedChipClassName, 'text-[10px] px-1.5 py-0')}>
              {tag}
            </span>
          ))}
          {journal.customTags.length > 3 && (
            <span className="text-[10px] text-muted-foreground/50">+{journal.customTags.length - 3}</span>
          )}
        </div>
      )}

      {/* Confidence */}
      <div className="hidden sm:block">
        <RatingStars value={journal?.confidenceRating ?? null} readOnly size="sm" />
      </div>

      {/* Time */}
      <span className="ml-auto text-[11px] text-muted-foreground/60 tabular-nums">
        {formatTime(trade.entryDate)}
      </span>

      {/* Pin indicator */}
      {journal?.pinned && <Pin size={12} className="text-primary/60" />}

      {/* Expand chevron */}
      <ChevronDown
        size={16}
        className={cn(
          'text-muted-foreground/40 transition-transform',
          isExpanded && 'rotate-180',
        )}
      />
    </button>
  )
}
```

- [ ] **Step 2: Create JournalCardBody**

```tsx
'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { RatingStars } from './rating-stars'
import { TagInput } from './tag-input'
import { ScreenshotGrid } from './screenshot-grid'
import type { TradeJournalCard, JournalEntry } from '../lib/journal-types'

interface JournalCardBodyProps {
  card: TradeJournalCard
  onCreateEntry: (tradeId: string, accountNumber: string) => Promise<JournalEntry>
  onUpdateEntry: (id: string, data: Record<string, any>) => Promise<JournalEntry>
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function JournalCardBody({ card, onCreateEntry, onUpdateEntry }: JournalCardBodyProps) {
  const { trade, journal } = card
  const entryId = journal?.id

  const update = useCallback(
    (field: string, value: any) => {
      if (!entryId || entryId.startsWith('temp-')) {
        // Entry not yet persisted server-side, create it first
        onCreateEntry(trade.id, trade.accountNumber)
        return
      }
      onUpdateEntry(entryId, { [field]: value })
    },
    [entryId, trade.id, trade.accountNumber, onCreateEntry, onUpdateEntry],
  )

  const handleCreate = async () => {
    await onCreateEntry(trade.id, trade.accountNumber)
  }

  return (
    <div className="space-y-4 p-4">
      {/* Trade context row (read-only) */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-border/15 bg-muted/30 p-3 sm:grid-cols-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Entry</span>
          <p className="text-xs font-medium tabular-nums">{formatPrice(trade.entryPrice)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Exit</span>
          <p className="text-xs font-medium tabular-nums">{formatPrice(trade.closePrice)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Qty</span>
          <p className="text-xs font-medium tabular-nums">{trade.quantity}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Commission</span>
          <p className="text-xs font-medium tabular-nums">${trade.commission.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Opened</span>
          <p className="text-xs tabular-nums">{formatDate(trade.entryDate)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Closed</span>
          <p className="text-xs tabular-nums">{formatDate(trade.closeDate)}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Account</span>
          <p className="text-xs tabular-nums">{trade.accountNumber}</p>
        </div>
      </div>

      {/* If no journal entry yet, show start prompt */}
      {!journal && (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-sm text-muted-foreground">No journal entry for this trade yet.</p>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20"
          >
            Start journaling
          </button>
        </div>
      )}

      {/* Journal fields */}
      {journal && (
        <div className="space-y-4">
          {/* Pre-trade notes */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Pre-trade notes
            </label>
            <textarea
              value={journal.preTradeNotes ?? ''}
              onChange={e => update('preTradeNotes', e.target.value || null)}
              placeholder="Why did you enter this trade? What setup did you see?"
              rows={2}
              className="w-full resize-none rounded-md border border-border/30 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          {/* Post-trade review */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Post-trade review
            </label>
            <textarea
              value={journal.postTradeReview ?? ''}
              onChange={e => update('postTradeReview', e.target.value || null)}
              placeholder="What went well? What would you change?"
              rows={2}
              className="w-full resize-none rounded-md border border-border/30 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          {/* Emotions */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Emotions
            </label>
            <textarea
              value={journal.emotions ?? ''}
              onChange={e => update('emotions', e.target.value || null)}
              placeholder="How were you feeling during this trade?"
              rows={1}
              className="w-full resize-none rounded-md border border-border/30 bg-background/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:outline-none"
            />
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-6">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Confidence
              </label>
              <RatingStars
                value={journal.confidenceRating}
                onChange={v => update('confidenceRating', v)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Discipline
              </label>
              <RatingStars
                value={journal.disciplineScore}
                onChange={v => update('disciplineScore', v)}
              />
            </div>
          </div>

          {/* Custom tags */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Tags
            </label>
            <TagInput
              tags={journal.customTags}
              onChange={v => update('customTags', v)}
            />
          </div>

          {/* Screenshots */}
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Screenshots
            </label>
            <ScreenshotGrid
              screenshots={journal.screenshots}
              onChange={v => update('screenshots', v)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create JournalCard wrapper**

```tsx
'use client'

import { cn } from '@/lib/utils'
import { unifiedSectionPanelClassName } from '@/components/layout/unified-page-recipes'
import { JournalCardHeader } from './journal-card-header'
import { JournalCardBody } from './journal-card-body'
import type { TradeJournalCard, JournalEntry } from '../lib/journal-types'

interface JournalCardProps {
  card: TradeJournalCard
  isExpanded: boolean
  onToggle: () => void
  onCreateEntry: (tradeId: string, accountNumber: string) => Promise<JournalEntry>
  onUpdateEntry: (id: string, data: Record<string, any>) => Promise<JournalEntry>
}

export function JournalCard({ card, isExpanded, onToggle, onCreateEntry, onUpdateEntry }: JournalCardProps) {
  return (
    <div className={cn(unifiedSectionPanelClassName, 'overflow-hidden')}>
      <JournalCardHeader card={card} isExpanded={isExpanded} onToggle={onToggle} />
      {isExpanded && (
        <JournalCardBody
          card={card}
          onCreateEntry={onCreateEntry}
          onUpdateEntry={onUpdateEntry}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/notes/components/journal-card-header.tsx app/[locale]/dashboard/notes/components/journal-card-body.tsx app/[locale]/dashboard/notes/components/journal-card.tsx
git commit -m "feat: add JournalCard components (header, body, wrapper)"
```

---

### Task 7: UI Components — Stats Bar, Search Bar, Filters

**Files:**
- Create: `app/[locale]/dashboard/notes/components/journal-stats-bar.tsx`
- Create: `app/[locale]/dashboard/notes/components/journal-search-bar.tsx`
- Create: `app/[locale]/dashboard/notes/components/journal-filters.tsx`

- [ ] **Step 1: Create JournalStatsBar**

```tsx
'use client'

import { BookOpen, TrendingUp, Star, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedMetricPanelClassName } from '@/components/layout/unified-page-recipes'
import type { JournalStats } from '../lib/journal-types'

interface JournalStatsBarProps {
  stats: JournalStats
}

export function JournalStatsBar({ stats }: JournalStatsBarProps) {
  const items = [
    {
      icon: <BarChart3 size={14} className="text-muted-foreground/60" />,
      label: 'Total trades',
      value: stats.totalTrades,
    },
    {
      icon: <BookOpen size={14} className="text-primary/70" />,
      label: 'Journaled',
      value: `${stats.journaledCount}/${stats.totalTrades}`,
    },
    {
      icon: <TrendingUp size={14} className="text-semantic-success/70" />,
      label: 'Win rate',
      value: `${stats.winRate.toFixed(1)}%`,
    },
    {
      icon: <Star size={14} className="text-primary/70" />,
      label: 'Avg confidence',
      value: stats.avgConfidence != null ? `${stats.avgConfidence.toFixed(1)}/5` : '—',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className={cn(unifiedMetricPanelClassName, 'flex items-center gap-2.5')}>
          {item.icon}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{item.label}</p>
            <p className="text-sm font-semibold tabular-nums">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create JournalSearchBar**

```tsx
'use client'

import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import type { JournalFilters, JournalSortField } from '../lib/journal-types'

interface JournalSearchBarProps {
  filters: JournalFilters
  onFiltersChange: (partial: Partial<JournalFilters>) => void
  onToggleFilters: () => void
  showFilters: boolean
}

const SORT_OPTIONS: { value: JournalSortField; label: string }[] = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'pnl-desc', label: 'PnL (high to low)' },
  { value: 'pnl-asc', label: 'PnL (low to high)' },
]

export function JournalSearchBar({ filters, onFiltersChange, onToggleFilters, showFilters }: JournalSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
        <input
          value={filters.search}
          onChange={e => onFiltersChange({ search: e.target.value })}
          placeholder="Search notes, tags, instrument..."
          className="h-8 w-full rounded-lg border border-border/30 bg-background/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={onToggleFilters}
        className={`flex h-8 items-center gap-1.5 rounded-lg border border-border/30 px-2.5 text-xs text-muted-foreground hover:text-foreground ${showFilters ? 'border-primary/30 bg-primary/5 text-primary' : 'bg-background/40'}`}
      >
        <SlidersHorizontal size={13} />
        Filters
      </button>

      <div className="relative flex h-8 items-center gap-1.5 rounded-lg border border-border/30 bg-background/40 px-2.5 text-xs">
        <ArrowUpDown size={13} className="text-muted-foreground/50" />
        <select
          value={filters.sort}
          onChange={e => onFiltersChange({ sort: e.target.value as JournalSortField })}
          className="appearance-none bg-transparent text-xs text-foreground focus:outline-none"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create JournalFilters panel**

```tsx
'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JournalFilters, JournalPnlFilter, JournalStatus } from '../lib/journal-types'

interface JournalFiltersProps {
  filters: JournalFilters
  onChange: (partial: Partial<JournalFilters>) => void
  instruments: string[]
}

const STATUS_OPTIONS: { value: JournalStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'journaled', label: 'Journaled' },
  { value: 'not-journaled', label: 'Not journaled' },
]

const PNL_OPTIONS: { value: JournalPnlFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'winners', label: 'Winners' },
  { value: 'losers', label: 'Losers' },
  { value: 'breakeven', label: 'Breakeven' },
]

export function JournalFiltersPanel({ filters, onChange, instruments }: JournalFiltersProps) {
  const hasActive = filters.status !== 'all' || filters.pnl !== 'all' || filters.instrument !== null || filters.direction !== 'all' || filters.dateFrom !== null || filters.dateTo !== null

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/20 bg-muted/20 px-3 py-2">
      {/* Status */}
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ status: opt.value })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.status === opt.value
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/20" />

      {/* PnL */}
      <div className="flex items-center gap-1">
        {PNL_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange({ pnl: opt.value })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.pnl === opt.value
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border/20" />

      {/* Direction */}
      <div className="flex items-center gap-1">
        {(['all', 'LONG', 'SHORT'] as const).map(dir => (
          <button
            key={dir}
            type="button"
            onClick={() => onChange({ direction: dir })}
            className={cn(
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              filters.direction === dir
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {dir === 'all' ? 'Both' : dir}
          </button>
        ))}
      </div>

      {instruments.length > 0 && (
        <>
          <div className="h-4 w-px bg-border/20" />
          <select
            value={filters.instrument ?? ''}
            onChange={e => onChange({ instrument: e.target.value || null })}
            className="h-6 rounded-md border border-border/30 bg-background/40 px-1.5 text-[11px] text-foreground"
          >
            <option value="">All instruments</option>
            {instruments.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
        </>
      )}

      <div className="h-4 w-px bg-border/20" />

      {/* Date range */}
      <input
        type="date"
        value={filters.dateFrom ?? ''}
        onChange={e => onChange({ dateFrom: e.target.value || null })}
        className="h-6 rounded-md border border-border/30 bg-background/40 px-1.5 text-[11px] text-foreground"
      />
      <span className="text-[11px] text-muted-foreground/50">to</span>
      <input
        type="date"
        value={filters.dateTo ?? ''}
        onChange={e => onChange({ dateTo: e.target.value || null })}
        className="h-6 rounded-md border border-border/30 bg-background/40 px-1.5 text-[11px] text-foreground"
      />

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange({ status: 'all', pnl: 'all', instrument: null, direction: 'all', dateFrom: null, dateTo: null })}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/dashboard/notes/components/journal-stats-bar.tsx app/[locale]/dashboard/notes/components/journal-search-bar.tsx app/[locale]/dashboard/notes/components/journal-filters.tsx
git commit -m "feat: add journal stats bar, search bar, and filters"
```

---

### Task 8: Journal Client Page — Main Layout

**Files:**
- Create: `app/[locale]/dashboard/notes/journal-client.tsx`

- [ ] **Step 1: Create the main journal client component**

```tsx
'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import { useJournal } from './lib/use-journal'
import { JournalCard } from './components/journal-card'
import { JournalStatsBar } from './components/journal-stats-bar'
import { JournalSearchBar } from './components/journal-search-bar'
import { JournalFiltersPanel } from './components/journal-filters'
import { JournalEntry } from './lib/journal-types'

export default function JournalClient() {
  const userId = useUserStore(s => s.supabaseUser?.id ?? s.appUser?.id ?? null)
  const [showFilters, setShowFilters] = useState(false)

  const {
    cards, stats, filters, page, totalPages,
    isLoading, expandedId,
    setFilters, setPage, toggleExpand,
    createEntry, updateEntry,
  } = useJournal(userId)

  const instruments = useMemo(
    () => [...new Set(cards.map(c => c.trade.instrument))].sort(),
    [cards],
  )

  const handleCreate = useCallback(
    async (tradeId: string, accountNumber: string): Promise<JournalEntry> => {
      return createEntry({ tradeId, accountNumber })
    },
    [createEntry],
  )

  const handleUpdate = useCallback(
    async (id: string, data: Record<string, any>): Promise<JournalEntry> => {
      return updateEntry(id, data)
    },
    [updateEntry],
  )

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search + sort */}
      <JournalSearchBar
        filters={filters}
        onFiltersChange={setFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        showFilters={showFilters}
      />

      {/* Collapsible filters */}
      {showFilters && (
        <JournalFiltersPanel
          filters={filters}
          onChange={setFilters}
          instruments={instruments}
        />
      )}

      {/* Stats */}
      <JournalStatsBar stats={stats} />

      {/* Journal cards */}
      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl border border-border/20 bg-card/30" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">No trades found.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Adjust your filters or wait for trades to sync.</p>
          </div>
        ) : (
          cards.map(card => (
            <JournalCard
              key={card.trade.id}
              card={card}
              isExpanded={expandedId === card.trade.id}
              onToggle={() => toggleExpand(card.trade.id)}
              onCreateEntry={handleCreate}
              onUpdateEntry={handleUpdate}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 7) {
              pageNum = i + 1
            } else if (page <= 4) {
              pageNum = i + 1
            } else if (page >= totalPages - 3) {
              pageNum = totalPages - 6 + i
            } else {
              pageNum = page - 3 + i
            }
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
                  pageNum === page
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'border border-border/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/notes/journal-client.tsx
git commit -m "feat: add journal client page layout"
```

---

### Task 9: Server Page + Replace Old Notes

**Files:**
- Modify: `app/[locale]/dashboard/notes/page.tsx` (replace with journal page)
- Delete: `app/[locale]/dashboard/notes/notes-client.tsx`
- Delete: `app/[locale]/dashboard/notes/components/notes-list.tsx`
- Delete: `app/[locale]/dashboard/notes/components/note-editor.tsx`
- Delete: `app/[locale]/dashboard/notes/components/note-inspector.tsx`
- Delete: `app/[locale]/dashboard/notes/lib/use-notes.ts`
- Delete: `app/[locale]/dashboard/notes/lib/templates.ts`
- Modify: `components/sidebar/dashboard-sidebar.tsx` (rename "Notes" to "Journal")

- [ ] **Step 1: Replace page.tsx with journal page**

```tsx
import { Metadata } from 'next'
import JournalClient from './journal-client'

export const metadata: Metadata = {
  title: 'Trade Journal',
  description: 'Review and reflect on your trades with journal entries',
}

export default function JournalPage() {
  return (
    <div className="flex h-full flex-col">
      <JournalClient />
    </div>
  )
}
```

- [ ] **Step 2: Delete old notes files**

```bash
rm app/[locale]/dashboard/notes/notes-client.tsx
rm app/[locale]/dashboard/notes/components/notes-list.tsx
rm app/[locale]/dashboard/notes/components/note-editor.tsx
rm app/[locale]/dashboard/notes/components/note-inspector.tsx
rm app/[locale]/dashboard/notes/lib/use-notes.ts
rm app/[locale]/dashboard/notes/lib/templates.ts
```

- [ ] **Step 3: Update sidebar label**

In `components/sidebar/dashboard-sidebar.tsx`, change line ~63 from `label: "Notes"` to `label: "Journal"`.

- [ ] **Step 4: Verify build compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to journal/notes files

- [ ] **Step 5: Commit**

```bash
git add -A app/[locale]/dashboard/notes/ components/sidebar/dashboard-sidebar.tsx
git commit -m "feat: replace notes page with trade journal"
```

---

### Task 10: Update Loading Skeleton

**Files:**
- Modify: `app/[locale]/dashboard/notes/loading.tsx`

- [ ] **Step 1: Replace loading skeleton**

Replace the existing loading skeleton with one that matches the journal layout:

```tsx
export default function JournalLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Search bar skeleton */}
      <div className="h-8 animate-pulse rounded-lg bg-card/30" />

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-card/30" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-card/30" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/dashboard/notes/loading.tsx
git commit -m "feat: update loading skeleton for trade journal"
```

---

### Task 11: Build Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -20`
Expected: No errors

- [ ] **Step 2: Run next build**

Run: `npx next build 2>&1 | tail -40`
Expected: Build succeeds with no errors on journal routes

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve build issues from trade journal implementation"
```

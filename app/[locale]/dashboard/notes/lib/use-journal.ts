'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getJournalTradesAction } from '@/server/journal'
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
  addCard: (card: TradeJournalCard) => void
  refetch: () => void
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
  const safeCards = cards.filter(c => c && c.trade)
  const totalTrades = safeCards.length
  const journaledCount = safeCards.filter(c => c.journal !== null).length
  const winners = safeCards.filter(c => (c.trade.pnl || 0) > 0).length
  const winRate = totalTrades > 0 ? (winners / totalTrades) * 100 : 0
  const rated = safeCards.filter(c => c.journal?.confidenceRating != null)
  const avgConfidence = rated.length > 0
    ? rated.reduce((sum, c) => sum + (c.journal!.confidenceRating || 0), 0) / rated.length
    : null
  return { totalTrades, journaledCount, winRate, avgConfidence }
}

export function useJournal(userId: string | null): UseJournalReturn {
  const [cards, setCards] = useState<TradeJournalCard[]>([])
  const [stats, setStats] = useState<JournalStats>({ totalTrades: 0, journaledCount: 0, winRate: 0, avgConfidence: null })
  const [filters, setFiltersState] = useState<JournalFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(!userId)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const syncQueueRef = useRef<Map<string, { type: 'create' | 'update'; data: any }>>(new Map())
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      let allServerCards: TradeJournalCard[] = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const result = await getJournalTradesAction(undefined, currentPage, JOURNAL_PAGE_SIZE, {
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined,
          instrument: filters.instrument || undefined,
          direction: filters.direction !== 'all' ? filters.direction : undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          tags: filters.tags.length > 0 ? filters.tags : undefined,
          sort: filters.sort,
          accountNumber: filters.accountNumber || undefined,
        })

        const pageCards = result.entries as unknown as TradeJournalCard[]
        allServerCards = [...allServerCards, ...pageCards]
        hasMore = currentPage < result.totalPages
        currentPage += 1
      }

      const pending = loadPending(userId)
      if (pending.size > 0) {
        const merged = allServerCards.map(card => {
          const pendingEntry = pending.get(card.trade.id)
          if (pendingEntry) {
            pending.delete(card.trade.id)
            return { ...card, journal: pendingEntry }
          }
          return card
        })
        clearPending(userId)
        setCards(merged)
        setStats(computeStats(merged))
      } else {
        setCards(allServerCards)
        setStats(computeStats(allServerCards))
      }

      setTotalPages(Math.ceil(allServerCards.length / JOURNAL_PAGE_SIZE))
    } catch (err) {
      console.error('Failed to fetch journal:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, filters])

  const fetchDataRef = useRef(fetchData)

  useEffect(() => {
    fetchDataRef.current = fetchData
  }, [fetchData])

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
          const res = await fetch('/api/dashboard/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data),
          })
          if (res.ok) {
            const realEntry: JournalEntry = await res.json()
            setCards(prev => prev.map(card =>
              card.trade.id === tradeId ? { ...card, journal: realEntry } : card
            ))
          } else if (res.status === 409) {
            fetchDataRef.current()
          }
        } else if (op.type === 'update') {
          const res = await fetch(`/api/dashboard/journal/${op.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data),
          })
          if (!res.ok) throw new Error(`PUT failed: ${res.status}`)
        }
      } catch {
        syncQueueRef.current.set(tradeId, op)
        const pending = loadPending(userId)
        pending.set(tradeId, op.data as JournalEntry)
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
      timeframe: input.timeframe ?? null,
      session: input.session ?? null,
      pinned: false,
      archived: false,
      excerptTitle: input.excerptTitle ?? null,
      featuredExcerpt: input.featuredExcerpt ?? null,
      createdAt: now,
      updatedAt: now,
    }

    setCards(prev => prev.map(card =>
      card.trade.id === input.tradeId
        ? { ...card, journal: optimistic }
        : card
    ))

    syncQueueRef.current.set(input.tradeId, { type: 'create', data: input })
    scheduleSync()

    return optimistic
  }, [userId, scheduleSync])

  const updateEntry = useCallback(async (id: string, input: UpdateJournalInput): Promise<JournalEntry> => {
    let updatedEntry: JournalEntry | null = null
    setCards(prev => prev.map(card => {
      if (card.journal?.id !== id) return card
      updatedEntry = { ...card.journal, ...input, updatedAt: new Date().toISOString() } as JournalEntry
      return { ...card, journal: updatedEntry }
    }))

    syncQueueRef.current.set(id, { type: 'update', data: { id, ...input } })
    scheduleSync()

    return (updatedEntry ?? {} as JournalEntry)
  }, [scheduleSync])

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

  const addCard = useCallback((card: TradeJournalCard) => {
    setCards(prev => {
      if (prev.some(c => c.trade.id === card.trade.id)) return prev
      return [card, ...prev]
    })
  }, [])

  return {
    cards, stats, filters, page, totalPages,
    isLoading, expandedId,
    setFilters, setPage, toggleExpand,
    createEntry, updateEntry, deleteEntry,
    addCard,
    refetch: fetchData,
  }
}

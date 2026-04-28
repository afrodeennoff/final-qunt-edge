'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useUserStore } from '@/store/user-store'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface TradingNote {
  id: string
  userId: string
  title: string
  content: string // Tiptap HTML
  template?: string
  pinned: boolean
  archived: boolean
  tags: string[]
  symbol?: string
  sessionId?: string
  tradeIds: string[]
  checklistItems?: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

export type NoteFilter = 'all' | 'pinned' | 'recent' | 'archived' | 'templates'

type StoredTradingNote = Omit<TradingNote, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function isStoredTradingNote(value: unknown): value is StoredTradingNote {
  if (!value || typeof value !== 'object') return false

  const note = value as Record<string, unknown>
  return (
    typeof note.id === 'string' &&
    typeof note.userId === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    typeof note.pinned === 'boolean' &&
    typeof note.archived === 'boolean' &&
    Array.isArray(note.tags) &&
    note.tags.every(tag => typeof tag === 'string') &&
    Array.isArray(note.tradeIds) &&
    note.tradeIds.every(tradeId => typeof tradeId === 'string') &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  )
}

function createNoteId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `note-${crypto.randomUUID()}`
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function useNotes() {
  const [notes, setNotes] = useState<TradingNote[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<NoteFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const appUser = useUserStore((state) => state.user)
  const supabaseUser = useUserStore((state) => state.supabaseUser)
  const noteOwnerId = appUser?.id || supabaseUser?.id || null
  const storageKey = useMemo(
    () => (noteOwnerId ? `trading-notes:${noteOwnerId}` : null),
    [noteOwnerId],
  )

  useEffect(() => {
    if (!storageKey) {
      setNotes([])
      setActiveNoteId(null)
      setIsLoading(false)
      return
    }

    const loadNotes = () => {
      try {
        setIsLoading(true)
        const storedNotes = localStorage.getItem(storageKey)
        if (storedNotes) {
          const parsed: unknown = JSON.parse(storedNotes)
          const storedTradingNotes = Array.isArray(parsed) ? parsed.filter(isStoredTradingNote) : []
          const notesWithDates = storedTradingNotes.map(note => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }))
          setNotes(notesWithDates)
        } else {
          setNotes([])
        }
      } catch (error) {
        console.warn('Failed to load notes:', error)
        setNotes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [storageKey])

  useEffect(() => {
    if (!storageKey || isLoading) return

    if (notes.length > 0 || !isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(notes))
      } catch {
        // localStorage may be full or unavailable (e.g. private browsing)
      }
    }
  }, [notes, isLoading, storageKey])

  useEffect(() => {
    if (activeNoteId && !notes.some(note => note.id === activeNoteId)) {
      setActiveNoteId(null)
    }
  }, [activeNoteId, notes])

  // Autosave debounced
  const scheduleAutosave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = setTimeout(() => {
      // Notes are already saved via localStorage useEffect
      // This is where we would add server persistence
    }, 2000)
  }, [])

  // Create a new note
  const createNote = useCallback((templateId?: string) => {
    if (!noteOwnerId) {
      toast.error('Sign in required to create notes')
      return null
    }

    const newNote: TradingNote = {
      id: createNoteId(),
      userId: noteOwnerId,
      title: templateId ? '' : 'Untitled Note',
      content: '',
      template: templateId,
      pinned: false,
      archived: false,
      tags: [],
      tradeIds: [],
      checklistItems: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setNotes(prev => [newNote, ...prev])
    setActiveNoteId(newNote.id)
    return newNote
  }, [noteOwnerId])

  // Update a note
  const updateNote = useCallback((noteId: string, updates: Partial<TradingNote>) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const updated = {
          ...note,
          ...updates,
          updatedAt: new Date()
        }
        scheduleAutosave()
        return updated
      }
      return note
    }))
  }, [scheduleAutosave])

  // Delete a note
  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (activeNoteId === noteId) {
      setActiveNoteId(null)
    }
    toast.success('Note deleted')
  }, [activeNoteId])

  // Toggle pin status
  const togglePin = useCallback((noteId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const updated = {
          ...note,
          pinned: !note.pinned,
          updatedAt: new Date()
        }
        toast.success(updated.pinned ? 'Note pinned' : 'Note unpinned')
        return updated
      }
      return note
    }))
  }, [])

  // Toggle archive status
  const toggleArchive = useCallback((noteId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const updated = {
          ...note,
          archived: !note.archived,
          updatedAt: new Date()
        }
        toast.success(updated.archived ? 'Note archived' : 'Note unarchived')
        return updated
      }
      return note
    }))
  }, [])

  // Add tag to note
  const addTag = useCallback((noteId: string, tag: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId && !note.tags.includes(tag)) {
        return {
          ...note,
          tags: [...note.tags, tag],
          updatedAt: new Date()
        }
      }
      return note
    }))
  }, [])

  // Remove tag from note
  const removeTag = useCallback((noteId: string, tag: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          tags: note.tags.filter(t => t !== tag),
          updatedAt: new Date()
        }
      }
      return note
    }))
  }, [])

  // Filter notes based on current filter and search query
  const filteredNotes = notes.filter(note => {
    // Apply filter
    switch (filter) {
      case 'pinned':
        if (!note.pinned) return false
        break
      case 'archived':
        if (!note.archived) return false
        break
      case 'recent':
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        if (note.updatedAt < sevenDaysAgo) return false
        break
      case 'templates':
        if (!note.template) return false
        break
      case 'all':
      default:
        // Show all non-archived notes by default
        if (note.archived) return false
        break
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = note.title.toLowerCase().includes(query)
      const matchesContent = note.content.toLowerCase().includes(query)
      const matchesTags = note.tags.some(tag => tag.toLowerCase().includes(query))
      if (!matchesTitle && !matchesContent && !matchesTags) return false
    }

    return true
  })

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })

  const activeNote = notes.find(note => note.id === activeNoteId) || null

  return {
    notes: sortedNotes,
    activeNote,
    activeNoteId,
    filter,
    searchQuery,
    isLoading,
    setActiveNoteId,
    setFilter,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    addTag,
    removeTag
  }
}

"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

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

// Note: This is a local mock implementation.
// The existing Mood model in Prisma doesn't fully support the TradingNote structure.
// We'll work with local state for now and note the schema limitation.
export function useNotes() {
  const [notes, setNotes] = useState<TradingNote[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<NoteFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load notes from localStorage on mount
  useEffect(() => {
    const loadNotes = () => {
      try {
        const storedNotes = localStorage.getItem('trading-notes')
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes)
          const notesWithDates = parsed.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }))
          setNotes(notesWithDates)
        }
      } catch (error) {
        console.error('Failed to load notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0 || !isLoading) {
      localStorage.setItem('trading-notes', JSON.stringify(notes))
    }
  }, [notes, isLoading])

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
    const newNote: TradingNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user', // Would come from auth in production
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
  }, [])

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

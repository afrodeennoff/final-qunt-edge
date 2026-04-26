"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SegmentedControl } from "@/components/ui/segmented-control"
import {
  Plus,
  Search,
  Pin,
  FileText,
  Clock,
  Archive,
  LayoutGrid,
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { TradingNote } from "../lib/use-notes"

interface NotesListProps {
  notes: TradingNote[]
  activeNoteId: string | null
  filter: string
  searchQuery: string
  onNoteSelect: (noteId: string) => void
  onNewNote: () => void
  onFilterChange: (filter: string) => void
  onSearchChange: (query: string) => void
  isLoading?: boolean
}

export function NotesList({
  notes,
  activeNoteId,
  filter,
  searchQuery,
  onNoteSelect,
  onNewNote,
  onFilterChange,
  onSearchChange,
  isLoading = false,
}: NotesListProps) {
  const t = useI18n()
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Keyboard shortcut for search (Cmd+F / Ctrl+F)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Pinned', value: 'pinned' },
    { label: 'Recent', value: 'recent' },
    { label: 'Templates', value: 'templates' },
    { label: 'Archived', value: 'archived' },
  ]

  // Get preview text from content (strip HTML)
  const getPreviewText = (content: string, maxLength = 80) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = content
    const text = tmp.textContent || tmp.innerText || ''
    return text.length > maxLength ? text.substr(0, maxLength) + '...' : text
  }

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        {/* New Note Button */}
        <Button
          onClick={onNewNote}
          className="w-full justify-start"
          size="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filter Tabs */}
        <SegmentedControl
          value={filter}
          onChange={onFilterChange}
          options={filters.map(f => ({ label: f.label, value: f.value }))}
        />
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No notes found</p>
            <p className="text-xs mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onNoteSelect(note.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-150",
                  "hover:bg-muted/50",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  activeNoteId === note.id
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground opacity-90 hover:opacity-100"
                )}
              >
                <div className="flex items-start gap-2">
                  {/* Pin Icon */}
                  {note.pinned && (
                    <Pin className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {note.title || 'Untitled Note'}
                      </h3>
                      {note.template && (
                        <LayoutGrid className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    {/* Preview */}
                    {note.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {getPreviewText(note.content)}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(new Date(note.updatedAt))}</span>

                      {note.archived && (
                        <>
                          <span>•</span>
                          <Archive className="h-3 w-3" />
                        </>
                      )}

                      {note.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            {note.tags.length}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

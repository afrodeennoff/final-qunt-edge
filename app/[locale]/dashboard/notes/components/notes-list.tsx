"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Plus,
  Search,
  Pin,
  FileText,
  Clock,
  Archive,
  UserRound,
  LayoutGrid,
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { TradingNote } from "../lib/use-notes"
import { Skeleton } from "@/components/ui/skeleton"

interface NotesListProps {
  traders: string[]
  selectedTrader: string | null
  notes: TradingNote[]
  activeNoteId: string | null
  filter: string
  searchQuery: string
  onNoteSelect: (noteId: string) => void
  onNewNote: () => void
  onFilterChange: (filter: string) => void
  onSearchChange: (query: string) => void
  onTraderSelect: (trader: string | null) => void
  isLoading?: boolean
}

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'recent' },
  { label: 'Pinned', value: 'pinned' },
  { label: 'Archived', value: 'archived' },
]

export function NotesList({
  traders,
  selectedTrader,
  notes,
  activeNoteId,
  filter,
  searchQuery,
  onNoteSelect,
  onNewNote,
  onFilterChange,
  onSearchChange,
  onTraderSelect,
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

  // Get preview text from content (strip HTML)
  const getPreviewText = (content: string, maxLength = 80) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = content
    const text = tmp.textContent || tmp.innerText || ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
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
    <div className="flex flex-col h-full bg-background/40">
      {/* Header */}
      <div className="p-3 space-y-2.5">
        {/* New Note Button */}
        <Button
          onClick={onNewNote}
          variant="outline"
          className="w-full justify-start h-8 text-xs font-medium rounded-md border-border/30 bg-card/40 text-foreground hover:bg-card/60 hover:text-foreground"
        >
          <Plus className="mr-2 h-3.5 w-3.5 text-primary" />
          New Note
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs rounded-md bg-card/30 border-border/30 text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/30"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium rounded-md transition-colors duration-150",
                filter === opt.value
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground/80 hover:bg-card/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/20" />

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pt-2 pb-1">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Traders
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onTraderSelect(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-150",
                selectedTrader === null
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-card/30 hover:text-foreground/80"
              )}
            >
              <UserRound className="h-3.5 w-3.5" />
              <span>All Traders</span>
            </button>
            {traders.map((trader) => {
              const isActiveTrader = selectedTrader === trader
              return (
                <button
                  key={trader}
                  type="button"
                  onClick={() => onTraderSelect(trader)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-150",
                    isActiveTrader
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-card/30 hover:text-foreground/80"
                  )}
                >
                  <UserRound className="h-3.5 w-3.5" />
                  <span className="truncate">{trader}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mx-2 my-2 h-px bg-border/15" />

        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/30 bg-gradient-to-br from-primary/[0.08] to-transparent">
              <FileText className="h-5 w-5 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground/70">No notes found</p>
            <p className="text-xs mt-1.5 text-muted-foreground/60">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {notes.map((note) => {
              const isActive = activeNoteId === note.id
              return (
                <button
                  key={note.id}
                  onClick={() => onNoteSelect(note.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-md transition-all duration-150",
                    "focus:outline-none",
                    isActive
                      ? "bg-gradient-to-r from-primary/[0.06] to-transparent border-l-2 border-l-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                      : "border-l-2 border-l-transparent hover:bg-card/30 hover:border-l-primary/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {/* Pin Icon */}
                    {note.pinned && (
                      <Pin className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary/60" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className={cn(
                          "font-medium text-sm truncate",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}>
                          {note.title || 'Untitled Note'}
                        </h3>
                        {note.template && (
                          <LayoutGrid className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                        )}
                      </div>

                      {/* Preview */}
                      {note.content && (
                        <p className="text-xs line-clamp-2 mb-1.5 leading-relaxed text-muted-foreground">
                          {getPreviewText(note.content)}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatDate(new Date(note.updatedAt))}</span>

                        {note.archived && (
                          <>
                            <span className="opacity-40">·</span>
                            <Archive className="h-2.5 w-2.5" />
                          </>
                        )}

                        {note.tags.length > 0 && (
                          <>
                            <span className="opacity-40">·</span>
                            <span className="px-1 py-0.5 rounded text-[10px] bg-card/40">
                              {note.tags.length}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

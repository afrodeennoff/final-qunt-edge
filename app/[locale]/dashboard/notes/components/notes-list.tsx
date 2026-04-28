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
    <div
      className="flex flex-col h-full"
      style={{ background: 'oklch(0.03 0.01 297)' }}
    >
      {/* Header */}
      <div className="p-3 space-y-3">
        {/* New Note Button */}
        <Button
          onClick={onNewNote}
          variant="outline"
          className="w-full justify-start h-8 text-xs font-medium rounded"
          style={{
            borderColor: 'oklch(0.50 0.02 297 / 0.12)',
            color: 'oklch(0.94 0.02 297)',
            background: 'oklch(0.05 0.01 297)',
          }}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          New Note
        </Button>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5"
            style={{ color: 'oklch(0.52 0.03 297)' }}
          />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-xs rounded"
            style={{
              background: 'oklch(0.05 0.01 297)',
              borderColor: 'oklch(0.50 0.02 297 / 0.1)',
              color: 'oklch(0.94 0.02 297)',
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium rounded transition-colors",
              )}
              style={{
                background: filter === opt.value
                  ? 'oklch(0.60 0.22 297 / 0.15)'
                  : 'transparent',
                color: filter === opt.value
                  ? 'oklch(0.72 0.16 297)'
                  : 'oklch(0.52 0.03 297)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px"
        style={{ background: 'oklch(0.50 0.02 297 / 0.1)' }}
      />

      {/* Notes List */}
      <ScrollArea className="flex-1">
        <div className="px-2 pt-2 pb-1">
          <p
            className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'oklch(0.52 0.03 297)' }}
          >
            Traders
          </p>
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onTraderSelect(null)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-[opacity,background-color,border-color]"
              style={{
                background: selectedTrader === null ? 'oklch(0.60 0.22 297 / 0.14)' : 'transparent',
                color: selectedTrader === null ? 'oklch(0.72 0.16 297)' : 'oklch(0.62 0.03 297)',
              }}
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
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-[opacity,background-color,border-color]"
                  style={{
                    background: isActiveTrader ? 'oklch(0.60 0.22 297 / 0.14)' : 'transparent',
                    color: isActiveTrader ? 'oklch(0.72 0.16 297)' : 'oklch(0.62 0.03 297)',
                  }}
                >
                  <UserRound className="h-3.5 w-3.5" />
                  <span className="truncate">{trader}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mx-2 my-2 h-px" style={{ background: 'oklch(0.50 0.02 297 / 0.1)' }} />

        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded animate-pulse"
                style={{ background: 'oklch(0.05 0.01 297)' }}
              />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'oklch(0.52 0.03 297)' }}>
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-xs font-medium">No notes found</p>
            <p className="text-[11px] mt-1">
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
                    "w-full text-left p-3 rounded transition-[opacity,background-color,border-color] duration-150",
                    "focus:outline-none",
                  )}
                  style={{
                    background: isActive
                      ? 'oklch(0.05 0.01 297 / 0.8)'
                      : 'transparent',
                    borderLeft: isActive
                      ? '3px solid oklch(0.60 0.22 297 / 0.5)'
                      : '3px solid transparent',
                    color: isActive
                      ? 'oklch(0.94 0.02 297)'
                      : 'oklch(0.78 0.03 297)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'oklch(0.05 0.01 297 / 0.5)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    {/* Pin Icon */}
                    {note.pinned && (
                      <Pin
                        className="h-3 w-3 mt-0.5 flex-shrink-0"
                        style={{ color: 'oklch(0.60 0.22 297 / 0.7)' }}
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-medium text-sm truncate">
                          {note.title || 'Untitled Note'}
                        </h3>
                        {note.template && (
                          <LayoutGrid
                            className="h-3 w-3 flex-shrink-0"
                            style={{ color: 'oklch(0.52 0.03 297)' }}
                          />
                        )}
                      </div>

                      {/* Preview */}
                      {note.content && (
                        <p
                          className="text-xs line-clamp-2 mb-1.5 leading-relaxed"
                          style={{ color: 'oklch(0.62 0.03 297)' }}
                        >
                          {getPreviewText(note.content)}
                        </p>
                      )}

                      {/* Footer */}
                      <div
                        className="flex items-center gap-1.5 text-[11px]"
                        style={{ color: 'oklch(0.52 0.03 297)' }}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatDate(new Date(note.updatedAt))}</span>

                        {note.archived && (
                          <>
                            <span className="opacity-50">·</span>
                            <Archive className="h-2.5 w-2.5" />
                          </>
                        )}

                        {note.tags.length > 0 && (
                          <>
                            <span className="opacity-50">·</span>
                            <span
                              className="px-1 py-0.5 rounded text-[10px]"
                              style={{ background: 'oklch(0.50 0.02 297 / 0.1)' }}
                            >
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

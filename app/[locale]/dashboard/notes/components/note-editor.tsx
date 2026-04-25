"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Tag,
  Calendar,
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { TradingNote } from "../lib/use-notes"
import dynamic from "next/dynamic"

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/tiptap-editor").then(mod => ({ default: mod.TiptapEditor })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading editor...</div>
    </div>
  )
})

interface NoteEditorProps {
  note: TradingNote | null
  onNoteUpdate: (noteId: string, updates: Partial<TradingNote>) => void
  onTogglePin: (noteId: string) => void
  onToggleArchive: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  onAddTag: (noteId: string, tag: string) => void
  onRemoveTag: (noteId: string, tag: string) => void
}

export function NoteEditor({
  note,
  onNoteUpdate,
  onTogglePin,
  onToggleArchive,
  onDeleteNote,
  onAddTag,
  onRemoveTag,
}: NoteEditorProps) {
  const t = useI18n()
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  // Focus title input when note changes
  React.useEffect(() => {
    if (note && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [note?.id])

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="text-center space-y-3 max-w-md">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No Note Selected</h3>
          <p className="text-sm">
            Select a note from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    )
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNoteUpdate(note.id, { title: e.target.value })
  }

  const handleContentChange = (content: string) => {
    onNoteUpdate(note.id, { content })
  }

  const handleAddTag = () => {
    const tag = prompt('Enter tag name:')
    if (tag && tag.trim()) {
      onAddTag(note.id, tag.trim())
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(note.id)
    }
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? (
              <Pin className="h-4 w-4 text-primary" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleArchive(note.id)}
            title={note.archived ? 'Unarchive note' : 'Archive note'}
          >
            {note.archived ? (
              <ArchiveRestore className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            title="Delete note"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Last edited: {formatDate(note.updatedAt)}
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-2">
        <Input
          ref={titleInputRef}
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 h-auto"
        />
      </div>

      {/* Tags */}
      <div className="px-6 py-2 flex items-center gap-2 flex-wrap">
        <Tag className="h-4 w-4 text-muted-foreground" />
        {note.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => onRemoveTag(note.id, tag)}
            title="Click to remove"
          >
            {tag}
            <button
              className="ml-1 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveTag(note.id, tag)
              }}
            >
              ×
            </button>
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleAddTag}
        >
          + Add tag
        </Button>
      </div>

      {/* Metadata */}
      {(note.symbol || note.sessionId || note.tradeIds.length > 0) && (
        <div className="px-6 py-2 flex items-center gap-4 text-xs text-muted-foreground">
          {note.symbol && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Symbol: {note.symbol}</span>
            </div>
          )}
          {note.tradeIds.length > 0 && (
            <div>
              {note.tradeIds.length} linked trade{note.tradeIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Editor */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-4 min-h-[500px]">
          <TiptapEditor
            content={note.content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
            height="100%"
            className="min-h-[400px]"
          />
        </div>
      </ScrollArea>
    </div>
  )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Tag,
  X,
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { TradingNote } from "../lib/use-notes"
import dynamic from "next/dynamic"

// Dynamically import TiptapEditor to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/tiptap-editor").then(mod => ({ default: mod.TiptapEditor })), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-sm text-muted-foreground">
        Loading editor...
      </div>
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
  const [tagInput, setTagInput] = React.useState('')
  const [showTagInput, setShowTagInput] = React.useState(false)
  const tagInputRef = React.useRef<HTMLInputElement>(null)
  const [saveIndicator, setSaveIndicator] = React.useState<'saved' | 'saving' | 'idle'>('idle')

  // Focus title input when note changes
  React.useEffect(() => {
    if (note && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [note?.id])

  // Track save indicator on update
  React.useEffect(() => {
    if (!note) return
    setSaveIndicator('saving')
    const timer = setTimeout(() => setSaveIndicator('saved'), 600)
    return () => clearTimeout(timer)
  }, [note?.updatedAt])

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background/40">
        <div className="text-center space-y-3 max-w-sm">
          <div className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center bg-card/50 border border-border/20">
            <svg
              className="h-6 w-6 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-foreground/70">
            Select a note to edit
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground/60">
            Choose a note from the sidebar or create a new one to get started.
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

  const handleTagSubmit = () => {
    const tag = tagInput.trim()
    if (tag && !note.tags.includes(tag)) {
      onAddTag(note.id, tag)
    }
    setTagInput('')
    setShowTagInput(false)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTagSubmit()
    } else if (e.key === 'Escape') {
      setTagInput('')
      setShowTagInput(false)
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Count words in content
  const getWordCount = (content: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = content
    const text = tmp.textContent || tmp.innerText || ''
    if (!text.trim()) return 0
    return text.trim().split(/\s+/).length
  }

  return (
    <div className="flex flex-col h-full bg-background/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/15">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? (
              <Pin className="h-3.5 w-3.5 text-primary" />
            ) : (
              <PinOff className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => onToggleArchive(note.id)}
            title={note.archived ? 'Unarchive note' : 'Archive note'}
          >
            {note.archived ? (
              <ArchiveRestore className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            title="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Save indicator */}
        <div className="text-[11px] text-muted-foreground/60">
          {saveIndicator === 'saving' && 'Saving...'}
          {saveIndicator === 'saved' && (
            <span className="text-primary/70">Saved</span>
          )}
          {saveIndicator === 'idle' && formatDate(note.updatedAt)}
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pt-5 pb-1">
        <Input
          ref={titleInputRef}
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto rounded-none bg-transparent text-foreground placeholder:text-muted-foreground/40 caret-primary"
        />
      </div>

      {/* Tags */}
      <div className="px-6 py-2 flex items-center gap-1.5 flex-wrap">
        <Tag className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium cursor-pointer group bg-primary/10 text-primary/80 hover:bg-primary/15"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(note.id, tag)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        {showTagInput ? (
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleTagSubmit}
            placeholder="Tag name..."
            autoFocus
            className="h-5 px-1.5 text-[11px] rounded-md border-none outline-none bg-card/40 text-foreground caret-primary"
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-[11px] px-1.5 py-0.5 rounded-md transition-colors duration-150 text-muted-foreground/60 hover:text-foreground/70 hover:bg-card/30"
          >
            + tag
          </button>
        )}
      </div>

      {/* Editor */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-3 min-h-[500px]">
          <TiptapEditor
            content={note.content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
            height="100%"
            className="min-h-[400px]"
          />
        </div>
      </ScrollArea>

      {/* Footer with word count */}
      <div className="px-6 py-1.5 flex items-center justify-between text-[11px] border-t border-border/15 text-muted-foreground/50">
        <span>{getWordCount(note.content)} words</span>
        <span>{formatDate(note.createdAt)}</span>
      </div>
    </div>
  )
}

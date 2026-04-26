"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
      <div
        className="animate-pulse text-sm"
        style={{ color: 'oklch(0.45 0.02 260)' }}
      >
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
      <div
        className="h-full flex flex-col items-center justify-center p-8"
        style={{ background: 'oklch(0.032 0.005 260)' }}
      >
        <div className="text-center space-y-3 max-w-md">
          <div
            className="h-14 w-14 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'oklch(0.04 0.005 260)' }}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'oklch(0.45 0.02 260)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3
            className="text-sm font-medium"
            style={{ color: 'oklch(0.65 0.02 260)' }}
          >
            Select a note to edit
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'oklch(0.45 0.02 260)' }}
          >
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
    <div
      className="flex flex-col h-full"
      style={{ background: 'oklch(0.032 0.005 260)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid oklch(0.5 0.01 260 / 0.1)' }}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded"
            onClick={() => onTogglePin(note.id)}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            {note.pinned ? (
              <Pin
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.65 0.22 260)' }}
              />
            ) : (
              <PinOff
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.45 0.02 260)' }}
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded"
            onClick={() => onToggleArchive(note.id)}
            title={note.archived ? 'Unarchive note' : 'Archive note'}
          >
            {note.archived ? (
              <ArchiveRestore
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.65 0.22 260)' }}
              />
            ) : (
              <Archive
                className="h-3.5 w-3.5"
                style={{ color: 'oklch(0.45 0.02 260)' }}
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded"
            onClick={handleDelete}
            title="Delete note"
          >
            <Trash2
              className="h-3.5 w-3.5"
              style={{ color: 'oklch(0.55 0.15 25)' }}
            />
          </Button>
        </div>

        {/* Save indicator */}
        <div
          className="text-[11px]"
          style={{ color: 'oklch(0.45 0.02 260)' }}
        >
          {saveIndicator === 'saving' && 'Saving...'}
          {saveIndicator === 'saved' && 'Saved'}
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
          className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto rounded-none"
          style={{
            color: 'oklch(0.92 0.01 260)',
            background: 'transparent',
            caretColor: 'oklch(0.65 0.22 260)',
          }}
        />
      </div>

      {/* Tags */}
      <div className="px-6 py-2 flex items-center gap-1.5 flex-wrap">
        <Tag
          className="h-3.5 w-3.5 flex-shrink-0"
          style={{ color: 'oklch(0.45 0.02 260)' }}
        />
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer group"
            style={{
              background: 'oklch(0.65 0.22 260 / 0.1)',
              color: 'oklch(0.75 0.15 260)',
            }}
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
            className="h-5 px-1.5 text-[11px] rounded border-none outline-none"
            style={{
              background: 'oklch(0.04 0.005 260)',
              color: 'oklch(0.92 0.01 260)',
              caretColor: 'oklch(0.65 0.22 260)',
            }}
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-[11px] px-1.5 py-0.5 rounded transition-colors"
            style={{ color: 'oklch(0.45 0.02 260)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'oklch(0.65 0.02 260)'
              e.currentTarget.style.background = 'oklch(0.65 0.22 260 / 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'oklch(0.45 0.02 260)'
              e.currentTarget.style.background = 'transparent'
            }}
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
      <div
        className="px-6 py-1.5 flex items-center justify-between text-[11px]"
        style={{
          borderTop: '1px solid oklch(0.5 0.01 260 / 0.1)',
          color: 'oklch(0.45 0.02 260)',
        }}
      >
        <span>{getWordCount(note.content)} words</span>
        <span>{formatDate(note.createdAt)}</span>
      </div>
    </div>
  )
}

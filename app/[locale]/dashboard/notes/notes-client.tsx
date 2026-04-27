"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useI18n } from "@/locales/client"
import { useNotes, TradingNote, NoteFilter } from "./lib/use-notes"
import { NotesList } from "./components/notes-list"
import { NoteEditor } from "./components/note-editor"
import { NoteInspector } from "./components/note-inspector"
import { NOTE_TEMPLATES } from "./lib/templates"
import { ArrowLeft, PanelRight } from "lucide-react"

type ViewMode = 'list' | 'editor'

export default function NotesPageClient() {
  const t = useI18n()
  const {
    notes,
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
    removeTag,
  } = useNotes()

  // Responsive state
  const [viewMode, setViewMode] = React.useState<ViewMode>('list')
  const [showInspector, setShowInspector] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)

  const handleNewNote = React.useCallback(() => {
    createNote()
    if (isMobile) {
      setViewMode('editor')
    }
  }, [createNote, isMobile])

  // Check screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1280)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleNewNote()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNewNote])

  const handleFilterChange = (value: string) => {
    setFilter(value as NoteFilter)
  }

  const handleNoteSelect = (noteId: string) => {
    setActiveNoteId(noteId)
    if (isMobile) {
      setViewMode('editor')
    }
  }

  const handleBackToList = () => {
    setViewMode('list')
    setActiveNoteId(null)
  }

  const handleApplyTemplate = (templateId: string) => {
    if (!activeNoteId) return

    const template = NOTE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      updateNote(activeNoteId, {
        content: template.content,
        title: template.name,
        template: templateId,
      })
    }
  }

  const handleToggleChecklistItem = (noteId: string, itemId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    const updatedItems = (note.checklistItems || []).map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )

    updateNote(noteId, { checklistItems: updatedItems })
  }

  const handleAddChecklistItem = (noteId: string, text: string) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false,
    }

    updateNote(noteId, {
      checklistItems: [...(note.checklistItems || []), newItem],
    })
  }

  // Shared inspector sheet for tablet and mobile
  const inspectorSheet = (
    <Sheet open={showInspector} onOpenChange={setShowInspector}>
      <SheetContent
        side="right"
        className="w-72 p-0"
        style={{ background: 'oklch(0.028 0.005 260)' }}
      >
        <NoteInspector
          note={activeNote}
          onApplyTemplate={handleApplyTemplate}
          onToggleChecklistItem={handleToggleChecklistItem}
          onAddChecklistItem={handleAddChecklistItem}
          className="border-0"
        />
      </SheetContent>
    </Sheet>
  )

  // Desktop layout (3-pane)
  if (!isMobile && !isTablet) {
    return (
      <div className="h-full flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Pane - Notes List (220px default) */}
          <ResizablePanel
            defaultSize={22}
            minSize={15}
            maxSize={35}
            style={{ borderRight: '1px solid oklch(0.5 0.01 260 / 0.1)' }}
          >
            <NotesList
              notes={notes}
              activeNoteId={activeNoteId}
              filter={filter}
              searchQuery={searchQuery}
              onNoteSelect={handleNoteSelect}
              onNewNote={handleNewNote}
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
            />
          </ResizablePanel>

          <ResizableHandle
            style={{ background: 'oklch(0.5 0.01 260 / 0.08)' }}
          />

          {/* Middle Pane - Editor (flexible) */}
          <ResizablePanel defaultSize={53} minSize={30}>
            <NoteEditor
              note={activeNote}
              onNoteUpdate={updateNote}
              onTogglePin={togglePin}
              onToggleArchive={toggleArchive}
              onDeleteNote={deleteNote}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          </ResizablePanel>

          <ResizableHandle
            style={{ background: 'oklch(0.5 0.01 260 / 0.08)' }}
          />

          {/* Right Pane - Inspector (240px default) */}
          <ResizablePanel
            defaultSize={25}
            minSize={18}
            maxSize={35}
            style={{ borderLeft: '1px solid oklch(0.5 0.01 260 / 0.1)' }}
          >
            <NoteInspector
              note={activeNote}
              onApplyTemplate={handleApplyTemplate}
              onToggleChecklistItem={handleToggleChecklistItem}
              onAddChecklistItem={handleAddChecklistItem}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    )
  }

  // Tablet layout (2-pane with inspector overlay)
  if (isTablet) {
    return (
      <div className="h-full flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Pane - Notes List (280px) */}
          <ResizablePanel
            defaultSize={28}
            minSize={20}
            maxSize={40}
            style={{ borderRight: '1px solid oklch(0.5 0.01 260 / 0.1)' }}
          >
            <NotesList
              notes={notes}
              activeNoteId={activeNoteId}
              filter={filter}
              searchQuery={searchQuery}
              onNoteSelect={handleNoteSelect}
              onNewNote={handleNewNote}
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
            />
          </ResizablePanel>

          <ResizableHandle
            style={{ background: 'oklch(0.5 0.01 260 / 0.08)' }}
          />

          {/* Right Pane - Editor */}
          <ResizablePanel defaultSize={72}>
            <div className="h-full flex flex-col relative">
              {/* Inspector Toggle */}
              <div className="absolute top-2.5 right-3 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded"
                  onClick={() => setShowInspector(!showInspector)}
                  style={{ color: 'oklch(0.45 0.02 260)' }}
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              </div>

              <NoteEditor
                note={activeNote}
                onNoteUpdate={updateNote}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onDeleteNote={deleteNote}
                onAddTag={addTag}
                onRemoveTag={removeTag}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {inspectorSheet}
      </div>
    )
  }

  // Mobile layout (single pane with navigation)
  return (
    <div className="h-full flex flex-col" style={{ background: 'oklch(0.032 0.005 260)' }}>
      {viewMode === 'list' ? (
        <NotesList
          notes={notes}
          activeNoteId={activeNoteId}
          filter={filter}
          searchQuery={searchQuery}
          onNoteSelect={handleNoteSelect}
          onNewNote={handleNewNote}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
        />
      ) : (
        <div className="h-full flex flex-col relative">
          {/* Back Button */}
          <div
            className="flex items-center justify-between px-2 py-1.5"
            style={{ borderBottom: '1px solid oklch(0.5 0.01 260 / 0.1)' }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-1.5 h-7 text-xs rounded"
              style={{ color: 'oklch(0.65 0.22 260)' }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Notes
            </Button>

            {activeNote && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded"
                onClick={() => setShowInspector(true)}
                style={{ color: 'oklch(0.45 0.02 260)' }}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <NoteEditor
            note={activeNote}
            onNoteUpdate={updateNote}
            onTogglePin={togglePin}
            onToggleArchive={toggleArchive}
            onDeleteNote={deleteNote}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />
        </div>
      )}

      {inspectorSheet}
    </div>
  )
}

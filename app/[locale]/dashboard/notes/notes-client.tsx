"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useI18n } from "@/locales/client"
import { useNotes, TradingNote, NoteFilter } from "./lib/use-notes"
import { NotesList } from "./components/notes-list"
import { NoteEditor } from "./components/note-editor"
import { NoteInspector } from "./components/note-inspector"
import { NOTE_TEMPLATES } from "./lib/templates"
import { ArrowLeft, PanelLeftClose, PanelRightClose } from "lucide-react"

type ViewMode = 'list' | 'editor' | 'inspector'

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
      // Cmd+N / Ctrl+N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleNewNote()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNewNote = () => {
    const newNote = createNote()
    if (isMobile) {
      setViewMode('editor')
    }
  }

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

  // Desktop layout (3-pane)
  if (!isMobile && !isTablet) {
    return (
      <div className="h-full flex">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Pane - Notes List */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
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

          <ResizableHandle />

          {/* Middle Pane - Editor */}
          <ResizablePanel defaultSize={50} minSize={30}>
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

          <ResizableHandle />

          {/* Right Pane - Inspector */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
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
          {/* Left Pane - Notes List */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
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

          <ResizableHandle />

          {/* Right Pane - Editor */}
          <ResizablePanel defaultSize={70}>
            <div className="h-full flex flex-col">
              {/* Inspector Toggle Button */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInspector(!showInspector)}
                >
                  {showInspector ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
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

        {/* Inspector Sheet */}
        <Sheet open={showInspector} onOpenChange={setShowInspector}>
          <SheetContent side="right" className="w-80">
            <NoteInspector
              note={activeNote}
              onApplyTemplate={handleApplyTemplate}
              onToggleChecklistItem={handleToggleChecklistItem}
              onAddChecklistItem={handleAddChecklistItem}
              className="border-0"
            />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  // Mobile layout (1-pane with navigation)
  return (
    <div className="h-full flex flex-col">
      {viewMode === 'list' && (
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
      )}

      {viewMode === 'editor' && (
        <div className="h-full flex flex-col">
          {/* Back Button */}
          <div className="p-2 border-b bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
          </div>

          {/* Inspector Toggle */}
          {activeNote && (
            <div className="absolute top-14 right-2 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInspector(!showInspector)}
              >
                Inspector
              </Button>
            </div>
          )}

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

        {/* Inspector Sheet for Mobile */}
        <Sheet open={showInspector} onOpenChange={setShowInspector}>
          <SheetContent side="right" className="w-80">
            <NoteInspector
              note={activeNote}
              onApplyTemplate={handleApplyTemplate}
              onToggleChecklistItem={handleToggleChecklistItem}
              onAddChecklistItem={handleAddChecklistItem}
              className="border-0"
            />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

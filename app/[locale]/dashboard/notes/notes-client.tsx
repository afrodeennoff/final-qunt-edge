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
import { useTradingDomainStore } from "@/store/trading-domain-store"
import { useUserStore } from "@/store/user-store"

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
  const [selectedTrader, setSelectedTrader] = React.useState<string | null>(null)
  const trades = useTradingDomainStore((state) => state.trades)
  const accounts = useUserStore((state) => state.accounts)

  const traders = React.useMemo(() => {
    const fromAccounts = accounts
      .map((account) => account.number || '')
      .filter(Boolean)
    const fromTrades = Array.from(
      new Set(
        trades
          .map((trade) => trade.accountNumber || '')
          .filter(Boolean),
      ),
    )
    return Array.from(new Set([...fromAccounts, ...fromTrades])).sort((a, b) =>
      a.localeCompare(b),
    )
  }, [accounts, trades])

  const visibleNotes = React.useMemo(() => {
    if (!selectedTrader) return notes
    return notes.filter((note) => note.symbol === selectedTrader)
  }, [notes, selectedTrader])

  const handleNewNote = React.useCallback(() => {
    const createdNote = createNote()
    if (createdNote && selectedTrader) {
      updateNote(createdNote.id, { symbol: selectedTrader })
    }
    if (isMobile) {
      setViewMode('editor')
    }
  }, [createNote, isMobile, selectedTrader, updateNote])

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
    const selected = notes.find((note) => note.id === noteId)
    if (selected?.symbol) {
      setSelectedTrader(selected.symbol)
    }
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
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
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
        className="w-72 p-0 bg-background border-l border-border/20"
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
          {/* Left Pane - Notes List (22% default) */}
          <ResizablePanel
            defaultSize={22}
            minSize={15}
            maxSize={35}
            className="border-r border-border/15"
          >
            <div className="h-full rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
              <NotesList
                traders={traders}
                selectedTrader={selectedTrader}
                notes={visibleNotes}
                activeNoteId={activeNoteId}
                filter={filter}
                searchQuery={searchQuery}
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                onFilterChange={handleFilterChange}
                onSearchChange={setSearchQuery}
                onTraderSelect={setSelectedTrader}
                isLoading={isLoading}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-border/10" />

          {/* Middle Pane - Editor (flexible) */}
          <ResizablePanel defaultSize={53} minSize={30}>
            <div className="h-full rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
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

          <ResizableHandle className="bg-border/10" />

          {/* Right Pane - Inspector (25% default) */}
          <ResizablePanel
            defaultSize={25}
            minSize={18}
            maxSize={35}
            className="border-l border-border/15"
          >
            <div className="h-full rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
              <NoteInspector
                note={activeNote}
                onApplyTemplate={handleApplyTemplate}
                onToggleChecklistItem={handleToggleChecklistItem}
                onAddChecklistItem={handleAddChecklistItem}
              />
            </div>
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
            className="border-r border-border/15"
          >
            <div className="h-full rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6">
              <NotesList
                traders={traders}
                selectedTrader={selectedTrader}
                notes={visibleNotes}
                activeNoteId={activeNoteId}
                filter={filter}
                searchQuery={searchQuery}
                onNoteSelect={handleNoteSelect}
                onNewNote={handleNewNote}
                onFilterChange={handleFilterChange}
                onSearchChange={setSearchQuery}
                onTraderSelect={setSelectedTrader}
                isLoading={isLoading}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className="bg-border/10" />

          {/* Right Pane - Editor */}
          <ResizablePanel defaultSize={72}>
            <div className="h-full flex flex-col rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6 relative">
              {/* Inspector Toggle */}
              <div className="absolute top-3 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground transition-all"
                  onClick={() => setShowInspector(!showInspector)}
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
    <div className="h-full flex flex-col rounded-xl border border-border/30 bg-card p-4 shadow-sm sm:p-6 bg-background">
      {viewMode === 'list' ? (
          <NotesList
            traders={traders}
            selectedTrader={selectedTrader}
            notes={visibleNotes}
            activeNoteId={activeNoteId}
            filter={filter}
            searchQuery={searchQuery}
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            onFilterChange={handleFilterChange}
            onSearchChange={setSearchQuery}
            onTraderSelect={setSelectedTrader}
            isLoading={isLoading}
          />
      ) : (
        <div className="h-full flex flex-col relative">
          {/* Back Button */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-1.5 h-8 text-sm rounded-md text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Notes
            </Button>

            {activeNote && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground transition-all"
                onClick={() => setShowInspector(true)}
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

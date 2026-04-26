"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Sparkles,
  Download,
  Link2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { TradingNote, ChecklistItem } from "../lib/use-notes"
import { NOTE_TEMPLATES, NoteTemplate } from "../lib/templates"
import { useCompletion } from "@ai-sdk/react"
import { toast } from "sonner"

interface NoteInspectorProps {
  note: TradingNote | null
  onApplyTemplate: (templateId: string) => void
  onToggleChecklistItem: (noteId: string, itemId: string) => void
  onAddChecklistItem: (noteId: string, text: string) => void
  className?: string
}

export function NoteInspector({
  note,
  onApplyTemplate,
  onToggleChecklistItem,
  onAddChecklistItem,
  className,
}: NoteInspectorProps) {
  const t = useI18n()
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['templates']))
  const [aiSummary, setAiSummary] = React.useState<string | null>(null)

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/summarize",
    onFinish: (_, { completion }) => {
      setAiSummary(completion)
    },
    onError: (error) => {
      console.error("AI Summary error:", error)
      const errorMessage = error?.message || String(error)

      if (errorMessage.includes("API key") || errorMessage.includes("OPENROUTER_API_KEY")) {
        toast.error("AI service is not configured. Please contact support.")
      } else if (errorMessage.includes("subscription") || errorMessage.includes("plan") || errorMessage.includes("FORBIDDEN")) {
        toast.error("AI features require an active subscription.")
      } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many")) {
        toast.error("Too many AI requests. Please wait a moment.")
      } else {
        toast.error("Failed to generate summary. Please try again.")
      }

      setAiSummary(null)
    },
  })

  const handleAiSummary = async () => {
    if (!note || !note.content || note.content.trim().length < 10) {
      toast.error("Note content is too short to summarize")
      return
    }

    setAiSummary(null)
    complete(note.content)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const handleApplyTemplate = (template: NoteTemplate) => {
    if (note && confirm(`Apply "${template.name}" template? This will replace the current content.`)) {
      onApplyTemplate(template.id)
    }
  }

  const handleAddChecklistItem = () => {
    if (!note) return
    const text = prompt('Enter checklist item:')
    if (text && text.trim()) {
      onAddChecklistItem(note.id, text.trim())
    }
  }

  const handleExportNote = () => {
    if (!note) return

    // Create a simple text export
    let content = `# ${note.title}\n\n`
    content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`
    content += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n`
    if (note.tags.length > 0) {
      content += `Tags: ${note.tags.join(', ')}\n`
    }
    content += '\n---\n\n'

    // Strip HTML from content
    const tmp = document.createElement('div')
    tmp.innerHTML = note.content
    content += tmp.textContent || tmp.innerText || ''

    // Download
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || 'untitled'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!note) {
    return (
      <div className={cn("h-full bg-muted/30 border-l", className)}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Inspector</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground text-sm">
          Select a note to view details
        </div>
      </div>
    )
  }

  const completedItems = note.checklistItems?.filter(i => i.completed).length || 0
  const totalItems = note.checklistItems?.length || 0
  const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className={cn("h-full bg-muted/30 border-l flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold text-sm">Inspector</h3>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleExportNote}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            title="Generate AI Summary"
            onClick={handleAiSummary}
            disabled={isLoading || !note.content || note.content.trim().length < 10}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            AI Summary
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* AI Summary Section */}
          {(aiSummary || completion || isLoading) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Summary
              </div>
              <div className="ml-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                {isLoading && !completion ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating summary...
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap">
                    {completion || aiSummary}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('templates')}
              className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-foreground"
            >
              {expandedSections.has('templates') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <FileText className="h-4 w-4" />
              Templates
            </button>

            {expandedSections.has('templates') && (
              <div className="ml-6 space-y-1">
                {NOTE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="text-xs font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Checklist Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('checklist')}
              className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-foreground"
            >
              {expandedSections.has('checklist') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CheckSquare className="h-4 w-4" />
              Checklist
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {completedItems}/{totalItems}
                </Badge>
              )}
            </button>

            {expandedSections.has('checklist') && (
              <div className="ml-6 space-y-2">
                {/* Progress Bar */}
                {totalItems > 0 && (
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                )}

                {/* Checklist Items */}
                {note.checklistItems && note.checklistItems.length > 0 ? (
                  <div className="space-y-1">
                    {note.checklistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onToggleChecklistItem(note.id, item.id)}
                        className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-left"
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center flex-shrink-0",
                            item.completed
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground"
                          )}
                        >
                          {item.completed && (
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs flex-1",
                            item.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    No checklist items yet
                  </div>
                )}

                {/* Add Item Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-7 text-xs"
                  onClick={handleAddChecklistItem}
                >
                  + Add item
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Linked Trades Section */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('trades')}
              className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-foreground"
            >
              {expandedSections.has('trades') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Link2 className="h-4 w-4" />
              Linked Trades
              {note.tradeIds.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {note.tradeIds.length}
                </Badge>
              )}
            </button>

            {expandedSections.has('trades') && (
              <div className="ml-6">
                {note.tradeIds.length > 0 ? (
                  <div className="space-y-1">
                    {note.tradeIds.map((tradeId) => (
                      <div
                        key={tradeId}
                        className="p-2 rounded-md bg-muted/50 text-xs"
                      >
                        Trade: {tradeId.slice(0, 8)}...
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">
                    No linked trades. Link trades to connect them to this note.
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-7 text-xs mt-2"
                  disabled
                  title="Coming soon"
                >
                  + Link trade
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2">
            <button
              onClick={() => toggleSection('metadata')}
              className="flex items-center gap-2 w-full text-left font-medium text-sm hover:text-foreground"
            >
              {expandedSections.has('metadata') ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Metadata
            </button>

            {expandedSections.has('metadata') && (
              <div className="ml-6 space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Created:</span>{' '}
                  {new Date(note.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>{' '}
                  {new Date(note.updatedAt).toLocaleString()}
                </div>
                {note.symbol && (
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>{' '}
                    {note.symbol}
                  </div>
                )}
                {note.sessionId && (
                  <div>
                    <span className="text-muted-foreground">Session:</span>{' '}
                    {note.sessionId}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Sparkles,
  Download,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  Calendar,
  Type,
  Plus,
  X,
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
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['templates', 'checklist', 'metadata'])
  )
  const [aiSummary, setAiSummary] = React.useState<string | null>(null)
  const [checklistInput, setChecklistInput] = React.useState('')
  const checklistInputRef = React.useRef<HTMLInputElement>(null)

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/summarize",
    onFinish: (_prompt, _options) => {
      if (completion) {
        setAiSummary(completion as string)
      }
    },
    onError: (error) => {

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

  const completionText = typeof completion === 'string' ? completion : ''

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

  const handleChecklistSubmit = () => {
    if (!note || !checklistInput.trim()) return
    onAddChecklistItem(note.id, checklistInput.trim())
    setChecklistInput('')
  }

  const handleChecklistKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleChecklistSubmit()
    }
  }

  const handleExportNote = () => {
    if (!note) return

    let content = `# ${note.title}\n\n`
    content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`
    content += `Updated: ${new Date(note.updatedAt).toLocaleString()}\n`
    if (note.tags.length > 0) {
      content += `Tags: ${note.tags.join(', ')}\n`
    }
    content += '\n---\n\n'

    const tmp = document.createElement('div')
    tmp.innerHTML = note.content
    content += tmp.textContent || tmp.innerText || ''

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title || 'untitled'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Count words
  const getWordCount = (content: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = content
    const text = tmp.textContent || tmp.innerText || ''
    if (!text.trim()) return 0
    return text.trim().split(/\s+/).length
  }

  if (!note) {
    return (
      <div className={cn("h-full flex flex-col bg-background/40", className)}>
        <div className="p-4 border-b border-border/15">
          <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/60">
            Inspector
          </h3>
        </div>
        <div className="p-8 text-center text-xs text-muted-foreground/50">
          Select a note to view details
        </div>
      </div>
    )
  }

  const completedItems = note.checklistItems?.filter(i => i.completed).length || 0
  const totalItems = note.checklistItems?.length || 0
  const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className={cn("h-full flex flex-col bg-background/40", className)}>
      {/* Header */}
      <div className="p-4 space-y-3 border-b border-border/15 bg-background/20">
        <h3 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground/60">
          Inspector
        </h3>

        {/* Quick Actions */}
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-[11px] rounded-md border-border/30 bg-card/30 text-foreground/70 hover:bg-card hover:text-foreground"
            onClick={handleExportNote}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-[11px] rounded-md border-border/30 bg-card/30 text-foreground/70 hover:bg-card hover:text-foreground"
            title="Generate AI Summary"
            onClick={handleAiSummary}
            disabled={isLoading || !note.content || note.content.trim().length < 10}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1 text-primary/70" />
            )}
            AI Summary
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* AI Summary Section */}
          {(aiSummary || completionText || isLoading) && (
            <div className="space-y-2">
              <SectionHeader
                icon={<Sparkles className="h-3.5 w-3.5 text-primary/60" />}
                title="AI Summary"
                isExpanded={true}
                onToggle={() => {}}
              />
              <div className="ml-5 p-2.5 rounded-md text-xs leading-relaxed bg-primary/5 border border-primary/10 text-foreground/70">
                {isLoading && !completionText ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating summary...
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {completionText || aiSummary}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Section */}
          <div className="space-y-1">
            <SectionHeader
              icon={<FileText className="h-3.5 w-3.5 text-muted-foreground/50" />}
              title="Templates"
              isExpanded={expandedSections.has('templates')}
              onToggle={() => toggleSection('templates')}
              count={NOTE_TEMPLATES.length}
            />

            {expandedSections.has('templates') && (
              <div className="ml-5 space-y-0.5">
                {NOTE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleApplyTemplate(template)}
                    className="w-full text-left p-2 rounded-md transition-all duration-150 text-xs text-foreground/70 hover:bg-gradient-to-r hover:from-primary/[0.04] hover:to-transparent hover:border-l-primary/30"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="mt-0.5 line-clamp-1 text-muted-foreground/60">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/15" />

          {/* Checklist Section */}
          <div className="space-y-1">
            <SectionHeader
              icon={<CheckSquare className="h-3.5 w-3.5 text-muted-foreground/50" />}
              title="Checklist"
              isExpanded={expandedSections.has('checklist')}
              onToggle={() => toggleSection('checklist')}
              count={totalItems > 0 ? `${completedItems}/${totalItems}` : undefined}
            />

            {expandedSections.has('checklist') && (
              <div className="ml-5 space-y-1.5">
                {/* Progress Bar */}
                {totalItems > 0 && (
                  <div className="w-full rounded-full h-1.5 overflow-hidden bg-card/40">
                    <div
                      className="h-full transition-[width] duration-300 rounded-full bg-primary/60"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                )}

                {/* Checklist Items */}
                {note.checklistItems && note.checklistItems.length > 0 ? (
                  <div className="space-y-0.5">
                    {note.checklistItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onToggleChecklistItem(note.id, item.id)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-md transition-colors duration-150 text-left text-xs text-foreground/70 hover:bg-card/30"
                      >
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded flex items-center justify-center flex-shrink-0 border",
                            item.completed
                              ? "bg-primary/70 border-primary/70"
                              : "bg-transparent border-border/40"
                          )}
                        >
                          {item.completed && (
                            <svg className="h-2.5 w-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
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
                            "flex-1",
                            item.completed && "line-through text-muted-foreground/50"
                          )}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-[11px] text-muted-foreground/50">
                    No checklist items yet
                  </div>
                )}

                {/* Add Checklist Item */}
                <div className="flex items-center gap-1.5">
                  <Plus className="h-3 w-3 flex-shrink-0 text-muted-foreground/40" />
                  <input
                    ref={checklistInputRef}
                    type="text"
                    value={checklistInput}
                    onChange={(e) => setChecklistInput(e.target.value)}
                    onKeyDown={handleChecklistKeyDown}
                    placeholder="Add item..."
                    className="flex-1 h-6 px-1.5 text-[11px] bg-transparent border-none outline-none rounded-md text-foreground/70 placeholder:text-muted-foreground/40 caret-primary"
                  />
                  {checklistInput.trim() && (
                    <button
                      onClick={handleChecklistSubmit}
                      className="text-[11px] px-1.5 py-0.5 rounded-md text-primary/70 hover:text-primary transition-colors duration-150"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/15" />

          {/* Metadata */}
          <div className="space-y-1">
            <SectionHeader
              icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground/50" />}
              title="Details"
              isExpanded={expandedSections.has('metadata')}
              onToggle={() => toggleSection('metadata')}
            />

            {expandedSections.has('metadata') && (
              <div className="ml-5 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground/50" />
                  <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground/50" />
                  <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="h-3 w-3 text-muted-foreground/50" />
                  <span>{getWordCount(note.content)} words</span>
                </div>
                {note.symbol && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/50">Symbol:</span>
                    <span className="text-primary/80">{note.symbol}</span>
                  </div>
                )}
                {note.sessionId && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/50">Session:</span>
                    <span>{note.sessionId}</span>
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

// Reusable section header component
function SectionHeader({
  icon,
  title,
  isExpanded,
  onToggle,
  count,
}: {
  icon: React.ReactNode
  title: string
  isExpanded: boolean
  onToggle: () => void
  count?: string | number
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground/70 transition-colors duration-150"
    >
      {isExpanded ? (
        <ChevronDown className="h-3 w-3 flex-shrink-0" />
      ) : (
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
      )}
      {icon}
      <span className="flex-1">{title}</span>
      {count !== undefined && (
        <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-card/30 text-muted-foreground/50">
          {count}
        </span>
      )}
    </button>
  )
}

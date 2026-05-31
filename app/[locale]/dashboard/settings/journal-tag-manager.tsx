'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Save, Trash2 } from 'lucide-react'
import { DEFAULT_TAG_CATEGORIES } from '@/lib/journal-utils'
import { toast } from 'sonner'

// Server Actions defined locally to prevent Prisma/pg from being bundled on the client
async function getJournalTagTemplatesAction() {
  'use server'
  const { getJournalTagTemplatesAction: realAction } = await import('@/server/journal-tags')
  return realAction()
}

async function saveJournalTagTemplateAction(name: string, tags: string[]) {
  'use server'
  const { saveJournalTagTemplateAction: realAction } = await import('@/server/journal-tags')
  return realAction(name, tags)
}

async function deleteJournalTagTemplateAction(name: string) {
  'use server'
  const { deleteJournalTagTemplateAction: realAction } = await import('@/server/journal-tags')
  return realAction(name)
}

async function resetJournalTagTemplatesToDefaultsAction() {
  'use server'
  const { resetJournalTagTemplatesToDefaultsAction: realAction } = await import('@/server/journal-tags')
  return realAction()
}

type TagTemplates = Record<string, string[]>

export function JournalTagManager() {
  const [templates, setTemplates] = useState<TagTemplates>(DEFAULT_TAG_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newTag, setNewTag] = useState<Record<string, string>>({})

  const loadTemplates = async () => {
    setLoading(true)
    try {
      const data = await getJournalTagTemplatesAction()
      setTemplates(data)
    } catch (e) {
      toast.error('Failed to load tag templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleAddTag = async (category: string) => {
    const tag = (newTag[category] || '').trim()
    if (!tag) return

    const current = templates[category] || []
    if (current.includes(tag)) {
      toast.info('Tag already exists in this category')
      return
    }

    setSaving(category)
    try {
      const updated = [...current, tag]
      await saveJournalTagTemplateAction(category, updated)
      setTemplates(prev => ({ ...prev, [category]: updated }))
      setNewTag(prev => ({ ...prev, [category]: '' }))
      toast.success(`Added "${tag}" to ${category}`)
    } catch {
      toast.error('Failed to save tag')
    } finally {
      setSaving(null)
    }
  }

  const handleRemoveTag = async (category: string, tag: string) => {
    setSaving(category)
    try {
      const updated = (templates[category] || []).filter(t => t !== tag)
      await saveJournalTagTemplateAction(category, updated)
      setTemplates(prev => ({ ...prev, [category]: updated }))
      toast.success(`Removed "${tag}" from ${category}`)
    } catch {
      toast.error('Failed to remove tag')
    } finally {
      setSaving(null)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all custom tags to the rich defaults? This cannot be undone.')) return

    setLoading(true)
    try {
      const data = await resetJournalTagTemplatesToDefaultsAction()
      setTemplates(data)
      toast.success('Tag templates reset to rich defaults')
    } catch {
      toast.error('Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Journal Tag Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Loading rich tag library...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Journal Tag Templates</CardTitle>
          <CardDescription>
            Rich defaults for daily reflections and per-trade notes. Customize per category. Changes are available immediately in the daily journal.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(templates).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{category}</div>
              <div className="text-xs text-muted-foreground">{tags.length} tags</div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTag(category, tag)}
                >
                  {tag}
                  <Trash2 className="ml-1 h-3 w-3" />
                </Badge>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No tags yet</span>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTag[category] || ''}
                onChange={(e) => setNewTag(prev => ({ ...prev, [category]: e.target.value }))}
                placeholder={`Add tag to ${category}`}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(category)
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddTag(category)}
                disabled={saving === category || !(newTag[category] || '').trim()}
              >
                {saving === category ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}

        <p className="text-[11px] text-muted-foreground pt-2">
          These tags power the daily journal (Mental State, Daily Goals, Market Bias, Rate Your Day, etc.) and per-trade notes. Weekday auto-tagging is applied automatically.
        </p>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { Plus, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEFAULT_TAG_TABS, TAG_TABS_STORAGE_KEY } from '../lib/journal-constants'
import type { TagTab } from '../lib/journal-types'

interface TagTabsProps {
  activeTags: string[]
  onChange: (tags: string[]) => void
}

function loadTabs(): TagTab[] {
  if (typeof window === 'undefined') return DEFAULT_TAG_TABS
  try {
    const stored = localStorage.getItem(TAG_TABS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as TagTab[]
      return parsed.length > 0 ? parsed : DEFAULT_TAG_TABS
    }
  } catch {}
  return DEFAULT_TAG_TABS
}

function saveTabs(tabs: TagTab[]) {
  try {
    localStorage.setItem(TAG_TABS_STORAGE_KEY, JSON.stringify(tabs))
  } catch {}
}

export function TagTabs({ activeTags, onChange }: TagTabsProps) {
  const [tabs, setTabs] = useState<TagTab[]>(loadTabs)
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '')
  const [editingTag, setEditingTag] = useState<{ tabId: string; oldName: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [addValue, setAddValue] = useState('')
  const [editingTabName, setEditingTabName] = useState<string | null>(null)
  const [tabNameValue, setTabNameValue] = useState('')
  const [showNewTabInput, setShowNewTabInput] = useState(false)
  const [newTabName, setNewTabName] = useState('')

  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]

  const persistAndSetTabs = useCallback((newTabs: TagTab[]) => {
    setTabs(newTabs)
    saveTabs(newTabs)
  }, [])

  const toggleTag = useCallback((tag: string) => {
    if (activeTags.includes(tag)) {
      onChange(activeTags.filter(t => t !== tag))
    } else {
      onChange([...activeTags, tag])
    }
  }, [activeTags, onChange])

  const startEdit = useCallback((tabId: string, tagName: string) => {
    setEditingTag({ tabId, oldName: tagName })
    setEditValue(tagName)
  }, [])

  const confirmEdit = useCallback(() => {
    if (!editingTag || !editValue.trim()) return
    const newTabs = tabs.map(tab => {
      if (tab.id !== editingTag.tabId) return tab
      return {
        ...tab,
        tags: tab.tags.map(t => t === editingTag.oldName ? editValue.trim() : t),
      }
    })
    const newActiveTags = activeTags.map(t => t === editingTag.oldName ? editValue.trim() : t)
    persistAndSetTabs(newTabs)
    onChange(newActiveTags)
    setEditingTag(null)
    setEditValue('')
  }, [editingTag, editValue, tabs, activeTags, persistAndSetTabs, onChange])

  const cancelEdit = useCallback(() => {
    setEditingTag(null)
    setEditValue('')
  }, [])

  const confirmAdd = useCallback(() => {
    if (!addValue.trim() || !activeTab) return
    if (activeTab.tags.includes(addValue.trim())) {
      setAddingTag(false)
      setAddValue('')
      return
    }
    const newTabs = tabs.map(tab => {
      if (tab.id !== activeTab.id) return tab
      return { ...tab, tags: [...tab.tags, addValue.trim()] }
    })
    persistAndSetTabs(newTabs)
    setAddingTag(false)
    setAddValue('')
  }, [addValue, activeTab, tabs, persistAndSetTabs])

  const deleteTag = useCallback((tabId: string, tagName: string) => {
    const newTabs = tabs.map(tab => {
      if (tab.id !== tabId) return tab
      return { ...tab, tags: tab.tags.filter(t => t !== tagName) }
    })
    const newActive = activeTags.filter(t => t !== tagName)
    persistAndSetTabs(newTabs)
    onChange(newActive)
  }, [tabs, activeTags, persistAndSetTabs, onChange])

  const confirmTabRename = useCallback(() => {
    if (!editingTabName || !tabNameValue.trim()) return
    const newTabs = tabs.map(tab => {
      if (tab.id !== editingTabName) return tab
      return { ...tab, name: tabNameValue.trim() }
    })
    persistAndSetTabs(newTabs)
    setEditingTabName(null)
    setTabNameValue('')
  }, [editingTabName, tabNameValue, tabs, persistAndSetTabs])

  const addNewTab = useCallback(() => {
    if (!newTabName.trim()) return
    const id = newTabName.trim().toLowerCase().replace(/\s+/g, '-')
    const newTab: TagTab = { id, name: newTabName.trim(), tags: [] }
    const newTabs = [...tabs, newTab]
    persistAndSetTabs(newTabs)
    setActiveTabId(id)
    setNewTabName('')
    setShowNewTabInput(false)
  }, [newTabName, tabs, persistAndSetTabs])

  const deleteTab = useCallback((tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId)
    if (newTabs.length === 0) return
    persistAndSetTabs(newTabs)
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id)
    }
  }, [tabs, activeTabId, persistAndSetTabs])

  return (
    <div className="space-y-3">
      {/* Active tags summary */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 px-0.5">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/40">Selected:</span>
          {activeTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(activeTags.filter(t => t !== tag))}
                className="rounded-full p-0.5 hover:bg-primary/25"
              >
                <X size={7} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map(tab => (
          <div key={tab.id} className="group relative">
            {editingTabName === tab.id ? (
              <div className="flex items-center gap-0.5">
                <input
                  value={tabNameValue}
                  onChange={e => setTabNameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmTabRename()}
                  className="h-6 w-24 rounded border-0 bg-background/40 px-1.5 text-[10px] focus:outline-none"
                  autoFocus
                />
                <button onClick={confirmTabRename} className="rounded p-0.5 hover:bg-primary/10 text-primary"><Check size={10} /></button>
                <button onClick={() => setEditingTabName(null)} className="rounded p-0.5 hover:bg-muted/20 text-muted-foreground"><X size={10} /></button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                  activeTabId === tab.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/20',
                )}
              >
                {tab.name}
              </button>
            )}
            {tabs.length > 1 && !editingTabName && (
              <div className="absolute -right-1.5 -top-1 hidden group-hover:flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => { setEditingTabName(tab.id); setTabNameValue(tab.name) }}
                  className="rounded-full bg-background p-0.5 shadow-sm hover:text-primary"
                >
                  <Pencil size={8} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTab(tab.id)}
                  className="rounded-full bg-background p-0.5 shadow-sm hover:text-destructive"
                >
                  <X size={8} />
                </button>
              </div>
            )}
          </div>
        ))}
        {showNewTabInput ? (
          <div className="flex items-center gap-0.5">
            <input
              value={newTabName}
              onChange={e => setNewTabName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNewTab()}
              placeholder="Tab name"
              className="h-6 w-24 rounded border-0 bg-background/40 px-1.5 text-[10px] focus:outline-none"
              autoFocus
            />
            <button onClick={addNewTab} className="rounded p-0.5 hover:bg-primary/10 text-primary"><Check size={10} /></button>
            <button onClick={() => setShowNewTabInput(false)} className="rounded p-0.5 hover:bg-muted/20 text-muted-foreground"><X size={10} /></button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewTabInput(true)}
            className="rounded-lg px-2 py-1 text-[10px] text-muted-foreground/40 hover:text-foreground hover:bg-muted/20"
          >
            + Tab
          </button>
        )}
      </div>

      {/* Tags in active tab */}
      {activeTab && (
        <div className="flex flex-wrap gap-1.5">
          {activeTab.tags.map(tag => {
            const isActive = activeTags.includes(tag)
            const isCurrentlyEditing = editingTag?.tabId === activeTab.id && editingTag?.oldName === tag
            return isCurrentlyEditing ? (
              <div key={tag} className="flex items-center gap-0.5 rounded-full bg-background/60 px-2 py-0.5">
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                  className="h-5 w-20 bg-transparent text-[10px] text-foreground outline-none"
                  autoFocus
                />
                <button onClick={confirmEdit} className="rounded p-0.5 hover:bg-primary/10 text-primary"><Check size={8} /></button>
                <button onClick={cancelEdit} className="rounded p-0.5 hover:bg-muted/20 text-muted-foreground"><X size={8} /></button>
              </div>
            ) : (
              <span key={tag} className="group/tag relative">
                <button
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                    isActive
                      ? 'bg-primary/20 text-primary shadow-sm'
                      : 'bg-muted/30 text-muted-foreground/70 hover:text-foreground hover:bg-muted/50',
                  )}
                >
                  {tag}
                </button>
                <div className="absolute -right-2 -top-1.5 hidden group-hover/tag:flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => startEdit(activeTab.id, tag)}
                    className="rounded-full bg-background p-0.5 shadow-sm hover:text-primary"
                  >
                    <Pencil size={7} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTag(activeTab.id, tag)}
                    className="rounded-full bg-background p-0.5 shadow-sm hover:text-destructive"
                  >
                    <X size={7} />
                  </button>
                </div>
              </span>
            )
          })}

          {addingTag ? (
            <div className="flex items-center gap-0.5 rounded-full bg-background/60 px-2 py-0.5">
              <input
                value={addValue}
                onChange={e => setAddValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmAdd()}
                placeholder="Tag name"
                className="h-5 w-20 bg-transparent text-[10px] text-foreground outline-none placeholder:text-muted-foreground/40"
                autoFocus
              />
              <button onClick={confirmAdd} className="rounded p-0.5 hover:bg-primary/10 text-primary"><Check size={8} /></button>
              <button onClick={() => { setAddingTag(false); setAddValue('') }} className="rounded p-0.5 hover:bg-muted/20 text-muted-foreground"><X size={8} /></button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingTag(true)}
              className="flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[10px] text-muted-foreground/40 hover:text-foreground hover:bg-muted/20"
            >
              <Plus size={10} /> Tag
            </button>
          )}
        </div>
      )}
    </div>
  )
}

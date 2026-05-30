'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { unifiedChipClassName } from '@/components/layout/unified-page-recipes'
import { SUGGESTED_TAGS } from '../lib/journal-constants'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = SUGGESTED_TAGS.filter(
    t => t.toLowerCase().includes(input.toLowerCase()) && !tags.includes(t)
  )

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [tags, onChange])

  const removeTag = useCallback((tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }, [tags, onChange])

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span
            key={tag}
            className={cn(unifiedChipClassName, 'flex items-center gap-1 text-[11px]')}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="flex items-center gap-1.5">
          <input
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) {
                e.preventDefault()
                addTag(input)
              }
            }}
            placeholder={placeholder}
            className="h-7 w-40 rounded-md border border-border/30 bg-background/40 px-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => input.trim() && addTag(input)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/30 bg-background/40 text-muted-foreground hover:text-primary"
          >
            <Plus size={12} />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-1 max-h-32 overflow-y-auto rounded-md border border-border/30 bg-card shadow-lg">
            {suggestions.slice(0, 8).map(tag => (
              <button
                key={tag}
                type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  addTag(tag)
                }}
                className="block w-full px-2.5 py-1 text-left text-xs hover:bg-primary/10"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

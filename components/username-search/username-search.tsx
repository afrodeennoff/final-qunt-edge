"use client"

import { useState, useEffect } from 'react'
import { Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchUserResult {
  id: string
  username: string
  email: string
}

interface UsernameSearchProps {
  onSelectUser: (userId: string, username: string) => void
}

export function UsernameSearch({ onSelectUser }: UsernameSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUserResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.users)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleUserSelect = (userId: string, username: string) => {
    onSelectUser(userId, username)
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const selected = results[selectedIndex]
          handleUserSelect(selected.id, selected.username)
        }
        break
      case 'Escape':
        setQuery('')
        setResults([])
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
      </div>

      {isLoading && query.length >= 2 && (
        <div className="absolute mt-1 w-full rounded-lg border border-input bg-background p-2 shadow-md">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/30 bg-background shadow-sm max-h-80 overflow-auto">
          {results.map((user, index) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id, user.username)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors",
                index === selectedIndex && "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground text-sm">{user.email}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
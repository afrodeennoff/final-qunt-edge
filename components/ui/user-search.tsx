'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
interface UserSearchProps {
  onSelect?: (user: any) => void
  placeholder?: string
}

export function UserSearch({ onSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [query, setQuery] = useState('')
  // Note: This will need to be connected to actual user data from the API
  // For now, using mock data structure
  const filteredUsers = useMemo(() => {
    if (!query) return []
    // This will need actual user data from the store or API
    return [
      {
        id: '1',
        username: 'traderjohn',
        email: 'john@example.com',
        avatar: null
      }
    ].filter(user =>
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10"
      />

      {filteredUsers.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-md z-50">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="flex cursor-pointer items-center gap-2 p-2 hover:bg-accent"
              onClick={() => onSelect?.(user)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar ?? undefined} alt={user.username} />
                <AvatarFallback className="bg-muted text-xs">
                  {(user.username || user.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.username || 'Unnamed user'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              {user.username && (
                <Badge variant="secondary" className="text-xs">
                  @{user.username}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

export function UsernameInput({ value, onChange, onBlur, disabled }: UsernameInputProps) {
  const [isValid, setIsValid] = useState(true)
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<'checking' | 'available' | 'taken'>('checking')

  const validateUsername = (username: string): boolean => {
    if (!username) return false
    if (username.length < 3) return false
    if (username.length > 30) return false
    return /^[a-zA-Z0-9_]+$/.test(username)
  }

  useEffect(() => {
    if (!value || value.length < 3) {
      setIsValid(validateUsername(value))
      setAvailability('checking')
      return
    }

    setIsChecking(true)
    setAvailability('checking')

    const checkAvailability = async () => {
      try {
        const response = await fetch('/api/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: value }),
        })

        const data = await response.json()
        setAvailability(data.available ? 'available' : 'taken')
      } catch (error) {
        console.error('Error checking username:', error)
        setAvailability('taken')
      } finally {
        setIsChecking(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
    onChange(newValue)
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="Enter username"
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !isValid && "border-red-500 focus:ring-red-500"
          )}
        />
        {isChecking && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {availability === 'available' && (
          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
        )}
        {availability === 'taken' && (
          <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Username must be 3-30 characters and can only contain letters, numbers, and underscores
      </p>

      {availability === 'taken' && (
        <p className="mt-1 text-xs text-red-500">This username is already taken</p>
      )}

      {value && !isValid && (
        <div className="mt-2 text-xs text-red-500 space-y-1">
          {value.length < 3 && (
            <p>Username must be at least 3 characters long</p>
          )}
          {value.length > 30 && (
            <p>Username must be less than 30 characters</p>
          )}
          {!/^[a-zA-Z0-9_]+$/.test(value) && (
            <p>Username can only contain letters, numbers, and underscores</p>
          )}
        </div>
      )}
    </div>
  )
}
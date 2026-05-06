'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Input } from './input'
import { usernameSchema } from '@/lib/validations/user'

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  available?: boolean
  placeholder?: string
}

export function UsernameInput({ value, onChange, available = true, placeholder = "Enter username" }: UsernameInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const validateUsername = (username: string) => {
    try {
      usernameSchema.parse(username)
      setIsValid(true)
      return true
    } catch {
      setIsValid(false)
      return false
    }
  }

  const handleChange = (username: string) => {
    onChange(username)
    validateUsername(username)
  }

  const getValidationMessage = () => {
    if (!value) return null

    if (isValid === false) {
      if (value.length < 3) return "Username must be at least 3 characters"
      if (value.length > 30) return "Username must be at most 30 characters"
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores"
      return "Invalid username"
    }

    if (isValid === true && !available) return "Username is already taken"
    if (isValid === true) return "Username is available"

    return null
  }

  const isInvalid = isValid === false || (isValid === true && !available)
  const isValidAndAvailable = isValid === true && available

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={isInvalid ? 'border-red-500' : isValidAndAvailable ? 'border-green-500' : ''}
      />
      {value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValidAndAvailable ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isInvalid ? (
            <X className="h-4 w-4 text-red-500" />
          ) : (
            <div className="h-4 w-4 animate-pulse bg-muted rounded" />
          )}
        </div>
      )}
      {getValidationMessage() && (
        <p className={`mt-1 text-xs ${
          isInvalid ? 'text-red-500' : 'text-green-500'
        }`}>
          {getValidationMessage()}
        </p>
      )}
    </div>
  )
}
'use client'

import { useState, useRef, useCallback } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface UsernameInputProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  className?: string
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  minLength?: number
}

interface ValidationResult {
  isValid: boolean
  isAvailable: boolean
  message?: string
}

export function UsernameInput({
  value = '',
  onChange,
  onSubmit,
  className,
  disabled = false,
  placeholder = 'Choose a username',
  maxLength = 30,
  minLength = 3,
}: UsernameInputProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [touched, setTouched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const checkAvailability = useCallback(async (username: string): Promise<ValidationResult> => {
    setIsValidating(true)
    setValidation(null)

    try {
      const response = await fetch(`/api/auth/availability?username=${encodeURIComponent(username)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check availability')
      }

      return {
        isValid: true,
        isAvailable: data.available,
        message: data.available ? 'Username is available' : 'Username is already taken',
      }
    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        message: error instanceof Error ? error.message : 'Validation failed',
      }
    } finally {
      setIsValidating(false)
    }
  }, [])

  const validateUsername = useCallback(async (username: string): Promise<ValidationResult> => {
    if (!username) {
      return { isValid: false, isAvailable: false, message: 'Username is required' }
    }

    if (username.length < minLength || username.length > maxLength) {
      return { isValid: false, isAvailable: false, message: `Must be ${minLength}-${maxLength} characters` }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { isValid: false, isAvailable: false, message: 'Only letters, numbers, underscores, and hyphens' }
    }

    return checkAvailability(username)
  }, [minLength, maxLength, checkAvailability])

  const handleInputChange = (newValue: string) => {
    onChange?.(newValue)
    setTouched(true)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (newValue.length < minLength || newValue.length > maxLength) {
      setValidation({ isValid: false, isAvailable: false, message: `Must be ${minLength}-${maxLength} characters` })
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newValue)) {
      setValidation({ isValid: false, isAvailable: false, message: 'Only letters, numbers, underscores, and hyphens' })
      return
    }

    setValidation(null)

    debounceRef.current = setTimeout(async () => {
      const result = await checkAvailability(newValue)
      setValidation(result)
    }, 500)
  }

  const handleSubmit = async () => {
    if (!value || value.length < minLength) return

    const result = await validateUsername(value)
    setValidation(result)

    if (result.isValid && result.isAvailable && onSubmit) {
      onSubmit(value)
    }
  }

  const getStatusIcon = () => {
    if (!touched || !validation) return null

    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    }

    if (!validation.isValid) {
      return <XCircle className="h-4 w-4 text-destructive" />
    }

    if (validation.isAvailable) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }

    return <XCircle className="h-4 w-4 text-destructive" />
  }

  const getStatusText = () => {
    if (!touched) return ''
    if (isValidating) return 'Checking availability...'
    return validation?.message || ''
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="username">
            Username
            <span className="text-muted-foreground ml-2">
              ({value.length}/{maxLength})
            </span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="username"
                type="text"
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  'pr-10',
                  validation?.isValid === false && 'border-destructive focus:border-destructive',
                  validation?.isValid === true && validation.isAvailable && 'border-green-500 focus:border-green-500',
                )}
                maxLength={maxLength}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getStatusIcon()}
              </div>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !value || isValidating || validation?.isValid === false || !validation?.isAvailable}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>

        {(touched || value) && (
          <div className="space-y-2">
            {touched && validation && (
              <p className={cn(
                'text-sm',
                !validation.isValid ? 'text-destructive' :
                validation.isAvailable ? 'text-green-600' : 'text-muted-foreground',
              )}>
                {getStatusText()}
              </p>
            )}

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Username requirements:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>At least {minLength} characters</li>
                <li>Maximum {maxLength} characters</li>
                <li>Letters, numbers, underscores, and hyphens only</li>
                <li>Must be unique</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

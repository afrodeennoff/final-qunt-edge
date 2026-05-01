'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent, CardDescription } from './card'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

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
  const t = useI18n()
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [touched, setTouched] = useState(false)

  const validateUsername = async (username: string): Promise<ValidationResult> => {
    if (!username) {
      return {
        isValid: false,
        isAvailable: false,
        message: t('validation.required', { field: 'Username' })
      }
    }

    if (username.length < minLength || username.length > maxLength) {
      return {
        isValid: false,
        isAvailable: false,
        message: t('validation.usernameLength', { min: minLength, max: maxLength })
      }
    }

    // Username regex: letters, numbers, underscores, hyphens only
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        isValid: false,
        isAvailable: false,
        message: t('validation.usernameCharacters')
      }
    }

    if (username === value) {
      // If same as current value, we can reuse previous validation
      return validation || { isValid: true, isAvailable: true }
    }

    setIsValidating(true)
    setValidation(null)

    try {
      const response = await fetch(`/api/auth/availability?username=${encodeURIComponent(username)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check username availability')
      }

      return {
        isValid: true,
        isAvailable: data.available,
        message: data.available
          ? t('validation.usernameAvailable')
          : t('validation.usernameTaken')
      }
    } catch (error) {
      return {
        isValid: false,
        isAvailable: false,
        message: error instanceof Error ? error.message : t('validation.error')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleInputChange = async (newValue: string) => {
    onChange?.(newValue)
    setTouched(true)

    if (newValue.length < minLength || newValue.length > maxLength) {
      setValidation({
        isValid: false,
        isAvailable: false,
        message: t('validation.usernameLength', { min: minLength, max: maxLength })
      })
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(newValue)) {
      setValidation({
        isValid: false,
        isAvailable: false,
        message: t('validation.usernameCharacters')
      })
      return
    }

    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateUsername(newValue)
    }, 500)

    return () => clearTimeout(timeoutId)
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
    if (isValidating) return t('validation.checking')
    return validation?.message || ''
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="username">
            {t('settings.username')}
            <span className="text-muted-foreground ml-2">
              ({value.length}/{maxLength})
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="username"
              type="text"
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'flex-1',
                validation?.isValid === false && 'border-destructive focus:border-destructive',
                validation?.isValid === true && validation.isAvailable && 'border-green-500 focus:border-green-500'
              )}
              maxLength={maxLength}
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled || !value || isValidating || validation?.isValid === false || !validation?.isAvailable}
              size="sm"
            >
              {t('common.save')}
            </Button>
          </div>
        </div>

        {(touched || value) && (
          <div className="space-y-2">
            {touched && validation && (
              <p className={cn(
                'text-sm',
                !validation.isValid ? 'text-destructive' :
                validation.isAvailable ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {getStatusText()}
              </p>
            )}

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>{t('validation.usernameRules.title')}</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>{t('validation.usernameRules.minLength', { count: minLength })}</li>
                <li>{t('validation.usernameRules.maxLength', { count: maxLength })}</li>
                <li>{t('validation.usernameRules.characters')}</li>
                <li>{t('validation.usernameRules.unique')}</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
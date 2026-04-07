export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  return { valid: errors.length === 0, errors }
}

export interface PasswordRequirement {
  key: string
  label: string
  met: boolean
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { key: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: (password?.length ?? 0) >= PASSWORD_MIN_LENGTH },
    { key: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { key: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { key: 'digit', label: 'One number', met: /\d/.test(password) },
  ]
}

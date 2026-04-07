export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return maskString(email)
  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)
  const visibleChars = Math.min(2, localPart.length)
  return `${localPart.slice(0, visibleChars)}***@${domain}`
}

export function maskString(value: string, visibleStart = 2, visibleEnd = 2): string {
  if (!value) return ''
  if (value.length <= visibleStart + visibleEnd) return value + '****'
  return `${value.slice(0, visibleStart)}***${value.slice(-visibleEnd)}`
}

export function redactUserResponse<T>(data: T, fieldsToRedact: string[]): T {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === 'object' && item !== null ? redactUserResponse(item, fieldsToRedact) : item
    ) as T
  }

  const result = { ...data } as Record<string, unknown>
  for (const key of Object.keys(result)) {
    const value = result[key]
    if (fieldsToRedact.includes(key) && typeof value === 'string') {
      result[key] = value.includes('@') ? maskEmail(value) : maskString(value)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactUserResponse(value, fieldsToRedact)
    }
  }
  return result as T
}

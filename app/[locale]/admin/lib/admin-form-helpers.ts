/**
 * Shared admin form helper functions.
 * Extracted from duplicated definitions in admin page files.
 */

/**
 * Returns a required text value, or falls back to the provided default.
 */
export function requireText(value: FormDataEntryValue | null, fallback = ''): string {
  return value?.toString().trim() || fallback
}

/**
 * Parses an optional numeric string, returning undefined if empty/invalid.
 */
export function parseOptionalNumber(value: FormDataEntryValue | null): number | undefined {
  const text = value?.toString().trim()
  if (!text) return undefined
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Normalizes an optional text field — returns undefined if empty/whitespace.
 */
export function normalizeOptionalText(value: FormDataEntryValue | null): string | undefined {
  const text = value?.toString().trim()
  return text || undefined
}

/**
 * Parses an optional date string, returning undefined if empty/invalid.
 */
export function parseOptionalDate(value: FormDataEntryValue | null): Date | null | undefined {
  const text = value?.toString().trim()
  if (!text) return null
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

/**
 * Parses an optional number for update — returns null if empty, undefined if not provided.
 */
export function parseOptionalNumberForUpdate(value: FormDataEntryValue | null): number | null | undefined {
  const text = value?.toString().trim()
  if (!text) return null
  const parsed = Number.parseFloat(text)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Normalizes an optional text field for update — returns null if empty, undefined if not provided.
 */
export function normalizeOptionalTextForUpdate(value: FormDataEntryValue | null): string | null | undefined {
  const text = value?.toString().trim()
  return typeof text === 'string' ? (text || null) : undefined
}

/**
 * Extracts a required string from FormData, throwing if missing.
 */
export function requireFormString(formData: FormData, key: string): string {
  const val = formData.get(key)
  if (!val || typeof val !== 'string') throw new Error('Missing required field: ' + key)
  return val
}

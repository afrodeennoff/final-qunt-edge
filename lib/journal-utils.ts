/**
 * Daily journal utilities (pure functions, safe to import anywhere).
 * Used for rich reflection support (tags, auto-tagging, etc.).
 */

/**
 * Returns the weekday auto-tag for a given date (no French).
 * Used for automatic tagging of daily journal entries.
 */
export function getWeekdayAutoTag(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getUTCDay() // 0=Sunday ... 6=Saturday
  const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return map[day] || 'Weekday'
}

/**
 * Merges weekday auto-tag into a customTags array (idempotent).
 */
export function withWeekdayAutoTag(customTags: string[] | undefined, date: Date | string): string[] {
  const tag = getWeekdayAutoTag(date)
  const base = customTags || []
  if (base.includes(tag)) return base
  return [...base, tag]
}

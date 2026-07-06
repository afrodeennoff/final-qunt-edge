/**
 * Daily journal utilities (pure functions, safe to import anywhere).
 * Used for rich reflection support (tags, auto-tagging, etc.).
 */

export const DEFAULT_TAG_CATEGORIES: Record<string, string[]> = {
  'Week Days': [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'Best Day', 'Worst Day'
  ],
  'Setup Types': [
    'Breakout', 'Reversal', 'Trend Following', 'Scalp', 'Swing', 'Momentum',
    'Mean Reversion', 'Gap Fill', 'Range Break', 'News Play', 'Opening Range', 'Closing Range',
    'Fader', 'Break and Retest', 'Pullback Entry', 'Continuation'
  ],
  'Market Conditions': [
    'Trending', 'Ranging', 'Volatile', 'Low Vol', 'Pre-News', 'Post-News',
    'Overnight', 'Session Open', 'High Impact News', 'Low Liquidity'
  ],
  'Mistakes': [
    'FOMO', 'Revenge Trade', 'Overtrading', 'Premature Entry', 'Late Entry',
    'Moving Stops', 'Abandoning Plan', 'Overconfidence', 'Hesitation', 'Tilt',
    'Chasing', 'Averaging Down', 'No Stop', 'Too Big Size'
  ],
  'Psychology': [
    'Confident', 'Anxious', 'Focused', 'Distracted', 'Patient', 'Impatient',
    'Disciplined', 'Tired', 'Euphoric', 'Fearful', 'Greedy', 'Calm'
  ],
  'Execution': [
    'Perfect Entry', 'Slippage', 'Good Risk', 'Poor Risk', 'Scaled In',
    'Scaled Out', 'Held Too Long', 'Cut Too Early', 'Good Exit', 'Bad Exit'
  ],
  'Environment': [
    'Home', 'Office', 'Mobile', 'Desktop', 'With Mentor', 'Alone',
    'Tired', 'Well Rested', 'Distracted Environment'
  ]
}

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

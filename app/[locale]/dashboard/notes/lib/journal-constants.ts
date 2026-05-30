import type { JournalFilters, JournalSortField, TagTab } from './journal-types'

export const DEFAULT_FILTERS: JournalFilters = {
  status: 'all',
  pnl: 'all',
  tags: [],
  instrument: null,
  direction: 'all',
  dateFrom: null,
  dateTo: null,
  search: '',
  sort: 'date-desc' as JournalSortField,
}

export const JOURNAL_PAGE_SIZE = 30

export const LOCALSTORAGE_KEY_PREFIX = 'journal-pending'

export const SUGGESTED_TAGS = [
  'FOMO',
  'revenge trade',
  'patience',
  'overtrading',
  'good discipline',
  'plan followed',
  'plan violated',
  'anxious',
  'confident',
  'tilt',
  'boredom trade',
  'news trade',
  'breakout',
  'reversal',
  'trend following',
  'scalp',
  'swing',
]

export const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Below average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export const DEFAULT_TAG_TABS: TagTab[] = [
  {
    id: 'week-days',
    name: 'Week Days',
    tags: [
      'Best Day',
      'Worst Day',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  },
  {
    id: 'general',
    name: 'General',
    tags: [...SUGGESTED_TAGS],
  },
]

export const TAG_TABS_STORAGE_KEY = 'journal-tag-tabs'

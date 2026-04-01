export const SUPPORTED_TIMEZONES = [
  'UTC',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number]

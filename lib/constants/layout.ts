import type { CSSProperties } from 'react'

// Header constants (consistent across Dashboard, Teams, Admin)
export const HEADER_HEIGHT = 'h-16'

export const HEADER_Z_INDEX = 'z-50'

export const HEADER_BORDER = 'border-b border-transparent'

export const HEADER_BG = 'bg-background/95 backdrop-blur-md'

// Content padding constants
export const CONTENT_PADDING = 'px-4 sm:px-6 lg:px-8'

export const CONTENT_PADDING_Y = 'py-6 sm:py-8 lg:py-8'

export const LOCALE_SOFT_BORDER_STYLE: CSSProperties = {
  ['--border' as string]: '214 10% 6%',
  ['--input' as string]: '214 10% 6%',
  ['--sidebar-border' as string]: '214 10% 5%',
  ['--v2-border' as string]: '214 10% 6%',
  ['--v2-border-subtle' as string]: '214 9% 4%',
  ['--frost-border' as string]: 'rgba(24, 30, 37, 0.14)',
  ['--frost-border-strong' as string]: 'rgba(34, 42, 52, 0.2)',
  ['--frost-border-alt' as string]: 'rgba(18, 24, 31, 0.1)',
  ['--frost-shadow' as string]: '0 24px 48px -32px rgba(0, 0, 0, 0.72)',
  ['--mk-border' as string]: '214 10% 6%',
  ['--precision-panel-line' as string]: '214 10% 6%',
  ['--rs-frost-border' as string]: '214 10% 6%',
  ['--rs-frost-border-alt' as string]: '214 9% 4%',
  ['--rs-frost-ring' as string]: '214 12% 9%',
  ['--glass-border' as string]: '214 10% 6%',
  ['--glass-border-opacity' as string]: '0.12',
}

export const APP_SHELL_SOFT_BORDER_STYLE: CSSProperties = {
  ...LOCALE_SOFT_BORDER_STYLE,
  ['--sidebar-border' as string]: '214 10% 4%',
}

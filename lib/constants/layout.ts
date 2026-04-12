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
  ['--border' as string]: '214 14% 8%',
  ['--input' as string]: '214 14% 8%',
  ['--sidebar-border' as string]: '214 14% 7%',
  ['--v2-border' as string]: '214 14% 8%',
  ['--v2-border-subtle' as string]: '214 12% 6%',
  ['--frost-border' as string]: 'rgba(38, 47, 58, 0.24)',
  ['--frost-border-strong' as string]: 'rgba(52, 63, 76, 0.3)',
  ['--frost-border-alt' as string]: 'rgba(32, 40, 50, 0.16)',
  ['--frost-shadow' as string]: '0 24px 48px -32px rgba(0, 0, 0, 0.72)',
  ['--mk-border' as string]: '214 14% 8%',
  ['--precision-panel-line' as string]: '214 14% 8%',
  ['--rs-frost-border' as string]: '214 14% 8%',
  ['--rs-frost-border-alt' as string]: '214 12% 6%',
  ['--rs-frost-ring' as string]: '214 18% 12%',
  ['--glass-border' as string]: '214 14% 8%',
  ['--glass-border-opacity' as string]: '0.16',
}

export const APP_SHELL_SOFT_BORDER_STYLE: CSSProperties = {
  ...LOCALE_SOFT_BORDER_STYLE,
  ['--sidebar-border' as string]: '214 14% 6%',
}

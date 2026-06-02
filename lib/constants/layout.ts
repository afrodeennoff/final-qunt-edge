import type { CSSProperties } from 'react'

// Header constants (consistent across Dashboard, Teams, Admin)
export const HEADER_HEIGHT = 'h-[4.5rem]'

export const HEADER_Z_INDEX = 'z-50'

export const HEADER_BG = 'bg-card'

// Content padding constants
export const CONTENT_PADDING = 'px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12'

export const CONTENT_PADDING_Y = 'py-6 sm:py-8 lg:py-8'

export const WORKSPACE_SHELL_WIDTH = 'max-w-[1600px] sm:max-w-[1400px]'

export const MARKETING_SHELL_WIDTH = 'max-w-[1360px]'

export const CONTENT_SHELL_WIDTH = 'max-w-[1280px]'

export const READING_SHELL_WIDTH = 'max-w-[800px]'

// Ultra-high resolution container widths for 4K-12K displays
export const ULTRA_HIGH_RES_WIDTHS = {
  // Marketing layouts
  container4k: 'max-w-[3840px]',
  container8k: 'max-w-[7680px]',
  container12k: 'max-w-[12288px]',

  // Content layouts
  content4k: 'max-w-[3600px]',
  content8k: 'max-w-[7200px]',
  content12k: 'max-w-[11200px]',

  // Reading layouts
  reading4k: 'max-w-[3000px]',
  reading8k: 'max-w-[6000px]',
  reading12k: 'max-w-[9600px]',

  // Section containers
  section4k: 'max-w-[3520px]',
  section8k: 'max-w-[7040px]',
  section12k: 'max-w-[10880px]',
}

export const LOCALE_SOFT_BORDER_STYLE: CSSProperties = {
  ['--border' as string]: '214 10% 6%',
  ['--input' as string]: '214 10% 6%',
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
}

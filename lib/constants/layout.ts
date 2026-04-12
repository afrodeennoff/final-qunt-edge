import type { CSSProperties } from 'react'

// Header constants (consistent across Dashboard, Teams, Admin)
export const HEADER_HEIGHT = 'h-16'

export const HEADER_Z_INDEX = 'z-50'

export const HEADER_BORDER = 'border-b border-transparent'

export const HEADER_BG = 'bg-background/95 backdrop-blur-md'

// Content padding constants
export const CONTENT_PADDING = 'px-4 sm:px-6 lg:px-8'

export const CONTENT_PADDING_Y = 'py-6 sm:py-8 lg:py-8'

export const APP_SHELL_SOFT_BORDER_STYLE: CSSProperties = {
  ['--border' as string]: '214 100% 92% / 0.028',
  ['--input' as string]: '214 100% 92% / 0.025',
  ['--sidebar-border' as string]: '214 100% 92% / 0.015',
  ['--v2-border' as string]: '214 100% 92% / 0.03',
  ['--v2-border-subtle' as string]: '214 100% 92% / 0.018',
  ['--frost-border' as string]: 'rgba(214, 235, 253, 0.028)',
  ['--frost-border-strong' as string]: 'rgba(214, 235, 253, 0.045)',
}

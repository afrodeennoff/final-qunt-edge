// Standardized spacing scale
export const spacing = {
  // Base scale (1 unit = 0.25rem = 4px)
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '32': '8rem',
  '40': '10rem',
  '48': '12rem',
  '64': '16rem',
} as const

// Margin utilities
export const margin = {
  '0': '0',
  '1': `-${spacing['1']}`,
  '2': `-${spacing['2']}`,
  '3': `-${spacing['3']}`,
  '4': `-${spacing['4']}`,
  '5': `-${spacing['5']}`,
  '6': `-${spacing['6']}`,
  '8': `-${spacing['8']}`,
  '10': `-${spacing['10']}`,
  '12': `-${spacing['12']}`,
  '0.5': '0.125rem',
  '1.5': '0.375rem',
  '2.5': '0.625rem',
  '3.5': '0.875rem',
} as const

// Padding utilities
export const padding = {
  '0': '0',
  '1': spacing['1'],
  '2': spacing['2'],
  '3': spacing['3'],
  '4': spacing['4'],
  '5': spacing['5'],
  '6': spacing['6'],
  '7': spacing['7'],
  '8': spacing['8'],
  '9': spacing['9'],
  '10': spacing['10'],
  '12': spacing['12'],
} as const

// Gap utilities
export const gap = {
  '0': '0',
  '1': spacing['1'],
  '2': spacing['2'],
  '3': spacing['3'],
  '4': spacing['4'],
  '5': spacing['5'],
  '6': spacing['6'],
  '8': spacing['8'],
  '10': spacing['10'],
  '12': spacing['12'],
  '16': spacing['16'],
  '20': spacing['20'],
} as const

// Vertical spacing scale (for section/page heights)
export const verticalSpacing = {
  'sm': spacing['8'],
  'md': spacing['12'],
  'lg': spacing['16'],
  'xl': spacing['24'],
  '2xl': spacing['32'],
} as const

// Horizontal spacing scale (for text widths)
export const horizontalSpacing = {
  'sm': spacing['8'],
  'md': spacing['12'],
  'lg': spacing['16'],
  'xl': spacing['24'],
  '2xl': spacing['32'],
} as const

// Minimalist layout components - simplified and cohesive design system

export const minimalPanelClassName =
  'rounded-lg border border-transparent bg-card shadow-sm transition-all duration-[200ms] ease-out'

export const minimalSectionHeaderClassName =
  'flex items-center justify-between mb-6'

export const minimalSectionTitleClassName =
  'text-lg font-semibold tracking-tight text-foreground'

export const minimalSectionDescriptionClassName =
  'text-sm text-muted-foreground mt-1'

export const minimalCardClassName =
  'rounded-lg border border-transparent bg-card shadow-sm transition-all duration-[200ms] ease-out hover:shadow-md hover:-translate-y-0.5'

export const minimalButtonClassName =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-[200ms] ease-out focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-50'

export const minimalGhostButtonClassName =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-[200ms] ease-out hover:bg-muted hover:text-foreground'

export const minimalPrimaryButtonClassName =
  'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-primary-foreground bg-primary transition-all duration-[200ms] ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-primary/90'

export const minimalChipClassName =
  'inline-flex items-center gap-1 rounded-full border border-transparent bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-all duration-[200ms] ease-out hover:bg-muted'

export const minimalToolbarClassName =
  'rounded-lg border border-transparent bg-card/50 shadow-sm p-4'

export const minimalInfoLabelClassName =
  'text-xs font-medium text-muted-foreground uppercase tracking-[0.05em]'

export const minimalInfoValueClassName =
  'text-sm font-medium text-foreground'

export const minimalBodyClassName =
  'text-sm text-muted-foreground leading-relaxed'

export const minimalTitleClassName =
  'text-xl font-semibold tracking-tight text-foreground'

export const minimalSpacing = {
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 sm:py-16 lg:py-20',
  gap: 'gap-4 sm:gap-6 lg:gap-8',
  padding: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12'
}

// Consistent spacing scale
export const minimalSpacingScale = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const
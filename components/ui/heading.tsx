import { cva, type VariantProps } from 'class-variance-authority'

export const headingVariants = cva(
  'font-semibold tracking-tight',
  {
    variants: {
      size: {
        '2xl': 'text-2xl sm:text-3xl',
        '2xl-large': 'text-2xl sm:text-4xl',
        xl: 'text-xl sm:text-2xl',
        lg: 'text-lg sm:text-xl',
        md: 'text-base sm:text-lg',
        sm: 'text-sm sm:text-base',
      }
    },
    defaultVariants: {
      size: '2xl',
    },
  }
)

export interface HeadingProps extends VariantProps<typeof headingVariants> {
  children: React.ReactNode
  className?: string
}

export function Heading({ children, size, className = '' }: HeadingProps) {
  return (
    <h2 className={`${headingVariants({ size })} ${className}`}>
      {children}
    </h2>
  )
}

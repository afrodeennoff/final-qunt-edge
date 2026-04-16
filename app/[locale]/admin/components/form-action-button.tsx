'use client'

import { useFormStatus } from 'react-dom'
import { Button, type ButtonProps } from '@/components/ui/button'

type FormActionButtonProps = Omit<ButtonProps, 'isLoading' | 'loadingText'> & {
  pendingLabel?: string
}

export function FormActionButton({
  pendingLabel = 'Working...',
  disabled,
  children,
  ...props
}: FormActionButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      disabled={disabled || pending}
      isLoading={pending}
      loadingText={pendingLabel}
    >
      {children}
    </Button>
  )
}

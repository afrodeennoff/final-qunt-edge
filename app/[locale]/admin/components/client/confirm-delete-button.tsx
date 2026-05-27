'use client'

import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface ConfirmDeleteButtonProps extends ButtonProps {
  confirmMessage?: string
  pendingLabel?: string
}

/**
 * A delete button that asks for confirmation before allowing form submission.
 * Must be used inside a <form> element that has a server action.
 */
export function ConfirmDeleteButton({
  confirmMessage = "Are you sure you want to delete this? This action cannot be undone.",
  pendingLabel = "Deleting...",
  children = <Trash2 className="w-4 h-4" />,
  ...props
}: ConfirmDeleteButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault()
        }
      }}
    >
      {pending ? pendingLabel : children}
    </Button>
  )
}

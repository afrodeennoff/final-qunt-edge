"use client"
import React from 'react'

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      duration={4000}
      visibleToasts={3}
      richColors
      closeButton
      className="toaster group"
      style={{ zIndex: 99999 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/80 group-[.toaster]:backdrop-blur-xl " +
            "group-[.toaster]:text-foreground group-[.toaster]:border-primary/20 " +
            "group-[.toaster]:shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_8px_40px_-12px_rgba(0,0,0,0.8),0_0_60px_-20px_hsl(var(--primary)/0.15)] " +
            "group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground/80 group-[.toast]:text-xs group-[.toast]:mt-0.5",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted/30 group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs",
          closeButton: "group-[.toast]:text-muted-foreground/40 group-[.toast]:hover:text-foreground/70 group-[.toast]:transition-colors",
          success: "group-[.toaster]:border-primary/25",
          error: "group-[.toaster]:border-destructive/30",
          warning: "group-[.toaster]:border-amber-500/25",
          info: "group-[.toaster]:border-primary/20",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          icon: "group-[.toast]:[&>svg]:h-4 group-[.toast]:[&>svg]:w-4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

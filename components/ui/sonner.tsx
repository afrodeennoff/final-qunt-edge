"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
 return (
 <Sonner
 theme="dark"
 className="toaster group"
 toastOptions={{
 classNames: {
 toast:"group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground/95 group-[.toaster]:border-[oklch(0.65_0.22_260/0.08)] group-[.toaster]:shadow-[inset_0_1px_0_oklch(0.65_0.22_260/0.08),0_16px_48px_-16px_rgba(0,0,0,0.5)]",
 description:"group-[.toast]:text-muted-foreground",
 actionButton:"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
 cancelButton:"group-[.toast]:bg-[oklch(0.65_0.22_260/0.045)] group-[.toast]:text-muted-foreground",
 },
 }}
 {...props}
 />
 )
}

export { Toaster }

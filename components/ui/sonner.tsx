"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
 return (
 <Sonner
 theme="dark"
 position="bottom-right"
 duration={5000}
 visibleToasts={5}
 richColors
 closeButton
 className="toaster group"
 style={{
  zIndex: 99999,
 }}
 toastOptions={{
 classNames: {
toast:"group toast group-[.toaster]:bg-[oklch(0.65_0.22_260/0.06)] group-[.toaster]:text-foreground group-[.toaster]:border-[oklch(0.65_0.22_260/0.08)] group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_hsl(var(--primary)/0.1)]",
  description:"group-[.toast]:text-muted-foreground",
  actionButton:"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton:"group-[.toast]:bg-[oklch(0.65_0.22_260/0.03)] group-[.toast]:text-muted-foreground",
  success:"group-[.toaster]:border-[oklch(0.65_0.22_260/0.12)] group-[.toaster]:bg-[oklch(0.65_0.22_260/0.06)]",
  error:"group-[.toaster]:border-[oklch(0.65_0.22_260/0.12)] group-[.toaster]:bg-destructive/15",
  warning:"group-[.toaster]:border-[oklch(0.65_0.22_260/0.12)] group-[.toaster]:bg-[oklch(0.65_0.22_260/0.06)]",
  info:"group-[.toaster]:border-[oklch(0.65_0.22_260/0.12)] group-[.toaster]:bg-[oklch(0.65_0.22_260/0.06)]",
 },
 }}
 {...props}
 />
 )
}

export { Toaster }

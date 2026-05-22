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
  toast:"group toast group-[.toaster]:bg-popover group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_hsl(var(--primary)/0.1)]",
 description:"group-[.toast]:text-muted-foreground",
 actionButton:"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
 cancelButton:"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
 success:"group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-950/40",
 error:"group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-950/40",
 warning:"group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-950/40",
 info:"group-[.toaster]:border-blue-500/30 group-[.toaster]:bg-blue-950/40",
 },
 }}
 {...props}
 />
 )
}

export { Toaster }

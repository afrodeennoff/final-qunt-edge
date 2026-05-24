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
toast:"group toast group-[.toaster]:bg-primary/6 group-[.toaster]:text-foreground group-[.toaster]:border-primary/8 group-[.toaster]:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_hsl(var(--primary)/0.1)]",
  description:"group-[.toast]:text-muted-foreground",
  actionButton:"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton:"group-[.toast]:bg-primary/3 group-[.toast]:text-muted-foreground",
  success:"group-[.toaster]:border-primary/12 group-[.toaster]:bg-primary/6",
  error:"group-[.toaster]:border-primary/12 group-[.toaster]:bg-destructive/15",
  warning:"group-[.toaster]:border-primary/12 group-[.toaster]:bg-primary/6",
  info:"group-[.toaster]:border-primary/12 group-[.toaster]:bg-primary/6",
 },
 }}
 {...props}
 />
 )
}

export { Toaster }

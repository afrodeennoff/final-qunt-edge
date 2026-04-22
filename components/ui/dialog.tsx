"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
 React.ElementRef<typeof DialogPrimitive.Overlay>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
 <DialogPrimitive.Overlay
 ref={ref}
 data-slot="dialog-overlay"
 className={cn("fixed inset-0 z-50 bg-black/88 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
 className
 )}
 {...props}
 />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
 React.ElementRef<typeof DialogPrimitive.Content>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
 <DialogPortal>
 <DialogOverlay />
 <DialogPrimitive.Content
 ref={ref}
 data-slot="dialog-content"
 className={cn("fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl border border-border/40 bg-card p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.7)] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
 className
 )}
 {...props}
 >
 {/* Top glass line */}
 <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/12 to-transparent" />
 {/* Ambient glow */}
 <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
 {children}
 <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xl border border-border/35 bg-background/50 p-1.5 opacity-70 ring-offset-background transition-[opacity,background-color,border-color] duration-200 hover:bg-background/70 hover:opacity-100 hover:border-border/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:text-muted-foreground">
 <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
 </DialogPrimitive.Close>
 </DialogPrimitive.Content>
 </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
 <div
 className={cn("flex flex-col gap-2 text-left",
 className
 )}
 {...props}
 />
)
DialogHeader.displayName ="DialogHeader"

const DialogFooter = ({
 className,
 ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
 <div
 className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 pt-4 mt-4 border-t border-border/35",
 className
 )}
 {...props}
 />
)
DialogFooter.displayName ="DialogFooter"

const DialogTitle = React.forwardRef<
 React.ElementRef<typeof DialogPrimitive.Title>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
 <DialogPrimitive.Title
 ref={ref}
 className={cn("text-lg font-semibold leading-none tracking-tight text-foreground",
 className
 )}
 {...props}
 />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
 React.ElementRef<typeof DialogPrimitive.Description>,
 React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
 <DialogPrimitive.Description
 ref={ref}
 className={cn("text-sm text-muted-foreground/70", className)}
 {...props}
 />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
 Dialog,
 DialogPortal,
 DialogOverlay,
 DialogClose,
 DialogTrigger,
 DialogContent,
 DialogHeader,
 DialogFooter,
 DialogTitle,
 DialogDescription,
}

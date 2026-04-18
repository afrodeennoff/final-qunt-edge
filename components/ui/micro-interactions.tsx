"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Hover lift effect
export interface HoverLiftProps extends React.HTMLAttributes<HTMLDivElement> {
 liftAmount?: string
}

export const HoverLift = React.forwardRef<HTMLDivElement, HoverLiftProps>(
 ({ 
 children, 
 className,
 liftAmount ="-translate-y-1",
 ...props 
 }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("transition-[opacity,background-color,border-color] duration-200 ease-out","hover:shadow-[inset_0_1px_0_hsl(var(--primary)/0.08),0_16px_48px_-16px_rgba(0,0,0,0.5)] hover:shadow-foreground/20",
 `hover:${liftAmount}`,
 className
 )}
 {...props}
 >
 {children}
 </div>
 )
 }
)
HoverLift.displayName ="HoverLift"

// Press feedback
export interface PressFeedbackProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const PressFeedback = React.forwardRef<HTMLButtonElement, PressFeedbackProps>(
 ({ 
 children, 
 className,
 ...props 
 }, ref) => {
 return (
 <button
 ref={ref}
 className={cn("transition-transform duration-100 active:scale-[0.97]",
 className
 )}
 {...props}
 >
 {children}
 </button>
 )
 }
)
PressFeedback.displayName ="PressFeedback"

// Shimmer loading effect
export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
 ({ 
 className,
 ...props 
 }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("animate-shimmer bg-gradient-to-r","from-transparent via-primary-foreground/10 to-transparent","bg-[length:200%_100%]",
 className
 )}
 {...props}
 />
 )
 }
)
Shimmer.displayName ="Shimmer"

// Pulse glow effect
export interface PulseGlowProps extends React.HTMLAttributes<HTMLDivElement> {
 color?: string
}

export const PulseGlow = React.forwardRef<HTMLDivElement, PulseGlowProps>(
 ({ 
 children, 
 className,
 color ="primary",
 ...props 
 }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("animate-pulse-glow relative",
 className
 )}
 {...props}
 >
 {children}
 </div>
 )
 }
)
PulseGlow.displayName ="PulseGlow"

// Stagger container for lists
export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
 delay?: number
}

export const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
 ({ 
 children, 
 className,
 delay = 100,
 ...props 
 }, ref) => {
 return (
 <div
 ref={ref}
 className={cn("stagger-reveal", className)}
 style={{"--stagger-delay": `${delay}ms` } as React.CSSProperties}
 {...props}
 >
 {children}
 </div>
 )
 }
)
StaggerContainer.displayName ="StaggerContainer"

/**
 * Micro-interaction components for enhanced UI feedback.
 *
 * @example
 * // Hover lift effect for cards
 * <HoverLift liftAmount="-translate-y-2">
 * <Card>Interactive content</Card>
 * </HoverLift>
 *
 * @example
 * // Press feedback for buttons
 * <PressFeedback>
 * <Button>Click me</Button>
 * </PressFeedback>
 *
 * @example
 * // Shimmer loading state
 * <Shimmer className="h-4 w-32 rounded" />
 *
 * @example
 * // Pulse glow for status indicators
 * <PulseGlow color="primary">
 * <StatusIndicator />
 * </PulseGlow>
 *
 * @example
 * // Staggered list animations
 * <StaggerContainer delay={100}>
 * {items.map((item) => (
 * <div key={item.id}>{item.content}</div>
 * ))}
 * </StaggerContainer>
 */

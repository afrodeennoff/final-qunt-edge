"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { BadgeProps } from "@/components/ui/badge"

export interface MediaCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
 image: string
 title: string
 subtitle?: string
 description?: string
 badges?: Array<{ label: string; variant?: BadgeProps["variant"] }>
 actions?: React.ReactNode
 imageAspect?:"video" |"square" |"portrait"
 onClick?: () => void
 size?:"sm" |"md" |"lg"
}

const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
 ({ 
 image,
 title,
 subtitle,
 description,
 badges,
 actions,
 imageAspect ="video",
 onClick,
 size ="md",
 className,
 ...props 
 }, ref) => {
 const aspectClasses = {
 video:"aspect-video",
 square:"aspect-square",
 portrait:"aspect-[3/4]"
 }

 const sizeClasses = {
 sm: { title:"text-sm", description:"text-xs" },
 md: { title:"text-base", description:"text-sm" },
 lg: { title:"text-lg", description:"text-base" },
 }

 const currentSize = sizeClasses[size]

 return (
 <Card
 ref={ref}
 hover={!!onClick}
 clickable={!!onClick}
 className={cn("group overflow-hidden", className)}
 onClick={onClick}
 aria-label={title}
 {...props}
 >
 <div className={cn("relative overflow-hidden bg-background/25", aspectClasses[imageAspect])} aria-hidden="true">
 <Image
 src={image}
 alt={title}
 fill
 sizes="(max-width: 767px) 100vw, 33vw"
 className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
 />
 {badges && badges.length > 0 && (
 <div className="absolute top-2 right-2 flex flex-wrap gap-1">
 {badges.map((badge, index) => (
 <div key={index} className="text-xs">{badge.label}</div>
 ))}
 </div>
 )}
 </div>
 <CardHeader className={cn("gap-1", size ==="sm" ?"p-3" : size ==="lg" ?"p-5" :"p-4")}>
 <CardTitle className={cn(currentSize.title,"line-clamp-2")}>
 {title}
 </CardTitle>
 {subtitle && (
 <p className="text-sm text-muted-foreground">{subtitle}</p>
 )}
 </CardHeader>
 {description && (
 <CardContent className={cn(currentSize.description,"text-muted-foreground line-clamp-3", size ==="sm" ?"p-3 pt-0" : size ==="lg" ?"p-5 pt-0" :"p-4 pt-0")}>
 <p>{description}</p>
 </CardContent>
 )}
 {actions && (
 <CardFooter className={cn("w-full gap-2", size ==="sm" ?"p-3 pt-0" : size ==="lg" ?"p-5 pt-0" :"p-4 pt-0")}>
 {actions}
 </CardFooter>
 )}
 </Card>
 )
 }
)
MediaCard.displayName ="MediaCard"

export { MediaCard }

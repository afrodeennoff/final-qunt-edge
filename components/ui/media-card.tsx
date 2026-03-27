"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { CardV2, CardV2Content, CardV2Footer, CardV2Header, CardV2Title } from "@/components/ui/v2"
import type { BadgeV2Props } from "@/components/ui/v2"

export interface MediaCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  image: string
  title: string
  subtitle?: string
  description?: string
  badges?: Array<{ label: string; variant?: BadgeV2Props["variant"] }>
  actions?: React.ReactNode
  imageAspect?: "video" | "square" | "portrait"
  onClick?: () => void
  size?: "sm" | "md" | "lg"
}

const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
  ({ 
    image,
    title,
    subtitle,
    description,
    badges,
    actions,
    imageAspect = "video",
    onClick,
    size = "md",
    className,
    ...props 
  }, ref) => {
    const aspectClasses = {
      video: "aspect-video",
      square: "aspect-square",
      portrait: "aspect-[3/4]"
    }

    const sizeClasses = {
      sm: { title: "text-sm", description: "text-xs" },
      md: { title: "text-base", description: "text-sm" },
      lg: { title: "text-lg", description: "text-base" },
    }

    const currentSize = sizeClasses[size]

    return (
      <CardV2
        ref={ref}
        hover={!!onClick}
        clickable={!!onClick}
        className={cn("group overflow-hidden", className)}
        onClick={onClick}
        aria-label={title}
        {...props}
      >
        <div className={cn("relative overflow-hidden bg-muted", aspectClasses[imageAspect])} aria-hidden="true">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
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
        <CardV2Header className={cn("gap-1", size === "sm" ? "p-3" : size === "lg" ? "p-5" : "p-4")}>
          <CardV2Title className={cn(currentSize.title, "line-clamp-2")}>
            {title}
          </CardV2Title>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </CardV2Header>
        {description && (
          <CardV2Content className={cn(currentSize.description, "text-muted-foreground line-clamp-3", size === "sm" ? "p-3 pt-0" : size === "lg" ? "p-5 pt-0" : "p-4 pt-0")}>
            <p>{description}</p>
          </CardV2Content>
        )}
        {actions && (
          <CardV2Footer className={cn("w-full gap-2", size === "sm" ? "p-3 pt-0" : size === "lg" ? "p-5 pt-0" : "p-4 pt-0")}>
            {actions}
          </CardV2Footer>
        )}
      </CardV2>
    )
  }
)
MediaCard.displayName = "MediaCard"

export { MediaCard }

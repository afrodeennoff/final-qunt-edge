'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { PlatformConfig } from "../config/platforms"
import { useI18n } from "@/locales/client"

interface PlatformItemProps {
  platform: PlatformConfig
  isSelected: boolean
  onSelect: (type: string) => void
  onHover: (category: string) => void
  onLeave: () => void
  isWeekend: boolean
}

export function PlatformItem({
  platform,
  isSelected,
  onSelect,
  onHover,
  onLeave,
  isWeekend
}: PlatformItemProps) {
  const t = useI18n()

  const isInteractive = !platform.isDisabled && !platform.isComingSoon

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={() => {
        if (isInteractive) {
          onSelect(platform.type)
        }
      }}
      onMouseEnter={() => onHover(platform.category)}
      onMouseLeave={onLeave}
      className={cn(
        "group relative flex items-start gap-4 w-full text-left",
        "rounded-xl border-2 p-4 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        !isInteractive && "opacity-40 cursor-not-allowed",
        isInteractive && "cursor-pointer",
        isInteractive && !isSelected && "border-transparent bg-card hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm",
        isSelected && "border-primary bg-primary/[0.04] shadow-sm",
        isSelected && "hover:border-primary hover:bg-primary/[0.06]"
      )}
    >
      <div className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
        isSelected ? "bg-primary/10" : "bg-muted/60 group-hover:bg-muted/80"
      )}>
        {platform.logo.path && (
          <Image
            src={platform.logo.path}
            alt={platform.logo.alt || ''}
            width={28}
            height={28}
            className="object-contain"
          />
        )}
        {platform.logo.component && (
          <platform.logo.component />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-sm font-semibold",
            isSelected ? "text-foreground" : "text-foreground/90"
          )}>
            {t(platform.name as keyof typeof t)}
          </span>
          {platform.isDisabled && (
            <>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {t('import.type.badge.maintenance')}
              </Badge>
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
            </>
          )}
          {platform.isComingSoon && !platform.isDisabled && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-500">
              {t('import.type.badge.comingSoon')}
            </Badge>
          )}
          {!platform.isDisabled && platform.isRithmic && isWeekend && (
            <div className="inline-flex items-center gap-1 rounded-md border border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 text-[10px] font-semibold">
              <AlertTriangle className="h-3 w-3" />
              {t('import.type.rithmicWeekendWarning')}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {t(platform.description as keyof typeof t)}
        </p>
      </div>

      {isSelected && (
        <div className="absolute right-3 top-3 text-primary">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )}

      {isSelected && (
        <div className="absolute inset-0 rounded-[11px] ring-1 ring-inset ring-primary/20 pointer-events-none" />
      )}
    </button>
  )
} 
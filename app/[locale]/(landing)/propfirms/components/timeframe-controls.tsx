"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Timeframe } from "../actions/timeframe-utils"

interface TimeframeControlsProps {
  timeframeLabel: string
  timeframeOptions: {
    currentMonth: string
    last3Months: string
    last6Months: string
    '2024': string
    '2025': string
    '2026': string
    allTime: string
  }
}

export function TimeframeControls({ timeframeLabel, timeframeOptions }: TimeframeControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTimeframe = (searchParams.get("timeframe") || "2026") as Timeframe

  const handleTimeframeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "2026") {
      params.delete("timeframe")
    } else {
      params.set("timeframe", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="timeframe-select" className="text-xs font-semibold tracking-wide text-foreground/60">
        {timeframeLabel}
      </Label>
      <Select value={currentTimeframe} onValueChange={handleTimeframeChange}>
        <SelectTrigger
          id="timeframe-select"
<<<<<<< HEAD
          className="w-[200px] border border-white/[0.08] bg-white/[0.040] text-foreground/95 shadow-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.060] focus-visible:ring-1 focus-visible:ring-primary/55 focus-visible:ring-offset-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-white/[0.08] bg-background text-foreground/95 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.28),0_20px_48px_-8px_rgba(0,0,0,0.85)]">
=======
          className="w-[200px] border border-border/28 bg-card/80 text-foreground shadow-none backdrop-blur-sm hover:bg-card focus-visible:ring-1 focus-visible:ring-primary/55 focus-visible:ring-offset-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-border/28 bg-card text-foreground shadow-xl">
>>>>>>> origin/main
          <SelectItem value="currentMonth">{timeframeOptions.currentMonth}</SelectItem>
          <SelectItem value="last3Months">{timeframeOptions.last3Months}</SelectItem>
          <SelectItem value="last6Months">{timeframeOptions.last6Months}</SelectItem>
          <SelectItem value="2024">{timeframeOptions['2024']}</SelectItem>
          <SelectItem value="2025">{timeframeOptions['2025']}</SelectItem>
          <SelectItem value="2026">{timeframeOptions['2026']}</SelectItem>
          <SelectItem value="allTime">{timeframeOptions.allTime}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

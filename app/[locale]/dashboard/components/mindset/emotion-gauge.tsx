"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Frown, Meh, Smile, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

interface EmotionGaugeProps {
  value: number
  onChange?: (value: number) => void
  size?: "small" | "medium" | "large"
  showLabel?: boolean
  className?: string
}

const sizeMap = {
  small: { width: 160, height: 80 },
  medium: { width: 240, height: 120 },
  large: { width: 320, height: 160 },
}

const getEmotionLabel = (value: number, t: ReturnType<typeof useI18n>): string => {
  if (value <= 20) return (t as any)('mindset.emotion.stressed')
  if (value <= 40) return (t as any)('mindset.emotion.anxious')
  if (value <= 60) return (t as any)('mindset.emotion.neutral')
  if (value <= 80) return (t as any)('mindset.emotion.focused')
  return (t as any)('mindset.emotion.confident')
}

const getEmotionColor = (value: number): string => {
  if (value <= 20) return "hsl(var(--emotion-sad))"
  if (value <= 40) return "hsl(var(--emotion-anxious))"
  if (value <= 60) return "hsl(var(--emotion-neutral))"
  if (value <= 80) return "hsl(var(--emotion-focused))"
  return "hsl(var(--emotion-confident))"
}

const getEmotionIcon = (value: number): LucideIcon => {
  if (value <= 20) return Frown
  if (value <= 40) return Frown
  if (value <= 60) return Meh
  return Smile
}

export const EmotionGauge = React.memo(function EmotionGauge({
  value,
  onChange,
  size = "medium",
  showLabel = true,
  className,
}: EmotionGaugeProps) {
  const t = useI18n()
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)
  const displayValue = hoverValue ?? value
  const { width, height } = sizeMap[size]
  const strokeWidth = size === "small" ? 8 : size === "medium" ? 12 : 16
  const radius = (width - strokeWidth) / 2
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (displayValue / 100) * circumference

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setHoverValue(Math.round(percentage))
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  const handleClick = () => {
    if (onChange && hoverValue !== null) {
      onChange(hoverValue)
    }
  }

  const EmotionIcon = getEmotionIcon(displayValue)

  return (
    <div
      className={cn(
        "journal-glass relative flex flex-col items-center justify-center p-6",
        onChange && "cursor-pointer",
        className
      )}
      style={{ width: "100%" }}
    >
      <div
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width, height }}
      >
        {/* Background Arc */}
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          style={{ transform: "rotate(180deg)" }}
        >
          <defs>
            <linearGradient id={`emotion-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--emotion-sad))" />
              <stop offset="50%" stopColor="hsl(var(--emotion-neutral))" />
              <stop offset="100%" stopColor="hsl(var(--emotion-happy))" />
            </linearGradient>
          </defs>
          <path
            d={`M ${strokeWidth / 2} ${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${radius + strokeWidth / 2}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <motion.path
            d={`M ${strokeWidth / 2} ${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${radius + strokeWidth / 2}`}
            fill="none"
            stroke={`url(#emotion-gradient-${size})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: "25%" }}
        >
          <motion.div
            key={displayValue}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            {React.createElement(EmotionIcon, {
              className: cn(
                "transition-colors",
                size === "small" ? "h-6 w-6" : size === "medium" ? "h-8 w-8" : "h-10 w-10"
              ),
              style: { color: getEmotionColor(displayValue) }
            })}
            <span
              className={cn(
                "font-semibold",
                size === "small" ? "text-2xl" : size === "medium" ? "text-3xl" : "text-4xl"
              )}
              style={{ color: getEmotionColor(displayValue) }}
            >
              {displayValue}
            </span>
          </motion.div>
        </div>
      </div>

      {showLabel && (
        <motion.p
          key={getEmotionLabel(displayValue, t)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-token-secondary mt-4"
        >
          {getEmotionLabel(displayValue, t)}
        </motion.p>
      )}
    </div>
  )
})

EmotionGauge.displayName = "EmotionGauge"

export default EmotionGauge

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Frown, Meh, Smile, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/locales/client"

interface EmotionPresetsProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

const presets = [
  { value: 10, labelKey: "mindset.emotion.veryNegative", icon: Frown, color: "hsl(var(--emotion-sad))" },
  { value: 30, labelKey: "mindset.emotion.negative", icon: Frown, color: "hsl(var(--emotion-anxious))" },
  { value: 50, labelKey: "mindset.emotion.neutral", icon: Meh, color: "hsl(var(--emotion-neutral))" },
  { value: 70, labelKey: "mindset.emotion.positive", icon: Smile, color: "hsl(var(--emotion-focused))" },
  { value: 90, labelKey: "mindset.emotion.veryPositive", icon: Zap, color: "hsl(var(--emotion-confident))" },
]

export const EmotionPresets = React.memo(function EmotionPresets({
  value,
  onChange,
  className,
}: EmotionPresetsProps) {
  const t = useI18n()
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null)

  const activeIndex = React.useMemo(() => {
    return presets.findIndex((p) => p.value === value)
  }, [value])

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue)
  }

  return (
    <div className={cn("journal-glass p-6", className)}>
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          {presets.map((preset, index) => {
            const Icon = preset.icon
            const isActive = activeIndex === index
            const isHovered = hoveredValue === preset.value

            return (
              <motion.button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                onMouseEnter={() => setHoveredValue(preset.value)}
                onMouseLeave={() => setHoveredValue(null)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-300",
                  "border border-transparent",
                  "hover:scale-105 active:scale-95",
                  isActive && "border-[hsl(var(--accent-neutral))]"
                )}
                style={{
                  backgroundColor: isActive || isHovered
                    ? `${preset.color} / 0.15`
                    : "transparent",
                  borderColor: isActive ? preset.color : "transparent",
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    rotate: isActive ? [0, -5, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon
                    className={cn(
                      "transition-colors",
                      isActive ? "h-6 w-6" : "h-5 w-5"
                    )}
                    style={{ color: preset.color }}
                  />
                </motion.div>

                <span
                  className={cn(
                    "text-xs font-medium text-center transition-all",
                    isActive ? "text-sm font-bold" : "text-token-tertiary"
                  )}
                  style={{ color: isActive || isHovered ? preset.color : undefined }}
                >
                  {preset.value}
                </span>

                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-token-secondary mt-1"
                  >
                    {(t as any)(preset.labelKey)}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
          style={{ backgroundColor: "hsl(var(--border))" }}
          initial={false}
          animate={{
            x: `${(activeIndex / (presets.length - 1)) * 100}%`,
            width: activeIndex >= 0 ? `${100 / presets.length}%` : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-token-secondary">
            {(t as any)('mindset.emotion.selected')}
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: presets[activeIndex]?.color }}>
            {presets[activeIndex]?.labelKey && (t as any)(presets[activeIndex].labelKey)}
          </p>
        </motion.div>
      </div>
    </div>
  )
})

EmotionPresets.displayName = "EmotionPresets"

export default EmotionPresets

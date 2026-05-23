"use client"

import { useI18n } from "@/locales/client"

interface EmotionGaugeProps {
 value: number
 onChange: (value: number) => void
}

export function EmotionGauge({ value, onChange }: EmotionGaugeProps) {
 const t = useI18n()
 const percentage = Math.max(0, Math.min(100, value))
 const rotation = percentage * 1.8 - 90

 const getEmotionColor = (val: number) => {
 if (val < 20) return"hsl(var(--destructive))"
 if (val < 40) return"hsl(var(--chart-5))"
 if (val < 60) return"hsl(var(--chart-2))"
 if (val < 80) return"hsl(var(--chart-3))"
 return"hsl(var(--primary))"
 }

 const getEmotionLabel = (val: number) => {
 if (val < 20) return t("mindset.emotion.verySad")
 if (val < 40) return t("mindset.emotion.sad")
 if (val < 60) return t("mindset.emotion.neutral")
 if (val < 80) return t("mindset.emotion.happy")
 return t("mindset.emotion.veryHappy")
 }

 return (
 <div className="mb-4 rounded-xl border border-border/30 bg-card p-4">
 <div>
 <div className="text-center">
 <p className="text-sm font-medium text-foreground">{t("mindset.emotion.title")}</p>
 <p className="mt-1 text-xs text-muted-foreground">{getEmotionLabel(percentage)}</p>
 </div>

 <div className="relative flex h-32 items-center justify-center">
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="h-24 w-48 overflow-hidden rounded-t-full border-8 border-border/25" />
 </div>

 <div
 className="absolute inset-0 flex origin-bottom items-center justify-center transition-[opacity,background-color,border-color] duration-500 ease-out"
 style={{ transform: `rotate(${rotation}deg)` }}
 >
 <div
 className="h-24 w-48 rounded-t-full border-8 border-l-transparent border-r-transparent border-t-transparent"
 style={{
 clipPath:"polygon(0 0, 100% 0, 100% 100%, 0 100%)",
 borderBottomColor: getEmotionColor(percentage),
 }}
 />
 </div>

 <div className="relative z-10 text-center">
 <p className="text-4xl font-bold text-foreground">{Math.round(percentage)}</p>
 </div>
 </div>

 <div className="space-y-2">
 <input
 type="range"
 min="0"
 max="100"
 value={percentage}
 onChange={(e) => onChange(Number(e.target.value))}
 className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-background/25 accent-primary"
 />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>{t("mindset.emotion.verySad")}</span>
 <span>{t("mindset.emotion.neutral")}</span>
 <span>{t("mindset.emotion.veryHappy")}</span>
 </div>
 </div>
 </div>
 </div>
 )
}

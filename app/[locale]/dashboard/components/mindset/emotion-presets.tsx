"use client"

import { useI18n } from "@/locales/client"
import { cn } from "@/lib/utils"
import { Frown, Meh, Smile } from "lucide-react"

interface EmotionPreset {
 value: number
 label: string
 icon: React.ReactNode
 tone:"negative" |"warning" |"neutral" |"positive" |"strong"
}

interface EmotionPresetsProps {
 value: number
 onChange: (value: number) => void
}

function toneStyles(tone: EmotionPreset["tone"]) {
 switch (tone) {
 case"negative":
 return {
 color:"var(--destructive)",
 bg:"color-mix(in srgb, var(--destructive) 12%, transparent)",
 border:"color-mix(in srgb, var(--destructive) 38%, transparent)",
 }
 case"warning":
 return {
 color:"var(--chart-5)",
 bg:"color-mix(in srgb, var(--chart-5) 12%, transparent)",
 border:"color-mix(in srgb, var(--chart-5) 38%, transparent)",
 }
 case"neutral":
 return {
 color:"var(--chart-2)",
 bg:"color-mix(in srgb, var(--chart-2) 12%, transparent)",
 border:"color-mix(in srgb, var(--chart-2) 38%, transparent)",
 }
 case"positive":
 return {
 color:"var(--chart-3)",
 bg:"color-mix(in srgb, var(--chart-3) 12%, transparent)",
 border:"color-mix(in srgb, var(--chart-3) 38%, transparent)",
 }
 case"strong":
 return {
 color:"var(--primary)",
 bg:"color-mix(in srgb, var(--primary) 12%, transparent)",
 border:"color-mix(in srgb, var(--primary) 38%, transparent)",
 }
 }
}

export function EmotionPresets({ value, onChange }: EmotionPresetsProps) {
 const t = useI18n()

 const presets: EmotionPreset[] = [
 { value: 10, label: t("mindset.emotion.verySad"), icon: <Frown className="h-4 w-4" />, tone:"negative" },
 { value: 30, label: t("mindset.emotion.sad"), icon: <Frown className="h-4 w-4" />, tone:"warning" },
 { value: 50, label: t("mindset.emotion.neutral"), icon: <Meh className="h-4 w-4" />, tone:"neutral" },
 { value: 70, label: t("mindset.emotion.happy"), icon: <Smile className="h-4 w-4" />, tone:"positive" },
 { value: 90, label: t("mindset.emotion.veryHappy"), icon: <Smile className="h-4 w-4" />, tone:"strong" },
 ]

 return (
 <div className="space-y-3">
 <p className="text-center text-xs text-muted-foreground">Quick select</p>
 <div className="grid grid-cols-5 gap-2">
 {presets.map((preset) => {
 const tone = toneStyles(preset.tone)
 const active = value === preset.value
 return (
 <button
 key={preset.value}
 onClick={() => onChange(preset.value)}
 className={cn("flex flex-col items-center gap-1 rounded-lg border p-2 transition-[opacity,background-color,border-color] duration-200",
 active ?"ring-2 ring-primary/50" :"hover:opacity-90"
 )}
 style={{
 backgroundColor: active ? tone.bg :"color-mix(in srgb, var(--card) 55%, transparent)",
 borderColor: active ? tone.border : "transparent",
 }}
 >
 <span style={{ color: tone.color }}>{preset.icon}</span>
 <span className="text-xs leading-tight text-foreground">{preset.label}</span>
 </button>
 )
 })}
 </div>
 </div>
 )
}

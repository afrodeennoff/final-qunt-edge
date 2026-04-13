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
 color:"hsl(var(--destructive))",
 bg:"hsl(var(--destructive) / 0.12)",
 border:"hsl(var(--destructive) / 0.38)",
 }
 case"warning":
 return {
 color:"hsl(var(--chart-5))",
 bg:"hsl(var(--chart-5) / 0.12)",
 border:"hsl(var(--chart-5) / 0.38)",
 }
 case"neutral":
 return {
 color:"hsl(var(--chart-2))",
 bg:"hsl(var(--chart-2) / 0.12)",
 border:"hsl(var(--chart-2) / 0.38)",
 }
 case"positive":
 return {
 color:"hsl(var(--chart-3))",
 bg:"hsl(var(--chart-3) / 0.12)",
 border:"hsl(var(--chart-3) / 0.38)",
 }
 case"strong":
 return {
 color:"hsl(var(--primary))",
 bg:"hsl(var(--primary) / 0.12)",
 border:"hsl(var(--primary) / 0.38)",
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
 className={cn("journal-glass flex flex-col items-center gap-1 rounded-lg border p-2 transition-[opacity,background-color,border-color] duration-200",
 active ?"ring-2 ring-primary/50" :"hover:opacity-90"
 )}
 style={{
 backgroundColor: active ? tone.bg :"hsl(var(--card) / 0.55)",
 borderColor: active ? tone.border :"hsl(var(--border) / 0.7)",
 }}
 >
 <span style={{ color: tone.color }}>{preset.icon}</span>
 <span className="text-xs leading-tight text-foreground/90">{preset.label}</span>
 </button>
 )
 })}
 </div>
 </div>
 )
}

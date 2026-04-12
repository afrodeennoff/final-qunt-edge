"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/locales/client"
import { EmotionSelector } from "./emotion-selector"
import { EmotionGauge } from "./emotion-gauge"
import { DayTagSelector } from "./day-tag-selector"
import { FinancialEvent } from "@/prisma/generated/prisma"
import { Trade } from "@/lib/data-types"
import { Skeleton } from "@/components/ui/skeleton"

const TiptapEditor = dynamic(
 () => import("@/components/tiptap-editor").then((m) => ({ default: m.TiptapEditor })),
 { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
)

interface JournalingProps {
 content: string
 onChange: (content: string) => void
 onSave: () => void
 emotionValue: number
 onEmotionChange: (value: number) => void
 date: Date
 events: FinancialEvent[]
 selectedNews: string[]
 onNewsSelection: (newsIds: string[]) => void
 trades: Trade[]
 onApplyTagToAll: (tag: string) => Promise<void>
}

export function Journaling({
 content,
 onChange,
 onSave,
 emotionValue,
 onEmotionChange,
 date,
 events,
 selectedNews,
 onNewsSelection,
 trades,
 onApplyTagToAll,
}: JournalingProps) {
 const t = useI18n()

 return (
 <div className="h-full flex flex-col">
 <div className="flex-none">
 <EmotionGauge
 value={emotionValue}
 onChange={onEmotionChange}
 />
 <div className="mt-4">
 <EmotionSelector
 value={emotionValue}
 onChange={onEmotionChange}
 />
 </div>
 </div>

 <div className="flex-none mt-6">
 <DayTagSelector
 trades={trades}
 date={date}
 onApplyTagToAll={onApplyTagToAll}
 />
 </div>

 <div className="flex-1 min-h-0 mt-6 flex flex-col">
 <TiptapEditor
 content={content}
 onChange={onChange}
 placeholder={t('mindset.journaling.placeholder')}
 width="100%"
 height="100%"
 events={events}
 selectedNews={selectedNews}
 onNewsSelection={onNewsSelection}
 date={date}
 />
 </div>

 <div className="flex-none flex gap-4 mt-6">
 <Button 
 onClick={onSave}
 className="w-full"
 >
 {t('mindset.journaling.save')}
 </Button>
 </div>
 </div>
 )
} 
"use client"

import { useState, useEffect } from "react"
import { WidgetShell } from "@/components/ui/widget-shell"
import { Timeline } from "./timeline"
import { MindsetSummary } from "./mindset-summary"
import { useI18n } from "@/locales/client"
import { Info, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
 Tooltip as UITooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { WidgetSize } from "@/app/[locale]/dashboard/types/dashboard"
import { toast } from "sonner"
import { deleteMindset } from "@/server/journal"
import { format } from "date-fns"
import { useMoodStore } from "@/store/mood-store"
import { useCurrentLocale } from "@/locales/client"

interface MindsetWidgetProps {
 size: WidgetSize
}

export function MindsetWidget({ size }: MindsetWidgetProps) {
 const [emotionValue, setEmotionValue] = useState(0)
 const [selectedNews, setSelectedNews] = useState<string[]>([])
 const [journalContent, setJournalContent] = useState("")
 const [selectedDate, setSelectedDate] = useState(new Date())
 const [isTimelineVisible, setIsTimelineVisible] = useState(true)
 const moods = useMoodStore(state => state.moods)
 const setMoods = useMoodStore(state => state.setMoods)
 const locale = useCurrentLocale()
 const t = useI18n()

 // Handle mood data when selected date changes
 useEffect(() => {
 if (!moods) return

 const mood = moods.find(mood => {
 if (!mood?.day) return false
 const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
 return format(moodDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
 })

 if (mood) {
 setEmotionValue(mood.emotionValue ?? 50)
 setSelectedNews(mood.selectedNews ?? [])
 setJournalContent(mood.journalContent ?? "")
 } else {
 setEmotionValue(0)
 setSelectedNews([])
 setJournalContent("")
 }
 }, [selectedDate, moods])

 const handleDeleteEntry = async (date: Date) => {
 try {
 const dateKey = format(date, 'yyyy-MM-dd')
 await deleteMindset(dateKey)

 // Update the moodHistory in context
 const updatedMoodHistory = moods?.filter(mood => {
 if (!mood?.day) return true
 const moodDate = mood.day instanceof Date ? mood.day : new Date(mood.day)
 return format(moodDate, 'yyyy-MM-dd') !== dateKey
 }) || []
 setMoods(updatedMoodHistory)

 // If the deleted entry was the selected date, reset the form
 if (dateKey === format(selectedDate, 'yyyy-MM-dd')) {
 setEmotionValue(50)
 setSelectedNews([])
 setJournalContent("")
 }
 } catch (error) {
 throw error // Let the Timeline component handle the error toast
 }
 }

 const handleDateSelect = (date: Date) => {
 setSelectedDate(date)
 }

 const handleEdit = (section?: 'emotion' | 'journal' | 'news') => {
 // No-op: journaling has been moved to the dedicated /notes page
 }

 const toggleTimeline = () => {
 setIsTimelineVisible(!isTimelineVisible)
 }

 return (
 <WidgetShell
 title={t('mindset.title')}
 icon={<Info className={cn("text-muted-foreground", size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4")} />}
 info={t('mindset.description')}
 className="flex flex-col h-full w-full"
  contentClassName="flex-1 p-0 flex flex-row relative"
 >
 {/* Timeline with animation */}
 <div
 className={cn("relative transition-[opacity,background-color,border-color] duration-300 ease-out-quart",
 isTimelineVisible ?"w-auto" :"w-0 overflow-hidden"
 )}
 >
 <Timeline
 className="shrink-0"
 selectedDate={selectedDate}
 onSelectDate={handleDateSelect}
 moodHistory={moods}
 onDeleteEntry={handleDeleteEntry}
 />

 {/* Hide/Show Button - positioned at right edge of timeline */}
 <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
 <TooltipProvider>
 <UITooltip>
 <TooltipTrigger asChild>
 <Button
 variant="secondary"
 size="icon"
 onClick={toggleTimeline}
 className="h-8 w-4 rounded-r-none rounded-l-md border-r-0"
 >
 {isTimelineVisible ? (
 <ChevronLeft className="h-3 w-3" />
 ) : (
 <ChevronRight className="h-3 w-3" />
 )}
 </Button>
 </TooltipTrigger>
 <TooltipContent side="left">
 <p>{isTimelineVisible ? t('mindset.hideTimeline') : t('mindset.showTimeline')}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 </div>

 {/* Show Button when timeline is collapsed */}
 {!isTimelineVisible && (
 <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
 <TooltipProvider>
 <UITooltip>
 <TooltipTrigger asChild>
 <Button
 variant="secondary"
 size="icon"
 onClick={toggleTimeline}
 className="h-8 w-4 rounded-l-none rounded-r-md border-l-0"
 >
 <ChevronRight className="h-3 w-3" />
 </Button>
 </TooltipTrigger>
 <TooltipContent side="right">
 <p>{t('mindset.showTimeline')}</p>
 </TooltipContent>
 </UITooltip>
 </TooltipProvider>
 </div>
 )}

 {/* Summary view */}
 <div className="flex-1 min-w-0 h-full p-4">
 <MindsetSummary
 date={selectedDate}
 emotionValue={emotionValue}
 selectedNews={selectedNews}
 journalContent={journalContent}
 onEdit={handleEdit}
 />
 </div>
 </WidgetShell>
 )
} 

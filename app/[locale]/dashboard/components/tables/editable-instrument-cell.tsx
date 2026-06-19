'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit3, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'

interface EditableInstrumentCellProps {
 value: string
 tradeIds: string[]
 onUpdate: (tradeIds: string[], updates: Record<string, unknown>) => Promise<void>
 className?: string
}

export function EditableInstrumentCell({
 value,
 tradeIds,
 onUpdate,
 className
}: EditableInstrumentCellProps) {
 const t = useI18n()
 const [isEditing, setIsEditing] = useState(false)
 const [tempValue, setTempValue] = useState('')
 const [isSaving, setIsSaving] = useState(false)
 const inputRef = useRef<HTMLInputElement>(null)

 useEffect(() => {
 if (isEditing && inputRef.current) {
 inputRef.current.focus()
 inputRef.current.select()
 }
 }, [isEditing])

 const handleStartEdit = () => {
 setTempValue(value)
 setIsEditing(true)
 }

 const handleCancel = () => {
 setIsEditing(false)
 setTempValue('')
 }

 const handleSave = async () => {
 if (isSaving) return

 const trimmedValue = tempValue.trim()

 if (trimmedValue === value) {
 handleCancel()
 return
 }

 // Empty instrument is invalid; close the editor without saving (the server
 // would reject it anyway) and let the user re-open to retry. Previously this
 // early-returned WITHOUT closing, trapping the user in edit mode.
 if (trimmedValue === '') {
 handleCancel()
 return
 }

 setIsSaving(true)

 try {
 await onUpdate(tradeIds, { instrument: trimmedValue })
 setIsEditing(false)
 } catch {
 // Swallowing the error silently hid failures and left the editor stuck open.
 // Always close the editor on blur; the optimistic update is rolled back by
 // updateTrades' catch handler, so the value reverts on next render.
 setIsEditing(false)
 } finally {
 setIsSaving(false)
 }
 }

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') {
 e.preventDefault()
 handleSave()
 } else if (e.key === 'Escape') {
 e.preventDefault()
 handleCancel()
 }
 }

 if (isEditing) {
 return (
 <div className="flex items-center gap-1 min-w-[120px]">
 <Input
 ref={inputRef}
 value={tempValue}
 onChange={(e) => setTempValue(e.target.value)}
 onKeyDown={handleKeyDown}
 onBlur={handleSave}
 placeholder="Instrument"
 className="h-7 text-xs font-medium border-transparent focus-visible:ring-1"
 disabled={isSaving}
 />
 <Button 
 size="sm"
 variant="ghost"
 className="h-7 w-7 p-0 hover:bg-secondary/30"
 onClick={handleSave}
 disabled={isSaving}
 >
 <Check className="h-3 w-3 text-foreground" />
 </Button>
 <Button 
 size="sm"
 variant="ghost"
 className="h-7 w-7 p-0 hover:bg-secondary/22"
 onClick={handleCancel}
 disabled={isSaving}
 >
 <X className="h-3 w-3 text-muted-foreground" />
 </Button>
 </div>
 )
 }

 return (
 <div
 className={cn("group cursor-pointer hover:bg-secondary/22 rounded px-2 py-1 transition-colors border border-transparent hover:border-transparent flex items-center gap-2",
 className
 )}
 onClick={handleStartEdit}
 >
 <span className="text-sm font-medium">{value}</span>
 <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
 </div>
 )
}
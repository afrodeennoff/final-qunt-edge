'use client'

import React, { useState } from 'react'
import { BadgeV2, ButtonV2, InputV2, CardV2 as Card, CardV2Content as CardContent, CardV2Header as CardHeader, CardV2Title as CardTitle } from "@/components/ui/v2"
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Clock, Edit3, Plus, Minus, X } from 'lucide-react'
import { useI18n } from '@/locales/client'
import { cn } from '@/lib/utils'

interface BulkEditUpdates {
  entryDateOffset?: number
  closeDateOffset?: number
  instrument?: string
  instrumentTrim?: { fromStart: number; fromEnd: number }
  instrumentPrefix?: string
  instrumentSuffix?: string
}

interface BulkEditPanelProps {
  selectedTrades: string[]
  onUpdate: (tradeIds: string[], updates: BulkEditUpdates) => Promise<void>
  onClose: () => void
  onFinish: () => void
  className?: string
}

export function BulkEditPanel({ 
  selectedTrades, 
  onUpdate, 
  onClose,
  onFinish,
  className 
}: BulkEditPanelProps) {
  const t = useI18n()
  const [isVisible, setIsVisible] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Time adjustment states
  const [entryHourOffset, setEntryHourOffset] = useState(0)
  const [exitHourOffset, setExitHourOffset] = useState(0)
  
  // Instrument edit state
  const [instrumentAction, setInstrumentAction] = useState<'none' | 'replace' | 'trim' | 'prefix' | 'suffix'>('none')
  const [instrumentValue, setInstrumentValue] = useState('')
  const [trimFromStart, setTrimFromStart] = useState(0)
  const [trimFromEnd, setTrimFromEnd] = useState(0)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 150) // Allow animation to complete
  }

  const handleApplyTimeChanges = async () => {
    if (isSaving || (entryHourOffset === 0 && exitHourOffset === 0)) return

    setIsSaving(true)
    try {
      const updates: BulkEditUpdates = {}
      
      if (entryHourOffset !== 0) {
        // This is a special marker that tells the backend to apply hour offset
        updates.entryDateOffset = entryHourOffset
      }
      
      if (exitHourOffset !== 0) {
        updates.closeDateOffset = exitHourOffset
      }

      await onUpdate(selectedTrades, updates)
      setEntryHourOffset(0)
      setExitHourOffset(0)
      onFinish()
    } catch (error) {
      console.error('Error applying time changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyInstrumentChanges = async () => {
    if (isSaving || instrumentAction === 'none') return

    setIsSaving(true)
    try {
      const updates: BulkEditUpdates = {}
      
      switch (instrumentAction) {
        case 'replace':
          if (instrumentValue.trim()) {
            updates.instrument = instrumentValue.trim()
          }
          break
        case 'trim':
          updates.instrumentTrim = {
            fromStart: trimFromStart,
            fromEnd: trimFromEnd
          }
          break
        case 'prefix':
          if (instrumentValue.trim()) {
            updates.instrumentPrefix = instrumentValue.trim()
          }
          break
        case 'suffix':
          if (instrumentValue.trim()) {
            updates.instrumentSuffix = instrumentValue.trim()
          }
          break
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(selectedTrades, updates)
      }
      
      setInstrumentAction('none')
      setInstrumentValue('')
      setTrimFromStart(0)
      setTrimFromEnd(0)
      onFinish()
    } catch (error) {
      console.error('Error applying instrument changes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isVisible) return null

  return (
    <Card className={cn(
      "fixed left-2 right-2 z-50 max-h-[calc(100dvh-env(safe-area-inset-bottom)-0.5rem)] overflow-y-auto border-2 shadow-2xl transition-all duration-150 ease-out sm:bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:left-auto sm:right-4 sm:w-96",
      "bottom-[calc(env(safe-area-inset-bottom)+0.5rem)]",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {t('trade-table.bulkEdit.title')}
            <BadgeV2 variant="secondary" className="text-xs">
              {selectedTrades.length} {t('trade-table.bulkEdit.trades')}
            </BadgeV2>
          </CardTitle>
          <ButtonV2 
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </ButtonV2>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Adjustments */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">{t('trade-table.bulkEdit.timezoneAdjustments')}</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('trade-table.bulkEdit.entryTime')}</Label>
              <div className="flex items-center gap-1">
                <ButtonV2 
                  size="sm"
                  variant="outline"
                  onClick={() => setEntryHourOffset(prev => prev - 1)}
                  className="h-7 w-7 p-0"
                >
                  <Minus className="h-3 w-3" />
                </ButtonV2>
                <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1 min-w-[50px] text-center">
                  {entryHourOffset === 0 ? '±0h' : `${entryHourOffset > 0 ? '+' : ''}${entryHourOffset}h`}
                </div>
                <ButtonV2 
                  size="sm"
                  variant="outline"
                  onClick={() => setEntryHourOffset(prev => prev + 1)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </ButtonV2>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t('trade-table.bulkEdit.exitTime')}</Label>
              <div className="flex items-center gap-1">
                <ButtonV2 
                  size="sm"
                  variant="outline"
                  onClick={() => setExitHourOffset(prev => prev - 1)}
                  className="h-7 w-7 p-0"
                >
                  <Minus className="h-3 w-3" />
                </ButtonV2>
                <div className="text-xs font-mono bg-muted/50 rounded px-2 py-1 min-w-[50px] text-center">
                  {exitHourOffset === 0 ? '±0h' : `${exitHourOffset > 0 ? '+' : ''}${exitHourOffset}h`}
                </div>
                <ButtonV2 
                  size="sm"
                  variant="outline"
                  onClick={() => setExitHourOffset(prev => prev + 1)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </ButtonV2>
              </div>
            </div>
          </div>
          
          {(entryHourOffset !== 0 || exitHourOffset !== 0) && (
            <ButtonV2 
              size="sm"
              onClick={handleApplyTimeChanges}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? t('trade-table.bulkEdit.applying') : t('trade-table.bulkEdit.applyTimeChanges')}
            </ButtonV2>
          )}
        </div>

        <Separator />

        {/* Instrument Modifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">{t('trade-table.bulkEdit.instrumentModifications')}</Label>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1">
              <ButtonV2 
                size="sm"
                variant={instrumentAction === 'replace' ? 'default' : 'outline'}
                onClick={() => setInstrumentAction('replace')}
                className="text-xs"
              >
                {t('trade-table.bulkEdit.replace')}
              </ButtonV2>
              <ButtonV2 
                size="sm"
                variant={instrumentAction === 'trim' ? 'default' : 'outline'}
                onClick={() => setInstrumentAction('trim')}
                className="text-xs"
              >
                {t('trade-table.bulkEdit.trim')}
              </ButtonV2>
              <ButtonV2 
                size="sm"
                variant={instrumentAction === 'prefix' ? 'default' : 'outline'}
                onClick={() => setInstrumentAction('prefix')}
                className="text-xs"
              >
                {t('trade-table.bulkEdit.addPrefix')}
              </ButtonV2>
              <ButtonV2 
                size="sm"
                variant={instrumentAction === 'suffix' ? 'default' : 'outline'}
                onClick={() => setInstrumentAction('suffix')}
                className="text-xs"
              >
                {t('trade-table.bulkEdit.addSuffix')}
              </ButtonV2>
            </div>

            {instrumentAction === 'replace' && (
              <InputV2
                placeholder={t('trade-table.bulkEdit.newInstrumentName')}
                value={instrumentValue}
                onChange={(e) => setInstrumentValue(e.target.value)}
                className="h-8 text-xs"
              />
            )}

            {instrumentAction === 'trim' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('trade-table.bulkEdit.fromStart')}</Label>
                  <div className="flex items-center gap-1">
                    <ButtonV2 
                      size="sm"
                      variant="outline"
                      onClick={() => setTrimFromStart(prev => Math.max(0, prev - 1))}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </ButtonV2>
                    <div className="text-xs bg-muted/50 rounded px-2 py-1 min-w-[40px] text-center">
                      {trimFromStart}
                    </div>
                    <ButtonV2 
                      size="sm"
                      variant="outline"
                      onClick={() => setTrimFromStart(prev => prev + 1)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </ButtonV2>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('trade-table.bulkEdit.fromEnd')}</Label>
                  <div className="flex items-center gap-1">
                    <ButtonV2 
                      size="sm"
                      variant="outline"
                      onClick={() => setTrimFromEnd(prev => Math.max(0, prev - 1))}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </ButtonV2>
                    <div className="text-xs bg-muted/50 rounded px-2 py-1 min-w-[40px] text-center">
                      {trimFromEnd}
                    </div>
                    <ButtonV2 
                      size="sm"
                      variant="outline"
                      onClick={() => setTrimFromEnd(prev => prev + 1)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </ButtonV2>
                  </div>
                </div>
              </div>
            )}

            {(instrumentAction === 'prefix' || instrumentAction === 'suffix') && (
              <InputV2
                placeholder={instrumentAction === 'prefix' ? t('trade-table.bulkEdit.textToPrepend') : t('trade-table.bulkEdit.textToAppend')}
                value={instrumentValue}
                onChange={(e) => setInstrumentValue(e.target.value)}
                className="h-8 text-xs"
              />
            )}

            {instrumentAction !== 'none' && (
              <ButtonV2 
                size="sm"
                onClick={handleApplyInstrumentChanges}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? t('trade-table.bulkEdit.applying') : t('trade-table.bulkEdit.applyInstrumentChanges')}
              </ButtonV2>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link2, FileSpreadsheet, Database, Pencil, Search, LayoutGrid, ListFilter, GitCompare, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTypedI18n } from "@/locales/client"
import { platforms, PlatformConfig } from './config/platforms'
import { PlatformCard } from './components/platform-card'
import { PlatformTutorial } from './components/platform-tutorial'
import { cn } from '@/lib/utils'
import { useImportTypePreferenceStore } from '@/store/import-type-preference-store'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from '@/hooks/use-mobile'

export type ImportType = string

interface ImportTypeSelectionProps {
 selectedType: ImportType
 setSelectedType: React.Dispatch<React.SetStateAction<ImportType>>
 setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const categoryIcons: Record<PlatformConfig['category'], React.ReactNode> = {
 'Direct Account Sync': <Link2 className="h-4 w-4" />,
 'Intelligent Import': <FileSpreadsheet className="h-4 w-4" />,
 'Platform CSV Import': <Database className="h-4 w-4" />,
 'Manual Entry': <Pencil className="h-4 w-4" />
}

// Function to check if it's weekend
function isWeekend() {
 const day = new Date().getDay()
 return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}

export default function ImportTypeSelection({ selectedType, setSelectedType, setIsOpen }: ImportTypeSelectionProps) {
 const [searchQuery, setSearchQuery] = useState('')
 const [activeCategory, setActiveCategory] = useState<string>("all")
 const [isCompareMode, setIsCompareMode] = useState(false)
 const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
 const t = useTypedI18n()
 const isMobile = useIsMobile()
 const { lastSelectedType, setLastSelectedType } = useImportTypePreferenceStore()
 const deferredSearchQuery = useDeferredValue(searchQuery)
 const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase()

 // Stable reference — platforms array is constant, no need to rebuild
 const platformsByType = useMemo(
 () => new Map(platforms.map((platform) => [platform.type, platform])),
 []
 )

 const handlePlatformCheck = (platformType: string, checked: boolean) => {
 setSelectedPlatforms(prev => {
 if (checked) {
 if (prev.length >= 4) return prev
 return [...prev, platformType]
 } else {
 return prev.filter(p => p !== platformType)
 }
 })
 }

 const clearSelection = () => {
 setSelectedPlatforms([])
 }

 // Set default selection from store preference
 useEffect(() => {
 if (lastSelectedType && !selectedType) {
 const preferredPlatform = platformsByType.get(lastSelectedType)
 if (preferredPlatform && !preferredPlatform.isDisabled && !preferredPlatform.isComingSoon) {
 setSelectedType(lastSelectedType)
 }
 }
 }, [lastSelectedType, platformsByType, selectedType, setSelectedType])

 useEffect(() => {
 if (!selectedType) return
 const selectedPlatform = platformsByType.get(selectedType)
 if (selectedPlatform?.isDisabled || selectedPlatform?.isComingSoon) {
 setSelectedType('')
 }
 }, [platformsByType, selectedType, setSelectedType])

 const getTranslatedCategory = useCallback((category: PlatformConfig['category']) => {
 switch (category) {
 case 'Direct Account Sync':
 return t('import.type.category.directSync')
 case 'Intelligent Import':
 return t('import.type.category.intelligentImport')
 case 'Platform CSV Import':
 return t('import.type.category.platformCsv')
 case 'Manual Entry':
 return t('import.type.category.manualEntry')
 default:
 return category
 }
 }, [t])

 const filteredPlatforms = useMemo(() => {
 return platforms.filter((platform) => {
 const matchesSearch =
 normalizedSearchQuery.length === 0 ||
 String(t(platform.name, { count: 1 })).toLowerCase().includes(normalizedSearchQuery) ||
 String(t(platform.description, { count: 1 })).toLowerCase().includes(normalizedSearchQuery) ||
 String(getTranslatedCategory(platform.category)).toLowerCase().includes(normalizedSearchQuery)

 const matchesCategory = activeCategory ==="all" || platform.category === activeCategory

 return matchesSearch && matchesCategory
 })
 }, [activeCategory, getTranslatedCategory, normalizedSearchQuery, t])

 const allCategories = useMemo(
 () => Array.from(new Set(platforms.map((platform) => platform.category))),
 []
 )

 const selectedPlatform = selectedType ? platformsByType.get(selectedType) : undefined
 const showDesktopDetailPanel =
 (isCompareMode && selectedPlatforms.length >= 2) || (!!selectedType && !!selectedPlatform)

 return (
 <div className="flex flex-col h-full bg-v2-bg-base/50">
 <div
 className={cn("grid h-full overflow-hidden",
 "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]",
 showDesktopDetailPanel && "lg:divide-x lg:divide-v2-border",
 )}
 >
 {/* Left Side: Grid of options */}
 <div className="flex flex-col gap-4 h-full min-h-0 relative">
 {/* Header & Filter */}
 <div className="p-4 border-b border-v2-border bg-v2-bg-surface/95 sticky top-0 z-10">
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-v2-text-muted" />
 <Input
 placeholder={String(t('import.type.search'))}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 bg-v2-bg-hover/50 border-transparent hover:bg-v2-bg-hover/80 focus:bg-v2-bg-surface transition-[opacity,background-color,border-color]"
 />
 </div>
 <Button
 variant={isCompareMode ?"default" :"outline"}
 size="sm"
 onClick={() => setIsCompareMode(!isCompareMode)}
 className={cn("shrink-0 gap-2",
 isCompareMode &&"bg-v2-accent text-v2-bg-base hover:bg-v2-accent/90"
 )}
 >
 <GitCompare className="h-4 w-4" />
 Compare
 </Button>
 </div>

 <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
 <ScrollArea className="w-full pb-2">
 <TabsList className="bg-transparent p-0 h-auto gap-2">
 <TabsTrigger
 value="all"
 className="data-[state=active]:bg-v2-accent/10 data-[state=active]:text-v2-accent border border-transparent data-[state=active]:border-v2-accent/20 rounded-full px-4 h-8"
 >
 <LayoutGrid className="h-3 w-3 mr-2" />
 All
 </TabsTrigger>
 {allCategories.map(cat => (
 <TabsTrigger
 key={cat}
 value={cat}
 className="data-[state=active]:bg-v2-accent/10 data-[state=active]:text-v2-accent border border-transparent data-[state=active]:border-v2-accent/20 rounded-full px-4 h-8"
 >
 {categoryIcons[cat]}
 <span className="ml-2">{getTranslatedCategory(cat)}</span>
 </TabsTrigger>
 ))}
 </TabsList>
 </ScrollArea>
 </Tabs>
 </div>

 {/* Grid Content */}
 <ScrollArea className="flex-1 p-4 md:p-6">
 <div className="grid auto-rows-fr gap-4 pb-20 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
 {filteredPlatforms.length > 0 ? (
 filteredPlatforms.map((platform) => (
 <div key={platform.type} className="h-full">
 <PlatformCard
 platform={platform}
 isSelected={selectedType === platform.type}
 onSelect={(type) => {
 if (!isCompareMode) {
 setSelectedType(type as ImportType)
 setLastSelectedType(type as ImportType)
 }
 }}
 isWeekend={isWeekend()}
 isMultiSelectMode={isCompareMode}
 isChecked={selectedPlatforms.includes(platform.type)}
 onCheckChange={(checked) => handlePlatformCheck(platform.type, checked)}
 />
 </div>
 ))
 ) : (
 <div className="col-span-full py-16 text-center">
 <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-v2-bg-hover mb-5">
 <ListFilter className="h-8 w-8 text-v2-text-muted" />
 </div>
 <p className="text-base font-medium text-v2-text-primary mb-1.5">
 {t('import.type.noResults')}
 </p>
 <p className="text-sm text-v2-text-muted">
 Try adjusting your search or filter criteria
 </p>
 </div>
 )}
 </div>
 </ScrollArea>

 {isCompareMode && selectedPlatforms.length >= 2 && (
 <div className="absolute bottom-4 left-4 right-4 z-20"
 >
 <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-v2-bg-surface/95 border border-v2-border shadow-[inset_0_1px_0_hsl(var(--primary)/0.08),0_16px_48px_-16px_rgba(0,0,0,0.5)] shadow-v2-bg-base/50">
 <div className="flex items-center gap-2 text-sm text-v2-text-secondary">
 <span>{selectedPlatforms.length} platforms selected</span>
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 size="sm"
 onClick={clearSelection}
 className="text-v2-text-muted hover:text-v2-text-primary"
 >
 <X className="h-4 w-4 mr-1" />
 Clear
 </Button>
 <Button
 variant="default"
 size="sm"
 onClick={() => setIsCompareMode(true)}
 className="bg-v2-accent text-v2-bg-base hover:bg-v2-accent/90 gap-2"
 >
 <GitCompare className="h-4 w-4" />
 Compare
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Always reserve right panel space on desktop */}
 <div className={cn("relative hidden h-full overflow-hidden lg:flex", showDesktopDetailPanel ? "bg-v2-bg-hover/20" : "bg-transparent")}>
 {isCompareMode && selectedPlatforms.length >= 2 ? (
 <div className="h-full flex flex-col w-full">
 <div className="p-4 border-b border-v2-border flex items-center justify-between">
 <h3 className="text-sm font-semibold text-v2-text-primary">Compare Platforms</h3>
 <Button variant="ghost" size="sm" onClick={() => setIsCompareMode(false)}>
 <X className="h-4 w-4" />
 </Button>
 </div>
 <div className="h-full overflow-y-auto p-4">
 <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(selectedPlatforms.length, 4)}, 1fr)` }}>
 {selectedPlatforms.slice(0, 4).map(platformType => {
 const platform = platformsByType.get(platformType)
 if (!platform) return null
 return (
 <div key={platform.type} className="flex flex-col">
 <Card variant="default" size="sm" className="h-full">
 <CardContent className="p-4 flex flex-col gap-3">
 <div className="flex items-center gap-3">
 {platform.logo.path && (
 <div className="relative h-10 w-10 shrink-0">
 <Image
 src={platform.logo.path}
 alt={platform.logo.alt ||""}
 fill
 sizes="40px"
 className="object-contain"
 />
 </div>
 )}
 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-semibold text-v2-text-primary truncate">
 {t(platform.name, { count: 1 })}
 </h4>
 <p className="text-xs text-v2-text-secondary truncate">
 {platform.category}
 </p>
 </div>
 <Button
 variant="ghost"
 size="sm"
 className="h-7 w-7 p-0"
 onClick={() => handlePlatformCheck(platform.type, false)}
 >
 <X className="h-3 w-3" />
 </Button>
 </div>
 <p className="text-xs text-v2-text-muted line-clamp-3">
 {t(platform.description, { count: 1 })}
 </p>
 <div className="flex flex-wrap gap-1.5 mt-auto">
 {!platform.isDisabled && !platform.isComingSoon && (
 <Badge variant="success" className="text-[10px]">Available</Badge>
 )}
 {platform.isDisabled && (
 <Badge variant="warning" className="text-[10px]">Maintenance</Badge>
 )}
 {platform.isComingSoon && (
 <Badge variant="secondary" className="text-[10px] bg-semantic-info-bg/10 text-semantic-info">Coming Soon</Badge>
 )}
 {platform.isRithmic && (
 <Badge variant="outline" className="text-[10px]">Rithmic</Badge>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 )
 })}
 </div>
 </div>
 </div>
 ) : selectedType && selectedPlatform ? (
 <div className="h-full flex flex-col">
 <div className="h-full overflow-y-auto p-6">
 {selectedPlatform.customComponent ? (
 <selectedPlatform.customComponent setIsOpen={setIsOpen} />
 ) : (
 <PlatformTutorial selectedPlatform={selectedPlatform} setIsOpen={setIsOpen} />
 )}
 </div>
 </div>
 ) : (
 <div className="flex items-center justify-center h-full text-muted-foreground">
 <p className="text-sm">Select a platform to view details</p>
 </div>
 )}
 </div>

 {isMobile && selectedType && selectedPlatform && (
 <Sheet open={!!selectedType} onOpenChange={() => {
 setSelectedType('')
 setLastSelectedType('')
 }}>
 <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl bg-v2-bg-surface border-v2-border p-0">
 {/* Drag Handle */}
 <div className="flex justify-center py-3">
 <div className="h-1.5 w-12 rounded-full bg-v2-border" />
 </div>
 <SheetHeader className="px-4 pb-2">
 <SheetTitle className="text-v2-text-primary">
 {t(selectedPlatform.name, { count: 1 })}
 </SheetTitle>
 </SheetHeader>
 <div className="h-[calc(85vh-100px)] overflow-y-auto px-4 pb-4">
 {selectedPlatform.customComponent ? (
 <selectedPlatform.customComponent setIsOpen={setIsOpen} />
 ) : (
 <PlatformTutorial selectedPlatform={selectedPlatform} setIsOpen={setIsOpen} />
 )}
 </div>
 </SheetContent>
 </Sheet>
 )}
 </div>
 </div>
 )
}

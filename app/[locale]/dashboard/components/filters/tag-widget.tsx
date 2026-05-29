'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/locales/client'
import { useDashboardFilters, useDashboardActions } from '@/context/data-provider'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from '@/components/ui/label'
import { Plus, X, Edit2, Trash2, Search, Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '@/components/ui/dialog'
import { WidgetShell } from '@/components/ui/widget-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip"
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'
import { createTagAction, updateTagAction, deleteTagAction, syncTradeTagsToTagTableAction } from '@/server/tags'
import { deleteTagFromAllTrades } from '@/server/trades'
import { toast } from "sonner"
import { Tag } from '@/prisma/generated/prisma'
import { Trade } from '@/lib/data-types'
import { WidgetSize } from '@/app/[locale]/dashboard/types/dashboard'
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTradingDomainStore } from '@/store/trading-domain-store'
import { useUserStore } from '../../../../../store/user-store'

interface TagType {
 id: string
 name: string
 description?: string | null
 color?: string | null
 createdAt: Date
 updatedAt: Date
}

interface TagFormData {
 name: string
 description: string | null
 color: string
}

interface TagWidgetProps {
 size?: WidgetSize
 onTagSelectionChange?: (selectedTags: string[]) => void
}

// Hex is intentionally used here because HexColorPicker requires hex input.
const DEFAULT_TAG_COLOR = 'var(--muted-foreground)'

export function TagWidget({ size = 'medium', onTagSelectionChange }: TagWidgetProps) {
 const t = useI18n()
 const { tagFilter, setTagFilter } = useDashboardFilters()
 const { updateTrades } = useDashboardActions()
 const contextTrades = useTradingDomainStore(state => state.trades)
 const tags = useUserStore(state => state.tags)
 const setTags = useUserStore(state => state.setTags)
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
 const [editingTag, setEditingTag] = useState<TagType | null>(null)
 const [formData, setFormData] = useState<TagFormData>({
 name: '',
 description: null,
 color: DEFAULT_TAG_COLOR
 })
 const [isLoading, setIsLoading] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [tagToDelete, setTagToDelete] = useState<TagType | null>(null)
 const [filteredTags, setFilteredTags] = useState<TagType[]>([])

 // Update parent component when selected tags change
 useEffect(() => {
 onTagSelectionChange?.(tagFilter.tags)
 }, [tagFilter.tags, onTagSelectionChange])

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsLoading(true)

 try {
 const trimmedName = formData.name.trim()

 // Check if name is empty
 if (!trimmedName) {
 toast.error(t('widgets.tags.error'), {
 description: t('widgets.tags.nameRequired'),
 })
 return
 }

 // Close dialog immediately
 setIsAddDialogOpen(false)

 if (editingTag) {
 const oldTagName = editingTag.name
 const newTagName = trimmedName

 // Check if new name already exists (excluding the current tag)
 const tagExists = tags.some(tag =>
 tag.id !== editingTag.id && tag.name === newTagName
 )

 if (tagExists) {
 toast.error(t('widgets.tags.error'), {
 description: t('widgets.tags.tagExists'),
 })
 return
 }

 const updatedTag = await updateTagAction(editingTag.id, {
 name: trimmedName,
 description: formData.description || undefined,
 color: formData.color
 })

 // Update tag metadata in context and cache
 const newTags = tags.map(tag =>
 tag.name === oldTagName
 ? { ...tag, name: newTagName, color: formData.color, description: formData.description }
 : tag
 )
 setTags(newTags)

 // If tag name changed, update all trades that use this tag
 if (oldTagName !== newTagName) {
 // Update trades that have this tag
 // We need to update trade by trade, as some trades may have multiple tags
 // and we need to update each one individually
 // This is a bit of a hack, but it's the only way to ensure that the trades are updated correctly

 // We need to find each trade which include the old tag name and replace it with the new tag name
 contextTrades.forEach((trade: Trade) => {
 if (trade.tags.includes(oldTagName)) {
 trade.tags = trade.tags.map((tag: string) =>
 tag === oldTagName ? newTagName : tag
 )
 updateTrades([trade.id], {
 tags: trade.tags.map((tag: string) =>
 tag === oldTagName ? newTagName : tag
 )
 })
 }
 })

 // Update tag filter if the renamed tag was selected
 if (tagFilter.tags.includes(oldTagName)) {
 setTagFilter(prev => ({
 tags: prev.tags.map(tag =>
 tag === oldTagName ? newTagName : tag
 )
 }))
 }
 }

 toast.success(t('widgets.tags.success'), {
 description: t('widgets.tags.updateSuccess'),
 })
 } else {
 // Check if tag already exists
 const tagExists = tags.some(tag =>
 tag.name === trimmedName
 )

 if (tagExists) {
 toast.error(t('widgets.tags.error'), {
 description: t('widgets.tags.tagExists'),
 })
 return
 }

 // Create new tag
 const newTag = await createTagAction({
 name: trimmedName,
 description: formData.description || undefined,
 color: formData.color
 })

 // Update tag metadata in context and cache
 setTags([...tags, newTag.tag])

 toast.success(t('widgets.tags.success'), {
 description: t('widgets.tags.createSuccess'),
 })
 }

 setEditingTag(null)
 setFormData({ name: '', description: null, color: DEFAULT_TAG_COLOR })
 } catch {

 toast.error(t('widgets.tags.error'), {
 description: editingTag ? t('widgets.tags.updateError') : t('widgets.tags.createError'),
 })
 } finally {
 setIsLoading(false)
 }
 }

 const handleDelete = async (tag: TagType) => {
 setTagToDelete(tag)
 }

 const confirmDelete = async () => {
 if (!tagToDelete) return

 setIsLoading(true)
 try {
 await deleteTagAction(tagToDelete.id)

 // Update local tags state and cache
 setTags(tags.filter(tag => tag.id !== tagToDelete.id))

 // Remove the tag from all trades 
 await deleteTagFromAllTrades(tagToDelete.name)

 const currentTrades = useTradingDomainStore.getState().trades
 const updatedTrades = currentTrades.map((trade: Trade) =>
 trade.tags.includes(tagToDelete.name)
 ? { ...trade, tags: trade.tags.filter((t: string) => t !== tagToDelete.name) }
 : trade
 )
 useTradingDomainStore.getState().setTrades(updatedTrades)

 // Also remove from tag filter if it's selected
 if (tagFilter.tags.includes(tagToDelete.name)) {
 setTagFilter(prev => ({
 tags: prev.tags.filter(t => t !== tagToDelete.name)
 }))
 }

 toast.success(t('widgets.tags.success'), {
 description: t('widgets.tags.deleteSuccess'),
 })
 } catch {

 toast.error(t('widgets.tags.error'), {
 description: t('widgets.tags.deleteError'),
 })
 } finally {
 setIsLoading(false)
 setTagToDelete(null)
 }
 }

 const handleEdit = (tag: TagType) => {
 setEditingTag(tag)
 setFormData({
 name: tag.name,
 description: tag.description ?? null,
 color: tag.color || DEFAULT_TAG_COLOR
 })
 setIsAddDialogOpen(true)
 }

 useEffect(() => {
 // Filter tags based on search query
 const filteredTags = tags?.filter(tag =>
 tag.name.includes(searchQuery)
 ) ?? []
 setFilteredTags(filteredTags)
 }, [tags, searchQuery])

 return (
 <>
 <WidgetShell
 title={t('widgets.tags.title')}
 icon={<Info className={cn("text-muted-foreground", size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4")} />}
 info={t('widgets.tags.description')}
 actions={
 <div className="flex items-center gap-2">
 {tagFilter.tags.length > 0 && (
 <Button 
 variant="ghost"
 size="sm"
 className={cn("h-8 px-2 lg:px-3 text-xs hover:bg-muted/50",
 size === 'small' ?"h-6" :"h-8"
 )}
 onClick={() => setTagFilter({ tags: [] })}
 >
 {t('widgets.tags.clearFilter')}
 </Button>
 )}
 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
 <DialogTrigger asChild>
 <Button 
 variant="ghost"
 size="icon"
 className={cn("shrink-0 hover:bg-muted/50",
 size === 'small' ?"h-6 w-6" :"h-8 w-8"
 )}
 disabled={isLoading}
 >
 <Plus className={cn(
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )} />
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>
 {editingTag ? t('widgets.tags.editTag') : t('widgets.tags.addTag')}
 </DialogTitle>
 <DialogDescription>
 {t('widgets.tags.description')}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="name">{t('widgets.tags.name')}</Label>
 <Input
 id="name"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder={t('widgets.tags.namePlaceholder')}
 disabled={isLoading}
 className="h-9"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="description">{t('widgets.tags.description')}</Label>
 <Textarea
 id="description"
 value={formData.description || ''}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 placeholder={t('widgets.tags.descriptionPlaceholder')}
 disabled={isLoading}
 className="resize-none h-20"
 />
 </div>
 <div className="space-y-2">
 <Label>{t('widgets.tags.color')}</Label>
 <div className="flex gap-4 items-start">
 <div
 className="w-10 h-10 rounded-md border shadow-xs"
 style={{ backgroundColor: formData.color }}
 />
 <div className="flex-1">
 <HexColorPicker
 color={formData.color}
 onChange={(color) => setFormData({ ...formData, color })}
 />
 </div>
 </div>
 </div>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={isLoading}>
 {isLoading ? (
 <div className="flex items-center gap-2">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
 {t('widgets.tags.saving')}
 </div>
 ) : (
 editingTag ? t('widgets.tags.save') : t('widgets.tags.create')
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 }
 className="h-full flex flex-col"
 contentClassName={cn("flex-1 min-h-0 overflow-hidden pt-0",
 size === 'small' ?"px-1" :"px-2 sm:px-4"
 )}
 >
 <div className="flex flex-col h-full gap-3">
 {/* Search input */}
 <div className="flex items-center gap-2 shrink-0 bg-muted/30 rounded-md px-2">
 <Search className={cn("text-muted-foreground",
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )} />
 <Input
 placeholder={t('widgets.tags.searchPlaceholder')}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className={cn("flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
 size === 'small' ?"h-7 text-xs" :"h-8 text-sm"
 )}
 />
 </div>

 {/* Tag filters */}
 <div className="flex-1 min-h-0 -mx-1">
 <ScrollArea
 className="h-full px-1"
 type="hover"
 >
 <div className={cn("gap-0.5",
 size === 'small' ?"min-h-[150px]" :"min-h-[200px]"
 )}>
 {filteredTags.map((tag) => (
 <div
 key={tag.id}
 className={cn("flex items-center justify-between rounded-md hover:bg-muted/50 transition-colors group",
 size === 'small' ?"p-1" :"p-1.5"
 )}
 >
 <div className="flex items-center gap-2 min-w-0">
 <Checkbox
 checked={tagFilter.tags.includes(tag.name)}
 onCheckedChange={(checked) => {
 setTagFilter(prev => ({
 tags: checked
 ? [...prev.tags, tag.name]
 : prev.tags.filter(t => t !== tag.name)
 }))
 }}
 id={`tag-${tag.id}`}
 className={cn(
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )}
 />
 <div
 className={cn("rounded-full shrink-0",
 size === 'small' ?"w-2.5 h-2.5" :"w-3 h-3"
 )}
 style={{ backgroundColor: tag.color || DEFAULT_TAG_COLOR }}
 />
 <label
 htmlFor={`tag-${tag.id}`}
 className={cn("font-medium cursor-pointer truncate flex-1",
 size === 'small' ?"text-xs" :"text-sm"
 )}
 >
 <TooltipProvider>
 <Tooltip>
 <TooltipTrigger asChild>
 <span className={cn("font-medium cursor-pointer truncate flex-1",
 size === 'small' ?"text-xs" :"text-sm"
 )}>
 {tag.name.length > 35 ? `${tag.name.slice(0, 35)}...` : tag.name}
 </span>
 </TooltipTrigger>
 <TooltipContent side="top" className="max-w-[300px]">
 <div className="gap-1">
 <p className="font-medium wrap-break-word">{tag.name}</p>
 {tag.description && (
 <p className="text-sm text-muted-foreground wrap-break-word whitespace-pre-wrap">{tag.description}</p>
 )}
 </div>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 </label>
 </div>
 <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
 <Button 
 variant="ghost"
 size="icon"
 className={cn("hover:bg-background/25",
 size === 'small' ?"h-6 w-6" :"h-7 w-7"
 )}
 onClick={() => handleEdit(tag)}
 disabled={isLoading}
 >
 <Edit2 className={cn(
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )} />
 </Button>
 <Button 
 variant="ghost"
 size="icon"
 className={cn("text-destructive hover:text-destructive hover:bg-destructive/10",
 size === 'small' ?"h-6 w-6" :"h-7 w-7"
 )}
 onClick={() => handleDelete(tag)}
 disabled={isLoading}
 >
 <Trash2 className={cn(
 size === 'small' ?"h-3.5 w-3.5" :"h-4 w-4"
 )} />
 </Button>
 </div>
 </div>
 ))}
 {filteredTags.length === 0 && (
 <div className={cn("flex items-center justify-center text-muted-foreground h-[200px]",
 size === 'small' ?"text-xs" :"text-sm"
 )}>
 {searchQuery ? t('widgets.tags.noResults') : t('widgets.tags.noTags')}
 </div>
 )}
 </div>
 </ScrollArea>
 </div>
 </div>
 </WidgetShell>

 <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>{t('widgets.tags.deleteConfirmTitle')}</AlertDialogTitle>
 <AlertDialogDescription>
 {t('widgets.tags.deleteConfirmDescription', { tag: tagToDelete?.name })}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={isLoading}>
 {t('widgets.tags.cancel')}
 </AlertDialogCancel>
 <AlertDialogAction
 onClick={confirmDelete}
 disabled={isLoading}
 className="bg-destructive hover:bg-destructive/90"
 >
 {isLoading ? (
 <div className="flex items-center gap-2">
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
 {t('widgets.tags.deleting')}
 </div>
 ) : (
 t('widgets.tags.confirmDelete')
 )}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </>
 )
} 

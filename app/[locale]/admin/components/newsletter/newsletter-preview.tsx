"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNewsletter } from "./newsletter-context"
import { useEffect, useState } from "react"
import { renderEmailPreview } from "../../actions/newsletter"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from '@/components/ui/button'
import { Pencil, Eye } from "lucide-react"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from "@/components/ui/label"
import { NewsletterContent } from "./newsletter-context"

export function NewsletterPreview() {
 const { content, setContent } = useNewsletter()
 const [emailHtml, setEmailHtml] = useState("")
 const [isEditing, setIsEditing] = useState(false)

 // Debounce the content updates with a 500ms delay
 const debouncedContent = useDebounce(content, 500)

 useEffect(() => {
 const updatePreview = async () => {
 const result = await renderEmailPreview({
 youtubeId: debouncedContent.youtubeId || 'p2pYl6GMGbk',
 introMessage: debouncedContent.introMessage || '*No content yet*',
 features: debouncedContent.features.filter(f => typeof f === 'string' && f.trim()),
 firstName: debouncedContent.firstName,
 subject: debouncedContent.subject
 })

 if (result.success && result.html) {
 setEmailHtml(result.html)
 }
 }

 updatePreview()
 }, [debouncedContent.youtubeId, debouncedContent.introMessage, debouncedContent.features, debouncedContent.firstName, debouncedContent.subject])

 const updateFeature = (index: number, value: string) => {
 const newFeatures = [...content.features]
 newFeatures[index] = value
 setContent((prev: NewsletterContent): NewsletterContent => ({ ...prev, features: newFeatures }))
 }

 const addFeature = () => {
 setContent((prev: NewsletterContent): NewsletterContent => ({
 ...prev,
 features: [...prev.features, ""]
 }))
 }

 const removeFeature = (index: number) => {
 if (content.features.length <= 1) return
 setContent((prev: NewsletterContent): NewsletterContent => ({
 ...prev,
 features: prev.features.filter((_, i: number) => i !== index)
 }))
 }

 return (
 <Card className="h-full">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle>Live Preview</CardTitle>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setIsEditing(!isEditing)}
 >
 {isEditing ? (
 <>
 <Eye className="w-4 h-4 mr-2" />
 View preview
 </>
 ) : (
 <>
 <Pencil className="w-4 h-4 mr-2" />
 Edit
 </>
 )}
 </Button>
 </div>
 </CardHeader>
 <CardContent>
 {isEditing ? (
 <div className="space-y-6">
 <div className="space-y-2">
 <Label>Subject</Label>
 <Input
 value={content.subject}
 onChange={e => setContent((prev: NewsletterContent): NewsletterContent => ({ ...prev, subject: e.target.value }))}
 placeholder="Newsletter subject"
 className="font-medium"
 />
 </div>

 <div className="space-y-2">
 <Label>Introduction message</Label>
 <Textarea
 value={content.introMessage}
 onChange={e => setContent((prev: NewsletterContent): NewsletterContent => ({ ...prev, introMessage: e.target.value }))}
 placeholder="Introduction message..."
 className="min-h-[100px]"
 />
 </div>

 <div className="space-y-4">
 <Label>Key points</Label>
 {content.features.map((feature, index) => (
 <div key={index} className="flex gap-2">
 <Textarea
 value={feature}
 onChange={e => updateFeature(index, e.target.value)}
 placeholder={`Key point ${index + 1}`}
 className="flex-1"
 />
 <Button
 type="button"
 variant="destructive"
 size="icon"
 onClick={() => removeFeature(index)}
 disabled={content.features.length <= 1}
 >
 ✕
 </Button>
 </div>
 ))}
 <Button
 type="button"
 variant="outline"
 onClick={addFeature}
 >
 Add key point
 </Button>
 </div>
 </div>
 ) : (
 <div className="relative bg-card rounded-md min-h-[calc(100dvh-15rem)]">
 <div className="absolute inset-0 overflow-auto">
 <iframe
 srcDoc={emailHtml}
 className="w-full h-full border-0"
 title="Email preview"
 sandbox="allow-same-origin"
 />
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 )
}

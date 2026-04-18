"use client"

import { useEffect, useState, useRef } from "react"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from "sonner"
import { deleteSubscriber, getSubscribers, importSubscribers, sendTestNewsletter } from "@/app/[locale]/admin/actions/newsletter"
import { useNewsletter, type NewsletterContent } from "./newsletter-context"
import { Brain, Loader2, Filter, Eye } from "lucide-react"
import { useI18n } from "@/locales/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Checkbox } from "@/components/ui/checkbox"

interface Subscriber {
 email: string
 firstName: string
 lastName?: string
 isActive: boolean
}

type InferenceConfidence ="high" |"medium" |"low"

interface InferenceSummary {
 totalProcessed: number
 totalUpdated: number
 totalSkipped: number
 totalErrors: number
}

interface UpdatedInferenceResult {
 email: string
 oldName: string | null
 newName: string | null
 confidence: InferenceConfidence
 status:"updated"
}

interface SkippedInferenceResult {
 email: string
 inferredName: string | null
 confidence: InferenceConfidence
 status:"skipped"
 reason: string
}

interface ErrorInferenceResult {
 email: string
 status:"error"
 error: string
}

type InferenceResult = UpdatedInferenceResult | SkippedInferenceResult | ErrorInferenceResult

interface InferenceResults {
 summary: InferenceSummary
 results: InferenceResult[]
}

function normalizeSubscriber(subscriber: { email: string; firstName: string | null; lastName: string | null; isActive: boolean }): Subscriber {
 return {
 email: subscriber.email,
 firstName: subscriber.firstName ||"",
 lastName: subscriber.lastName ||"",
 isActive: subscriber.isActive,
 }
}

function isNewsletterReadyForTest(content: NewsletterContent) {
 return Boolean(
 content.subject &&
 content.youtubeId &&
 content.introMessage &&
 !content.features.some((feature) => !feature)
 )
}

function filterSubscribers(subscribers: Subscriber[], showOnlyTraders: boolean) {
 return showOnlyTraders ? subscribers.filter((sub) => sub.firstName ==="trader") : subscribers
}

function updateSelectedEmails(prev: Set<string>, emails: string[], checked: boolean) {
 const next = new Set(prev)
 emails.forEach((email) => {
 if (checked) {
 next.add(email)
 } else {
 next.delete(email)
 }
 })
 return next
}

function updateSelectedEmail(prev: Set<string>, email: string, checked: boolean) {
 const next = new Set(prev)
 if (checked) {
 next.add(email)
 } else {
 next.delete(email)
 }
 return next
}

async function loadSubscribersData(): Promise<Subscriber[]> {
 const result = await getSubscribers()
 if ("error" in result) {
 throw new Error(result.error)
 }

 return result.subscribers.map(normalizeSubscriber)
}

async function loadNeedsInferenceCount(): Promise<number> {
 const response = await fetch("/api/email/format-name")
 const data = await response.json()

 if (!data.success) {
 throw new Error(data.error ||"Failed to check inference needed")
 }

 return Number(data.needsInference || 0)
}

async function requestNameInference(emails: string[]): Promise<InferenceResults> {
 const response = await fetch("/api/email/format-name", {
 method:"POST",
 headers: {"Content-Type":"application/json",
 },
 body: JSON.stringify({
 batchSize: 10,
 forceUpdate: false,
 emails,
 }),
 })

 const data = await response.json()
 if (!data.success) {
 throw new Error(data.error ||"Failed to infer names")
 }

 return data as InferenceResults
}

async function importSubscriberCsv(file: File): Promise<number> {
 const result = await importSubscribers(file)
 if ("error" in result) {
 throw new Error(result.error)
 }

 return result.count
}

async function deleteSubscriberByEmail(email: string): Promise<void> {
 const result = await deleteSubscriber(email)
 if ("error" in result) {
 throw new Error(result.error)
 }
}

async function sendTestEmailToSubscriber(email: string, firstName: string, content: NewsletterContent): Promise<void> {
 const result = await sendTestNewsletter(email, firstName, content)
 if ("error" in result) {
 throw new Error(result.error)
 }
}

function InferenceResultRow({ result }: { result: InferenceResult }) {
 return (
 <div className="p-3 border-b last:border-b-0">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="font-medium">{result.email}</div>
 {result.status ==="updated" && (
 <div className="text-sm text-muted-foreground">
 {result.oldName} → {result.newName}
 </div>
 )}
 {result.status ==="skipped" && (
 <div className="text-sm text-muted-foreground">
 Inferred: {result.inferredName} (Confidence: {result.confidence})
 </div>
 )}
 {result.status ==="error" && (
 <div className="text-sm text-semantic-error">
 Error: {result.error}
 </div>
 )}
 </div>
 <Badge
 variant={
 result.status ==="updated"
 ?"default"
 : result.status ==="skipped"
 ?"secondary"
 :"error"
 }
 >
 {result.status}
 </Badge>
 </div>
 </div>
 )
}

function InferenceResultsDialog({
 results,
 open,
 onOpenChange,
}: {
 results: InferenceResults
 open: boolean
 onOpenChange: (open: boolean) => void
}) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogTrigger asChild>
 <Button 
 variant="outline"
 size="sm"
 className="flex items-center gap-2"
 >
 <Eye className="h-4 w-4" />
 View Results
 </Button>
 </DialogTrigger>
 <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Name Inference Results</DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
 <div className="text-center">
 <div className="text-2xl font-bold text-semantic-info">{results.summary.totalProcessed}</div>
 <div className="text-sm text-muted-foreground">Processed</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-foreground">{results.summary.totalUpdated}</div>
 <div className="text-sm text-muted-foreground">Updated</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-semantic-warning">{results.summary.totalSkipped}</div>
 <div className="text-sm text-muted-foreground">Skipped</div>
 </div>
 <div className="text-center">
 <div className="text-2xl font-bold text-semantic-error">{results.summary.totalErrors}</div>
 <div className="text-sm text-muted-foreground">Errors</div>
 </div>
 </div>

 <div className="space-y-2">
 <h3 className="font-semibold">Detailed Results</h3>
 <div className="max-h-96 overflow-y-auto border rounded-lg">
 {results.results.map((result) => (
 <InferenceResultRow key={result.email} result={result} />
 ))}
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 )
}

interface SubscriberTableHeaderActionsProps {
 inferringNames: boolean
 selectedCount: number
 showOnlyTraders: boolean
 needsInference: number
 lastInferenceResults: InferenceResults | null
 showResults: boolean
 uploading: boolean
 fileInputRef: React.RefObject<HTMLInputElement | null>
 onShowResultsChange: (open: boolean) => void
 onInferNames: () => void
 onToggleFilter: () => void
 onCSVUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function SubscriberTableHeaderActions({
 inferringNames,
 selectedCount,
 showOnlyTraders,
 needsInference,
 lastInferenceResults,
 showResults,
 uploading,
 fileInputRef,
 onShowResultsChange,
 onInferNames,
 onToggleFilter,
 onCSVUpload,
}: SubscriberTableHeaderActionsProps) {
 const t = useI18n()

 return (
 <div className="flex items-center gap-4">
 <Button 
 variant="secondary"
 size="sm"
 disabled={inferringNames || selectedCount === 0}
 onClick={onInferNames}
 className="flex items-center gap-2"
 >
 {inferringNames ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 {t('newsletter.admin.inferring')}
 </>
 ) : (
 <>
 <Brain className="h-4 w-4" />
 {t('newsletter.admin.inferNames')} ({selectedCount})
 </>
 )}
 </Button>
 <Button 
 variant={showOnlyTraders ?"default" :"outline"}
 size="sm"
 onClick={onToggleFilter}
 className="flex items-center gap-2"
 >
 <Filter className="h-4 w-4" />
 {showOnlyTraders ? t('newsletter.admin.filter.showAll') : t('newsletter.admin.filter.showTradersOnly')}
 </Button>
 {needsInference > 0 && (
 <Button 
 variant="secondary"
 disabled={inferringNames}
 onClick={onInferNames}
 className="flex items-center gap-2"
 >
 {inferringNames ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 {t('newsletter.admin.inferring')}
 </>
 ) : (
 <>
 <Brain className="h-4 w-4" />
 {t('newsletter.admin.inferNames')} ({needsInference})
 </>
 )}
 </Button>
 )}
 {lastInferenceResults && (
 <InferenceResultsDialog
 results={lastInferenceResults}
 open={showResults}
 onOpenChange={onShowResultsChange}
 />
 )}
 <input
 ref={fileInputRef}
 type="file"
 accept=".csv"
 className="hidden"
 onChange={onCSVUpload}
 disabled={uploading}
 />
 <Button 
 variant="outline"
 disabled={uploading}
 onClick={() => fileInputRef.current?.click()}
 >
 {uploading ?"Importing..." :"Import CSV"}
 </Button>
 </div>
 )
}

interface SubscriberRowProps {
 subscriber: Subscriber
 isSelected: boolean
 sendingTest: string | null
 content: NewsletterContent
 onToggleSelectOne: (email: string, checked: boolean) => void
 onSendTest: (email: string, firstName: string) => void
 onDelete: (email: string) => void
}

function SubscriberRow({
 subscriber,
 isSelected,
 sendingTest,
 content,
 onToggleSelectOne,
 onSendTest,
 onDelete,
}: SubscriberRowProps) {
 const t = useI18n()

 return (
 <TableRow key={subscriber.email}>
 <TableCell className="w-8">
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => onToggleSelectOne(subscriber.email, Boolean(checked))}
 aria-label={`Select ${subscriber.email}`}
 />
 </TableCell>
 <TableCell className="font-medium">{subscriber.email}</TableCell>
 <TableCell>
 {subscriber.firstName && subscriber.firstName !== 'trader' ? (
 <span className="text-sm">
 {subscriber.firstName} {subscriber.lastName || ''}
 </span>
 ) : (
 <span className="text-sm text-muted-foreground italic">{t('newsletter.admin.noName')}</span>
 )}
 </TableCell>
 <TableCell>
 <span className={`px-2 py-1 rounded-full text-xs ${
 subscriber.isActive ?"bg-accent/70 text-foreground" :"bg-semantic-error-bg text-semantic-error"
 }`}>
 {subscriber.isActive ?"Active" :"Inactive"}
 </span>
 </TableCell>
 <TableCell className="text-right gap-x-2">
 <Button 
 variant="outline"
 size="sm"
 onClick={() => onSendTest(subscriber.email, subscriber.firstName)}
 disabled={sendingTest === subscriber.email}
 title={!content.subject ?"Fill in newsletter content first" :"Send test email"}
 >
 {sendingTest === subscriber.email ? (
 <>
 <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-current" />
 Sending...
 </>
 ) : ("Send Test"
 )}
 </Button>
 <Button 
 variant="destructive"
 size="sm"
 onClick={() => onDelete(subscriber.email)}
 >
 Delete
 </Button>
 </TableCell>
 </TableRow>
 )
}

interface SubscriberTableBodyProps {
 loading: boolean
 filteredSubscribers: Subscriber[]
 showOnlyTraders: boolean
 allVisibleSelected: boolean
 selectedEmails: Set<string>
 sendingTest: string | null
 content: NewsletterContent
 onToggleSelectAllVisible: (checked: boolean) => void
 onToggleSelectOne: (email: string, checked: boolean) => void
 onSendTest: (email: string, firstName: string) => void
 onDelete: (email: string) => void
}

function SubscriberTableBody({
 loading,
 filteredSubscribers,
 showOnlyTraders,
 allVisibleSelected,
 selectedEmails,
 sendingTest,
 content,
 onToggleSelectAllVisible,
 onToggleSelectOne,
 onSendTest,
 onDelete,
}: SubscriberTableBodyProps) {
 const t = useI18n()

 if (loading) {
 return (
 <div className="flex items-center justify-center py-6">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
 </div>
 )
 }

 if (filteredSubscribers.length === 0) {
 return (
 <div className="text-center py-6 text-muted-foreground">
 {showOnlyTraders
 ? t('newsletter.admin.filter.noTradersFound')
 :"No subscribers found. Import some using CSV or add them manually."
 }
 </div>
 )
 }

 return (
 <div className="rounded-md border">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-8">
 <Checkbox
 checked={allVisibleSelected}
 onCheckedChange={(checked) => onToggleSelectAllVisible(Boolean(checked))}
 aria-label="Select all"
 />
 </TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Name</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredSubscribers.map((subscriber) => (
 <SubscriberRow
 key={subscriber.email}
 subscriber={subscriber}
 isSelected={selectedEmails.has(subscriber.email)}
 sendingTest={sendingTest}
 content={content}
 onToggleSelectOne={onToggleSelectOne}
 onSendTest={onSendTest}
 onDelete={onDelete}
 />
 ))}
 </TableBody>
 </Table>
 </div>
 )
}

export function SubscriberTable() {
 const [subscribers, setSubscribers] = useState<Subscriber[]>([])
 const [loading, setLoading] = useState(true)
 const [uploading, setUploading] = useState(false)
 const [sendingTest, setSendingTest] = useState<string | null>(null)
 const [inferringNames, setInferringNames] = useState(false)
 const [needsInference, setNeedsInference] = useState(0)
 const [showOnlyTraders, setShowOnlyTraders] = useState(false)
 const [lastInferenceResults, setLastInferenceResults] = useState<InferenceResults | null>(null)
 const [showResults, setShowResults] = useState(false)
 const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
 const { content } = useNewsletter()
 const t = useI18n()
 const fileInputRef = useRef<HTMLInputElement>(null)

 const fetchSubscribers = async () => {
 setLoading(true)
 try {
 setSubscribers(await loadSubscribersData())
 } catch (error) {
 toast.error("Failed to load subscribers")
 console.error(error)
 } finally {
 setLoading(false)
 }
 }

 // Check how many subscribers need name inference
 const checkInferenceNeeded = async () => {
 try {
 setNeedsInference(await loadNeedsInferenceCount())
 } catch (error) {
 console.error('Failed to check inference needed:', error)
 }
 }

 // Fetch subscribers on mount and after revalidation
 useEffect(() => {
 fetchSubscribers()
 checkInferenceNeeded()
 }, [])

 const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0]
 if (!file) return

 setUploading(true)

 try {
 const count = await importSubscriberCsv(file)
 toast.success(`Successfully imported ${count} subscribers`)
 await fetchSubscribers() // Refresh the list
 } catch (error) {
 toast.error("Failed to import subscribers")
 console.error(error)
 } finally {
 setUploading(false)
 // Reset the file input
 event.target.value =""
 }
 }

 const handleDelete = async (email: string) => {
 try {
 await deleteSubscriberByEmail(email)
 toast.success("Subscriber deleted successfully")
 await fetchSubscribers() // Refresh the list
 } catch (error) {
 toast.error("Failed to delete subscriber")
 console.error(error)
 }
 }

 const handleSendTest = async (email: string, firstName: string) => {
 if (!isNewsletterReadyForTest(content)) {
 toast.error("Please fill in all newsletter fields before sending a test")
 return
 }

 setSendingTest(email)
 try {
 await sendTestEmailToSubscriber(email, firstName, content)
 toast.success("Test email sent successfully")
 } catch (error) {
 toast.error("Failed to send test email")
 console.error(error)
 } finally {
 setSendingTest(null)
 }
 }

 const handleInferNames = async () => {
 setInferringNames(true)
 try {
 const results = await requestNameInference(Array.from(selectedEmails))
 setLastInferenceResults(results)
 toast.success(t('newsletter.admin.nameInference.success', {
 processed: results.summary.totalProcessed,
 updated: results.summary.totalUpdated,
 }))
 await fetchSubscribers()
 await checkInferenceNeeded()
 } catch (error) {
 toast.error(t('newsletter.admin.nameInference.error'))
 console.error(error)
 } finally {
 setInferringNames(false)
 }
 }

 const filteredSubscribers = filterSubscribers(subscribers, showOnlyTraders)
 const allVisibleSelected = filteredSubscribers.length > 0 && filteredSubscribers.every((subscriber) => selectedEmails.has(subscriber.email))
 const toggleSelectAllVisible = (checked: boolean) => {
 setSelectedEmails((prev) => updateSelectedEmails(prev, filteredSubscribers.map((subscriber) => subscriber.email), checked))
 }

 const toggleSelectOne = (email: string, checked: boolean) => {
 setSelectedEmails((prev) => updateSelectedEmail(prev, email, checked))
 }

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex justify-between items-center">
 <div className="flex items-center gap-2">
 <span>Subscribers</span>
 <span className="text-sm text-muted-foreground">
 ({filteredSubscribers.length}{showOnlyTraders ? ` of ${subscribers.length}` : ''})
 </span>
 </div>
 <SubscriberTableHeaderActions
 inferringNames={inferringNames}
 selectedCount={selectedEmails.size}
 showOnlyTraders={showOnlyTraders}
 needsInference={needsInference}
 lastInferenceResults={lastInferenceResults}
 showResults={showResults}
 uploading={uploading}
 fileInputRef={fileInputRef}
 onShowResultsChange={setShowResults}
 onInferNames={handleInferNames}
 onToggleFilter={() => setShowOnlyTraders(!showOnlyTraders)}
 onCSVUpload={handleCSVUpload}
 />
 </CardTitle>
 </CardHeader>
 <CardContent>
 <SubscriberTableBody
 loading={loading}
 filteredSubscribers={filteredSubscribers}
 showOnlyTraders={showOnlyTraders}
 allVisibleSelected={allVisibleSelected}
 selectedEmails={selectedEmails}
 sendingTest={sendingTest}
 content={content}
 onToggleSelectAllVisible={toggleSelectAllVisible}
 onToggleSelectOne={toggleSelectOne}
 onSendTest={handleSendTest}
 onDelete={handleDelete}
 />
 </CardContent>
 </Card>
 )
}

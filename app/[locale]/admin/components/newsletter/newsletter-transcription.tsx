// components/newsletter-transcription.tsx"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Loader2, Mic, FileText, Download, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod/v3'

// Add schema for transcription validation
const transcriptionSchema = z.object({
 transcription: z.string(),
 language: z.string().optional(),
})

interface AudioSegment {
 buffer: ArrayBuffer
 fileName: string
 startTime: number
 endTime: number
 index: number
}

interface TranscriptionResult {
 text: string
 language: string
 duration: number
 segmentIndex: number
}

interface TranscriptionComponentProps {
 segments: AudioSegment[]
 onTranscriptionComplete?: (results: TranscriptionResult[]) => void
}

function createErrorResult(segment: AudioSegment): TranscriptionResult {
 return {
 text: 'Transcription error',
 language: 'en',
 duration: 0,
 segmentIndex: segment.index
 }
}

async function transcribeSegment(segment: AudioSegment): Promise<TranscriptionResult> {
 const audioBlob = new Blob([segment.buffer], { type: 'audio/wav' })
 const formData = new FormData()
 formData.append('audio', audioBlob, `segment_${segment.index}.wav`)

 const response = await fetch('/api/ai/transcribe', {
 method: 'POST',
 body: formData
 })

 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}))
 const errorMessage = errorData?.error?.message || `API error: ${response.status}`
 throw new Error(errorMessage)
 }

 const data = await response.json()
 const validatedData = transcriptionSchema.parse(data)
 const duration = segment.buffer.byteLength / (16000 * 2)

 return {
 text: validatedData.transcription || 'No transcription available',
 language: validatedData.language || 'en',
 duration,
 segmentIndex: segment.index
 }
}

async function transcribeAllSegments(
 segments: AudioSegment[],
 onProgress: (segmentIndex: number, progressPercent: number) => void
): Promise<TranscriptionResult[]> {
 const results: TranscriptionResult[] = []

 for (let index = 0; index < segments.length; index++) {
 const segment = segments[index]
 onProgress(segment.index, ((index + 1) / segments.length) * 100)

 try {
 results.push(await transcribeSegment(segment))
 } catch {

 results.push(createErrorResult(segment))
 }
 }

 return results
}

function buildTranscriptionText(results: TranscriptionResult[]) {
 return results
 .slice()
 .sort((a, b) => a.segmentIndex - b.segmentIndex)
 .map(result => `Segment ${result.segmentIndex} (${result.duration.toFixed(1)}s): ${result.text}`)
 .join('\n\n')
}

function downloadTextFile(filename: string, text: string) {
 const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = filename
 document.body.appendChild(a)
 a.click()
 document.body.removeChild(a)
 URL.revokeObjectURL(url)
}

export function TranscriptionComponent({ segments, onTranscriptionComplete }: TranscriptionComponentProps) {
 const [isTranscribing, setIsTranscribing] = useState(false)
 const [transcriptionResults, setTranscriptionResults] = useState<TranscriptionResult[]>([])
 const [progress, setProgress] = useState(0)
 const [currentSegment, setCurrentSegment] = useState<number | null>(null)
 const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

 const handleTranscribeAllSegments = async () => {
 if (segments.length === 0) return

 try {
 setIsTranscribing(true)
 setProgress(0)
 setTranscriptionResults([])
 const results = await transcribeAllSegments(segments, (segmentIndex, progressPercent) => {
 setCurrentSegment(segmentIndex)
 setProgress(progressPercent)
 })

 setTranscriptionResults(results)

 if (onTranscriptionComplete) {
 onTranscriptionComplete(results)
 }

 toast.success(`Transcription completed: ${results.length} segments processed`)
 } catch {

 toast.error('Transcription failed')
 } finally {
 setIsTranscribing(false)
 setCurrentSegment(null)
 }
 }

 const copyToClipboard = async (text: string, index: number) => {
 try {
 await navigator.clipboard.writeText(text)
 setCopiedIndex(index)
 toast.success('Text copied to clipboard')

 // Reset copied state after 2 seconds
 setTimeout(() => setCopiedIndex(null), 2000)
 } catch {

 toast.error('Copy failed')
 }
 }

 const downloadTranscription = () => {
 if (transcriptionResults.length === 0) return
 downloadTextFile('transcription_complete.txt', buildTranscriptionText(transcriptionResults))
 }

 const getTotalDuration = () => {
 return transcriptionResults.reduce((total, result) => total + result.duration, 0)
 }

 if (segments.length === 0) {
 return (
 <Card className="bg-muted/50 dark:bg-background/0.3 border-border/0.42">
 <CardContent className="p-6 text-center">
 <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
 <p className="text-muted-foreground">
 No audio segments available for transcription
 </p>
 </CardContent>
 </Card>
 )
 }

 return (
 <Card className="bg-background/0.3 border-border/0.42">
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-foreground">
 <Mic className="w-5 h-5" />
 Audio Transcription
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* Service Status */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Badge variant="default">
 Ready
 </Badge>
 <span className="text-sm text-muted-foreground">
 {segments.length} segments available
 </span>
 </div>

 <Button
 onClick={handleTranscribeAllSegments}
 disabled={isTranscribing}
 className="bg-semantic-info-bg hover:bg-semantic-info-bg dark:bg-semantic-info-bg dark:hover:bg-semantic-info-bg text-foreground"
 >
 {isTranscribing ? (
 <>
 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
 Transcribing...
 </>
 ) : (
 <>
 <Mic className="w-4 h-4 mr-2" />
 Transcribe all segments
 </>
 )}
 </Button>
 </div>

 {/* Progress */}
 {isTranscribing && (
 <div className="space-y-2">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">
 {currentSegment ? `Segment ${currentSegment}/${segments.length}` : 'Preparing...'}
 </span>
 <span className="text-muted-foreground">
 {Math.round(progress)}%
 </span>
 </div>
 <Progress value={progress} className="w-full" />
 </div>
 )}

 {/* Transcription Results */}
 {transcriptionResults.length > 0 && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-foreground">
 Résultats de transcription
 </h3>
 <div className="flex items-center gap-2">
 <Badge variant="outline">
 {getTotalDuration().toFixed(1)}s total
 </Badge>
 <Button
 onClick={downloadTranscription}
 variant="outline"
 size="sm"
 className="text-foreground border-border/0.56 hover:bg-accent/70"
 >
 <Download className="w-4 h-4 mr-2" />
 Download
 </Button>
 </div>
 </div>

 <div className="space-y-3 max-h-96 overflow-y-auto">
 {transcriptionResults
 .sort((a, b) => a.segmentIndex - b.segmentIndex)
 .map((result) => (
 <div
 key={result.segmentIndex}
 className="p-3 bg-muted/50 rounded-lg border border-border/0.42"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Badge variant="secondary" className="text-xs">
 Segment {result.segmentIndex}
 </Badge>
 <span className="text-xs text-muted-foreground dark:text-muted-foreground">
 {result.duration.toFixed(1)}s
 </span>
 </div>
 <p className="text-foreground text-sm leading-relaxed">
 {result.text ||"Aucune transcription disponible"}
 </p>
 </div>
 <Button
 onClick={() => copyToClipboard(result.text, result.segmentIndex)}
 variant="ghost"
 size="sm"
 className="text-muted-foreground hover:text-foreground dark:text-muted-foreground hover:text-foreground"
 >
 {copiedIndex === result.segmentIndex ? (
 <Check className="w-4 h-4" />
 ) : (
 <Copy className="w-4 h-4" />
 )}
 </Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 </CardContent>
 </Card>
 )
}

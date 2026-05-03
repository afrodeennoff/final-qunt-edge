'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { ImportType } from './import-type-selection'
import { Progress } from "@/components/ui/progress"
import { XIcon, FileIcon, AlertCircle, ArrowUpCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'
import { useI18n } from '@/locales/client'
import { platforms } from './config/platforms'
import { Step } from './import-button'

interface FileUploadProps {
  importType: ImportType
  setRawCsvData: React.Dispatch<React.SetStateAction<string[][]>>
  setCsvData: React.Dispatch<React.SetStateAction<string[][]>>
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>
  setStep: React.Dispatch<React.SetStateAction<Step>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
  error?: string | null
}

export default function FileUpload({
  importType,
  setRawCsvData,
  setCsvData,
  setHeaders,
  setStep,
  setError,
  error,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [parsedFiles, setParsedFiles] = useState<string[][][]>([])
  const t = useI18n()
  // Track next available index via ref to avoid stale closure bugs in onDrop
  const nextFileIndexRef = useRef(0)
  // Guard against duplicate concatenateFiles calls
  const hasConcatenatedRef = useRef(false)
  // Keep a ref to parsedFiles so doConcatenateAndAdvance always reads the latest value
  const parsedFilesRef = useRef<string[][][]>([])
  // Keep a ref to uploadedFiles for consistent length checks in the effect
  const uploadedFilesRef = useRef<File[]>([])
  // Keep a ref to uploadProgress for consistent progress checks in the effect
  const uploadProgressRef = useRef<{ [key: string]: number }>({})

  // Sync refs with state so that doConcatenateAndAdvance always reads fresh values
  useEffect(() => { parsedFilesRef.current = parsedFiles }, [parsedFiles])
  useEffect(() => { uploadedFilesRef.current = uploadedFiles }, [uploadedFiles])
  useEffect(() => { uploadProgressRef.current = uploadProgress }, [uploadProgress])

  const processFile = useCallback((file: File, index: number) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const firstLine = e.target?.result?.toString().split('\n')[0] || ''
        const delimiter = firstLine.includes(';') ? ';' : ','

        Papa.parse(file, {
          delimiter,
          complete: (result) => {
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
              setParsedFiles(prevFiles => {
                const newFiles = [...prevFiles]
                newFiles[index] = result.data as string[][]
                return newFiles
              })
              setError(null)
              resolve()
            } else {
              reject(new Error("The CSV file appears to be empty or invalid."))
            }
          },
          error: (parseError) => {
            reject(new Error(`Error parsing CSV: ${parseError.message}`))
          }
        })
      }
      reader.onerror = () => {
        reject(new Error("Error reading file"))
      }
      reader.readAsText(file)
    })
  }, [setError])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Use ref-based index to avoid stale closure on uploadedFiles.length
    const startIndex = nextFileIndexRef.current

    setUploadedFiles(prevFiles => {
      const newFiles = [...prevFiles, ...acceptedFiles]
      // Update ref for future drops
      nextFileIndexRef.current = newFiles.length
      return newFiles
    })

    acceptedFiles.forEach((file, index) => {
      const totalIndex = startIndex + index
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      processFile(file, totalIndex)
        .then(() => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        })
        .catch(parseError => {
          setError(parseError.message)
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        })
    })
  }, [processFile, setError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => {
      const removed = prevFiles[index]
      if (removed) {
        // Clear the progress entry for the removed file
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[removed.name]
          return newProgress
        })
      }
      return prevFiles.filter((_, i) => i !== index)
    })
    setParsedFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    // Reset concatenation guard so a re-upload after removal can advance
    hasConcatenatedRef.current = false
    // The index tracker will be corrected on the next onDrop via uploadedFiles.length,
    // but we also update it here in case the user uploads again immediately.
    // Subtract 1 for the file just removed, but don't go below 0.
    nextFileIndexRef.current = Math.max(0, nextFileIndexRef.current - 1)
  }

  const doConcatenateAndAdvance = useCallback(() => {
    if (hasConcatenatedRef.current) return

    // Read from refs to avoid stale closure values
    const currentParsedFiles = parsedFilesRef.current
    if (currentParsedFiles.length === 0) return

    try {
      const platform = platforms.find(p => p.type === importType)
      if (!platform) {
        throw new Error(`Invalid import type: ${importType}`)
      }

      if (!platform.processFile) {
        throw new Error(`Platform "${platform.platformName}" does not support file processing.`)
      }

      let concatenatedData: string[][] = []
      let headers: string[] = []

      currentParsedFiles.forEach((file, index) => {
        if (!file || file.length === 0) return
        const { headers: fileHeaders, processedData } = platform.processFile!(file)
        if (index === 0) {
          headers = fileHeaders
          concatenatedData = processedData
        } else {
          concatenatedData = [...concatenatedData, ...processedData]
        }
      })

      hasConcatenatedRef.current = true

      setRawCsvData([headers, ...concatenatedData])
      setCsvData(concatenatedData)
      setHeaders(headers)

      const currentStepIndex = platform.steps.findIndex(step => step.id === 'upload-file')
      if (currentStepIndex !== -1 && currentStepIndex < platform.steps.length - 1) {
        setStep(platform.steps[currentStepIndex + 1].id)
      }

      setError(null)
    } catch (concatError) {
      setError((concatError as Error).message)
    }
  }, [importType, setRawCsvData, setCsvData, setHeaders, setStep, setError])

  // Reset concatenation guard when files change or component re-mounts for a fresh upload
  useEffect(() => {
    hasConcatenatedRef.current = false
    nextFileIndexRef.current = 0
  }, [importType])

  // Primary effect: when all files are parsed and show 100% progress, concatenate and advance.
  // Uses refs to read state so the callback reference (doConcatenateAndAdvance) stays stable,
  // preventing infinite re-trigger loops from the dependency array.
  useEffect(() => {
    const totalFiles = uploadedFilesRef.current.length
    if (totalFiles === 0 || parsedFilesRef.current.length === 0) return

    const progressEntries = Object.values(uploadProgressRef.current)
    const allProgressComplete = progressEntries.length === totalFiles &&
      progressEntries.every(progress => progress === 100)

    // Check that we have parse results for every uploaded file
    const parsedCount = parsedFilesRef.current.filter(f => f && f.length > 0).length

    if (allProgressComplete && parsedCount >= totalFiles) {
      doConcatenateAndAdvance()
    }
  }, [parsedFiles, uploadProgress, doConcatenateAndAdvance, uploadedFiles])

  return (
    <div className="space-y-4 w-full h-full p-8 flex flex-col items-center justify-center">
      {error ? (
        <Alert variant="destructive" className="w-full max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div
        {...getRootProps()}
        className={cn(
          "h-80 w-full max-w-2xl border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ease-in-out",
          "hover:border-primary/50 group relative",
          isDragActive
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
          "cursor-pointer flex items-center justify-center"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <ArrowUpCircle
            className={cn(
              "h-14 w-14 transition-all duration-300 ease-bounce",
              isDragActive
                ? "text-primary scale-110 -translate-y-2"
                : "text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:-translate-y-2"
            )}
          />
          {isDragActive ? (
            <div className="space-y-2 relative">
              <p className="text-xl font-medium text-primary animate-in fade-in slide-in-from-bottom-2">
                {t('import.upload.dropHere')}
              </p>
              <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3">
                {t('import.upload.weWillHandle')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 relative">
              <p className="text-xl font-medium group-hover:text-primary transition-colors">
                {t('import.upload.dragAndDrop')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('import.upload.clickToBrowse')}
              </p>
            </div>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl">
          <h3 className="text-lg font-semibold">{t('import.upload.uploadedFiles')}</h3>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between",
                "bg-gray-100 dark:bg-gray-800 rounded-lg",
                "p-3 hover:bg-gray-200 dark:hover:bg-gray-700",
                "transition-all duration-200 ease-in-out",
                "animate-in slide-in-from-bottom fade-in",
                "group"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                  <FileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('import.upload.fileSize', { size: (file.size / 1024).toFixed(1) })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Progress
                  value={uploadProgress[file.name] || 0}
                  className="w-24 h-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">{t('import.upload.removeFile')}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <Alert className="animate-in slide-in-from-bottom-5 duration-700 w-full max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('import.upload.note')}</AlertTitle>
          <AlertDescription>
            {t('import.upload.noteDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

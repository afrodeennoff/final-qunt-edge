'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface HeaderSelectionProps {
 rawCsvData: string[][]
 setCsvData: React.Dispatch<React.SetStateAction<string[][]>>
 setHeaders: React.Dispatch<React.SetStateAction<string[]>>
 setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function HeaderSelection({ rawCsvData, setCsvData, setHeaders, setError }: HeaderSelectionProps) {
 const [selectedHeaderIndex, setSelectedHeaderIndex] = useState<number>(0)

 const processHeaderSelection = useCallback((index: number, data: string[][]) => {
 // Preserve all columns including empty headers to maintain index alignment with data rows.
 // Replace empty headers with positional labels so column mapping works correctly.
 const newHeaders = data[index].map((header, i) =>
   header && header.trim() !== '' ? header : `Column ${i + 1}`
 )
 setHeaders(newHeaders)
 setCsvData(data.slice(index + 1))
 setError(null)
 }, [setCsvData, setHeaders, setError])

 useEffect(() => {
 if (rawCsvData.length > 0) {
 processHeaderSelection(selectedHeaderIndex, rawCsvData)
 }
 }, [rawCsvData, selectedHeaderIndex, processHeaderSelection])

 const handleHeaderSelection = (value: string) => {
 const index = parseInt(value, 10)
 setSelectedHeaderIndex(index)
 }

 return (
 <div className="h-full flex flex-col gap-4">
 <div className="flex-1 min-h-0 overflow-auto">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-[50px]">Select</TableHead>
 {rawCsvData[0]?.slice(0, 6).map((_, index) => (
 <TableHead key={index}>Column {index + 1}</TableHead>
 ))}
 </TableRow>
 </TableHeader>
 <TableBody>
 {rawCsvData.map((row: string[], rowIndex: number) => (
 <TableRow key={rowIndex}>
 <TableCell className="w-[50px]">
 <RadioGroup value={selectedHeaderIndex.toString()} onValueChange={handleHeaderSelection}>
 <div className="flex items-center gap-2">
 <RadioGroupItem value={rowIndex.toString()} id={`row-${rowIndex}`} />
 </div>
 </RadioGroup>
 </TableCell>
 {row.slice(0, 6).map((cell: string, cellIndex: number) => (
 <TableCell key={cellIndex}>{cell}</TableCell>
 ))}
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 )
}
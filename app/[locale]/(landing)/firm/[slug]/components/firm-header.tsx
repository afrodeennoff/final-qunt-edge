"use client"
import React from 'react'
export function FirmHeader({ firm }: { firm: any }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
        <span aria-label="logo" className="block w-6 h-6 bg-gray-400 rounded-full" />
      </div>
      <div>
        <div className="text-xl font-bold">{firm?.name}</div>
        <div className="text-sm text-muted-foreground">{firm?.category}</div>
      </div>
    </div>
  )
}

'use client'
import React, { useState } from 'react'

export default function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true)
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm text-foreground">Profile: {isPublic ? 'Public' : 'Private'}</span>
      <button
        className="rounded-md border border-border bg-card px-3 py-1 text-sm text-foreground hover:bg-input"
        onClick={() => setIsPublic((s) => !s)}
      >
        {isPublic ? 'Set Private' : 'Set Public'}
      </button>
    </div>
  )
}

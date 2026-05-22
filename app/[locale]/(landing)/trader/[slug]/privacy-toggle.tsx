'use client'
import React, { useState } from 'react'

export default function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true)
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[13px] text-foreground">Profile: {isPublic ? 'Public' : 'Private'}</span>
      <button
        className="rounded-full border border-[hsl(var(--border)/0.36)] bg-transparent px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-[oklch(0.65_0.22_260/0.06)]"
        onClick={() => setIsPublic((s) => !s)}
      >
        {isPublic ? 'Set Private' : 'Set Public'}
      </button>
    </div>
  )
}

'use client'
import React, { useState } from 'react'

export default function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true)
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm rs-text-strong">Profile: {isPublic ? 'Public' : 'Private'}</span>
      <button
        className="rs-frost-hover rounded-full border rs-frost-border bg-transparent px-4 py-1.5 text-[13px] font-medium rs-text-strong transition-colors"
        onClick={() => setIsPublic((s) => !s)}
      >
        {isPublic ? 'Set Private' : 'Set Public'}
      </button>
    </div>
  )
}

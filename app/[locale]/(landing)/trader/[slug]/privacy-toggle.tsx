'use client'
import React, { useState } from 'react'

export default function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true)
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-[13px] text-[#f0f0f0]">Profile: {isPublic ? 'Public' : 'Private'}</span>
      <button
        className="rounded-full border border-[rgba(214,235,253,0.19)] bg-transparent px-4 py-[5px] text-[13px] font-medium text-[#f0f0f0] transition-colors hover:bg-[rgba(255,255,255,0.08)]"
        onClick={() => setIsPublic((s) => !s)}
      >
        {isPublic ? 'Set Private' : 'Set Public'}
      </button>
    </div>
  )
}

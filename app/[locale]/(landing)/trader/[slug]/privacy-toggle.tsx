'use client'
import React, { useState } from 'react'

export default function PrivacyToggle() {
  const [isPublic, setIsPublic] = useState(true)
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm">Profile: {isPublic ? 'Public' : 'Private'}</span>
      <button
        className="px-3 py-1 rounded-md bg-gray-100 border border-gray-200 text-sm"
        onClick={() => setIsPublic((s) => !s)}
      >
        {isPublic ? 'Set Private' : 'Set Public'}
      </button>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage } from '@/lib/journal-attachments'
import { createClient } from '@/lib/supabase'
import { IMMUTABLE_CACHE_CONTROL } from '@/lib/supabase-storage'
import { useUserStore } from '@/store/user-store'
import { toast } from 'sonner'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const BUCKET = 'trade-images'

async function computeHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function getExt(file: File): string {
  const mime = file.type.split('/')[1] || ''
  const name = file.name.includes('.') ? (file.name.split('.').pop() || '') : ''
  return (mime || name || 'bin').toLowerCase()
}

interface ScreenshotGridProps {
  screenshots: string[]
  onChange: (screenshots: string[]) => void
  userId?: string | null
}

export function ScreenshotGrid({ screenshots, onChange, userId: userIdProp }: ScreenshotGridProps) {
  const storeUser = useUserStore(s => s.supabaseUser?.id ?? s.user?.id ?? null)
  const userId = userIdProp ?? storeUser
  const [uploading, setUploading] = useState(false)

  const handleAdd = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.multiple = true

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files || !userId) return

      const validFiles = Array.from(files).filter(f => {
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`${f.name} is too large (max 10MB)`)
          return false
        }
        if (!ACCEPTED_TYPES.includes(f.type)) {
          toast.error(`${f.name}: unsupported format`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return
      setUploading(true)

      const supabase = createClient()
      const newUrls: string[] = []

      for (const file of validFiles) {
        try {
          const compressed = await compressImage(file)
          const hashHex = await computeHash(compressed)
          const ext = getExt(compressed)
          const filePath = `${userId}/journal-screenshots/${hashHex}.${ext}`

          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, compressed, {
              cacheControl: IMMUTABLE_CACHE_CONTROL,
              upsert: true,
            })

          if (error && !error.message?.includes('already exists')) {
            toast.error(`Failed to upload ${file.name}`)
            continue
          }

          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
          if (pub?.publicUrl) newUrls.push(pub.publicUrl)
        } catch {
          toast.error(`Failed to process ${file.name}`)
        }
      }

      if (newUrls.length > 0) {
        onChange([...screenshots, ...newUrls])
      }
      setUploading(false)
    }

    input.click()
  }, [screenshots, onChange, userId])

  const remove = (index: number) => {
    onChange(screenshots.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {screenshots.map((src, i) => (
        <div key={i} className="group relative h-16 w-24 overflow-hidden rounded-md border-0">
          <img
            src={src}
            alt={`Screenshot ${i + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        disabled={uploading}
        className={cn(
          'flex h-16 w-24 items-center justify-center rounded-md border-0 bg-muted/30',
          'text-muted-foreground/50 hover:bg-primary/10 hover:text-primary/60',
          uploading && 'opacity-50 cursor-wait',
        )}
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
      </button>
    </div>
  )
}

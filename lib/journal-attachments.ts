import { createClient } from '@/lib/supabase'

/**
 * Compress image on client before upload (max 1200px, JPEG 80%).
 * Returns a compressed File. Optimized for multi-screenshot daily journal use.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context not available'))

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'))
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Minimal file hash for deduped short filenames (same style as trade images).
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

function getFileExtension(file: File): string {
  const mimeExt = file.type.split('/')[1] || ''
  const nameExt = file.name.includes('.') ? file.name.split('.').pop() || '' : ''
  return (mimeExt || nameExt || 'bin').toLowerCase()
}

/**
 * Upload a journal screenshot (optimized + hashed filename) to the shared trade-images bucket.
 * Path: {userId}/journal-screenshots/{hash}.{ext}
 * Returns the storage path (not public URL) so it can be stored in Mood.screenshots[].
 */
export async function uploadJournalScreenshot(file: File, userId: string): Promise<string | null> {
  try {
    const compressed = await compressImage(file)
    const supabase = createClient()

    const hashHex = await computeFileHash(compressed)
    const ext = getFileExtension(compressed)
    const fileName = `${hashHex}.${ext}`
    const filePath = `${userId}/journal-screenshots/${fileName}`

    const { error } = await supabase.storage
      .from('trade-images')
      .upload(filePath, compressed, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error && !error.message?.includes('already exists')) {
      console.error('Journal screenshot upload error:', error)
      return null
    }

    return filePath
  } catch (err) {
    console.error('uploadJournalScreenshot failed:', err)
    return null
  }
}

/**
 * Upload multiple screenshots for a daily journal entry (Mental State / Goals / Bias etc.).
 * Returns array of successfully uploaded storage paths.
 */
export async function uploadMultipleJournalScreenshots(
  files: File[],
  userId: string
): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map(f => uploadJournalScreenshot(f, userId))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((p): p is string => !!p)
}

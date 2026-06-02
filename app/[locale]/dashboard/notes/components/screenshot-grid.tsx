'use client'

import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenshotGridProps {
  screenshots: string[]
  onChange: (screenshots: string[]) => void
}

export function ScreenshotGrid({ screenshots, onChange }: ScreenshotGridProps) {
  const handleAdd = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        const url = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        newUrls.push(url)
      }
      onChange([...screenshots, ...newUrls])
    }
    input.click()
  }

  const remove = (index: number) => {
    onChange(screenshots.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {screenshots.map((src, i) => (
        <div key={i} className="group relative h-16 w-24 overflow-hidden rounded-md border-0">
          <img src={src} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
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
        className={cn(
          'flex h-16 w-24 items-center justify-center rounded-md border-0 bg-muted/30',
          'text-muted-foreground/50 hover:bg-primary/10 hover:text-primary/60',
        )}
      >
        <ImagePlus size={18} />
      </button>
    </div>
  )
}

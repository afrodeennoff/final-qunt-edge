"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, Eye } from "lucide-react"

interface EmailPreviewProps {
 html: string
 height?: string
}

export function EmailPreview({ html, height }: EmailPreviewProps) {
 const [showSource, setShowSource] = useState(false)
 const computedHeight = height ?? "640px"

 if (showSource) {
  return (
   <div className="flex flex-col gap-2">
    <div className="flex justify-end">
     <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setShowSource(false)}
     >
      <Eye className="h-4 w-4 mr-2" />
      Rendered view
     </Button>
    </div>
    <pre className="w-full overflow-auto rounded-md border bg-card p-4 text-xs leading-relaxed text-foreground" style={{ maxHeight: computedHeight }}>
     <code>{html}</code>
    </pre>
   </div>
  )
 }

 return (
  <div className="flex flex-col gap-2">
   <div className="flex justify-end">
    <Button
     type="button"
     variant="outline"
     size="sm"
     onClick={() => setShowSource(true)}
    >
     <Code className="h-4 w-4 mr-2" />
     HTML source
    </Button>
   </div>
   <div
    className="w-full overflow-auto rounded-md border bg-white p-4"
    style={{ maxHeight: computedHeight, minHeight: computedHeight }}
   >
    <div
     className="[&_table]:!w-full [&_img]:!max-w-full"
     dangerouslySetInnerHTML={{ __html: html }}
    />
   </div>
  </div>
 )
}

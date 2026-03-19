"use client"
import React from 'react'
import { createFirmReview, listFirmReviews } from '@/server/firm-reviews'
import { CardV2, ButtonV2, InputV2 } from '@/components/ui/v2'

export function FirmReviewsSection({ firmId }: { firmId: string }) {
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [reviews, setReviews] = React.useState<Array<any>>([])
  const [loading, setLoading] = React.useState(true)

  async function fetchReviews() {
    try {
      const data = await listFirmReviews(firmId)
      setReviews(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchReviews()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firmId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createFirmReview({ propfirmId: firmId, rating: 5, title, body })
    setTitle('')
    setBody('')
    fetchReviews()
  }

  return (
    <CardV2 className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Reviews</span>
      </div>
      <div className="space-y-2">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <InputV2 placeholder="Review title" value={title} onChange={(e: any)=>setTitle(e.target.value)} />
          <InputV2 placeholder="Review body" value={body} onChange={(e: any)=>setBody(e.target.value)} />
          <ButtonV2>Submit Review</ButtonV2>
        </form>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reviews...</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-2 border rounded p-2 bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gray-300" aria-label="avatar" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.username ?? 'User'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-sm">{r.body}</div>
                  <div className="text-sm">Rating: {r.rating ?? 5}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </CardV2>
  )
}

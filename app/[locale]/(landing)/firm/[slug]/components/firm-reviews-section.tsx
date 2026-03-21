"use client"
import React from 'react'
import { createFirmReview, listFirmReviews } from '@/server/firm-reviews'
import { CardV2, ButtonV2, InputV2, SkeletonV2 } from '@/components/ui/v2'
import { ReviewsIcon } from '@/components/icons/svg-icons'
import { cn } from '@/lib/utils'

type FirmReviewItem = Awaited<ReturnType<typeof listFirmReviews>>[number]

export function FirmReviewsSection({ firmId }: { firmId: string }) {
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [rating, setRating] = React.useState(5)
  const [reviews, setReviews] = React.useState<FirmReviewItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  const fetchReviews = React.useCallback(async () => {
    try {
      const data = await listFirmReviews(firmId)
      setReviews(data ?? [])
    } finally {
      setLoading(false)
    }
  }, [firmId])

  React.useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await createFirmReview({ propfirmId: firmId, rating, title: title.trim(), body: body.trim() || undefined })
      setTitle('')
      setBody('')
      setRating(5)
      await fetchReviews()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CardV2 className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ReviewsIcon size={18} className="text-v2-accent" />
        <span className="text-lg font-semibold text-v2-text-primary">Reviews</span>
        <span className="text-xs text-v2-text-tertiary">({reviews.length})</span>
      </div>

      <form onSubmit={onSubmit} className="mb-6 space-y-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-v2-text-secondary mr-2">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={cn(
                "text-lg transition-colors",
                star <= rating ? "text-v2-accent" : "text-v2-text-tertiary"
              )}
            >
              ★
            </button>
          ))}
        </div>
        <InputV2 placeholder="Review title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} />
        <InputV2 placeholder="Review body (optional)" value={body} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBody(e.target.value)} />
        <ButtonV2 type="submit" disabled={submitting || !title.trim()}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </ButtonV2>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <SkeletonV2 className="h-20" />
            <SkeletonV2 className="h-20" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-v2-text-secondary py-4 text-center">No reviews yet. Be the first!</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-v2-md bg-v2-bg-elevated">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-v2-accent-subtle text-v2-accent text-sm font-bold">
                {(r.username ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-v2-text-primary">{r.username ?? 'User'}</span>
                  <span className="text-xs text-v2-text-tertiary">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={cn("text-xs", i < (r.rating ?? 5) ? "text-v2-accent" : "text-v2-text-tertiary")}>★</span>
                  ))}
                </div>
                {r.title && <div className="text-sm font-medium text-v2-text-primary mt-1">{r.title}</div>}
                {r.body && <div className="text-sm text-v2-text-secondary mt-1">{r.body}</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </CardV2>
  )
}

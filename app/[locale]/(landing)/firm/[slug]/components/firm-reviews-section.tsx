"use client"
import React from 'react'
import { createFirmReview, listFirmReviews, flagReview, type ReviewSortOption } from '@/server/firm-reviews'
import { CardV2, CardV2Content, CardV2Description, CardV2Title, ButtonV2, InputV2, TextareaV2, SkeletonV2, BadgeV2, SpinnerV2 } from '@/components/ui/v2'
import { ReviewsIcon } from '@/components/icons/svg-icons'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { Star, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Flag, ChevronLeft, ChevronRight, Filter } from 'lucide-react'

type FirmReviewItem = Awaited<ReturnType<typeof listFirmReviews>>[number]

function InteractiveStarRating({
  rating,
  onRatingChange,
  disabled = false,
  size = 'lg'
}: {
  rating: number
  onRatingChange: (rating: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hoverRating, setHoverRating] = React.useState(0)
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7'
  }
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={cn(
            "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-v2-accent rounded",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-white/20 stroke-white/30"
            )}
          />
        </button>
      ))}
    </div>
  )
}

function StaticStarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4'
  }
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-white/20 stroke-white/30"
          )}
        />
      ))}
    </div>
  )
}

function RatingDistributionBar({
  rating,
  count,
  total,
}: {
  rating: number
  count: number
  total: number
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/50 w-3">{rating}</span>
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400/80 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-white/40 w-8 text-right">{count}</span>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function ReviewCard({ review, onFlag, canFlag }: { review: FirmReviewItem; onFlag: (id: string) => void; canFlag: boolean }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-v2-accent/20 to-v2-accent/5 border border-v2-accent/20">
          <span className="text-sm font-semibold text-v2-accent">
            {review.userId ? review.userId.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {review.userId ? 'Verified Trader' : 'Anonymous Trader'}
              </span>
              {review.isVerified && (
                <BadgeV2 variant="success" size="sm" className="shrink-0 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </BadgeV2>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canFlag && (
                <button
                  onClick={() => onFlag(review.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
                  title="Report this review"
                >
                  <Flag className="h-3.5 w-3.5 text-white/40 hover:text-v2-error" />
                </button>
              )}
              <span className="text-xs text-white/40">
                {formatRelativeTime(new Date(review.createdAt))}
              </span>
            </div>
          </div>
          
          <div className="mt-1.5">
            <StaticStarRating rating={review.rating} />
          </div>
          
          {review.title && (
            <h4 className="mt-2 text-sm font-medium text-white/90">
              {review.title}
            </h4>
          )}
          
          {review.content && (
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">
              {review.content}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start gap-4">
        <SkeletonV2 className="h-10 w-10 rounded-full" />
        <div className="flex-1 gap-3">
          <div className="flex items-center justify-between">
            <SkeletonV2 className="h-4 w-24" />
            <SkeletonV2 className="h-3 w-16" />
          </div>
          <SkeletonV2 className="h-3 w-20" />
          <SkeletonV2 className="h-4 w-3/4" />
          <SkeletonV2 className="h-3 w-full" />
          <SkeletonV2 className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export function FirmReviewsSection({ firmId }: { firmId: string }) {
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [rating, setRating] = React.useState(0)
  
  const [reviews, setReviews] = React.useState<FirmReviewItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)
  
  const [error, setError] = React.useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [hasUserReviewed, setHasUserReviewed] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  
  const [titleError, setTitleError] = React.useState<string | null>(null)
  const [ratingError, setRatingError] = React.useState<string | null>(null)
  
  // Sorting and pagination
  const [sortBy, setSortBy] = React.useState<ReviewSortOption>('newest')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  
  // Flag dialog
  const [showFlagDialog, setShowFlagDialog] = React.useState(false)
  const [flagReviewId, setFlagReviewId] = React.useState<string | null>(null)
  const [flagReason, setFlagReason] = React.useState('')
  const [flagDescription, setFlagDescription] = React.useState('')
  const [flagSubmitting, setFlagSubmitting] = React.useState(false)
  const [flagSuccess, setFlagSuccess] = React.useState(false)
  
  const supabase = createClient()
  
  React.useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setIsAuthenticated(false)
        return
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
        setCurrentUserId(user?.id ?? null)
      } catch {
        setIsAuthenticated(false)
      }
    }
    
    void checkAuth()
  }, [supabase])
  
  const fetchReviews = React.useCallback(async () => {
    try {
      setError(null)
      const data = await listFirmReviews(firmId, currentPage, sortBy)
      setReviews(data ?? [])
      
      // Calculate total pages (approximate since we don't have a count endpoint)
      setTotalPages(Math.max(1, Math.ceil((data?.length ?? 0) / 10)))
      
      if (currentUserId) {
        const userReview = data?.find(r => r.userId === currentUserId)
        setHasUserReviewed(!!userReview)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setError('Failed to load reviews. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [firmId, currentUserId, currentPage, sortBy])
  
  // Fetch when sort or page changes
  React.useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])
  
  const stats = React.useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    }
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    let sum = 0
    
    for (const review of reviews) {
      sum += review.rating
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++
      }
    }
    
    return {
      average: sum / reviews.length,
      total: reviews.length,
      distribution
    }
  }, [reviews])
  
  const validateForm = React.useCallback(() => {
    let isValid = true
    setTitleError(null)
    setRatingError(null)
    
    if (rating === 0) {
      setRatingError('Please select a rating')
      isValid = false
    }
    
    if (!title.trim()) {
      setTitleError('Please add a title for your review')
      isValid = false
    } else if (title.trim().length < 3) {
      setTitleError('Title must be at least 3 characters')
      isValid = false
    } else if (title.trim().length > 100) {
      setTitleError('Title must be less than 100 characters')
      isValid = false
    }
    
    return isValid
  }, [rating, title])
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) return
    
    if (hasUserReviewed) {
      setError('You have already reviewed this firm. Each user can only submit one review.')
      return
    }
    
    setSubmitting(true)
    setSubmitSuccess(false)
    
    try {
      await createFirmReview({
        propfirmId: firmId,
        rating,
        title: title.trim(),
        body: body.trim() || undefined
      })
      
      setTitle('')
      setBody('')
      setRating(0)
      setShowForm(false)
      setSubmitSuccess(true)
      setHasUserReviewed(true)
      
      await fetchReviews()
      
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err: unknown) {
      console.error('Failed to submit review:', err)
      
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique constraint') || errorMessage.includes('already reviewed')) {
        setError('You have already reviewed this firm. Each user can only submit one review.')
        setHasUserReviewed(true)
      } else {
        setError('Failed to submit review. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }
  
  function openFlagDialog(reviewId: string) {
    setFlagReviewId(reviewId)
    setFlagReason('')
    setFlagDescription('')
    setShowFlagDialog(true)
  }
  
  async function submitFlag(e: React.FormEvent) {
    e.preventDefault()
    if (!flagReviewId || !flagReason.trim()) return
    
    setFlagSubmitting(true)
    try {
      await flagReview({
        reviewId: flagReviewId,
        reason: flagReason,
        description: flagDescription.trim() || undefined,
      })
      setFlagSuccess(true)
      setShowFlagDialog(false)
      setTimeout(() => setFlagSuccess(false), 5000)
    } catch (err) {
      console.error('Failed to flag review:', err)
      setError(err instanceof Error ? err.message : 'Failed to report review')
    } finally {
      setFlagSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <CardV2 className="rounded-[30px] border-border/40 bg-card/5">
        <CardV2Content className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <ReviewsIcon size={20} className="text-v2-accent" />
            <CardV2Title className="text-2xl text-foreground">User reviews & ratings</CardV2Title>
          </div>
          <CardV2Description className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
            Approved trader submissions from Qunt Edge users. Review counts, averages, and moderation states stay visible in one place.
          </CardV2Description>
          
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Average Rating Display */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="text-5xl font-bold tracking-tight text-white">
                {stats.average > 0 ? stats.average.toFixed(1) : '—'}
              </div>
              <div className="mt-2">
                <StaticStarRating rating={Math.round(stats.average)} size="md" />
              </div>
              <p className="mt-2 text-sm text-white/50">
                Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-2.5 py-2">
              <p className="text-xs uppercase tracking-[0.12em] text-white/40 mb-3">Rating Distribution</p>
              {[5, 4, 3, 2, 1].map((rating) => (
                <RatingDistributionBar
                  key={rating}
                  rating={rating}
                  count={stats.distribution[rating as keyof typeof stats.distribution]}
                  total={stats.total}
                />
              ))}
            </div>
          </div>
        </CardV2Content>
      </CardV2>
      
      {/* Success Message */}
      {submitSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-v2-success/30 bg-v2-success-subtle/50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-v2-success shrink-0" />
          <p className="text-sm text-v2-success">Your review has been submitted successfully!</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-v2-error/30 bg-v2-error-subtle/50 px-5 py-4">
          <AlertCircle className="h-5 w-5 text-v2-error shrink-0" />
          <p className="text-sm text-v2-error">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto shrink-0 text-v2-error/60 hover:text-v2-error"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Review Form Section */}
      <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
        <CardV2Content className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Write a Review</h3>
            {!showForm && isAuthenticated && !hasUserReviewed && (
              <ButtonV2
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                Write Review
              </ButtonV2>
            )}
          </div>
          
          {/* Not authenticated message */}
          {isAuthenticated === false && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <p className="text-sm text-white/60">
                Please <a href="/en/authentication" className="text-v2-accent hover:underline">sign in</a> to write a review
              </p>
            </div>
          )}
          
          {/* Already reviewed message */}
          {hasUserReviewed && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-v2-success" />
                <p className="text-sm text-white/70">
                  You have already reviewed this firm. Thank you for your feedback!
                </p>
              </div>
            </div>
          )}
          
          {/* Review Form */}
          {showForm && isAuthenticated && !hasUserReviewed && (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Your Rating <span className="text-v2-error">*</span>
                </label>
                <InteractiveStarRating
                  rating={rating}
                  onRatingChange={(newRating) => {
                    setRating(newRating)
                    setRatingError(null)
                  }}
                  disabled={submitting}
                  size="lg"
                />
                {ratingError && (
                  <p className="mt-1.5 text-xs text-v2-error">{ratingError}</p>
                )}
              </div>
              
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Review Title <span className="text-v2-error">*</span>
                </label>
                <InputV2
                  placeholder="Summarize your experience..."
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setTitle(e.target.value)
                    setTitleError(null)
                  }}
                  disabled={submitting}
                  error={!!titleError}
                  maxLength={100}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {titleError ? (
                    <p className="text-xs text-v2-error">{titleError}</p>
                  ) : (
                    <p className="text-xs text-white/30">Min 3 characters</p>
                  )}
                  <span className="text-xs text-white/30">{title.length}/100</span>
                </div>
              </div>
              
              {/* Body Textarea */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Your Review <span className="text-white/40">(optional)</span>
                </label>
                <TextareaV2
                  placeholder="Share details about your experience with this firm..."
                  value={body}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                  disabled={submitting}
                  rows={4}
                  maxLength={1000}
                />
                <p className="mt-1.5 text-xs text-white/30 text-right">{body.length}/1000</p>
              </div>
              
              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-2">
                <ButtonV2
                  type="submit"
                  disabled={submitting}
                  className="min-w-[140px]"
                >
                  {submitting ? (
                    <>
                      <SpinnerV2 size={16} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </ButtonV2>
                <ButtonV2
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false)
                    setTitle('')
                    setBody('')
                    setRating(0)
                    setTitleError(null)
                    setRatingError(null)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </ButtonV2>
              </div>
            </form>
          )}
          
          {/* Loading state for auth check */}
          {isAuthenticated === null && (
            <div className="flex items-center justify-center py-8">
              <SpinnerV2 size={24} className="text-v2-accent" />
            </div>
          )}
        </CardV2Content>
      </CardV2>
      
      {/* Success Message for flag */}
      {flagSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-v2-success/30 bg-v2-success-subtle/50 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-v2-success shrink-0" />
          <p className="text-sm text-v2-success">Thank you for reporting this review. Our team will review it shortly.</p>
        </div>
      )}
      
      {/* Flag Report Dialog */}
      {showFlagDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Report Review</h3>
              <button onClick={() => setShowFlagDialog(false)} className="p-1 hover:bg-white/5 rounded">
                <XCircle className="h-5 w-5 text-white/40" />
              </button>
            </div>
            <form onSubmit={submitFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Reason</label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-v2-accent focus:outline-none"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam or misleading</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="fake">Fake or fabricated review</option>
                  <option value="harassment">Harassment or abuse</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Additional Details (optional)</label>
                <TextareaV2
                  placeholder="Provide more context about your report..."
                  value={flagDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFlagDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <ButtonV2 type="submit" disabled={flagSubmitting || !flagReason.trim()}>
                  {flagSubmitting ? 'Submitting...' : 'Submit Report'}
                </ButtonV2>
                <ButtonV2 type="button" variant="ghost" onClick={() => setShowFlagDialog(false)}>
                  Cancel
                </ButtonV2>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Reviews List */}
      <CardV2 className="rounded-[30px] border-white/10 bg-white/[0.03]">
        <CardV2Content className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-semibold text-white">
              All Reviews
              {stats.total > 0 && (
                <span className="ml-2 text-sm font-normal text-white/40">({stats.total})</span>
              )}
            </h3>
            
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-white/40" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as ReviewSortOption)
                  setCurrentPage(1)
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-v2-accent focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              // Loading skeletons
              <>
                <ReviewSkeleton />
                <ReviewSkeleton />
                <ReviewSkeleton />
              </>
            ) : reviews.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.06] mb-4">
                  <ReviewsIcon size={28} className="text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/60">No reviews yet</p>
                <p className="mt-1 text-sm text-white/40">
                  Be the first to share your experience with this firm
                </p>
                {isAuthenticated && !hasUserReviewed && !showForm && (
                  <ButtonV2
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowForm(true)}
                  >
                    Write the first review
                  </ButtonV2>
                )}
              </div>
            ) : (
              // Reviews list
              reviews.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onFlag={openFlagDialog}
                  canFlag={isAuthenticated === true && !!currentUserId && review.userId !== currentUserId}
                />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/5">
              <ButtonV2
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </ButtonV2>
              <span className="text-sm text-white/50">
                Page {currentPage} of {totalPages}
              </span>
              <ButtonV2
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </ButtonV2>
            </div>
          )}
        </CardV2Content>
      </CardV2>
    </div>
  )
}

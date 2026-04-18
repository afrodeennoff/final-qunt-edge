import { getReviewModerationQueue, moderateReview, getFlaggedReviewCount } from '@/server/firm-reviews'
import { assertAdminAccess } from '@/server/authz'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; status?: string }>
}

async function moderateAction(formData: FormData) {
  'use server'
  const moderationId = formData.get('moderationId')
  const action = formData.get('action')
  const locale = formData.get('locale')
  const status = formData.get('status')
  const page = formData.get('page')

  if (!moderationId || typeof moderationId !== 'string') {
    throw new Error('Missing moderation ID')
  }
  if (!action || !['upheld', 'dismissed', 'warning_issued'].includes(action as string)) {
    throw new Error('Invalid moderation action')
  }

  await moderateReview({ moderationId, action: action as 'upheld' | 'dismissed' | 'warning_issued' })
  redirect(`/${locale || 'en'}/admin/reviews?status=${status || 'all'}&page=${page || '1'}`)
}

export default async function ReviewsModerationPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams

  // Check admin access
  try {
    await assertAdminAccess()
  } catch {
    redirect(`/${locale}/authentication`)
  }

  const currentPage = parseInt(resolvedSearchParams.page || '1', 10)
  const status = resolvedSearchParams.status || 'all'

  const { items, total, totalPages } = await getReviewModerationQueue(currentPage, status)
  const flaggedCount = await getFlaggedReviewCount()
  
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
  ]
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Review Moderation</h1>
          <p className="mt-1 text-muted-foreground">Manage flagged reviews and user reports</p>
        </div>
        
        {flaggedCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-v2-error/10 border border-v2-error/30">
            <AlertTriangle className="h-5 w-5 text-v2-error" />
            <span className="font-medium text-v2-error">{flaggedCount} pending</span>
          </div>
        )}
      </div>
      
      {/* Status Tabs */}
      <div className="flex gap-2 mb-6">
        {statusOptions.map((option) => (
          <Link
            key={option.value}
            href={`/${locale}/admin/reviews?status=${option.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/30 text-muted-foreground hover:bg-background/35'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
      
      {/* Reports List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No moderation reports found
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/30 bg-background/20 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Review Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Badge 
                      variant={item.status === 'pending' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Reported {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* The flagged review */}
                  <div className="mb-4 rounded-xl bg-background/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {item.review.propFirm.name}
                      </span>
                      <span className="text-yellow-400">
                        {'★'.repeat(item.review.rating)}
                      </span>
                    </div>
                    {item.review.title && (
                      <h4 className="mb-1 text-sm font-medium text-foreground/95">
                        {item.review.title}
                      </h4>
                    )}
                    {item.review.content && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.review.content}
                      </p>
                    )}
                  </div>
                  
                  {/* The report reason */}
                  <div className="mb-4">
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                      Report Reason: {item.reason}
                    </p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Resolution info */}
                  {item.status === 'resolved' && (
                    <div className="flex items-center gap-2 text-sm">
                      {item.resolution === 'upheld' ? (
                        <Badge variant="destructive" size="sm">
                          <XCircle className="h-3 w-3 mr-1" />
                          Removed
                        </Badge>
                      ) : item.resolution === 'dismissed' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Dismissed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Warning Issued
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {item.reviewedAt && `on ${new Date(item.reviewedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                {item.status === 'pending' && (
                  <form action={moderateAction} className="flex flex-col gap-2 shrink-0">
                    <input type="hidden" name="moderationId" value={item.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="status" value={status} />
                    <input type="hidden" name="page" value={String(currentPage)} />
                    <Button
                      type="submit"
                      name="action"
                      value="upheld"
                      variant="destructive"
                      size="sm"
                      className="w-32"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                    <Button
                      type="submit"
                      name="action"
                      value="dismissed"
                      variant="solid"
                      size="sm"
                      className="w-32 bg-v2-success hover:bg-v2-success/80"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Keep
                    </Button>
                    <Button
                      type="submit"
                      name="action"
                      value="warning_issued"
                      variant="outline"
                      size="sm"
                      className="w-32"
                    >
                      Warn
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href={`/${locale}/admin/reviews?page=${Math.max(1, currentPage - 1)}&status=${status}`}
            className={`rounded-lg p-2 ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-background/35'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({total} total)
          </span>
          <Link
            href={`/${locale}/admin/reviews?page=${Math.min(totalPages, currentPage + 1)}&status=${status}`}
            className={`rounded-lg p-2 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-background/35'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  )
}

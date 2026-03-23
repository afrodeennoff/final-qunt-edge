import { getReviewModerationQueue, moderateReview, getFlaggedReviewCount } from '@/server/firm-reviews'
import { assertAdminAccess } from '@/server/authz'
import { redirect } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonV2 } from '@/components/ui/v2'
import { BadgeV2 } from '@/components/ui/v2'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; status?: string }>
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
  
  async function moderateAction(formData: FormData) {
    'use server'
    const moderationId = formData.get('moderationId') as string
    const action = formData.get('action') as 'upheld' | 'dismissed' | 'warning_issued'
    
    try {
      await moderateReview({ moderationId, action })
    } catch (err) {
      console.error('Moderation failed:', err)
    }
  }
  
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
  ]
  
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Review Moderation</h1>
            <p className="text-white/50 mt-1">Manage flagged reviews and user reports</p>
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
                  ? 'bg-v2-accent text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
        
        {/* Reports List */}
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              No moderation reports found
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Review Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <BadgeV2 
                        variant={item.status === 'pending' ? 'warning' : 'success'}
                        size="sm"
                      >
                        {item.status}
                      </BadgeV2>
                      <span className="text-sm text-white/50">
                        Reported {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* The flagged review */}
                    <div className="rounded-xl bg-white/5 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {item.review.propFirm.name}
                        </span>
                        <span className="text-yellow-400">
                          {'★'.repeat(item.review.rating)}
                        </span>
                      </div>
                      {item.review.title && (
                        <h4 className="text-sm font-medium text-white/90 mb-1">
                          {item.review.title}
                        </h4>
                      )}
                      {item.review.content && (
                        <p className="text-sm text-white/60 line-clamp-2">
                          {item.review.content}
                        </p>
                      )}
                    </div>
                    
                    {/* The report reason */}
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-white/40 mb-1">
                        Report Reason: {item.reason}
                      </p>
                      {item.description && (
                        <p className="text-sm text-white/70">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Resolution info */}
                    {item.status === 'resolved' && (
                      <div className="flex items-center gap-2 text-sm">
                        {item.resolution === 'upheld' ? (
                          <BadgeV2 variant="error" size="sm">
                            <XCircle className="h-3 w-3 mr-1" />
                            Removed
                          </BadgeV2>
                        ) : item.resolution === 'dismissed' ? (
                          <BadgeV2 variant="success" size="sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Dismissed
                          </BadgeV2>
                        ) : (
                          <BadgeV2 variant="warning" size="sm">
                            Warning Issued
                          </BadgeV2>
                        )}
                        <span className="text-white/40">
                          {item.reviewedAt && `on ${new Date(item.reviewedAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  {item.status === 'pending' && (
                    <form action={moderateAction} className="flex flex-col gap-2 shrink-0">
                      <input type="hidden" name="moderationId" value={item.id} />
                      <ButtonV2
                        type="submit"
                        name="action"
                        value="upheld"
                        variant="destructive"
                        size="sm"
                        className="w-32"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remove
                      </ButtonV2>
                      <ButtonV2
                        type="submit"
                        name="action"
                        value="dismissed"
                        variant="solid"
                        size="sm"
                        className="w-32 bg-v2-success hover:bg-v2-success/80"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Keep
                      </ButtonV2>
                      <ButtonV2
                        type="submit"
                        name="action"
                        value="warning_issued"
                        variant="outline"
                        size="sm"
                        className="w-32"
                      >
                        Warn
                      </ButtonV2>
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
              className={`p-2 rounded-lg ${currentPage === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <span className="text-sm text-white/50">
              Page {currentPage} of {totalPages} ({total} total)
            </span>
            <Link
              href={`/${locale}/admin/reviews?page=${Math.min(totalPages, currentPage + 1)}&status=${status}`}
              className={`p-2 rounded-lg ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-white/10'}`}
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

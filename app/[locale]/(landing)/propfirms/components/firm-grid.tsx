"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FirmCard } from "./firm-card"
import { cn } from "@/lib/utils"
import { useCallback, useTransition } from "react"
import type { PropfirmCatalogueStats } from "../actions/types"

interface FirmGridProps {
  firms: Array<{
    key: string
    name: string
    accountTemplatesCount: number
    stats: PropfirmCatalogueStats
  }>
  pageSize?: number
  locale: string
}

export function FirmGrid({ firms, pageSize = 9, locale }: FirmGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentPage = parseInt(searchParams.get("page") || "1", 10)
  const totalPages = Math.ceil(firms.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedFirms = firms.slice(startIndex, endIndex)

  const goToPage = useCallback(
    (page: number) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (page > 1) {
          params.set("page", page.toString())
        } else {
          params.delete("page")
        }
        const query = params.toString()
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  if (firms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-foreground/95 mb-1">No firms found</h3>
        <p className="text-xs text-muted-foreground/70">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedFirms.map(({ key, name, accountTemplatesCount, stats }) => (
          <FirmCard
            key={key}
            locale={locale}
            name={name}
            slug={key}
            stats={stats}
            accountSizesCount={accountTemplatesCount}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground/95 disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and neighbors
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1

              const showEllipsis =
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)

              if (showEllipsis) {
                return (
                  <span key={`ellipsis-${page}`} className="px-1 text-muted-foreground/40 text-xs">
                    ...
                  </span>
                )
              }

              if (!showPage) return null

              return (
                <Button 
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(page)}
                  disabled={isPending}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-medium rounded-md transition-all duration-200",
                    currentPage === page
                      ? "bg-primary/15 text-foreground/95 border border-primary/30"
                      : "text-muted-foreground hover:text-foreground/95 hover:bg-muted/50"
                  )}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button 
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
            className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground/95 disabled:opacity-40"
          >
            Next
            <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  )
}

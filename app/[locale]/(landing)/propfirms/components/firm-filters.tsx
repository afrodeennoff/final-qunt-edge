"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCallback, useTransition } from "react"

interface FirmFiltersProps {
  totalCount: number
  filteredCount: number
}

export function FirmFilters({ totalCount, filteredCount }: FirmFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const search = searchParams.get("q") || ""
  const payoutFilter = searchParams.get("payout") || ""
  const sort = searchParams.get("sort") || "accounts"

  const updateParams = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
        // Reset to page 1 when filters change
        params.delete("page")
        const query = params.toString()
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false })
    })
  }, [pathname, router])

  const hasActiveFilters = search || payoutFilter || sort !== "accounts"

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.060] p-4 sm:p-5">
      {/* Search Bar */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          type="search"
          placeholder="Search prop firms..."
          defaultValue={search}
          onChange={(e) => updateParams("q", e.target.value)}
          className="h-12 rounded-xl border-white/[0.06] bg-background/70 pl-10 placeholder:text-muted-foreground/40 focus:border-primary/40 focus:ring-primary/20"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Payout Type Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium mr-1">
            Payouts
          </span>
          {["", "high-paid", "low-refused"].map((value) => (
            <Button 
              key={value || "all"}
              variant="ghost"
              size="sm"
              onClick={() => updateParams("payout", value)}
              className={cn(
                "h-8 rounded-full border px-3 text-[11px] font-medium transition-all duration-200",
                payoutFilter === value
                  ? "border-primary/40 bg-primary/10 text-foreground/95"
                  : "border-transparent text-muted-foreground hover:text-foreground/95 hover:bg-muted/50"
              )}
            >
              {value === "" ? "All" : value === "high-paid" ? "High Paid" : "Low Refused"}
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-border/40" />

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 font-medium mr-1">
            Sort
          </span>
          {[
            { value: "accounts", label: "Accounts" },
            { value: "paidPayout", label: "Paid" },
            { value: "refusedPayout", label: "Refused" },
            { value: "accountValue", label: "Value" },
          ].map(({ value, label }) => (
            <Button 
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => updateParams("sort", value)}
              className={cn(
                "h-8 rounded-full border px-3 text-[11px] font-medium transition-all duration-200",
                sort === value
                  ? "border-primary/40 bg-primary/10 text-foreground/95"
                  : "border-transparent text-muted-foreground hover:text-foreground/95 hover:bg-muted/50"
              )}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="w-px h-4 bg-border/40" />
            <Button 
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 rounded-full px-3 text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              Clear All
            </Button>
          </>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/70">
            {filteredCount === totalCount
              ? `${totalCount} firms`
              : `${filteredCount} of ${totalCount} firms`}
          </span>
          {isPending && (
            <div className="w-3 h-3 border-2 border-primary/30 border-t-primary/80 rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  )
}

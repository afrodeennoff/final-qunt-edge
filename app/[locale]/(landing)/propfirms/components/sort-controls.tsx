"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SortControlsProps {
  sortLabel: string
  sortOptions: {
    accounts: string
    paidPayout: string
    refusedPayout: string
    accountValue: string
  }
}

export function SortControls({ sortLabel, sortOptions }: SortControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "accounts"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "accounts") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-xs font-semibold tracking-wide text-[hsl(var(--mk-text))]">
        {sortLabel}
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort-select"
          className="w-[200px] border border-white/[0.08] bg-white/[0.080] text-foreground/95 shadow-none hover:bg-white/[0.02] focus-visible:ring-1 focus-visible:ring-primary/55 focus-visible:ring-offset-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border border-white/[0.08] bg-white/[0.02] text-foreground/95 shadow-xl">
          <SelectItem value="accounts">{sortOptions.accounts}</SelectItem>
          <SelectItem value="paidPayout">{sortOptions.paidPayout}</SelectItem>
          <SelectItem value="refusedPayout">{sortOptions.refusedPayout}</SelectItem>
          <SelectItem value="accountValue">{sortOptions.accountValue}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

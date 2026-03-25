"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { Tag, Percent } from "lucide-react"

interface AdItem {
  id: string
  type: "deal" | "coupon"
  title: string
  discount: string
  href: string
}

const adItems: AdItem[] = [
  { id: "1", type: "deal", title: "FTMO Challenge", discount: "15% OFF", href: "/deals" },
  { id: "2", type: "coupon", title: "TOPSTEP50", discount: "$50 OFF", href: "/deals" },
  { id: "3", type: "deal", title: "Apex Trader Funded", discount: "20% OFF", href: "/deals" },
  { id: "4", type: "coupon", title: "BLUEWAVE25", discount: "25% OFF", href: "/deals" },
  { id: "5", type: "deal", title: "TFT Evaluation", discount: "10% OFF", href: "/deals" },
  { id: "6", type: "coupon", title: "MYFUNDEDFX", discount: "$100 OFF", href: "/deals" },
  { id: "7", type: "deal", title: "FundedNext", discount: "25% OFF", href: "/deals" },
  { id: "8", type: "coupon", title: "URFUNDED30", discount: "30% OFF", href: "/deals" },
]

export default function RollingAdBanner() {
  return (
    <div className="relative overflow-hidden border-b border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex animate-scroll whitespace-nowrap py-2">
        {[...adItems, ...adItems, ...adItems].map((item, idx) => (
          <Link
            key={`${item.id}-${idx}`}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-4 transition-opacity hover:opacity-80",
              "text-xs font-medium tracking-wide"
            )}
          >
            {item.type === "deal" ? (
              <Tag className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Percent className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span className="text-foreground/90">{item.title}</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                item.type === "deal"
                  ? "bg-primary/10 text-primary"
                  : "bg-emerald-600/10 text-emerald-600"
              )}
            >
              {item.discount}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
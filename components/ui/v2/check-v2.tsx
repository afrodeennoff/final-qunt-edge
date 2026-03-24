"use client"
import { cn } from "@/lib/utils"

export function CheckV2({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      className={cn("check-v2", className)}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 27l7 7 16-16"
        strokeDasharray="50"
        strokeDashoffset="50"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="50"
          to="0"
          dur="0.5s"
          fill="freeze"
        />
      </path>
    </svg>
  )
}

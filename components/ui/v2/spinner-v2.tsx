"use client"
import { cn } from "@/lib/utils"

export function SpinnerV2({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={cn("spinner-v2", className)}
    >
      <circle
        cx="25" cy="25" r="20"
        strokeWidth="4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeDasharray="80, 200"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

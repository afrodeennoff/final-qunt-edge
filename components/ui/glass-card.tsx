import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  size?: "sm" | "md" | "lg"
  clickable?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hover = false, size = "md", clickable = false, ...props }, ref) => {
    return (
        <Card
        ref={ref}
        className={cn(
          "rounded-[var(--radius)] transition-all duration-200",
          {
            "relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl backdrop-saturate-200 shadow-[0_0_0_0.5px_rgba(180,210,255,0.07),0_8px_32px_-8px_rgba(0,0,0,0.78)]": variant === "default",
            "relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl backdrop-saturate-200 shadow-[0_0_0_0.5px_rgba(180,210,255,0.07),0_8px_32px_-8px_rgba(0,0,0,0.78)]": variant === "strong",
            "relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl backdrop-saturate-200 shadow-[0_0_0_0.5px_rgba(180,210,255,0.07),0_8px_32px_-8px_rgba(0,0,0,0.78)]": variant === "subtle",
          },
          {
            "hover:bg-secondary/30 hover:shadow-md hover:-translate-y-0.5": hover,
            "cursor-pointer active:scale-[0.98]": clickable,
          },
          {
            "p-[var(--space-3)]": size === "sm",
            "p-[var(--space-6)]": size === "md",
            "p-[var(--space-8)]": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };

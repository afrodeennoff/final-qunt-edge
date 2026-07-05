import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?:"default" |"strong" |"subtle";
 hover?: boolean;
 size?:"sm" |"md" |"lg"
 clickable?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
 ({ className, variant ="default", hover = false, size ="md", clickable = false, ...props }, ref) => {
  return (
  <Card
  ref={ref}
  className={cn("rounded-lg transition-colors",
        "border-0 bg-card",
  hover && "hover:bg-muted/30",
  clickable && "cursor-pointer active:scale-[0.97] transition-transform duration-150",
  {"p-3": size ==="sm","p-4": size ==="md","p-6": size ==="lg",
  },
  className
  )}
  {...props}
  />
  );
});
GlassCard.displayName ="GlassCard";

export { GlassCard };

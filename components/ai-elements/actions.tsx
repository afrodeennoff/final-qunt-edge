"use client";

import { Button } from "@/components/ui/button";
import { ButtonV2 } from "@/components/ui/v2";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type ActionsProps = ComponentProps<"div">;

export const Actions = ({ className, children, ...props }: ActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);

export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

export const Action = ({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ActionProps) => {
  const button = (
    <ButtonV2 
      className={cn(
        "relative size-9 p-1.5 text-muted-foreground hover:text-foreground",
        className
      )}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </ButtonV2>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

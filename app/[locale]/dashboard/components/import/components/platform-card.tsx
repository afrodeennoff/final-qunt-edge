"use client";

import { BadgeV2, CardV2, CardV2Content, CardV2Header, CardV2Title } from "@/components/ui/v2";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PlatformConfig } from "../config/platforms";
import { motion, useReducedMotion } from "framer-motion";

interface PlatformCardProps {
    platform: PlatformConfig;
    isSelected: boolean;
    onSelect: (type: string) => void;
    onHover: (category: string) => void;
    onLeave: () => void;
    isWeekend: boolean;
}

export function PlatformCard({
    platform,
    isSelected,
    onSelect,
    onHover,
    onLeave,
    isWeekend,
}: PlatformCardProps) {
    const t = useI18n();
    const shouldReduceMotion = useReducedMotion();

    const isInteractive = !platform.isDisabled && !platform.isComingSoon;

    return (
        <motion.div
            layout
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileHover={shouldReduceMotion ? {} : { y: -2 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onMouseEnter={() => onHover(platform.category)}
            onMouseLeave={onLeave}
            className="h-full"
        >
            <CardV2
                clickable={isInteractive}
                variant={isSelected ? "elevated" : "default"}
                hover={isInteractive}
                size="sm"
                onClick={isInteractive ? () => onSelect(platform.type) : undefined}
                className={cn(
                    "group relative flex h-full flex-col items-start gap-3 text-left transition-all duration-300",
                    isSelected && "border-v2-accent shadow-md shadow-v2-accent/15",
                    (platform.isDisabled || platform.isComingSoon) &&
                        "cursor-not-allowed opacity-60 grayscale-[0.5]"
                )}
            >
                {/* Selection Indicator */}
                <div
                    className={cn(
                        "absolute right-2.5 top-2.5 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-v2-accent/30 text-v2-accent opacity-0 transition-all",
                        isSelected && "opacity-100",
                        "group-hover:border-v2-accent group-hover:opacity-100"
                    )}
                >
                    {isSelected ? (
                        <CheckCircle2 className="h-full w-full fill-v2-accent/10" />
                    ) : (
                        <div className="h-full w-full rounded-full border-2 border-transparent group-hover:border-v2-accent/30" />
                    )}
                </div>

                <CardV2Header size="sm" className="p-0 gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-v2-border/50 bg-v2-bg-base/80 p-2 shadow-sm transition-transform group-hover:scale-110">
                        {platform.logo.path && (
                            <div className="relative h-full w-full">
                                <Image
                                    src={platform.logo.path}
                                    alt={platform.logo.alt || ""}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                        {platform.logo.component && <platform.logo.component />}
                    </div>
                </CardV2Header>

                <CardV2Content size="sm" className="p-0 flex flex-col gap-2 flex-1">
                    <CardV2Title size="sm">
                        {t(platform.name as any, { count: 1 })}
                    </CardV2Title>
                    <p className="text-xs text-v2-text-secondary line-clamp-2 min-h-[2.5em]">
                        {t(platform.description as any, { count: 1 })}
                    </p>
                </CardV2Content>

                <div className="flex flex-wrap gap-2 w-full mt-auto pt-2">
                    {platform.isDisabled && (
                        <BadgeV2
                            variant="secondary"
                            className="bg-semantic-warning-bg/10 text-semantic-warning hover:bg-semantic-warning-bg/20"
                        >
                            {t("import.type.badge.maintenance")}
                        </BadgeV2>
                    )}
                    {platform.isComingSoon && !platform.isDisabled && (
                        <BadgeV2
                            variant="secondary"
                            className="bg-semantic-info-bg/10 text-semantic-info hover:bg-semantic-info-bg/20"
                        >
                            {t("import.type.badge.comingSoon")}
                        </BadgeV2>
                    )}
                    {!platform.isDisabled && platform.isRithmic && isWeekend && (
                        <BadgeV2
                            variant="outline"
                            className="border-semantic-warning-border/30 bg-semantic-warning-bg/5 text-semantic-warning"
                        >
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Weekend
                        </BadgeV2>
                    )}
                </div>
            </CardV2>
        </motion.div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BadgeV2, CardV2, CardV2Content, CardV2Header, CardV2Title } from "@/components/ui/v2";
import { Checkbox } from "@/components/ui/checkbox";
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
    onHover?: (category: string) => void;
    onLeave?: () => void;
    isWeekend: boolean;
    isMultiSelectMode?: boolean;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

export function PlatformCard({
    platform,
    isSelected,
    onSelect,
    onHover,
    onLeave,
    isWeekend,
    isMultiSelectMode = false,
    isChecked = false,
    onCheckChange,
}: PlatformCardProps) {
    const t = useI18n();
    const shouldReduceMotion = useReducedMotion();

    const isInteractive = !platform.isDisabled && !platform.isComingSoon;

    const categoryBadgeColors: Record<string, { variant: "default" | "secondary" | "outline" | "accent" | "success" | "warning" | "error"; className: string }> = {
        'Direct Account Sync': { variant: 'accent', className: 'bg-v2-accent-subtle text-v2-accent' },
        'Intelligent Import': { variant: 'outline', className: 'bg-v2-bg-elevated text-v2-text-secondary' },
        'Platform CSV Import': { variant: 'success', className: 'bg-v2-success-subtle text-v2-success' },
        'Manual Entry': { variant: 'secondary', className: 'bg-v2-bg-elevated text-v2-text-secondary' },
    };
    const categoryBadge = categoryBadgeColors[platform.category] || { variant: 'default', className: '' };
    const getTranslatedCategory = (category: string) => {
        switch (category) {
            case 'Direct Account Sync': return t('import.type.category.directSync');
            case 'Intelligent Import': return t('import.type.category.intelligentImport');
            case 'Platform CSV Import': return t('import.type.category.platformCsv');
            case 'Manual Entry': return t('import.type.category.manualEntry');
            default: return category;
        }
    };

    return (
        <motion.div
            layout
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileHover={shouldReduceMotion ? {} : { y: -4 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onMouseEnter={() => { if (onHover) onHover(platform.category) }}
            onMouseLeave={() => { if (onLeave) onLeave() }}
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
                    isSelected && "border-v2-accent shadow-lg shadow-v2-accent/20",
                    (platform.isDisabled || platform.isComingSoon) &&
                        "cursor-not-allowed opacity-60 grayscale-[0.5]"
                )}
            >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-v2-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                {isMultiSelectMode && (
                    <div 
                        className="absolute left-2.5 top-2.5 z-20 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1.5 -mt-1.5 p-1.5" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                                if (onCheckChange) {
                                    onCheckChange(checked as boolean);
                                }
                            }}
                            className="h-5 w-5 border-2 border-v2-border data-[state=checked]:bg-v2-accent data-[state=checked]:border-v2-accent data-[state=checked]:text-v2-bg-base transition-all"
                        />
                    </div>
                )}

                <div
                    className={cn(
                        "absolute right-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                        isSelected
                            ? "border-v2-accent bg-v2-accent shadow-[0_0_16px_rgba(var(--v2-accent-rgb),0.4)]"
                            : "border-v2-border/50 group-hover:border-v2-accent/50 group-hover:shadow-[0_0_12px_rgba(var(--v2-accent-rgb),0.2)]",
                        "opacity-0 group-hover:opacity-100",
                        isSelected && "opacity-100",
                        isMultiSelectMode && "opacity-0 pointer-events-none"
                    )}
                >
                    {isSelected ? (
                        <CheckCircle2 className="h-4 w-4 text-v2-bg-base" />
                    ) : (
                        <div className="h-2 w-2 rounded-full bg-transparent group-hover:bg-v2-accent/50 transition-colors" />
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
                        {t(String(platform.name) as any, { count: 1 })}
                    </CardV2Title>
                    <p className="text-xs text-v2-text-secondary line-clamp-2 min-h-[2.5em]">
                        {t(String(platform.description) as any, { count: 1 })}
                    </p>
                </CardV2Content>

                <div className="flex flex-wrap gap-2 w-full mt-auto pt-2">
                    <BadgeV2
                        variant={categoryBadge.variant as 'default' | 'secondary' | 'outline' | 'accent' | 'success' | 'warning' | 'error'}
                        className={cn("text-[10px]", categoryBadge.className)}
                    >
                        {getTranslatedCategory(platform.category)}
                    </BadgeV2>
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

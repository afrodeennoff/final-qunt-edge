"use client";

import React, { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTypedI18n } from "@/locales/client";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PlatformConfig } from "../config/platforms";

interface PlatformCardProps {
 platform: PlatformConfig;
 isSelected: boolean;
 onSelect: (type: string) => void;
 isWeekend: boolean;
 isMultiSelectMode?: boolean;
 isChecked?: boolean;
 onCheckChange?: (checked: boolean) => void;
}

const categoryBadgeColors: Record<string, { variant:"default" |"secondary" |"outline" |"accent" |"success" |"warning" |"error"; className: string }> = {
 'Direct Account Sync': { variant: 'accent', className: 'bg-v2-accent-subtle text-v2-accent' },
 'Intelligent Import': { variant: 'outline', className: 'bg-v2-bg-elevated text-v2-text-secondary' },
 'Platform CSV Import': { variant: 'success', className: 'bg-v2-success-subtle text-v2-success' },
 'Manual Entry': { variant: 'secondary', className: 'bg-v2-bg-elevated text-v2-text-secondary' },
};

function PlatformCardInner({
 platform,
 isSelected,
 onSelect,
 isWeekend,
 isMultiSelectMode = false,
 isChecked = false,
 onCheckChange,
}: PlatformCardProps) {
 const t = useTypedI18n();

 const isInteractive = !platform.isDisabled && !platform.isComingSoon;
 const categoryBadge = categoryBadgeColors[platform.category] || { variant: 'default' as const, className: '' };

 const getTranslatedCategory = useCallback((category: string) => {
 switch (category) {
 case 'Direct Account Sync': return t('import.type.category.directSync');
 case 'Intelligent Import': return t('import.type.category.intelligentImport');
 case 'Platform CSV Import': return t('import.type.category.platformCsv');
 case 'Manual Entry': return t('import.type.category.manualEntry');
 default: return category;
 }
 }, [t]);

 const handleSelect = useCallback(() => {
 if (isInteractive) {
 onSelect(platform.type);
 }
 }, [isInteractive, onSelect, platform.type]);

 const handleCheckChange = useCallback((checked: boolean) => {
 if (onCheckChange) {
 onCheckChange(checked);
 }
 }, [onCheckChange]);

 return (
 <Card
 clickable={isInteractive}
 variant={isSelected ?"elevated" :"default"}
 hover={isInteractive}
 size="sm"
 onClick={isInteractive ? handleSelect : undefined}
 className={cn("group relative flex h-full min-h-[13.5rem] flex-col items-start gap-3 rounded-xl border-v2-border/70 bg-v2-bg-surface/75 text-left transition-[opacity,background-color,border-color] duration-300",
 isSelected &&"border-v2-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_48px_-16px_rgba(0,0,0,0.5)] shadow-v2-accent/20",
 (platform.isDisabled || platform.isComingSoon) &&"cursor-not-allowed opacity-60 grayscale-[0.5]"
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
 onCheckedChange={handleCheckChange}
 className="h-5 w-5 border-2 border-v2-border data-[state=checked]:bg-v2-accent data-[state=checked]:border-v2-accent data-[state=checked]:text-v2-bg-base transition-[opacity,background-color,border-color]"
 />
 </div>
 )}

 <div
 className={cn("absolute right-2.5 top-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-[opacity,background-color,border-color]",
 isSelected
 ?"border-v2-accent bg-v2-accent shadow-[0_0_16px_rgba(var(--v2-accent-rgb),0.4)]"
 :"border-v2-border/50 group-hover:border-v2-accent/50 group-hover:shadow-[0_0_12px_rgba(var(--v2-accent-rgb),0.2)]","opacity-0 group-hover:opacity-100",
 isSelected &&"opacity-100",
 isMultiSelectMode &&"opacity-0 pointer-events-none"
 )}
 >
 {isSelected ? (
 <CheckCircle2 className="h-4 w-4 text-v2-bg-base" />
 ) : (
 <div className="h-2 w-2 rounded-full bg-transparent group-hover:bg-v2-accent/50 transition-colors" />
 )}
 </div>

 <CardHeader size="sm" className="p-0 gap-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-v2-border/50 bg-v2-bg-base/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_-4px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-105">
 {platform.logo.path && (
 <div className="relative h-full w-full">
 <Image
 src={platform.logo.path}
 alt={platform.logo.alt ||""}
 fill
 sizes="48px"
 className="object-contain"
 />
 </div>
 )}
 {platform.logo.component && <platform.logo.component />}
 </div>
 </CardHeader>

 <CardContent size="sm" className="p-0 flex flex-col gap-2 flex-1">
 <CardTitle size="sm" className="min-h-[2.75rem] leading-snug">
 {t(String(platform.name), { count: 1 })}
 </CardTitle>
 <p className="min-h-[3rem] text-xs text-v2-text-secondary line-clamp-2">
 {t(String(platform.description), { count: 1 })}
 </p>
 </CardContent>

 <div className="mt-auto flex min-h-[2rem] w-full flex-wrap items-start gap-2 pt-2">
 <Badge
 variant={categoryBadge.variant}
 className={cn("text-[10px]", categoryBadge.className)}
 >
 {getTranslatedCategory(platform.category)}
 </Badge>
 {platform.isDisabled && (
 <Badge
 variant="secondary"
 className="bg-semantic-warning-bg/10 text-semantic-warning hover:bg-semantic-warning-bg/20"
 >
 {t("import.type.badge.maintenance")}
 </Badge>
 )}
 {platform.isComingSoon && !platform.isDisabled && (
 <Badge
 variant="secondary"
 className="bg-semantic-info-bg/10 text-semantic-info hover:bg-semantic-info-bg/20"
 >
 {t("import.type.badge.comingSoon")}
 </Badge>
 )}
 {!platform.isDisabled && platform.isRithmic && isWeekend && (
 <Badge
 variant="outline"
 className="border-semantic-warning-border/30 bg-semantic-warning-bg/5 text-semantic-warning"
 >
 <AlertTriangle className="mr-1 h-3 w-3" />
 Weekend
 </Badge>
 )}
 </div>
 </Card>
 );
}

export const PlatformCard = React.memo(PlatformCardInner, (prevProps, nextProps) => {
 return (
 prevProps.platform === nextProps.platform &&
 prevProps.isSelected === nextProps.isSelected &&
 prevProps.isWeekend === nextProps.isWeekend &&
 prevProps.isMultiSelectMode === nextProps.isMultiSelectMode &&
 prevProps.isChecked === nextProps.isChecked
 );
});

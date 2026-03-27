import { WidgetSize } from "../../types/dashboard"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { ButtonV2 } from "@/components/ui/v2"
import { cn } from "@/lib/utils"
import { RotateCcw } from "lucide-react"
import { useI18n } from "@/locales/client"

export function ChatHeader({
    onReset,
    isLoading,
    size,
}: {
    title: string
    onReset: () => void
    isLoading: boolean
    size?: WidgetSize
}) {
    const t = useI18n();
    return (
        <CardHeader
            className={cn(
                "flex flex-row items-center justify-between gap-0 border-b shrink-0",
                size === "small-long" ? "p-2 h-[40px]" : "p-3 sm:p-4 h-[56px]",
            )}
        >
            <div className="flex items-center gap-1.5">
                <CardTitle className={cn("line-clamp-1", size === "small-long" ? "text-sm" : "text-base")}>{t('chat.title')}</CardTitle>
            </div>
            <ButtonV2 
                variant="ghost"
                size="icon"
                onClick={onReset}
                disabled={isLoading}
                className={cn("shrink-0", size === "small-long" ? "h-7 w-7" : "h-8 w-8")}
                title="Reset Chat"
            >
                <RotateCcw className={cn(size === "small-long" ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </ButtonV2>
        </CardHeader>
    )
}
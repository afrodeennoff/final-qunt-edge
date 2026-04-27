"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check, Link as LinkIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useI18n } from "@/locales/client"
import { useUserStore } from "@/store/user-store"

export function TraderProfileShareButton() {
  const t = useI18n()
  const user = useUserStore(state => state.user)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/trader/${user?.id}`
    : ''

  const canUseNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success(t('share.urlCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
      toast.error(t('share.error.description'))
    }
  }

  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        const shareData = {
          title: t('share.traderProfile.title'),
          text: t('share.traderProfile.description'),
          url: shareUrl,
        }
        await navigator.share(shareData)
        setOpen(false)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t('share.traderProfile.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('share.traderProfile.title')}</DialogTitle>
          <DialogDescription>
            {t('share.traderProfile.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('share.shareUrl')}</label>
            <div className="relative">
              <Input
                readOnly
                value={shareUrl}
                className="pr-10 font-mono text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/35 bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              {t('share.traderProfile.privacyNote')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            {t('share.cancel')}
          </Button>
          <Button
            onClick={handleNativeShare}
            className="w-full sm:w-auto"
          >
            {canUseNativeShare ? t('share.traderProfile.shareAction') : t('share.copyUrl')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

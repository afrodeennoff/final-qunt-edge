'use client'

import Link from 'next/link'
import { useCurrentLocale, useI18n } from '@/locales/client'
import { RouteStateShell } from '@/components/ui/route-state'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const t = useI18n()
  const locale = useCurrentLocale()

  return (
    <RouteStateShell
      eyebrow="Community"
      title="Post not found"
      description={t('community.post.notFound')}
      fullScreen={false}
      compact
      actions={
        <Button asChild className="rounded-full px-5">
          <Link href={`/${locale}/community`}>
            {t('common.back')}
          </Link>
        </Button>
      }
    >
      <div className="rounded-full border border-[oklch(0.65_0.22_260/0.08)] bg-[oklch(0.65_0.22_260/0.04)] px-5 py-1.5 text-3xl font-semibold tracking-[-0.06em] text-foreground">
        404
      </div>
    </RouteStateShell>
  )
}

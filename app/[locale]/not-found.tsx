import type { Metadata } from 'next'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { RouteStateShell } from '@/components/ui/route-state'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Qunt Edge',
  description: 'The page you are looking for does not exist.',
}

export default function LocaleNotFound() {
  return (
    <RouteStateShell
      eyebrow="Not found"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={
        <Button asChild className="rounded-full px-5">
          <Link href="/en">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div className="rounded-full border border-border/30 bg-background/40 px-6 py-2 text-4xl font-semibold tracking-[-0.06em] text-foreground">
          404
        </div>
      </div>
    </RouteStateShell>
  )
}

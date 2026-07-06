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
        <Button asChild className="px-5">
          <Link href="/en">
            <Home className="mr-2 h-4 w-4" />
            Go back home
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-2xl border-0 bg-card px-8 py-4 shadow-[inset_0_1px_0_rgba(0,0,0,0.03),0_16px_32px_-26px_rgba(0,0,0,0.62)]">
          <span className="text-5xl font-semibold tracking-tight text-primary">404</span>
        </div>
      </div>
    </RouteStateShell>
  )
}

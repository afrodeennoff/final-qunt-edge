'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function AuthenticationError({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 useEffect(() => {
 console.error('[Auth] Rendering error:', error)
 }, [error])

 return (
 <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground/95">
 <div className="text-center space-y-4">
 <p className="text-sm text-muted-foreground">Something went wrong loading this page.</p>
 <Button
 variant="outline"
 onClick={reset}
 className="rounded-full"
 >
 Try again
 </Button>
 </div>
 </main>
 )
}

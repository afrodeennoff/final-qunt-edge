'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resetPasswordForEmail } from '@/server/auth-password'
import Link from 'next/link'

export default function ForgotPasswordForm({ locale }: { locale: string }) {
 const [email, setEmail] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const [isSubmitted, setIsSubmitted] = useState(false)

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!email.trim()) return

 setIsLoading(true)
 try {
 await resetPasswordForEmail(email.trim())
 setIsSubmitted(true)
 } catch {
 setIsSubmitted(true)
 } finally {
 setIsLoading(false)
 }
 }

 if (isSubmitted) {
 return (
 <div className="flex min-h-screen items-center justify-center p-4">
 <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-lg sm:p-8">
 <div className="flex flex-col items-center gap-4 text-center">
 <h2 className="text-2xl font-semibold tracking-tight text-foreground">Check your email</h2>
 <p className="text-sm text-muted-foreground max-w-sm">
 If an account exists with <strong className="text-foreground">{email}</strong>, you will receive a password reset link shortly.
 </p>
 <Link
 href={`/${locale}/authentication`}
 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
 >
 Back to sign in
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex min-h-screen items-center justify-center p-4">
 <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-lg sm:p-8">
 <div className="flex flex-col gap-6">
 <div className="text-center">
 <h2 className="text-2xl font-semibold tracking-tight text-foreground">Forgot your password?</h2>
 <p className="text-sm text-muted-foreground mt-2">
 Enter your email and we&apos;ll send you a reset link.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
 <Input
 type="email"
 placeholder="Email address"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 autoComplete="email"
 data-testid="forgot-password-email"
 disabled={isLoading}
 className="h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
 />
 <Button
 type="submit"
 disabled={isLoading || !email.trim()}
 className="h-11 font-semibold px-5"
 >
 {isLoading ? 'Sending...' : 'Send reset link'}
 </Button>
 </form>

 <Link
 href={`/${locale}/authentication`}
 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline text-center"
 >
 Back to sign in
 </Link>
 </div>
 </div>
 </div>
 )
}

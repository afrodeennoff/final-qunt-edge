'use client'

import { useState } from 'react'
import { InputV2 } from '@/components/ui/v2'
import { ButtonV2 } from '@/components/ui/v2'
import { resetPasswordForEmail } from '@/server/auth-password'
import Link from 'next/link'

export default function ForgotPasswordPage() {
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
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground max-w-sm">
          If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <Link
          href="/authentication"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Forgot your password?</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputV2
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          data-testid="forgot-password-email"
          disabled={isLoading}
        />
        <ButtonV2 type="submit" disabled={isLoading || !email.trim()}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </ButtonV2>
      </form>

      <Link
        href="/authentication"
        className="text-sm text-primary underline-offset-4 hover:underline text-center"
      >
        Back to sign in
      </Link>
    </div>
  )
}

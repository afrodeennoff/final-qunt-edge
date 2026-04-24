'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updatePassword } from '@/server/auth-password'
import { getPasswordRequirements } from '@/lib/security/password-validation'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function ResetPasswordPage() {
 const router = useRouter()
 const params = useParams<{ locale: string }>()
 const locale = params.locale || 'en'
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [isSuccess, setIsSuccess] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const requirements = getPasswordRequirements(password)
 const passwordsMatch = password === confirmPassword && password.length > 0
 const allMet = requirements.every((r) => r.met) && passwordsMatch

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setError(null)

 if (password !== confirmPassword) {
 setError('Passwords do not match')
 return
 }

 setIsLoading(true)
 try {
 const result = await updatePassword(password)
 if (result.success) {
 setIsSuccess(true)
 setTimeout(() => router.push(`/${locale}/dashboard`), 2000)
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to update password')
 } finally {
 setIsLoading(false)
 }
 }

 if (isSuccess) {
 return (
 <div className="flex flex-col items-center gap-4 text-center">
 <h2 className="text-2xl font-semibold">Password updated!</h2>
 <p className="text-muted-foreground">
 Your password has been successfully updated. Redirecting to dashboard...
 </p>
 <Link href={`/${locale}/dashboard`} className="text-sm text-primary underline-offset-4 hover:underline">
 Go to dashboard
 </Link>
 </div>
 )
 }

 return (
 <div className="flex flex-col gap-6">
 <div className="text-center">
 <h2 className="text-2xl font-semibold">Set new password</h2>
 <p className="text-sm text-muted-foreground mt-2">
 Enter your new password below.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
 <div className="relative">
 <Input
 type={showPassword ? 'text' : 'password'}
 placeholder="New password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 autoComplete="new-password"
 data-testid="reset-password"
 disabled={isLoading}
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
 tabIndex={-1}
 >
 {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
 </button>
 </div>

 <Input
 type={showPassword ? 'text' : 'password'}
 placeholder="Confirm new password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 autoComplete="new-password"
 data-testid="reset-password-confirm"
 disabled={isLoading}
 />

 <div className="space-y-1">
 {requirements.map((req) => (
 <div
 key={req.key}
 className={`text-xs flex items-center gap-1.5 ${
 req.met ? 'text-success' : 'text-muted-foreground'
 }`}
 >
 <span>{req.met ? '✓' : '○'}</span>
 <span>{req.label}</span>
 </div>
 ))}
 {password.length > 0 && (
 <div className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? 'text-success' : 'text-muted-foreground'}`}>
 <span>{passwordsMatch ? '✓' : '○'}</span>
 <span>Passwords match</span>
 </div>
 )}
 </div>

 {error && (
 <p className="text-sm text-destructive">{error}</p>
 )}

 <Button type="submit" disabled={isLoading || !allMet}>
 {isLoading ? 'Updating...' : 'Update password'}
 </Button>
 </form>
 </div>
 )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updatePassword } from '@/server/auth-password'
import { getPasswordRequirements } from '@/lib/security/password-validation'
import Link from 'next/link'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

export default function ResetPasswordForm({ locale }: { locale: string }) {
 const router = useRouter()
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
 <div className="flex min-h-screen items-center justify-center p-4">
 <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
 <div className="flex flex-col items-center gap-4 text-center">
 <h2 className="text-2xl font-black tracking-tight text-foreground">Password updated!</h2>
 <p className="text-sm text-muted-foreground">
 Your password has been successfully updated. Redirecting to dashboard...
 </p>
 <Link href={`/${locale}/dashboard`} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
 Go to dashboard
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex min-h-screen items-center justify-center p-4">
 <div className="w-full max-w-md rounded-2xl border border-border/40 bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-8">
 <div className="flex flex-col gap-6">
 <div className="text-center">
 <h2 className="text-2xl font-black tracking-tight text-foreground">Set new password</h2>
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
 className="h-11 rounded-xl border border-border/40 bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
 className="h-11 rounded-xl border border-border/40 bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
 />

 <div className="space-y-1.5 rounded-xl border border-border/40 bg-card p-3 transition-colors duration-200 hover:border-border/50">
 {requirements.map((req) => (
 <div
 key={req.key}
 className={`text-xs flex items-center gap-2 ${
 req.met ? 'text-success' : 'text-muted-foreground'
 }`}
 >
 <span className="text-[10px]">{req.met ? '✓' : '○'}</span>
 <span>{req.label}</span>
 </div>
 ))}
 {password.length > 0 && (
 <div className={`text-xs flex items-center gap-2 ${passwordsMatch ? 'text-success' : 'text-muted-foreground'}`}>
 <span className="text-[10px]">{passwordsMatch ? '✓' : '○'}</span>
 <span>Passwords match</span>
 </div>
 )}
 </div>

 {error && (
 <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
 )}

 <Button
 type="submit"
 disabled={isLoading || !allMet}
 className="h-11 font-semibold px-5 active:scale-[0.97]"
 >
 {isLoading ? 'Updating...' : 'Update password'}
 </Button>
 </form>
 </div>
 </div>
 </div>
 )
}

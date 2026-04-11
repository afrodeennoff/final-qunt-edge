"use client"

import { signInWithDiscord, signInWithEmail, verifyOtp, signInWithGoogle, signInWithPasswordAction } from "@/server/auth"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '@/lib/security/password-validation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useI18n } from "@/locales/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator
} from "@/components/ui/input-otp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useAuthPreferenceStore } from "@/store/auth-preference-store"
import { useCurrentLocale } from "@/locales/client"

const formSchema = z.object({
    email: z.string().email(),
    password: z.union([
        z.string()
            .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Password must contain uppercase, lowercase, and a number'),
        z.literal('')
    ]).optional(),
})

const otpFormSchema = z.object({
    otp: z.string().length(6, "Verification code must be 6 digits"),
})

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

type AuthMethod = 'email' | 'discord' | 'google' | null

function normalizeNextPath(next: string | null): string | null {
    if (!next) return null
    const trimmed = next.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('//') || trimmed.startsWith('\\')) return null
    return `/${trimmed.replace(/^\/+/, '')}`
}

function withLocalePrefix(path: string, locale: string): string {
    const normalized = normalizeNextPath(path) || `/${path}`
    if (normalized.startsWith('/api/')) return normalized
    // Already locale-prefixed? Keep it.
    if (/^\/[a-z]{2}(?:-[a-z]{2})?(?:\/|$)/i.test(normalized)) return normalized
    return `/${locale}${normalized}`
}

function getQueryErrorMessage(errorCode: string | null, authErrorCode: string | null): string | null {
    if (errorCode === 'csrf') {
        return 'Google or Discord sign-in could not be verified. Please try again.'
    }

    if (errorCode === 'service_unavailable') {
        return 'Authentication is temporarily unavailable. Please try again in a few moments.'
    }

    if (errorCode === 'account_setup_failed') {
        return 'We signed you in, but dashboard setup could not finish because the database is unavailable.'
    }

    if (authErrorCode === 'session_invalid') {
        return 'Your session could not be restored. Please sign in again.'
    }

    return null
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isEmailSent, setIsEmailSent] = React.useState<boolean>(false)
    const [countdown, setCountdown] = React.useState<number>(0)
    const [isSubscription, setIsSubscription] = React.useState<boolean>(false)
    const [lookupKey, setLookupKey] = React.useState<string | null>(null)
    const [plan, setPlan] = React.useState<string | null>(null)
    const [referralCode, setReferralCode] = React.useState<string | null>(null)
    const [promoCode, setPromoCode] = React.useState<string | null>(null)
    const [authMethod, setAuthMethod] = React.useState<AuthMethod>(null)
    const [showOtpInput, setShowOtpInput] = React.useState<boolean>(false)
    const [nextUrl, setNextUrl] = React.useState<string | null>(null)
    const router = useRouter()
    const locale = useCurrentLocale()
    const { lastAuthPreference, setLastAuthPreference } = useAuthPreferenceStore()
    const [tab, setTab] = React.useState<'magic' | 'password'>(lastAuthPreference)
    const t = useI18n()

    const [alreadySignedIn, setAlreadySignedIn] = React.useState(false)

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const subscription = urlParams.get('subscription')
        const next = normalizeNextPath(urlParams.get('next'))
        const errorCode = urlParams.get('error')
        const authErrorCode = urlParams.get('auth_error')
        const referral = urlParams.get('referral')
        const promo_code = urlParams.get('promo_code')
        const lookup_key = urlParams.get('lookup_key')
        const plan_param = urlParams.get('plan')

        setIsSubscription(subscription === 'true')
        setLookupKey(lookup_key)
        setPlan(plan_param)
        setNextUrl(next)
        setAlreadySignedIn(urlParams.get('already') === 'signed-in')

        if (promo_code) {
            setPromoCode(promo_code)
        }

        if (referral) {
            setReferralCode(referral)
        } else {
            import('@/lib/referral-storage').then(({ getReferralCode }) => {
                const storedRef = getReferralCode()
                if (storedRef) {
                    setReferralCode(storedRef)
                }
            })
        }

        const queryErrorMessage = getQueryErrorMessage(errorCode, authErrorCode)
        if (queryErrorMessage) {
            toast.error(t('error'), { description: queryErrorMessage })
        }
    }, [t])

    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const otpForm = useForm<z.infer<typeof otpFormSchema>>({
        resolver: zodResolver(otpFormSchema),
        defaultValues: {
            otp: "",
        },
    })

    // Helper function to determine the next URL for redirect after authentication
    function getRedirectNextUrl(isSubscription: boolean, plan: string | null, nextUrl: string | null, lookupKey: string | null, referralCode: string | null, promoCode: string | null, locale: string): string | null {
        if (isSubscription) {
            const planPath = plan === 'team' ? '/api/whop/checkout-team' : '/api/whop/checkout'
            const searchParams = new URLSearchParams()
            if (lookupKey) searchParams.set('lookup_key', lookupKey)
            if (referralCode) searchParams.set('referral', referralCode)
            if (promoCode) searchParams.set('promo_code', promoCode)
            if (locale) searchParams.set('locale', locale)
            const qs = searchParams.toString()
            return `${planPath}${qs ? `?${qs}` : ''}`
        } else if (nextUrl) {
            return withLocalePrefix(nextUrl, locale)
        }
        return null
    }

    async function onSubmitEmail(values: z.infer<typeof formSchema>) {
        if (countdown > 0) return

        setIsLoading(true)
        setAuthMethod('email')
        try {
            const next = getRedirectNextUrl(isSubscription, plan, nextUrl, lookupKey, referralCode, promoCode, locale)
            const result = await signInWithEmail(values.email, next, locale)

            if (!result || !('success' in result) || !result.success) {
                const errorMsg = 'error' in (result || {}) ? (result as { error?: string }).error : null
                toast.error(t('error'), { description: errorMsg || t('auth.errors.signInFailed') })
                setAuthMethod(null)
                setIsLoading(false)
                return
            }

            setIsEmailSent(true)
            setShowOtpInput(true)
            setCountdown(15)
        } catch (error) {
            const parsedError = parseAuthError(error)
            toast.error(t('error'), { description: parsedError.message })
            setAuthMethod(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Helper function to parse Supabase errors and return user-friendly messages
    function parseAuthError(error: unknown): { message: string; field?: 'email' | 'password' } {
        if (!(error instanceof Error)) {
            return { message: t('auth.errors.signInFailed') }
        }

        const errorMessage = error.message.toLowerCase()
        
        // Check password-related errors first
        const passwordError = parsePasswordError(errorMessage)
        if (passwordError) {
            return passwordError
        }
        
        // Check email-related errors
        const emailError = parseEmailError(errorMessage)
        if (emailError) {
            return emailError
        }
        
        // Default: return the original error message but make it more user-friendly
        return {
            message: error.message || t('auth.errors.signInFailed')
        }
    }
    
    // Helper function to parse password-related errors
    function parsePasswordError(errorMessage: string): { message: string; field: 'password' } | null {
        // Password validation errors
        if (errorMessage.includes('password should contain') ||
            errorMessage.includes('password must contain') ||
            errorMessage.includes('password requirements')) {
            return {
                message: t('auth.errors.passwordTooWeak'),
                field: 'password'
            }
        }

        if (errorMessage.includes('password must be at least') ||
            errorMessage.includes('password is too short')) {
            return {
                message: t('auth.errors.passwordMinLength'),
                field: 'password'
            }
        }

        // Account exists but password is wrong or not set yet
        if (errorMessage.includes('invalid_credentials_or_no_password') ||
            errorMessage.includes('password is incorrect, or this account doesn\'t have a password set')) {
            return {
                message: t('auth.errors.invalidCredentialsOrNoPassword'),
                field: 'password'
            }
        }

        // Email/credential errors (generic - check this after specific cases)
        if (errorMessage.includes('invalid login credentials') ||
            errorMessage.includes('invalid_credentials') ||
            errorMessage.includes('invalid email or password')) {
            return {
                message: t('auth.errors.invalidCredentials'),
                field: 'password'
            }
        }

        return null
    }
    
    // Helper function to parse email-related errors
    function parseEmailError(errorMessage: string): { message: string; field: 'email' } | null {
        if (errorMessage.includes('email not confirmed') ||
            errorMessage.includes('email_not_confirmed')) {
            return {
                message: t('auth.errors.emailNotConfirmed'),
                field: 'email'
            }
        }

        if (errorMessage.includes('user not found') ||
            errorMessage.includes('no user found')) {
            return {
                message: t('auth.errors.userNotFound'),
                field: 'email'
            }
        }

        if (errorMessage.includes('already registered') ||
            errorMessage.includes('user already registered')) {
            return {
                message: t('auth.errors.accountExists'),
                field: 'email'
            }
        }

        // Account exists but no password set (created via magic link)
        // Password reset email has been sent
        if (errorMessage.includes('account_exists_no_password') ||
            errorMessage.includes('doesn\'t have a password set') ||
            errorMessage.includes('password reset email has been sent')) {
            return {
                message: t('auth.errors.accountExistsNoPasswordResetSent'),
                field: 'email'
            }
        }

        return null
    }

    async function onSubmitPassword(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setAuthMethod('email')
        try {
            const next = getRedirectNextUrl(isSubscription, plan, nextUrl, lookupKey, referralCode, promoCode, locale)
            const result = await signInWithPasswordAction(values.email, values.password || '', next, locale)

            if (!result.success) {
                const parsedError = parseAuthError(new Error(result.error || 'Authentication failed'))
                toast.error(t('error'), { description: parsedError.message })
                setAuthMethod(null)
                setIsLoading(false)
                return
            }

            toast.success(t('success'), { description: t('auth.signIn') })
            window.location.href = nextUrl ? withLocalePrefix(nextUrl, locale) : `/${locale}/dashboard`
            setLastAuthPreference('password')
        } catch (error) {
            const parsedError = parseAuthError(error)

            if (parsedError.field === 'password') {
                form.setError('password', {
                    type: 'manual',
                    message: parsedError.message
                })
            } else if (parsedError.field === 'email') {
                form.setError('email', {
                    type: 'manual',
                    message: parsedError.message
                })
            }

            toast.error(t('error'), {
                description: parsedError.message,
            })
            setAuthMethod(null)
        } finally {
            setIsLoading(false)
        }
    }

    // Signup handled via magic link; no password signup flow here

    async function onSubmitOtp(values: z.infer<typeof otpFormSchema>) {
        setIsLoading(true)
        try {
            const email = form.getValues('email')
            const result = await verifyOtp(email, values.otp)

            if (!result || !('success' in result) || !result.success) {
                const errorMsg = 'error' in (result || {}) ? (result as { error?: string }).error : null
                toast.error("Error", { description: errorMsg || "Failed to verify code" })
                setIsLoading(false)
                return
            }

            toast.success("Successfully verified. Redirecting...", {
                description: "Successfully verified. Redirecting...",
            })
            window.location.href = nextUrl ? withLocalePrefix(nextUrl, locale) : `/${locale}/dashboard`
        } catch (error) {
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to verify code",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function onSubmitDiscord(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setAuthMethod('discord')

        try {
            let next = nextUrl;
            if (isSubscription) {
                const planParam = plan === 'team' ? '/api/whop/checkout-team' : '/api/whop/checkout';
                const searchParams = new URLSearchParams();
                if (lookupKey) searchParams.set('lookup_key', lookupKey);
                if (referralCode) searchParams.set('referral', referralCode);
                if (promoCode) searchParams.set('promo_code', promoCode);
                if (locale) searchParams.set('locale', locale);

                const queryString = searchParams.toString();
                next = `${planParam}${queryString ? `?${queryString}` : ''}`;
            } else if (nextUrl) {
                next = withLocalePrefix(nextUrl, locale)
            }
            await signInWithDiscord(next, locale)
        } catch (error) {
            const parsedError = parseAuthError(error)
            toast.error(t('error'), { description: parsedError.message })
            setAuthMethod(null)
            setIsLoading(false)
        }
    }

    async function onSubmitGoogle(event: React.SyntheticEvent) {
        event.preventDefault()
        setIsLoading(true)
        setAuthMethod('google')

        try {
            let next = nextUrl;
            if (isSubscription) {
                const planParam = plan === 'team' ? '/api/whop/checkout-team' : '/api/whop/checkout';
                const searchParams = new URLSearchParams();
                if (lookupKey) searchParams.set('lookup_key', lookupKey);
                if (referralCode) searchParams.set('referral', referralCode);
                if (promoCode) searchParams.set('promo_code', promoCode);
                if (locale) searchParams.set('locale', locale);

                const queryString = searchParams.toString();
                next = `${planParam}${queryString ? `?${queryString}` : ''}`;
            } else if (nextUrl) {
                next = withLocalePrefix(nextUrl, locale)
            }
            await signInWithGoogle(next, locale)
        } catch (error) {
            const parsedError = parseAuthError(error)
            toast.error(t('error'), { description: parsedError.message })
            setAuthMethod(null)
            setIsLoading(false)
        }
    }

    // Helper to find the appropriate mail client URL for a domain
    function getMailClientUrl(domain: string): string | null {
        const domainLower = domain.toLowerCase()

        // Domain mappings for mail clients
        const mailClientDomains: Record<string, string> = {
            'gmail.com': 'https://mail.google.com',
            'outlook.com': 'https://outlook.live.com',
            'hotmail.com': 'https://outlook.live.com',
            'live.com': 'https://outlook.live.com',
            'msn.com': 'https://outlook.live.com',
            'office365.com': 'https://outlook.live.com',
            'proton.me': 'https://mail.proton.me',
            'protonmail.com': 'https://mail.proton.me',
            'pm.me': 'https://mail.proton.me',
            'icloud.com': 'https://www.icloud.com/mail',
            'me.com': 'https://www.icloud.com/mail',
            'mac.com': 'https://www.icloud.com/mail',
            'yahoo.com': 'https://mail.yahoo.com',
            'aol.com': 'https://mail.aol.com',
            'zoho.com': 'https://mail.zoho.com',
        }

        // Check for direct match or partial domain match
        for (const [mailDomain, mailUrl] of Object.entries(mailClientDomains)) {
            if (domainLower.includes(mailDomain)) {
                return mailUrl
            }
        }

        return null
    }

    function openMailClient() {
        const email = form.getValues('email')
        const domain = email.split('@')[1] ?? ''

        const mailClientUrl = getMailClientUrl(domain)

        if (mailClientUrl) {
            window.open(mailClientUrl, '_blank', 'noopener,noreferrer')
        } else {
            // Default to mailto: for unknown domains
            window.location.href = `mailto:${email}`
        }
    }

    return (
        <div className={cn("grid gap-5", className)} {...props}>
            {alreadySignedIn && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15">
                            <svg className="h-4 w-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-success">You&apos;re already signed in</p>
                            <p className="text-xs text-muted-foreground">Redirecting you to your dashboard...</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="shrink-0 bg-success/20 text-success hover:bg-success/30 border-success/30"
                        onClick={() => router.push(nextUrl ? withLocalePrefix(nextUrl, locale) : `/${locale}/dashboard`)}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            )}
            <Tabs value={tab} onValueChange={(v) => { setTab(v as 'magic' | 'password'); setLastAuthPreference(v as 'magic' | 'password'); }}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl border border-border/60 bg-card/50 p-1">
                    <TabsTrigger
                        value="magic"
                        className="h-9 rounded-lg text-xs font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                    >
                        <span className="truncate">{t('auth.tabs.magic')}</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="password"
                        className="relative h-9 rounded-lg text-xs font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                    >
                        <span className="truncate">{t('auth.tabs.password')}</span>
                        <Badge
                            variant="secondary"
                            className="absolute -right-1.5 -top-1.5 border border-border/70 bg-accent/70 px-1 py-0 text-[8px] text-foreground"
                        >
                            {t('auth.new')}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="magic" className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitEmail)} className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                placeholder={t('auth.emailPlaceholder')}
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading || (isEmailSent || authMethod === 'discord' || authMethod === 'google')}
                                                className="h-11 rounded-xl border-border/70 bg-card/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!isEmailSent ? (
                                <Button 
                                    disabled={isLoading || countdown > 0 || authMethod === 'discord' || authMethod === 'google'}
                                    type="submit"
                                    className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                                >
                                    {isLoading && authMethod === 'email' && (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t('auth.signInWithEmail')}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        className="h-11 w-full rounded-xl border-border/70 bg-card/50 text-foreground hover:bg-accent/70 hover:text-foreground"
                                        onClick={openMailClient}
                                        disabled={authMethod === 'discord' || authMethod === 'google'}
                                    >
                                        <Icons.envelope className="mr-2 h-4 w-4" />
                                        {t('auth.openMailbox')}
                                    </Button>
                                    <Button 
                                        type="submit"
                                        variant="ghost"
                                        className="h-10 w-full rounded-xl text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                        disabled={countdown > 0 || authMethod === 'discord' || authMethod === 'google'}
                                    >
                                        {countdown > 0 ? (
                                            `${t('auth.resendIn')} ${countdown}s`
                                        ) : (
                                            t('auth.resendEmail')
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                    {showOtpInput && (
                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="mt-4 space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="block text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                {t('auth.verificationCode')}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex justify-center">
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="gap-2"
                                                    >
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                        </InputOTPGroup>
                                                        <InputOTPSeparator />
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-center" />
                                        </FormItem>
                                    )}
                                />
                                <Button 
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {t('auth.verifyCode')}
                                </Button>
                            </form>
                        </Form>
                    )}
                </TabsContent>

                <TabsContent value="password" className="mt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitPassword)} className="grid gap-3">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="email_password"
                                                placeholder={t('auth.emailPlaceholder')}
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                className="h-11 rounded-xl border-border/70 bg-card/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                id="password_login"
                                                placeholder={t('auth.passwordPlaceholder')}
                                                type="password"
                                                autoComplete="current-password"
                                                disabled={isLoading}
                                                className="h-11 rounded-xl border-border/70 bg-card/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Link
                                href={withLocalePrefix("/authentication/forgot-password", locale)}
                                className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                            <Button 
                                disabled={isLoading}
                                type="submit"
                                className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                {isLoading && authMethod === 'email' && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {t('auth.signInWithPassword')}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.14em]">
                    <span className="bg-card px-2 text-muted-foreground">
                        {t('auth.continueWith')}
                    </span>
                </div>
            </div>

            <Button 
                variant="outline"
                type="button"
                disabled={isLoading || authMethod === 'email'}
                onClick={onSubmitDiscord}
                className="h-11 rounded-xl border-border/70 bg-card/50 text-foreground hover:bg-accent/70 hover:text-foreground"
            >
                {isLoading && authMethod === 'discord' ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.discord className="mr-2 h-4 w-4" />
                )}{" "}
                {t('auth.signInWithDiscord')}
            </Button>
            <Button 
                variant="outline"
                type="button"
                disabled={isLoading || authMethod === 'email'}
                onClick={onSubmitGoogle}
                className="h-11 rounded-xl border-border/70 bg-card/50 text-foreground hover:bg-accent/70 hover:text-foreground"
            >
                {isLoading && authMethod === 'google' ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                )}{" "}
                {t('auth.signInWithGoogle')}
            </Button>
        </div>
    )
}

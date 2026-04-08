'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUserStore } from '@/store/user-store'
import { useCurrentLocale } from '@/locales/client'

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * AuthTimeout component handles automatic sign-out after 10 minutes of inactivity.
 * Inactivity is defined by a lack of user interaction (mouse, keyboard, scroll, touch).
 *
 * Uses the browser-side Supabase client to clear the session, then navigates
 * to the authentication page with a session_expired query parameter so the user
 * understands why they were logged out.
 */
export function AuthTimeout() {
    const user = useUserStore(state => state.supabaseUser)
    const resetUser = useUserStore(state => state.resetUser)
    const locale = useCurrentLocale()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleLogout = useCallback(async () => {
        if (user) {
            resetUser()
            try {
                const { createClient } = await import('@/lib/supabase')
                const supabase = createClient()
                await supabase.auth.signOut()
            } catch {
                // Session cleanup failed — navigate anyway
            }
            window.location.href = `/${locale}/authentication?error=session_expired`
        }
    }, [user, resetUser, locale])

    const resetTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT_MS)
    }, [handleLogout])

    useEffect(() => {
        if (!user) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            return
        }

        // Set initial timer
        resetTimer()

        // Events that reset the inactivity timer
        const events: Array<{ name: keyof DocumentEventMap; options?: AddEventListenerOptions }> = [
            { name: 'mousedown' },
            { name: 'mousemove' },
            { name: 'keypress' },
            { name: 'scroll', options: { passive: true } },
            { name: 'touchstart', options: { passive: true } },
        ]
        const activityHandler = () => resetTimer()

        events.forEach(({ name, options }) => {
            document.addEventListener(name, activityHandler, options)
        })

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            events.forEach(({ name, options }) => {
                document.removeEventListener(name, activityHandler, options)
            })
        }
    }, [user, resetTimer])

    return null
}

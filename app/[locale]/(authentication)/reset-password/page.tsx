'use client'

import ResetPasswordForm from './reset-password-form'
import { useParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale || 'en'
  return <ResetPasswordForm locale={locale} />
}

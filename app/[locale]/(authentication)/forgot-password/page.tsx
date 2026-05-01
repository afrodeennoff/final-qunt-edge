import ForgotPasswordForm from './forgot-password-form'
import { getStaticParams } from '@/locales/server'
import { setStaticParamsLocale } from 'next-international/server'

export function generateStaticParams() {
 return getStaticParams()
}

export default async function ForgotPasswordPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 setStaticParamsLocale(locale)
 return <ForgotPasswordForm locale={locale} />
}

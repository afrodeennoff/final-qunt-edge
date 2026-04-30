import ResetPasswordForm from './reset-password-form'
import { getStaticParams } from '@/locales/server'
import { setStaticParamsLocale } from 'next-international/server'

export function generateStaticParams() {
 return getStaticParams()
}

export default async function ResetPasswordPage({
 params,
}: {
 params: Promise<{ locale: string }>
}) {
 const { locale } = await params
 setStaticParamsLocale(locale)
 return <ResetPasswordForm locale={locale} />
}

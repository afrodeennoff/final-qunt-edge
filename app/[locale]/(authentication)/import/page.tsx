import { redirect } from 'next/navigation'

type ImportRedirectPageProps = {
 params: Promise<{
 locale: string
 }>
}

export default async function ImportRedirectPage({ params }: ImportRedirectPageProps) {
 const { locale } = await params
 redirect(`/${locale}/authentication`)
}

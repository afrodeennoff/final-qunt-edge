'use client'

import AuthenticationClientLayout from './client-layout'

export default function AuthenticationLayoutShell({
 children,
}: {
 children: React.ReactNode
}) {
 return <AuthenticationClientLayout>{children}</AuthenticationClientLayout>
}

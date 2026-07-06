'use client'
import React from 'react'

import AuthenticationClientLayout from './client-layout'

export default function AuthenticationLayoutShell({
 children,
}: {
 children: React.ReactNode
}) {
 return <AuthenticationClientLayout>{children}</AuthenticationClientLayout>
}

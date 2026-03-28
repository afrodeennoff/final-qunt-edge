'use client'

import dynamic from "next/dynamic"

const AuthenticationClientLayout = dynamic(() => import("./client-layout"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function AuthenticationLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticationClientLayout>{children}</AuthenticationClientLayout>
}

'use client'

import dynamic from "next/dynamic"

const AuthenticationPageClient = dynamic(() => import("./page-client"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-background" />,
})

export default function AuthenticationPageShell() {
  return <AuthenticationPageClient />
}

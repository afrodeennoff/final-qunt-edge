import { createClient } from "@/server/auth"
import { redirect } from "next/navigation"
import { AdminClientLayout } from "./admin-client-layout"
import { isAdminUser } from "@/server/authz"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${locale}/authentication?next=%2F${locale}%2Fadmin`)
  }

  if (!isAdminUser(user)) {
    redirect(`/${locale}/dashboard`)
  }

  return <AdminClientLayout>{children}</AdminClientLayout>
}

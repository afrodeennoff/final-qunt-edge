"use client"

import { Mail, BarChart, UserPlus, Send, Building2, Tags, BookOpen, Shield } from "lucide-react"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"
import { useCurrentLocale } from "@/locales/client"

export function SidebarNav() {
  const locale = useCurrentLocale()

  const routes: UnifiedSidebarItem[] = [
    {
      href: `/${locale}/admin/propfirms`,
      label: "Prop Firms",
      icon: <Building2 className="size-4" />,
    },
    {
      href: `/${locale}/admin/coupons`,
      label: "Coupons",
      icon: <Tags className="size-4" />,
    },
    {
      href: `/${locale}/admin/blogs`,
      label: "Blog",
      icon: <BookOpen className="size-4" />,
    },
    {
      href: `/${locale}/admin/reviews`,
      label: "Reviews",
      icon: <Shield className="size-4" />,
    },
    {
      href: `/${locale}/admin/newsletter-builder`,
      label: "Newsletter Builder",
      icon: <Mail className="size-4" />,
    },
    {
      href: `/${locale}/admin/weekly-recap`,
      label: "Weekly Recap",
      icon: <BarChart className="size-4" />,
    },
    {
      href: `/${locale}/admin/welcome-email`,
      label: "Welcome Email",
      icon: <UserPlus className="size-4" />,
    },
    {
      href: `/${locale}/admin/send-email`,
      label: "Send Email",
      icon: <Send className="size-4" />,
    },
  ]

  return (
    <UnifiedSidebar
      items={routes}
    />
  )
}

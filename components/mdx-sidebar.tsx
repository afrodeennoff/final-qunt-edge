"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { NAV_ICON_SIZE } from "@/lib/constants/sidebar"
import { ChevronRight, FileText, Book, Code, Layout, Zap, Shield, Cpu, Database as DatabaseIcon } from "lucide-react"
import { UnifiedSidebar, UnifiedSidebarItem } from "@/components/ui/unified-sidebar"

interface DocGroup {
  title: string
  items: DocItem[]
}

interface DocItem {
  title: string
  href: string
  icon?: React.ReactNode
}

const docGroups: DocGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/introduction", icon: <FileText className={NAV_ICON_SIZE} /> },
      { title: "Quick Start", href: "/docs/quick-start", icon: <Zap className={NAV_ICON_SIZE} /> },
      { title: "Installation", href: "/docs/installation", icon: <Layout className={NAV_ICON_SIZE} /> },
    ]
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Dashboard", href: "/docs/dashboard", icon: <Layout className={NAV_ICON_SIZE} /> },
      { title: "Widgets", href: "/docs/widgets", icon: <Code className={NAV_ICON_SIZE} /> },
      { title: "Data Management", href: "/docs/data-management", icon: <DatabaseIcon className={NAV_ICON_SIZE} /> },
    ]
  },
  {
    title: "Features",
    items: [
      { title: "Trading Analysis", href: "/docs/trading-analysis", icon: <Book className={NAV_ICON_SIZE} /> },
      { title: "Performance Tracking", href: "/docs/performance-tracking", icon: <FileText className={NAV_ICON_SIZE} /> },
      { title: "Account Management", href: "/docs/account-management", icon: <Shield className={NAV_ICON_SIZE} /> },
      { title: "Integration", href: "/docs/integration", icon: <Cpu className={NAV_ICON_SIZE} /> },
    ]
  },
]

export function MdxSidebar() {
  const pathname = usePathname()
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentGroup = docGroups.find(group =>
      group.items.some(item => item.href === pathname)
    )
    if (currentGroup) {
      setExpandedGroups(new Set([currentGroup.title]))
    }
  }, [pathname])

  const toggleGroup = (title: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedGroups(newExpanded)
  }

  const sidebarItems: UnifiedSidebarItem[] = docGroups.flatMap(group =>
    group.items.map(item => ({
      ...item,
      label: item.title,
      group: group.title,
      icon: item.icon || <FileText className={NAV_ICON_SIZE} />
    }))
  )

  return (
    <UnifiedSidebar
      items={sidebarItems}
      showSubscription={false}
    />
  )
}

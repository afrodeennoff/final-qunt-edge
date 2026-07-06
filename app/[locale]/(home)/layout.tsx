import React from 'react'
import LocaleLayoutInner from "./locale-layout-inner"

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <LocaleLayoutInner>{children}</LocaleLayoutInner>
}

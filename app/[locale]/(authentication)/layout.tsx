import { Suspense } from "react";
import type { Metadata } from "next";
import AuthenticationLayoutShell from "./layout-shell";

export const metadata: Metadata = {
 robots: {
 index: false,
 follow: false,
 },
};

export default function AuthenticationLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <Suspense>
   <AuthenticationLayoutShell>{children}</AuthenticationLayoutShell>
  </Suspense>
 );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import AuthenticationLayoutShell from "./layout-shell";

export const metadata: Metadata = {
 robots: {
 index: false,
 follow: false,
 },
};

function AuthFallback() {
 return (
  <div className="flex flex-1 flex-col items-center justify-center bg-background min-h-[60vh]">
   <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
  </div>
 );
}

export default function AuthenticationLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <Suspense fallback={<AuthFallback />}>
   <AuthenticationLayoutShell>{children}</AuthenticationLayoutShell>
  </Suspense>
 );
}

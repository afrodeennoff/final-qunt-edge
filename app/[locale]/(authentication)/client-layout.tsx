'use client'
import React from 'react'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentLocale } from "@/locales/client";
import { RootProviders } from "@/components/providers/root-providers";
interface AuthenticationLayoutProps {
 children: React.ReactNode;
}

export default function AuthenticationLayout({
 children,
}: AuthenticationLayoutProps) {
 const router = useRouter();
 const locale = useCurrentLocale();

 useEffect(() => {
 if (typeof window === 'undefined') return

 try {
 const hash = window.location.hash;
 const params = new URLSearchParams(hash.slice(1)); // Remove the # and parse

 if (params.get('error')) {
 const errorDescription = params.get('error_description');
 toast.error("Authentication Error", {
 description: errorDescription?.replace(/\+/g, ' ') ||"An error occurred during authentication",
 });

 // Clear the hash after showing the toast
 router.replace(`/${locale}/authentication`);
 }
 } catch {

 }
 }, [locale, router]);

   return (
     <div className="min-h-dvh w-full bg-background">
       <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(oklch(0.15_0.01_260)_0.8px,transparent_1px)] bg-[length:4px_4px] opacity-15" />
       <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
         <div className="h-[500px] w-[500px] rounded-full bg-primary/[0.03] blur-2xl animate-[pulse_8s_ease-in-out_infinite]" />
       </div>
        <div className="relative z-10 pt-8 md:pt-16">
          <RootProviders>{children}</RootProviders>
        </div>
     </div>
   );

}

import { PublicRootProviders } from "@/components/providers/root-providers";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicRootProviders>
      {children}
    </PublicRootProviders>
  );
}

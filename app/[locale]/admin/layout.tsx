import { createClient } from "@/server/auth";
import { redirect } from "next/navigation";
import { AdminClientLayout } from "./admin-client-layout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/en/authentication?next=%2Fen%2Fadmin");
  }

  const isAdmin =
    user.id === process.env.ALLOWED_ADMIN_USER_ID ||
    user.id === process.env.ADMIN_USER_ID;

  if (!isAdmin) {
    redirect("/en/dashboard");
  }

  return <AdminClientLayout user={user}>{children}</AdminClientLayout>;
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/features/auth/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata = {
  title: { template: "%s — Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authoritative gate at the server-render layer (mirrors the proxy). Uses the
  // getUser() call we already make, so this adds no extra round-trip. Ensures no
  // admin page ever renders to a logged-out or non-allowlisted user even if the
  // proxy matcher is ever misconfigured.
  if (!isAdminEmail(user?.email)) {
    redirect("/auth/login?error=not_admin");
  }

  return (
    <div className="flex bg-teal-soft/25 min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar email={user?.email ?? null} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

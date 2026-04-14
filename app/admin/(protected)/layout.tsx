import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  return children;
}

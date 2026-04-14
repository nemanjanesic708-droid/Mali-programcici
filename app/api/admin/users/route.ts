import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { listAdminUsers } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminUser = await getAdminSessionUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listAdminUsers();
  return NextResponse.json({ users });
}

import { NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { listPremiumInterestEntries } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminUser = await getAdminSessionUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await listPremiumInterestEntries();
  return NextResponse.json({ entries });
}

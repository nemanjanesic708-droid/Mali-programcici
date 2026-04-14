import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionUser } from "@/lib/admin-auth";
import { updateUserVerifiedStatus } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const adminUser = await getAdminSessionUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const verified = body?.verified;

  if (typeof verified !== "boolean") {
    return NextResponse.json({ error: "Field 'verified' mora biti boolean." }, { status: 400 });
  }

  const user = await updateUserVerifiedStatus(params.id, verified);
  return NextResponse.json({ user });
}

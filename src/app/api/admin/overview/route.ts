import { NextRequest, NextResponse } from "next/server";
import { getAdminOverviewData } from "@/lib/adminOverview";
import { isAdminUser } from "@/lib/adminAccess";
import { attachAuthCookies, getRequestSessionUser } from "@/lib/supabaseAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, refreshedSession } = await getRequestSessionUser(request);

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const overview = await getAdminOverviewData();

  return attachAuthCookies(NextResponse.json(overview), refreshedSession);
}

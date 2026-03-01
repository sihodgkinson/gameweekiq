import { notFound, redirect } from "next/navigation";
import { isAdminUser } from "@/lib/adminAccess";
import { sanitizeNextPath } from "@/lib/authNextPath";
import { getServerSessionUser } from "@/lib/supabaseAuth";

export async function requireAdminPageAccess(nextPath: string): Promise<void> {
  const user = await getServerSessionUser();

  if (!user?.id) {
    const sanitizedPath = sanitizeNextPath(nextPath, "/dashboard");
    redirect(`/signin?next=${encodeURIComponent(sanitizedPath)}`);
  }

  if (!isAdminUser(user)) {
    notFound();
  }
}

import { redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/lib/server/adminPageAccess";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  await requireAdminPageAccess("/dashboard/admin");
  redirect("/dashboard/admin/overview");
}

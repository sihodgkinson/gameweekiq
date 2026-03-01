import { AdminOverviewClient } from "@/components/common/AdminOverviewClient";
import { requireAdminPageAccess } from "@/lib/server/adminPageAccess";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  await requireAdminPageAccess("/dashboard/admin");
  return <AdminOverviewClient />;
}

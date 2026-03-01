import { SupabaseAuthUser } from "@/lib/supabaseAuth";

function parseAdminEmails(rawValue: string | undefined): Set<string> {
  if (!rawValue) return new Set();

  return new Set(
    rawValue
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0)
  );
}

export function getAdminEmailSet(): Set<string> {
  return parseAdminEmails(process.env.ADMIN_USER_EMAILS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailSet().has(email.trim().toLowerCase());
}

export function isAdminUser(user: Pick<SupabaseAuthUser, "email"> | null | undefined): boolean {
  return isAdminEmail(user?.email);
}

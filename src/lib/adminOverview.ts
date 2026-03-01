import { logMetric } from "@/lib/metrics";
import { listDistinctLeagueIds } from "@/lib/userLeagues";

interface PublicTableCount {
  tableName: string;
  rows: number;
}

interface PublicTableCountResult extends PublicTableCount {
  source: "public";
}

export interface AdminOverviewData {
  users: number;
  uniqueTrackedLeagues: number;
  cacheRows: number;
  totalRows: number;
  rowsBySource: Array<PublicTableCountResult | { tableName: "auth.users"; rows: number; source: "auth" }>;
}

const COUNTED_PUBLIC_TABLES = [
  "fpl_cache",
  "user_leagues",
  "league_backfill_jobs",
  "request_rate_limits",
  "waitlist_signups",
] as const;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;
  return { url, key };
}

function parseCountFromContentRange(headerValue: string | null): number {
  if (!headerValue) return 0;
  const slashIndex = headerValue.lastIndexOf("/");
  if (slashIndex === -1) return 0;
  const tail = headerValue.slice(slashIndex + 1).trim();
  if (tail === "*") return 0;
  const parsed = Number(tail);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

async function countPublicTableRows(tableName: string): Promise<number> {
  const config = getSupabaseConfig();
  if (!config) return 0;

  const endpoint = `${config.url}/rest/v1/${tableName}?select=*`;
  const res = await fetch(endpoint, {
    method: "HEAD",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });

  let count = 0;
  if (res.ok) {
    count = parseCountFromContentRange(res.headers.get("content-range"));
  } else {
    const fallbackRes = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    });
    if (!fallbackRes.ok) {
      logMetric("admin.overview.table_count", {
        table: tableName,
        success: false,
        status: fallbackRes.status,
      });
      return 0;
    }
    count = parseCountFromContentRange(fallbackRes.headers.get("content-range"));
  }

  logMetric("admin.overview.table_count", {
    table: tableName,
    success: true,
    rows: count,
  });

  return count;
}

async function countAuthUsers(): Promise<number> {
  const config = getSupabaseConfig();
  if (!config) return 0;

  const perPage = 200;
  let page = 1;
  let total = 0;

  while (true) {
    const res = await fetch(
      `${config.url}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
      {
        method: "GET",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      logMetric("admin.overview.auth_user_count", {
        success: false,
        status: res.status,
        page,
      });
      return total;
    }

    const payload = (await res.json()) as { users?: Array<{ id: string }> };
    const users = Array.isArray(payload.users) ? payload.users : [];
    total += users.length;

    if (users.length < perPage) {
      break;
    }

    page += 1;
    if (page > 1000) {
      // Hard stop guard against unexpected pagination loops.
      break;
    }
  }

  logMetric("admin.overview.auth_user_count", {
    success: true,
    rows: total,
  });

  return total;
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const [publicCounts, users, uniqueTrackedLeagueIds] = await Promise.all([
    Promise.all(
      COUNTED_PUBLIC_TABLES.map(async (tableName) => ({
        tableName,
        rows: await countPublicTableRows(tableName),
      }))
    ),
    countAuthUsers(),
    listDistinctLeagueIds(),
  ]);

  const cacheRows = publicCounts.find((entry) => entry.tableName === "fpl_cache")?.rows ?? 0;
  const publicRows = publicCounts.reduce((sum, entry) => sum + entry.rows, 0);
  const totalRows = publicRows + users;

  return {
    users,
    uniqueTrackedLeagues: uniqueTrackedLeagueIds.length,
    cacheRows,
    totalRows,
    rowsBySource: [
      ...publicCounts.map((entry) => ({ ...entry, source: "public" as const })),
      {
        tableName: "auth.users",
        rows: users,
        source: "auth" as const,
      },
    ],
  };
}

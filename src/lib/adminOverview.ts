import { logMetric } from "@/lib/metrics";
import { listDistinctLeagueIds } from "@/lib/userLeagues";

interface PublicTableCount {
  tableName: string;
  rows: number;
}

interface PublicTableCountResult extends PublicTableCount {
  source: "public";
}

export interface AdminUserSummary {
  id: string;
  name: string | null;
  email: string | null;
  authMethod: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  linkedLeagues: number;
  linkedLeagueDetails: Array<{
    leagueId: number;
    leagueName: string | null;
  }>;
}

export interface AdminLeagueSummary {
  leagueId: number;
  leagueName: string | null;
  linkedUsers: number;
  linkedRows: number;
}

export interface AdminOverviewData {
  users: number;
  uniqueTrackedLeagues: number;
  cacheRows: number;
  totalRows: number;
  rowsBySource: Array<PublicTableCountResult | { tableName: "auth.users"; rows: number; source: "auth" }>;
  usersTable: AdminUserSummary[];
  leaguesTable: AdminLeagueSummary[];
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

interface AuthUserListResult {
  total: number;
  users: Array<{
    id: string;
    email?: string | null;
    created_at?: string | null;
    last_sign_in_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
    identities?: Array<{ provider?: string | null }> | null;
  }>;
}

function extractUserName(metadata: Record<string, unknown> | null | undefined): string | null {
  if (!metadata) return null;

  const direct = ["full_name", "name", "display_name"]
    .map((key) => metadata[key])
    .find((value) => typeof value === "string" && value.trim().length > 0) as string | undefined;
  if (direct) return direct.trim();

  const firstName = typeof metadata.first_name === "string" ? metadata.first_name.trim() : "";
  const lastName = typeof metadata.last_name === "string" ? metadata.last_name.trim() : "";
  const joined = `${firstName} ${lastName}`.trim();
  return joined.length > 0 ? joined : null;
}

function toTitleCase(value: string): string {
  if (!value) return value;
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function extractAuthMethod(user: AuthUserListResult["users"][number]): string | null {
  const providers: string[] = [];

  if (Array.isArray(user.identities)) {
    for (const identity of user.identities) {
      if (typeof identity?.provider === "string" && identity.provider.trim().length > 0) {
        providers.push(identity.provider.trim());
      }
    }
  }

  const appProviders = user.app_metadata?.providers;
  if (Array.isArray(appProviders)) {
    for (const provider of appProviders) {
      if (typeof provider === "string" && provider.trim().length > 0) {
        providers.push(provider.trim());
      }
    }
  }

  const deduped = [...new Set(providers.map((provider) => provider.toLowerCase()))];
  if (deduped.length === 0) return null;

  return deduped.map(toTitleCase).join(", ");
}

async function listAuthUsers(): Promise<AuthUserListResult> {
  const config = getSupabaseConfig();
  if (!config) return { total: 0, users: [] };

  const perPage = 200;
  let page = 1;
  let total = 0;
  const users: AuthUserListResult["users"] = [];

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
      logMetric("admin.overview.auth_user_list", {
        success: false,
        status: res.status,
        page,
      });
      return { total, users };
    }

    const payload = (await res.json()) as {
      users?: AuthUserListResult["users"];
    };
    const pageUsers = Array.isArray(payload.users) ? payload.users : [];
    users.push(...pageUsers);
    total += pageUsers.length;

    if (pageUsers.length < perPage) break;
    page += 1;
    if (page > 1000) break;
  }

  logMetric("admin.overview.auth_user_list", {
    success: true,
    rows: total,
  });

  return { total, users };
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

interface UserLeagueLinkRow {
  user_id: string | null;
  league_id: number | null;
  league_name: string | null;
}

async function listUserLeagueLinks(): Promise<UserLeagueLinkRow[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  const pageSize = 1000;
  const maxRows = 10_000;
  let offset = 0;
  const links: UserLeagueLinkRow[] = [];

  while (true) {
    const res = await fetch(
      `${config.url}/rest/v1/user_leagues?select=user_id,league_id,league_name&order=created_at.desc&limit=${pageSize}&offset=${offset}`,
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
      logMetric("admin.overview.user_league_links", {
        success: false,
        status: res.status,
        offset,
      });
      return links;
    }

    const rows = (await res.json()) as UserLeagueLinkRow[];
    links.push(...rows);

    if (rows.length < pageSize) break;
    offset += pageSize;
    if (links.length >= maxRows) break;
  }

  logMetric("admin.overview.user_league_links", {
    success: true,
    rows: links.length,
  });

  return links;
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const [publicCounts, authUserList, userLeagueLinks, uniqueTrackedLeagueIds] = await Promise.all([
    Promise.all(
      COUNTED_PUBLIC_TABLES.map(async (tableName) => ({
        tableName,
        rows: await countPublicTableRows(tableName),
      }))
    ),
    listAuthUsers(),
    listUserLeagueLinks(),
    listDistinctLeagueIds(),
  ]);

  const users = authUserList.total;
  const cacheRows = publicCounts.find((entry) => entry.tableName === "fpl_cache")?.rows ?? 0;
  const publicRows = publicCounts.reduce((sum, entry) => sum + entry.rows, 0);
  const totalRows = publicRows + users;

  const leagueCountByUserId = new Map<string, number>();
  const leagueDetailsByUserId = new Map<string, Map<number, string | null>>();
  const leagueAggregation = new Map<number, { linkedUsers: Set<string>; linkedRows: number; leagueName: string | null }>();

  for (const link of userLeagueLinks) {
    const userId = typeof link.user_id === "string" && link.user_id.length > 0 ? link.user_id : null;
    const leagueId = Number.isInteger(link.league_id) && (link.league_id ?? 0) > 0 ? (link.league_id as number) : null;
    if (!leagueId) continue;

    if (userId) {
      leagueCountByUserId.set(userId, (leagueCountByUserId.get(userId) ?? 0) + 1);
      const perUserLeagues = leagueDetailsByUserId.get(userId) ?? new Map<number, string | null>();
      const existingName = perUserLeagues.get(leagueId) ?? null;
      const nextName = existingName || link.league_name || null;
      perUserLeagues.set(leagueId, nextName);
      leagueDetailsByUserId.set(userId, perUserLeagues);
    }

    const current = leagueAggregation.get(leagueId) ?? {
      linkedUsers: new Set<string>(),
      linkedRows: 0,
      leagueName: null as string | null,
    };

    current.linkedRows += 1;
    if (userId) current.linkedUsers.add(userId);
    if (!current.leagueName && link.league_name) current.leagueName = link.league_name;
    leagueAggregation.set(leagueId, current);
  }

  const usersTable: AdminUserSummary[] = authUserList.users
    .map((user) => ({
      id: user.id,
      name: extractUserName(user.user_metadata),
      email: user.email ?? null,
      authMethod: extractAuthMethod(user),
      createdAt: user.created_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
      linkedLeagues: leagueCountByUserId.get(user.id) ?? 0,
      linkedLeagueDetails: [
        ...((leagueDetailsByUserId.get(user.id) ?? new Map<number, string | null>()).entries()),
      ]
        .map(([leagueId, leagueName]) => ({ leagueId, leagueName }))
        .sort((a, b) => a.leagueId - b.leagueId),
    }))
    .sort((a, b) => {
      const aTs = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTs = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTs - aTs;
    });

  const leaguesTable: AdminLeagueSummary[] = [...leagueAggregation.entries()]
    .map(([leagueId, aggregate]) => ({
      leagueId,
      leagueName: aggregate.leagueName,
      linkedUsers: aggregate.linkedUsers.size,
      linkedRows: aggregate.linkedRows,
    }))
    .sort((a, b) => b.linkedUsers - a.linkedUsers || b.linkedRows - a.linkedRows || a.leagueId - b.leagueId);

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
    usersTable,
    leaguesTable,
  };
}

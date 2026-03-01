"use client";

import * as React from "react";
import useSWR from "swr";
import {
  Coins,
  Database,
  Loader2,
  RefreshCw,
  Table2,
} from "lucide-react";
import { AppShell, useAppShellNavigation } from "@/components/common/AppShell";
import type { AppSidebarSection } from "@/components/common/AppSidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminOverviewResponse {
  users: number;
  uniqueTrackedLeagues: number;
  cacheRows: number;
  totalRows: number;
  rowsBySource: {
    tableName: string;
    rows: number;
    source: "public" | "auth";
  }[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return (await res.json()) as AdminOverviewResponse;
};

function formatCount(value: number | null | undefined): string {
  if (!Number.isFinite(value ?? NaN)) return "--";
  return new Intl.NumberFormat("en-GB").format(value as number);
}

function OverviewStatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: number | null | undefined;
  loading: boolean;
}) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-28" />
      ) : (
        <p className="text-4xl font-mono font-semibold leading-none">{formatCount(value)}</p>
      )}
    </Card>
  );
}

export function AdminOverviewClient() {
  const { useDrawerNav, mobileSidebarOpen, setMobileSidebarOpen } = useAppShellNavigation();

  const { data, error, isLoading } = useSWR<AdminOverviewResponse>("/api/admin/overview", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  const sidebarSections: AppSidebarSection[] = [
    {
      key: "leagueiq",
      label: "LeagueIQ",
      items: [
        {
          key: "tables",
          label: "Tables",
          href: "/dashboard/leagueiq/tables",
          icon: Table2,
          active: false,
          placeholder: false,
        },
        {
          key: "transfers",
          label: "Transfers",
          href: "#",
          icon: RefreshCw,
          active: false,
          placeholder: true,
        },
        {
          key: "chips",
          label: "Chips",
          href: "#",
          icon: Coins,
          active: false,
          placeholder: true,
        },
      ],
    },
    {
      key: "admin",
      label: "Admin",
      items: [
        {
          key: "overview",
          label: "Overview",
          href: "/dashboard/admin/overview",
          icon: Database,
          active: true,
          placeholder: false,
        },
      ],
    },
  ];

  return (
    <AppShell
      title="Overview"
      sections={sidebarSections}
      useDrawerNav={useDrawerNav}
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarOpenChange={setMobileSidebarOpen}
      headerRight={
        <div className="hidden sm:inline-flex h-8 items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 text-xs font-medium text-blue-700 dark:text-blue-300">
          <Database className="h-3.5 w-3.5" />
          <span>Read-only</span>
        </div>
      }
    >
      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          Failed to load admin overview data.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewStatCard
          label="Users"
          value={data?.users}
          loading={isLoading}
        />
        <OverviewStatCard
          label="Leagues"
          value={data?.uniqueTrackedLeagues}
          loading={isLoading}
        />
        <OverviewStatCard
          label="Cache Rows"
          value={data?.cacheRows}
          loading={isLoading}
        />
        <OverviewStatCard
          label="Total Rows"
          value={data?.totalRows}
          loading={isLoading}
        />
      </div>

      <Card className="gap-3 p-4 sm:min-h-0 sm:flex-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Row Counts By Source</h2>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>

        <div className="min-h-0 sm:flex-1 sm:overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Table</TableHead>
                  <TableHead>Schema</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.rowsBySource?.map((row) => (
                  <TableRow key={row.tableName}>
                    <TableCell className="font-mono text-xs sm:text-sm">{row.tableName}</TableCell>
                    <TableCell>{row.source}</TableCell>
                    <TableCell className="text-right font-mono">{formatCount(row.rows)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </AppShell>
  );
}

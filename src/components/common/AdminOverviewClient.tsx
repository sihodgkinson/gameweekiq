"use client";

import * as React from "react";
import useSWR from "swr";
import {
  Coins,
  Database,
  RefreshCw,
  Table2,
} from "lucide-react";
import { AppShell, useAppShellNavigation } from "@/components/common/AppShell";
import type { AppSidebarSection } from "@/components/common/AppSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardStatCard, DashboardStatGrid } from "@/components/common/DashboardStatCard";
import { DashboardTableCard } from "@/components/common/DashboardTableCard";

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

      <DashboardStatGrid>
        <DashboardStatCard
          label="Users"
          value={formatCount(data?.users)}
          loading={isLoading}
        />
        <DashboardStatCard
          label="Leagues"
          value={formatCount(data?.uniqueTrackedLeagues)}
          loading={isLoading}
        />
        <DashboardStatCard
          label="Cache Rows"
          value={formatCount(data?.cacheRows)}
          loading={isLoading}
        />
        <DashboardStatCard
          label="Total Rows"
          value={formatCount(data?.totalRows)}
          loading={isLoading}
        />
      </DashboardStatGrid>

      <DashboardTableCard loading={isLoading}>
        {!isLoading ? (
            <Table>
              <TableHeader className="bg-background [&_th]:font-semibold">
                <TableRow className="text-foreground hover:bg-transparent">
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
          ) : null}
      </DashboardTableCard>
    </AppShell>
  );
}

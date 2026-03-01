"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Database,
  Layers,
  Loader2,
  Menu,
  Settings,
  Shield,
  Table2,
  Users,
  X,
} from "lucide-react";
import { AccountMenu } from "@/components/common/AccountMenu";
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
import { cn } from "@/lib/utils";

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
  icon,
  loading,
}: {
  label: string;
  value: number | null | undefined;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-muted-foreground">{icon}</div>
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
  const [useDrawerNav, setUseDrawerNav] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const { data, error, isLoading } = useSWR<AdminOverviewResponse>("/api/admin/overview", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const evaluateDrawerMode = () => {
      const isNarrowMobile = window.matchMedia("(max-width: 639px)").matches;
      const isPhoneLandscape = window.matchMedia(
        "(orientation: landscape) and (pointer: coarse) and (max-height: 540px)"
      ).matches;
      setUseDrawerNav(isNarrowMobile || isPhoneLandscape);
    };

    evaluateDrawerMode();
    window.addEventListener("resize", evaluateDrawerMode);
    window.addEventListener("orientationchange", evaluateDrawerMode);

    return () => {
      window.removeEventListener("resize", evaluateDrawerMode);
      window.removeEventListener("orientationchange", evaluateDrawerMode);
    };
  }, []);

  React.useEffect(() => {
    if (!useDrawerNav) {
      setMobileSidebarOpen(false);
    }
  }, [useDrawerNav]);

  const leagueIQSidebarItems = [
    {
      key: "tables",
      label: "Tables",
      href: "/dashboard",
      icon: Table2,
      active: false,
      placeholder: false,
    },
  ];

  const adminSidebarItems = [
    {
      key: "overview",
      label: "Overview",
      href: "/dashboard/admin/overview",
      icon: Shield,
      active: true,
    },
  ];

  return (
    <div className="flex min-h-svh bg-background text-foreground sm:h-svh sm:overflow-hidden">
      <aside
        className={cn(
          "hidden border-r border-border bg-muted/20 sm:flex sm:w-64 sm:flex-col sm:transition-[width] sm:duration-200",
          useDrawerNav && "sm:hidden"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-3">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.svg" alt="GameweekIQ logo" className="h-7 w-7 object-contain dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.svg" alt="GameweekIQ logo" className="hidden h-7 w-7 object-contain dark:block" />
            <span className="text-sm font-medium">GameweekIQ</span>
          </Link>
        </div>

        <div className="mt-4 px-3">
          <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">LeagueIQ</p>
        </div>

        <nav className="mt-1 flex flex-col gap-1 px-3">
          {leagueIQSidebarItems.map((item) => {
            const Icon = item.icon;
            const itemClasses = cn(
              "inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors duration-150",
              item.active
                ? "bg-muted/70 text-foreground"
                : item.placeholder
                  ? "text-foreground"
                  : "text-foreground hover:bg-muted/70 hover:text-foreground",
              item.placeholder && "pointer-events-none cursor-default opacity-50"
            );

            if (item.placeholder) {
              return (
                <div key={item.key} className={itemClasses} aria-disabled="true">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <Link key={item.key} href={item.href} className={itemClasses}>
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 px-3">
          <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground">Admin</p>
        </div>

        <nav className="mt-1 flex flex-col gap-1 px-3">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors duration-150",
                  item.active ? "bg-muted/70 text-foreground" : "text-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-1 flex flex-1 flex-col gap-3 overflow-y-auto px-3" />

        <div className="space-y-4 px-3 pb-3" data-sidebar-interactive="true">
          <button
            type="button"
            disabled
            className="inline-flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-foreground opacity-50 disabled:pointer-events-none"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <AccountMenu className="w-full" />
        </div>
      </aside>

      {useDrawerNav && mobileSidebarOpen ? (
        <>
          <button
            type="button"
            className={cn("fixed inset-0 z-40 bg-background/70", !useDrawerNav && "sm:hidden")}
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-[320px] flex-col gap-4 border-r border-border bg-background px-4 pb-4 shadow-2xl",
              !useDrawerNav && "sm:hidden"
            )}
          >
            <div className="mx-[-16px] flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-light.svg" alt="GameweekIQ logo" className="h-7 w-7 object-contain dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-dark.svg" alt="GameweekIQ logo" className="hidden h-7 w-7 object-contain dark:block" />
                <span className="text-sm font-medium">GameweekIQ</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="pb-1 text-xs font-medium text-muted-foreground">LeagueIQ</p>
            </div>

            <nav className="flex flex-col gap-1">
              {leagueIQSidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors duration-150",
                      item.active ? "bg-muted/70 text-foreground" : "text-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div>
              <p className="pb-1 text-xs font-medium text-muted-foreground">Admin</p>
            </div>

            <nav className="flex flex-col gap-1">
              {adminSidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors duration-150",
                      item.active ? "bg-muted/70 text-foreground" : "text-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4" data-sidebar-interactive="true">
              <button
                type="button"
                disabled
                className="inline-flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-foreground opacity-50 disabled:pointer-events-none"
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <AccountMenu className="w-full" />
            </div>
          </aside>
        </>
      ) : null}

      <div className="mobile-landscape-scroll-shell flex min-h-svh flex-1 flex-col sm:h-svh sm:min-h-0 sm:overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border border-border",
                !useDrawerNav && "sm:hidden"
              )}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">Admin Overview</h1>
          </div>
          <div className="hidden sm:inline-flex h-8 items-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Shield className="h-3.5 w-3.5" />
            <span>Read-only</span>
          </div>
        </header>

        <main className="mobile-landscape-scroll-main flex min-h-0 flex-1 flex-col gap-4 p-4 sm:gap-4 sm:overflow-hidden sm:p-4 md:p-4">
          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              Failed to load admin overview data.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewStatCard
              label="Users"
              value={data?.users}
              icon={<Users className="h-4 w-4" />}
              loading={isLoading}
            />
            <OverviewStatCard
              label="Leagues"
              value={data?.uniqueTrackedLeagues}
              icon={<Shield className="h-4 w-4" />}
              loading={isLoading}
            />
            <OverviewStatCard
              label="Cache Rows"
              value={data?.cacheRows}
              icon={<Database className="h-4 w-4" />}
              loading={isLoading}
            />
            <OverviewStatCard
              label="Total Rows"
              value={data?.totalRows}
              icon={<Layers className="h-4 w-4" />}
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
        </main>
      </div>
    </div>
  );
}

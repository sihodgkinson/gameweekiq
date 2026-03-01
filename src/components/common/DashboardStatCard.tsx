"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps extends Omit<React.ComponentProps<typeof Card>, "children"> {
  label: string;
  value?: React.ReactNode;
  loading?: boolean;
  valueClassName?: string;
  headerRight?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardStatCard({
  label,
  value,
  loading = false,
  className,
  valueClassName,
  headerRight,
  loadingFallback,
  children,
  ...cardProps
}: DashboardStatCardProps) {
  return (
    <Card className={cn("gap-3 p-4", className)} {...cardProps}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {headerRight}
      </div>
      {loading ? (
        loadingFallback ?? <Skeleton className="h-10 w-28" />
      ) : (
        children ?? (
          <p className={cn("text-4xl font-mono font-semibold leading-none", valueClassName)}>{value}</p>
        )
      )}
    </Card>
  );
}

interface DashboardStatGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardStatGrid({ children, className }: DashboardStatGridProps) {
  return (
    <div className={cn("dashboard-widget-grid grid grid-cols-2 gap-4 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  className?: string;
  valueClassName?: string;
}

export function DashboardStatCard({
  label,
  value,
  loading = false,
  className,
  valueClassName,
}: DashboardStatCardProps) {
  return (
    <Card className={cn("gap-3 p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-28" />
      ) : (
        <p className={cn("text-4xl font-mono font-semibold leading-none", valueClassName)}>{value}</p>
      )}
    </Card>
  );
}

interface DashboardStatGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardStatGrid({ children, className }: DashboardStatGridProps) {
  return <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}

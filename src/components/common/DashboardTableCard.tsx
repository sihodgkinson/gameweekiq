"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardTableCardProps {
  title?: string;
  loading?: boolean;
  headerRight?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  fillHeight?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DashboardTableCard({
  title,
  loading = false,
  headerRight,
  loadingFallback,
  fillHeight = true,
  className,
  children,
}: DashboardTableCardProps) {
  const showHeader = Boolean(title || headerRight);

  return (
    <Card
      className={cn(
        "bg-background p-4",
        fillHeight && "flex h-full min-h-0 flex-col overflow-hidden sm:flex-1",
        showHeader && "gap-3",
        className
      )}
    >
      {showHeader ? (
        <div className="flex items-center justify-between">
          {title ? <h2 className="text-sm font-medium">{title}</h2> : <div />}
          {headerRight}
        </div>
      ) : null}

      <div className={cn("min-h-0", fillHeight && "flex-1")}>
        {loading ? (
          loadingFallback ?? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

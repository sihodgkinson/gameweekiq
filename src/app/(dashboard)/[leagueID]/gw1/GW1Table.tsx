"use client";

import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import { ResponsiveInfoCard } from "@/components/ui/responsive-info-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardTableCard } from "@/components/common/DashboardTableCard";

export interface GW1Standing {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  movement: number;
  gwPoints: number;
  totalPoints: number;
  benchPoints: number;
  gwPlayers: {
    name: string;
    points: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
  }[];
  benchPlayers: {
    name: string;
    points: number;
  }[];
}

interface GW1TableProps {
  standings: GW1Standing[];
  isLoading: boolean;
  hasError: boolean;
}

function TableRowSkeleton() {
  return (
    <TableRow className="animate-pulse hover:bg-transparent">
      <TableCell className="p-2 sm:p-4">
        <Skeleton className="h-4 w-6" />
      </TableCell>
      <TableCell className="p-2 sm:p-4">
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </TableCell>
      <TableCell className="hidden p-2 md:table-cell sm:p-4">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell className="p-2 text-right sm:p-4">
        <Skeleton className="ml-auto h-4 w-10" />
      </TableCell>
      <TableCell className="hidden p-2 text-right sm:table-cell sm:p-4">
        <Skeleton className="ml-auto h-4 w-8" />
      </TableCell>
      <TableCell className="p-2 text-right sm:p-4">
        <Skeleton className="ml-auto h-4 w-10" />
      </TableCell>
    </TableRow>
  );
}

export function GW1Table({ standings, isLoading, hasError }: GW1TableProps) {
  if (hasError) return <div>Error loading GW1 table</div>;

  return (
    <DashboardTableCard className="mobile-landscape-table" fillHeight>
      <Table className="w-full table-auto text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background [&_th]:h-10 [&_th]:!py-0 [&_th]:font-semibold">
          <TableRow className="text-foreground hover:bg-transparent">
            <TableHead className="w-3/100 p-2 text-left sm:p-4">Pos</TableHead>
            <TableHead className="w-25/100 p-2 text-left sm:p-4">Team</TableHead>
            <TableHead className="hidden w-22/100 p-2 text-left md:table-cell sm:p-4">Manager</TableHead>
            <TableHead className="w-10/100 p-2 text-right sm:p-4">GW</TableHead>
            <TableHead className="hidden w-10/100 p-2 text-right sm:table-cell sm:p-4">
              Bench
            </TableHead>
            <TableHead className="w-10/100 p-2 text-right sm:p-4">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
            : standings.length > 0
              ? standings.map((entry) => (
                  <TableRow
                    key={entry.entry}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="p-2 font-mono sm:p-4">
                      <div className="flex items-center gap-1">
                        <span>{entry.rank}</span>
                        {entry.movement > 0 && (
                          <ChevronUp className="h-4 w-4 text-green-600" />
                        )}
                        {entry.movement < 0 && (
                          <ChevronDown className="h-4 w-4 text-red-600" />
                        )}
                        {entry.movement === 0 && (
                          <Minus className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="p-2 sm:p-4">
                      <div className="font-medium">{entry.entry_name}</div>
                      <div className="block text-xs text-muted-foreground md:hidden">
                        {entry.player_name}
                      </div>
                    </TableCell>

                    <TableCell className="hidden p-2 md:table-cell sm:p-4">{entry.player_name}</TableCell>

                    <TableCell className="p-2 text-right font-mono sm:p-4">
                      {entry.gwPoints > 0 ? (
                        <ResponsiveInfoCard
                          trigger={
                            <button className="cursor-pointer underline decoration-dotted">
                              {entry.gwPoints}
                            </button>
                          }
                          content={
                            entry.gwPlayers.length > 0 ? (
                              <ul className="space-y-1 text-sm">
                                {entry.gwPlayers.map((p, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center justify-between gap-4 text-muted-foreground"
                                  >
                                    <span className="pr-2">
                                      {p.name}
                                      {p.isCaptain && " (C)"}
                                      {p.isViceCaptain && " (VC)"}
                                    </span>
                                    <span className="font-mono">{p.points}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">No data</p>
                            )
                          }
                          className="max-w-[90vw] rounded-sm border bg-popover p-3 text-popover-foreground shadow-sm"
                        />
                      ) : (
                        <span>{entry.gwPoints}</span>
                      )}
                    </TableCell>

                    <TableCell className="hidden p-2 text-right font-mono sm:table-cell sm:p-4">
                      {entry.benchPoints > 0 ? (
                        <ResponsiveInfoCard
                          trigger={
                            <button className="cursor-pointer underline decoration-dotted">
                              {entry.benchPoints}
                            </button>
                          }
                          content={
                            entry.benchPlayers.length > 0 ? (
                              <ul className="space-y-1 text-sm">
                                {entry.benchPlayers.map((p, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center justify-between gap-4 text-muted-foreground"
                                  >
                                    <span className="pr-2">{p.name}</span>
                                    <span className="font-mono">{p.points}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground">No bench players</p>
                            )
                          }
                          className="max-w-[90vw] rounded-sm border bg-popover p-3 text-popover-foreground shadow-sm"
                        />
                      ) : (
                        <span>{entry.benchPoints}</span>
                      )}
                    </TableCell>

                    <TableCell className="p-2 text-right font-mono sm:p-4">{entry.totalPoints}</TableCell>
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 text-center text-muted-foreground">
                      No standings available
                    </TableCell>
                  </TableRow>
                )}
        </TableBody>
      </Table>
    </DashboardTableCard>
  );
}

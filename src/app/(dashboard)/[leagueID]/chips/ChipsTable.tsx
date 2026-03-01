"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { DashboardTableCard } from "@/components/common/DashboardTableCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ChipsResponse {
  team: string;
  manager: string;
  chip: string | null;
}

function formatChipName(chip: string | null): string {
  if (!chip) return "—";
  switch (chip) {
    case "wildcard":
      return "Wildcard";
    case "3xc":
      return "Triple Captain";
    case "bboost":
      return "Bench Boost";
    case "freehit":
      return "Free Hit";
    default:
      return chip;
  }
}

function ChipRowSkeleton() {
  return (
    <TableRow className="animate-pulse hover:bg-transparent">
      <TableCell>
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export function ChipsTab({
  leagueId,
  currentGw,
}: {
  leagueId: number;
  currentGw: number;
}) {
  const searchParams = useSearchParams();
  const gw = Number(searchParams.get("gw")) || currentGw;

  const { data, error } = useSWR<ChipsResponse[]>(
    `/api/chips?leagueId=${leagueId}&gw=${gw}&currentGw=${currentGw}`,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  if (error) return <div>Error loading chips</div>;

  return (
    <DashboardTableCard className="mobile-landscape-table" fillHeight>
      <Table className="w-full table-auto text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background [&_th]:h-10 [&_th]:!py-0 [&_th]:font-semibold">
          <TableRow className="text-foreground hover:bg-transparent">
            <TableHead className="w-1/3 text-left">Team</TableHead>
            <TableHead className="hidden w-1/3 text-left sm:table-cell">
              Manager
            </TableHead>
            <TableHead className="w-1/3 text-left">Chip Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data
            ? [...Array(5)].map((_, i) => <ChipRowSkeleton key={i} />)
            : data.map((row, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium">{row.team}</div>
                    <div className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                      {row.manager}
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {row.manager}
                  </TableCell>

                  <TableCell>
                    {row.chip ? (
                      <span>{formatChipName(row.chip)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </DashboardTableCard>
  );
}

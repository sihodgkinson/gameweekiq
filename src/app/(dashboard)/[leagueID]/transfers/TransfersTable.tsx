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

interface TransfersResponse {
  manager: string;
  team: string;
  transfers: {
    in: string;
    out: string;
  }[];
}

function TransferRowSkeleton() {
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
        <Skeleton className="mb-1 h-4 w-40" />
        <Skeleton className="h-4 w-36" />
      </TableCell>
    </TableRow>
  );
}

export function TransfersTab({
  leagueId,
  currentGw,
}: {
  leagueId: number;
  currentGw: number;
}) {
  const searchParams = useSearchParams();
  const gw = Number(searchParams.get("gw")) || currentGw;

  const { data, error } = useSWR<TransfersResponse[]>(
    `/api/transfers?leagueId=${leagueId}&gw=${gw}&currentGw=${currentGw}`,
    fetcher,
    { refreshInterval: 0, revalidateOnFocus: false }
  );

  if (error) return <div>Error loading transfers</div>;

  return (
    <DashboardTableCard className="mobile-landscape-table" fillHeight>
      <Table className="w-full table-auto text-sm">
        <TableHeader className="sticky top-0 z-10 bg-background [&_th]:h-10 [&_th]:!py-0 [&_th]:font-semibold">
          <TableRow className="text-foreground hover:bg-transparent">
            <TableHead className="w-1/3 text-left">Team</TableHead>
            <TableHead className="hidden w-1/3 text-left sm:table-cell">
              Manager
            </TableHead>
            <TableHead className="w-1/3 text-left">Transfers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!data
            ? [...Array(5)].map((_, i) => <TransferRowSkeleton key={i} />)
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
                    {row.transfers.length > 0 ? (
                      <div className="space-y-1">
                        {row.transfers.map((t, i) => (
                          <div key={i}>
                            {t.out} {"->"} {t.in}
                          </div>
                        ))}
                      </div>
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

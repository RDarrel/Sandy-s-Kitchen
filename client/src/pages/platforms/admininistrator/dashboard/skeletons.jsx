import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rows = [0, 1, 2, 3, 4];

export const UpcomingBookingsSkeleton = () => (
  <div role="status" aria-label="Loading upcoming bookings" className="flex flex-1 flex-col">
    <div aria-hidden="true" className="flex min-h-11 flex-wrap items-center gap-4 border-b py-3">
      <Skeleton className="h-2.5 w-12" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2.5 w-12" /><Skeleton className="h-2.5 w-3" /></div>
      ))}
    </div>
    <div aria-hidden="true" className="divide-y">
      {rows.map((row) => (
        <div key={row} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:grid-cols-[44px_minmax(0,1fr)_88px] sm:gap-4 lg:h-[84px] lg:py-2.5">
          <div className="overflow-hidden rounded-lg border">
            <div className="flex h-[18px] items-center justify-center bg-muted/60"><Skeleton className="h-1.5 w-5" /></div>
            <div className="flex h-8 items-center justify-center"><Skeleton className="h-5 w-5" /></div>
          </div>
          <div className="min-w-0 space-y-1.5">
            <Skeleton className={`h-3.5 max-w-full ${row % 2 ? "w-40" : "w-48"}`} />
            <Skeleton className="h-2.5 w-28 max-w-full" />
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="flex w-[88px] items-center gap-1.5"><Skeleton className="size-3 shrink-0" /><Skeleton className="h-2 w-12" /></div>
              <div className="flex items-center gap-1.5"><Skeleton className="size-3 shrink-0" /><Skeleton className="h-2 w-14" /></div>
            </div>
          </div>
          <Skeleton className="h-5 w-16 justify-self-end rounded-md" />
        </div>
      ))}
    </div>
  </div>
);

export const TopSellingItemsSkeleton = () => (
  <div role="status" aria-label="Loading top-selling items" className="flex flex-1 flex-col">
    <div aria-hidden="true" className="flex min-h-11 items-center justify-between gap-2 border-b py-3">
      <Skeleton className="h-2.5 w-32 max-w-full" /><Skeleton className="h-2.5 w-9" />
    </div>
    <div aria-hidden="true" className="divide-y">
      {rows.map((row) => (
        <div key={row} className="flex items-center gap-3 py-4 lg:h-[84px]">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Skeleton className="h-3 w-24 max-w-full" /><Skeleton className="h-3 w-14" />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Skeleton className="h-1 flex-1 rounded-full" /><Skeleton className="h-2 w-8 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const InventoryOverviewSkeleton = () => (
  <div role="status" aria-label="Loading inventory overview" className="px-5">
    <div aria-hidden="true" className="flex min-h-11 flex-wrap items-center gap-4 border-b py-3">
      {[0, 1].map((item) => <div key={item} className="flex items-center gap-1.5"><Skeleton className="size-1.5 rounded-full" /><Skeleton className="h-2.5 w-16" /><Skeleton className="h-2.5 w-3" /></div>)}
    </div>
    <div aria-hidden="true" className="divide-y">
      {rows.map((row) => (
        <div key={row} className="py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex h-5 items-center"><Skeleton className="h-3.5 w-28 max-w-full" /></div>
              <div className="mt-0.5 flex h-4 items-center"><Skeleton className="h-2.5 w-24 max-w-full" /></div>
            </div>
            <div className="shrink-0">
              <div className="flex h-5 items-center justify-end"><Skeleton className="h-3.5 w-10" /></div>
              <div className="mt-0.5 flex h-4 items-center justify-end"><Skeleton className="h-2.5 w-14" /></div>
            </div>
          </div>
          <Skeleton className="mt-1.5 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const IncomingDeliveriesSkeleton = () => (
  <div role="status" aria-label="Loading incoming deliveries">
    <div aria-hidden="true">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableHead className="pl-5 text-xs">Supplier / Order</TableHead>
            <TableHead className="text-xs">Expected</TableHead>
            <TableHead className="text-right text-xs">Status</TableHead>
            <TableHead className="pr-5 text-right text-xs">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row} className="h-16 hover:bg-transparent last:border-b-0">
              <TableCell className="pl-5"><Skeleton className="h-3 w-28" /><Skeleton className="mt-1.5 h-2 w-20" /></TableCell>
              <TableCell><Skeleton className="h-3 w-20" /></TableCell>
              <TableCell><Skeleton className="ml-auto h-5 w-16 rounded-md" /></TableCell>
              <TableCell className="pr-5"><Skeleton className="ml-auto h-3 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

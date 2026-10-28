import { Skeleton } from "@/components/ui/skeleton";

const panel = "min-w-0 rounded-2xl border border-border bg-card shadow-sm";
const barHeights = [45, 65, 52, 78, 60, 88, 70, 56, 92, 74];

function AnalyticsSkeleton({ monthCount = 10 }) {
  return (
    <div role="status" aria-label="Loading POS analytics" className="space-y-5">
      <span className="sr-only">Loading POS analytics…</span>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className={`relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card px-4 pb-3 pt-3.5 shadow-sm ${index === 0 ? "border-primary/25" : "border-border"}`}>
            <span className={`absolute left-4 top-0 h-0.5 w-8 rounded-b-full ${index >= 2 ? "bg-chart-3/70" : "bg-primary/70"}`} />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex h-[19.5px] items-center"><Skeleton className="h-3.5 w-32 max-w-full" /></div>
                <div className="mt-0.5 flex h-[16.5px] items-center"><Skeleton className="h-2.5 w-40 max-w-full" /></div>
              </div>
              <Skeleton className="size-8 shrink-0 rounded-lg" />
            </div>
            <div className="mt-2.5 flex h-[35px] items-center"><Skeleton className={`h-7 max-w-full ${index === 0 ? "w-20" : "w-48"}`} /></div>
            <div className="mt-auto flex min-h-8 items-center pt-2"><Skeleton className="h-2.5 w-44 max-w-full" /></div>
          </div>
        ))}
      </div>

      <div aria-hidden="true" className={`${panel} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 space-y-1.5">
              <Skeleton className="h-5 w-32 max-w-full" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
          </div>
          <div className="inline-flex w-fit shrink-0 gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
            <Skeleton className="h-8 w-[86px]" />
            <Skeleton className="h-8 w-[113px]" />
          </div>
        </div>
        <div className="min-w-0 w-full px-5 pb-3">
          <div className="mb-4 flex h-[18px] items-center justify-between gap-3">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex h-[240px] w-full gap-3 sm:h-[260px]">
            <div className="flex w-9 shrink-0 flex-col justify-between pb-[30px] pt-2.5">
              {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-2.5 w-7" />)}
            </div>
            <div className="relative flex min-w-0 flex-1 gap-2 pt-2.5 sm:gap-4">
              <div className="absolute inset-x-0 bottom-[30px] top-2.5 flex flex-col justify-between">
                {Array.from({ length: 5 }, (_, index) => <div key={index} className="border-t border-dashed border-border" />)}
              </div>
              {Array.from({ length: Math.max(monthCount, 1) }, (_, index) => (
                <div key={index} className="relative flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-1 items-end justify-center">
                    <Skeleton className="w-full max-w-11 rounded-b-none rounded-t" style={{ height: `${barHeights[index % barHeights.length]}%` }} />
                  </div>
                  <div className="flex h-[30px] items-center justify-center"><Skeleton className="h-2.5 w-6 max-w-full" /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="grid items-stretch gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className={panel}>
            <div className="flex items-start justify-between gap-3 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 space-y-1.5">
                  <Skeleton className="h-5 w-40 max-w-full" />
                  <Skeleton className="h-3 w-72 max-w-full" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto px-5 pb-3">
              <table className="w-full min-w-[410px] text-left text-xs">
                <thead>
                  <tr className="border-y border-border/60 bg-muted/35">
                    <th className="w-9 py-2.5 pl-2"><Skeleton className="h-4 w-3" /></th>
                    <th className="py-2.5"><Skeleton className="h-4 w-16" /></th>
                    <th className="px-3 py-2.5"><Skeleton className="ml-auto h-4 w-14" /></th>
                    <th className="px-3 py-2.5"><Skeleton className="ml-auto h-4 w-20" /></th>
                    <th className="w-28 py-2.5 pr-2"><Skeleton className="ml-auto h-4 w-20" /></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }, (_, row) => (
                    <tr key={row} className="border-b border-border/45 last:border-0">
                      <td className="py-3.5 pl-2"><Skeleton className="size-5" /></td>
                      <td className="py-3.5 pr-2"><Skeleton className={`h-3.5 max-w-full ${row % 2 ? "w-24" : "w-32"}`} /></td>
                      <td className="px-3 py-3.5"><Skeleton className="ml-auto h-3.5 w-7" /></td>
                      <td className="px-3 py-3.5"><Skeleton className="ml-auto h-3.5 w-16" /></td>
                      <td className="py-3.5 pr-2"><div className="flex items-center justify-end gap-2"><Skeleton className="h-3 w-8" /><Skeleton className="h-1.5 w-12 rounded-full" /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;

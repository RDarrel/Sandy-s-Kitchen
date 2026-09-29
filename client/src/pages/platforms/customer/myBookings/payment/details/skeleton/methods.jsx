import { Skeleton } from "@/components/ui/skeleton";
import SectionHeaderSkeleton from "./sectionHeader";

export const MethodSkeleton = () => {
  return (
    <div className="-mx-1 min-w-0 overflow-hidden px-1 pb-1">
      <div className="flex w-max min-w-full gap-1.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex h-14 w-[13.5rem] shrink-0 items-center gap-2 rounded-md border bg-background px-2.5 sm:w-48"
          >
            <Skeleton className="size-9 shrink-0 rounded-md" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-1.5 h-3 w-20" />
            </div>

            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const MethodDetailsSkeleton = () => {
  return (
    <div>
      <SectionHeaderSkeleton />

      <div className="mt-2.5 overflow-hidden rounded-md border border-border/70 bg-muted/5">
        <div className="grid items-start justify-items-center gap-2 px-2.5 py-2 sm:grid-cols-[7.25rem_minmax(0,1fr)] sm:justify-items-stretch">
          <Skeleton className="aspect-square w-full max-w-[8rem] rounded-md sm:min-h-[7.25rem] sm:w-[7.25rem]" />

          <div className="grid min-h-[7.25rem] w-full min-w-0 rounded-md border border-border/70 bg-background px-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

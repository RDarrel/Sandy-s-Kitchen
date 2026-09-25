import { Skeleton } from "@/components/ui/skeleton";

const MethodSkeleton = () => {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="size-14 shrink-0 rounded-md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>

            <Skeleton className="size-7 shrink-0 rounded-md" />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="mt-3 border-t pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-full" />
              </div>

              <Skeleton className="h-3 w-24 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodSkeleton;

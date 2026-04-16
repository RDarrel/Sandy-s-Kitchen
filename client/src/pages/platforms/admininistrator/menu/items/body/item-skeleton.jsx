import { Skeleton } from "@/components/ui/skeleton";

const ItemSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
    <div className="relative h-52 overflow-hidden">
      <Skeleton className="h-full w-full rounded-none" />
      <div className="absolute left-4 top-4 flex gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="absolute right-3 top-3 flex items-start gap-1.5">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-[30px] w-[30px] rounded-full" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>

    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </div>
  </div>
);

export default ItemSkeleton;

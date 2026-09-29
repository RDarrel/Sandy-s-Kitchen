import { Skeleton } from "@/components/ui/skeleton";

const BookingHeaderSkeleton = () => {
  return (
    <div className="bg-background px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="size-7 shrink-0 rounded-md" />

        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-44 max-w-full" />
        </div>

        <Skeleton className="h-7 w-24 shrink-0 rounded-md" />
      </div>
    </div>
  );
};
export default BookingHeaderSkeleton;

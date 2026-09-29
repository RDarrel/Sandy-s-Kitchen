import { Skeleton } from "@/components/ui/skeleton";
import SectionHeaderSkeleton from "../details/skeleton/sectionHeader";

const PaymentSummarySkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="bg-background px-3 py-3 sm:px-4">
        <SectionHeaderSkeleton />
      </div>

      <div className="border-t bg-muted/5 px-3 py-3.5 sm:px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-3">
          <div className="min-w-0">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-2 h-7 w-36" />
          </div>

          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      <div className="border-t px-3 py-3 sm:px-4">
        <SummaryRowsSkeleton count={3} />
      </div>

      <div className="border-t bg-muted/5 px-3 py-3 sm:px-4">
        <SummaryRowsSkeleton count={2} />
      </div>

      <div className="border-t px-3 py-3.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-9 shrink-0 rounded-md" />

          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-1.5 h-3.5 w-24" />
          </div>

          <Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
        </div>
      </div>

      <div className="hidden border-t p-3 lg:block">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="mx-auto mt-2 h-3 w-56" />
      </div>
    </div>
  );
};

export default PaymentSummarySkeleton;

const SummaryRowsSkeleton = ({ count }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-6 items-center justify-between gap-3 py-1"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </>
  );
};

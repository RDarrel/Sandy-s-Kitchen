import { Skeleton } from "@/components/ui/skeleton";
import SectionHeaderSkeleton from "./sectionHeader";
import FormFieldSkeleton from "./field";

const PaymentFormSkeleton = () => {
  return (
    <div>
      <SectionHeaderSkeleton />

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>

      <div className="mt-2.5">
        <Skeleton className="mb-1 h-3 w-28" />

        <div className="flex h-14 items-center gap-2.5 rounded-md border border-dashed bg-muted/10 px-3">
          <Skeleton className="size-7 shrink-0 rounded-md" />

          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-40 max-w-full" />
            <Skeleton className="mt-1.5 h-3 w-24" />
          </div>

          <Skeleton className="h-3 w-12 shrink-0" />
        </div>
      </div>

      <div className="mt-2.5">
        <Skeleton className="mb-1 h-3 w-24" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      <div className="mt-3 border-t pt-3 lg:hidden">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="mx-auto mt-2 h-3 w-64 max-w-full" />
      </div>
    </div>
  );
};

export default PaymentFormSkeleton;

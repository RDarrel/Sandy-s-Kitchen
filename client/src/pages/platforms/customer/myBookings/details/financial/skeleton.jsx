import { SkeletonCard, SkeletonBlock } from "../skeletons";

export const PaymentSummarySkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex h-10 items-center justify-between border-b px-3">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="size-3.5" />
      </div>

      <div className="p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="mt-2 h-6 w-24" />
          </div>

          <SkeletonBlock className="h-3 w-20" />
        </div>

        <div className="my-3 border-t" />

        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item}>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3.5 w-28" />
                <SkeletonBlock className="h-3.5 w-16" />
              </div>

              <div className="ml-2 mt-1.5 space-y-1.5 pl-3">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-14" />
                </div>

                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-3.5 w-16" />
            </div>
          </div>

          <SkeletonBlock className="h-3 w-full" />
        </div>

        <SkeletonBlock className="mt-3 h-8 w-full rounded-md" />
      </div>
    </SkeletonCard>
  );
};

export const PaymentHistorySkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex h-10 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-6 rounded-full" />
        </div>

        <SkeletonBlock className="size-3.5 rounded-sm" />
      </div>

      <div className="p-3">
        <div className="space-y-0">
          {[1, 2, 3].map((item) => (
            <div key={item} className="relative ms-7 pb-4 last:pb-0">
              {item !== 3 && (
                <span className="absolute -left-5 top-5 h-[calc(100%-0.25rem)] w-px bg-border" />
              )}

              <SkeletonBlock className="absolute -left-[1.875rem] top-0 size-5 rounded-full" />

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <SkeletonBlock className="h-3.5 w-20" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>

                  <div className="mt-1.5 flex items-center gap-1">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="size-1 rounded-full" />
                    <SkeletonBlock className="h-3 w-14" />
                  </div>
                </div>

                <SkeletonBlock className="size-6 shrink-0 rounded-md" />
              </div>

              <SkeletonBlock className="mt-1 h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonCard>
  );
};

export const TermsSkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex h-10 items-center justify-between border-b px-3">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="size-3.5" />
      </div>

      <div className="space-y-2 p-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center justify-between gap-4">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

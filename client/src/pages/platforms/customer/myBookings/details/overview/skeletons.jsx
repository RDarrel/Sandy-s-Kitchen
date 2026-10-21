import {
  SkeletonBlock,
  SkeletonCard,
  SkeletonSectionHeader,
} from "../skeletons";

export const BookingOverviewSkeleton = () => {
  return (
    <SkeletonCard>
      <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonBlock className="h-12 w-14 rounded-md" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="h-5 w-16 rounded-md" />
            </div>

            <SkeletonBlock className="mt-2 h-3 w-52" />
          </div>
        </div>

        <SkeletonBlock className="h-9 w-28 rounded-md" />
      </div>

      <div className="flex flex-col gap-2 border-t bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SkeletonBlock className="size-4 shrink-0" />
          <SkeletonBlock className="h-4 w-full max-w-md" />
        </div>

        <SkeletonBlock className="h-7 w-28 rounded-md" />
      </div>
    </SkeletonCard>
  );
};

export const ScheduleSkeleton = () => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader />

      <div className="divide-y">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="grid gap-1.5 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)_76px] sm:items-center"
          >
            <div>
              <SkeletonBlock className="h-3 w-14" />
              <SkeletonBlock className="mt-1.5 h-3.5 w-36" />
            </div>

            <div className="flex gap-2">
              <SkeletonBlock className="h-3.5 w-20" />
              <SkeletonBlock className="h-3.5 w-32" />
            </div>

            <SkeletonBlock className="h-3.5 w-14 sm:ml-auto" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
};

export const ServiceDetailsSkeleton = ({ withMenus = false }) => {
  return (
    <SkeletonCard>
      <SkeletonSectionHeader withBadge />

      <div className="p-3">
        {withMenus ? (
          <div className="grid gap-x-7 gap-y-3 sm:grid-cols-2">
            {[1, 2].map((column) => (
              <div
                key={column}
                className="min-w-0 overflow-hidden rounded-md border bg-background"
              >
                <div className="flex items-center justify-between border-b bg-muted/30 px-2.5 py-1.5">
                  <SkeletonBlock className="h-3.5 w-20" />
                  <SkeletonBlock className="h-3 w-10" />
                </div>

                <div className="px-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 border-b py-1.5 last:border-b-0"
                    >
                      <SkeletonBlock className="size-3.5 shrink-0 rounded-full" />
                      <SkeletonBlock className="h-3.5 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className={withMenus ? "mt-3 border-t pt-3" : ""}>
          <div className="flex items-center justify-between gap-2">
            <SkeletonBlock className="h-3.5 w-24" />
            <SkeletonBlock className="h-3 w-10" />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonBlock key={item} className="h-6 w-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </SkeletonCard>
  );
};

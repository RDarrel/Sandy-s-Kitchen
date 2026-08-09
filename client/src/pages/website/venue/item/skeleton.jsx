import { Skeleton } from "@/components/ui/skeleton";

const VenueSkeleton = () => {
  return (
    <div className="min-h-[14.75rem]  grid grid-cols-1 sm:grid-cols-[1.4fr_3fr] border border-primary/22 shadow-sm border rounded-md relative ">
      <div>
        <Skeleton className={"h-[10rem] sm:h-full w-full rounded-none "} />
      </div>
      <div className="p-3 flex flex-col gap-2 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]  gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className={"h-6 w-4/5"} />
            <Skeleton className={"h-7 w-full"} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-[1fr_auto] gap-5">
            <div className="min-w-0 flex flex-col gap-2 ">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-5 ">
            <Skeleton className={"h-12 w-full"} />
            <Skeleton className={"h-12 w-full"} />
            <Skeleton className={"h-12 w-full col-span-2 md:col-span-1"} />
          </div>
          <hr />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, idx) => {
            const width = 100 - ((idx * 17) % 40);

            return (
              <Skeleton
                key={idx}
                className="h-4"
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
        <Skeleton className={"w-full h-8 mt-auto"} />
      </div>
    </div>
  );
};
export default VenueSkeleton;

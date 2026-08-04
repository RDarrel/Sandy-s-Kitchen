import { Skeleton } from "@/components/ui/skeleton";

const PackageSkeleton = () => {
  return (
    <div className="min-h-[14.75rem]  grid grid-cols-1 sm:grid-cols-[2fr_3fr] border border-primary/22 shadow-sm border rounded-md relative ">
      <div>
        <Skeleton className={"h-[10rem] sm:h-full w-full  "} />
      </div>
      <div className="p-3 flex flex-col gap-2 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(150px,20rem)_1fr] gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className={"h-6 w-40"} />
            <Skeleton className={"h-7 w-full"} />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-5">
            <div className="flex flex-col gap-2  ">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <Skeleton className="h-8 w-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 ">
          <hr />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-5 ">
            {new Array(4).fill("").map((_, idx) => (
              <div key={`package-skeleton-${idx}`}>
                <Skeleton className={"h-5 w-full"} />
              </div>
            ))}
          </div>
          <hr />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {new Array(6).fill("").map((_, idx) => {
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
export default PackageSkeleton;

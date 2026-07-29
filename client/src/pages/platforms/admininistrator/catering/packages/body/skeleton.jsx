import { Skeleton } from "@/components/ui/skeleton";

const PackageSkeleton = () => {
  return (
    <div className="h-[14.75rem] grid grid-cols-[22.5rem_1fr] border border-primary/22 shadow-sm border rounded-md relative overflow-hidden ">
      <div>
        <Skeleton className={"h-full w-full "} />
      </div>
      <div className="p-3 flex flex-col gap-2 min-w-0">
        <div className="grid grid-cols-[20rem_1fr] gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className={"h-6 w-40"} />
            <Skeleton className={"h-7 w-full"} />
          </div>
          <div className="grid grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-36" />
            </div>

            <Skeleton className="h-8 w-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 ">
          <hr />
          <div className="grid grid-cols-4 gap-5">
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

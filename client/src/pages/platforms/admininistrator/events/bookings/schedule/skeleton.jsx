import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const ScheduleSkeleton = ({ selectedDate }) => {
  return (
    <Card className="flex h-[660px] flex-col gap-0 overflow-hidden py-0 shadow-sm">
      <CardHeader className="gap-3 border-b px-3 !pb-0 pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">
              {format(selectedDate, "MMM d, yyyy")}
            </CardTitle>

            <CardDescription className="text-xs">
              Selected schedule
            </CardDescription>
          </div>

          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          <Skeleton className="h-6 w-11" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-hidden p-3">
        <div className="space-y-3">
          {new Array(3).fill("").map((_, groupIndex) => (
            <section key={groupIndex} className="space-y-2">
              <div className="flex items-center justify-between rounded-md bg-background/95 px-2 py-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>

                <Skeleton className="h-3 w-4" />
              </div>

              <div className="space-y-1.5">
                {new Array(groupIndex === 0 ? 2 : 1).fill("").map((_, index) => (
                  <div
                    key={index}
                    className="rounded-md border bg-background p-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                      </div>

                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>

                    <div className="mt-2 grid gap-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3.5 w-40" />
                      <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-3.5 w-28" />
                      </div>
                    </div>

                    <div className="mt-2 flex justify-end gap-1.5 border-t pt-2">
                      <Skeleton className="h-7 w-12" />
                      <Skeleton className="h-7 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleSkeleton;

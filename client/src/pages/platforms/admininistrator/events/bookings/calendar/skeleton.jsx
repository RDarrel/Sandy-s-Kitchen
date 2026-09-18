import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const bookedCells = new Set([2, 10, 17, 18, 20, 27, 33]);
const selectedCell = 17;

const getStatusRowCount = (index) => {
  if (!bookedCells.has(index)) return 0;
  if (index === selectedCell) return 3;
  if (index % 2 === 0) return 2;
  return 1;
};

const CalendarSkeleton = () => {
  return (
    <div className="h-[660px] w-full overflow-hidden">
      <div className="relative z-50 border-b bg-muted/10 px-2 pb-2 sm:px-3">
        <div className="flex min-w-0 flex-col items-stretch gap-2 py-2 sm:min-h-11 sm:flex-row sm:items-center sm:justify-between sm:py-0 xl:flex-nowrap xl:gap-3">
          <div className="flex min-h-8 min-w-0 flex-1 items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <div className="h-5 w-px shrink-0 bg-border" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 rounded-md border bg-background/70 px-2 py-1.5 sm:w-auto sm:gap-3 sm:border-0 sm:bg-transparent sm:p-0">
            {new Array(3).fill("").map((_, index) => (
              <div
                key={index}
                className="min-w-0 flex-1 space-y-1 text-center sm:min-w-20 sm:flex-none"
              >
                <Skeleton className="mx-auto h-2.5 w-12 sm:ml-auto sm:mr-0" />
                <Skeleton className="mx-auto h-4 w-16 sm:ml-auto sm:mr-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-8 min-w-0 flex-col gap-2 border-t border-border/50 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="size-3.5 rounded-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-8" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {new Array(4).fill("").map((_, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Skeleton className="size-1.5 rounded-full" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-t border-b">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="border-r px-2 py-1.5 text-center last:border-r-0"
          >
            <Skeleton className="mx-auto h-3.5 w-8" />
          </div>
        ))}
      </div>

      <div className="grid h-[calc(660px-116px)] grid-cols-7 grid-rows-5">
        {new Array(35).fill("").map((_, index) => {
          const isLastColumn = (index + 1) % 7 === 0;
          const isLastRow = index >= 28;

          return (
            <div
              key={index}
              className={`relative min-h-0 overflow-hidden ${
                isLastColumn ? "" : "border-r"
              } ${isLastRow ? "" : "border-b"} ${
                bookedCells.has(index) ? "bg-muted/20" : ""
              } ${index === selectedCell ? "bg-muted/35" : ""}`}
            >
              <div className="pointer-events-none absolute left-2 right-2 top-1.5 z-10 flex min-h-5 items-center justify-between gap-2">
                {bookedCells.has(index) ? (
                  <Skeleton className="h-3 w-16" />
                ) : (
                  <span />
                )}

                <Skeleton className="size-5 shrink-0 rounded-md" />
              </div>

              {bookedCells.has(index) ? (
                <div className="absolute inset-x-2 bottom-2 top-7 flex min-h-0 items-center">
                  <div className="w-full min-w-0 space-y-0.5">
                    {new Array(getStatusRowCount(index))
                      .fill("")
                      .map((_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex min-w-0 items-center gap-1.5 border-l-2 border-muted-foreground/25 pl-1.5"
                        >
                          <Skeleton
                            className={`h-3.5 ${
                              rowIndex === 0
                                ? "w-20"
                                : rowIndex === 1
                                  ? "w-16"
                                  : "w-14"
                            }`}
                          />
                          <Skeleton className="ml-auto h-3.5 w-3" />
                        </div>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSkeleton;

import { Skeleton } from "@/components/ui/skeleton";

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const totalCells = 42;
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-card">
      <div className="pointer-events-auto grid grid-cols-7 border-b bg-card">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="border-r px-2 py-1.5 text-center last:border-r-0"
          >
            <Skeleton className="mx-auto h-3.5 w-8" />
          </div>
        ))}
      </div>

      <div className="pointer-events-auto grid min-h-0 flex-1 grid-cols-7 grid-rows-6 bg-card">
        {new Array(totalCells).fill("").map((_, index) => {
          const isLastColumn = (index + 1) % 7 === 0;
          const isLastRow = index >= totalCells - 7;

          return (
            <div
              key={index}
              className={`relative min-h-0 overflow-hidden ${
                isLastColumn ? "" : "border-r"
              } ${isLastRow ? "" : "border-b"} bg-card ${
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

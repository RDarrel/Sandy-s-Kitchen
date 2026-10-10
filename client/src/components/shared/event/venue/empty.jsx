import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

const EmptyVenue = ({ onReset, hasFilters = true }) => {
  const canReset = hasFilters && typeof onReset === "function";

  return (
    <div className="flex min-h-[340px] w-full items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="flex items-start gap-3 border-b bg-muted/35 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <SearchX className="size-5" strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Availability
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {hasFilters
                ? "No venues available for your selection"
                : "No venues available yet"}
            </h3>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm leading-6 text-muted-foreground">
            {hasFilters
              ? "This usually happens when the date, guest count, budget, or event type narrows the available spaces too much."
              : "Once venues are ready for booking, they will show up here for customers to browse and reserve."}
          </p>

          {hasFilters && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border bg-card p-3">
                <CalendarDays className="size-4 text-primary" />
                <p className="mt-2 text-xs font-semibold text-foreground">
                  Try another date
                </p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <UsersRound className="size-4 text-primary" />
                <p className="mt-2 text-xs font-semibold text-foreground">
                  Adjust guests
                </p>
              </div>
              <div className="rounded-md border bg-card p-3">
                <SlidersHorizontal className="size-4 text-primary" />
                <p className="mt-2 text-xs font-semibold text-foreground">
                  Loosen filters
                </p>
              </div>
            </div>
          )}

          {canReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="mt-4 h-9 gap-2 rounded-full px-4 font-semibold"
            >
              <RotateCcw className="size-3.5" />
              Reset filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyVenue;

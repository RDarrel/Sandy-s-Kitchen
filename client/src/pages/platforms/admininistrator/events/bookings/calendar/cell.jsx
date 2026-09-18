import { STATUS_BORDERS, STATUS_LABELS, STATUS_ORDER } from "../constant";
import { format } from "date-fns";

const Cell = ({ day, segments, isToday, isOutside, selectedDay }) => {
  const bookings = [...segments.allDay, ...segments.timed]
    .map((segment) => segment.occurrence.event)
    .filter((event) => event.meta);

  const statusCounts = bookings.reduce((counts, event) => {
    const status = event.meta.status;

    counts[status] = (counts[status] || 0) + 1;

    return counts;
  }, {});

  const visibleStatuses = STATUS_ORDER.filter((status) => statusCounts[status]);

  const priorityStatus =
    visibleStatuses.find((status) => status === "pending") ||
    visibleStatuses.find((status) => status === "setup") ||
    visibleStatuses.find((status) => status === "approved") ||
    visibleStatuses[0];

  const displayStatuses = priorityStatus
    ? [
        priorityStatus,
        ...visibleStatuses.filter((status) => status !== priorityStatus),
      ]
    : [];

  const isSelected =
    format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");

  const hasBookings = bookings.length > 0;

  return (
    <div
      className={`relative h-full min-h-0 transition-colors ${
        hasBookings ? "bg-muted/20" : ""
      } ${isSelected ? "bg-muted/35 ring-1 ring-primary/25" : ""}`}
    >
      <div className="pointer-events-none absolute left-2 right-2 top-1.5 z-10 flex min-h-5 items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          {bookings.length > 0
            ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""}`
            : ""}
        </span>

        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[12px] font-medium ${
            isToday
              ? "bg-primary text-primary-foreground"
              : isOutside
                ? "text-muted-foreground"
                : "text-foreground"
          }`}
        >
          {format(day, "d")}
        </span>
      </div>

      {bookings.length > 0 && (
        <div className="absolute inset-x-2 bottom-2 top-7 flex min-h-0 items-center">
          <div className="w-full min-w-0 space-y-0.5">
            {displayStatuses.map((status) => (
              <div
                key={status}
                className={`flex min-w-0 items-center gap-1.5 border-l-2 pl-1.5 text-[11px] leading-4 ${STATUS_BORDERS[status]}`}
              >
                <span className="min-w-0 flex-1 truncate font-medium capitalize text-foreground">
                  {STATUS_LABELS[status]}
                </span>

                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {statusCounts[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cell;
